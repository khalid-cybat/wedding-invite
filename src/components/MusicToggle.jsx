import { useEffect, useRef, useState } from "react";

export default function MusicToggle() {
  const audioContextRef = useRef(null);
  const audioNodesRef = useRef([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => () => {
    audioNodesRef.current.forEach((node) => {
      if (typeof node.stop === "function") node.stop();
      node.disconnect();
    });
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
  }, []);

  function stopSound() {
    audioNodesRef.current.forEach((node) => {
      if (typeof node.stop === "function") node.stop();
      node.disconnect();
    });
    audioNodesRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    setIsPlaying(false);
  }

  function startSound() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      setMessage("Ambient sound is not supported in this browser.");
      return;
    }

    try {
      const context = new AudioContextConstructor();
      const master = context.createGain();
      master.gain.value = 0.018;
      master.connect(context.destination);

      const nodes = [master];
      [220, 277.18, 329.63].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const voice = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        voice.gain.value = index === 0 ? 0.55 : 0.24;
        oscillator.connect(voice);
        voice.connect(master);
        oscillator.start();
        nodes.push(oscillator, voice);
      });

      audioContextRef.current = context;
      audioNodesRef.current = nodes;
      setIsPlaying(true);
      setMessage("");
    } catch (error) {
      console.error("Could not start the ambient sound.", error);
      setMessage("Ambient sound could not be started in this browser.");
    }
  }

  return (
    <>
      <button
        className="music-toggle"
        type="button"
        aria-label={isPlaying ? "Pause soft ambient sound" : "Play soft ambient sound"}
        aria-pressed={isPlaying}
        onClick={isPlaying ? stopSound : startSound}
      >
        <span className="music-toggle__icon" aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
        <span className="sr-only">{isPlaying ? "Pause soft ambient sound" : "Play soft ambient sound"}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">{message}</span>
    </>
  );
}
