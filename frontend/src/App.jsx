import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  LayoutDashboard,
  TriangleAlert,
  Shield,
  Activity,
  BarChart3,
  Plus,
  Trash2,
  CheckCircle,
  Landmark,
  Menu,
  X,
  Layers,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./App.css";

const API = "https://bankshield-api-jbvu.onrender.com/api";

function App() {
  const [page, setPage] = useState("dashboard");
  const [risks, setRisks] = useState([]);
  const [events, setEvents] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [convertingEvent, setConvertingEvent] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    category: "Cybersecurity",
    description: "",
    likelihood: 3,
    impact: 3,
    mitigation: "",
    owner: "",
  });

  const fetchData = async () => {
    try {
      const [riskRes, dashRes, eventRes] = await Promise.all([
        axios.get(`${API}/risks`),
        axios.get(`${API}/dashboard`),
        axios.get(`${API}/events`),
      ]);

      setRisks(riskRes.data);
      setDashboard(dashRes.data);
      setEvents(eventRes.data);
      setApiError(null);
    } catch (error) {
      console.error("Unable to connect to BankShield backend.", error);
      setApiError(
        "Backend Connection Error: Unable to reach BankShield API server at http://127.0.0.1:5000. Please ensure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addRisk = async (e) => {
    e.preventDefault();

    if (!form.title || !form.title.trim()) {
      alert("Risk title is required.");
      return;
    }
    if (!form.description || !form.description.trim()) {
      alert("Description is required.");
      return;
    }
    if (!form.mitigation || !form.mitigation.trim()) {
      alert("Mitigation control is required.");
      return;
    }
    if (!form.owner || !form.owner.trim()) {
      alert("Risk owner is required.");
      return;
    }

    try {
      await axios.post(`${API}/risks`, {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        mitigation: form.mitigation.trim(),
        owner: form.owner.trim(),
        likelihood: Number(form.likelihood),
        impact: Number(form.impact),
      });

      setForm({
        title: "",
        category: "Cybersecurity",
        description: "",
        likelihood: 3,
        impact: 3,
        mitigation: "",
        owner: "",
      });

      setShowAddRisk(false);
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.error || "Unable to add risk.");
    }
  };

  const deleteRisk = async (id) => {
    if (!window.confirm("Delete this risk from the register?")) return;

    try {
      await axios.delete(`${API}/risks/${id}`);
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.error || "Unable to delete risk.");
    }
  };

  const markMitigated = async (risk) => {
    await axios.put(`${API}/risks/${risk.id}`, {
      mitigation: risk.mitigation,
      owner: risk.owner,
      status: "Mitigated",
    });

    await fetchData();
  };

  const applyMitigation = async (riskId, residualLikelihood, residualImpact) => {
    await axios.post(`${API}/risks/${riskId}/mitigate`, {
      residual_likelihood: residualLikelihood,
      residual_impact: residualImpact,
    });

    await fetchData();
  };

  const simulateEvent = async (type, severity) => {
    await axios.post(`${API}/events/simulate`, {
      event_type: type,
      severity,
    });

    await fetchData();
  };

  const updateEventStatus = async (eventId, newStatus) => {
    try {
      await axios.patch(`${API}/events/${eventId}/status`, {
        status: newStatus,
      });
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.error || "Unable to update event status.");
    }
  };

  const navItems = [
    ["dashboard", LayoutDashboard, "Dashboard"],
    ["risks", TriangleAlert, "Risk Register"],
    ["matrix", Shield, "Risk Matrix"],
    ["mitigation", CheckCircle, "Mitigation Tracker"],
    ["events", Activity, "Security Events"],
    ["analytics", BarChart3, "Analytics"],
  ];

  return (
    <div className="app">
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <div
          className="brand brand-home"
          role="button"
          tabIndex={0}
          aria-label="Return to BankShield dashboard"
          onClick={() => { setPage("dashboard"); setMobileMenu(false); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setPage("dashboard"); setMobileMenu(false); } }}
        >
          <div className="brand-icon">
            <ShieldCheck size={27} />
          </div>

          <div>
            <h2>BankShield</h2>
            <span>Risk Management</span>
          </div>

          <button
            className="close-menu"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <p className="menu-label">MANAGEMENT CONSOLE</p>

        <nav>
          {navItems.map(([id, Icon, label]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => {
                setPage(id);
                setMobileMenu(false);
              }}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <ShieldCheck size={18} />
          <div>
            <strong>System Status</strong>
            <span>All systems operational</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header>
          <div className="header-left">
            <button
              className="mobile-menu"
              onClick={() => setMobileMenu(true)}
            >
              <Menu />
            </button>

            <div>
              <h1>
                {navItems.find((item) => item[0] === page)?.[2]}
              </h1>
              <p>Online Banking Risk Identification & Mitigation Framework</p>
            </div>
          </div>

          <div className="system-health" title="BankShield API and risk engine status">
            <span className={`health-dot ${apiError ? "offline" : ""}`}></span>
            <div>
              <strong>{apiError ? "API DISCONNECTED" : "SYSTEM SECURE"}</strong>
              <span>{apiError ? "Backend unavailable" : "API connected · Risk engine online"}</span>
            </div>
            <ShieldCheck size={18} />
          </div>
        </header>

        <section className="content">
          {apiError && (
            <div className="api-error-banner">
              <div className="api-error-content">
                <TriangleAlert size={18} />
                <span>{apiError}</span>
              </div>
              <button className="secondary retry-btn" onClick={fetchData}>
                Retry Connection
              </button>
            </div>
          )}

          {page === "dashboard" && (
            <Dashboard
              dashboard={dashboard}
              risks={risks}
              setPage={setPage}
              setShowAddRisk={setShowAddRisk}
            />
          )}

          {page === "risks" && (
            <RiskRegister
              risks={risks}
              deleteRisk={deleteRisk}
              setShowAddRisk={setShowAddRisk}
            />
          )}

          {page === "matrix" && <RiskMatrix risks={risks} />}

          {page === "mitigation" && (
            <Mitigation
              risks={risks}
              markMitigated={markMitigated}
              applyMitigation={applyMitigation}
            />
          )}

          {page === "events" && (
            <SecurityEvents
              events={events}
              simulateEvent={simulateEvent}
              onOpenConvertModal={(event) => setConvertingEvent(event)}
              updateEventStatus={updateEventStatus}
              setPage={setPage}
            />
          )}

          {page === "analytics" && (
            <Analytics dashboard={dashboard} risks={risks} />
          )}
        </section>
      </main>

      {showAddRisk && (
        <AddRiskModal
          form={form}
          setForm={setForm}
          addRisk={addRisk}
          close={() => setShowAddRisk(false)}
        />
      )}

      {convertingEvent && (
        <ConvertEventModal
          event={convertingEvent}
          close={() => setConvertingEvent(null)}
          onConverted={async () => {
            await fetchData();
            setConvertingEvent(null);
          }}
          setPage={setPage}
        />
      )}
    </div>
  );
}

function Dashboard({ dashboard, risks, setPage, setShowAddRisk }) {
  const cards = [
    ["Total Risks", dashboard.totalRisks || 0, "All identified risks"],
    ["Critical", dashboard.criticalRisks || 0, "Immediate action required"],
    ["Open Risks", dashboard.openRisks || 0, "Currently under review"],
    ["Mitigated", dashboard.mitigatedRisks || 0, "Controls implemented"],
  ];

  return (
    <>
      <div className="hero">
        <div className="hero-copy">
          <div className="live-kicker"><span></span> LIVE RISK MONITORING</div>
          <span className="eyebrow">BANKSHIELD CONTROL CENTRE</span>
          <h2>Banking Risk Overview</h2>
          <p>
            Identify, assess and mitigate cybersecurity, operational and
            compliance risks affecting digital banking infrastructure.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => setShowAddRisk(true)}>
              <Plus size={18} /> Identify New Risk
            </button>
            <button className="hero-secondary" onClick={() => setPage("matrix")}>
              <Shield size={17} /> View Risk Matrix
            </button>
          </div>
        </div>
        <div className="posture-card">
          <div className="posture-head"><span>PORTFOLIO CONTROL STATUS</span><ShieldCheck size={17}/></div>
          <div className="posture-score">{dashboard.totalRisks ? Math.round(((dashboard.mitigatedRisks || 0) / dashboard.totalRisks) * 100) : 0}<small>%</small></div>
          <div className="posture-label">risks treated</div>
          <div className="posture-track"><span style={{width: `${dashboard.totalRisks ? Math.round(((dashboard.mitigatedRisks || 0) / dashboard.totalRisks) * 100) : 0}%`}}></span></div>
          <div className="posture-meta"><span>{dashboard.mitigatedRisks || 0} mitigated</span><span>{dashboard.openRisks || 0} active</span></div>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map(([name, value, text]) => (
          <div className="stat-card" key={name}>
            <span>{name}</span>
            <strong>{value}</strong>
            <small>{text}</small>
          </div>
        ))}
      </div>

      <div className="two-column">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Risks</h3>
              <p>Latest entries in the banking risk register</p>
            </div>

            <button className="text-btn" onClick={() => setPage("risks")}>
              View register →
            </button>
          </div>

          {risks.length === 0 ? (
            <Empty text="No risks identified yet. Add your first banking risk." />
          ) : (
            <div className="risk-list">
              {risks.slice(0, 5).map((risk) => (
                <div className="risk-row" key={risk.id}>
                  <div>
                    <strong>{risk.title}</strong>
                    <span>{risk.category}</span>
                  </div>

                  <div className={`badge ${risk.level.toLowerCase()}`}>
                    {risk.level} · {risk.score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Risk Distribution</h3>
          <p>Current exposure by severity</p>

          <RiskPie dashboard={dashboard} />
        </div>
      </div>
    </>
  );
}

function RiskRegister({ risks, deleteRisk, setShowAddRisk }) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <h2>Enterprise Risk Register</h2>
          <p>
            Central register for identified online banking risks and controls.
          </p>
        </div>

        <button className="primary" onClick={() => setShowAddRisk(true)}>
          <Plus size={18} /> Add Risk
        </button>
      </div>

      {risks.length === 0 ? (
        <Empty text="The risk register is currently empty." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Risk</th>
                <th>Category</th>
                <th>L</th>
                <th>I</th>
                <th>Score</th>
                <th>Severity</th>
                <th>Residual</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {risks.map((risk) => (
                <tr key={risk.id}>
                  <td>R-{String(risk.id).padStart(3, "0")}</td>

                  <td>
                    <strong>{risk.title}</strong>
                    <small>{risk.description}</small>
                    {risk.source_event_id && (
                      <span className="source-event-tag">
                        Source: EVT-{String(risk.source_event_id).padStart(3, "0")}
                      </span>
                    )}
                  </td>

                  <td>{risk.category}</td>
                  <td>{risk.likelihood}</td>
                  <td>{risk.impact}</td>
                  <td><strong>{risk.score}</strong></td>

                  <td>
                    <span className={`badge ${risk.level.toLowerCase()}`}>
                      {risk.level}
                    </span>
                  </td>

                  <td>
                    {risk.residual_score !== null && risk.residual_score !== undefined ? (
                      <span className={`badge ${risk.residual_severity ? risk.residual_severity.toLowerCase() : "low"}`}>
                        {risk.residual_score} · {risk.residual_severity}
                      </span>
                    ) : (
                      <span style={{ color: "#98a2b3" }}>—</span>
                    )}
                  </td>

                  <td>
                    <span className="status">{risk.status}</span>
                  </td>

                  <td>
                    <button
                      className="icon-btn"
                      onClick={() => deleteRisk(risk.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RiskMatrix({ risks }) {
  const rows = [];

  for (let impact = 5; impact >= 1; impact--) {
    const rowCells = [];
    for (let likelihood = 1; likelihood <= 5; likelihood++) {
      const score = impact * likelihood;

      const level =
        score <= 4
          ? "low"
          : score <= 9
            ? "medium"
            : score <= 16
              ? "high"
              : "critical";

      const count = risks.filter(
        (risk) =>
          risk.impact === impact &&
          risk.likelihood === likelihood
      ).length;

      rowCells.push(
        <div className={`matrix-cell ${level}`} key={`${impact}-${likelihood}`}>
          <strong>{score}</strong>
          {count > 0 && <span className="cell-count">{count} risk{count > 1 ? "s" : ""}</span>}
        </div>
      );
    }

    rows.push(
      <div className="matrix-row" key={`row-${impact}`}>
        <div className="matrix-row-impact-label">
          <span>{impact}</span>
        </div>
        <div className="matrix-row-cells">{rowCells}</div>
      </div>
    );
  }

  return (
    <div className="panel matrix-panel">
      <div className="panel-heading">
        <div>
          <h2>5 × 5 Risk Assessment Matrix</h2>
          <p>
            Inherent Risk Scoring: Risk Score = Likelihood × Impact (Horizontal Likelihood: 1–5, Vertical Impact: 1–5)
          </p>
        </div>
        <div className="matrix-badge">
          {risks.length} Risks Mapped
        </div>
      </div>

      <div className="matrix-wrapper">
        <div className="matrix-vertical-axis">
          <span className="axis-title">▲ IMPACT (5 to 1)</span>
        </div>

        <div className="matrix-grid-container">
          <div className="matrix-rows-wrap">{rows}</div>

          <div className="matrix-col-labels-row">
            <div className="col-label-spacer"></div>
            <div className="col-labels-grid">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="matrix-col-label">
                  <span>{num}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="matrix-horizontal-axis">
            <span className="axis-title">LIKELIHOOD (1 to 5) ►</span>
          </div>
        </div>
      </div>

      <div className="legend">
        <span className="badge low">Low 1–4</span>
        <span className="badge medium">Medium 5–9</span>
        <span className="badge high">High 10–16</span>
        <span className="badge critical">Critical 17–25</span>
      </div>
    </div>
  );
}

function Mitigation({ risks, markMitigated, applyMitigation }) {
  return (
    <div className="panel">
      <h2>Risk Mitigation Tracker</h2>
      <p>
        Track implemented controls and residual treatment status.
      </p>

      {risks.length === 0 ? (
        <Empty text="Add risks before tracking mitigation controls." />
      ) : (
        <div className="mitigation-grid">
          {risks.map((risk) => (
            <MitigationCard
              key={risk.id}
              risk={risk}
              markMitigated={markMitigated}
              applyMitigation={applyMitigation}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MitigationCard({ risk, applyMitigation, markMitigated }) {
  const [residualLikelihood, setResidualLikelihood] = useState(
    risk.residual_likelihood || Math.max(1, Math.min(5, Math.ceil(risk.likelihood / 2)))
  );
  const [residualImpact, setResidualImpact] = useState(
    risk.residual_impact || Math.max(1, Math.min(5, Math.ceil(risk.impact / 2)))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const calculatedResidualScore = Number(residualLikelihood) * Number(residualImpact);
  const getSeverity = (score) => {
    if (score <= 4) return "Low";
    if (score <= 9) return "Medium";
    if (score <= 16) return "High";
    return "Critical";
  };
  const calculatedResidualSeverity = getSeverity(calculatedResidualScore);

  const handleApplyMitigation = async () => {
    setErrorMsg("");
    const l = Number(residualLikelihood);
    const i = Number(residualImpact);

    if (!l || l < 1 || l > 5 || !i || i < 1 || i > 5) {
      setErrorMsg("Both Residual Likelihood and Residual Impact must be integers between 1 and 5.");
      return;
    }

    if (l * i > risk.score) {
      setErrorMsg(
        `Residual risk score (${l * i}) cannot exceed inherent risk score (${risk.score}). Mitigation controls must reduce or maintain risk level.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await applyMitigation(risk.id, l, i);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to apply mitigation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMitigated = risk.status === "Mitigated";

  // Calculate risk reduction for mitigated risks:
  // risk_reduction = ((inherent_score - residual_score) / inherent_score) * 100
  let riskReduction = 0;
  if (isMitigated && risk.residual_score !== null && risk.residual_score !== undefined) {
    riskReduction = ((risk.score - risk.residual_score) / risk.score) * 100;
  }
  const reductionFormatted = Number.isInteger(riskReduction)
    ? riskReduction
    : parseFloat(riskReduction.toFixed(1));

  return (
    <div className={`mitigation-card ${isMitigated ? "is-mitigated" : "is-open"}`}>
      <div className="card-top">
        <span className={`badge ${risk.level.toLowerCase()}`}>
          {risk.level}
        </span>

        <span className={`status ${isMitigated ? "mitigated-status" : "open-status"}`}>
          {risk.status}
        </span>
      </div>

      <h3>{risk.title}</h3>
      <small>{risk.category}</small>

      {/* Clearly visible Risk Assessment section on every card:
          Inherent Risk
          Likelihood: X | Impact: X | Score: XX | Severity: XXX */}
      <div className="risk-assessment-section">
        <div className="assessment-label">Inherent Risk</div>
        <div className="assessment-details">
          Likelihood: <strong>{risk.likelihood}</strong> | Impact: <strong>{risk.impact}</strong> | Score: <strong>{risk.score}</strong> | Severity: <strong>{risk.level}</strong>
        </div>
      </div>

      <div className="control-box">
        <label>MITIGATION CONTROL</label>
        <p>{risk.mitigation || "Mitigation plan pending."}</p>
      </div>

      <div className="owner">
        <span>Risk Owner</span>
        <strong>{risk.owner || "Not assigned"}</strong>
      </div>

      {/* For OPEN risks, below the mitigation control and risk owner, add:
          Residual Risk Assessment
          Residual Likelihood: dropdown 1–5
          Residual Impact: dropdown 1–5
          Calculated Residual Score: XX
          Calculated Residual Severity: XXX
          [Apply Mitigation] */}
      {!isMitigated && (
        <div className="residual-risk-box">
          <div className="residual-title">
            <ShieldCheck size={16} />
            <span>Residual Risk Assessment</span>
          </div>

          <div className="residual-controls-grid">
            <div className="residual-field">
              <label htmlFor={`res-l-${risk.id}`}>Residual Likelihood:</label>
              <select
                id={`res-l-${risk.id}`}
                value={residualLikelihood}
                onChange={(e) => setResidualLikelihood(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="residual-field">
              <label htmlFor={`res-i-${risk.id}`}>Residual Impact:</label>
              <select
                id={`res-i-${risk.id}`}
                value={residualImpact}
                onChange={(e) => setResidualImpact(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="residual-metrics-display">
            <div className="residual-metric-row">
              <span>Calculated Residual Score:</span>
              <strong>{calculatedResidualScore}</strong>
            </div>
            <div className="residual-metric-row">
              <span>Calculated Residual Severity:</span>
              <span className={`badge ${calculatedResidualSeverity.toLowerCase()}`}>
                {calculatedResidualSeverity}
              </span>
            </div>
          </div>

          {errorMsg && <div className="error-alert">{errorMsg}</div>}

          {calculatedResidualScore > risk.score && (
            <div className="warning-alert">
              Residual score ({calculatedResidualScore}) exceeds inherent score ({risk.score}). Mitigation controls should reduce or maintain risk level.
            </div>
          )}

          <button
            className="primary apply-mitigation-btn"
            onClick={handleApplyMitigation}
            disabled={isSubmitting || calculatedResidualScore > risk.score}
          >
            <CheckCircle size={16} />
            {isSubmitting ? "Applying..." : "Apply Mitigation"}
          </button>
        </div>
      )}

      {/* For MITIGATED risks, display:
          Inherent Risk: XX — Severity
          ↓
          Residual Risk: XX — Severity
          Risk Reduction: XX%
          Calculate:
          risk_reduction = ((inherent_score - residual_score) / inherent_score) * 100 */}
      {isMitigated && (
        <div className="mitigated-assessment-section">
          <div className="comparison-line">
            Inherent Risk: {risk.score} — {risk.level}
          </div>
          <div className="comparison-arrow">↓</div>
          <div className="comparison-line">
            Residual Risk: {risk.residual_score !== null && risk.residual_score !== undefined ? risk.residual_score : "—"} — {risk.residual_severity || "—"}
          </div>
          <div className="comparison-reduction">
            Risk Reduction: {risk.residual_score !== null && risk.residual_score !== undefined ? `${reductionFormatted}%` : "N/A"}
          </div>
        </div>
      )}
    </div>
  );
}

function SecurityEvents({
  events,
  simulateEvent,
  onOpenConvertModal,
  updateEventStatus,
  setPage,
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");

  const filteredEvents = events.filter((evt) => {
    const currentStatus = evt.status || "Detected";
    if (statusFilter !== "All" && currentStatus !== statusFilter) return false;
    if (severityFilter !== "All" && evt.severity !== severityFilter) return false;
    return true;
  });

  return (
    <>
      <div className="panel">
        <h2>Security Event Simulator</h2>
        <p>
          Generate controlled events to demonstrate banking security telemetry and triage them into formal enterprise risks.
        </p>

        <div className="event-buttons">
          <button onClick={() => simulateEvent("Suspicious Login", "Medium")}>
            Suspicious Login
          </button>

          <button onClick={() => simulateEvent("Phishing Attempt", "High")}>
            Phishing Attempt
          </button>

          <button onClick={() => simulateEvent("Transaction Anomaly", "High")}>
            Transaction Anomaly
          </button>

          <button onClick={() => simulateEvent("Brute Force", "Critical")}>
            Brute Force
          </button>

          <button onClick={() => simulateEvent("API Abuse", "Critical")}>
            API Abuse
          </button>
        </div>
      </div>

      <div className="panel event-log">
        <div className="panel-heading">
          <div>
            <h3>Security Event Log</h3>
            <p>Audit trail of simulated security telemetry and risk conversion status</p>
          </div>

          <div className="event-filter-controls">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Statuses ({events.length})</option>
              <option value="Detected">Detected ({events.filter((e) => (e.status || "Detected") === "Detected").length})</option>
              <option value="Under Review">Under Review ({events.filter((e) => e.status === "Under Review").length})</option>
              <option value="Converted to Risk">Converted to Risk ({events.filter((e) => e.status === "Converted to Risk" || Boolean(e.linked_risk_id)).length})</option>
              <option value="Closed">Closed ({events.filter((e) => e.status === "Closed").length})</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {(statusFilter !== "All" || severityFilter !== "All") && (
              <button
                className="text-btn clear-btn"
                onClick={() => {
                  setStatusFilter("All");
                  setSeverityFilter("All");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <Empty text="No security events match the selected filters." />
        ) : (
          filteredEvents.map((event) => {
            const isConverted = event.status === "Converted to Risk" || Boolean(event.linked_risk_id);
            const currentStatus = isConverted ? "Converted to Risk" : (event.status || "Detected");

            return (
              <div
                className={`event-item ${isConverted ? "event-converted" : ""}`}
                key={event.id}
              >
                <div className="event-icon-col">
                  <Activity size={20} />
                  <span className="event-id-tag">EVT-{String(event.id).padStart(3, "0")}</span>
                </div>

                <div className="event-info-col">
                  <div className="event-header-line">
                    <strong>{event.event_type}</strong>
                    <span className="event-time">{event.timestamp}</span>
                  </div>
                  <p>{event.description}</p>
                </div>

                <div className="event-badges-col">
                  <span className={`badge ${event.severity.toLowerCase()}`}>
                    {event.severity}
                  </span>

                  <span className={`status-pill ${currentStatus.toLowerCase().replace(/\s+/g, "-")}`}>
                    {currentStatus}
                  </span>
                </div>

                <div className="event-actions-col">
                  {isConverted ? (
                    <div
                      className="linked-risk-indicator"
                      onClick={() => setPage("risks")}
                      title="View linked risk in Enterprise Risk Register"
                    >
                      <Shield size={14} />
                      <span>Linked Risk: <strong>R-{String(event.linked_risk_id).padStart(3, "0")}</strong></span>
                    </div>
                  ) : (
                    <div className="event-action-buttons">
                      <button
                        className="create-risk-btn"
                        onClick={() => onOpenConvertModal(event)}
                        title="Assess and convert this event into an enterprise risk"
                      >
                        <Plus size={14} />
                        Create Risk
                      </button>

                      <select
                        className="quick-status-select"
                        value={currentStatus}
                        onChange={(e) => updateEventStatus(event.id, e.target.value)}
                        title="Triage event status"
                      >
                        <option value="Detected">Detected</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function ConvertEventModal({ event, close, onConverted, setPage }) {
  const getDefaultTitle = (type) => {
    const map = {
      "Suspicious Login": "Suspicious Authentication & Account Access Threat",
      "Phishing Attempt": "Credential Harvesting & Phishing Attack Exposure",
      "Transaction Anomaly": "High-Value Transaction Pattern & Processing Anomaly",
      "Brute Force Attack": "Automated Brute-Force Credential Stuffing Exposure",
      "Brute Force": "Automated Brute-Force Credential Stuffing Exposure",
      "API Abuse": "Excessive API Request Rate & Service Abuse Exposure",
    };
    return map[type] || `${type} Risk Exposure`;
  };

  const getDefaultCategory = (type) => {
    if (type.includes("Transaction")) return "Operational";
    if (type.includes("Compliance")) return "Compliance";
    return "Cybersecurity";
  };

  const getDefaultLikelihood = (severity) => {
    if (severity === "Critical") return 5;
    if (severity === "High") return 4;
    if (severity === "Medium") return 3;
    return 2;
  };

  const getDefaultImpact = (severity) => {
    if (severity === "Critical") return 5;
    if (severity === "High") return 4;
    if (severity === "Medium") return 3;
    return 2;
  };

  const getDefaultMitigation = (type) => {
    const map = {
      "Suspicious Login": "Enforce MFA, login rate limiting, IP geolocation anomaly detection, and session timeouts.",
      "Phishing Attempt": "Deploy domain reputation filtering, anti-phishing gateway controls, and user security training.",
      "Transaction Anomaly": "Implement real-time transaction scoring, stepped-up authorization, and manual fraud review.",
      "Brute Force Attack": "Enforce progressive account lockouts, CAPTCHA challenges, and IP throttling.",
      "Brute Force": "Enforce progressive account lockouts, CAPTCHA challenges, and IP throttling.",
      "API Abuse": "Apply strict API rate limiting, token authentication, and continuous gateway traffic inspection.",
    };
    return map[type] || "Implement detection baselines, access control reviews, and audit monitoring.";
  };

  const [form, setForm] = useState({
    title: getDefaultTitle(event.event_type),
    category: getDefaultCategory(event.event_type),
    description: event.description || "",
    likelihood: getDefaultLikelihood(event.severity),
    impact: getDefaultImpact(event.severity),
    mitigation: getDefaultMitigation(event.event_type),
    owner: event.event_type.includes("Transaction") ? "Banking Operations Team" : "Security Operations Team",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Preview score calculation using BankShield formula: Likelihood x Impact
  const score = Number(form.likelihood) * Number(form.impact);
  const severityLevel =
    score <= 4 ? "Low" : score <= 9 ? "Medium" : score <= 16 ? "High" : "Critical";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      await axios.post(`${API}/events/${event.id}/convert-to-risk`, {
        title: form.title,
        category: form.category,
        description: form.description,
        likelihood: Number(form.likelihood),
        impact: Number(form.impact),
        mitigation: form.mitigation,
        owner: form.owner,
      });

      await onConverted();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Unable to convert event to risk.");
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-title">
          <div>
            <h2>Assess & Convert Event to Risk</h2>
            <p>
              Formally register Security Event EVT-{String(event.id).padStart(3, "0")} in the BankShield Enterprise Risk Register.
            </p>
          </div>

          <button type="button" className="icon-btn" onClick={close}>
            <X />
          </button>
        </div>

        {/* Event context card */}
        <div className="event-source-banner">
          <div className="banner-top">
            <span className="banner-tag">SOURCE SECURITY EVENT</span>
            <span className={`badge ${event.severity.toLowerCase()}`}>
              {event.severity}
            </span>
          </div>
          <div className="banner-details">
            <strong>
              EVT-{String(event.id).padStart(3, "0")}: {event.event_type}
            </strong>
            <small>Detected: {event.timestamp}</small>
          </div>
        </div>

        {errorMsg && <div className="error-alert">{errorMsg}</div>}

        <label>
          Risk Title
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Credential Stuffing Attack"
          />
        </label>

        <label>
          Risk Category
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option>Cybersecurity</option>
            <option>Operational</option>
            <option>Compliance</option>
            <option>Third-Party</option>
            <option>Financial</option>
          </select>
        </label>

        <label>
          Description
          <textarea
            required
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the threat, vulnerability or potential impact..."
          />
        </label>

        <div className="form-row">
          <label>
            Likelihood (1–5)
            <select
              value={form.likelihood}
              onChange={(e) => update("likelihood", Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label>
            Impact (1–5)
            <select
              value={form.impact}
              onChange={(e) => update("impact", Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="score-preview">
          <span>Inherent Risk Evaluation:</span>
          <strong>
            {score} / 25 · <span className={`badge-inline ${severityLevel.toLowerCase()}`}>{severityLevel}</span>
          </strong>
        </div>

        <label>
          Mitigation Control
          <textarea
            value={form.mitigation}
            onChange={(e) => update("mitigation", e.target.value)}
            placeholder="e.g. Enforce MFA, rate limiting and anomaly detection"
          />
        </label>

        <label>
          Risk Owner
          <input
            value={form.owner}
            onChange={(e) => update("owner", e.target.value)}
            placeholder="e.g. Security Operations Team"
          />
        </label>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary"
            onClick={close}
            disabled={submitting}
          >
            Cancel
          </button>

          <button className="primary" disabled={submitting}>
            <ShieldCheck size={17} />
            {submitting ? "Registering..." : "Create Risk & Link Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Analytics({ dashboard, risks }) {
  const totalRisks = risks.length;
  const openRisks = risks.filter((r) => r.status === "Open").length;
  const mitigatedRisks = risks.filter((r) => r.status === "Mitigated").length;
  const avgInherentScore =
    totalRisks > 0
      ? (risks.reduce((sum, r) => sum + r.score, 0) / totalRisks).toFixed(1)
      : "0.0";

  // Category counts and cumulative inherent risk score
  const categoryMap = {};
  const categoryScoreMap = {};
  risks.forEach((risk) => {
    categoryMap[risk.category] = (categoryMap[risk.category] || 0) + 1;
    categoryScoreMap[risk.category] =
      (categoryScoreMap[risk.category] || 0) + risk.score;
  });
  const categoryData = Object.entries(categoryMap).map(([name, count]) => ({
    name,
    count,
    totalScore: categoryScoreMap[name] || 0,
  }));

  // Status Distribution (Open vs Mitigated)
  const statusData = [
    { name: "Open Risks", value: openRisks, color: "#f59e0b" },
    { name: "Mitigated Risks", value: mitigatedRisks, color: "#10b981" },
  ];

  // Severity Distribution
  const criticalCount =
    dashboard.criticalRisks !== undefined
      ? dashboard.criticalRisks
      : risks.filter((r) => r.level === "Critical").length;
  const highCount =
    dashboard.highRisks !== undefined
      ? dashboard.highRisks
      : risks.filter((r) => r.level === "High").length;
  const mediumCount =
    dashboard.mediumRisks !== undefined
      ? dashboard.mediumRisks
      : risks.filter((r) => r.level === "Medium").length;
  const lowCount =
    dashboard.lowRisks !== undefined
      ? dashboard.lowRisks
      : risks.filter((r) => r.level === "Low").length;

  const severityData = [
    { name: "Critical", value: criticalCount, color: "#ef4444" },
    { name: "High", value: highCount, color: "#f97316" },
    { name: "Medium", value: mediumCount, color: "#eab308" },
    { name: "Low", value: lowCount, color: "#22c55e" },
  ];

  // Inherent vs Residual Comparison for Mitigated Risks with Residual Values
  const mitigatedWithResidual = risks
    .filter(
      (r) =>
        r.status === "Mitigated" &&
        r.residual_score !== null &&
        r.residual_score !== undefined
    )
    .sort((a, b) => a.id - b.id);

  const comparisonData = mitigatedWithResidual.map((r) => {
    const reduction =
      r.score > 0
        ? Math.round(((r.score - r.residual_score) / r.score) * 100)
        : 0;
    return {
      id: `R-${String(r.id).padStart(3, "0")}`,
      title: r.title,
      inherentScore: r.score,
      residualScore: r.residual_score,
      reduction: reduction,
    };
  });

  // Dynamic Risk Insights (Descriptive calculations from current data)
  let highestCategory = "None";
  let maxCatScore = 0;
  let highestCatCount = 0;
  Object.entries(categoryScoreMap).forEach(([cat, score]) => {
    if (score > maxCatScore) {
      maxCatScore = score;
      highestCategory = cat;
      highestCatCount = categoryMap[cat] || 0;
    }
  });

  const criticalPct =
    totalRisks > 0 ? Math.round((criticalCount / totalRisks) * 100) : 0;
  const mitigationRate =
    totalRisks > 0 ? Math.round((mitigatedRisks / totalRisks) * 100) : 0;

  const totalReduction = comparisonData.reduce(
    (sum, item) => sum + item.reduction,
    0
  );
  const avgReduction =
    comparisonData.length > 0
      ? (totalReduction / comparisonData.length).toFixed(1)
      : "0.0";

  return (
    <div className="analytics-page">
      {/* 4 Compact Top KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="stat-card kpi-card">
          <div className="kpi-header">
            <span>Total Risks</span>
            <Layers size={18} className="kpi-icon text-blue" />
          </div>
          <strong>{totalRisks}</strong>
          <small>Identified digital banking risks</small>
        </div>

        <div className="stat-card kpi-card">
          <div className="kpi-header">
            <span>Open Risks</span>
            <AlertCircle size={18} className="kpi-icon text-amber" />
          </div>
          <strong className="text-amber">{openRisks}</strong>
          <small>
            {totalRisks > 0
              ? Math.round((openRisks / totalRisks) * 100)
              : 0}
            % active risks undergoing treatment
          </small>
        </div>

        <div className="stat-card kpi-card">
          <div className="kpi-header">
            <span>Mitigated Risks</span>
            <CheckCircle size={18} className="kpi-icon text-green" />
          </div>
          <strong className="text-green">{mitigatedRisks}</strong>
          <small>
            {mitigationRate}% treated with verified controls
          </small>
        </div>

        <div className="stat-card kpi-card">
          <div className="kpi-header">
            <span>Average Inherent Risk Score</span>
            <TrendingDown size={18} className="kpi-icon text-blue" />
          </div>
          <strong>
            {avgInherentScore} <span className="kpi-unit">/ 25</span>
          </strong>
          <small>Portfolio baseline exposure score</small>
        </div>
      </div>

      {/* Row 2: Trio of Analytical Distributions */}
      <div className="analytics-charts-trio">
        {/* Severity Distribution Donut */}
        <div className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h3>Severity Distribution</h3>
              <p>Inherent risk by criticality band</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {severityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Status Distribution: Open vs Mitigated */}
        <div className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h3>Risk Status Distribution</h3>
              <p>Active exposure vs implemented controls</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risks by Category Bar Chart */}
        <div className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h3>Risks by Category</h3>
              <p>Risk concentration by banking domain</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={categoryData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Risk Count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Inherent vs Residual Comparison & Descriptive Portfolio Insights */}
      <div className="analytics-grid-bottom">
        {/* Inherent vs Residual Risk Comparison */}
        <div className="panel comparison-panel">
          <div className="panel-heading">
            <div>
              <h3>Inherent vs. Residual Risk Comparison</h3>
              <p>Exposure reduction achieved across mitigated banking risks</p>
            </div>
            <span className="comparison-badge">
              {mitigatedWithResidual.length} Treated Risks Assessed
            </span>
          </div>

          {comparisonData.length === 0 ? (
            <Empty text="Mitigate risks to visualize inherent vs residual risk reduction." />
          ) : (
            <>
              <div className="chart-wrapper comparison-chart-wrapper">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={comparisonData}
                    margin={{ top: 15, right: 20, left: -10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="id" tick={{ fontSize: 12, fontWeight: 600 }} />
                    <YAxis domain={[0, 25]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} / 25`,
                        name === "inherentScore" ? "Inherent Risk" : "Residual Risk",
                      ]}
                      labelFormatter={(label) => {
                        const item = comparisonData.find((d) => d.id === label);
                        return item
                          ? `${item.id}: ${item.title} (${item.reduction}% reduction)`
                          : label;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="rect"
                      formatter={(val) =>
                        val === "inherentScore" ? "Inherent Risk" : "Residual Risk"
                      }
                    />
                    <Bar
                      dataKey="inherentScore"
                      name="inherentScore"
                      fill="#1e3a8a"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="residualScore"
                      name="residualScore"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="comparison-pills-row">
                {comparisonData.map((item) => (
                  <div key={item.id} className="comparison-pill">
                    <strong>{item.id}</strong>
                    <span>
                      {item.inherentScore} → {item.residualScore}
                    </span>
                    <span className="pill-pct">-{item.reduction}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Dynamic Descriptive Risk Insights */}
        <div className="panel insights-panel">
          <div className="panel-heading">
            <div>
              <h3>Risk Portfolio Insights</h3>
              <p>Descriptive metrics derived from the risk register</p>
            </div>
          </div>

          <div className="insights-list">
            <div className="insight-card">
              <div className="insight-icon-wrap bg-blue-subtle">
                <Layers size={18} className="text-blue" />
              </div>
              <div className="insight-content">
                <strong>Highest Inherent-Risk Category</strong>
                <p>
                  <strong>{highestCategory}</strong> carries highest exposure with {maxCatScore} cumulative risk points across {highestCatCount} risks.
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon-wrap bg-red-subtle">
                <AlertCircle size={18} className="text-red" />
              </div>
              <div className="insight-content">
                <strong>Critical Severity Exposure</strong>
                <p>
                  <strong>{criticalCount} Critical risks</strong> ({criticalPct}% of register) require ongoing board-level oversight.
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon-wrap bg-green-subtle">
                <CheckCircle size={18} className="text-green" />
              </div>
              <div className="insight-content">
                <strong>Mitigation Treatment Rate</strong>
                <p>
                  <strong>{mitigatedRisks} of {totalRisks} risks ({mitigationRate}%)</strong> have implemented controls with verified residual ratings.
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon-wrap bg-emerald-subtle">
                <TrendingDown size={18} className="text-green" />
              </div>
              <div className="insight-content">
                <strong>Average Control Reduction</strong>
                <p>
                  Mitigation controls achieve an average of <strong>{avgReduction}% risk reduction</strong> across assessed treatments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskPie({ dashboard }) {
  const data = [
    { name: "Critical", value: dashboard.criticalRisks || 0 },
    { name: "High", value: dashboard.highRisks || 0 },
    { name: "Medium", value: dashboard.mediumRisks || 0 },
    { name: "Low", value: dashboard.lowRisks || 0 },
  ];

  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

  if (!data.some((item) => item.value > 0)) {
    return <Empty text="Analytics will appear after risks are added." />;
  }

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index]} />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function AddRiskModal({ form, setForm, addRisk, close }) {
  const [modalError, setModalError] = useState("");

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const score = Number(form.likelihood) * Number(form.impact);
  const severityLevel =
    score <= 4 ? "Low" : score <= 9 ? "Medium" : score <= 16 ? "High" : "Critical";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.title.trim()) {
      setModalError("Risk title is required and cannot be empty.");
      return;
    }
    if (!form.description || !form.description.trim()) {
      setModalError("Description is required and cannot be empty.");
      return;
    }
    if (!form.mitigation || !form.mitigation.trim()) {
      setModalError("Mitigation control is required and cannot be empty.");
      return;
    }
    if (!form.owner || !form.owner.trim()) {
      setModalError("Risk owner is required and cannot be empty.");
      return;
    }
    setModalError("");
    addRisk(e);
  };

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-title">
          <div>
            <h2>Identify New Risk</h2>
            <p>Add a risk to the BankShield enterprise risk register.</p>
          </div>

          <button type="button" className="icon-btn" onClick={close}>
            <X />
          </button>
        </div>

        {modalError && <div className="error-alert">{modalError}</div>}

        <label>
          Risk Title
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Credential Stuffing Attack"
          />
        </label>

        <label>
          Risk Category
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option>Cybersecurity</option>
            <option>Operational</option>
            <option>Compliance</option>
            <option>Third-Party</option>
            <option>Financial</option>
          </select>
        </label>

        <label>
          Description
          <textarea
            required
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the threat, vulnerability or potential impact..."
          />
        </label>

        <div className="form-row">
          <label>
            Likelihood (1–5)
            <select
              value={form.likelihood}
              onChange={(e) => update("likelihood", e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>

          <label>
            Impact (1–5)
            <select
              value={form.impact}
              onChange={(e) => update("impact", e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="score-preview">
          <span>Calculated Risk Score:</span>
          <strong>
            {score} / 25 · <span className={`badge-inline ${severityLevel.toLowerCase()}`}>{severityLevel}</span>
          </strong>
        </div>

        <label>
          Mitigation Strategy
          <textarea
            required
            value={form.mitigation}
            onChange={(e) => update("mitigation", e.target.value)}
            placeholder="e.g. Enforce MFA, rate limiting and anomaly detection"
          />
        </label>

        <label>
          Risk Owner
          <input
            required
            value={form.owner}
            onChange={(e) => update("owner", e.target.value)}
            placeholder="e.g. Security Operations Team"
          />
        </label>

        <div className="modal-actions">
          <button type="button" className="secondary" onClick={close}>
            Cancel
          </button>

          <button className="primary">
            <ShieldCheck size={17} />
            Add to Risk Register
          </button>
        </div>
      </form>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="empty">
      <Shield size={30} />
      <p>{text}</p>
    </div>
  );
}

export default App;