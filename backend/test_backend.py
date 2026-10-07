import os
import unittest
import json
import sqlite3

# Set isolated test database environment variable BEFORE importing app/database
TEST_DB = "test_bankshield_isolated.db"
os.environ["BANKSHIELD_DB"] = TEST_DB

from database import init_db, get_connection
from risk_engine import calculate_risk, calculate_residual_risk
from app import app


class BankShieldBackendTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure any leftover test database is removed
        if os.path.exists(TEST_DB):
            os.remove(TEST_DB)
        # Initialize test database
        init_db(TEST_DB)
        cls.client = app.test_client()

    @classmethod
    def tearDownClass(cls):
        # Clean up test database file
        if os.path.exists(TEST_DB):
            try:
                os.remove(TEST_DB)
            except Exception:
                pass
        # Reset environment
        os.environ.pop("BANKSHIELD_DB", None)

    # 1. Risk Score Calculation
    def test_01_risk_score_calculation(self):
        score, level = calculate_risk(3, 4)
        self.assertEqual(score, 12)
        self.assertEqual(level, "High")

    # 2. Severity Boundaries
    def test_02_severity_boundaries(self):
        # 1-4 = Low
        self.assertEqual(calculate_risk(1, 1), (1, "Low"))
        self.assertEqual(calculate_risk(2, 2), (4, "Low"))
        # 5-9 = Medium
        self.assertEqual(calculate_risk(1, 5), (5, "Medium"))
        self.assertEqual(calculate_risk(3, 3), (9, "Medium"))
        # 10-16 = High
        self.assertEqual(calculate_risk(2, 5), (10, "High"))
        self.assertEqual(calculate_risk(4, 4), (16, "High"))
        # 17-25 = Critical
        self.assertEqual(calculate_risk(4, 5), (20, "Critical"))
        self.assertEqual(calculate_risk(5, 5), (25, "Critical"))

        # Out of range validation
        with self.assertRaises(ValueError):
            calculate_risk(0, 3)
        with self.assertRaises(ValueError):
            calculate_risk(3, 6)

    # 3. Valid Risk Creation
    def test_03_valid_risk_creation(self):
        payload = {
            "title": "Database Connection Pool Exhaustion",
            "category": "Operational",
            "description": "High concurrent transactions may exhaust database connection pool.",
            "likelihood": 3,
            "impact": 4,
            "mitigation": "Configure connection pooling and circuit breakers.",
            "owner": "Database Operations Team",
        }
        res = self.client.post("/api/risks", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["title"], payload["title"])
        self.assertEqual(data["score"], 12)
        self.assertEqual(data["level"], "High")
        self.assertEqual(data["status"], "Open")

    # 4. Invalid Risk Creation
    def test_04_invalid_risk_creation(self):
        # Empty title
        res = self.client.post("/api/risks", json={"title": "   ", "category": "Cybersecurity", "description": "Desc", "likelihood": 3, "impact": 3, "mitigation": "M", "owner": "O"})
        self.assertEqual(res.status_code, 400)
        self.assertIn("title is required", res.get_json()["error"].lower())

        # Invalid category
        res = self.client.post("/api/risks", json={"title": "Test", "category": "InvalidCat", "description": "Desc", "likelihood": 3, "impact": 3, "mitigation": "M", "owner": "O"})
        self.assertEqual(res.status_code, 400)
        self.assertIn("category", res.get_json()["error"].lower())

        # Empty mitigation
        res = self.client.post("/api/risks", json={"title": "Test", "category": "Cybersecurity", "description": "Desc", "likelihood": 3, "impact": 3, "mitigation": "  ", "owner": "O"})
        self.assertEqual(res.status_code, 400)
        self.assertIn("mitigation", res.get_json()["error"].lower())

        # Empty owner
        res = self.client.post("/api/risks", json={"title": "Test", "category": "Cybersecurity", "description": "Desc", "likelihood": 3, "impact": 3, "mitigation": "M", "owner": "  "})
        self.assertEqual(res.status_code, 400)
        self.assertIn("owner", res.get_json()["error"].lower())

        # Out of range likelihood
        res = self.client.post("/api/risks", json={"title": "Test", "category": "Cybersecurity", "description": "Desc", "likelihood": 6, "impact": 3, "mitigation": "M", "owner": "O"})
        self.assertEqual(res.status_code, 400)

    # 5. Event Simulation
    def test_05_event_simulation(self):
        res = self.client.post("/api/events/simulate", json={"event_type": "Suspicious Login", "severity": "Medium"})
        self.assertEqual(res.status_code, 201)
        event = res.get_json()
        self.assertEqual(event["event_type"], "Suspicious Login")
        self.assertEqual(event["status"], "Detected")
        self.assertIsNone(event["linked_risk_id"])
        self.assertIsNotNone(event["id"])

    # 6. Event-to-Risk Conversion
    def test_06_event_to_risk_conversion(self):
        # Create an event first
        sim_res = self.client.post("/api/events/simulate", json={"event_type": "Phishing Attempt", "severity": "High"})
        event_id = sim_res.get_json()["id"]

        convert_payload = {
            "title": "Phishing Campaign Targeting Retail Banking",
            "category": "Cybersecurity",
            "description": "Targeted fraudulent emails observed in mail gateways.",
            "likelihood": 4,
            "impact": 4,
            "mitigation": "Enable advanced email filtering and employee alerts.",
            "owner": "Security Operations Team",
        }
        res = self.client.post(f"/api/events/{event_id}/convert-to-risk", json=convert_payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        risk = data["risk"]
        event = data["event"]

        self.assertEqual(risk["score"], 16)
        self.assertEqual(risk["level"], "High")
        self.assertEqual(risk["source_event_id"], event_id)
        self.assertEqual(event["status"], "Converted to Risk")
        self.assertEqual(event["linked_risk_id"], risk["id"])

    # 7. Duplicate Conversion Rejection
    def test_07_duplicate_conversion_rejection(self):
        # Create an event and convert it
        sim_res = self.client.post("/api/events/simulate", json={"event_type": "API Abuse", "severity": "Critical"})
        event_id = sim_res.get_json()["id"]

        payload = {
            "title": "API Rate Limit Breach",
            "category": "Cybersecurity",
            "description": "Abnormal request volumes detected.",
            "likelihood": 4,
            "impact": 5,
            "mitigation": "Enforce throttling and token revocation.",
            "owner": "API Security Team",
        }
        res1 = self.client.post(f"/api/events/{event_id}/convert-to-risk", json=payload)
        self.assertEqual(res1.status_code, 201)

        # Attempt to convert the same event again
        res2 = self.client.post(f"/api/events/{event_id}/convert-to-risk", json=payload)
        self.assertEqual(res2.status_code, 400)
        self.assertIn("already been converted", res2.get_json()["error"])

    # 8. Residual Risk Calculation
    def test_08_residual_risk_calculation(self):
        score, level = calculate_residual_risk(2, 3)
        self.assertEqual(score, 6)
        self.assertEqual(level, "Medium")

    # 9. Mitigation
    def test_09_mitigation(self):
        # Create an inherent risk (score: 4 * 5 = 20)
        create_res = self.client.post("/api/risks", json={
            "title": "Ransomware Threat to File Servers",
            "category": "Cybersecurity",
            "description": "Malicious payload could encrypt files.",
            "likelihood": 4,
            "impact": 5,
            "mitigation": "Implement offline backups and EDR.",
            "owner": "Infrastructure Security Team",
        })
        risk_id = create_res.get_json()["id"]

        # Apply mitigation (residual: 2 * 2 = 4 Low)
        mitigate_res = self.client.post(f"/api/risks/{risk_id}/mitigate", json={
            "residual_likelihood": 2,
            "residual_impact": 2,
        })
        self.assertEqual(mitigate_res.status_code, 200)
        updated = mitigate_res.get_json()
        self.assertEqual(updated["status"], "Mitigated")
        self.assertEqual(updated["residual_score"], 4)
        self.assertEqual(updated["residual_severity"], "Low")

    # 10. Invalid Mitigation
    def test_10_invalid_mitigation(self):
        # Create risk with score 3 * 3 = 9
        create_res = self.client.post("/api/risks", json={
            "title": "Minor Vendor Disruption",
            "category": "Third-Party",
            "description": "Vendor reporting minor latency.",
            "likelihood": 3,
            "impact": 3,
            "mitigation": "Vendor SLA monitoring.",
            "owner": "Vendor Management Team",
        })
        risk_id = create_res.get_json()["id"]

        # Residual score (4 * 4 = 16) exceeds inherent score (9) -> should be rejected!
        res_exceed = self.client.post(f"/api/risks/{risk_id}/mitigate", json={
            "residual_likelihood": 4,
            "residual_impact": 4,
        })
        self.assertEqual(res_exceed.status_code, 400)
        self.assertIn("cannot exceed inherent risk score", res_exceed.get_json()["error"])

        # Out of range residual likelihood
        res_oor = self.client.post(f"/api/risks/{risk_id}/mitigate", json={
            "residual_likelihood": 6,
            "residual_impact": 2,
        })
        self.assertEqual(res_oor.status_code, 400)

    # 11. Linked-Risk Deletion Protection
    def test_11_linked_risk_deletion_protection(self):
        # Create event and convert it
        sim_res = self.client.post("/api/events/simulate", json={"event_type": "Transaction Anomaly", "severity": "High"})
        event_id = sim_res.get_json()["id"]

        conv_res = self.client.post(f"/api/events/{event_id}/convert-to-risk", json={
            "title": "High-Value Transaction Spike",
            "category": "Operational",
            "description": "Out-of-pattern transfers flagged.",
            "likelihood": 3,
            "impact": 4,
            "mitigation": "Step-up authentication and fraud analyst review.",
            "owner": "Fraud Operations Team",
        })
        risk_id = conv_res.get_json()["risk"]["id"]

        # Try to delete linked risk
        del_res = self.client.delete(f"/api/risks/{risk_id}")
        self.assertEqual(del_res.status_code, 400)
        self.assertIn(f"linked to security event EVT-{event_id:03d}", del_res.get_json()["error"])

        # Verify risk still exists
        get_res = self.client.get(f"/api/risks/{risk_id}")
        self.assertEqual(get_res.status_code, 200)

    # 12. Unlinked Risk Deletion
    def test_12_unlinked_risk_deletion(self):
        # Create unlinked risk
        create_res = self.client.post("/api/risks", json={
            "title": "Standalone Deletable Risk",
            "category": "Financial",
            "description": "Temporary test financial risk.",
            "likelihood": 2,
            "impact": 2,
            "mitigation": "Routine audit.",
            "owner": "Finance Team",
        })
        risk_id = create_res.get_json()["id"]

        # Delete it
        del_res = self.client.delete(f"/api/risks/{risk_id}")
        self.assertEqual(del_res.status_code, 200)
        self.assertEqual(del_res.get_json()["message"], "Risk deleted successfully")

        # Verify it no longer exists
        get_res = self.client.get(f"/api/risks/{risk_id}")
        self.assertEqual(get_res.status_code, 404)

    # 13. Event Status Triage Validation
    def test_13_event_status_triage_validation(self):
        sim_res = self.client.post("/api/events/simulate", json={"event_type": "Brute Force", "severity": "Critical"})
        event_id = sim_res.get_json()["id"]

        # Update to Under Review
        res = self.client.patch(f"/api/events/{event_id}/status", json={"status": "Under Review"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["status"], "Under Review")

        # Update to Closed
        res2 = self.client.patch(f"/api/events/{event_id}/status", json={"status": "Closed"})
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.get_json()["status"], "Closed")

        # Invalid status
        res_bad = self.client.patch(f"/api/events/{event_id}/status", json={"status": "NonexistentStatus"})
        self.assertEqual(res_bad.status_code, 400)

    # 14. Dashboard Dynamic Consistency
    def test_14_dashboard_dynamic_consistency(self):
        res = self.client.get("/api/dashboard")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["totalRisks"], data["openRisks"] + data["mitigatedRisks"])
        self.assertGreater(data["securityEvents"], 0)


if __name__ == "__main__":
    unittest.main()
