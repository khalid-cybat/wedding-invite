import Reveal from "./Reveal.jsx";

export default function VenueSection({ venue }) {
  return (
    <Reveal
      as="section"
      className="location section-shell"
      aria-labelledby={`${venue.id}-title`}
      id={venue.id}
    >
      <h2 className="script section-title" id={`${venue.id}-title`}>{venue.celebration}</h2>
      <img className="location__ornament" src="/assets/ornament-divider.webp" alt="" />
      <p className="location__name">{venue.name}</p>
      <p className="location__address">
        {venue.addressLines.map((line, index) => (
          <span key={line}>{index > 0 && <br />}{line}</span>
        ))}
      </p>
      <img className="mosque" src={venue.image} alt={venue.imageAlt} loading="lazy" />

      <Reveal as="section" className="events section-shell" aria-labelledby={`${venue.id}-events-title`}>
        <div className="paper-card events__card">
          <h3 className="script section-title" id={`${venue.id}-events-title`}>
            <span aria-hidden="true">❧</span> Schedule of Events <span aria-hidden="true">❧</span>
          </h3>
          <p className="event_date">{venue.scheduleDate}</p>
          <ol className="timeline">
            {venue.events.map((event, index) => (
              <li className="timeline__item" key={`${event.dateTime}-${event.label}`}>
                <time dateTime={event.dateTime}>{event.time}</time>
                <span className="timeline__marker" aria-hidden="true">{index === 0 ? "✿" : "◆"}</span>
                <span>{event.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      <div className="map-frame">
        <iframe
          title={`Map showing ${venue.name}`}
          src={venue.mapEmbed}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <a className="text-link" href={venue.directions} target="_blank" rel="noreferrer">
        Open directions <span aria-hidden="true">↗</span>
      </a>
    </Reveal>
  );
}
