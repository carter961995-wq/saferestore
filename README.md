# SafeRestore

Minimal Vite + React + Tailwind app with a small Node/Express AI chat server.

## Setup
```bash
npm install
```

## Development
```bash
npm run dev
```

## Build
```bash
npm run build
```

## Preview (client only)
```bash
npm run preview
```

## Environment
Create a `.env` file from `.env.example`:
```
OPENAI_API_KEY=your_key_here
```

## Deploy
Vercel:
- Build: `npm run build`
- Output: `dist`
- SPA rewrites are handled via `vercel.json`

Netlify:
- Build: `npm run build`
- Publish: `dist`
- SPA redirects are handled via `public/_redirects`

GitHub Pages:
- Set Vite `base` to your repo name in `vite.config.js` if needed
- Build: `npm run build`
- Publish the `dist` folder
