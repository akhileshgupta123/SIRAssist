# Multi-Agent Architecture & Inter-Agent Communication Diagram

This document details the **Agent-Only Architecture** for the Electoral Roll SIR AI Verification Platform, focusing specifically on the 5 AI agents, their functional boundaries, data dependencies, and inter-agent connection pathways.

---

## 1. High-Level Agent Connection Topology

```
                                  +---------------------------------------+
                                  |                                       |
                                  |    1. MASTER ORCHESTRATOR AGENT       |
                                  |    - Coordinates Execution Pipeline   |
                                  |    - State Synchronization            |
                                  |    - Final Risk Score Aggregation     |
                                  |                                       |
                                  +---+---------------+---------------+---+
                                      |               |               ^
           +--------------------------+               |               |
           |                                          v               |
           v                                  +-------+-------+       |
+----------+--------------------+             |               |       |
|                               |             | 3. DEMOGRAPHIC|       |
| 2. DUPLICATE AUDIT AGENT      +------------>|    ANOMALY    |       |
| - Soundex & Metaphone Match   |  Duplicate  |    AGENT      |       |
| - Cross-AC EPIC Verification  |  Context    | - Age-Gap Rule|       |
| - Photo Hash Similarity       |             | - Address Cluster     |
|                               |             |               |       |
+-------------------------------+             +-------+-------+       |
                                                      |               |
                                                      | Anomaly       |
                                                      | Context       |
                                                      v               |
                                              +-------+-------+       |
                                              |               |       |
                                              | 4. BLO FIELD  +-------+
                                              |    DISPATCH   | High-Risk
                                              |    AGENT      | Field Tasks
                                              | - Survey Order|
                                              | - Geo Check   |
                                              |               |
                                              +-------+-------+
                                                      |
                                                      | Verification
                                                      | & Evidence
                                                      v
                                              +-------+-------+
                                              |               |
                                              | 5. FORM-7     |
                                              |    PURGE &    |
                                              |    COMPLIANCE |
                                              |    AGENT      |
                                              | - Statutory   |
                                              |   ECI Rules   |
                                              +---------------+
```

---

## 2. Inter-Agent Communication Matrix

| Source Agent | Destination Agent | Connection Type | Trigger / Data Payload | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Master Orchestrator** | **Duplicate Audit Agent** | Asynchronous Dispatch | Raw Voter Record + EPIC ID + Constituency Part | Triggers phonetic, EPIC ID, and photo hash duplicate checks against database. |
| **Master Orchestrator** | **Demographic Anomaly Agent** | Asynchronous Dispatch | Raw Voter Record + Household Family Tree | Triggers age-relative rules, family cluster screening, and address overcrowding checks. |
| **Duplicate Audit Agent** | **Demographic Anomaly Agent** | Data Enrichment Pipeline | Matched Duplicate Metadata & Similarity Index | Provides duplicate context to evaluate if demographic anomalies stem from dual registration. |
| **Demographic Anomaly Agent** | **BLO Field Dispatch Agent** | Event-Driven Trigger | Anomaly Severity = `CRITICAL` or `HIGH` | Generates a geo-tagged mobile field checklist for Booth Level Officer physical visit. |
| **BLO Field Dispatch Agent** | **Form-7 Purge & Compliance Agent** | Verification Handoff | BLO Field Survey Report + GPS + Photo Proof | Sends field verification outcome (e.g. "Shifted/Deceased") for statutory compliance evaluation. |
| **BLO Field Dispatch Agent** | **Master Orchestrator** | Status Sync | Field Task Status (`ASSIGNED`, `IN_PROGRESS`, `COMPLETED`) | Updates central orchestrator with real-time field progress and SLA metrics. |
| **Form-7 Purge & Compliance Agent**| **Master Orchestrator** | Recommendation Callback| Statutory Risk Rating + Form-7 Audit Trail Checklist | Delivers legal compliance verdict and ERO recommendation back to Master Orchestrator. |

---

## 3. Individual Agent Component Specifications

### 1️⃣ Master Orchestrator Agent
* **Role**: Central controller managing agent lifecycles, maintaining context state, and synthesizing sub-agent evaluation results into a unified confidence score (0–100%).
* **Inputs**: Ingested voter record, officer profile, execution request context.
* **Outputs**: Final composite risk assessment, prioritized action items, and aggregated summary.
* **Connected To**: All 4 sub-agents.

### 2️⃣ Duplicate Audit Agent
* **Role**: Detects identical or highly similar voter registrations across different booths, parts, or assembly constituencies.
* **Algorithm**: Soundex phonetic matching, Metaphone transliteration, Levenshtein distance, EPIC ID prefix analysis, and photo hash comparison.
* **Connected To**: Master Orchestrator (Input/Output), Demographic Anomaly Agent (Direct Data Pipeline).

### 3️⃣ Demographic Anomaly Agent
* **Role**: Identifies logical data irregularities and impossible family demographic structures.
* **Rules Checked**:
  * Parent-child age gap < 15 years or > 65 years.
  * Invalid EPIC ID checksum format.
  * Overcrowded dwelling (> 10 unrelated electors at a single house number).
  * Age > 120 years without senior citizen verification.
* **Connected To**: Master Orchestrator, Duplicate Audit Agent (Input), BLO Field Dispatch Agent (Output).

### 4️⃣ BLO Field Dispatch Agent
* **Role**: Translates digital anomaly flags into actionable physical field tasks for local Booth Level Officers.
* **Functions**: Generates structured door-to-door verification survey forms, records GPS location coordinates, and captures photo/document proof.
* **Connected To**: Demographic Anomaly Agent (Input), Master Orchestrator (Status Sync), Form-7 Purge & Compliance Agent (Output).

### 5️⃣ Form-7 Purge & Compliance Agent
* **Role**: Evaluates regulatory compliance under Election Commission rules before recommending record deletion or notice issuance.
* **Checks**: Statutory dual-notice requirement verification, hearing escalation eligibility, and illegal deletion risk assessment.
* **Connected To**: BLO Field Dispatch Agent (Input), Master Orchestrator (Callback).
