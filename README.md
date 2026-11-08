# LUKE'S WORLD LIBRARY

An independently owned, free-first knowledge and learning platform.

## Current application foundation

- **World Explorer:** initial country guides with historical context and related subjects.
- **Time Machine:** curated historical timeline with expandable context.
- **Knowledge Map:** selectable concepts and connected subjects.
- **Teach Me:** interactive quiz sessions with instant explanations.
- **Global Catalogue Search:** live metadata search against Open Library and the Library of Congress, with source status and original-record links.
- **QR Download Center:** separate downloadable SVG QR codes for the hosted library and the GitHub repository at `/qr`.

## Technology

- Next.js 15.5.28 (patched maintenance release), React 19.3.1, TypeScript
- Responsive interface and server-side catalogue API
- Supabase Postgres with RLS, user-owned records, and versioned migrations
- QR code generation through a server route

## Local development

1. Install Node.js 22 LTS.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add the Supabase project URL and publishable key if using Supabase client features.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

## Verification

- `npm run typecheck` — TypeScript validation.
- `npm run lint` — ESLint validation.
- `npm run build` — optimized production build.

## Database

The `supabase/migrations` directory contains the reproducible schema and security migrations. The database has seven library divisions and six public-schema tables. Row-level security is enabled on all six tables.

The public catalogue tables are read-only to API roles. User profiles, private library metadata, saved resources, and research notes require an authenticated role and owner-matching RLS policies. Never expose a Supabase secret or service-role key in browser code.

**Not yet complete:** Supabase Auth screens/session refresh, private Storage bucket and upload workflow, saved-resource and notes UI, and persisted learning progress. The database schema is ready for those features, but the private document vault is not yet usable in the app.

## Catalogue and content rights

The catalogue API returns third-party metadata and links to original records. It does not copy or claim rights to full-text works. Verify the rights and access terms on the source record before reuse.

Current Explorer, timeline, concept-map, and quiz content is starter content and should be expanded with source citations before being treated as research-grade.

## Infrastructure

- GitHub: https://github.com/Qwerkees/Luke-s-World-Library
- Supabase project ref: `oxaizbgsfuwnpnidloff`
- Vercel project: `lukes-world-library`
- QR downloads: `/api/qr?target=library` and `/api/qr?target=github`

The Vercel preview is protected by team SSO. The QR for the hosted library therefore opens a protected preview, not a public visitor site. Do not disable protection or publish a public release without explicit approval.

No paid services or upgrades are authorized by this repository configuration.
