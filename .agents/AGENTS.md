# UI and Styling Guidelines

- Whenever working on UI changes, fixing UI issues, or styling components, ALWAYS read the file `frontend\src\app\globals.css` (specifically `d:\GitHub\E-commercial\frontend\src\app\globals.css`) first to understand the existing design tokens, utility classes, and global styles before making any modifications.
- **Typography**: ALWAYS use `Be Vietnam Pro` (`font-sans`) as the primary sans-serif font to ensure perfect Vietnamese character rendering. Do not default back to Inter or Outfit for Vietnamese texts.
- **Icons**: ALWAYS use `lucide-react` for icons. DO NOT use emojis (e.g. 🚀, ✨). AVOID using AI/Tech specific icons (like `Sparkles`, `Bot`) unless it's strictly a technical feature. Use professional, business-contextual icons like `TrendingUp`, `ShieldCheck`, `Flame`, `Zap`.
- **Animations**: ALWAYS use `framer-motion` for entry, scroll, and micro-animations. Ensure animations feel "premium" (e.g. using `FadeIn` with staggered delays, smooth bezier curves) rather than flashy or abrupt.
- **Aesthetics**: Maximize the use of Glassmorphism (using the `@utility glass` class or `bg-background/50 backdrop-blur-md`), dark overlays for images, and subtle `drop-shadow` for text contrast. Ensure a modern, luxury fashion vibe (Luxury Vibe).
