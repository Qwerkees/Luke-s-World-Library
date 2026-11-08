# LUKE'S WORLD LIBRARY

An independently owned, free-first knowledge and learning platform.

## Interactive foundation (release 0.1)
- **World Explorer:** choose from an initial country set and explore introductory regional and historical context.
- **Time Machine:** navigate a curated historical timeline and open context cards.
- **Knowledge Map:** select concepts and follow related subject links.
- **Teach Me:** complete interactive quizzes with instant explanations and a session score.

## Technology
- Next.js 15, React 19, TypeScript
- Responsive CSS interface
- Supabase project reserved for authenticated private collections and progress persistence.

## Local development
1. Install Node.js 20.9 or later.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

## Verification and limitations
This is the initial interactive front-end milestone. Country cards, historical events, concept relationships, and quiz content are curated starter data, not a live scholarly database. They must be expanded with citations and verified sources before being treated as research-grade. Interactive learning state is currently browser-session state and is not yet persisted to a user account. Authentication and the private document vault are not exposed in this release.

## Infrastructure
- GitHub: `Qwerkees/Luke-s-World-Library`
- Supabase project ref: `oxaizbgsfuwnpnidloff`
- Vercel preview: pending verified deployment and protection settings.

Never commit service-role keys, passwords, or private credentials. Do not enable paid services without explicit approval.
