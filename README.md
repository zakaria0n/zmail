# 📧 ZMail

> A premium, **temporary email** web application — disposable inboxes, instantly.

ZMail generates an anonymous, disposable email address the moment you land. Copy
it, use it anywhere, and watch incoming mail arrive in real time. No signup, no
tracking, no spam in your real inbox.

Built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**,
**Framer Motion**, **React Query** and **Zustand** — powered by the public
[mail.tm](https://mail.tm) API.

---

## ✨ Features

- ⚡ **Instant inbox** — a fresh address is generated automatically on first visit
- 🔄 **Live auto-refresh** — new mail polls in every 10 seconds
- 🔔 **Unread badges** — always know what's new at a glance
- 📋 **One-click copy** — copy the address to your clipboard instantly
- 🆕 **Generate new email** — roll a brand-new inbox anytime
- 📖 **Rich message viewer** — sanitized HTML preview + plain-text toggle
- ⬇️ **Download** — export any message as `.html` or `.txt`
- 🗑️ **Delete** — remove individual messages
- ⌨️ **Keyboard shortcuts** — `R` refresh · `N` new mail · `/` focus address
- 📱 **Fully responsive** — beautiful on mobile with a slide-up message sheet
- 🎨 **Premium dark UI** — glassmorphism, gradients, glow & smooth animations
- 🔒 **Private by design** — receive-only; credentials stored only in your browser

---

## 🎨 Design

A deliberate, premium dark palette inspired by **Linear**, **Raycast**,
**Vercel** and **Arc Browser**.

| Token        | Value             |
| ------------ | ----------------- |
| Background   | `#0F1115`         |
| Primary      | `#22C55E` (green) |
| Secondary    | `#A3E635` (lime)  |
| Cards        | `#161A22`         |
| Borders      | `rgba(255,255,255,.08)` |
| Text         | `#FFFFFF`         |
| Muted        | `#9CA3AF`         |
| Accent glow  | `#22C55E33`       |

> Dark mode only. No blue, no purple.

---

## 🏗️ Tech Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Framework  | Next.js 15 (App Router, RSC)                 |
| Language   | TypeScript (strict)                          |
| Styling    | Tailwind CSS + shadcn/ui                     |
| Animation  | Framer Motion                                |
| Icons      | Lucide                                       |
| Server state| React Query (TanStack Query v5)            |
| Client state| Zustand                                    |
| API        | [mail.tm](https://api.mail.tm)               |
| Hosting    | Vercel                                       |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.18 (Node 20+ recommended)
- npm (or pnpm / yarn / bun)

### Install & run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — a temporary inbox is
generated automatically.

### Production build

```bash
npm run build
npm run start
```

### Lint & type-check

```bash
npm run lint
npm run typecheck
```

> No environment variables are required. ZMail talks directly to the public
> mail.tm REST API from the browser.

---

## 🧠 How it works

The full provisioning flow lives in `services/account.ts`:

1. **Fetch domains** — `GET /domains` returns usable inbox domains.
2. **Generate credentials** — a random username + strong password.
3. **Create account** — `POST /accounts` provisions the mailbox.
4. **Authenticate** — `POST /token` returns a JWT.
5. **Persist locally** — credentials are saved to `localStorage`.
6. **Load inbox** — `GET /messages`, polled every 10 seconds by React Query.

Generating a new email repeats the flow with a fresh username, replacing the
active inbox.

---

## ⌨️ Keyboard Shortcuts

| Key | Action                |
| --- | --------------------- |
| `R` | Refresh the inbox     |
| `N` | Generate a new email  |
| `/` | Focus the email address |

---

## 📁 Project Structure

```
zmail/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout, fonts, metadata
│   ├── page.tsx              # Home (hero + workspace + sections)
│   ├── globals.css           # Global styles + Tailwind layers
│   ├── loading.tsx           # Route loading state
│   ├── error.tsx             # Route error boundary
│   ├── not-found.tsx         # 404 page
│   ├── icon.svg              # Favicon
│   ├── manifest.ts           # PWA manifest
│   ├── opengraph-image.tsx   # Dynamic OG image (edge)
│   ├── twitter-image.tsx     # Twitter card image
│   ├── robots.ts             # robots.txt
│   └── sitemap.ts            # sitemap.xml
├── components/
│   ├── ui/                   # shadcn/ui primitives (button, card, toast…)
│   ├── hero/                 # Hero headline content
│   ├── inbox/                # Inbox list, items, empty/error/skeleton states
│   ├── message-viewer/       # Message detail, HTML frame, skeleton
│   ├── sections/             # Marketing sections (features, how-it-works, faq)
│   ├── animated-background.tsx
│   ├── email-card.tsx        # The "your temp email" card
│   ├── workspace.tsx         # Orchestrates inbox + viewer + provisioning
│   ├── mobile-message-sheet.tsx
│   ├── providers.tsx         # React Query + toast + tooltip providers
│   ├── header.tsx / footer.tsx / logo.tsx
├── hooks/                    # React Query hooks, copy, shortcuts, toast
├── lib/                      # cn() utility
├── services/                 # mail.tm client + account orchestration
├── store/                    # Zustand stores
├── types/                    # Shared TypeScript types
├── utils/                    # email, format, storage, html, download
└── config/                   # Site config (metadata, links, constants)
```

---

## 🔒 Security

Email HTML is rendered inside a **fully sandboxed `<iframe>`** (`sandbox=""`,
no `allow-same-origin`) as the primary XSS defence, and additionally run through
an allow-list sanitizer (`utils/html.ts`) as a second line. ZMail is
**receive-only** by design.

---

## 📦 Deployment

ZMail is optimized for **Vercel**.

```bash
# Install the Vercel CLI (once)
npm i -g vercel

# Deploy a preview
vercel

# Promote to production
vercel --prod
```

Or import the repository on [vercel.com](https://vercel.com/new) — no
configuration is needed; defaults work out of the box.

---

## 📄 License

Released under the [MIT License](./LICENSE).

---

<p align="center">
  Built with 💚 using Next.js &amp; mail.tm
</p>
