// src/services/translate.js
import { TRANSLATE_KEY, TTS_KEY } from "./firebase";

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Chinese" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "es", label: "Spanish" },
  { code: "ru", label: "Russian" },
  { code: "pt", label: "Portuguese" },
];
export { SUPPORTED_LANGUAGES };

// Translate text via Google Cloud Translate API
export async function translateText(text, targetLang) {
  if (targetLang === "en") return text;
  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, target: targetLang, format: "text" }),
      }
    );
    const data = await res.json();
    return data?.data?.translations?.[0]?.translatedText || text;
  } catch {
    return text; // fallback to original
  }
}

// Translate to all supported languages (for multilingual SOS broadcast)
export async function translateToAll(text) {
  const results = {};
  await Promise.all(
    SUPPORTED_LANGUAGES.map(async (lang) => {
      results[lang.code] = await translateText(text, lang.code);
    })
  );
  return results;
}

// Google Cloud Text-to-Speech — returns base64 audio
export async function textToSpeech(text, languageCode = "en-US") {
  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${TTS_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode, ssmlGender: "NEUTRAL" },
          audioConfig: { audioEncoding: "MP3", speakingRate: 1.1 },
        }),
      }
    );
    const data = await res.json();
    if (data?.audioContent) {
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audio.play();
      return true;
    }
  } catch (e) {
    console.error("TTS error:", e);
  }
  return false;
}