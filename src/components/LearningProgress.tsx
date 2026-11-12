"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ModuleKey = "explore" | "time" | "map" | "learn";
type ProgressRow = {
  id: string;
  module_key: ModuleKey;
  item_key: string;
  status: "started" | "completed";
  score: number | null;
  last_activity_at: string;
};
type Props = {
  moduleKey: ModuleKey;
  itemKey: string;
  completed?: boolean;
  score?: number | null;
};

const MODULE_LABELS: Record<ModuleKey,string> = {
  explore: "World Explorer",
  time: "Time Machine",
  map: "Knowledge Map",
  learn: "Teach Me",
};

export default function LearningProgress({moduleKey,itemKey,completed=false,score=null}:Props) {
  const supabase = getSupabaseBrowserClient();
  const [userId,setUserId] = useState<string|null>(null);
  const [rows,setRows] = useState<ProgressRow[]>([]);
  const [message,setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let alive=true;
    async function load(id:string) {
      const {data,error}=await supabase.from("user_learning_progress")
        .select("id,module_key,item_key,status,score,last_activity_at")
        .eq("owner_id",id).order("last_activity_at",{ascending:false}).limit(100);
      if(!alive) return;
      if(error) setMessage("Progress storage is not ready: "+error.message);
      else setRows((data||[]) as ProgressRow[]);
    }
    supabase.auth.getSession().then(({data})=>{
      if(!alive) return;
      const id=data.session?.user.id??null;
      setUserId(id);
      if(id) void load(id);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      const id=session?.user.id??null;
      setUserId(id);
      if(id) void load(id); else setRows([]);
    });
    return ()=>{alive=false;subscription.unsubscribe();};
  },[supabase]);

  useEffect(()=>{
    if(!supabase||!userId||!itemKey) return;
    let cancelled=false;
    async function persist() {
      const {data:existing}=await supabase.from("user_learning_progress")
        .select("status").eq("owner_id",userId).eq("module_key",moduleKey).eq("item_key",itemKey).maybeSingle();
      if(cancelled) return;
      if(existing?.status==="completed"&&!completed) return;
      const now=new Date().toISOString();
      const payload={
        owner_id:userId,module_key:moduleKey,item_key:itemKey,
        status:completed?"completed":"started",
        score:score===null?undefined:score,
        completed_at:completed?now:undefined,
        last_activity_at:now,
      };
      const {error}=await supabase.from("user_learning_progress")
        .upsert(payload,{onConflict:"owner_id,module_key,item_key"});
      if(cancelled) return;
      if(error) setMessage("Could not save learning progress: "+error.message);
      else {
        setMessage("Learning progress saved to your account.");
        const {data}=await supabase.from("user_learning_progress")
          .select("id,module_key,item_key,status,score,last_activity_at")
          .eq("owner_id",userId).order("last_activity_at",{ascending:false}).limit(100);
        if(!cancelled) setRows((data||[]) as ProgressRow[]);
      }
    }
    void persist();
    return ()=>{cancelled=true;};
  },[supabase,userId,moduleKey,itemKey,completed,score]);

  const finished=rows.filter(row=>row.status==="completed").length;
  return <section className="learning-progress" aria-live="polite">
    <div className="progress-title"><div><label>YOUR LEARNING RECORD</label><h2>Keep your place.</h2><p>Your activity follows your account across devices.</p></div><strong>{finished} <small>COMPLETED</small></strong></div>
    {!userId?<p className="progress-empty">Sign in to your private collection to save learning progress between visits.</p>:
      rows.length===0?<p className="progress-empty">Your learning record starts as you explore the library.</p>:
      <div className="progress-list">{rows.slice(0,8).map(row=><div className="progress-row" key={row.id}><span>{MODULE_LABELS[row.module_key]}</span><b>{row.item_key.replace(/^(country|timeline|concept|quiz):/,"")}</b><small>{row.status==="completed"?"COMPLETED":"IN PROGRESS"}{row.score===null?"":" · "+row.score+"%"}</small></div>)}</div>}
    {message&&<p className="progress-message">{message}</p>}
  </section>;
}
