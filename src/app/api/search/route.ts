export const revalidate = 3600;
type OpenLibraryDoc = { key?: string; title?: string; author_name?: string[]; first_publish_year?: number; edition_count?: number };
type LocItem = { id?: string; title?: string; date?: string; description?: string | string[]; url?: string };
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().slice(0, 160);
  if (q.length < 2) return Response.json({ query: q, results: [], message: "Enter at least two characters." }, { status: 400 });
  const [books, loc] = await Promise.allSettled([
    fetch("https://openlibrary.org/search.json?q=" + encodeURIComponent(q) + "&limit=8", { next: { revalidate: 3600 } }).then(r => { if (!r.ok) throw new Error("Open Library unavailable"); return r.json(); }),
    fetch("https://www.loc.gov/search/?fo=json&c=8&q=" + encodeURIComponent(q), { next: { revalidate: 3600 } }).then(r => { if (!r.ok) throw new Error("Library of Congress unavailable"); return r.json(); })
  ]);
  const results: Array<{ source: string; title: string; detail: string; url: string }> = [];
  if (books.status === "fulfilled") for (const d of (books.value.docs || []) as OpenLibraryDoc[]) results.push({ source: "Open Library", title: d.title || "Untitled", detail: [d.author_name?.slice(0, 3).join(", "), d.first_publish_year ? String(d.first_publish_year) : "", d.edition_count ? d.edition_count + " editions" : ""].filter(Boolean).join(" · "), "https://openlibrary.org" + (d.key || "") });
  if (loc.status === "fulfilled") for (const d of (loc.value.results || []) as LocItem[]) results.push({ source: "Library of Congress", title: d.title || "Untitled record", detail: Array.isArray(d.description) ? d.description[0] || "" : d.description || d.date || "", url: d.url || "https://www.loc.gov/" });
  return Response.json({ query: q, results, sources: { openLibrary: books.status === "fulfilled", libraryOfCongress: loc.status === "fulfilled" }, notice: "Search metadata only. Open the original record to review rights and full-text availability." });
}