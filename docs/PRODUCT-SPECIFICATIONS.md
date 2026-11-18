# Luke's World Library — Product Specifications
Version 0.1 | Feature set documented; authenticated workflows and deployment checks remain | 2026-11-18

## Product purpose
A global learning and knowledge platform combining exploration, historical context, knowledge mapping, guided learning, catalogue search, QR access, private collections, and learning records.

## Verified repository baseline (README)
- Next.js, React, TypeScript; Supabase Postgres and private storage with RLS.
- World Explorer, Time Machine, Knowledge Map, Teach Me, global catalogue search, QR, private collection, learning record.
- Remaining checks listed in README: authenticated save/progress, Vercel preview build, independent lint run, real email signup, and private vault.
- Preview is protected by team SSO; do not disable protection or publish without approval.
- External catalogue metadata and source links require rights/provenance review.

## Functional requirements
1. Search/browse records with citations, dates, categories, and provenance.
2. Distinguish facts, interpretations, hypotheses, and generated summaries.
3. Provide guided learning and user-controlled progress/collections.
4. Protect private collections and learning records with verified authentication/RLS.
5. Support accessible navigation, language expansion, and QR links without private-data leakage.
6. Provide source links and correction workflow.

## Data governance and security
Verify RLS on every user-owned table and storage bucket. Test cross-user denial and authenticated save/read/delete. Track source license, attribution, retrieval date, and permitted reuse. Do not copy restricted content into public catalogue. Keep secrets and private learning records out of source files.

## Acceptance criteria
Clean install, lint, tests, and protected preview build pass. Real signup/login and private vault work. RLS tests prove one user cannot access another's records. Source rights metadata is visible. Backup/restore and account deletion are tested.

## Accessibility baseline
Use WCAG 2.2 as the current W3C reference baseline for web content; test applicable criteria and report exceptions. A checklist or automated scan alone does not establish conformance. W3C identifies WCAG 2.2 as the latest WCAG 2 Recommendation and explains its testable success criteria: https://www.w3.org/TR/WCAG22/ and https://www.w3.org/WAI/standards-guidelines/wcag/ .

## Roadmap (proposed)
Editorial provenance dashboard; multilingual content QA; accessibility review; offline reading; exportable learning records; curator workflows.

## CUSTOMER-SPECIFIC REQUIREMENTS
| Field | Customer input |
|---|---|
| Customer / Organization | |
| Primary Contact | |
| Contact Information | |
| Business Requirements | |
| Requested Features | |
| Custom Integrations | |
| Branding / White-labeling | |
| User Roles and Permissions | |
| Security / Compliance Requirements | |
| Hosting / Deployment Requirements | |
| Budget / Contract Reference | |
| Delivery Schedule | |
| Acceptance Criteria | |
| Special Instructions | |
| Customer Approval / Sign-off | |

Keep customer learning records, contracts, and private collections in secured customer workspaces, not this public repository.

## Revision history
| Version | Date | Change | Approval |
|---|---|---|---|
| 0.1 | 2026-11-18 | Initial baseline; outstanding verification gates recorded | Pending |

## Global owner standards
Light-only UI; protect private data; no paid services/upgrades without approval; do not disable SSO protection or publish without approval.