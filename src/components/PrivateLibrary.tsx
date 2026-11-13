"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import SavedResources from "@/components/SavedResources";

type Item = {
  id: string; owner_id: string; title: string; item_type: string;
  storage_path: string | null; original_filename: string | null;
  mime_type: string | null; created_at: string;
};
type Note = { id: string; title: string; body: string; created_at: string };
const BUCKET = "lukes-private-library";
const MAX_BYTES = 25 * 1024 * 1024;
const TYPES = new Set([
  "application/pdf","image/jpeg","image/png","image/webp","text/plain","text/markdown",
  "text/csv","application/json","application/zip","application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export default function PrivateLibrary() {
  const supabase = getSupabaseBrowserClient();
  const [user,setUser] = useState<User|null>(null);
  const [ready,setReady] = useState(false);
  const [mode,setMode] = useState<"signin"|"signup">("signin");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [items,setItems] = useState<Item[]>([]);
  const [notes,setNotes] = useState<Note[]>([]);
  const [file,setFile] = useState<File|null>(null);
  const [title,setTitle] = useState("");
  const [body,setBody] = useState("");
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");

  const refresh = useCallback(async (owner:string) => {
    if (!supabase) return;
    const [a,b] = await Promise.all([
      supabase.from("private_library_items").select("*").eq("owner_id",owner).order("created_at",{ascending:false}),
      supabase.from("research_notes").select("*").eq("owner_id",owner).order("updated_at",{ascending:false}),
    ]);
    if (a.error) setError(a.error.message); else setItems((a.data||[]) as Item[]);
    if (b.error) setError(b.error.message); else setNotes((b.data||[]) as Note[]);
  },[supabase]);

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    let alive = true;
    supabase.auth.getSession().then(({data}) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
      if (data.session?.user) void refresh(data.session.user.id);
      setReady(true);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,session) => {
      setUser(session?.user ?? null);
      if (session?.user) void refresh(session.user.id);
      else { setItems([]); setNotes([]); }
    });
    return () => { alive = false; subscription.unsubscribe(); };
  },[supabase,refresh]);

  async function authenticate(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return;
    setBusy(true); setError(""); setMessage("");
    try {
      if (mode==="signup") {
        const {data,error:e1}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin}});
        if (e1) throw e1;
        setMessage(data.session ? "Your private account is ready." : "Check your email to confirm your account, then sign in.");
      } else {
        const {error:e1}=await supabase.auth.signInWithPassword({email:email.trim(),password});
        if (e1) throw e1;
        setMessage("Signed in. Loading your private collection.");
      }
    } catch(e) { setError(e instanceof Error ? e.message : "Authentication failed."); }
    finally { setBusy(false); }
  }

  async function upload(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase||!user||!file) return;
    setBusy(true); setError(""); let path:string|null=null;
    try {
      if (file.size>MAX_BYTES) throw new Error("Maximum file size is 25 MB.");
      if (!TYPES.has(file.type)) throw new Error("This file type is not supported.");
      const safe=file.name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,120);
      path=user.id+"/"+crypto.randomUUID()+"-"+safe;
      const {error:up}=await supabase.storage.from(BUCKET).upload(path,file,{contentType:file.type,upsert:false});
      if (up) throw up;
      const {error:db}=await supabase.from("private_library_items").insert({
        owner_id:user.id,title:file.name,description:"Private file",item_type:file.type.startsWith("image/")?"image":"document",
        storage_path:path,original_filename:file.name,mime_type:file.type,
      });
      if (db) throw db;
      setFile(null); const input=document.getElementById("private-upload") as HTMLInputElement|null; if(input) input.value="";
      setMessage("File saved to your private vault."); await refresh(user.id);
    } catch(e) {
      if(path) await supabase.storage.from(BUCKET).remove([path]);
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally { setBusy(false); }
  }

  async function openFile(item:Item) {
    if(!supabase||!item.storage_path) return;
    const {data,error:e}=await supabase.storage.from(BUCKET).createSignedUrl(item.storage_path,60);
    if(e) setError(e.message); else window.open(data.signedUrl,"_blank","noopener,noreferrer");
  }

  async function removeFile(item:Item) {
    if(!supabase||!user) return; setBusy(true);
    const {error:e}=await supabase.from("private_library_items").delete().eq("id",item.id).eq("owner_id",user.id);
    if(e) setError(e.message);
    else {
      if(item.storage_path) { const {error:se}=await supabase.storage.from(BUCKET).remove([item.storage_path]); if(se) setError("Record deleted; file cleanup needs attention: "+se.message); }
      await refresh(user.id);
    }
    setBusy(false);
  }

  async function saveNote(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); if(!supabase||!user||!title.trim()) return; setBusy(true); setError("");
    const {error:e1}=await supabase.from("research_notes").insert({owner_id:user.id,title:title.trim(),body:body.trim()});
    if(e1) setError(e1.message); else { setTitle(""); setBody(""); setMessage("Private research note saved."); await refresh(user.id); }
    setBusy(false);
  }

  async function removeNote(note:Note) {
    if(!supabase||!user) return; setBusy(true);
    const {error:e}=await supabase.from("research_notes").delete().eq("id",note.id).eq("owner_id",user.id);
    if(e) setError(e.message); else await refresh(user.id);
    setBusy(false);
  }

  return <section className="private-library" id="private-library">
    <div className="private-heading">
      <div><label>07 / YOUR PRIVATE COLLECTION</label><h2>Your work.<br/><em>Your own vault.</em></h2><p>Keep your documents, creative work, code, and research under your own account.</p></div>
      {user&&<button className="signout-button" onClick={()=>void supabase?.auth.signOut()}>SIGN OUT ↗</button>}
    </div>
    {!supabase ? <p className="vault-message">Private connection settings are missing.</p> :
      !ready ? <p className="vault-message">Checking your private session…</p> :
      !user ? <div className="vault-auth">
        <div className="auth-tabs"><button className={mode==="signin"?"selected":""} onClick={()=>setMode("signin")}>SIGN IN</button><button className={mode==="signup"?"selected":""} onClick={()=>setMode("signup")}>CREATE ACCOUNT</button></div>
        <form onSubmit={authenticate}>
          <label htmlFor="vault-email">EMAIL</label><input id="vault-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/>
          <label htmlFor="vault-password">PASSWORD</label><input id="vault-password" type="password" minLength={8} autoComplete={mode==="signup"?"new-password":"current-password"} required value={password} onChange={e=>setPassword(e.target.value)}/>
          <button className="vault-primary" disabled={busy}>{busy?"PLEASE WAIT…":mode==="signup"?"CREATE PRIVATE ACCOUNT ↗":"OPEN MY LIBRARY ↗"}</button>
        </form><p className="vault-hint">Use a unique password. Email confirmation may be required.</p>
      </div> : <div className="vault-workspace">
        <div className="vault-welcome"><span>SIGNED IN</span><b>{user.email}</b></div>
        <div className="vault-columns">
          <div className="vault-card"><h3>Private files</h3><p>PDFs, images, office documents, text, and archives. Maximum 25 MB per file.</p>
            <form className="upload-form" onSubmit={upload}><label htmlFor="private-upload">CHOOSE A FILE</label><input id="private-upload" type="file" onChange={e=>setFile(e.target.files?.[0]??null)}/>{file&&<small>{file.name} · {(file.size/1048576).toFixed(2)} MB</small>}<button className="vault-primary" disabled={busy||!file}>{busy?"UPLOADING…":"ADD TO PRIVATE VAULT ↗"}</button></form>
            <div className="vault-list">{items.length===0?<p>No files saved yet.</p>:items.map(item=><div className="vault-row" key={item.id}><div><b>{item.title}</b><small>{item.mime_type||item.item_type} · {new Date(item.created_at).toLocaleDateString()}</small></div><div className="vault-actions">{item.storage_path&&<button onClick={()=>void openFile(item)}>OPEN</button>}<button disabled={busy} onClick={()=>void removeFile(item)}>DELETE</button></div></div>)}</div>
          </div>
          <div className="vault-card"><h3>Research notebook</h3><p>Keep private ideas, source notes, plans, and discoveries.</p>
            <form className="note-form" onSubmit={saveNote}><label htmlFor="note-title">NOTE TITLE</label><input id="note-title" required maxLength={140} value={title} onChange={e=>setTitle(e.target.value)}/><label htmlFor="note-body">YOUR NOTES</label><textarea id="note-body" rows={5} maxLength={12000} value={body} onChange={e=>setBody(e.target.value)}/><button className="vault-primary" disabled={busy||!title.trim()}>SAVE PRIVATE NOTE ↗</button></form>
            <div className="vault-list">{notes.length===0?<p>No research notes yet.</p>:notes.map(note=><div className="vault-row" key={note.id}><div><b>{note.title}</b><small>{new Date(note.created_at).toLocaleDateString()}</small><p>{note.body}</p></div><button disabled={busy} onClick={()=>void removeNote(note)}>DELETE</button></div>)}</div>
          </div>
        </div>
        <SavedResources />
      </div>}
    {message&&<p className="vault-status" role="status">{message}</p>}{error&&<p className="vault-error" role="alert">{error}</p>}
    <p className="vault-security">Private storage bucket · Owner-only file policies · Owner-scoped database records · Signed file links expire after 60 seconds.</p>
  </section>;
}
