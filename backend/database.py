import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.getcwd(), 'data', 'sir_assist.db')

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_python_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS electoral_records (
      id TEXT PRIMARY KEY,
      epic_number TEXT UNIQUE,
      voter_name TEXT NOT NULL,
      relative_name TEXT NOT NULL,
      relation_type TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      assembly_constituency TEXT NOT NULL,
      part_number TEXT NOT NULL,
      house_address TEXT NOT NULL,
      blo_assigned TEXT NOT NULL,
      category TEXT NOT NULL,
      anomaly_severity TEXT NOT NULL,
      status TEXT NOT NULL,
      date_reported TEXT NOT NULL,
      risk_score INTEGER NOT NULL DEFAULT 50,
      is_duplicate INTEGER NOT NULL DEFAULT 0,
      duplicate_of_id TEXT,
      duplicate_similarity REAL DEFAULT 0,
      ai_analysis_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS review_actions (
      id TEXT PRIMARY KEY,
      incident_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      reviewer_name TEXT NOT NULL,
      reviewer_role TEXT NOT NULL,
      notes TEXT NOT NULL,
      prev_status TEXT NOT NULL,
      new_status TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()

def record_voter_db(record_data, ai_analysis):
    conn = get_connection()
    cursor = conn.cursor()
    
    rec_id = f"rec-{int(datetime.now().timestamp() * 1000)}"
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    epic = record_data.get("epicNumber", f"EPIC-WB-2026-{int(datetime.now().timestamp() % 100000)}")

    cursor.execute("""
    INSERT INTO electoral_records (
      id, epic_number, voter_name, relative_name, relation_type, age, gender,
      assembly_constituency, part_number, house_address, blo_assigned, category,
      anomaly_severity, status, date_reported, risk_score, is_duplicate,
      duplicate_of_id, duplicate_similarity, ai_analysis_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        rec_id, epic,
        record_data.get("voterName", "Unknown"),
        record_data.get("relativeName", "Father"),
        record_data.get("relationType", "Father"),
        int(record_data.get("age", 30)),
        record_data.get("gender", "M"),
        record_data.get("assemblyConstituency", "AC-164 Kolkata South"),
        record_data.get("partNumber", "Part 01"),
        record_data.get("houseAddress", "Address Not Stated"),
        record_data.get("bloAssigned", "BLO-12 Agent"),
        record_data.get("category", "Demographic Match"),
        ai_analysis.get("anomalySeverity", "Medium"),
        "Flagged Duplicate" if ai_analysis.get("duplicateAnalysis", {}).get("isDuplicate") else "Pending ERO Review",
        now,
        ai_analysis.get("riskScore", 50),
        1 if ai_analysis.get("duplicateAnalysis", {}).get("isDuplicate") else 0,
        ai_analysis.get("duplicateAnalysis", {}).get("matchedVoterId"),
        ai_analysis.get("duplicateAnalysis", {}).get("confidenceScore", 0),
        json.dumps(ai_analysis),
        now, now
    ))

    cursor.execute("""
    INSERT INTO review_actions (
      id, incident_id, action_type, reviewer_name, reviewer_role, notes, prev_status, new_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
      f"rev-{rec_id}",
      rec_id,
      "Recorded",
      "SIR Python API",
      "Automated SIR Engine",
      f"Voter record ingested via Python API. EPIC: {epic}.",
      "Draft Ingest",
      "Flagged Duplicate" if ai_analysis.get("duplicateAnalysis", {}).get("isDuplicate") else "Pending ERO Review",
      now
    ))

    conn.commit()
    conn.close()
    return rec_id, epic

def review_record_db(record_id, action_type, reviewer_name, reviewer_role, notes, new_status):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT status, is_duplicate FROM electoral_records WHERE id = ?", (record_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False, "Record not found"

    prev_status = row["status"]
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
    UPDATE electoral_records
    SET status = ?, updated_at = ?
    WHERE id = ?
    """, (new_status, now, record_id))

    cursor.execute("""
    INSERT INTO review_actions (
      id, incident_id, action_type, reviewer_name, reviewer_role, notes, prev_status, new_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
      f"rev-{int(datetime.now().timestamp() * 1000)}",
      record_id, action_type, reviewer_name, reviewer_role, notes, prev_status, new_status, now
    ))

    conn.commit()
    conn.close()
    return True, "SIR Action successfully recorded in SQLite database"
