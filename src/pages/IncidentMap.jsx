import { useEffect, useRef, useState } from "react";
import { MAPS_KEY } from "../services/firebase";
import { MOCK_INCIDENTS } from "../services/incidents";

const SEV_COLOR = { CRITICAL: "#FF3B3B", HIGH: "#FF8C00", MEDIUM: "#FFB800", LOW: "#00D084" };

// Slight position offsets to simulate hotel floor plan
const VENUE_CENTER = { lat: 28.6139, lng: 77.2090 };

export default function IncidentMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [selected, setSelected] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (MAPS_KEY === "YOUR_MAPS_API_KEY") { setError(true); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&callback=initMap`;
    script.async = true;
    window.initMap = () => setMapsLoaded(true);
    script.onerror = () => setError(true);
    document.head.appendChild(script);
    return () => { delete window.initMap; };
  }, []);

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: VENUE_CENTER, zoom: 18,
      styles: [ // Dark map style
        { elementType: "geometry", stylers: [{ color: "#0A1020" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0A1020" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#8A9DC0" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#1E2D48" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#060A12" }] },
      ],
    });
    mapInstance.current = map;

    MOCK_INCIDENTS.forEach((inc, i) => {
      const pos = { lat: VENUE_CENTER.lat + (i * 0.0002), lng: VENUE_CENTER.lng + (i * 0.0001) };
      const marker = new window.google.maps.Marker({
        position: pos, map,
        title: inc.type,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: SEV_COLOR[inc.severity],
          fillOpacity: 0.9,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="background:#0F1828;color:#E2EAF8;padding:12px;border-radius:8px;font-family:Inter,sans-serif;font-size:13px;max-width:200px">
          <strong style="color:${SEV_COLOR[inc.severity]}">${inc.severity} — ${inc.type}</strong><br/>
          📍 ${inc.location}<br/>
          <span style="color:#8A9DC0;font-size:12px">${inc.description}</span>
        </div>`,
      });
      marker.addListener("click", () => { infoWindow.open(map, marker); setSelected(inc); });
    });
  }, [mapsLoaded]);

  return (
    <div style={{ padding: 24, height: "calc(100vh - 56px)", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>🗺️ Live Incident Map</h1>
          <p style={{ color: "var(--text2)", fontSize: 13 }}>Powered by Google Maps · Real-time incident markers</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {Object.entries(SEV_COLOR).map(([sev, col]) => (
            <div key={sev} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: col, display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "var(--text2)" }}>{sev}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)" }}>
        {error && (
          /* Fallback visual map when key not configured */
          <div style={{ width: "100%", height: "100%", background: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 8 }}>
              Google Maps API key not configured — showing demo hotel floor plan
            </div>
            {/* SVG hotel floor plan */}
            <svg viewBox="0 0 800 500" style={{ width: "90%", maxWidth: 700, background: "#0A1020", borderRadius: 12, border: "1px solid var(--border)" }}>
              {/* Building outline */}
              <rect x="50" y="50" width="700" height="400" rx="8" fill="#0F1828" stroke="#1E2D48" strokeWidth="2" />
              {/* Rooms */}
              {[
                { x: 80, y: 80, w: 120, h: 80, label: "Restaurant", inc: "🟡" },
                { x: 220, y: 80, w: 120, h: 80, label: "Kitchen", inc: "🔴" },
                { x: 360, y: 80, w: 120, h: 80, label: "Lobby", inc: "🟠" },
                { x: 500, y: 80, w: 120, h: 80, label: "Reception", inc: null },
                { x: 80, y: 200, w: 80, h: 100, label: "Room 101", inc: null },
                { x: 180, y: 200, w: 80, h: 100, label: "Room 102", inc: null },
                { x: 280, y: 200, w: 80, h: 100, label: "Room 103", inc: null },
                { x: 380, y: 200, w: 80, h: 100, label: "Room 104", inc: null },
                { x: 480, y: 200, w: 80, h: 100, label: "Room 105", inc: null },
                { x: 580, y: 200, w: 80, h: 100, label: "Room 106", inc: null },
                { x: 80, y: 340, w: 200, h: 90, label: "Parking B", inc: "🟡" },
                { x: 300, y: 340, w: 200, h: 90, label: "Pool", inc: null },
                { x: 520, y: 340, w: 200, h: 90, label: "Gym / Spa", inc: null },
              ].map((r, i) => (
                <g key={i}>
                  <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="4" fill={r.inc ? (r.inc === "🔴" ? "#FF3B3B18" : r.inc === "🟠" ? "#FF8C0018" : "#FFB80018") : "#162035"} stroke={r.inc ? (r.inc === "🔴" ? "#FF3B3B" : r.inc === "🟠" ? "#FF8C00" : "#FFB800") : "#1E2D48"} strokeWidth="1.5" />
                  <text x={r.x + r.w / 2} y={r.y + r.h / 2 - 4} textAnchor="middle" fill="#8A9DC0" fontSize="10">{r.label}</text>
                  {r.inc && <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 14} textAnchor="middle" fontSize="14">{r.inc}</text>}
                </g>
              ))}
              {/* Legend */}
              <text x="400" y="480" textAnchor="middle" fill="#4A5C7A" fontSize="11">🔴 CRITICAL  🟠 HIGH  🟡 MEDIUM</text>
            </svg>
          </div>
        )}
        {!error && <div ref={mapRef} style={{ width: "100%", height: "100%" }} />}

        {/* Overlay: selected incident panel */}
        {selected && (
          <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(15,24,40,.95)", border: `1px solid ${SEV_COLOR[selected.severity]}66`, borderRadius: 12, padding: 16, maxWidth: 280, backdropFilter: "blur(8px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: SEV_COLOR[selected.severity], fontWeight: 700, fontSize: 13 }}>{selected.severity} — {selected.type}</span>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: "var(--text3)", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ color: "var(--text)", fontSize: 13, margin: "6px 0" }}>📍 {selected.location}</div>
            <div style={{ color: "var(--text2)", fontSize: 12, lineHeight: 1.5 }}>{selected.description}</div>
          </div>
        )}
      </div>
    </div>
  );
}