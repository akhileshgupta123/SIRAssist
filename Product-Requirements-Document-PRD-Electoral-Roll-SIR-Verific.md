# Product Requirements Document (PRD): Electoral Roll SIR Verification Platform

## 1. Executive Summary
The Electoral Roll SIR (Systematic Intelligent Review) Verification Platform is an enterprise-grade, full-stack solution designed to ensure the integrity and accuracy of electoral rolls. By combining a modern React 19 frontend with a robust Node.js backend and a sophisticated Multi-Agent AI Audit Pipeline powered by Google Gemini, the platform automates the identification of duplicates, demographic anomalies, and compliance risks. It bridges the gap between digital data auditing and physical field verification, providing election officials with a transparent, secure, and highly efficient workflow.

## 2. Problem Statement
Electoral administration faces significant challenges in maintaining clean voter lists. Manual verification is slow, prone to human error, and struggles to identify "fuzzy" duplicates or complex demographic anomalies (e.g., unrealistic age gaps between family members). Furthermore, the transition from identifying a digital anomaly to executing a physical field verification is often fragmented, leading to a lack of accountability and statutory compliance.

## 3. Goals & Objectives
*   **Automate Auditing:** Utilize AI to perform deep-data analysis that traditional SQL queries cannot handle.
*   **Enhance Accuracy:** Achieve high-precision duplicate detection using phonetic algorithms and LLM-based fuzzy matching.
*   **Ensure Compliance:** Maintain an immutable audit trail for all regulatory actions in accordance with Election Commission (ECI) rules.
*   **Operational Efficiency:** Streamline the workflow from anomaly detection to Booth Level Officer (BLO) field dispatch.
*   **Resilience:** Provide a system that remains functional via heuristic fallbacks even when external AI services are unavailable.

## 4. Target Users / Stakeholders
*   **Electoral Registration Officers (ERO):** High-level administrators who review AI findings and authorize regulatory actions (e.g., Form-7 purges).
*   **Booth Level Officers (BLO):** Field officers responsible for door-to-door verification and capturing ground-truth data.
*   **System Administrators:** Technical staff managing the platform configuration, AI prompt tuning, and system health.

## 5. Functional Requirements

### 5.1. Administrative Frontend (SPA)
*   **Contextual Dashboard:** Display officer identity, Assembly Constituency (AC) ID, and Polling Part details.
*   **Real-time Metrics:** Summary cards for total records, pending audits, confirmed duplicates, and SLA breaches.
*   **Incident Management:** Interactive grid with multi-parameter filtering (Severity, Category, SIR Status).
*   **Audit Drawer:** Detailed view of voter credentials, photo previews, and AI-generated match comparisons.
*   **Field Verification Module:** Dashboard for scheduling visits, capturing GPS coordinates, and uploading proof of verification.
*   **Developer Tools:** 
    *   **Prompt Lab:** Interface for tuning Gemini AI prompt templates.
    *   **Testing Suite:** In-app runner for unit/integration tests with live log viewing.
    *   **Architecture Visualization:** Interactive map of the multi-agent pipeline.

### 5.2. Multi-Agent AI Audit Pipeline
*   **Master Orchestrator:** Manages workflow execution, validates permissions, and calculates a final Risk Score (0-100%).
*   **Duplicate Audit Agent:** Uses Soundex and Metaphone algorithms to detect cross-booth and cross-constituency duplicates.
*   **Demographic Anomaly Agent:** Validates age-relative gaps (e.g., parent-child < 15 years), EPIC checksums, and address overcrowding.
*   **BLO Field Dispatch Agent:** Automatically generates structured survey orders for high-risk records.
*   **Form-7 Purge & Compliance Agent:** Checks records against statutory ECI rules before recommending deletion.

### 5.3. Backend Logic
*   **Modular API:** Dedicated endpoints for records, stats, AI analysis, and logs.
*   **Heuristic Fallback:** Automatic switch to rule-based screening if the Gemini API is unreachable.
*   **Structured Logging:** Every action must be tagged with a Correlation ID for end-to-end traceability.

## 6. Non-Functional Requirements
*   **Performance:** High-speed UI rendering using React 19 and Vite; optimized SQLite connection pooling.
*   **Scalability:** Modular agent architecture allowing for additional specialized agents in the future.
*   **Reliability:** Disk persistence for SQLite (sql.js) to prevent data loss in local deployments.
*   **Security:** Zero exposure of API keys to the client-side; strict server-side environment variable management.
*   **Observability:** Log levels (DEBUG, INFO, WARN, ERROR) with file and in-memory storage.

## 7. System Architecture Overview
The system follows a layered architecture:
1.  **Client Layer:** React 19 SPA (Vite/Tailwind).
2.  **Service Layer:** Express.js Node.js server (TypeScript).
3.  **AI Pipeline Layer:** Python-based multi-agent system using LangGraph and Google Gemini SDK.
4.  **Data Layer:** SQLite database with persistent storage.
5.  **External Layer:** Google Gemini AI API.

## 8. Tech Stack
*   **Frontend:** React 19, Vite, Tailwind CSS, React Query, Lucide React, Recharts.
*   **Backend:** Node.js, Express.js, TypeScript, dotenv, Winston (logging), Correlation-IDs.
*   **AI/Orchestration:** Python, LangGraph, Google Generative AI SDK, Pydantic, Jellyfish (phonetics).
*   **Database:** SQLite, sql.js.

## 9. Data Requirements
### 9.1. Database Tables
*   **`electoral_records`:** Primary voter data (Name, EPIC, Address, Age, etc.).
*   **`review_logs`:** Immutable audit trail of AI findings and officer decisions.
*   **`blo_field_tasks`:** Task tracking for physical verification (Status, GPS, Proof, BLO ID).

### 9.2. Data Flow
1.  Voter data is queried from `electoral_records`.
2.  The API triggers the AI Pipeline; results are written to `review_logs`.
3.  High-risk flags generate entries in `blo_field_tasks`.
4.  Field updates are synced back to the main record and log tables.

## 10. API Specifications
*   **`GET /api/records`:** Retrieve and filter voter records.
*   **`GET /api/stats`:** Fetch dashboard metrics and SLA statuses.
*   **`POST /api/analyze-gemini`:** Trigger the 5-agent audit pipeline for a batch of records.
*   **`GET /api/logs`:** Retrieve structured execution logs and audit trails.

## 11. Security Requirements
*   **API Key Protection:** `GEMINI_API_KEY` must remain server-side.
*   **Authentication:** Officer identity must be validated before accessing the dashboard (contextualized by AC ID).
*   **Data Integrity:** Use of prepared statements in `db.ts` to prevent SQL injection.
*   **Auditability:** `review_logs` must be immutable to ensure statutory compliance.

## 12. Deployment & Infrastructure
*   **Environment:** Node.js runtime for the API; Python environment for the AI agents.
*   **Persistence:** Local disk persistence for the SQLite database engine.
*   **Configuration:** Centralized `config.ts` for environment variables and SLA thresholds.

## 13. Success Metrics
*   **Detection Rate:** Percentage of actual duplicates/anomalies identified by the AI vs. manual audit.
*   **SLA Compliance:** Time taken from anomaly detection to BLO task assignment.
*   **False Positive Rate:** Percentage of AI-flagged records cleared during field verification.
*   **System Uptime:** Availability of the platform, including the graceful transition to heuristic fallback.

## 14. Timeline & Milestones
*   **Phase 1 (Foundation):** Setup Express server, SQLite schema, and React 19 frontend scaffolding.
*   **Phase 2 (AI Integration):** Implement `geminiService.ts` and the Master Orchestrator with basic Duplicate/Demographic agents.
*   **Phase 3 (Field & Compliance):** Develop the BLO Field Dispatch Agent and the `FieldVerificationTab`.
*   **Phase 4 (Hardening):** Implement structured logging, heuristic fallbacks, and the Testing Suite.

## 15. Open Questions & Risks
*   **Risk:** High latency in Gemini API responses for very large batches of voter records.
*   **Risk:** Accuracy of GPS capture in low-connectivity rural areas during BLO field visits.
*   **Question:** What is the required data retention period for the `review_logs` under local electoral laws?
*   **Question:** Should the system support offline data entry for BLOs with subsequent synchronization?