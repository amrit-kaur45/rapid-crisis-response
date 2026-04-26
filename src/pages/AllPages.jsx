import { useState } from "react";
import { MOCK_STAFF, MOCK_INCIDENTS } from "../services/incidents";
import { getRoleInstructions, generateIncidentReport, triageIncident } from "../services/gemini";
import { reportIncident } from "../services/incidents";
import { translateToAll, translateText, textToSpeech, SUPPORTED_LANGUAGES } from "../services/translate";

const SEV_COLOR = { CRITICAL: "#FF3B3B", HIGH: "#FF8C00", MEDIUM: "#FFB800", LOW: "#00D084" };

// ── STAFF DISPATCH ──────────────────────────────────────
export function StaffDispatch() {
  const [staff] = useState(MOCK_STAFF);
  const [incidents] = useState(MOCK_INCIDENTS);
  const [assignments, setAssignments] = useState({});
  const [instructions, setInstructions] = useState({});
  const [loading, setLoading] = useState({});

  const fetchInstructions = async (s) => {
    const incId = assignments[s.id];
    if (!incId) return;
    const inc = incidents.find(i => i.id === incId);
    if (!inc) return;
    setLoading(p => ({ ...p, [s.id]: true }));
    const result = await getRoleInstructions(s.role, { type: inc.type, severity: inc.severity, location: inc.location });
    setInstructions(p => ({ ...p, [s.id]: result }));
    setLoading(p => ({ ...p, [s.id]: false }));
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>👥 Staff Dispatch</h1>
      <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 24 }}>Assign staff to incidents — Gemini generates role-specific action steps</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {staff.map(s => (
          <div key={s.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: s.status === "ON_INCIDENT" ? "#FF3B3B22" : "#00D08422", border: `2px solid ${s.status === "ON_INCIDENT" ? "#FF3B3B" : "#00D084"}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: s.status === "ON_INCIDENT" ? "#FF3B3B" : "#00D084" }}>
                {s.avatar}
              </div>
              <div>
                <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                <div style={{ color: "var(--text3)", fontSize: 12 }}>{s.role} · {s.zone}</div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: s.status === "ON_INCIDENT" ? "#FF3B3B" : "#00D084" }}>
                {s.status === "ON_INCIDENT" ? "BUSY" : "FREE"}
              </span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ color: "var(--text3)", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Assign to Incident</label>
              <select value={assignments[s.id] || ""} onChange={e => setAssignments(p => ({ ...p, [s.id]: e.target.value }))}
                style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", color: "var(--text)", fontSize: 13, outline: "none" }}>
                <option value="">— Select incident —</option>
                {incidents.map(inc => <option key={inc.id} value={inc.id}>[{inc.severity}] {inc.type} — {inc.location}</option>)}
              </select>
            </div>
            <button onClick={() => fetchInstructions(s)} disabled={!assignments[s.id] || loading[s.id]}
              style={{ width: "100%", background: assignments[s.id] ? "#1A73E8" : "var(--surface2)", color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
              {loading[s.id] ? "Getting instructions..." : "⚡ Get Gemini Instructions"}
            </button>
            {instructions[s.id] && (
              <div style={{ marginTop: 12, background: "var(--bg2)", borderRadius: 8, padding: 12 }}>
                <div style={{ color: "#4285F4", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>GEMINI ROLE INSTRUCTIONS</div>
                <div style={{ color: "var(--text2)", fontSize: 12, lineHeight: 1.8, whiteSpace: "pre-line" }}>{instructions[s.id]}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BROADCAST ───────────────────────────────────────────
const TEMPLATES = [
  "Attention guests: please remain calm and follow staff instructions.",
  "Attention guests: please proceed to the nearest emergency exit immediately.",
  "This is a drill. Please proceed calmly to the assembly point.",
  "Medical assistance is being provided in the lobby. Please give space to our team.",
  "The situation has been resolved. Thank you for your patience.",
];

export function Broadcast() {
  const [message, setMessage] = useState("");
  const [translations, setTranslations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [ttsLang, setTtsLang] = useState("en-US");

  const handleTranslate = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setTranslations(await translateToAll(message));
    setLoading(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>📢 Emergency Broadcast</h1>
      <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 24 }}>Multilingual announcements via Google Translate + TTS</p>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 20 }}>
        <div style={{ color: "var(--text3)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Quick Templates</div>
        {TEMPLATES.map((t, i) => (
          <button key={i} onClick={() => setMessage(t)}
            style={{ display: "block", width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 14px", cursor: "pointer", color: "var(--text2)", fontSize: 13, textAlign: "left", marginBottom: 8 }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 20 }}>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Type your broadcast message..."
          style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, color: "var(--text)", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "var(--font)", marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={handleTranslate} disabled={!message || loading}
            style={{ background: "#1A73E8", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            {loading ? "Translating..." : "🌐 Translate to 10 Languages"}
          </button>
          <select value={ttsLang} onChange={e => setTtsLang(e.target.value)}
            style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none" }}>
            <option value="en-US">English</option><option value="hi-IN">Hindi</option>
            <option value="ar-XA">Arabic</option><option value="fr-FR">French</option><option value="de-DE">German</option>
          </select>
          <button onClick={() => textToSpeech(message, ttsLang)} disabled={!message}
            style={{ background: "#00D08422", color: "#00D084", border: "1px solid #00D08444", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            🔊 Play TTS
          </button>
          <button onClick={() => { setSent(true); setTimeout(() => setSent(false), 3000); }} disabled={!message}
            style={{ background: "#FF3B3B", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 13, fontWeight: 800 }}>
            {sent ? "✅ Sent!" : "🚨 BROADCAST NOW"}
          </button>
        </div>
      </div>

      {translations && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <div style={{ color: "var(--text3)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Multilingual Broadcast</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {SUPPORTED_LANGUAGES.map(lang => (
              <div key={lang.code} style={{ background: "var(--bg2)", borderRadius: 8, padding: 12 }}>
                <div style={{ color: "#4285F4", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{lang.label}</div>
                <div style={{ color: "var(--text2)", fontSize: 13 }}>{translations[lang.code]}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── INCIDENT LOG ────────────────────────────────────────
export function IncidentLog() {
  const [incidents] = useState([
    ...MOCK_INCIDENTS,
    { id: "inc_004", type: "Flood", severity: "HIGH", status: "RESOLVED", location: "Basement", description: "Pipe burst in basement utility room.", reported_by: "Maintenance", timestamp: Date.now() - 7200000, responders: ["Maintenance"] },
    { id: "inc_005", type: "Evacuation", severity: "MEDIUM", status: "RESOLVED", location: "Floor 3", description: "False alarm — smoke detector triggered by steam.", reported_by: "Guest via SOS", timestamp: Date.now() - 10800000, responders: ["Security"] },
  ]);
  const [filter, setFilter] = useState("ALL");
  const [reportLoading, setReportLoading] = useState({});
  const [reports, setReports] = useState({});
  const STATUS_COLOR = { ACTIVE: "#FF3B3B", RESPONDING: "#FFB800", MONITORING: "#3B82F6", RESOLVED: "#00D084" };

  const fetchReport = async (inc) => {
  setReportLoading(p => ({ ...p, [inc.id]: true }));

  const report = await generateIncidentReport(inc); // ✅ FIX: await moved outside

  setReports(p => ({ 
    ...p, 
    [inc.id]: report 
  }));

  setReportLoading(p => ({ ...p, [inc.id]: false }));
};

  const filtered = filter === "ALL" ? incidents : incidents.filter(i => i.status === filter);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>📋 Incident Log</h1>
          <p style={{ color: "var(--text2)", fontSize: 13 }}>Full history — generate Gemini AI reports per incident</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["ALL","ACTIVE","RESPONDING","MONITORING","RESOLVED"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter === f ? "var(--accent)" : "var(--surface)", color: filter === f ? "#fff" : "var(--text2)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.map(inc => (
        <div key={inc.id} style={{ background: "var(--surface)", border: `1px solid ${SEV_COLOR[inc.severity]}33`, borderRadius: 12, padding: 18, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ color: SEV_COLOR[inc.severity], fontWeight: 800, fontSize: 12 }}>{inc.severity}</span>
                <span style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>{inc.type}</span>
                <span style={{ color: "var(--text3)", fontSize: 13 }}>· {inc.location}</span>
              </div>
              <div style={{ color: "var(--text2)", fontSize: 13, marginBottom: 6 }}>{inc.description}</div>
              <div style={{ color: "var(--text3)", fontSize: 12 }}>{new Date(inc.timestamp).toLocaleString()} · {inc.reported_by}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <span style={{ background: STATUS_COLOR[inc.status] + "22", color: STATUS_COLOR[inc.status], borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{inc.status}</span>
              <button onClick={() => fetchReport(inc)} disabled={reportLoading[inc.id]}
                style={{ background: "#1A73E822", color: "#4285F4", border: "1px solid #1A73E844", borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                {reportLoading[inc.id] ? "Generating..." : "📄 AI Report"}
              </button>
            </div>
          </div>
          {reports[inc.id] && (
            <div style={{ marginTop: 14, background: "var(--bg2)", borderRadius: 9, padding: 14, borderLeft: "3px solid #4285F4" }}>
              <div style={{ color: "#4285F4", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>GEMINI INCIDENT REPORT</div>
              <div style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-line" }}>{reports[inc.id]}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── GUEST SOS ───────────────────────────────────────────
const TYPES_GUEST = [
  { type: "Medical", icon: "🏥", label: "Medical Emergency" },
  { type: "Fire",    icon: "🔥", label: "Fire / Smoke" },
  { type: "Security",icon: "🔒", label: "Security Threat" },
  { type: "Other",   icon: "🆘", label: "Other Emergency" },
];

export function GuestSOS({ setRole }) {
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState({ code: "en", label: "English" });
  const [description, setDescription] = useState("");
  const [room, setRoom] = useState("");
  const [type, setType] = useState("Other");
  const [loading, setLoading] = useState(false);
  const [triage, setTriage] = useState(null);
  const [labels, setLabels] = useState({ title: "EMERGENCY SOS", room_label: "Your Room Number", desc_label: "Describe what is happening", submit: "SEND SOS", confirm: "Help is on the way!", confirm_sub: "Staff have been alerted and are responding to your location." });

  const selectLang = async (l) => {
    setLang(l);
    if (l.code !== "en") {
      const translated = {};
      await Promise.all(Object.keys(labels).map(async k => { translated[k] = await translateText(labels[k], l.code); }));
      setLabels(translated);
    }
    setStep(2);
  };

  const handleSOS = async () => {
    if (!description) return;
    setLoading(true);
    const result = await triageIncident(`Guest emergency: ${type}. Room ${room}. ${description}`);
    await reportIncident({ type, location: `Room ${room}`, room, description, reported_by: `Guest (Room ${room})`, severity: result.severity, triage: result, status: "ACTIVE", escalate_911: result.escalate_911, timestamp: Date.now() });
    setTriage(result);
    setStep(3);
    setLoading(false);
  };

  if (step === 1) return (
    <div style={{ minHeight: "100vh", background: "#060A12", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🆘</div>
        <div style={{ color: "#FF3B3B", fontSize: 22, fontWeight: 800 }}>EMERGENCY SOS</div>
        <div style={{ color: "#8A9DC0", fontSize: 14, marginTop: 4 }}>Select your language / अपनी भाषा चुनें</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 500 }}>
        {SUPPORTED_LANGUAGES.map(l => (
          <button key={l.code} onClick={() => selectLang(l)}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px", cursor: "pointer", color: "var(--text)", fontSize: 14, fontWeight: 600 }}>
            {l.label}
          </button>
        ))}
      </div>
      <button onClick={() => setRole("coordinator")} style={{ marginTop: 32, background: "transparent", border: "none", color: "#4A5C7A", cursor: "pointer", fontSize: 13 }}>Staff Login →</button>
    </div>
  );

  if (step === 3) return (
    <div style={{ minHeight: "100vh", background: "#060A12", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <div style={{ color: "#00D084", fontSize: 24, fontWeight: 800, marginBottom: 12 }}>{labels.confirm}</div>
      <div style={{ color: "#8A9DC0", fontSize: 15, marginBottom: 24, maxWidth: 400 }}>{labels.confirm_sub}</div>
      {triage?.escalate_911 && <div style={{ color: "#FF6B6B", fontWeight: 700, marginBottom: 12 }}>🚔 Emergency services have been notified</div>}
      {triage?.broadcast_message && (
        <div style={{ background: "#FFB80018", border: "1px solid #FFB80044", borderRadius: 10, padding: "14px 24px", maxWidth: 380 }}>
          <div style={{ color: "#FFB800", fontSize: 13, fontStyle: "italic" }}>"{triage.broadcast_message}"</div>
        </div>
      )}
      <button onClick={() => setRole("coordinator")} style={{ marginTop: 32, background: "transparent", border: "1px solid var(--border)", color: "var(--text2)", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontSize: 13 }}>Staff Portal →</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#060A12", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🆘</div>
          <div style={{ color: "#FF3B3B", fontSize: 20, fontWeight: 800 }}>{labels.title}</div>
          <div style={{ color: "#8A9DC0", fontSize: 13, marginTop: 4 }}>{lang.label}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {TYPES_GUEST.map(t => (
            <button key={t.type} onClick={() => setType(t.type)}
              style={{ background: type === t.type ? "#FF3B3B22" : "var(--surface)", border: `2px solid ${type === t.type ? "#FF3B3B" : "var(--border)"}`, borderRadius: 10, padding: "14px", cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{t.icon}</div>
              <div style={{ color: type === t.type ? "#FF6B6B" : "var(--text2)", fontSize: 12, fontWeight: 600 }}>{t.label}</div>
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: "#8A9DC0", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>{labels.room_label}</label>
          <input value={room} onChange={e => setRoom(e.target.value)} placeholder="e.g. 304"
            style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text)", fontSize: 15, outline: "none" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: "#8A9DC0", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase" }}>{labels.desc_label}</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text)", fontSize: 14, outline: "none", resize: "none", fontFamily: "var(--font)" }} />
        </div>
        <button onClick={handleSOS} disabled={!description || loading}
          style={{ width: "100%", background: description && !loading ? "#FF3B3B" : "#2a1010", color: "#fff", border: "none", borderRadius: 10, padding: "15px 0", cursor: "pointer", fontSize: 16, fontWeight: 900 }}>
          {loading ? "Alerting staff..." : `🆘 ${labels.submit}`}
        </button>
      </div>
    </div>
  );
}

export default StaffDispatch;