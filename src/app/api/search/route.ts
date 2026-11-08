export const revalidate = 3600;

type OpenLibraryDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  edition_count?: number;
};

type LibraryOfCongressItem = {
  title?: string;
  date?: string;
  description?: string | string[];
  url?: string;
};

type SearchResult = {
  source: string;
  title: string;
  detail: string;
  url: string;
};

function safeHttpsUrl(value: string | undefined, fallback: string) {
  try {
    const url = new URL(value || fallback, fallback);
    return url.protocol === "https:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().slice(0, 160);

  if (query.length < 2) {
    return Response.json(
      { query, results: [], message: "Enter at least two characters." },
      { status: 400 }
    );
  }

  const encodedQuery = encodeURIComponent(query);
  const [openLibrary, libraryOfCongress] = await Promise.allSettled([
    fetch(
      `https://openlibrary.org/search.json?q=${encodedQuery}&limit=8`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(9000) }
    ).then(async (response) => {
      if (!response.ok) throw new Error("Open Library request failed");
      return response.json() as Promise<{ docs?: OpenLibraryDoc[] }>;
    }),
    fetch(
      `https://www.loc.gov/search/?fo=json&c=8&q=${encodedQuery}`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(9000) }
    ).then(async (response) => {
      if (!response.ok) throw new Error("Library of Congress request failed");
      return response.json() as Promise<{ results?: LibraryOfCongressItem[] }>;
    }),
  ]);

  const results: SearchResult[] = [];

  if (openLibrary.status === "fulfilled") {
    for (const item of openLibrary.value.docs || []) {
      results.push({
        source: "Open Library",
        title: item.title || "Untitled record",
        detail: [
          item.author_name?.slice(0, 3).join(", "),
          item.first_publish_year ? String(item.first_publish_year) : "",
          item.edition_count ? `${item.edition_count} editions` : "",
        ].filter(Boolean).join(" · "),
        url: safeHttpsUrl(
          item.key ? `https://openlibrary.org${item.key}` : undefined,
          "https://openlibrary.org/"
        ),
      });
    }
  }

  if (libraryOfCongress.status === "fulfilled") {
    for (const item of libraryOfCongress.value.results || []) {
      const description = Array.isArray(item.description)
        ? item.description[0] || ""
        : item.description || item.date || "";
      results.push({
        source: "Library of Congress",
        title: item.title || "Untitled record",
        detail: description,
        url: safeHttpsUrl(item.url, "https://www.loc.gov/"),
      });
    }
  }

  const sources = {
    openLibrary: openLibrary.status === "fulfilled",
    libraryOfCongress: libraryOfCongress.status === "fulfilled",
  };

  if (!sources.openLibrary && !sources.libraryOfCongress) {
    return Response.json(
      {
        query,
        results: [],
        sources,
        message: "The connected catalogues could not be reached. Please try again.",
      },
      { status: 503 }
    );
  }

  return Response.json({
    query,
    results,
    sources,
    notice:
      "Catalogue metadata only. Open the original record to review full-text access and usage rights.",
  });
}
