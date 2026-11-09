import React, { useEffect, useRef, useState } from "react";
import "./FragranceVoiceDictation.css";

/**
 * Browser speech-to-text only. Never submits the query: the user reviews
 * the transcript and explicitly presses Find.
 */
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
      {error && <span className="playnice-fi-voice-error" role="status">{error}</span>}
      {listening && <span className="playnice-fi-voice-sr-only" role="status">{lang === "sr" ? "Slušam..." : "Listening..."}</span>}
    </>
  );
}
