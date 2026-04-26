// src/services/gemini.js
import { GEMINI_KEY } from "./firebase";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

async function callGemini(prompt) {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    }),
  });
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Triage an incoming SOS report → returns structured JSON
export async function triageIncident(report) {
  const prompt = `You are an emergency triage AI for a hospitality venue crisis response system.
Analyze this incident report and respond ONLY with valid JSON, no markdown:

REPORT: "${report}"

{
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "severity_score": <1-10>,
  "incident_type": "<Fire|Medical|Security|Flood|Structural|Evacuation|Other>",
  "immediate_actions": ["action1","action2","action3"],
  "responders_needed": ["Security","Medical","Fire","Management","Police"],
  "estimated_response_time": "<X minutes>",
  "guest_impact": "<brief>",
  "broadcast_message": "<calm public announcement under 30 words>",
  "escalate_911": <true|false>
}`;
  try {
    const text = await callGemini(prompt);
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return {
      severity: "HIGH", severity_score: 7, incident_type: "Other",
      immediate_actions: ["Secure the area", "Alert management", "Assist guests"],
      responders_needed: ["Security", "Management"],
      estimated_response_time: "3 minutes",
      guest_impact: "Guests in affected area may need assistance",
      broadcast_message: "Attention guests: staff are handling a situation. Please remain calm and follow staff instructions.",
      escalate_911: false,
    };
  }
}

// Summarize all active incidents for command center
export async function summarizeIncidents(incidents) {
  if (!incidents.length) return "No active incidents.";
  const list = incidents.map((inc, i) =>
    `${i + 1}. [${inc.severity}] ${inc.type} at ${inc.location} — ${inc.description}`
  ).join("\n");
  const prompt = `You are a crisis command AI. Summarize these active hotel incidents in 3-4 sentences for the duty manager. Prioritize critical ones, suggest resource allocation:

${list}

Be concise, factual, actionable.`;
  return await callGemini(prompt);
}

// Generate staff instruction for a specific role
export async function getRoleInstructions(role, incident) {
  const prompt = `Emergency protocol for hospitality staff.
Role: ${role}
Incident: ${incident.type} — Severity: ${incident.severity}
Location: ${incident.location}

Give 5 specific, numbered action steps for this staff member right now. Be direct, no fluff.`;
  return await callGemini(prompt);
}

// Post-incident report generation
export async function generateIncidentReport(incident) {
  const prompt = `Generate a formal post-incident report for a hospitality venue emergency.
Incident: ${JSON.stringify(incident)}

Include: Executive Summary, Timeline, Response Actions, Impact Assessment, Recommendations.
Professional tone. Under 400 words.`;
  return await callGemini(prompt);
}