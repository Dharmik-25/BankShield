from flask import Flask, jsonify, request
from flask_cors import CORS

from database import init_db, get_connection
from risk_engine import calculate_risk

app = Flask(__name__)
CORS(app)

init_db()

VALID_CATEGORIES = [
    "Cybersecurity",
    "Operational",
    "Compliance",
    "Third-Party",
    "Financial",
]

VALID_EVENT_STATUSES = [
    "Detected",
    "Under Review",
    "Converted to Risk",
    "Closed",
]


def validate_risk_payload(data):
    """
    Validates required fields for risk creation / conversion:
    - title must not be empty
    - description must not be empty
    - category must be valid
    - likelihood must be integer 1–5
    - impact must be integer 1–5
    - mitigation control must not be empty
    - risk owner must not be empty
    """
    if not isinstance(data, dict):
        return None, "Invalid JSON payload format."

    title = data.get("title")
    if not title or not str(title).strip():
        return None, "Risk title is required and cannot be empty."

    category = data.get("category")
    if not category or not str(category).strip():
        return None, "Risk category is required."
    category = str(category).strip()
    if category not in VALID_CATEGORIES:
        return None, f"Invalid category '{category}'. Must be one of: {', '.join(VALID_CATEGORIES)}."

    description = data.get("description")
    if not description or not str(description).strip():
        return None, "Description is required and cannot be empty."

    likelihood = data.get("likelihood")
    try:
        l = int(likelihood)
        if not (1 <= l <= 5):
            return None, "Likelihood must be an integer between 1 and 5."
    except (TypeError, ValueError):
        return None, "Likelihood must be an integer between 1 and 5."

    impact = data.get("impact")
    try:
        i = int(impact)
        if not (1 <= i <= 5):
            return None, "Impact must be an integer between 1 and 5."
    except (TypeError, ValueError):
        return None, "Impact must be an integer between 1 and 5."

    mitigation = data.get("mitigation")
    if not mitigation or not str(mitigation).strip():
        return None, "Mitigation control is required and cannot be empty."

    owner = data.get("owner")
    if not owner or not str(owner).strip():
        return None, "Risk owner is required and cannot be empty."

    cleaned = {
        "title": str(title).strip(),
        "category": category,
        "description": str(description).strip(),
        "likelihood": l,
        "impact": i,
        "mitigation": str(mitigation).strip(),
        "owner": str(owner).strip(),
    }
    return cleaned, None


@app.route("/")
def home():
    return jsonify({
        "application": "BankShield",
        "description": "Online Banking Risk Identification and Mitigation Framework",
        "status": "running"
    })


@app.route("/api/risks", methods=["GET"])
def get_risks():
    conn = get_connection()
    risks = conn.execute(
        "SELECT * FROM risks ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(risk) for risk in risks])


@app.route("/api/risks/<int:risk_id>", methods=["GET"])
def get_risk(risk_id):
    conn = get_connection()
    risk = conn.execute(
        "SELECT * FROM risks WHERE id = ?",
        (risk_id,)
    ).fetchone()
    conn.close()
    if risk is None:
        return jsonify({"error": f"Risk #{risk_id} not found."}), 404
    return jsonify(dict(risk))


@app.route("/api/risks", methods=["POST"])
def add_risk():
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Invalid or missing JSON payload."}), 400

        cleaned, err = validate_risk_payload(data)
        if err:
            return jsonify({"error": err}), 400

        score, level = calculate_risk(
            cleaned["likelihood"],
            cleaned["impact"]
        )

        conn = get_connection()

        source_event_id = data.get("source_event_id")
        if source_event_id is not None:
            try:
                source_event_id = int(source_event_id)
                evt = conn.execute("SELECT * FROM security_events WHERE id = ?", (source_event_id,)).fetchone()
                if not evt:
                    conn.close()
                    return jsonify({"error": f"Security event #{source_event_id} not found."}), 404
                if evt["status"] == "Converted to Risk" or evt["linked_risk_id"] is not None:
                    conn.close()
                    return jsonify({"error": f"Security event #{source_event_id} is already converted to a risk."}), 400
            except (ValueError, TypeError):
                conn.close()
                return jsonify({"error": "source_event_id must be a valid integer."}), 400

        cursor = conn.execute("""
            INSERT INTO risks
            (
                title,
                category,
                description,
                likelihood,
                impact,
                score,
                level,
                mitigation,
                owner,
                status,
                residual_likelihood,
                residual_impact,
                residual_score,
                residual_severity,
                source_event_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            cleaned["title"],
            cleaned["category"],
            cleaned["description"],
            cleaned["likelihood"],
            cleaned["impact"],
            score,
            level,
            cleaned["mitigation"],
            cleaned["owner"],
            "Open",
            None,
            None,
            None,
            None,
            source_event_id
        ))

        conn.commit()
        risk_id = cursor.lastrowid

        if source_event_id:
            conn.execute("""
                UPDATE security_events
                SET status = 'Converted to Risk',
                    linked_risk_id = ?
                WHERE id = ?
            """, (risk_id, source_event_id))
            conn.commit()

        risk = conn.execute(
            "SELECT * FROM risks WHERE id = ?",
            (risk_id,)
        ).fetchone()

        conn.close()
        return jsonify(dict(risk)), 201

    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/risks/<int:risk_id>", methods=["PUT"])
def update_risk(risk_id):
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Invalid or missing JSON payload."}), 400

        conn = get_connection()

        existing = conn.execute(
            "SELECT * FROM risks WHERE id = ?",
            (risk_id,)
        ).fetchone()

        if existing is None:
            conn.close()
            return jsonify({"error": f"Risk #{risk_id} not found."}), 404

        mitigation = data.get("mitigation", existing["mitigation"])
        if mitigation and str(mitigation).strip():
            mitigation = str(mitigation).strip()
        else:
            mitigation = existing["mitigation"]

        owner = data.get("owner", existing["owner"])
        if owner and str(owner).strip():
            owner = str(owner).strip()
        else:
            owner = existing["owner"]

        status = data.get("status", existing["status"])
        if status not in ["Open", "Mitigated"]:
            conn.close()
            return jsonify({"error": "Invalid status. Must be 'Open' or 'Mitigated'."}), 400

        residual_likelihood = existing["residual_likelihood"]
        residual_impact = existing["residual_impact"]
        residual_score = existing["residual_score"]
        residual_severity = existing["residual_severity"]

        if "residual_likelihood" in data or "residual_impact" in data:
            r_l_val = data.get("residual_likelihood")
            r_i_val = data.get("residual_impact")
            if r_l_val is None or r_i_val is None:
                conn.close()
                return jsonify({"error": "Both residual_likelihood and residual_impact are required."}), 400

            try:
                r_l = int(r_l_val)
                r_i = int(r_i_val)
            except (ValueError, TypeError):
                conn.close()
                return jsonify({"error": "Residual likelihood and impact must be integers between 1 and 5."}), 400

            if not (1 <= r_l <= 5 and 1 <= r_i <= 5):
                conn.close()
                return jsonify({"error": "Residual likelihood and impact must be between 1 and 5."}), 400

            calc_score, calc_sev = calculate_risk(r_l, r_i)

            # Residual score cannot exceed inherent score
            if calc_score > existing["score"]:
                conn.close()
                return jsonify({
                    "error": f"Residual risk score ({calc_score}) cannot exceed inherent risk score ({existing['score']}). Mitigation controls must reduce or maintain risk level."
                }), 400

            residual_score = calc_score
            residual_severity = calc_sev
            residual_likelihood = r_l
            residual_impact = r_i

        conn.execute("""
            UPDATE risks
            SET mitigation = ?,
                owner = ?,
                status = ?,
                residual_likelihood = ?,
                residual_impact = ?,
                residual_score = ?,
                residual_severity = ?
            WHERE id = ?
        """, (
            mitigation,
            owner,
            status,
            residual_likelihood,
            residual_impact,
            residual_score,
            residual_severity,
            risk_id
        ))

        conn.commit()

        updated = conn.execute(
            "SELECT * FROM risks WHERE id = ?",
            (risk_id,)
        ).fetchone()

        conn.close()
        return jsonify(dict(updated))

    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/risks/<int:risk_id>/mitigate", methods=["POST", "PUT"])
def mitigate_risk(risk_id):
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Invalid or missing JSON payload."}), 400

        conn = get_connection()

        existing = conn.execute(
            "SELECT * FROM risks WHERE id = ?",
            (risk_id,)
        ).fetchone()

        if existing is None:
            conn.close()
            return jsonify({"error": f"Risk #{risk_id} not found."}), 404

        if "residual_likelihood" not in data or "residual_impact" not in data:
            conn.close()
            return jsonify({
                "error": "Both residual_likelihood and residual_impact are required."
            }), 400

        try:
            r_l = int(data["residual_likelihood"])
            r_i = int(data["residual_impact"])
        except (ValueError, TypeError):
            conn.close()
            return jsonify({"error": "Residual likelihood and impact must be integers between 1 and 5."}), 400

        if not (1 <= r_l <= 5 and 1 <= r_i <= 5):
            conn.close()
            return jsonify({"error": "Residual likelihood and impact must be between 1 and 5."}), 400

        residual_score, residual_severity = calculate_risk(r_l, r_i)

        # Logical validation: residual risk should not be greater than inherent risk
        if residual_score > existing["score"]:
            conn.close()
            return jsonify({
                "error": f"Residual risk score ({residual_score}) cannot exceed inherent risk score ({existing['score']}). Mitigation controls must reduce or maintain risk level."
            }), 400

        mitigation = data.get("mitigation", existing["mitigation"])
        if mitigation and str(mitigation).strip():
            mitigation = str(mitigation).strip()
        else:
            mitigation = existing["mitigation"]

        owner = data.get("owner", existing["owner"])
        if owner and str(owner).strip():
            owner = str(owner).strip()
        else:
            owner = existing["owner"]

        conn.execute("""
            UPDATE risks
            SET mitigation = ?,
                owner = ?,
                status = 'Mitigated',
                residual_likelihood = ?,
                residual_impact = ?,
                residual_score = ?,
                residual_severity = ?
            WHERE id = ?
        """, (
            mitigation,
            owner,
            r_l,
            r_i,
            residual_score,
            residual_severity,
            risk_id
        ))

        conn.commit()

        updated = conn.execute(
            "SELECT * FROM risks WHERE id = ?",
            (risk_id,)
        ).fetchone()

        conn.close()
        return jsonify(dict(updated))

    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/risks/<int:risk_id>", methods=["DELETE"])
def delete_risk(risk_id):
    try:
        conn = get_connection()

        existing = conn.execute(
            "SELECT * FROM risks WHERE id = ?",
            (risk_id,)
        ).fetchone()

        if existing is None:
            conn.close()
            return jsonify({"error": f"Risk #{risk_id} not found."}), 404

        # Check if linked to a security event
        source_evt_id = existing["source_event_id"]
        if not source_evt_id:
            evt_row = conn.execute(
                "SELECT id FROM security_events WHERE linked_risk_id = ?",
                (risk_id,)
            ).fetchone()
            if evt_row:
                source_evt_id = evt_row["id"]

        if source_evt_id:
            conn.close()
            return jsonify({
                "error": f"This risk is linked to security event EVT-{source_evt_id:03d} and cannot be deleted directly."
            }), 400

        conn.execute(
            "DELETE FROM risks WHERE id = ?",
            (risk_id,)
        )

        conn.commit()
        conn.close()

        return jsonify({
            "message": "Risk deleted successfully"
        })

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/events", methods=["GET"])
def get_events():
    status = request.args.get("status")
    severity = request.args.get("severity")

    conn = get_connection()

    query = "SELECT * FROM security_events WHERE 1=1"
    params = []

    if status and status != "All":
        query += " AND status = ?"
        params.append(status)

    if severity and severity != "All":
        query += " AND severity = ?"
        params.append(severity)

    query += " ORDER BY id DESC"

    events = conn.execute(query, params).fetchall()
    conn.close()

    return jsonify([dict(event) for event in events])


@app.route("/api/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    conn = get_connection()
    event = conn.execute(
        "SELECT * FROM security_events WHERE id = ?",
        (event_id,)
    ).fetchone()
    conn.close()
    if event is None:
        return jsonify({"error": f"Security event #{event_id} not found."}), 404
    return jsonify(dict(event))


@app.route("/api/events/simulate", methods=["POST"])
def simulate_event():
    try:
        data = request.get_json(silent=True) or {}

        event_type = data.get("event_type", "Suspicious Login")
        severity = data.get("severity", "Medium")

        descriptions = {
            "Suspicious Login":
                "Multiple failed login attempts detected from an unusual source.",
            "Phishing Attempt":
                "A simulated phishing attempt targeting online banking credentials was detected.",
            "Transaction Anomaly":
                "An unusual high-value transaction pattern was identified.",
            "Brute Force":
                "Repeated authentication attempts indicate a possible brute-force attack.",
            "Brute Force Attack":
                "Repeated authentication attempts indicate a possible brute-force attack.",
            "API Abuse":
                "Abnormally high API request activity was detected."
        }

        description = descriptions.get(
            event_type,
            "Simulated security event detected."
        )

        conn = get_connection()

        cursor = conn.execute("""
            INSERT INTO security_events
            (event_type, severity, description, status, linked_risk_id)
            VALUES (?, ?, ?, ?, ?)
        """, (
            event_type,
            severity,
            description,
            "Detected",
            None
        ))

        conn.commit()

        event_id = cursor.lastrowid

        event = conn.execute(
            "SELECT * FROM security_events WHERE id = ?",
            (event_id,)
        ).fetchone()

        conn.close()

        return jsonify(dict(event)), 201

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/events/<int:event_id>/convert-to-risk", methods=["POST"])
def convert_event_to_risk(event_id):
    try:
        conn = get_connection()

        event = conn.execute(
            "SELECT * FROM security_events WHERE id = ?",
            (event_id,)
        ).fetchone()

        if event is None:
            conn.close()
            return jsonify({"error": f"Security event #{event_id} not found."}), 404

        # Prevent duplicate risk creation from the same event
        if event["status"] == "Converted to Risk" or event["linked_risk_id"] is not None:
            conn.close()
            linked_ref = f"Risk R-{event['linked_risk_id']:03d}" if event["linked_risk_id"] else "an existing risk"
            return jsonify({
                "error": f"Security event #{event_id} has already been converted to {linked_ref}. Duplicate conversions are prohibited."
            }), 400

        data = request.get_json(silent=True)
        if data is None:
            conn.close()
            return jsonify({"error": "Invalid or missing JSON payload."}), 400

        cleaned, err = validate_risk_payload(data)
        if err:
            conn.close()
            return jsonify({"error": err}), 400

        # Calculate score and severity using existing BankShield risk-scoring engine
        score, level = calculate_risk(cleaned["likelihood"], cleaned["impact"])

        cursor = conn.execute("""
            INSERT INTO risks
            (
                title,
                category,
                description,
                likelihood,
                impact,
                score,
                level,
                mitigation,
                owner,
                status,
                residual_likelihood,
                residual_impact,
                residual_score,
                residual_severity,
                source_event_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            cleaned["title"],
            cleaned["category"],
            cleaned["description"],
            cleaned["likelihood"],
            cleaned["impact"],
            score,
            level,
            cleaned["mitigation"],
            cleaned["owner"],
            "Open",
            None,
            None,
            None,
            None,
            event_id
        ))

        new_risk_id = cursor.lastrowid

        conn.execute("""
            UPDATE security_events
            SET status = 'Converted to Risk',
                linked_risk_id = ?
            WHERE id = ?
        """, (new_risk_id, event_id))

        conn.commit()

        new_risk = conn.execute(
            "SELECT * FROM risks WHERE id = ?",
            (new_risk_id,)
        ).fetchone()

        updated_event = conn.execute(
            "SELECT * FROM security_events WHERE id = ?",
            (event_id,)
        ).fetchone()

        conn.close()

        return jsonify({
            "message": f"Security event #{event_id} converted to Risk R-{new_risk_id:03d} successfully",
            "risk": dict(new_risk),
            "event": dict(updated_event)
        }), 201

    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/events/<int:event_id>/status", methods=["PATCH", "PUT"])
def update_event_status(event_id):
    try:
        data = request.get_json(silent=True) or {}
        new_status = data.get("status")

        if not new_status or new_status not in VALID_EVENT_STATUSES:
            return jsonify({
                "error": f"Invalid status. Must be one of: {', '.join(VALID_EVENT_STATUSES)}."
            }), 400

        conn = get_connection()
        existing = conn.execute(
            "SELECT * FROM security_events WHERE id = ?",
            (event_id,)
        ).fetchone()

        if existing is None:
            conn.close()
            return jsonify({"error": f"Security event #{event_id} not found."}), 404

        if existing["status"] == "Converted to Risk":
            conn.close()
            return jsonify({
                "error": f"Event #{event_id} is already converted to Risk R-{existing['linked_risk_id']:03d} and its status cannot be changed."
            }), 400

        if new_status == "Converted to Risk":
            conn.close()
            return jsonify({
                "error": "Events can only be converted to risk through the formal risk conversion workflow."
            }), 400

        conn.execute("""
            UPDATE security_events
            SET status = ?
            WHERE id = ?
        """, (new_status, event_id))

        conn.commit()

        updated = conn.execute(
            "SELECT * FROM security_events WHERE id = ?",
            (event_id,)
        ).fetchone()

        conn.close()

        return jsonify(dict(updated))

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    conn = get_connection()

    risks = conn.execute(
        "SELECT * FROM risks"
    ).fetchall()

    events = conn.execute(
        "SELECT * FROM security_events"
    ).fetchall()

    conn.close()

    total = len(risks)

    critical = sum(
        1 for risk in risks
        if risk["level"] == "Critical"
    )

    high = sum(
        1 for risk in risks
        if risk["level"] == "High"
    )

    medium = sum(
        1 for risk in risks
        if risk["level"] == "Medium"
    )

    low = sum(
        1 for risk in risks
        if risk["level"] == "Low"
    )

    mitigated = sum(
        1 for risk in risks
        if risk["status"] == "Mitigated"
    )

    open_risks = sum(
        1 for risk in risks
        if risk["status"] == "Open"
    )

    return jsonify({
        "totalRisks": total,
        "criticalRisks": critical,
        "highRisks": high,
        "mediumRisks": medium,
        "lowRisks": low,
        "mitigatedRisks": mitigated,
        "openRisks": open_risks,
        "securityEvents": len(events)
    })


@app.errorhandler(400)
def bad_request_error(e):
    return jsonify({"error": getattr(e, "description", "Bad Request")}), 400


@app.errorhandler(404)
def not_found_error(e):
    return jsonify({"error": getattr(e, "description", "Resource Not Found")}), 404


@app.errorhandler(405)
def method_not_allowed_error(e):
    return jsonify({"error": "Method Not Allowed"}), 405


@app.errorhandler(500)
def internal_server_error(e):
    return jsonify({"error": "Internal Server Error"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)