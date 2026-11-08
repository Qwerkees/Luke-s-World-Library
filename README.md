# LUKE'S WORLD LIBRARY

An independently owned, free-first knowledge and learning platform.

## Current application foundation

- **World Explorer:** initial country guides with historical context and related subjects.
- **Time Machine:** curated historical timeline with expandable context.
- **Knowledge Map:** selectable concepts and connected subjects.
- **Teach Me:** interactive quiz sessions with instant explanations.
- **Global Catalogue Search:** live metadata search against Open Library and the Library of Congress, with source status and original-record links.
- **QR Download Center:** separate downloadable SVG QR codes for the hosted library and GitHub repository at `/qr`.
- **Private Collection:** Supabase email/password authentication, owner-scoped private file uploads, signed downloads, deletion, and a private research notebook.

## Technology

- Next.js 15.5.29, React 19.3.1, TypeScript
- Responsive interface and server-side catalogue API
- Supabase Postgres and private Storage with row-level security and owner-scoped policies
- QR code generation through a server route

## Local development

1. Install Node.js 22 LTS.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add the Supabase project URL and publishable key.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

## Verification

- `npm run typecheck` — TypeScript validation.
- `npm run lint` — ESLint validation.
- `npm run build` — optimized production build.

## Database and private storage

The `supabase/migrations` directory contains the reproducible schema, access-hardening, and storage migrations. The database has seven library divisions and six public-schema tables. Row-level security is enabled on all six tables.

Public catalogue data is read-only to API roles. User profiles, private item metadata, saved resources, and research notes require authentication and owner-matching policies. The `lukes-private-library` Storage bucket is private, limits files to 25 MB, and restricts object paths to the authenticated user's ID.

Never expose a Supabase secret or service-role key in browser code. The application uses only the publishable key.

**Remaining work:** saved-resource UI, persisted learning progress, and a full independent local/CI lint run. Email confirmation and redirect behavior depend on Supabase Auth settings. The private vault UI is implemented, but first account creation should be tested with a real email address.

## Catalogue and content rights

The catalogue API returns third-party metadata and links to original records. It does not copy or claim rights to full-text works. Verify the rights and access terms on the source record before reuse.

Explorer, timeline, concept-map, and quiz content is starter material and should be expanded with source citations before being treated as research-grade.

## Infrastructure

- GitHub: https://github.com/Qwerkees/Luke-s-World-Library
- Supabase project ref: `oxaizbgsfuwnpnidloff`
- Vercel project: `lukes-world-library`
- QR downloads: `/api/qr?target=library` and `/api/qr?target=github`

The Vercel preview is protected by team SSO. The library QR therefore opens a protected preview, not a public visitor site. Do not disable protection or publish a public release without explicit approval.

No paid services or upgrades are authorized by this repository configuration.
