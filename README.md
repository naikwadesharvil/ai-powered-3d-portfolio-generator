# AI-Powered 3D Portfolio Generator

> A production-grade, extensible, AI-powered 3D personal portfolio and resume generation platform. Faithful to the iconic tutorial-inspired 3D visual aesthetic while providing an intelligent AI Studio with genuine OpenAI backend integration, accredited deterministic offline fallback, multi-discipline engineering presets, a real-time split customizer, and professional ATS resume exports (PDF, DOCX, Plaintext, Markdown).

---

## 🌟 Core Highlights & Architecture

### 1. Multi-Discipline & Persona-Aware AI Generation
- **Target Personas**:
  - **Student**: Prioritizes academic coursework, degree progression, student clubs, and exploratory projects.
  - **Job Seeker**: Highlights ATS-tailored career objective, core competencies, verified employment history, and key metrics.
  - **Working Professional**: Emphasizes leadership achievements, system architectures, enterprise-scale impact, and publications.
  - **Freelancer**: Surfaces client service packages, hourly/project pricing models, client testimonials, and booking CTAs.
- **Engineering Disciplines**:
  - Full first-class presets for **Computer Science / Software**, **AIML / Data Science**, **Mechanical Engineering**, **Mechatronics & Robotics**, **Electrical & Electronics**, **Civil Engineering**, and **Custom Disciplines** (e.g. *Marine Engineering*, *Biomedical*).
  - Discipline-tailored skills, Bento stats, industry tooling, and project taxonomies.

### 2. Live Split-Screen Customizer (`src/components/SplitCustomizer.tsx`)
- **Instant Dual-Pane Studio**: Side-by-side rich form editor on the left and live responsive portfolio preview on the right.
- **Ultra-Fast Sub-10ms Reactivity**: Instant re-renders as fields are edited, with debounced `localStorage` autosave drafts.
- **Drag-and-Drop Section Reordering**: Powered by `@dnd-kit/sortable` for intuitive section sequence customization.
- **Theme Token Customizer**: Granular control over accent colors, background palettes, glass card opacities, and typography variables with live CSS variable injection.
- **Responsive Viewport Controls**: 1-click toggling between **Desktop (1280px)**, **Tablet (768px)**, and **Mobile (360px)** viewports with dedicated tab navigation on mobile.

### 3. Professional Resume Studio & ATS Export
- **Pixel-Perfect PDF Generation**: Clean typography, crisp contact bar, structured section rules, and page-break orphan protection.
- **Native Microsoft Word Export (`.docx`)**: Valid OpenXML document format with standard heading hierarchies, bullet structures, and clickable hyperlinks.
- **Plaintext & Markdown ATS Exports**: Guaranteed parseable by modern applicant tracking systems.
- **Anti-Hallucination Fact Verification**: Enforces separation of user-verified facts from AI suggestions, flagging generated ideas explicitly with `isAiIdea: true`.

### 4. Hardened Backend Architecture (`server/`)
- **OpenAI Model Integration**: Connects via official `@openai/api` SDK using structured schemas (`gpt-4o`, `gpt-4o-mini`).
- **Backend Key Isolation**: `OPENAI_API_KEY` is strictly confined to the backend server and never sent to frontend bundles or client state.
- **Deterministic Offline Fallback**: Dual-engine design seamlessly serves accredited, fact-preserving content when an API key is unconfigured or rate-limited, surfacing clear non-alarming status disclosures (`source: "ai" | "fallback"`).
- **Security & Protection Layer**:
  - Helmet security headers
  - Express rate limiting (200 requests per 15 min)
  - Strict CORS origin filtering
  - Zod schema validation with field-level client/server error mapping
  - Payload size limits and prompt injection guards

### 5. Tutorial-Inspired 3D Visual Experience
- **Hardware-Accelerated 60 FPS Canvas Engine**: Interactive 360 rotating portrait with kinetic drag physics, inertia, and headlight vignette blending.
- **Dual-Tone Cinematic Lighting**: Cyan key light (`#00f2fe`) and magenta fill light (`#ff0055`).
- **Live Telemetry HUD**: System session status, real-time clock, geographic telemetry, engine readout, and FPS counter.
- **Signature 3D Elements**:
  - Welcome transition laptop prop (`#welcome`)
  - Asymmetrical 5:7 Bento grid (`#about`)
  - Signature 3D vintage telephone with atmospheric effects (`#projects`)
  - Contact communication terminal (`#contact`)

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript 5, Vite 8, Zustand 5, `@dnd-kit`, Lucide React, Canvas Confetti |
| **Backend API** | Node.js, Express, TypeScript (`tsx`), OpenAI SDK, Zod, Helmet, Express Rate Limit, Dotenv |
| **Styling** | Vanilla CSS Design Tokens, Glassmorphism (`backdrop-filter`), CSS Grid & Flexbox, Space Grotesk & Syne Fonts |
| **Export & Packaging** | JSZip, FileSaver, Standalone HTML5 Bundle, Headless PDF/DOCX Engines |

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check returning uptime, engine mode, model, and key status |
| `POST` | `/api/ai/generate-portfolio` | Synthesizes role- and discipline-tailored portfolio with source disclosure |
| `POST` | `/api/ai/rewrite-section` | Rewrites targeted section in chosen tone (`professional`, `creative`, `technical`, etc.) |
| `POST` | `/api/ai/recommendations` | Evaluates completeness and suggests role-specific section ordering & visibility |
| `POST` | `/api/ai/chat` | Conversational Co-Pilot for natural-language portfolio modifications |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+` or `v11+`

### 1. Installation
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment file to `server/.env`:
```bash
cp server/.env.example server/.env
```

Open `server/.env` and configure settings:
```env
# Server Configuration
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

# OpenAI API Key (Backend Only — Never committed or exposed to frontend)
OPENAI_API_KEY=sk-...

# OpenAI Model
OPENAI_MODEL=gpt-4o

# Rate Limiting (Requests per 15 minutes)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```
> **Security Note:** `server/.env` is strictly ignored by `.gitignore`. The frontend communicates with the backend via Vite's reverse proxy (`/api`) so the key never touches client devices.

### 3. Run Development Servers
Open two terminal windows (or run concurrently):

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

---

## 🧪 Testing & Validation

### 1. Run Complete Test Suite
```bash
npm run test:all
```
This runs the entire automated verification suite:
- **Master Verification Suite (`test_verification.mjs`)**: 42 assertions covering all personas, disciplines, custom fields, and heuristic safety.
- **Server AI API Suite (`test_server_ai.mjs`)**: 51 assertions testing endpoints, fallback disclosures, role generation, discipline synthesis, and validation guards.
- **Resume Export Suite (`test_resume_export.mjs`)**: 6 tests verifying multi-discipline PDF generation, OpenXML DOCX integrity, plaintext ATS, and markdown.
- **Resume Edge Cases (`test_resume_edge_cases_and_inspect.mjs`)**: 5 deep tests verifying minimal profiles, multi-page layout stability, and page breaks.
- **Phase 3 Split Customizer Suite (`test_phase3_split_customizer.mjs`)**: Headless browser verification of sub-100ms reactivity, CSS variables, and responsive viewports.

### 2. Run Production Build
```bash
npm run build
```
Executes `tsc -b && vite build` ensuring zero TypeScript errors and generating the production bundle in `dist/`.

---

## 📦 Standalone Export & Deployment

When clicking **"DOWNLOAD STANDALONE WEBSITE (ZIP)"** in Creator Studio:
1. Generates a standalone `index.html` containing all HTML, CSS, fonts, and interactive canvas JavaScript.
2. Contains `portfolio-data.json` with the raw schema.
3. Operates completely offline with zero server dependencies.
4. Ready to drag and drop onto [Vercel](https://vercel.com), [Netlify](https://netlify.com), or [GitHub Pages](https://pages.github.com).
