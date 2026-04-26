import { useState, useEffect } from "react";

const SEVERITY_COLOR = { CRITICAL: "#FF3B3B", HIGH: "#FF8C00", MEDIUM: "#FFB800", LOW: "#00D084" };

export default function Navbar({ role, setRole, sidebarOpen, setSidebarOpen, navigate, currentPage }) {
  const [time, setTime] = useState(new Date());
  const [alertCount] = useState(2);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, height: "var(--navbar-h)",
      background: "rgba(6,10,18,.95)", borderBottom: "1px solid var(--border)",
      backdropFilter: "blur(12px)", display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 16px", zIndex: 100,
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setSidebarOpen(p => !p)}
          style={{ background: "transparent", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>☰</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("command")}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #1A73E8, #EA4335)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🚨</div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>RapidResponse</span>
          <span style={{ background: "#FF3B3B22", color: "#FF6B6B", borderRadius: 4, padding: "1px 7px", fontSize: 10, fontWeight: 700, border: "1px solid #FF3B3B44" }}>LIVE</span>
        </div>
      </div>

      {/* Center — live clock + status */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 600, color: "var(--text)", letterSpacing: "0.05em" }}>
            {time.toLocaleTimeString()}
          </div>
          <div style={{ fontSize: 10, color: "var(--text3)" }}>{time.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</div>
        </div>
        {/* Critical alert badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FF3B3B18", border: "1px solid #FF3B3B44", borderRadius: 8, padding: "5px 12px" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF3B3B", display: "inline-block", animation: "blink 1s infinite" }} />
          <span style={{ color: "#FF6B6B", fontSize: 12, fontWeight: 700 }}>{alertCount} CRITICAL ACTIVE</span>
        </div>
      </div>

      {/* Right — role switcher + SOS */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 3, gap: 2 }}>
          {["coordinator","staff"].map(r => (
            <button key={r} onClick={() => setRole(r)}
              style={{ background: role === r ? "var(--accent)" : "transparent", color: role === r ? "#fff" : "var(--text2)", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>
              {r}
            </button>
          ))}
        </div>
        <button onClick={() => setRole("guest")}
          style={{ background: "#FF3B3B", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
          🆘 Guest SOS
        </button>
      </div>
    </header>
  );
}