export class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeRecognition();
  }

  private initializeRecognition() {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
  }

  startListening(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void
  ): boolean {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser');
      return false;
    }

    if (this.isListening) {
      return false;
    }

    this.isListening = true;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      this.isListening = false;
      onError?.('Failed to start speech recognition');
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, onEnd?: () => void) {
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      onEnd?.();
    };

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    this.synthesis.cancel();
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
  }

  interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
  }

  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }

  var SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };
}
