# Family Health History Agent (FHHA) 🧬
> **Google x Kaggle — "5-Day AI Agents Intensive" Competition Submission**  
> **Designed & Developed by:** Muhammad Danyal  
> **Ref Link:** [share.streamlit.io/danyal/family-history](https://share.streamlit.io/danyal/family-health-history)

Millions of families carry critical health history only in memory. When elders pass, this vital medical record disappears. This full-stack application captures, structures, and analyzes multi-generational family health history through warm conversational dialogs, compiling an interactive genetic pedigree map, and rendering doctor-ready annotated summaries in both **English** and **Urdu**.

---

## 🤖 Multi-Agent Architecture

The system houses **4 specialized agents** coordinated by a central **Root Orchestrator Agent** and driven by **Google Gemini 2.0 Flash (`gemini-3.5-flash`)** server-side under strict medical disclaimers ("Do Not Diagnose"):

```
                         [ USER CONVERSATION ]
                                  │   (English / Urdu / Hinglish)
                                  ▼
                     ┌──────────────────────────┐
                     │    Root Orchestrator     │
                     └────────────┬─────────────┘
                                  │ (Delegates task)
                                  ▼
      ┌───────────────────────────┼───────────────────────────┐
      │                           │                           │
      ▼                           ▼                           ▼
┌──────────────┐            ┌──────────────┐            ┌──────────────┐
│  Agent 1     │            │  Agent 2     │            │  Agent 3     │
│  Intake      │            │  Pattern     │            │  Risk        │
│  Extractor   │            │  Detector    │            │  Assessor    │
└──────┬───────┘            └──────┬───────┘            └──────┬───────┘
       │                           │                           │
       │ (Auto extracted profiles) │ (Hereditary clusters)     │ (Evidence mapping)
       ▼                           ▼                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  Durable Family Storage (JSON Engine)                │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │  Agent 4     │
                            │  Report      │
                            │  Compiler    │
                            └──────┬───────┘
                                   │ (Generates outputs)
                                   ▼
                ┌──────────────────┴──────────────────┐
                │                                     │
                ▼                                     ▼
      [ CLINICAL PEDIGREE PDF ]              [ COMPASSIONATE URDU ]
      * Clinical signature line              * WhatsApp forwardable
      * Diagnostic annotation                * Clear family terms
```

### 1. Intake Extractor Agent (`intake_agent`)
- Conducts empathetic, structured health interviews one relative at a time.
- Supports mixed Hinglish/Urdu text (e.g., *"Aba ko sugar thi, he passed away at 64 from stroke"*).
- Extracts variables into: `{ name, relationship, age, conditions, symptoms, deceased, ageAtDeath }`.
- Invokes real-time confirmation UI cards in React, letting users check data quality before saving.

### 2. Pattern Detection Agent (`pattern_agent`)
- Scans family pedigree lines and groups diagnostic tags into medical clusters (Diabetes, Vascular Tension, Cardiac events, Cancer, Thyroid, etc.).
- Traces lineage directions, counting generational concentrations and identifying inheritance weighting (e.g., *Paternal-dominated vs Bilateral risk*).

### 3. Risk Assessment Agent (`risk_agent`)
- Aggregates lineage patterns with the user's active health profile (Age, gender, existing indices) to calculate localized risk indicators (High / Moderate / Low) without making diagnostic assertions.
- Suggests 3 highly tailored, clinical-first lifestyle prevention tips for every elevated category.

### 4. Report Compiler Agent (`report_agent`)
- Drafts sophisticated clinical-grade medical reports for physical prints or PDF exports.
- Adds structured physician stamp boxes and annotation fields designed for clinic boards.
- Compiles warm, simple plain-language Urdu summaries for family WhatsApp sharing.

---

## 🌳 Interactive Pedigree Graph (Genogram Map)

We replacement heavy unguided canvases with a customized **SVG Genogram Pedigree Chart**:
- **Generational Hierarchy:** Stacks relatives logically across 3 vertical levels (Grandparents -> Parents/Uncles -> Self/Siblings -> Offspring).
- **Lineage Connector Rails:** Draws solid marriage bars and descent lines branching off parent columns.
- **Color Coded Legends:** Highlights severe/deceased nodes in dusty red, minor/warning clusters in gold, and clean status nodes in soothing forest green.
- **Inspections Panel:** Click on any node inside the SVG to instantly populate medication tabs, symptoms checklists, and lifestyle markers.

---

## 📦 Tech Stack & Dependencies

- **Frontend Core:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion
- **Backend Hub:** Node.js, Express Router, Dotenv Configs
- **AI Core Engine:** `@google/genai` TypeScript SDK (server-side, users' key kept secret)
- **Model Node:** `gemini-3.5-flash`

---

## 🚀 Quick Setup & Run

### A. Environment variables
Create a `.env` in the root (copied from `.env.example`):
```env
GEMINI_API_KEY="YOUR_GOOGLE_AI_STUDIO_KEY"
```

### B. Standard Local Running
1. Install node dependencies:
   ```bash
   npm install
   ```
2. Launch full-stack developer server:
   ```bash
   npm run dev
   ```
3. Open on your local viewport: `http://localhost:3000`

### C. Docker Deployment
1. Fire up the orchestration cluster:
   ```bash
   docker-compose up --build
   ```
2. Visit `http://localhost:3000` in your browser.

---

## 📄 Medical Info Disclaimer
This software acts purely as an educational family health history repository and informational risk map. It does not provide clinical diagnoses, medical prescription, or therapeutic plans. All generated report files should be printed and evaluated by a qualified doctor in a physical consultation.

---
*Created as a premium agentic solution, submitting to the Google x Kaggle AI Agent Developer Board.*
