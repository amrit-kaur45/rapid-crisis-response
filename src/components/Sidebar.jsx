const NAV = [
  { id: "command",   icon: "⚡", label: "Command Center" },
  { id: "sos",       icon: "🚨", label: "Report Incident" },
  { id: "map",       icon: "🗺️", label: "Live Map" },
  { id: "dispatch",  icon: "👥", label: "Staff Dispatch" },
  { id: "broadcast", icon: "📢", label: "Broadcast" },
  { id: "log",       icon: "📋", label: "Incident Log" },
];

export default function Sidebar({ navigate, currentPage, isOpen }) {
  return (
    <aside style={{
      position: "fixed", top: "var(--navbar-h)", left: 0, bottom: 0,
      width: "var(--sidebar-w)", background: "var(--bg2)",
      borderRight: "1px solid var(--border)", padding: "12px 8px",
      display: "flex", flexDirection: "column", gap: 2,
      transform: isOpen ? "translateX(0)" : "translateX(-100%)",
      transition: "transform .25s", zIndex: 50,
    }}>
      <div style={{ color: "var(--text3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", padding: "6px 10px 10px", textTransform: "uppercase" }}>Navigation</div>
      {NAV.map(n => (
        <button key={n.id} onClick={() => navigate(n.id)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8, cursor: "pointer",
            background: currentPage === n.id ? "linear-gradient(90deg,#1A3060,#162550)" : "transparent",
            border: currentPage === n.id ? "1px solid #1E3A78" : "1px solid transparent",
            color: currentPage === n.id ? "#4285F4" : "var(--text2)",
            fontSize: 13, fontWeight: currentPage === n.id ? 600 : 400,
            width: "100%", textAlign: "left", transition: "all .15s",
          }}
          onMouseEnter={e => { if (currentPage !== n.id) e.currentTarget.style.background = "var(--surface)"; }}
          onMouseLeave={e => { if (currentPage !== n.id) e.currentTarget.style.background = "transparent"; }}>
          <span style={{ fontSize: 16 }}>{n.icon}</span>
          {n.label}
        </button>
      ))}

      {/* Powered by Google */}
      <div style={{ marginTop: "auto", padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 8 }}>POWERED BY</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Gemini AI", "Maps", "Firebase", "Translate"].map(g => (
            <span key={g} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "3px 8px", fontSize: 10, color: "var(--text2)" }}>{g}</span>
          ))}
        </div>
      </div>
    </aside>
  );
}