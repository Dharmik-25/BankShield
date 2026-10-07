# BankShield — Online Banking Risk Identification & Mitigation Framework

> **Academic Project Classification**: Cybersecurity & Banking Information Systems Capstone  
> **Domain**: Financial Technology (FinTech) Security, IT Governance & Enterprise Risk Management (ERM)  
> **Status**: Functionally Complete Academic Demonstration Prototype

---

## 1. Project Overview

**BankShield** is an interactive, web-based risk management and security governance framework engineered specifically for online banking architectures. The platform operationalizes standard cybersecurity risk management principles (such as ISO/IEC 27005 and NIST SP 800-30) into an end-to-end software platform that enables security teams to identify vulnerabilities, map threats on a standard 5×5 matrix, assess inherent versus residual exposure, track mitigation controls, and triage simulated security event telemetry into formal enterprise risks.

---

## 2. Problem Statement

Modern digital banking platforms face a rapidly evolving threat landscape characterized by credential stuffing, API abuse, sophisticated phishing campaigns, transactional velocity anomalies, and infrastructure outages. 

In many academic and small-to-medium financial institutions:
- Security incidents are treated in silos separate from enterprise risk registers.
- Qualitative risk assessments are disconnected from quantitative residual treatment metrics.
- There is a lack of end-to-end auditability linking a raw telemetry alert to a boardroom-level risk reduction metric.

BankShield bridges this gap by providing a transparent, auditable risk management workflow tailored to online banking operations.

---

## 3. Project Objectives

1. **Structured Risk Identification**: Provide a unified, validated register for cybersecurity, operational, compliance, financial, and third-party risks.
2. **Standardized Risk Quantification**: Implement a deterministic mathematical scoring model ($L \times I$) with clear severity bands.
3. **Rigorous Residual Risk Accounting**: Quantify the mathematical effectiveness of security mitigations by calculating residual likelihood, residual impact, and percentage risk reduction.
4. **Security Telemetry Triage**: Provide a controlled event simulation engine demonstrating how detected security alerts are analyzed, triaged, and converted into formal risk items with referential integrity.
5. **Executive Visibility**: Deliver dynamic analytics and risk matrix visualization reflecting portfolio exposure in real time.

---

## 4. Key Features

- **Executive Risk Dashboard**: Real-time KPI summaries (Total, Critical, Open, Mitigated), recent register activity, and severity distribution.
- **Enterprise Risk Register**: Comprehensive table of all banking risks, capturing likelihood, impact, score, severity, status, control descriptions, assigned owners, and source-event linkage tags.
- **5 × 5 Risk Assessment Matrix**: Standardized grid mapping inherent risks across horizontal Likelihood ($1\text{–}5$) and vertical Impact ($1\text{–}5$) axes with color-coded criticality tiers.
- **Mitigation & Residual Risk Tracker**: Interactive cards showing inherent exposure, mitigation controls, assigned risk owners, and dynamic residual assessment dropdowns with real-time score calculation and logical constraint validation.
- **Security Event Simulator & Log**: Simulation console generating controlled banking incidents (Suspicious Login, Phishing, Transaction Anomaly, Brute Force, API Abuse), audit logging, triage status workflows, and formal conversion into the risk register.
- **Descriptive Analytics Console**: 4 portfolio KPI cards, 3 distribution charts (Severity, Status, Category), a grouped bar chart comparing Inherent vs. Residual risk across treated items, and dynamic portfolio insight cards.

---

## 5. Technology Stack

### Frontend
- **Framework**: React 19 (JavaScript SPA)
- **Tooling & Bundler**: Vite 8
- **Data Visualization**: Recharts (Donut charts, grouped bar charts, category distributions)
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS with curated navy/blue banking design tokens and responsive breakpoints

### Backend
- **Framework**: Python 3 (Flask REST API)
- **CORS Support**: Flask-CORS
- **Database**: SQLite 3 (Lightweight, single-file relational database)
- **Architecture**: Modular RESTful API with isolated test configuration support

---

## 6. Project Architecture

BankShield employs a decoupled, client-server REST architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (React)                        │
│   Vite Dev Server (Port 5173) / Static Production Build     │
│   - Dashboard           - Mitigation Tracker                │
│   - Risk Register       - Security Events Log               │
│   - 5x5 Risk Matrix     - Portfolio Analytics               │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON over HTTP (REST)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Server (Flask)                   │
│   Python REST API (Port 5000)                               │
│   - /api/dashboard       - /api/risks/<id>/mitigate         │
│   - /api/risks           - /api/events                      │
│   - /api/events/simulate - /api/events/<id>/convert-to-risk │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLite DB Driver
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Relational Database (SQLite)               │
│   bankshield.db                                             │
│   - risks (Inherent & Residual Risk Attributes)             │
│   - security_events (Simulated Telemetry & Linkages)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Risk Lifecycle Workflow

Every risk in BankShield transitions through a controlled, auditable lifecycle:

```
[Security Event Simulated]
         │
         ▼
[Triage: Detected ──> Under Review]
         │
         ▼
[Convert to Risk Form] ──> (Validates Title, Category, L, I, Control, Owner)
         │
         ▼
[Risk Register] (Status: Open, Bidirectional Link with Event Established)
         │
         ▼
[5x5 Risk Matrix & Portfolio Analytics] (Dynamically Updated)
         │
         ▼
[Mitigation Tracker] (Open Risk Card)
         │
         ▼
[Residual Risk Assessment] (Select Residual L: 1–5, Residual I: 1–5)
         │
         ▼ (Rule: Residual Score <= Inherent Score)
[Status: Mitigated] (Residual Score & % Reduction Persisted Permanently)
```

---

## 8. Risk Scoring Methodology

BankShield strictly implements the standard deterministic risk scoring formula:

$$\mathbf{Risk\ Score} = \mathbf{Likelihood} \times \mathbf{Impact}$$

Where both dimensions are discrete integer ratings from $1$ to $5$:
- **Likelihood ($1\text{–}5$)**: $1$ = Rare, $2$ = Unlikely, $3$ = Moderate, $4$ = Likely, $5$ = Almost Certain
- **Impact ($1\text{–}5$)**: $1$ = Negligible, $2$ = Minor, $3$ = Moderate, $4$ = Major, $5$ = Catastrophic

### Severity Threshold Bands

| Score Range | Severity Level | Risk Level Description | Typical Action Required |
|:---:|:---:|:---:|---|
| **$1 \le \text{Score} \le 4$** | **Low** | Minimal financial or operational impact | Accept or manage via standard operating procedures |
| **$5 \le \text{Score} \le 9$** | **Medium** | Moderate operational disruption | Implement baseline security controls within 60 days |
| **$10 \le \text{Score} \le 16$** | **High** | Significant data loss or compliance violation | Prioritized technical mitigation within 14 days |
| **$17 \le \text{Score} \le 25$** | **Critical** | Catastrophic outage, theft, or regulatory freeze | Immediate executive escalation and dual-control safeguards |

All scoring logic is enforced server-side; client submissions cannot alter or inject scores.

---

## 9. Inherent vs. Residual Risk & Reduction Formula

- **Inherent Risk**: The assessed risk exposure *prior* to the implementation or enforcement of specialized security controls.
- **Residual Risk**: The remaining risk exposure *after* mitigation controls have been successfully deployed and verified.

$$\mathbf{Residual\ Score} = \mathbf{Residual\ Likelihood} \times \mathbf{Residual\ Impact}$$

### Quantitative Risk Reduction Percentage

BankShield computes the quantitative risk reduction achieved by security treatments using:

$$\mathbf{Risk\ Reduction\ \%} = \left( \frac{\mathbf{Inherent\ Score} - \mathbf{Residual\ Score}}{\mathbf{Inherent\ Score}} \right) \times 100$$

### Logical Consistency Constraint
Security treatments must reduce or maintain risk level. BankShield strictly enforces:

$$\mathbf{Residual\ Score} \le \mathbf{Inherent\ Score}$$

Submissions where residual exposure exceeds inherent exposure are rejected with an explicit HTTP 400 validation error.

---

## 10. Security Event Simulation & Referential Integrity

The **Security Events** module provides a controlled telemetry simulation for academic demonstration:
- **Event Types**: Suspicious Login, Phishing Attempt, Transaction Anomaly, Brute Force, API Abuse.
- **Triage Statuses**: `Detected` $\rightarrow$ `Under Review` $\rightarrow$ `Converted to Risk` or `Closed`.
- **Referential Integrity**: When an event is converted to a risk:
  - The risk stores `source_event_id = event.id`.
  - The event stores `linked_risk_id = risk.id` and status `Converted to Risk`.
  - Converted events are locked to prevent duplicate conversions or accidental reset.
  - Risks linked to security events cannot be directly deleted via the risk register, preserving audit compliance.

---

## 11. Folder Structure

```
BankShield/
├── backend/
│   ├── app.py                      # Flask REST API, validation rules & route controllers
│   ├── database.py                 # SQLite schema initialization & connection factory
│   ├── risk_engine.py              # Pure risk scoring & reduction mathematical helper functions
│   ├── test_backend.py             # 14 automated unit/integration tests (isolated environment)
│   ├── bankshield.db               # Active academic demonstration SQLite database
│   ├── requirements.txt            # Minimal Python dependencies (Flask, Flask-CORS)
│   ├── .env.example                # Backend environment configuration template
│   └── venv/                       # Python virtual environment (ignored in git)
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main React component (Navigation, Pages, State, Modals)
│   │   ├── App.css                 # Custom CSS stylesheet & responsive layouts
│   │   ├── main.jsx                # React DOM entrypoint
│   │   └── index.css               # Base CSS reset
│   ├── public/                     # Static assets & icons
│   ├── index.html                  # HTML5 application shell
│   ├── package.json                # Frontend dependencies & scripts
│   ├── vite.config.js              # Vite configuration
│   └── dist/                       # Production build output (generated via npm run build)
├── docs/                           # Documentation assets
├── .gitignore                      # Git exclusion rules preserving demo database
├── start_bankshield.bat            # Windows convenience launcher script
└── README.md                       # Comprehensive project documentation
```

---

## 12. Installation Prerequisites

To run BankShield on any Windows machine, ensure the following are installed:
1. **Python 3.10+**: Download from [python.org](https://www.python.org/) *(ensure "Add Python to PATH" is checked during setup)*.
2. **Node.js 18+ & npm**: Download LTS from [nodejs.org](https://nodejs.org/).
3. **Git** *(optional, for cloning)*.

---

## 13. Step-by-Step Setup Guide

### Step 1: Backend Setup
Open a terminal (PowerShell or Command Prompt) and navigate to the `backend/` folder:

```powershell
cd c:\Users\Admin\Desktop\BankShield\backend
```

Create and activate a Python virtual environment:
```powershell
python -m venv venv
.\venv\Scripts\activate
```

Install backend dependencies:
```powershell
pip install -r requirements.txt
```

### Step 2: Frontend Setup
Open a second terminal and navigate to the `frontend/` folder:

```powershell
cd c:\Users\Admin\Desktop\BankShield\frontend
```

Install frontend packages:
```powershell
npm install
```

---

## 14. How to Run BankShield

### Method A: One-Click Windows Launcher (Recommended)
Double-click `start_bankshield.bat` in the root folder, or run in terminal:

```cmd
start_bankshield.bat
```

This launches both services in separate, dedicated command windows:
- **Backend**: Listening on `http://127.0.0.1:5000`
- **Frontend**: Listening on `http://localhost:5173`

### Method B: Manual Service Startup

**Terminal 1 — Backend:**
```powershell
cd c:\Users\Admin\Desktop\BankShield\backend
.\venv\Scripts\activate
python app.py
```

**Terminal 2 — Frontend:**
```powershell
cd c:\Users\Admin\Desktop\BankShield\frontend
npm run dev
```

Open your browser to: **`http://localhost:5173`**

---

## 15. REST API Specification

| Endpoint | Method | Parameters / Body | Description |
|---|---|---|---|
| `/api/dashboard` | `GET` | None | Returns summary totals: total, open, mitigated, critical, high, medium, low risks. |
| `/api/risks` | `GET` | None | Returns all risk register records sorted by ID descending. |
| `/api/risks/<id>` | `GET` | `id` (int) | Fetches a single risk record by ID. Returns 404 if not found. |
| `/api/risks` | `POST` | `title`, `category`, `description`, `likelihood`, `impact`, `mitigation`, `owner` | Validates inputs, calculates score and severity server-side, and persists new risk. |
| `/api/risks/<id>` | `PUT` | `mitigation`, `owner`, `status` | Updates mitigation control notes or owner for a risk. |
| `/api/risks/<id>/mitigate` | `POST` | `residual_likelihood`, `residual_impact`, `mitigation_notes` | Enforces $\text{Residual} \le \text{Inherent}$, calculates residual score/severity, and marks status as `Mitigated`. |
| `/api/risks/<id>` | `DELETE` | `id` (int) | Deletes risk. If risk is linked to an event (`EVT-XXX`), request is blocked with HTTP 400. |
| `/api/events` | `GET` | Optional query params: `status`, `severity` | Returns security events list with optional status and severity filtering. |
| `/api/events/<id>` | `GET` | `id` (int) | Fetches a single security event record. |
| `/api/events/simulate` | `POST` | `event_type`, `severity` | Generates a new simulated security telemetry event and saves to SQLite. |
| `/api/events/<id>/status` | `PATCH` | `status` (`Under Review`, `Closed`) | Triages an event status. Rejects resetting converted events. |
| `/api/events/<id>/convert-to-risk` | `POST` | Risk attributes (`title`, `category`, etc.) | Converts event to risk, establishes bidirectional foreign keys, and locks event status. |

---

## 16. Automated Backend Testing

BankShield includes an automated test suite ([backend/test_backend.py](backend/test_backend.py)) containing 14 unit and integration tests.

**Important**: The test suite runs against an isolated temporary database (`test_bankshield_isolated.db`) and **never touches or alters the demonstration database (`bankshield.db`)**.

To execute the test suite:
```powershell
cd c:\Users\Admin\Desktop\BankShield\backend
.\venv\Scripts\python.exe test_backend.py
```

Expected output:
```
..............
----------------------------------------------------------------------
Ran 14 tests in 0.267s

OK
```

To verify the frontend production build:
```powershell
cd c:\Users\Admin\Desktop\BankShield\frontend
npm run build
```

---

## 17. Demonstration Dataset Overview

The included `bankshield.db` comes pre-populated with realistic, cohesive banking risk records:

- **Total Risks**: 10
  - **Open Risks (6)**: Active operational, compliance, third-party, and cyber risks.
  - **Mitigated Risks (4)**: Risks with permanent residual risk assessments and calculated risk reduction percentages.
- **Total Security Events**: 21
  - **19 Events**: Telemetry audit log items in `Detected` status across various severities.
  - **2 Converted Events**: Linked bidirectionally to formal enterprise risks.

### Special Demonstration Records:

1. **Live Mitigation Candidate — `R-010`**:
   - **Title**: *Excessive API Request Rate & Service Abuse Exposure*
   - **Category**: *Cybersecurity* | **Status**: **`Open`**
   - **Inherent Risk**: Likelihood = 4, Impact = 3 $\rightarrow$ **Score = 12 (High)**
   - **Linked Event**: `EVT-021` (*API Abuse*)
   - **Purpose for Demo**: Reserved in **Open** status with unpopulated residual fields so the presenter can live-demonstrate entering residual values (e.g. Likelihood = 2, Impact = 2 $\rightarrow$ Residual Score = 4, Low, **66.67% Risk Reduction**).

2. **Completed Lifecycle Showcase — `R-014`**:
   - **Title**: *International Transaction Velocity Fraud*
   - **Category**: *Operational* | **Status**: **`Mitigated`**
   - **Inherent Risk**: Likelihood = 5, Impact = 5 $\rightarrow$ **Score = 25 (Critical)**
   - **Residual Risk**: Residual Likelihood = 2, Residual Impact = 3 $\rightarrow$ **Score = 6 (Medium)**
   - **Risk Reduction**: **76.0%**
   - **Linked Event**: `EVT-025` (*Transaction Anomaly*)
   - **Purpose for Demo**: Serves as a pre-completed, polished exemplar showing how a critical transaction anomaly was remediated through behavioral fraud scoring and dual authorization.

---

## 18. Academic Limitations & Scope Boundaries

For the purpose of academic integrity, the following architectural boundaries are explicitly noted:
- **Simulation Environment**: Security events are generated through a controlled software simulation engine to demonstrate workflow triage; the system is not connected to a live core banking mainframe, payment rails (SWIFT/SEPA), or production SIEM/SOAR appliances.
- **Data Protection**: All risk and event data is synthetic; no real banking customer Personally Identifiable Information (PII) or account balances are collected, stored, or processed.
- **Storage Scope**: The system utilizes a single-node SQLite database optimized for local demonstration and evaluation. High-throughput distributed clustering is outside the project scope.
- **Descriptive Analytics**: Analytics charts reflect deterministic, descriptive calculations directly derived from active database records. No black-box machine learning models or predictive claims are used.

---

## 19. Future Scope

Future extensions for potential graduate study or commercialization include:
1. **Role-Based Access Control (RBAC)**: Segregating permissions between Security Analysts (triage), Risk Managers (assessment), and Internal Audit (sign-off).
2. **SIEM / Webhook Ingestion**: Ingesting real-world Syslog or CEF alerts from external firewalls or API gateways.
3. **Multi-Regulation Compliance Mapping**: Automatically tagging risks to specific sections of PCI-DSS 4.0, GDPR Article 32, and DORA (Digital Operational Resilience Act).
4. **Automated Audit Export**: Generating PDF/Excel audit reports conforming to standard financial regulatory examination templates.
