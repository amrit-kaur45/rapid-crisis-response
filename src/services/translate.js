export const SUPPORTED_LANGUAGES = [
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

export async function translateText(text, targetLang) {
  // Translation disabled — returns original text
  return text;
}

export async function translateToAll(text) {
  const results = {};
  SUPPORTED_LANGUAGES.forEach(lang => { results[lang.code] = text; });
  return results;
}

export async function textToSpeech(text, languageCode = "en-US") {
  // TTS disabled — use browser built-in as fallback
  if ("speechSynthesis" in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = languageCode;
    window.speechSynthesis.speak(utter);
    return true;
  }
  return false;
}