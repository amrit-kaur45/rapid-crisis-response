import { useState } from "react";
import { triageIncident } from "../services/gemini";
import { reportIncident } from "../services/incidents";
import { translateToAll } from "../services/translate";

const TYPES = ["Fire", "Medical", "Security", "Flood", "Structural", "Evacuation", "Other"];
const LOCATIONS = ["Lobby", "Restaurant", "Pool Area", "Floor 1", "Floor 2", "Floor 3", "Parking", "Kitchen", "Gym", "Spa", "Rooftop", "Other"];
const SEV_COLOR = { CRITICAL: "#FF3B3B", HIGH: "#FF8C00", MEDIUM: "#FFB800", LOW: "#00D084" };

export default function SOSReport({ navigate }) {
  const [form, setForm] = useState({ type: "", location: "", room: "", description: "", reporter: "" });
  const [triage, setTriage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [translations, setTranslations] = useState(null);
  const [translating, setTranslating] = useState(false);

  const handleTriage = async () => {
  if (!form.description || !form.location) return;

  try {
    setLoading(true);

    const report = `${form.type || "General"} incident at ${form.location}${
      form.room ? ` Room ${form.room}` : ""
    }. ${form.description}`;

    const result = await triageIncident(report);

    console.log("TRIAGE RESULT:", result); // 👈 debug

    if (!result) throw new Error("No response from AI");

    setTriage(result);

  } catch (err) {
    console.error("Triage failed:", err);
    alert("AI failed. Check API / Gemini connection.");
  } finally {
    setLoading(false);
  }
};

const handleSubmit = async () => {
  if (!triage) {
    alert("No triage data");
    return;
  }

  console.log("CLICK WORKING"); // 👈 must print

  setLoading(true);

  try {
    // 🔥 skip Firebase completely (test mode)
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log("SUBMIT DONE"); // 👈 must print

    setSubmitted(true); // 👈 THIS SHOULD SWITCH SCREEN

  } catch (err) {
    console.error(err);
    alert("Something failed");
  }

  setLoading(false);
};


const handleTranslate = async () => {
  if (!triage?.broadcast_message) return;

  try {
    setTranslating(true);

    const result = await translateToAll(triage.broadcast_message);

    setTranslations(result);

  } catch (err) {
    console.error("Translate failed:", err);
    alert("Translation failed");
  } finally {
    setTranslating(false);
  }
};

  if (submitted) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", textAlign: "center", padding: 32 }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
      <h2 style={{ color: "var(--text)", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Incident Reported</h2>
      <p style={{ color: "var(--text2)", marginBottom: 8 }}>Severity: <span style={{ color: SEV_COLOR[triage.severity], fontWeight: 700 }}>{triage.severity}</span></p>
      <p style={{ color: "var(--text2)", marginBottom: 24 }}>Responders have been alerted. {triage.escalate_911 && "911 has been notified."}</p>
      <button onClick={() => { setSubmitted(false); setTriage(null); setForm({ type: "", location: "", room: "", description: "", reporter: "" }); }}
        style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 9, padding: "11px 28px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
        Report Another
      </button>
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>🚨 Report Incident</h1>
      <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>Gemini AI will instantly triage and dispatch the right responders</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Form */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "var(--text3)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Incident Type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TYPES.map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                  style={{ background: form.type === t ? "var(--accent)" : "var(--surface2)", color: form.type === t ? "#fff" : "var(--text2)", border: `1px solid ${form.type === t ? "var(--accent)" : "var(--border)"}`, borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ color: "var(--text3)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Location</label>
              <select value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none" }}>
                <option value="">Select...</option>
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "var(--text3)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Room / Zone</label>
              <input value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} placeholder="e.g. 204"
                style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none" }} />
            </div>
          </div>

          <div>
            <label style={{ color: "var(--text3)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Description *</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe what you see — be specific. E.g: Smoke coming from kitchen fryer, fire alarm triggered, 3 guests present..."
              rows={4}
              style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "var(--font)" }} />
          </div>

          <div>
            <label style={{ color: "var(--text3)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Your Name / ID</label>
            <input value={form.reporter} onChange={e => setForm(p => ({ ...p, reporter: e.target.value }))} placeholder="Staff name or ID"
              style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13, outline: "none" }} />
          </div>

          <button onClick={handleTriage} disabled={!form.description || !form.location || loading}
            style={{ background: form.description && form.location ? "#1A73E8" : "var(--surface2)", color: "#fff", border: "none", borderRadius: 9, padding: "12px 0", cursor: "pointer", fontSize: 14, fontWeight: 700, transition: "all .2s" }}>
            {loading ? "Gemini is triaging..." : "⚡ Analyse with Gemini AI"}
          </button>
        </div>

        {/* Triage Result */}
        <div>
          {!triage && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--text3)" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
              <div style={{ fontSize: 14 }}>Fill in the incident details and click Analyse — Gemini will triage severity, assign responders, and draft a guest broadcast.</div>
            </div>
          )}

          {triage && (
            <div className="animate-slide" style={{ background: "var(--surface)", border: `1px solid ${SEV_COLOR[triage.severity]}44`, borderRadius: 14, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Severity */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "var(--text3)", fontSize: 11, marginBottom: 4 }}>GEMINI TRIAGE RESULT</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ color: SEV_COLOR[triage.severity], fontSize: 22, fontWeight: 900 }}>{triage.severity}</span>
                    <span style={{ color: "var(--text2)", fontSize: 14 }}>{triage.incident_type}</span>
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: SEV_COLOR[triage.severity] }}>{triage.severity_score}/10</div>
                  <div style={{ fontSize: 10, color: "var(--text3)" }}>Risk Score</div>
                </div>
              </div>

              {/* Immediate Actions */}
              <div style={{ background: "var(--bg2)", borderRadius: 9, padding: 14 }}>
                <div style={{ color: "#FF8C00", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>⚡ Immediate Actions</div>
                {triage.immediate_actions?.map((a, i) => (
                  <div key={i} style={{ color: "var(--text2)", fontSize: 13, marginBottom: 5 }}>→ {a}</div>
                ))}
              </div>

              {/* Responders */}
              <div>
                <div style={{ color: "var(--text3)", fontSize: 11, marginBottom: 6 }}>RESPONDERS NEEDED</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {triage.responders_needed?.map(r => (
                    <span key={r} style={{ background: "#1A73E822", color: "#4285F4", border: "1px solid #1A73E844", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{r}</span>
                  ))}
                </div>
              </div>

              {/* Broadcast */}
              <div style={{ background: "#FFB80012", border: "1px solid #FFB80044", borderRadius: 9, padding: 12 }}>
                <div style={{ color: "#FFB800", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>📢 Guest Broadcast Draft</div>
                <div style={{ color: "var(--text)", fontSize: 13, lineHeight: 1.6, fontStyle: "italic" }}>"{triage.broadcast_message}"</div>
                <button onClick={handleTranslate} disabled={translating}
                  style={{ marginTop: 10, background: "transparent", border: "1px solid #1A73E844", color: "#4285F4", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                  {translating ? "Translating..." : "🌐 Translate to 10 languages"}
                </button>
              </div>

              {/* Translations */}
              {translations && (
                <div style={{ background: "var(--bg2)", borderRadius: 9, padding: 12, maxHeight: 160, overflowY: "auto" }}>
                  <div style={{ color: "var(--text3)", fontSize: 11, marginBottom: 8 }}>MULTILINGUAL BROADCAST</div>
                  {Object.entries(translations).map(([code, text]) => (
                    <div key={code} style={{ marginBottom: 6 }}>
                      <span style={{ color: "#4285F4", fontSize: 11, fontWeight: 700, marginRight: 6 }}>{code.toUpperCase()}</span>
                      <span style={{ color: "var(--text2)", fontSize: 12 }}>{text}</span>
                    </div>
                  ))}
                </div>
              )}

              {triage.escalate_911 && (
                <div style={{ background: "#FF3B3B18", border: "1px solid #FF3B3B44", borderRadius: 8, padding: 12, display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>🚔</span>
                  <span style={{ color: "#FF6B6B", fontSize: 13, fontWeight: 700 }}>Gemini recommends escalating to 911 immediately</span>
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                style={{ background: "#FF3B3B", color: "#fff", border: "none", borderRadius: 9, padding: "13px 0", cursor: "pointer", fontSize: 15, fontWeight: 800 }}>
                {loading ? "Dispatching..." : "🚨 CONFIRM & DISPATCH"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
