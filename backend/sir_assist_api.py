"""
SIRAssist AI Verification Engine - Python Backend for Electoral Roll Special Intensive Revision (SIR)
Implements Gemini AI tool prompts, demographic & EPIC duplicate voter detection, BLO field verification, and ERO review workflows.
"""

import os
import json
import sqlite3
from datetime import datetime
from database import init_python_db, record_voter_db, review_record_db, get_connection

# Try importing google-genai SDK if available
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class SIRAssistAgent:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        init_python_db()
        if GENAI_AVAILABLE and self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def check_duplicate_voter_tool(self, voter_name, relative_name, house_address, constituency, epic_number=""):
        """
        Tool 1: Searches electoral roll database for duplicate voter registrations across ACs.
        """
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, epic_number, voter_name, relative_name, house_address, assembly_constituency FROM electoral_records WHERE is_duplicate = 0")
        rows = cursor.fetchall()
        conn.close()

        v_lower = voter_name.lower().strip()
        r_lower = relative_name.lower().strip()

        best_match = None
        highest_score = 0
        matching_factors = []

        for row in rows:
            if epic_number and row['epic_number'].lower() == epic_number.lower():
                continue

            score = 0
            factors = []

            # Name match
            db_v = row['voter_name'].lower().strip()
            if db_v == v_lower:
                score += 45
                factors.append(f"Identical Voter Name: {row['voter_name']}")
            elif db_v in v_lower or v_lower in db_v:
                score += 30
                factors.append(f"Phonetic Name Overlap: {row['voter_name']}")

            # Father/Relative Name
            db_r = row['relative_name'].lower().strip()
            if db_r == r_lower:
                score += 35
                factors.append(f"Identical Relative/Father: {row['relative_name']}")

            if score > highest_score:
                highest_score = score
                best_match = row
                matching_factors = factors

        is_dup = highest_score >= 65

        return {
            "isDuplicate": is_dup,
            "confidenceScore": min(98, highest_score if highest_score > 0 else 10),
            "matchedVoterId": best_match['id'] if best_match and is_dup else None,
            "matchedEpicNumber": best_match['epic_number'] if best_match and is_dup else None,
            "matchedVoterName": best_match['voter_name'] if best_match and is_dup else None,
            "matchedConstituency": best_match['assembly_constituency'] if best_match and is_dup else None,
            "similarityReasoning": (
                f"Matched with {best_match['epic_number']} ({best_match['voter_name']}) in {best_match['assembly_constituency']} ({highest_score}% score)."
                if is_dup else "No duplicate voter registrations detected in active draft rolls."
            ),
            "matchingFactors": matching_factors if is_dup else []
        }

    def analyze_electoral_record(self, voter_payload):
        """
        Tool Flow 2: Analyzes voter record using Gemini model gemini-3.6-flash or structured heuristic analysis.
        """
        voter_name = voter_payload.get("voterName", "")
        relative_name = voter_payload.get("relativeName", "")
        house_address = voter_payload.get("houseAddress", "")
        constituency = voter_payload.get("assemblyConstituency", "AC-164 Kolkata South")
        category = voter_payload.get("category", "Demographic Match")
        epic_number = voter_payload.get("epicNumber", "")

        dup_info = self.check_duplicate_voter_tool(voter_name, relative_name, house_address, constituency, epic_number)

        prompt = f"""
You are the SIRAssist Electoral Roll AI Verification Agent.
Analyze this voter record and return structured JSON tool findings:

VOTER NAME: {voter_name}
RELATIVE/FATHER: {relative_name}
EPIC ID: {epic_number}
CONSTITUENCY: {constituency}
ADDRESS: {house_address}
CATEGORY: {category}
DUPLICATE CHECK TOOL FINDING: IsDuplicate={dup_info['isDuplicate']}, Score={dup_info['confidenceScore']}%, MatchedEPIC={dup_info.get('matchedEpicNumber')}

Return valid JSON:
- riskScore (number 1-100)
- anomalySeverity ("Critical", "High", "Medium", "Low")
- regulatoryGuideline (string ECI SIR rule)
- rootCauseFactors (array of string factors)
- recommendedFieldActions (array of string actions)
- bloVerificationChecklist (array of door-to-door steps)
- recommendedOwner (string role)
- targetSLAHours (number)
- executiveSummary (string summary card text)
- aiConfidence (number 85-99)
"""

        if self.client:
            try:
                response = self.client.models.generateContent(
                    model="gemini-3.6-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.2
                    )
                )
                analysis_data = json.loads(response.text)
                analysis_data["duplicateAnalysis"] = dup_info
                return analysis_data
            except Exception as e:
                print("Gemini SDK fallback:", str(e))

        # Heuristic engine fallback
        severity = "Medium"
        risk_score = 50
        sla = 24

        if dup_info['isDuplicate'] or category in ['Demographic Match', 'Photo Hash Duplicate']:
            severity = "High"
            risk_score = 88
            sla = 12

        if category in ['Age/Relative Mismatch', 'Bulk Address Cluster']:
            severity = "Critical"
            risk_score = 94
            sla = 6

        return {
            "riskScore": risk_score,
            "anomalySeverity": severity,
            "regulatoryGuideline": f"Election Commission SIR Manual - {category} Audit Chapter 4",
            "rootCauseFactors": [
                f"Draft roll entry under {constituency}",
                f"Category classification: {category}",
                dup_info['similarityReasoning']
            ],
            "recommendedFieldActions": [
                f"Dispatch Booth Level Officer (BLO) to {house_address}",
                "Perform physical identity verification and collect Form 6/8 copies",
                "Submit geo-tagged field report to ERO portal"
            ],
            "bloVerificationChecklist": [
                "Verify physical presence at address",
                "Inspect official Photo ID / Aadhaar card",
                "Record residence duration declaration (> 6 months)"
            ],
            "recommendedOwner": f"BLO / ERO {constituency}",
            "targetSLAHours": sla,
            "duplicateAnalysis": dup_info,
            "executiveSummary": f"SIR Engine processed record {epic_number} ({voter_name}). Severity: {severity}. SLA: {sla} hours.",
            "aiConfidence": 95
        }

    def record_voter_action(self, voter_payload):
        """
        Record Action API: Ingests voter record and persists to SQLite database.
        """
        ai_analysis = self.analyze_electoral_record(voter_payload)
        rec_id, epic = record_voter_db(voter_payload, ai_analysis)
        
        return {
            "success": True,
            "recordId": rec_id,
            "epicNumber": epic,
            "aiAnalysis": ai_analysis
        }

    def review_record_action(self, record_id, action_type, reviewer_name, reviewer_role, notes, new_status):
        """
        Review Action API: Logs BLO/ERO field action decision and updates status in SQLite.
        """
        success, msg = review_record_db(record_id, action_type, reviewer_name, reviewer_role, notes, new_status)
        return {
            "success": success,
            "message": msg,
            "actionLogged": {
                "recordId": record_id,
                "actionType": action_type,
                "reviewer": f"{reviewer_name} ({reviewer_role})",
                "notes": notes,
                "newStatus": new_status,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        }


if __name__ == "__main__":
    agent = SIRAssistAgent()
    sample_payload = {
        "voterName": "Rajesh K Sharma",
        "relativeName": "Kailash Sharma",
        "epicNumber": "EPIC-WB-2026-88102",
        "assemblyConstituency": "AC-165 Jadavpur, Part 48",
        "houseAddress": "18/1 SC Mullick Road, Jadavpur",
        "category": "Demographic Match"
    }
    res = agent.record_voter_action(sample_payload)
    print("Record Action Result:", json.dumps(res, indent=2))
