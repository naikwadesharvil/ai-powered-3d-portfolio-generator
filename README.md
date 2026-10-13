# AI-Powered 3D Portfolio Generator

> A production-grade, extensible, AI-powered 3D personal portfolio and resume generation platform. Faithful to the iconic tutorial-inspired 3D visual aesthetic while providing an intelligent AI Studio with genuine OpenAI backend integration, accredited deterministic offline fallback, multi-discipline engineering presets, a real-time split customizer, SQLite-backed publishing, per-portfolio privacy controls, daily AI cost caps, and professional ATS resume exports (PDF, DOCX, Plaintext, Markdown).

---

## 🌟 Core Highlights & Architecture

### 1. Multi-Discipline & Persona-Aware AI Generation
- **Target Personas**:
  - **Student**: Prioritizes academic coursework, degree progression, student clubs, and exploratory projects.
  - **Job Seeker**: Highlights ATS-tailored career objective, core competencies, verified employment history, and key metrics.
  - **Working Professional**: Emphasizes leadership achievements, system architectures, enterprise-scale impact, and publications.
  - **Freelancer**: Surfaces client service packages, hourly/project pricing models, client testimonials, and booking CTAs.
- **Engineering & Creative Disciplines**:
  - Full first-class presets for **Computer Science / Software**, **AIML / Data Science**, **Mechanical Engineering**, **Mechatronics & Robotics**, **Electrical & Electronics**, **Civil Engineering**, and **Custom Disciplines** (e.g. *Marine Engineering*, *Biomedical*).
  - Discipline-tailored skills, Bento stats, industry tooling, and project taxonomies.

### 2. Live Split-Screen Customizer (`src/components/SplitCustomizer.tsx`)
- **Instant Dual-Pane Studio**: Side-by-side rich form editor on the left and live responsive portfolio preview on the right.
- **Ultra-Fast Sub-10ms Reactivity**: Instant re-renders as fields are edited, measured via `requestAnimationFrame`, with debounced `localStorage` autosave drafts.
- **Drag-and-Drop Section Reordering**: Powered by `@dnd-kit/sortable` for intuitive section sequence customization.
- **Theme Token Customizer**: Granular control over accent colors, background palettes, glass card opacities, and typography variables with live CSS variable injection.
- **Responsive Viewport Controls**: 1-click toggling between **Desktop (1280px)**, **Tablet (768px)**, and **Mobile (360px)** viewports with dedicated tab navigation on mobile.

### 3. Professional Resume Studio & ATS Export
- **Pixel-Perfect PDF Generation**: Clean typography, crisp contact bar, structured section rules, and page-break orphan protection.
- **Native Microsoft Word Export (`.docx`)**: Valid OpenXML document format (ISO/IEC 29500-1) with standard heading hierarchies, bullet structures, and clickable hyperlinks.
- **Plaintext & Markdown ATS Exports**: Guaranteed parseable by modern applicant tracking systems.
- **Anti-Hallucination Fact Verification**: Enforces separation of user-verified facts from AI suggestions, flagging generated ideas explicitly with `isAiIdea: true`.

### 4. Hardened Backend Architecture (`server/`)
- **OpenAI Model Integration**: Connects via official OpenAI SDK using structured schemas (`gpt-4o`, `gpt-4o-mini`).
- **Backend Key Isolation**: `OPENAI_API_KEY` is strictly confined to the backend server and never sent to frontend bundles or client state.
- **Deterministic Offline Fallback**: Dual-engine design seamlessly serves accredited, fact-preserving content when an API key is unconfigured, rate-limited, or quota-capped, surfacing clear non-alarming status disclosures (`source: "ai" | "fallback"`).
- **Security & Protection Layer**:
  - Helmet security headers with restrictive CSP policies
  - Generic IP rate limiting (200 requests per 15 min)
  - Daily per-IP and global cost caps on OpenAI endpoints (`OPENAI_DAILY_CAP_IP` and `OPENAI_DAILY_CAP_GLOBAL`) with clean offline fallbacks and secret-free logging
  - Strict CORS origin filtering
  - Zod schema validation with field-level client/server error mapping
  - Payload size limits and prompt injection guards

### 5. Persistent SQLite Publishing & Privacy Controls
- **SQLite Storage Engine**: Persistent portfolio storage behind an `IPortfolioStorage` interface (`SqlitePortfolioStorage`), keeping published portfolios safely preserved across server lifecycles.
- **Automatic Migration**: Automatically scans and migrates legacy JSON files into SQLite on startup.
- **Timing-Safe Cryptography**: Owner edit/delete tokens are hashed with SHA-256 and verified using `crypto.timingSafeEqual()` to eliminate timing attacks.
- **Per-Portfolio Privacy Toggles**:
  - **Hide phone**: Removes phone number from the public published view and public API responses while preserving the interactive 3D contact visual.
  - **Hide email**: Removes email address from the public view and public API responses.
  - **Don't index this page**: Injects `<meta name="robots" content="noindex, nofollow" />` into the HTML head so search engine crawlers do not index the portfolio.
- **Pre-Publish Transparency Notice**: Displays an explicit disclosure before publishing that anyone with the vanity URL can view the portfolio.

### 6. Signature Tutorial-Inspired 3D Visual Experience
- **Hardware-Accelerated 60 FPS Canvas Engine**: Interactive 360° rotating portrait with kinetic drag physics, inertia, and headlight vignette blending.
- **Dual-Tone Cinematic Lighting**: Cyan key light (`#00f2fe`) and magenta fill light (`#ff0055`).
- **Live Telemetry HUD**: System session status, real-time clock, geographic telemetry, engine readout, and FPS counter.
- **Signature 3D Elements**:
  - Welcome transition laptop prop (`#welcome`)
  - Asymmetrical 5:7 Bento grid (`#about`)
  - Signature 3D vintage telephone with interactive scrubber visual and atmospheric particles (`#projects` / `#contact`)
  - Contact communication terminal (`#contact`)

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript 5, Vite 8, Zustand 5, `@dnd-kit`, Lucide React, Canvas Confetti |
| **Backend API** | Node.js, Express 4, TypeScript (`tsx`), SQLite (`sqlite3`), OpenAI SDK, Zod, Helmet, Express Rate Limit, Dotenv |
| **Styling** | Vanilla CSS Design Tokens, Glassmorphism (`backdrop-filter`), CSS Grid & Flexbox, Space Grotesk & Syne Fonts |
| **Export & Packaging** | JSZip, FileSaver, Standalone HTML5 Bundle, Headless PDF & OpenXML DOCX Engines |

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check returning uptime, engine mode, model, and key status |
| `POST` | `/api/ai/generate-portfolio` | Synthesizes role- and discipline-tailored portfolio with source disclosure |
| `POST` | `/api/ai/rewrite-section` | Rewrites targeted section in chosen tone (`professional`, `creative`, `technical`, etc.) |
| `POST` | `/api/ai/recommendations` | Evaluates completeness and suggests role-specific section ordering & visibility |
| `POST` | `/api/ai/chat` | Conversational Co-Pilot for natural-language portfolio modifications |
| `POST` | `/api/portfolios/publish` | Publishes a portfolio under a vanity slug and returns a secret owner token |
| `GET` | `/api/portfolios/:slug` | Public read endpoint for published portfolio (respects privacy scrubbing) |
| `PUT` | `/api/portfolios/:slug` | Updates an existing published portfolio (requires `x-owner-token` header) |
| `DELETE` | `/api/portfolios/:slug` | Deletes a published portfolio (requires `x-owner-token` header) |

---

## 🚀 Getting Started & Setup

### Prerequisites
- Node.js `v20+` or `v22+` / `v24+`
- npm `v10+` or `v11+`

### 1. Installation
Clone the repository and install all dependencies:
```bash
git clone <repository-url>
cd "AI-POWERED 3D PORTFOLIO GENERATOR"
npm install
```

### 2. Configure Environment Variables
Copy the root `.env.example` to `.env` (or `server/.env.example` to `server/.env`):
```bash
cp .env.example .env
```

Open `.env` and set your desired configuration values:
```env
# Server Port & Mode
PORT=5000
NODE_ENV=development

# Frontend Dev Proxy Origin
CLIENT_ORIGIN=http://localhost:5173

# Frontend Production Build Directory (Relative to server or absolute path)
DIST_PATH=../dist

# OpenAI API Key (Backend Only - Never exposed to client)
# Leave empty or set to test key; offline fallback seamlessly engages if omitted
OPENAI_API_KEY=

# OpenAI Model
OPENAI_MODEL=gpt-4o-mini

# General API Rate Limiting (per IP)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200

# Daily OpenAI Endpoint Quotas (UTC day reset)
OPENAI_DAILY_CAP_GLOBAL=100
OPENAI_DAILY_CAP_IP=20

# SQLite Database Storage File
PORTFOLIO_DB_PATH=./server/data/portfolios.sqlite
```

> **Security Note:** `.env` and `server/.env` are strictly excluded in `.gitignore`. The frontend communicates with the backend via Vite's proxy (`/api`) in dev or directly through Express in production, ensuring keys are never bundled into client assets.

### 3. Development Mode
To develop with live frontend hot-module replacement and backend tsx reload, open two terminals:

**Terminal 1 — Backend API Server:**
```bash
npm run dev:server
# Server runs on http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

Visit [http://localhost:5173/](http://localhost:5173/) in your browser.

### 4. Unified Production Mode (Single Process)
In production, Express serves the compiled static assets from `dist/`, the `/api` backend routes, and an SPA fallback route so direct links and refreshes on `/p/:slug` work seamlessly:
```bash
# 1. Compile client production bundle
npm run build

# 2. Launch single production process
npm run start
# Server runs on http://localhost:5000 (or $PORT)
```
Open [http://localhost:5000/](http://localhost:5000/) to access the application.

---

## 📜 Available NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Starts Vite client dev server on port `5173` |
| `npm run dev:server` | `tsx watch server/index.ts` | Starts backend Express API server with hot reloading |
| `npm run build` | `tsc -b && vite build` | Type-checks and creates optimized client assets in `dist/` |
| `npm run preview` | `vite preview` | Previews the compiled `dist/` bundle locally |
| `npm run start` | `tsx server/index.ts` | Starts the single unified Express production server |
| `npm run verify` | `node test_verification.mjs` | Master self-contained verification runner (starts & stops processes automatically) |
| `npm run test:all` | `node test_verification.mjs ...` | Runs the full verification suite across all sub-suites |
| `npm run test:server` | `node test_server_ai.mjs` | Runs backend OpenAI and fallback API test suite |
| `npm run test:resume` | `node test_resume_export.mjs` | Runs ATS resume export validation suite (PDF, DOCX, TXT, MD) |
| `npm run test:phase3` | `node test_phase3_split_customizer.mjs` | Runs Split Customizer sub-100ms reactivity and viewport tests |
| `npm run test:studio-regression` | `node test_studio_regression.mjs` | End-to-end Studio regression test (creation, 3D stage, editing, publish) |
| `npm run lint` | `eslint .` | Runs ESLint syntax and code quality checks |

---

## 🧪 Testing & Validation Suites

The application includes an extensive regression and verification suite:

1. **Master Verification Runner (`test_verification.mjs`)**:
   - 42 assertions covering all 4 personas (Student, Job Seeker, Professional, Freelancer), 7 engineering disciplines, custom disciplines, heuristic validation, and XSS sanitization.
   - Automatically checks if backend and preview servers are active; launches and tears them down safely if needed.
2. **Server AI & Hardening Suite (`test_server_ai.mjs`)**:
   - 51 assertions verifying OpenAI synthesis, dual-engine fallback disclosures, tone rewrites, recommendations, rate limiting, and prompt injection defense.
3. **Resume Export Suite (`test_resume_export.mjs` & `test_resume_edge_cases_and_inspect.mjs`)**:
   - Verifies PDF binary structure, OpenXML DOCX archive hierarchy (`word/document.xml`, `[Content_Types].xml`), plaintext parsing, markdown layout, page breaks, and orphan prevention.
4. **Split Customizer Performance Suite (`test_phase3_split_customizer.mjs`)**:
   - Runs headless browser checks validating sub-100ms keystroke-to-paint updates measured via `requestAnimationFrame`, CSS variable injection, section reordering, and responsive viewports.
5. **Publishing & Storage Suite (`test_publishing_and_security.mjs`)**:
   - Tests SQLite persistence, slug collision handling, timing-safe SHA-256 owner secret verification, JSON migration, and unauthorized mutation rejection.
6. **Privacy & Cost Suite (`scratch/test_7c_privacy_and_cost.mjs`)**:
   - Tests per-portfolio privacy toggles (`hidePhone`, `hideEmail`, `noIndex`), pre-publish warning notices, daily per-IP and global caps, offline fallbacks, and public API data redaction.
7. **Studio Regression Suite (`test_studio_regression.mjs`)**:
   - End-to-end browser walkthrough testing the entire user journey: entering the studio, generating with AI, customizing fields, verifying 3D hero rendering, testing scrubbers and vintage telephone visuals, and publishing to a live vanity slug.

To run the complete automated test suite:
```bash
npm run verify
```

---

## ☁️ Deployment Guide

The application is structured as a **single production process** where Express serves both the backend API and the static frontend build.

### 1. Render (Web Service)
1. Create a new **Web Service** connected to your repository.
2. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Auto-Deploy**: Yes
3. Set Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000` (or leave default `$PORT`)
   - `OPENAI_API_KEY=sk-...` (optional; fallback engine operates if omitted)
   - `PORTFOLIO_DB_PATH=/var/data/portfolios.sqlite`
4. **Attach a Persistent Disk**:
   - Render containers are ephemeral by default. To retain SQLite published portfolios across deploys and container restarts, attach a **Persistent Disk**:
   - **Mount Path**: `/var/data`
   - **Size**: 1 GB

### 2. Railway
1. Create a new Railway project and link the repository.
2. Configure the service settings:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
3. Add Environment Variables:
   - `NODE_ENV=production`
   - `OPENAI_API_KEY=sk-...`
   - `PORTFOLIO_DB_PATH=/app/server/data/portfolios.sqlite`
4. **Add a Volume**:
   - In your service's **Volumes** tab, add a persistent volume mounted at `/app/server/data`.

### 3. Fly.io
1. Initialize the Fly application:
   ```bash
   fly launch
   ```
2. Create a persistent storage volume for SQLite:
   ```bash
   fly volumes create portfolio_data --size 1 --region <region>
   ```
3. Update `fly.toml` to mount the volume and configure the process:
   ```toml
   [build]

   [env]
     NODE_ENV = "production"
     PORT = "8080"
     PORTFOLIO_DB_PATH = "/data/portfolios.sqlite"

   [mounts]
     source = "portfolio_data"
     destination = "/data"

   [http_service]
     internal_port = 8080
     force_https = true
     auto_stop_machines = 'stop'
     auto_start_machines = true
     min_machines_running = 1
   ```
4. Set secret keys:
   ```bash
   fly secrets set OPENAI_API_KEY=sk-...
   ```
5. Deploy:
   ```bash
   fly deploy
   ```

---

## 📦 Standalone Client Export

When clicking **"DOWNLOAD STANDALONE WEBSITE (ZIP)"** in Creator Studio:
1. Generates a standalone `index.html` containing all HTML, CSS, fonts, and interactive canvas JavaScript.
2. Contains `portfolio-data.json` with the raw schema.
3. Operates completely offline with zero server dependencies.
4. Ready to drag and drop onto [Vercel](https://vercel.com), [Netlify](https://netlify.com), or [GitHub Pages](https://pages.github.com).

---

## ⚠️ Known Limitations

1. **DOCX Visual Layout in Native Microsoft Word**:
   - The `.docx` export engine generates strict, valid OpenXML ZIP archives complying with the ISO/IEC 29500-1 specification, verified programmatically by inspecting internal XML markup (`word/document.xml`, `[Content_Types].xml`, `word/_rels/`).
   - However, pixel-precise visual line wrapping, page breaks, and exact font metrics inside proprietary desktop Microsoft Word are not verified in headless/Linux CI environments where Microsoft Office is not installed.
2. **Publishing Scope (Local until Hosted)**:
   - Published portfolio URLs (`/p/:slug`) resolve locally (e.g. `http://localhost:5000/p/my-portfolio`) when running locally or on internal networks.
   - Portfolios are not accessible globally on the public Internet until the app is deployed to a public hosting provider (such as Render, Railway, or Fly.io) or connected through a secure public tunnel.
3. **OpenAI Generation Quality & Connectivity**:
   - If an `OPENAI_API_KEY` is not provided, account credits are exhausted, or OpenAI rate limits are exceeded, the app seamlessly falls back to the deterministic offline synthesizer.
   - While the offline engine guarantees fact preservation, structural completeness, and role/discipline alignment, it does not produce novel generative text variations compared to live `gpt-4o` / `gpt-4o-mini` models.
