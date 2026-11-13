import { useCallback, useEffect, useRef, useState } from "react";
import Countdown from "./components/Countdown.jsx";
import GuestAdmin from "./components/GuestAdmin.jsx";
import InvitationCover from "./components/InvitationCover.jsx";
import MusicToggle from "./components/MusicToggle.jsx";
import Reveal from "./components/Reveal.jsx";
import RsvpDialog from "./components/RsvpDialog.jsx";
import VenueSection from "./components/VenueSection.jsx";
import { getSupabaseClient } from "./lib/supabase.js";

const venues = [
  {
    id: "manhandi",
    celebration: "Manhandi",
    name: "Green Villas",
    addressLines: [
      "near Khajooron Wala Bagh / Manan Town, Millat Road,",
      "Faisalabad, PK 38000"
    ],
    image: "/assets/house.webp",
    imageAlt: "Illustration of the house",
    scheduleDate: "03-December-2026",
    events: [
      { time: "9 PM", dateTime: "2026-12-03T21:00:00+05:00", label: <>Guest<br />Arrival</> },
      { time: "10 PM", dateTime: "2026-12-03T22:00:00+05:00", label: <>Manhandi<br />Ceremony</> },
      { time: "11 PM", dateTime: "2026-12-03T23:00:00+05:00", label: "Dinner" },
      { time: "1 AM", dateTime: "2026-12-04T01:00:00+05:00", label: "Dance" }
    ],
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3402.9316381008507!2d73.10034317448967!3d31.471066649578518!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392269f9f0fabcd9%3A0x1e73d9fe7c0810c8!2sGreen%20villas!5e0!3m2!1sen!2s!4v1794469128771!5m2!1sen!2s",
    directions: "https://www.google.com/maps/place/Green+villas/@31.4344825,73.0686526,13z/data=!4m10!1m2!2m1!1sGreen+Villas!3m6!1s0x392269f9f0fabcd9:0x1e73d9fe7c0810c8!8m2!3d31.4710621!4d73.1029181!15sCgxHcmVlbiBWaWxsYXNaDiIMZ3JlZW4gdmlsbGFzkgEPaG91c2luZ19jb21wbGV4mgFEQ2k5RFFVbFJRVU52WkVOb2RIbGpSamx2VDJzeFRsTkZNVEJoYkhCelZrZFdTMlZzY0daa2JYQnFVMnc1UjFOSFl4QULgAQD6AQQIABAy!16s%2Fg%2F11h_3_5n1k?entry=ttu&g_ep=EgoyMDI2MTEwOS4wIKXMDSoASAFQAw%3D%3D"
  },
  {
    id: "barat",
    celebration: "Barat",
    name: "The Chenab Club",
    addressLines: [
      "C3FQ+HCF, Sargodha Rd, Civil Lines",
      "Faisalabad, PK 38000"
    ],
    image: "/assets/Chenab_Club.webp",
    imageAlt: "Illustration of The Chenab Club",
    scheduleDate: "05-December-2026",
    events: [
      { time: "12 PM", dateTime: "2026-12-05T12:00:00+05:00", label: <>Guest<br />Arrival</> },
      { time: "1 PM", dateTime: "2026-12-05T13:00:00+05:00", label: <>Nikkah<br />Ceremony</> },
      { time: "2 PM", dateTime: "2026-12-05T14:00:00+05:00", label: <>Mocktail<br />Hour</> },
      { time: "3 PM", dateTime: "2026-12-05T15:00:00+05:00", label: "Lunch" },
      { time: "4 PM", dateTime: "2026-12-05T16:00:00+05:00", label: "Thanks For Coming" }
    ],
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2241.4040952557707!2d73.0871650841921!3d31.42334152194392!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39226820619cfde1%3A0xe422d5b0d0d044d8!2sThe%20Chenab%20Club%20(G)!5e0!3m2!1sen!2s!4v1794413508575!5m2!1sen!2s",
    directions: "https://maps.google.com/?q=the+chenab+club"
  },
  {
    id: "walima",
    celebration: "Walima",
    name: "The Hilton Gardan",
    addressLines: [
      "F58H+P7H, Lahore - Sheikhupura - Faisalabad Rd, Gutt wala",
      "Faisalabad, PK 38000"
    ],
    image: "/assets/Hilton_Garden.webp",
    imageAlt: "Illustration of The Hilton Gardan",
    scheduleDate: "06-December-2026",
    events: [
      { time: "12 PM", dateTime: "2026-12-06T12:00:00+05:00", label: <>Guest<br />Arrival</> },
      { time: "1 PM", dateTime: "2026-12-06T13:00:00+05:00", label: <>Walima<br />Ceremony</> },
      { time: "2 PM", dateTime: "2026-12-06T14:00:00+05:00", label: <>Mocktail<br />Hour</> },
      { time: "3 PM", dateTime: "2026-12-06T15:00:00+05:00", label: "Lunch" },
      { time: "4 PM", dateTime: "2026-12-06T16:00:00+05:00", label: "Thanks For Coming" }
    ],
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.08650042729!2d73.17825492883607!3d31.466806600000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39226900758f4fc3%3A0x1bf6b5ba63e81d86!2sThe%20Hilton%20Garden!5e0!3m2!1sen!2s!4v1794414157331!5m2!1sen!2s",
    directions: "https://maps.google.com/?q=the+hilton+garden"
  }
];

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const isAdminPage = searchParams.has("admin");
  const invitationToken = searchParams.get("invite");
  const [invitation, setInvitation] = useState(null);
  const [invitationStatus, setInvitationStatus] = useState(invitationToken ? "loading" : "missing");
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const [isCoverVisible, setIsCoverVisible] = useState(true);
  const audioRef = useRef(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicMessage, setMusicMessage] = useState("");

  const startMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setMusicMessage("");
    try {
      audio.play().catch((error) => {
        console.error("Could not start the wedding music.", error);
        setIsMusicPlaying(false);
        setMusicMessage("Music could not be played. Check that public/audio/wedding-music.mp3 exists.");
      });
    } catch (error) {
      console.error("Could not start the wedding music.", error);
      setIsMusicPlaying(false);
      setMusicMessage("Music could not be played. Check that public/audio/wedding-music.mp3 exists.");
    }
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      startMusic();
    } else {
      audio.pause();
      setMusicMessage("");
    }
  }, [startMusic]);

  useEffect(() => {
    if (!invitationToken) {
      setInvitation(null);
      setInvitationStatus("missing");
      return undefined;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setInvitationStatus("unconfigured");
      return undefined;
    }

    let active = true;
    setInvitationStatus("loading");
    supabase.rpc("get_guest_invitation", { p_invitation_token: invitationToken })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Could not validate this invitation link.", error);
          setInvitationStatus("error");
          return;
        }

        const guest = Array.isArray(data) ? data[0] : null;
        if (!guest?.guest_name || !Array.isArray(guest.event_ids) || guest.event_ids.length === 0) {
          setInvitationStatus("invalid");
          return;
        }

        if (!["guest", "group"].includes(guest.recipient_type)) {
          setInvitationStatus("invalid");
          return;
        }

        setInvitation({
          guestName: guest.guest_name,
          recipientType: guest.recipient_type,
          eventIds: guest.event_ids
        });
        setInvitationStatus("ready");
      });

    return () => {
      active = false;
    };
  }, [invitationToken]);

  const openInvitation = useCallback(() => {
    setIsInvitationOpen(true);
    setIsCoverVisible(false);
  }, []);

  useEffect(() => {
    if (invitation && isInvitationOpen) {
      document.title = invitation.recipientType === "guest"
        ? `Wedding Invitation for ${invitation.guestName}`
        : "Zain — Wedding Invitation";
      document.getElementById("couple-names")?.focus({ preventScroll: true });
    }
  }, [invitation, isInvitationOpen]);

  useEffect(() => () => audioRef.current?.pause(), []);

  if (isAdminPage) return <GuestAdmin />;

  if (invitationStatus !== "ready") {
    const accessMessage = {
      missing: "This wedding invitation is available through a personal link. Please contact the person who shared it if your link is missing.",
      loading: "Opening your invitation…",
      unconfigured: "This invitation link is not available right now. Please try again later.",
      invalid: "This invitation link is invalid or is no longer active. Please contact the person who shared it.",
      error: "We could not load this invitation right now. Please check your connection and try again."
    }[invitationStatus];

    return (
      <>
        <div className="paper-grain" aria-hidden="true"></div>
        <main className="invitation-access section-shell" aria-live="polite">
          <h1 className="script section-title">Wedding Invitation</h1>
          <p>{accessMessage}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="paper-grain" aria-hidden="true"></div>
      <audio
        className="sr-only"
        ref={audioRef}
        src="/audio/wedding-music.mp3"
        loop
        preload="none"
        onPlay={() => setIsMusicPlaying(true)}
        onPause={() => setIsMusicPlaying(false)}
        onError={() => {
          console.error("Could not load /audio/wedding-music.mp3.");
          setIsMusicPlaying(false);
          setMusicMessage("Music file not found. Add wedding-music.mp3 to public/audio.");
        }}
      />
      {isCoverVisible && <InvitationCover onOpen={openInvitation} onStartMusic={startMusic} />}

      <main
        className="invitation"
        id="invitation"
        inert={!isInvitationOpen}
        aria-hidden={!isInvitationOpen}
        aria-label={invitation.recipientType === "guest"
          ? `Wedding invitation for ${invitation.guestName}`
          : "Wedding invitation"}
      >
        <MusicToggle
          isPlaying={isMusicPlaying}
          message={musicMessage}
          onToggle={toggleMusic}
        />
        <Reveal as="section" className="hero section-shell" aria-labelledby="couple-names">
          <div className="hero__top">
            <p className="script hero__occasion">Wedding Invite By</p>

            <p className="hero__date" aria-hidden="true"></p>
            <h1 className="script hero__names" id="couple-names" tabIndex="-1">
              {invitation.recipientType === "guest" ? invitation.guestName : "Zain"}
            </h1>

            <a className="scroll-cue script" href="#welcome">
              Scroll down <span aria-hidden="true">⌄</span>
            </a>
          </div>

          <div className="bouquet bouquet--hero" aria-hidden="true">
            <img className="bouquet__flower bouquet__flower--left" src="/assets/bouquet-left.webp" alt="" />
            <img className="bouquet__flower bouquet__flower--right" src="/assets/bouquet-right.webp" alt="" />
          </div>

          <Reveal as="article" className="welcome-card paper-card" id="welcome">
            <img className="arabic" src="/assets/arabic-bismillah.webp" alt="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" lang="ar" dir="rtl" />
            <p className="script welcome-card__poem">Two Souls<br />One destiny<br />A Lifetime written by Allah</p>
            <p className="welcome-card__copy">
              Dear Friends and Family<br />
              Join us for an evening of love, laughter, duas, and unforgettable memories as we begin our forever.
            </p>
          </Reveal>
        </Reveal>

        <Countdown />

        {venues
          .filter((venue) => invitation.eventIds.includes(venue.id))
          .map((venue) => <VenueSection key={venue.id} venue={venue} />)}

        <Reveal as="section" className="details section-shell" aria-label="Guest notes">
          <div className="paper-card details__card">
            <img className="details__flower details__flower--top" src="/assets/detail-flower-top.webp" alt="" />
            <h2 className="script section-title">Dress Code</h2>
            <p>We kindly ask guests to avoid deep red and maroon attire for the celebration.</p>
            <span className="details__divider" aria-hidden="true">✧</span>
            <h2 className="script section-title">Gift Preference</h2>
            <p>Kindly, no boxed gifts please.</p>
            <img className="details__flower details__flower--bottom" src="/assets/detail-flower-bottom.webp" alt="" />
          </div>
        </Reveal>

        <RsvpDialog />

        <Reveal as="section" className="closing section-shell" aria-labelledby="closing-title">
          <p className="script section-title" id="closing-title">Hope to see you there!</p>
          <p className="closing__names">Zain</p>
          <p className="closing__footnote">With love, and gratitude</p>
        </Reveal>

        <footer className="footer">Made with love <span aria-hidden="true">♡</span></footer>
      </main>
    </>
  );
}
