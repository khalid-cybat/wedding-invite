import { useEffect, useState } from "react";

export default function InvitationCover({ onOpen }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isClosing) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(onOpen, prefersReducedMotion ? 0 : 950);
    return () => window.clearTimeout(timeout);
  }, [isClosing, onOpen]);

  return (
    <div
      className={`opening${isClosing ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Wedding invitation cover"
      aria-hidden={isClosing}
      hidden={isClosing && window.matchMedia("(prefers-reduced-motion: reduce)").matches}
    >
      <div className="opening__card">
        <div className="opening__artwork">
          <img
            className="opening__art"
            src="/assets/opening-arts.webp"
            alt="A cream wedding invitation envelope with floral embossing"
          />
        </div>
        <button className="open-invitation" type="button" autoFocus onClick={() => setIsClosing(true)}>
          <span className="open-invitation__arrow" aria-hidden="true">↓</span>
                    <span>Tap to open</span>

        </button>
      </div>
    </div>
  );
}
