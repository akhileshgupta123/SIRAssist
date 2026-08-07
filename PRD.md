# Product Requirements Document (PRD)

## Project Title: Electoral Roll Special Intensive Revision (SIR) AI Verification Platform
**Document Version**: 1.0.0  
**Target Audience**: Electoral Registration Officers (ERO), Booth Level Officers (BLO), District Election Officers (DEO), System Administrators  
**Product Status**: Ready for Deployment  

---

## 1. Executive Summary & Problem Statement

### **1.1 Executive Summary**
The **Electoral Roll Special Intensive Revision (SIR) AI Verification Platform** is an intelligent electoral management system designed to streamline, automate, and audit the Special Intensive Revision process for electoral rolls. Powered by multi-agent AI and phonetic fuzzy matching algorithms, the platform detects duplicate voter registrations, flags demographic impossibilities, coordinates field physical verifications for Booth Level Officers (BLOs), and provides Electoral Registration Officers (EROs) with an integrated command center for statutory regulatory actions (Forms 6, 7, and 8).

### **1.2 Problem Statement**
Electoral rolls across large assembly constituencies suffer from recurring data integrity challenges:
* **Duplicate Registrations**: Voters registered across multiple polling booths or neighboring assembly constituencies due to migration or spelling variations in regional scripts.
* **Demographic Impossibilities**: Data entry errors creating impossible age gaps between parents and children (< 15 years), invalid EPIC ID checksums, or artificial address overcrowding (10+ unrelated voters sharing a single house number).
* **Manual Verification Bottlenecks**: Traditional field verification relies on manual paper registers, leading to delayed SLA resolutions and lack of GPS/evidence logs.
* **Statutory Compliance Audit Trail**: High volume of Form 7 purge requests requires clear evidence logging to prevent illegal or accidental voter deletion.

---

## 2. Product Objectives & Success Metrics

| Objective | Key Result / Metric | Target |
| :--- | :--- | :--- |
| **Duplicate Detection Accuracy** | Precision & recall rate of duplicate voter flags using Soundex + Gemini AI | **> 98%** accuracy |
| **Field Verification Efficiency** | Average time taken by BLO to complete door-to-door verification | **< 24 hours** per task |
| **SLA Compliance Rate** | Critical anomaly resolutions completed within stipulated SLA window | **100%** resolution in < 12 hrs |
| **System Uptime & Stability** | Server availability & seamless fallback when offline or without API keys | **99.9%** build & runtime reliability |

---

## 3. User Personas & User Stories

### **Persona 1: Electoral Registration Officer (ERO) - Executive Decision Maker**
* **Role**: Primary statutory authority responsible for finalizing the electoral roll in an Assembly Constituency.
* **Needs**: High-level analytical dashboard, clear risk scores, AI summary of evidence, and single-click regulatory decision tools (Form 7 Purge, Flag Duplicate, Mark Valid, Escalate for Hearing).
* **User Story**: *As an ERO, I want to filter voter anomalies by severity and review AI-driven evidence so that I can issue Form 7 deletion notices or schedule official hearings without manual paper checking.*

### **Persona 2: Booth Level Officer (BLO) - Field Auditor**
* **Role**: Field officer conducting physical door-to-door verification at local polling booths.
* **Needs**: Mobile-responsive field verification task list, GPS location tagging, photo evidence upload, and clear checklist of parameters to verify.
* **User Story**: *As a BLO, I want to receive geo-tagged verification tasks on my mobile dashboard so that I can physically visit suspect addresses, verify resident status, and upload verification proof directly.*

---

## 4. Core Features & Functional Requirements

### **4.1 AI Anomaly Audit Engine**
* **FR-1.1 Phonetic Matching**: Execute Soundex and Metaphone algorithms to identify duplicate voter names across assembly constituencies regardless of spelling variations or script transliterations.
* **FR-1.2 Demographic Logic Validation**: Automatically flag impossibilities such as parent-child age gaps < 15 years or voter age > 120 years.
* **FR-1.3 Gemini AI Risk Scoring**: Analyze voter records using Google Gemini API (`gemini-2.5-flash`), returning an overall risk confidence score (0-100%), summary analysis, and recommended field action.
* **FR-1.4 Fallback Heuristics**: If the Gemini API key is missing or network fails, automatically default to deterministic heuristic rules to ensure continuous operation.

### **4.2 ERO Command Center & Dashboard**
* **FR-2.1 Real-Time Analytics**: Display metrics for Total Records, Pending Audits, Confirmed Duplicates, Form-7 Deletions, and Critical SLA Breaches.
* **FR-2.2 Multi-Parameter Filtering**: Filter incident records by Search query, Anomaly Category, Severity (Critical, High, Medium, Low), SIR Status, and Polling Part.
* **FR-2.3 Incident Detail Drawer**: Show full voter details side-by-side with matched duplicate records, photo comparison, and BLO field evidence logs.
* **FR-2.4 Regulatory Action Handler**: Provide immediate statutory actions:
  * **Mark Valid**: Confirm legitimate registration.
  * **Flag Duplicate**: Mark record as duplicate in a specific Part/Constituency.
  * **Form 7 Purge**: Issue official deletion notice under ECI guidelines.
  * **Escalate for Hearing**: Schedule in-person hearing with notice generation.

### **4.3 BLO Field Verification Hub**
* **FR-3.1 Task Queue Management**: View list of assigned verification tasks sorted by urgency and distance.
* **FR-3.2 Mobile-Optimized Survey Form**: Record verification outcome (Found & Verified, Shifted/Moved, Deceased, Untraceable).
* **FR-3.3 Evidence Logging**: Capture BLO notes, GPS latitude/longitude coordinates, and document photo uploads.

### **4.4 System Testing Suite & Feature Flag Controller**
* **FR-4.1 In-App Test Runner**: Execute automated unit and integration tests directly inside the UI.
* **FR-4.2 Dynamic Feature Flags**: Toggle features on/off at runtime without restarting the server:
  * `enableMultiAgentAi`
  * `enableSoundexPhonetics`
  * `enableDemographicAnomalyRules`
  * `enableForm7Purge`
  * `enableDetailedLogging`
  * `enableSimulatedBloFieldTasks`
* **FR-4.3 Structured Log Viewer**: Inspect server execution logs with log level filtering (DEBUG, INFO, WARN, ERROR) and correlation IDs.

---

## 5. Non-Functional Requirements (NFR)

* **Performance**: API responses for list queries and search filtering must load in **< 150ms**.
* **Security**: API keys must be kept exclusively on the server (`/src/backend`). No sensitive credentials exported to browser bundles.
* **Accessibility**: UI complies with WCAG 2.1 AA standards using accessible color contrast ratios and responsive desktop/mobile layouts.
* **Portability**: Operates in standard Cloud Run containers on Port 3000 using SQLite file persistence (`./data/sir_assist.db`).

---

## 6. Acceptance Criteria Matrix

| Feature | Acceptance Criteria | Status |
| :--- | :--- | :--- |
| **Duplicate Audit** | Matching names with Soundex score > 80% generate a `CROSS_BOOTH_DUPLICATE` anomaly flag. | **PASSED** |
| **Gemini AI Audit** | Clicking "Analyze with Gemini" generates structured JSON summary, risk level, and field checklist. | **PASSED** |
| **BLO Field Visit** | Submitting a BLO report updates the record status to `BLO_VERIFIED` and logs GPS coordinates. | **PASSED** |
| **Form 7 Deletion** | Executing Form 7 Purge updates status to `FORM7_PURGED` and creates an audit entry in `review_logs`. | **PASSED** |
| **Feature Flags** | Disabling `enableMultiAgentAi` updates runtime configuration immediately without errors. | **PASSED** |
