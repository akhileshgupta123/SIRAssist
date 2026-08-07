# Electoral Roll SIR Verification Platform

An AI-powered, full-stack verification and audit platform designed to streamline **Special Intensive Revision (SIR)** workflows for electoral rolls. 

The platform empowers **Electoral Registration Officers (ERO)** and **Booth Level Officers (BLO)** to detect duplicate voter records, audit demographic anomalies, assign field verification tasks, and process regulatory decisions in accordance with Election Commission guidelines.

---

## 🌟 Key Highlights

* **🤖 Gemini AI Anomaly Audit**: Automatically analyzes voter records for risk factors, duplicate matches, and rule violations, returning actionable field checklists and SLA targets.
* **🔍 Duplicate Voter Detection**: Advanced phonetic soundex matching, EPIC ID checks, photo hash analysis, and age/address cluster screening across assembly constituencies.
* **📱 BLO Field Verification Hub**: Interactive field task management for Booth Level Officers with simulated door-to-door verification, GPS location logs, photo attachments, and status reporting.
* **📊 ERO Executive Dashboard**: Comprehensive command center with live analytics, severity-based filtering, SLA tracking, and regulatory action modals (Mark Valid, Flag Duplicate, Form 7 Purge, Hearing Escalation).
* **🧪 Interactive Testing Suite & Prompt Lab**: In-app automated unit/integration test runner, live feature flag toggling, structured backend log viewer, and Gemini AI prompt sandbox.
* **📁 Sample Scenarios & Batch Ingestion**: Built-in electoral roll edge-case scenarios (cross-constituency duplicates, age-relative gaps, bulk address clusters) and CSV list upload capability.

---

## 👥 User Roles & Responsibilities

| Role | Interface / View | Key Responsibilities |
| :--- | :--- | :--- |
| **Electoral Registration Officer (ERO)** | Executive Dashboard & Decision Center | Reviews flagged anomalies, inspects AI analysis, assigns BLO field tasks, issues Form 7/8 notices, and executes final regulatory decisions. |
| **Booth Level Officer (BLO)** | Field Verification Tab | Receives assigned field tasks, conducts door-to-door physical visits, records GPS coordinates, uploads field proof/photos, and updates verification status. |

---

## 🔄 How It Works (Step-by-Step Workflow)

```
 [1. Ingest Roll Data]  --->  [2. AI Screening & Audit]  --->  [3. BLO Field Visit]  --->  [4. ERO Final Decision]
   (CSV / Demo Scenarios)      (Gemini Duplicate Detection)      (Door-to-door Check)      (Valid / Purge / Hearing)
```

1. **Record Ingestion**: Import voter records via CSV upload or pre-loaded test scenarios (e.g., cross-constituency duplicate, age mismatch, or bulk address cluster).
2. **AI Screening**: The system screens the record against local database records, applying phonetic similarity scoring, EPIC ID validation, and Google Gemini AI risk analysis.
3. **Field Task Assignment**: High-risk or flagged anomaly records automatically generate a field task assigned to the respective Booth Level Officer (BLO).
4. **Field Verification**: The BLO performs a physical verification check, uploads notes/location, and submits a field report.
5. **ERO Review & Regulatory Action**: The ERO reviews the BLO report alongside AI recommendations and takes official action:
   * **Mark Valid**: Confirms genuine voter credentials.
   * **Flag Duplicate**: Confirms duplicate registration in another part or constituency.
   * **Form 7 Purge / Delete**: Deletes invalid or deceased/shifted records.
   * **Escalate for Hearing**: Schedules an in-person hearing under ECI rules.

---

## 💻 Tech Stack & Architecture

### **Frontend**
* **Framework**: React 19 with Vite & TypeScript
* **Styling**: Tailwind CSS v4 & Lucide React icons
* **Animations**: Motion (`motion/react`)

### **Backend**
* **Server**: Express.js running on Node.js (Port 3000)
* **Database**: SQLite (`sql.js` database engine with local file persistence in `./data/sir_assist.db`)
* **AI Service**: Google Gemini API (`@google/genai` SDK)

---

## 🚀 Getting Started

### **Prerequisites**
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### **1. Installation**
Clone or download the repository, then install dependencies:
```bash
npm install
```

### **2. Environment Setup**
Create or modify `.env` in the root directory:
```env
# Optional: Required for real-time Google Gemini AI analysis
GEMINI_API_KEY="your_gemini_api_key_here"

# App Hosting URL
APP_URL="http://localhost:3000"
```
*(Note: If `GEMINI_API_KEY` is not provided, the system seamlessly uses intelligent built-in fallback heuristic models).*

### **3. Running the Application**
Start the development server:
```bash
npm run dev
```
The app will be available at: **`http://localhost:3000`**

### **4. Building for Production**
To compile the TypeScript server and Vite frontend for production:
```bash
npm run build
npm start
```

### **5. Running Tests**
To run unit and integration test suites:
```bash
npm test
```

---

## ⚙️ Configuration & Feature Flags

The application includes centralized configuration and live feature flag toggling via the UI (under **System Testing Suite** tab):

* **`enableMultiAgentAi`**: Enables AI multi-agent risk scoring and guideline recommendations.
* **`enableSoundexPhonetics`**: Activates soundex phonetic matching for name spellings.
* **`enableDemographicAnomalyRules`**: Runs logical checks (e.g., father-child age gaps).
* **`enableForm7Purge`**: Allows deletion/purge workflows for invalid registrations.
* **`enableDetailedLogging`**: Stores structured API logs with correlation IDs.
* **`enableSimulatedBloFieldTasks`**: Generates mock BLO field tasks upon ingestion.

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check and server status |
| `GET` | `/api/stats` | Dashboard statistics (total, pending, duplicates, critical alerts) |
| `GET` | `/api/records` | Fetch all voter records with optional status filtering |
| `GET` | `/api/records/:id` | Fetch detailed voter record with history and AI audit |
| `POST` | `/api/records` | Create a new voter record |
| `POST` | `/api/records/:id/review` | Record ERO review decision (Valid, Duplicate, Purge, Escalated) |
| `POST` | `/api/analyze-gemini` | Run Google Gemini AI audit on a voter record |
| `GET` | `/api/config` | Retrieve server environment config and feature flags |
| `POST` | `/api/config/flags` | Dynamically toggle runtime feature flags |
| `GET` | `/api/run-tests` | Execute in-app automated integration & unit tests |
| `GET` | `/api/logs` | Fetch backend structured execution logs |

---

## 📚 Glossary of Terms

* **SIR**: *Special Intensive Revision* — Systematic review of electoral rolls to ensure data accuracy.
* **EPIC**: *Electors Photo Identity Card* — Unique voter identification number issued by the Election Commission.
* **ERO**: *Electoral Registration Officer* — Statutory authority responsible for maintaining the electoral roll in an Assembly Constituency.
* **BLO**: *Booth Level Officer* — Field officer responsible for a specific polling station area (Part Number).
* **Form 6**: Application for inclusion of name in the electoral roll.
* **Form 7**: Application for object/deletion of a name from the electoral roll.
* **Form 8**: Application for correction or shifting of details in the electoral roll.
* **Part Number**: Polling booth segment within an Assembly Constituency (AC).

---

## 📄 License

This project is created for demonstration and educational purposes supporting electoral roll verification workflows.
