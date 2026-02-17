## What was fixed

This PR fixes route rendering so `/trust`, `/terms`, `/privacy`, and `/forensic` each render dedicated page content instead of falling back to homepage-like output.

## Key changes

- Confirmed routing stack is **React Router** (`react-router-dom`) in `src/App.jsx`.
- Added dedicated forensic page:
  - `src/pages/ForensicPage.jsx`
  - Route: `/forensic`
- Rewrote trust page for forensic/legal buyers:
  - `src/pages/TrustCenter.jsx`
- Rewrote concise protective terms page:
  - `src/pages/TermsOfService.jsx`
- Ensured privacy route remains dedicated and uniquely titled:
  - `src/pages/PrivacyPolicy.jsx`
- Updated route metadata + canonical handling in:
  - `src/App.jsx`
- Updated nav/footer links to point to explicit legal/forensic routes:
  - `src/components/Layout.jsx`
- Updated indexing assets:
  - `public/sitemap.xml`
  - `public/robots.txt`

## Verification

- Production build succeeds (`npm run build`).
- Route table explicitly maps:
  - `/trust` -> `TrustCenter`
  - `/terms` -> `TermsOfService`
  - `/privacy` -> `PrivacyPolicy`
  - `/forensic` -> `ForensicPage`
- Built bundle includes unique heading/content strings for all four pages.
