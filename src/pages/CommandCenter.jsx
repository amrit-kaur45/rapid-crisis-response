import { useState, useEffect } from "react";
import { MOCK_INCIDENTS, MOCK_STAFF, MOCK_STATS, subscribeIncidents } from "../services/incidents";
import { summarizeIncidents } from "../services/gemini";

const SEV_COLOR = { CRITICAL: "#FF3B3B", HIGH: "#FF8C00", MEDIUM: "#FFB800", LOW: "#00D084" };
const SEV_BG    = { CRITICAL: "#FF3B3B18", HIGH: "#FF8C0018", MEDIUM: "#FFB80018", LOW: "#00D08418" };
const STATUS_COLOR = { ACTIVE: "#FF3B3B", RESPONDING: "#FFB800", MONITORING: "#3B82F6", RESOLVED: "#00D084" };

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "var(--text3)", fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
          <div style={{ color: color || "var(--text)", fontSize: 28, fontWeight: 800 }}>{value}</div>
          {sub && <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 4 }}>{sub}</div>}
        </div>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
    </div>
  );
}

export default function CommandCenter({ navigate }) {
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
  const [staff] = useState(MOCK_STAFF);
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeIncidents(setIncidents);
    return () => typeof unsub === "function" && unsub();
  }, []);

  const fetchSummary = async () => {
    setSummaryLoading(true);
    const active = incidents.filter(i => i.status !== "RESOLVED");
    const summary = await summarizeIncidents(active.map(i => ({ severity: i.severity, type: i.type, location: i.location, description: i.description })));
    setAiSummary(summary);
    setSummaryLoading(false);
  };

  const active = incidents.filter(i => i.status === "ACTIVE");
  const responding = incidents.filter(i => i.status === "RESPONDING");

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard icon="🚨" label="Active" value={active.length} color="#FF3B3B" />
        <StatCard icon="🚁" label="Responding" value={responding.length} color="#FFB800" />
        <StatCard icon="✅" label="Resolved Today" value={MOCK_STATS.resolved_today} color="#00D084" />
        <StatCard icon="⏱" label="Avg Response" value={MOCK_STATS.avg_response_time} />
        <StatCard icon="👥" label="Staff Deployed" value={MOCK_STATS.staff_deployed} />
        <StatCard icon="🏨" label="Guests Affected" value={MOCK_STATS.guests_affected} color="#FFB800" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Gemini AI Summary */}
          <div style={{ background: "var(--surface)", border: "1px solid #1A3A70", borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" width={18} height={18} alt="Gemini" onError={e => e.target.style.display = "none"} />
                <span style={{ color: "#4285F4", fontSize: 13, fontWeight: 700 }}>Gemini AI Situation Summary</span>
              </div>
              <button onClick={fetchSummary} disabled={summaryLoading}
                style={{ background: "#1A73E822", color: "#4285F4", border: "1px solid #1A73E844", borderRadius: 7, padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                {summaryLoading ? "Analyzing..." : "↻ Refresh"}
              </button>
            </div>
            {summaryLoading && <div style={{ color: "var(--text3)", fontSize: 13 }}>Gemini is analyzing all active incidents...</div>}
            {!summaryLoading && aiSummary && <div style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7 }}>{aiSummary}</div>}
            {!summaryLoading && !aiSummary && (
              <div style={{ color: "var(--text3)", fontSize: 13 }}>Click Refresh to get an AI-generated situational summary from Gemini.</div>
            )}
          </div>

          {/* Active Incidents */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Active Incidents</h2>
              <button onClick={() => navigate("sos")} style={{ background: "#FF3B3B", color: "#fff", border: "none", borderRadius: 7, padding: "7px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                + Report New
              </button>
            </div>

            {incidents.map(inc => (
              <div key={inc.id} className="animate-slide" style={{
                background: "var(--surface)", border: `1px solid ${SEV_COLOR[inc.severity]}44`,
                borderLeft: `3px solid ${SEV_COLOR[inc.severity]}`,
                borderRadius: 10, padding: "14px 18px", marginBottom: 10,
                boxShadow: inc.severity === "CRITICAL" ? `0 0 20px ${SEV_COLOR[inc.severity]}18` : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <span style={{ background: SEV_BG[inc.severity], color: SEV_COLOR[inc.severity], borderRadius: 5, padding: "2px 9px", fontSize: 10, fontWeight: 800 }}>
                        {inc.severity === "CRITICAL" && <span style={{ animation: "blink 1s infinite", display: "inline-block", marginRight: 4 }}>●</span>}
                        {inc.severity}
                      </span>
                      <span style={{ color: "var(--text2)", fontSize: 13, fontWeight: 600 }}>{inc.type}</span>
                      <span style={{ color: "var(--text3)", fontSize: 12 }}>· {inc.location}</span>
                    </div>
                    <div style={{ color: "var(--text)", fontSize: 14, marginBottom: 8 }}>{inc.description}</div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text3)" }}>
                      <span>👤 {inc.reported_by}</span>
                      <span>🕐 {Math.round((Date.now() - inc.timestamp) / 60000)}m ago</span>
                      {inc.escalate_911 && <span style={{ color: "#FF3B3B", fontWeight: 700 }}>🚔 911 ESCALATED</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <span style={{ background: STATUS_COLOR[inc.status] + "22", color: STATUS_COLOR[inc.status], borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                      {inc.status}
                    </span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 160 }}>
                      {inc.responders?.map(r => (
                        <span key={r} style={{ background: "var(--surface2)", color: "var(--text2)", borderRadius: 5, padding: "2px 7px", fontSize: 11 }}>{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {inc.triage?.immediate_actions?.length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {inc.triage.immediate_actions.map((a, i) => (
                      <span key={i} style={{ color: "var(--text3)", fontSize: 12 }}>→ {a}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Staff Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Staff Status</h3>
            {staff.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: s.status === "ON_INCIDENT" ? "#FF3B3B22" : "#00D08422", border: `1.5px solid ${s.status === "ON_INCIDENT" ? "#FF3B3B" : "#00D084"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: s.status === "ON_INCIDENT" ? "#FF3B3B" : "#00D084", flexShrink: 0 }}>
                  {s.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ color: "var(--text3)", fontSize: 11 }}>{s.role} · {s.zone}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.status === "ON_INCIDENT" ? "#FF3B3B" : "#00D084" }}>
                  {s.status === "ON_INCIDENT" ? "BUSY" : "FREE"}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h3>
            {[
              { label: "📢 Send Broadcast", page: "broadcast", color: "#FFB800" },
              { label: "🗺️ View Live Map", page: "map", color: "#4285F4" },
              { label: "👥 Dispatch Staff", page: "dispatch", color: "#00D084" },
              { label: "📋 Incident Log", page: "log", color: "var(--text2)" },
            ].map(a => (
              <button key={a.page} onClick={() => navigate(a.page)}
                style={{ display: "block", width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", cursor: "pointer", color: a.color, fontSize: 13, fontWeight: 600, textAlign: "left", marginBottom: 8, transition: "all .15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = a.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}