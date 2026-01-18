
# FairTradeWorker | Infrastructure Operating System (v2.5)

> **Active Maintenance Status**: This project is currently being actively maintained and expanded by Trae AI (Gemini-3-Pro-Preview) in collaboration with the lead developer. Focus is on stability, documentation, and systematic expansion of the core intelligence modules.

---

## ⚡ Quick Start (Local Development)

Get the project running in under 2 minutes.

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Ensure you have a `.env` file in the root directory (one is provided by default):
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=dev_secret_key
CORS_ORIGIN=http://localhost:3000
GEMINI_API_KEY=mock_key_for_development
```

### 3. Run the Application
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
npx tsx backend/server.ts
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** to view the app.

---

**FairTradeWorker** is a vertical SaaS and dual-sided marketplace designed to digitize the physical trades industry. It functions as a complete "Business-in-a-Box" for contractors while providing an AI-guarded marketplace for homeowners.

---

## 📊 B2B SaaS Bidding Marketplace Analysis

### Core Marketplace Flow (Homeowner → Contractor)
1. **Job Posting** → Homeowner uploads photos/video via `JobPoster.tsx` → AI analyzes scope via `analyzeJobMultimodal()`
2. **Lead Generation** → Job listed in `JobMarketplace.tsx` → Contractors search/filter by category & location
3. **Bidding** → Contractors submit bids with price + timeline → Bids queued in contractor's "My Bids" state
4. **Selection** → Homeowner views bids → Accepts winning bid → Status changes to "SCHEDULED"
5. **Execution** → Contractor assigned job → Crew executes → Homeowner approves completion
6. **Payment** → Funds released from escrow to contractor wallet → Platform fee deducted → Instant payout available

### Marketplace Economics
- **Revenue Model:** 18% platform fee on contractor payouts (standard for B2B home services)
- **Territory Pricing:** Dynamic zip code leasing ($50/mo rural → $500/mo urban)
- **Lead Quality Scoring:** AI rates homeowner commitment (0-100) via job description + image count
- **Contractor Tier System:** FREE (5 bids/mo) → PRO (unlimited) → ELITE (white-label)

### Known Marketplace Gaps (Priority Fixes)

**CRITICAL - Bid & Contract Management:**
- [ ] No bid acceptance workflow (contractor submits bid → what happens next?)
- [ ] Missing job execution contract with milestone verification
- [ ] No bid visibility rules (competitors see each other's bids immediately)
- [ ] No counter-offer mechanism (one-way bidding only)

**HIGH - Risk & Compliance:**
- [ ] No service category gating (unvetted contractors can bid any trade)
- [ ] No dispute resolution workflow for job completion disagreements
- [ ] Missing payment flow clarity (who pays platform fees: homeowner or contractor?)
- [ ] No evidence capture at job completion (photos/signatures required for payment release)

**MEDIUM - Data & Analytics:**
- [ ] No lead attribution tracking (critical for territory tier justification)
- [ ] Missing bid performance metrics (bid-to-close rates, avg response times)
- [ ] No contractor reputation aggregation in marketplace listing

---

## 🧠 System Intelligence Architecture

The platform leverages a multi-model AI strategy using the Google GenAI SDK to handle distinct cognitive tasks.

### 1. Zephyr Voice Core (Gemini Live)
*   **Model:** `gemini-2.5-flash-native-audio-preview-09-2025`
*   **Latency Target:** <500ms end-to-end.
*   **Function:** Handles real-time bi-directional voice conversations.
*   **Implementation:**
    *   **Input:** Raw 16kHz PCM audio stream from browser `MediaStream`.
    *   **Transport:** WebSocket (via GenAI SDK `live.connect`).
    *   **Output:** 24kHz PCM audio stream, buffered and played via Web Audio API `AudioBufferSourceNode`.
    *   **Context:** System instructions inject user role, tier, and specific business context (e.g., "You are a dispatch officer").

### 2. Visual Estimator Engine (Gemini Vision)
*   **Model:** `gemini-2.5-flash-image` / `gemini-3-flash-preview`
*   **Function:** Analyzes site photos/videos to generate line-item scopes of work.
*   **Workflow:**
    1.  User uploads media (Image/Video).
    2.  Media is Base64 encoded.
    3.  Prompt injects trade-specific knowledge (e.g., "Identify plumbing code violations").
    4.  Output is structured JSON containing material lists, labor hours, and risk factors.

### 3. Market Intelligence Grid (Grounding)
*   **Model:** `gemini-3-flash-preview`
*   **Tools:** `googleSearch`
*   **Function:** Real-time retrieval of local competitor pricing, hardware store inventory availability, and regional demand trends.

---

## 🏗 Modular Subsystems

### 🛡️ Identity & Role System
The application is multi-tenant with distinct UI/UX paths for different user types:
*   **Homeowner:** Focus on asset health (`HomeProfile`), project posting (`JobPoster`), and payments.
*   **Contractor (Admin):** Full "Mission Control" (`ContractorDashboard`) with financial tools, dispatch maps, and CRM.
*   **Subcontractor:** Task-focused view (`SubcontractorDashboard`) limiting access to sensitive financial data.
*   **Crew Member:** Execution view (`CrewDashboard`) for clock-in/out and safety checks.
*   **Franchise:** Network-level analytics (`FranchiseDashboard`) aggregating data across territories.

### 🗺️ Geospatial Registry (TerritoryMarketplace)
A strategic asset layer where contractors lease digital rights to physical locations.
*   **Logic:** Zip codes are treated as NFTs/Assets.
*   **Mechanic:** Owning a zip code grants "First Right of Refusal" for all leads generated in that zone.
*   **Pricing Engine:** Dynamic pricing based on `Lead Velocity * Density Modifier`.

### 📅 Operations & Scheduling Engine
A custom-built calendar and resource management system (`Operations.tsx`).
*   **State:** Dynamic CRUD for Jobs, Estimates, and Tasks.
*   **Sorting:** Chronological event loop.
*   **Dispatch:** Visual map integration showing crew locations (mocked via CSS animations).

### 💰 Financial OS (Wallet)
An embedded fintech layer designed for the gig economy.
*   **Escrow:** Funds are held in a neutral state until job completion evidence is verified.
*   **Flash Payouts:** Logic to bypass standard ACH hold times (simulated instant settlement).
*   **Tax Vault:** Automated percentage withholding for estimated taxes.

---

## 🔮 Strategic Roadmap & Vision

Our development trajectory is focused on moving from "Digitization" to "Autonomous Operations".

### Phase 1: Deep Intelligence (Q3 2025)
- [x] **Multimodal Estimating:** Photo-to-Quote via Gemini Vision.
- [x] **Voice Dispatch:** Hands-free Zephyr assistant.
- [ ] **Predictive Maintenance:** AI analyzing `HomeProfile` data to predict HVAC failures 3 weeks in advance.
- [ ] **Sentiment-Based Routing:** Routing the most empathetic technicians to frustrated customers based on initial call sentiment analysis.

### Phase 2: Hardware Convergence (Q4 2025)
- [ ] **Drone API Integration:** One-click "Roof Scan" ordering. Contractor requests a drone flyover via `Operations`, API dispatches local drone pilot, 3D mesh returns to app.
- [ ] **Tool Telemetry (BLE):** Bluetooth Low Energy tags on expensive equipment (drills, saws). App alerts if a tool is left behind at a job site (Geofence break).
- [ ] **Fleet OBD-II Sync:** Real-time fuel, engine health, and mileage tracking integrated directly into the `Wallet` expense ledger.

### Phase 3: Spatial Computing & AR (2026)
- [ ] **Augmented Previews:** Homeowners use the camera to "place" a new vanity or light fixture in their room before approving the estimate.
- [ ] **X-Ray Mode:** Contractors use AR overlays to see BIM data (pipes, wires behind walls) uploaded from city blueprints.
- [ ] **Holographic Support:** Junior techs wearing smart glasses get live AR annotations from Senior Master techs sitting in the office.

### Phase 4: Decentralized Trust (2026+)
- [ ] **Smart Contract Escrow:** Moving the `Wallet` logic to a Polygon sidechain for immutable, trustless dispute resolution.
- [ ] **Reputation Protocol:** Contractor reviews and license verifications stored on-chain, portable across platforms.

---

## 💻 Technical Stack & Standards

### Frontend Core
*   **Framework:** React 19 (Experimental/Beta features enabled).
*   **Build Tool:** Vite (implied via structure).
*   **Language:** TypeScript (Strict Mode).

### UI/UX Design System
*   **Styling:** Tailwind CSS v4.
*   **Philosophy:** "Glassmorphism & Cyber-Industrial".
*   **Key Components:**
    *   `glass-panel`: Standard container with backdrop blur and border transparency.
    *   `animate-fadeIn`: Global micro-interactions.
    *   **Theme Engine:** Configurable via `Settings.tsx` (Density, Color, Radius, Texture).

### Data Protocol
*   **Mock Data:** Extensive mocked datasets (`MOCK_JOBS`, `MOCK_INVENTORY`, `MOCK_SCHEDULE`) simulate a production environment for demo purposes.
*   **Interfaces:** Strict typing in `types.ts` ensures data integrity across components.

---

## 📂 Directory Structure Map

```text
/
├── components/
│   ├── ui/                 # Reusable atomic components (Layout, VideoPlayer)
│   ├── AIReceptionist.tsx  # Call handling & sentiment analysis dashboard
│   ├── EliteVoiceHub.tsx   # The "Siri for Pros" (Gemini Live impl)
│   ├── JobPoster.tsx       # Multimodal input wizard for homeowners
│   ├── Operations.tsx      # Scheduling & Inventory CRUD
│   ├── TerritoryMarketplace.tsx # Interactive SVG Map & bidding logic
│   ├── Wallet.tsx          # Fintech UI (Payouts, Ledger)
│   └── ... (Dashboards per role)
├── services/
│   └── geminiService.ts    # centralized API wrapper for all AI calls
├── types.ts                # The "Source of Truth" for data models
├── App.tsx                 # Router & Global State Holder
└── index.html              # Entry point & Tailwind config
```

---

## 🚀 Installation & Setup

1.  **Environment Variables:**
    *   Ensure `process.env.API_KEY` is available with a valid Gemini API key.
    *   **Note:** The app expects the key to be injected by the build environment or sandbox.

2.  **Permissions:**
    *   The app requires `microphone` access for the Voice Hub.
    *   The app requires `camera` access for the Job Poster (mobile view).

3.  **Dependencies:**
    *   `react`, `react-dom` (v19)
    *   `@google/genai` (v1.3.0)
    *   `lucide-react` (Icons)
    *   `recharts` (Data Viz)
    *   `tailwindcss` (CDN loaded for portability)

---
*Built by Senior Frontend Engineers with Deep Expertise in GenAI.*
