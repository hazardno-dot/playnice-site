import React, { useEffect, useRef, useState } from "react";
import "./FragranceVoiceDictation.css";

/**
 * Browser speech-to-text only. Never submits the query: the user reviews
 * the transcript and explicitly presses Find.
 */

// The waveform reads microphone levels locally through Web Audio.
// It does not record, store or upload the sampled audio.
function LiveVoiceWaveform({ active }) {
  const canvasRef = useRef(null);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!active) {
      setAvailable(false);
      return undefined;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass || !navigator.mediaDevices?.getUserMedia) return undefined;

    let cancelled = false;
    let stream;
    let audioContext;
    let frame = 0;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        audioContext = new AudioContextClass();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.7;
        source.connect(analyser);
        if (audioContext.state === "suspended") await audioContext.resume();
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = 100;
        const height = 26;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.scale(dpr, dpr);
        const frequencies = new Uint8Array(analyser.frequencyBinCount);
        const count = 24;
        const step = 4;
        setAvailable(true);

        const draw = () => {
          if (cancelled) return;
          analyser.getByteFrequencyData(frequencies);
          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = "#e8bd72";
          for (let i = 0; i < count; i += 1) {
            const bin = Math.min(frequencies.length - 1, Math.floor(3 + Math.pow(i / count, 1.6) * 72));
            const magnitude = frequencies[bin] / 255;
            const barHeight = 2 + Math.min(1, magnitude * 2.6) * 21;
            const x = i * step + 2;
            const y = (height - barHeight) / 2;
            ctx.globalAlpha = 0.45 + Math.min(0.55, magnitude * 1.6);
            ctx.fillRect(x, y, 2.2, barHeight);
          }
          ctx.globalAlpha = 1;
          frame = window.requestAnimationFrame(draw);
        };
        draw();
      } catch {
        // Dictation may still work even if direct microphone level access is unavailable.
        setAvailable(false);
      }
    };
    start();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (audioContext) audioContext.close().catch(() => {});
    };
  }, [active]);

  if (!active) return null;
  return (
    <span className={`playnice-fi-live-waveform ${available ? "is-available" : ""}`} aria-hidden="true">
      <canvas ref={canvasRef} width="100" height="26" />
    </span>
  );
}

export default function FragranceVoiceDictation({ lang, onTranscript }) {
  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }, []);

  useEffect(() => {
    // Stop the old language session and release the mic on unmount.
    return () => {
      if (recognitionRef.current) {
        const old = recognitionRef.current;
        recognitionRef.current = null;
        old.onresult = null;
        old.onerror = null;
        old.onend = null;
        old.abort();
      }
      setListening(false);
    };
  }, [lang]);

  const toggle = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;

    setError("");
    const session = new Recognition();
    session.lang = lang === "sr" ? "sr-RS" : "en-US";
    session.continuous = false;
    session.interimResults = false;
    session.maxAlternatives = 1;

    session.onresult = (event) => {
      const transcript = Array.from(event.results || [])
        .filter((result) => result.isFinal)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();
      if (transcript) onTranscriptRef.current(transcript);
    };
    session.onerror = (event) => {
      if (event.error !== "aborted") {
        const messages = {
          "not-allowed": lang === "sr" ? "Dozvoli pristup mikrofonu u browseru." : "Allow microphone access in your browser.",
          "service-not-allowed": lang === "sr" ? "Prepoznavanje govora nije dozvoljeno." : "Speech recognition is not permitted.",
          "no-speech": lang === "sr" ? "Govor nije prepoznat. Pokušaj ponovo." : "No speech detected. Please try again.",
          "network": lang === "sr" ? "Prepoznavanje govora trenutno nije dostupno." : "Speech recognition is temporarily unavailable.",
          "language-not-supported": lang === "sr" ? "Izabrani jezik nije podržan." : "The selected language is not supported.",
        };
        setError(messages[event.error] || (lang === "sr" ? "Diktiranje nije uspelo. Pokušaj ponovo." : "Dictation failed. Please try again."));
      }
    };
    session.onend = () => {
      if (recognitionRef.current === session) {
        recognitionRef.current = null;
        setListening(false);
      }
    };

    recognitionRef.current = session;
    try {
      session.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setError(lang === "sr" ? "Mikrofon nije dostupan." : "Microphone unavailable.");
    }
  };

  if (!supported) return null;

  return (
    <>
      <button
        type="button"
        className={`playnice-fi-voice ${listening ? "is-listening" : ""}`}
        onClick={toggle}
        aria-pressed={listening}
        aria-label={lang === "sr"
          ? (listening ? "Zaustavi diktiranje" : "Diktiraj pitanje")
          : (listening ? "Stop dictation" : "Dictate your question")}
        title={lang === "sr"
          ? (listening ? "Zaustavi diktiranje" : "Diktiraj pitanje")
          : (listening ? "Stop dictation" : "Dictate your question")}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="2.5" width="6" height="12" rx="3" />
          <path d="M5.5 10.5a6.5 6.5 0 0 0 13 0M12 17v4m-4 0h8" />
        </svg>
      </button>
      <LiveVoiceWaveform active={listening} />
      {error && <span className="playnice-fi-voice-error" role="status">{error}</span>}
      {listening && <span className="playnice-fi-voice-sr-only" role="status">{lang === "sr" ? "Slušam..." : "Listening..."}</span>}
    </>
  );
}
