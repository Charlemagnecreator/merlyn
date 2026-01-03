# Merlyn — Tailwind SPA Demo

This repository contains a minimal single-page app (SPA) built with Tailwind CSS (via the CDN) and a dynamic QR code image.

Features
- Tailwind used via the Play CDN for quick setup (no build required)
- Hash-based client-side navigation (no router dependency)
- A QR code modal which generates a QR code for the current page URL (powered by https://api.qrserver.com)

Usage
1. Open `index.html` in your browser (double-click or serve with a simple static server).
2. Use the nav or buttons to change routes. Click "Show QR" to see a QR code for the current page URL.

Notes
- The QR code image is generated using a public API (requires internet access). If you want an offline/embedded QR, I can add a pre-generated image file or use a JS QR library.
- If you prefer a local Tailwind build (for custom config, purge, or production builds), I can scaffold npm and Tailwind CLI steps.

Let me know if you want: a local Tailwind build, an embedded QR image file, or additional pages/components.