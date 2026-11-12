import { useEffect, useState } from "react";
import Reveal from "./Reveal.jsx";

const COUNTDOWN_TARGET = new Date("2026-12-03T21:00:00+05:00");
const CELEBRATION_END = new Date("2026-12-06T16:00:00+05:00");

function getRemainingTime(now) {
  const remainingMilliseconds = Math.max(0, COUNTDOWN_TARGET.getTime() - now);
  const totalSeconds = Math.floor(remainingMilliseconds / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}

function isSamePakistanDate(left, right) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(left) === formatter.format(right);
}

export default function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  const remaining = getRemainingTime(now);
  const celebrationStarted = now >= COUNTDOWN_TARGET.getTime();
  const celebrationEnded = now >= CELEBRATION_END.getTime();
  const isEventDay = isSamePakistanDate(new Date(now), COUNTDOWN_TARGET);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const title = celebrationEnded
    ? "Thank You for Celebrating With Us"
    : celebrationStarted
      ? "The Celebration Has Begun"
      : "The Celebration Begins In";
  const message = celebrationEnded
    ? "Our hearts are full of gratitude for your love and support."
    : celebrationStarted
      ? isEventDay
        ? "We are so grateful to celebrate this day with you."
        : "We are so grateful to celebrate these days with you."
      : "";

  return (
    <Reveal as="section" className="countdown section-shell" aria-labelledby="countdown-title">
      <h2 className="script section-title" id="countdown-title">{title}</h2>
      <div className="countdown__grid" aria-label="Countdown to the first celebration" aria-live="off">
        {Object.entries(remaining).map(([unit, value], index) => (
          <FragmentUnit key={unit} unit={unit} value={value} showSeparator={index > 0} />
        ))}
      </div>
      {message && <p className="countdown__message">{message}</p>}
    </Reveal>
  );
}

function FragmentUnit({ unit, value, showSeparator }) {
  const labels = { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" };

  return (
    <>
      {showSeparator && <span className="countdown__separator" aria-hidden="true">:</span>}
      <div className="countdown__unit">
        <span>{String(value).padStart(2, "0")}</span>
        <small>{labels[unit]}</small>
      </div>
    </>
  );
}
