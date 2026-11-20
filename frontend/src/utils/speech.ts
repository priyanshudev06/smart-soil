/**
 * Robust Cross-Browser Speech Synthesis for Indic Languages (Marathi, Hindi, English)
 * 
 * Windows, Android, and macOS browsers frequently lack a native 'mr-IN' TTS pack.
 * When 'mr-IN' is requested without fallback, the engine either fails silently or
 * uses an English voice to read Devanagari.
 * 
 * This utility:
 * 1. Proactively queries available voices.
 * 2. Matches native Marathi voices (mr-IN, mr).
 * 3. Intelligently falls back to Hindi (hi-IN, hi) which shares Devanagari phonology
 *    and pronounces Marathi text smoothly and accurately.
 * 4. Fixes Chrome background pauses with window.speechSynthesis.resume().
 */

let voicesCache: SpeechSynthesisVoice[] = [];

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesCache = voices;
      resolve(voices);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      voicesCache = window.speechSynthesis.getVoices();
      resolve(voicesCache);
    };

    // Fallback if event doesn't fire immediately
    setTimeout(() => {
      voicesCache = window.speechSynthesis.getVoices();
      resolve(voicesCache);
    }, 250);
  });
}

export async function speakText(
  text: string,
  targetLang: 'mr' | 'hi' | 'en' = 'mr',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<SpeechSynthesisUtterance | null> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('SpeechSynthesis not supported');
    return null;
  }

  // Cancel any previous speech & resume synth state
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  const voices = await loadVoices();
  const utterance = new SpeechSynthesisUtterance(text);

  let selectedVoice: SpeechSynthesisVoice | null = null;

  if (targetLang === 'mr') {
    // 1. Try finding a native Marathi voice
    selectedVoice = voices.find(v => 
      v.lang.toLowerCase().replace('_', '-').startsWith('mr') ||
      v.name.toLowerCase().includes('marathi') ||
      v.name.includes('मराठी')
    ) || null;

    // 2. If no native Marathi voice is installed on Windows/Chrome,
    // fallback to Hindi (hi-IN) which shares Devanagari phonetics and fluently pronounces Marathi text.
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        v.lang.toLowerCase().replace('_', '-').startsWith('hi') ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.includes('हिन्दी') ||
        v.name.toLowerCase().includes('kalpana') ||
        v.name.toLowerCase().includes('hemant')
      ) || null;
    }

    utterance.lang = selectedVoice ? selectedVoice.lang : 'hi-IN';
    utterance.rate = 0.88; // Slightly slower, very clear articulation for farmers
    utterance.pitch = 1.0;
  } else if (targetLang === 'hi') {
    selectedVoice = voices.find(v => 
      v.lang.toLowerCase().replace('_', '-').startsWith('hi') ||
      v.name.toLowerCase().includes('hindi') ||
      v.name.includes('हिन्दी')
    ) || null;

    utterance.lang = selectedVoice ? selectedVoice.lang : 'hi-IN';
    utterance.rate = 0.90;
    utterance.pitch = 1.0;
  } else {
    // English
    selectedVoice = voices.find(v => 
      v.lang.toLowerCase().includes('en-in') ||
      v.name.toLowerCase().includes('india')
    ) || voices.find(v => v.lang.toLowerCase().startsWith('en')) || null;

    utterance.lang = selectedVoice ? selectedVoice.lang : 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (e) => {
    // On user interrupt / cancel, don't treat as fatal
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      console.warn('SpeechSynthesis error:', e);
      onError?.(e);
    }
    onEnd?.();
  };

  // Chrome workaround for utterances getting stuck
  const timer = setInterval(() => {
    if (!window.speechSynthesis.speaking) {
      clearInterval(timer);
    } else {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }
  }, 10000);

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
