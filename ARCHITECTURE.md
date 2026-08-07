# System Architecture & Technical Design Document

## Electoral Roll Special Intensive Revision (SIR) AI Verification Platform

---

## 1. System Overview & Architecture Diagram

The **Electoral Roll SIR Verification Platform** is an enterprise-grade full-stack web application designed for electoral administration. It combines a **React 19 single-page application (SPA)** frontend with an **Express.js Node.js backend server**, backed by a local **SQLite database engine** (`sql.js` with disk persistence) and integrated with **Google Gemini AI** for intelligent anomaly auditing and duplicate voter identification.

```
+---------------------------------------------------------------------------------------------------+
|                                      CLIENT LAYER (Browser)                                       |
|                                                                                                   |
|  +-------------------+   +--------------------+   +---------------------+   +------------------+  |
|  | Executive         |   | BLO Field          |   | Multi-Agent         |   | Prompt Lab &     |  |
|  | Dashboard         |   | Verification Tab   |   | Architecture View   |   | Testing Suite    |  |
|  +---------+---------+   +---------+----------+   +----------+----------+   +--------+---------+  |
|            |                       |                         |                       |            |
|            +-----------------------+------------+------------+-----------------------+            |
|                                                 |                                                 |
|                                  HTTP REST APIs / JSON Payloads                                   |
|                                                 |                                                 |
+-------------------------------------------------|-------------------------------------------------+
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                      APPLICATION SERVER LAYER                                     |
|                                      (Express.js / Node.js)                                       |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | API Router & Endpoint Controllers (/api/records, /api/stats, /api/analyze-gemini, /api/logs) |  |
|  +----------------------------------------------+----------------------------------------------+  |
|                                                 |                                                 |
|  +----------------------------------------------v----------------------------------------------+  |
|  | Multi-Agent AI Audit Engine & Dynamic Feature Flag Config                                   |  |
|  |  * Master Orchestrator Agent          * Demographic Anomaly Agent                            |  |
|  |  * Phonetic Soundex Agent             * BLO Field Dispatch Agent                             |  |
|  |  * Form-7 Purge & Compliance Agent                                                           |  |
|  +----------------------+--------------------------------------------------+-------------------+  |
|                         |                                                  |                      |
+-------------------------|--------------------------------------------------|----------------------+
                          v                                                  v
+--------------------------------------------------+   +--------------------------------------------+
|                EXTERNAL AI SERVICE               |   |            DATA PERSISTENCE LAYER          |
|                                                  |   |                                            |
|   Google Gemini API (@google/genai SDK)          |   |   SQLite Database (sql.js Engine)          |
|   Model: gemini-2.5-flash                        |   |   File Path: ./data/sir_assist.db          |
|   * Structured Anomaly Scoring                   |   |   Tables: electoral_records, review_logs,  |
|   * ECI Guidelines Cross-Check                   |   |           blo_field_tasks                  |
+--------------------------------------------------+   +--------------------------------------------+
```

---

## 2. Component Architecture & Layer Breakdown

### **A. Presentation Layer (Frontend)**
* **Technology**: React 19, TypeScript, Tailwind CSS v4, Lucide React Icons, Framer Motion (`motion/react`).
* **Design System**: Salesforce Lightning Design System (SLDS) inspired clean corporate UI palette with high-contrast, accessible typography.
* **Core Views**:
  * `Header.tsx` & `OfficerProfileBanner.tsx`: Contextual officer banner displaying ERO/BLO identity, Assembly Constituency ID, and active polling part details.
  * `DashboardStatsCards.tsx`: Summary metric cards detailing total records, pending audits, confirmed duplicates, Form-7 deletions, and critical SLA breaches.
  * `IncidentListTable.tsx` & `IncidentFilterBar.tsx`: Interactive data grid supporting multi-parameter filtering (Search, Severity, Category, SIR Status, Constituency).
  * `IncidentDetailModal.tsx`: Comprehensive audit drawer displaying voter credentials, photo preview, duplicate match comparisons, field verification logs, and ERO regulatory action buttons.
  * `FieldVerificationTab.tsx`: BLO mobile survey dashboard for scheduling door-to-door physical visits, capturing GPS coordinates, and uploading verification proof.
  * `PromptLabTab.tsx`: Playground for testing and tuning prompt templates against live Gemini AI endpoints.
  * `TestingSuiteTab.tsx`: In-app test runner executing unit tests and integration tests with live feature flag toggling and backend execution logs.
  * `ArchitectureDiagramTab.tsx`: Interactive multi-agent AI system architecture visualization tool.

### **B. Service & Business Logic Layer (Backend)**
* **Technology**: Node.js, Express.js (Port 3000), `tsx` dev runner, `esbuild` production bundler.
* **Modules**:
  * `server.ts`: Express server mounting REST endpoints, static asset middleware, error handlers, and test execution runner.
  * `config.ts`: Centralized configuration management handling environment variables, database path resolution, SLA thresholds, and runtime feature flags.
  * `geminiService.ts`: Integration wrapper for Google Gemini AI (`@google/genai`) with built-in heuristic fallback logic if API key is unconfigured.
  * `db.ts`: SQLite database layer managing initialization, connection pooling, prepared statements, and disk persistence.
  * `logger.ts`: In-memory and file structured logging service supporting correlation IDs and log level filtering (DEBUG, INFO, WARN, ERROR).

---

## 3. Multi-Agent AI Audit Pipeline

The platform uses a specialized 5-agent pipeline architecture to audit electoral roll records:

```
[ Incoming Record ] 
        |
        v
+---------------------------------+
| 1. Master Orchestrator Agent    | ---> Dispatches record & coordinates execution state
+---------------------------------+
        |
        +-------------------------+-------------------------+
        |                                                   |
        v                                                   v
+---------------------------------+               +---------------------------------+
| 2. Duplicate Audit Agent        |               | 3. Demographic Anomaly Agent    |
| (Phonetic Soundex Matching)     |               | (Logic & Age-Gap Validation)    |
+---------------------------------+               +---------------------------------+
        |                                                   |
        +-------------------------+-------------------------+
        |
        v
+---------------------------------+
| 4. BLO Field Dispatch Agent     | ---> Generates geo-tagged mobile verification checklist
+---------------------------------+
        |
        v
+---------------------------------+
| 5. Form-7 Purge & Compliance    | ---> Applies Election Commission statutory compliance rules
+---------------------------------+
        |
        v
[ Final ERO Recommendation & Audit Report ]
```

1. **Master Orchestrator Agent**: Controls workflow execution, user permission validation, and aggregates risk metrics into a final risk score (0-100%).
2. **Duplicate Audit Agent**: Executes phonetic Soundex and Metaphone algorithms to detect duplicate entries across different polling booths, constituencies, and spelling transliterations.
3. **Demographic Anomaly Agent**: Validates age-relative gaps (e.g. parent-child age difference < 15 years), invalid EPIC checksum formats, and overcrowding in a single address dwelling.
4. **BLO Field Dispatch Agent**: Converts high-risk anomaly flags into structured physical survey orders for field officers.
5. **Form-7 Purge & Compliance Agent**: Evaluates statutory compliance under ECI rules prior to issuing deletion notices.

---

## 4. Data Model & Database Schema

The SQLite database (`sir_assist.db`) maintains three core relational tables:

```sql
-- Electoral Records Table
CREATE TABLE IF NOT EXISTS electoral_records (
  id TEXT PRIMARY KEY,
  epic_id TEXT UNIQUE NOT NULL,
  voter_name TEXT NOT NULL,
  relative_name TEXT,
  relation_type TEXT, -- 'Father' | 'Husband' | 'Mother' | 'Other'
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  house_no TEXT,
  address TEXT NOT NULL,
  constituency TEXT NOT NULL,
  part_number TEXT NOT NULL,
  serial_number INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'PENDING_VERIFICATION' | 'BLO_VERIFIED' | 'DUPLICATE_CONFIRMED' | 'MARKED_VALID' | 'FORM7_PURGED' | 'ESCALATED_HEARING'
  anomaly_category TEXT, -- 'CROSS_BOOTH_DUPLICATE' | 'AGE_MISMATCH' | 'DEMOGRAPHIC_CLUSTERING' | 'INVALID_EPIC' | 'SUSPECTED_DECEASED'
  severity TEXT, -- 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  confidence_score REAL,
  ai_summary TEXT,
  blo_assigned TEXT,
  photo_url TEXT,
  matched_duplicate_epic TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Review Audit Logs Table
CREATE TABLE IF NOT EXISTS review_logs (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL,
  officer_id TEXT NOT NULL,
  officer_role TEXT NOT NULL, -- 'ERO' | 'BLO' | 'DEO'
  action TEXT NOT NULL, -- 'VERIFIED_VALID' | 'CONFIRMED_DUPLICATE' | 'PURGED_FORM7' | 'ESCALATED' | 'FIELD_TASK_ASSIGNED'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id) REFERENCES electoral_records(id)
);

-- BLO Field Tasks Table
CREATE TABLE IF NOT EXISTS blo_field_tasks (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL,
  blo_name TEXT NOT NULL,
  visit_status TEXT NOT NULL, -- 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'UNTRACEABLE'
  gps_latitude REAL,
  gps_longitude REAL,
  verification_notes TEXT,
  verification_date DATETIME,
  proof_document_url TEXT,
  FOREIGN KEY (record_id) REFERENCES electoral_records(id)
);
```

---

## 5. Security, Logging & Compliance

1. **Server-Side API Key Protection**: The Google Gemini API key (`GEMINI_API_KEY`) is stored strictly in server environment variables and never exposed to the client browser.
2. **Structured Execution Logging**: All system events, API requests, database updates, and Gemini AI queries record a correlation ID, timestamp, log level, and component tag.
3. **Audit Trail**: Every regulatory action taken by an officer creates an immutable record in `review_logs` for statutory compliance review.
4. **Fallback Mechanism**: If the Gemini API is unreachable or unconfigured, the application gracefully switches to local rule-based heuristic screening without throwing runtime crashes.
