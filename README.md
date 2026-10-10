# AI-Powered 3D Portfolio Generator

> A production-grade, reusable, AI-powered 3D personal portfolio generation platform. Faithful to the viral cinematic 3D visual reference while offering an intelligent AI Studio with genuine OpenAI backend integration and accredited offline fallbacks for Students, Job Seekers, Working Professionals, and Freelancers.

---

## 🌟 Highlights & Architecture

### Layer A: Frontend Creator Studio (`src/components/CreatorStudio.tsx`)
- **AI Autopilot Onboarding**: Enter **Name**, **Areas of Interest**, and select **Current Role** (Student, Job Seeker, Working Professional, Freelancer) to synthesize a tailored 3D portfolio in seconds.
- **AI Section Rewriter & Tone Transformer**: Regenerate any specific section (Headline, Short Bio, Full Bio, Target Role) across 5 tones: **Professional**, **Creative**, **Concise**, **Impactful**, and **Technical** with before/after diff review.
- **Role Recommendations & Section Optimizer**: Evaluates portfolio data against hiring expectations for the selected role, suggesting optimal section order and missing critical fields.
- **Conversational Co-Pilot**: Issue natural-language commands (*"Make my introduction more professional"*, *"Highlight my machine learning projects"*, *"Switch theme to Obsidian Stealth"*) with proposed change review and one-click accept/discard.
- **Undo & Redo History**: Complete state history stack with undo and redo controls.
- **Live Responsive Viewports**: Real-time toggling between **Desktop (1280px)**, **Tablet (768px)**, and **Mobile (375px)** frames.
- **Resume Import & Fact Audit**: Anti-hallucination parser checking evidence, contact info, degree history, and ATS keywords.
- **Standalone Website Export**: One-click download of a self-contained ZIP bundle with runnable `index.html` deployable to GitHub Pages, Vercel, or Netlify.

### Layer B: Node.js Express TypeScript Backend (`server/`)
- **Official OpenAI SDK Integration**: Connects to the OpenAI Chat Completions API with structured output schemas.
- **Configurable Model**: Configured via `OPENAI_MODEL` (e.g., `gpt-4o`, `gpt-4o-mini`).
- **Backend-Only Key Isolation**: `OPENAI_API_KEY` is strictly confined to the backend server. Never exposed to Vite, frontend bundles, browser storage, or client responses.
- **Dual-Engine Graceful Fallback**: If `OPENAI_API_KEY` is unconfigured, invalid, or quota-limited, the system automatically falls back to the deterministic fact-governed heuristic engine with clear UI status disclosures.
- **Strict Anti-Hallucination Guardrails**: Model system prompts forbid inventing unverified employers, degrees, or quantitative benchmarks. Proposed projects are explicitly flagged with `isAiIdea: true`.
- **Server Security & Abuse Protections**:
  - Request payload size limits (`500kb`)
  - Rate limiting via `express-rate-limit` (200 requests per 15 min)
  - Strict CORS origin filtering
  - Input validation via `Zod` schemas
  - Prompt injection mitigation (isolating user text from system instructions)

### Layer C: Reusable 3D Rendering Engine
- **Hardware-Accelerated 60 FPS Canvas Engine**: Interactive 360 rotating portrait with touch/mouse kinetic drag physics, inertia, and smooth headlight vignette blending.
- **Dual-Tone Cinematic Lighting**: Cyan key light (`#00f2fe`) and magenta fill light (`#ff0055`) matching the tutorial aesthetic.
- **Live Telemetry HUD**: System session status, live timezone clock (`03:51:07 PM`), geographic coordinates, active core engine readout, and real-time 60 FPS counter.
- **Welcome Transition (`#welcome`)**: Centered 3D laptop prop on a dark reflective surface with realistic ambient bloom and interactive cursor perspective tilt.
- **Asymmetrical Bento Grid (`#about`)**: High-resolution portrait card (5 cols) paired with 3 Bento data modules (`Core Stack`, `Education`, `Publications`) (7 cols).
- **Selected Works Showcase (`#projects`)**: Signature 3D vintage telephone with atmospheric smoke effects, separating verified projects from AI concept ideas.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript 5, Vite 8, Lucide React, Canvas Confetti |
| **Backend API** | Node.js, Express, TypeScript (`tsx`), OpenAI SDK, Zod, CORS, Express Rate Limit, Dotenv |
| **Styling** | Vanilla CSS Design Tokens, Glassmorphism (`backdrop-filter`), CSS Grid & Flexbox, Syne & Space Grotesk Google Fonts |
| **Packaging & Export** | JSZip, FileSaver, Standalone HTML5 Bundle |

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check returning status, uptime, model, and OpenAI key availability |
| `POST` | `/api/ai/generate-portfolio` | Synthesizes role-tailored portfolio via OpenAI or accredited offline fallback |
| `POST` | `/api/ai/rewrite-section` | Rewrites targeted section content in chosen tone (`professional`, `creative`, `concise`, etc.) |
| `POST | `/api/ai/recommendations` | Evaluates completeness and suggests role-specific section order & visibility |
| `POST` | `/api/ai/chat` | Conversational Co-Pilot for natural-language portfolio mutations |

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

Open `server/.env` and configure your settings:
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
> **Security Note:** `server/.env` is strictly ignored by `.gitignore`. The frontend communicates with the backend via Vite's reverse proxy (`/api`) so the key never touches the browser.

### 3. Run Development Servers
Open two terminal windows (or run concurrently):

**Terminal 1 — Backend API Server:**
```bash
npm run dev:server
# Server will run on http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

Visit [http://localhost:5173/#welcome](http://localhost:5173/#welcome) in your browser.

---

## 🧪 Testing & Verification

### 1. Run Automated Master Verification & Server Test Suites
```bash
npm run test:all
```
This executes:
- **Master Verification Suite (`test_verification.mjs`)**: 24 tests verifying all 4 roles, fallback handling, resume extraction, and section order logic.
- **Server AI Test Suite (`test_server_ai.mjs`)**: 29 tests verifying health checks, all 4 generation roles, tone rewriting, recommendations, chat mutations, and 400 Bad Request input validation.

### 2. Run Production Build
```bash
npm run build
```
Executes `tsc -b && vite build` ensuring zero TypeScript errors and generating the optimized production bundle in `dist/`.

### 3. Run Headless Browser Automation & Screenshot Suite
```bash
node browser_full_test.mjs
```
Automates a full headless Chrome browser session through all portfolio sections and Studio modal tabs, verifying **0 console errors** and saving screenshots to the artifact directory.

---

## 📂 Project Structure

```text
├── server/
│   ├── routes/
│   │   ├── ai.ts                 # Generation, rewrite, recommendations, chat endpoints
│   │   └── health.ts             # Health check endpoint
│   ├── schemas/
│   │   └── portfolioSchema.ts    # Zod schemas for validation
│   ├── services/
│   │   └── openaiService.ts      # OpenAI API client & anti-hallucination prompts
│   ├── .env.example              # Template environment variables
│   ├── .env                      # Local server secrets (git-ignored)
│   └── index.ts                  # Express application with CORS & rate limiting
├── src/
│   ├── components/
│   │   ├── AboutBento.tsx        # Asymmetrical Bento Grid (5:7 split)
│   │   ├── CertificationsPublications.tsx # Academic & industry achievements
│   │   ├── ContactSection.tsx    # Interactive communication terminal
│   │   ├── CreatorStudio.tsx     # AI Studio modal (Autopilot, Chat, Rewriter, Themes, Export)
│   │   ├── ExperienceServices.tsx# Experience timeline / Freelancer services
│   │   ├── Footer.tsx            # Monospace telemetry footer
│   │   ├── Hero3D.tsx            # 60 FPS 360 rotating avatar canvas engine
│   │   ├── Icons.tsx             # Custom SVG brand icons
│   │   ├── Navbar.tsx            # Header navigation & ambient audio synth
│   │   ├── SelectedWorks.tsx     # 3D vintage telephone & project showcase
│   │   └── WelcomeTransition.tsx # Centered 3D laptop prop with perspective tilt
│   ├── data/
│   │   ├── defaultProfiles.ts    # 4 role profiles (Student, Job Seeker, Professional, Freelancer)
│   │   └── themeConfig.ts        # 4 themes (Cyberpunk, Obsidian, Sunset, Emerald)
│   ├── services/
│   │   ├── aiApiClient.ts        # Frontend API client communicating with /api
│   │   └── aiEngine.ts           # Deterministic offline heuristic engine
│   ├── types/
│   │   └── portfolio.ts          # Core TypeScript interfaces & SectionKey definitions
│   ├── App.tsx                   # Main application orchestrator
│   ├── index.css                 # CSS tokens, glassmorphism, responsive styles
│   └── main.tsx                  # React entrypoint
├── test_verification.mjs         # Master test suite
├── test_server_ai.mjs            # Server API integration test suite
├── browser_full_test.mjs         # Headless Chrome automation suite
├── vite.config.ts                # Vite config with /api proxy to localhost:5000
└── package.json                  # Scripts & dependencies
```

---

## 📦 Standalone Export & Deployment

When clicking **"DOWNLOAD STANDALONE WEBSITE (ZIP)"** in the Studio:
1. Generates a standalone `index.html` containing all HTML, CSS, fonts, and interactive canvas JavaScript.
2. Contains `portfolio-data.json` with the raw schema.
3. Operates completely offline via double-click on `index.html` with zero build tools or server dependencies.
4. Can be dragged and dropped directly onto [Vercel](https://vercel.com), [Netlify](https://netlify.com), or deployed to GitHub Pages.
