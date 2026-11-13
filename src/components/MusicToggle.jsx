export default function MusicToggle({ isPlaying, message, onToggle }) {
  const musicLabel = isPlaying ? "Pause wedding music" : "Play wedding music";

  return (
    <>
      <button
        className="music-toggle"
        type="button"
        aria-label={musicLabel}
        aria-pressed={isPlaying}
        onClick={onToggle}
      >
        <span className="music-toggle__icon" aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
        <span className="sr-only">{musicLabel}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">{message}</span>
    </>
  );
}
