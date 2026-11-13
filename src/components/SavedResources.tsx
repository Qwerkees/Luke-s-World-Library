"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SavedItem = {
  id:string; source:string; title:string; description:string;
  source_url:string; collection_name:string; created_at:string;
};

export default function SavedResources() {
  const supabase=getSupabaseBrowserClient();
  const [userId,setUserId]=useState<string|null>(null);
  const [items,setItems]=useState<SavedItem[]>([]);
  const [filter,setFilter]=useState("All collections");
  const [error,setError]=useState("");

  const refresh=useCallback(async(id:string)=>{
    if(!supabase) return;
    const {data,error:e}=await supabase.from("saved_external_resources").select("*")
      .eq("owner_id",id).order("created_at",{ascending:false});
    if(e) setError(e.message); else setItems((data||[]) as SavedItem[]);
  },[supabase]);

  useEffect(()=>{
    if(!supabase) return;
    let alive=true;
    supabase.auth.getSession().then(({data})=>{
      if(!alive) return;
      const id=data.session?.user.id??null;
      setUserId(id);
      if(id) void refresh(id);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      const id=session?.user.id??null;setUserId(id);
      if(id) void refresh(id); else setItems([]);
    });
    return ()=>{alive=false;subscription.unsubscribe();};
  },[supabase,refresh]);

  async function remove(item:SavedItem) {
    if(!supabase||!userId) return;
    const {error:e}=await supabase.from("saved_external_resources").delete()
      .eq("id",item.id).eq("owner_id",userId);
    if(e) setError(e.message); else {setError("");await refresh(userId);}
  }

  const collections=["All collections",...Array.from(new Set(items.map(item=>item.collection_name))).sort()];
  const visible=filter==="All collections"?items:items.filter(item=>item.collection_name===filter);
  return <section className="saved-collections">
    <div className="saved-heading"><div><label>YOUR RESEARCH SHELF</label><h3>Saved catalogue records</h3><p>Keep source links together in named collections. Original records remain with their publishers.</p></div><strong>{items.length} <small>SAVED</small></strong></div>
    {!userId?<p>Sign in to view your saved records.</p>:items.length===0?<p>No catalogue records saved yet. Search above and use “Save to Library”.</p>:
      <>
        <label className="saved-filter-label" htmlFor="saved-filter">COLLECTION</label>
        <select id="saved-filter" value={filter} onChange={e=>setFilter(e.target.value)}>{collections.map(name=><option key={name}>{name}</option>)}</select>
        <div className="saved-items">{visible.map(item=><article className="saved-item" key={item.id}>
          <div><small>{item.source} · {item.collection_name}</small><h4>{item.title}</h4>{item.description&&<p>{item.description}</p>}<a href={item.source_url} target="_blank" rel="noopener noreferrer">OPEN ORIGINAL RECORD ↗</a></div>
          <button type="button" onClick={()=>void remove(item)}>REMOVE</button>
        </article>)}</div>
      </>}
    {error&&<p className="saved-error" role="alert">{error}</p>}
  </section>;
}
