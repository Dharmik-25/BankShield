import os
import sqlite3

DATABASE = "bankshield.db"


def get_connection(db_name=None):
    db_path = db_name or os.environ.get("BANKSHIELD_DB", DATABASE)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_name=None):
    conn = get_connection(db_name)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS risks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            likelihood INTEGER NOT NULL,
            impact INTEGER NOT NULL,
            score INTEGER NOT NULL,
            level TEXT NOT NULL,
            mitigation TEXT,
            owner TEXT,
            status TEXT DEFAULT 'Open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            residual_likelihood INTEGER,
            residual_impact INTEGER,
            residual_score INTEGER,
            residual_severity TEXT,
            source_event_id INTEGER
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS security_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            description TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'Detected',
            linked_risk_id INTEGER
        )
    """)

    # Ensure residual risk columns and source_event_id exist in existing risks table
    cursor.execute("PRAGMA table_info(risks)")
    existing_columns = [row[1] for row in cursor.fetchall()]

    new_columns = [
        ("residual_likelihood", "INTEGER"),
        ("residual_impact", "INTEGER"),
        ("residual_score", "INTEGER"),
        ("residual_severity", "TEXT"),
        ("source_event_id", "INTEGER"),
    ]

    for col_name, col_type in new_columns:
        if col_name not in existing_columns:
            cursor.execute(f"ALTER TABLE risks ADD COLUMN {col_name} {col_type}")

    # Ensure status and linked_risk_id exist in existing security_events table
    cursor.execute("PRAGMA table_info(security_events)")
    existing_event_cols = [row[1] for row in cursor.fetchall()]

    if "status" not in existing_event_cols:
        cursor.execute("ALTER TABLE security_events ADD COLUMN status TEXT DEFAULT 'Detected'")
    cursor.execute("UPDATE security_events SET status = 'Detected' WHERE status IS NULL")

    if "linked_risk_id" not in existing_event_cols:
        cursor.execute("ALTER TABLE security_events ADD COLUMN linked_risk_id INTEGER")

    # Seed demonstration residual assessments for ONLY existing mitigated records if their residual fields are NULL
    demo_residuals = {
        "Credential Stuffing Attack": (2, 4, 8, "Medium"),
        "Transaction Processing Failure": (1, 3, 3, "Low"),
        "Application Configuration Error": (1, 1, 1, "Low"),
    }

    for title, (r_l, r_i, r_s, r_sev) in demo_residuals.items():
        cursor.execute("""
            UPDATE risks
            SET residual_likelihood = ?,
                residual_impact = ?,
                residual_score = ?,
                residual_severity = ?
            WHERE title = ? AND status = 'Mitigated' AND residual_score IS NULL
        """, (r_l, r_i, r_s, r_sev, title))

    conn.commit()
    conn.close()