// Audio for drills. Uses the browser's built-in Web Speech API for now —
// zero setup, works today, but "acceptable robot voice" quality. This is a
// deliberate placeholder: the plan is to pre-generate real neural-TTS clips
// for the closed Tier 0-2 word list and swap the implementation of
// `speakWord` to play a static audio file instead. Every call site only
// depends on this function's signature, not on how the audio is produced.
let voicesReady: SpeechSynthesisVoice[] = [];

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const loadVoices = () => { voicesReady = window.speechSynthesis.getVoices(); };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickEnglishVoice(): SpeechSynthesisVoice | undefined {
  return (
    voicesReady.find((v) => v.lang.startsWith("en") && /female|child|samantha|zira/i.test(v.name)) ??
    voicesReady.find((v) => v.lang.startsWith("en"))
  );
}

export function speakWord(word: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = "en-US";
  utter.rate = 0.85;
  utter.pitch = 1.1;
  const voice = pickEnglishVoice();
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}
