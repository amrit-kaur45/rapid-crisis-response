// src/services/incidents.js
// Wraps Firebase Realtime DB. Falls back to mock data if Firebase not configured.

import { db, ref, onValue, push, set, serverTimestamp } from "./firebase";

export const MOCK_INCIDENTS = [
  {
    id: "inc_001",
    type: "Fire",
    severity: "CRITICAL",
    severity_score: 9,
    location: "Kitchen — Floor 2",
    room: "201",
    description: "Smoke detected near industrial fryer. Fire alarm triggered.",
    reported_by: "Staff — Anil Kumar",
    timestamp: Date.now() - 120000,
    status: "ACTIVE",
    responders: ["Security Team A", "Fire Marshal", "Management"],
    broadcast_message: "Attention guests: please proceed calmly to nearest exit. Staff will assist you.",
    escalate_911: true,
    triage: { immediate_actions: ["Evacuate floor 2", "Activate suppression system", "Guide guests to assembly point"] },
    lat: 28.6139, lng: 77.2090,
  },
  {
    id: "inc_002",
    type: "Medical",
    severity: "HIGH",
    severity_score: 7,
    location: "Lobby",
    room: "Lobby",
    description: "Guest collapsed near reception. Possible cardiac event.",
    reported_by: "Guest — via SOS button",
    timestamp: Date.now() - 300000,
    status: "RESPONDING",
    responders: ["First Aid Team", "Management"],
    broadcast_message: "Medical assistance is being provided. Please give space to our medical team.",
    escalate_911: true,
    triage: { immediate_actions: ["Administer CPR if trained", "Clear area", "Guide ambulance to lobby entrance"] },
    lat: 28.6145, lng: 77.2095,
  },
  {
    id: "inc_003",
    type: "Security",
    severity: "MEDIUM",
    severity_score: 5,
    location: "Parking Level B",
    room: "N/A",
    description: "Unattended bag reported. Guests evacuated from zone.",
    reported_by: "Security Camera Alert",
    timestamp: Date.now() - 600000,
    status: "MONITORING",
    responders: ["Security Team B"],
    broadcast_message: "Routine security check in progress. Thank you for your patience.",
    escalate_911: false,
    triage: { immediate_actions: ["Cordon off area", "Review CCTV", "Await bomb squad clearance"] },
    lat: 28.6130, lng: 77.2080,
  },
];

export const MOCK_STAFF = [
  { id: "s1", name: "Anil Kumar",    role: "Security",   status: "ON_INCIDENT", zone: "Floor 2",   avatar: "AK" },
  { id: "s2", name: "Priya Sharma",  role: "Medical",    status: "ON_INCIDENT", zone: "Lobby",     avatar: "PS" },
  { id: "s3", name: "Ravi Menon",    role: "Management", status: "AVAILABLE",   zone: "Command",   avatar: "RM" },
  { id: "s4", name: "Sara Ahmed",    role: "Security",   status: "AVAILABLE",   zone: "Parking B", avatar: "SA" },
  { id: "s5", name: "Tom Wilson",    role: "Fire",       status: "ON_INCIDENT", zone: "Floor 2",   avatar: "TW" },
  { id: "s6", name: "Meera Iyer",    role: "Front Desk", status: "AVAILABLE",   zone: "Lobby",     avatar: "MI" },
];

export const MOCK_STATS = {
  total_incidents_today: 3,
  resolved_today: 7,
  avg_response_time: "2m 34s",
  guests_affected: 48,
  staff_deployed: 5,
  critical_active: 1,
};

// Real Firebase listeners (used when Firebase is configured)
export function subscribeIncidents(callback) {
  try {
    const incRef = ref(db, "incidents");
    return onValue(incRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        callback(list.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        callback(MOCK_INCIDENTS);
      }
    });
  } catch {
    callback(MOCK_INCIDENTS);
    return () => {};
  }
}

export async function reportIncident(incident) {
  try {
    const incRef = ref(db, "incidents");

    const res = await push(incRef, {
      ...incident,
      timestamp: Date.now(), // ✅ safer than serverTimestamp here
    });

    return res; // ✅ IMPORTANT

  } catch (err) {
    console.warn("Firebase not configured — fallback used", err);

    return true; // ✅ prevent UI from hanging
  }
}

export async function updateIncidentStatus(id, status) {
  try {
    await set(ref(db, `incidents/${id}/status`), status);
  } catch {
    console.warn("Firebase not configured");
  }
}

export function subscribeStaff(callback) {
  try {
    const staffRef = ref(db, "staff");
    return onValue(staffRef, (snap) => {
      const data = snap.val();
      if (data) callback(Object.values(data));
      else callback(MOCK_STAFF);
    });
  } catch {
    callback(MOCK_STAFF);
    return () => {};
  }
}