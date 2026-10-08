<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Thriftly Frontend Rules

Apply these rules to all work under `frontend/` in addition to `.agents/AGENTS.md` and the generated Next.js rules above.

## Authentication and API safety

- Do not store access tokens, refresh tokens, session secrets, or sensitive user data in `localStorage`, `sessionStorage`, Redux persistence, or JavaScript-readable cookies.
- Use the backend's HttpOnly session cookie with credentialed same-origin/API requests. Obtain and send the CSRF token using the backend's documented cookie/header convention for unsafe methods.
- Restore the current user through the authenticated profile endpoint; do not treat decoded client state as authorization truth.
- Never expose server secrets through `NEXT_PUBLIC_*`. Public variables must be safe to ship in the browser bundle.
- Handle `401`, `403`, CSRF failure, session expiry, retry, and sign-out without infinite refresh loops.

## UI and styling

- Before UI or styling changes, read `frontend/src/app/globals.css` to understand design tokens, utilities, and global styles.
- Use `Be Vietnam Pro` (`font-sans`) as the primary sans-serif font for Vietnamese text. Do not fall back to Inter or Outfit.
- Use `lucide-react` for icons. Do not use emoji as UI icons. Avoid AI-themed icons unless the feature is specifically technical; prefer professional, contextual icons.
- Use `framer-motion` for entry, scroll, and micro-animations. Keep motion smooth, restrained, accessible, and premium.
- Preserve the modern luxury-fashion direction: existing glass utilities or `bg-background/50 backdrop-blur-md`, dark image overlays, and subtle text shadows where contrast requires them.
- Respect reduced-motion preferences, keyboard navigation, visible focus, semantic HTML, contrast, and responsive layouts.

## Verification

- Run the smallest relevant frontend tests, then the repository's lint and production build scripts.
- Report any missing test command instead of claiming frontend verification that did not run.
