"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SearchResult = {
  source: string;
  title: string;
  detail: string;
  url: string;
};

type SearchResponse = {
  query: string;
  results: SearchResult[];
  sources?: { openLibrary: boolean; libraryOfCongress: boolean };
  notice?: string;
  message?: string;
};

export default function LibrarySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [sources, setSources] = useState<SearchResponse["sources"]>();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [collection,setCollection] = useState("Saved");
  const [saving,setSaving] = useState<string|null>(null);
  const [saved,setSaved] = useState<string[]>([]);
  const [saveMessage,setSaveMessage] = useState("");
  const supabase = getSupabaseBrowserClient();

  async function saveResult(result:SearchResult) {
    if(!supabase) { setSaveMessage("Private account connection is not configured."); return; }
    const {data:{session}}=await supabase.auth.getSession();
    if(!session?.user) { setSaveMessage("Sign in to your private collection first."); return; }
    const key=result.source+"|"+result.url;
    setSaving(key); setSaveMessage("");
    const {error}=await supabase.from("saved_external_resources").upsert({
      owner_id:session.user.id,source:result.source,title:result.title,
      description:result.detail||"",source_url:result.url,collection_name:collection.trim()||"Saved"
    },{onConflict:"owner_id,source_url,collection_name",ignoreDuplicates:true});
    if(error) setSaveMessage("Could not save this record: "+error.message);
    else { setSaved(current=>current.includes(key)?current:[...current,key]); setSaveMessage("Saved to your private collection."); }
    setSaving(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2) {
      setError("Enter at least two characters to search.");
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");
    setResults([]);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(cleanQuery)}`);
      const data = (await response.json()) as SearchResponse;
      setSources(data.sources);
      if (!response.ok) throw new Error(data.message || "Search could not be completed.");
      setResults(data.results);
      setNotice(data.notice || "");
      if (data.results.length === 0) setError("No matching records were found in the connected catalogues.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Search could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="library-search" aria-labelledby="library-search-title">
      <div className="search-heading">
        <div>
          <label>THE GLOBAL CATALOGUE</label>
          <h2 id="library-search-title">Search beyond the shelves.</h2>
          <p>Explore book and archival metadata from Open Library and the Library of Congress.</p>
        </div>
        <span className="search-mark">02 / DISCOVER</span>
      </div>
      <div className="collection-picker"><label htmlFor="save-collection">SAVE RESULTS INTO</label><input id="save-collection" value={collection} maxLength={80} onChange={event=>setCollection(event.target.value)} placeholder="Collection name (e.g. History, AI research)"/></div>
      <form className="search-form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="library-query">Search books, people, subjects, or topics</label>
        <input
          id="library-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try a person, place, invention, or subject..."
          maxLength={160}
        />
        <button type="submit" disabled={loading}>{loading ? "SEARCHING…" : "SEARCH CATALOGUES ↗"}</button>
      </form>
      {sources && (
        <div className="source-status" aria-label="Catalogue connection status">
          <span className={sources.openLibrary ? "source-online" : "source-offline"}>Open Library {sources.openLibrary ? "connected" : "unavailable"}</span>
          <span className={sources.libraryOfCongress ? "source-online" : "source-offline"}>Library of Congress {sources.libraryOfCongress ? "connected" : "unavailable"}</span>
        </div>
      )}
      {error && <p className="search-message" role="status">{error}</p>}
      {results.length > 0 && (
        <div className="search-results" aria-live="polite">
          <div className="results-count">{results.length} CATALOGUE RECORDS</div>
          {results.map((result, index) => (
            <article className="search-result" key={`${result.source}-${result.url}-${index}`}>
              <div>
                <small>{result.source}</small>
                <h3>{result.title}</h3>
                {result.detail && <p>{result.detail}</p>}
              </div>
              <div className="search-result-actions"><a href={result.url} target="_blank" rel="noopener noreferrer">OPEN RECORD ↗</a><button type="button" disabled={saving===result.source+"|"+result.url||saved.includes(result.source+"|"+result.url)} onClick={()=>void saveResult(result)}>{saved.includes(result.source+"|"+result.url)?"SAVED":saving===result.source+"|"+result.url?"SAVING…":"SAVE TO LIBRARY +"}</button></div>
            </article>
          ))}
        </div>
      )}
      {saveMessage && <p className="search-notice" role="status">{saveMessage}</p>}
      {notice && <p className="search-notice">{notice}</p>}
    </section>
  );
}
