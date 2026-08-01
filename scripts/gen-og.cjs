// Generates static OG/favicon assets by rasterizing an SVG with sharp.
// Run with: `node scripts/gen-og.cjs`
const sharp = require("sharp");
const { writeFileSync } = require("node:fs");

const ZMAIL_SVG = (w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow1" cx="15%" cy="10%" r="55%">
      <stop offset="0%" stop-color="#22C55E" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#22C55E" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="90%" cy="95%" r="50%">
      <stop offset="0%" stop-color="#A3E635" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#A3E635" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="logo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#A3E635"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#0F1115"/>
  <rect width="${w}" height="${h}" fill="url(#glow1)"/>
  <rect width="${w}" height="${h}" fill="url(#glow2)"/>
  <g transform="translate(64, ${h * 0.16})">
    <rect x="0" y="0" width="76" height="76" rx="20" fill="url(#logo)"/>
    <path d="M14 26C14 22.7 16.7 20 20 20H56C59.3 20 62 22.7 62 26V50C62 53.3 59.3 56 56 56H20C16.7 56 14 53.3 14 50V26Z" stroke="#04140A" stroke-width="3.5" fill="none"/>
    <path d="M16 27L38 42L60 27" stroke="#04140A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
  <text x="160" y="${h * 0.16 + 56}" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="44" font-weight="700" fill="#FFFFFF">Z<tspan fill="#22C55E">Mail</tspan></text>
  <text x="64" y="${h * 0.55}" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="${Math.round(w * 0.058)}" font-weight="700" fill="#FFFFFF">Disposable email, reimagined.</text>
  <text x="64" y="${h * 0.55 + 56}" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="30" fill="#9CA3AF">Instant, anonymous inboxes. No signup. No tracking.</text>
</svg>`;

async function main() {
  // OG image 1200x630
  await sharp(Buffer.from(ZMAIL_SVG(1200, 630)))
    .png()
    .toFile("public/og.png");
  console.log("wrote public/og.png");

  // Apple touch icon 180x180 (solid brand tile)
  const apple = `<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0F1115"/><stop offset="100%" stop-color="#161A22"/></linearGradient><linearGradient id="logo" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#22C55E"/><stop offset="100%" stop-color="#A3E635"/></linearGradient></defs>
    <rect width="180" height="180" rx="40" fill="url(#bg)"/>
    <rect x="52" y="56" width="76" height="76" rx="20" fill="url(#logo)"/>
    <path d="M66 76C66 72.7 68.7 70 72 70H108C111.3 70 114 72.7 114 76V100C114 103.3 111.3 106 108 106H72C68.7 106 66 103.3 66 100V76Z" stroke="#04140A" stroke-width="3.5" fill="none"/>
    <path d="M68 77L90 92L112 77" stroke="#04140A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;
  await sharp(Buffer.from(apple)).png().toFile("public/apple-icon.png");
  console.log("wrote public/apple-icon.png");

  // PWA icons
  const iconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="logo" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#22C55E"/><stop offset="100%" stop-color="#A3E635"/></linearGradient></defs>
    <rect width="512" height="512" rx="112" fill="#0F1115"/>
    <rect x="140" y="160" width="232" height="232" rx="56" fill="url(#logo)"/>
    <path d="M178 200C178 192 185 185 193 185H319C327 185 334 192 334 200V296C334 304 327 311 319 311H193C185 311 178 304 178 296V200Z" stroke="#04140A" stroke-width="10" fill="none"/>
    <path d="M184 204L256 249L328 204" stroke="#04140A" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;
  await sharp(Buffer.from(iconSvg)).resize(512, 512).png().toFile("public/icon-512.png");
  await sharp(Buffer.from(iconSvg)).resize(192, 192).png().toFile("public/icon-192.png");
  // favicon (multi-size ico via PNG fallback — browsers accept png named .ico)
  await sharp(Buffer.from(iconSvg)).resize(32, 32).png().toFile("public/favicon.ico");
  console.log("wrote public/icon-512.png, icon-192.png, favicon.ico");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
