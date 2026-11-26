import { useEffect, useState } from "react";
import Reveal from "./Reveal.jsx";

function getRemainingTime(now, target) {
  const remainingMilliseconds = Math.max(0, target - now);
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

export default function Countdown({ events }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const eventTimes = events
    .map((event) => new Date(event.dateTime).getTime())
    .filter(Number.isFinite)
    .sort((left, right) => left - right);

  if (eventTimes.length === 0) return null;

  const countdownTarget = eventTimes[0];
  const celebrationEnd = eventTimes[eventTimes.length - 1];
  const remaining = getRemainingTime(now, countdownTarget);
  const celebrationStarted = now >= countdownTarget;
  const celebrationEnded = now >= celebrationEnd;
  const isEventDay = isSamePakistanDate(new Date(now), new Date(countdownTarget));

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
      <div className="countdown__grid" aria-label="Countdown to your first celebration" aria-live="off">
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
