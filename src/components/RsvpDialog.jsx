import { useRef, useState } from "react";
import Reveal from "./Reveal.jsx";

const RSVP_STORAGE_KEY = "zain-wedding-rsvps";

export default function RsvpDialog() {
  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const [status, setStatus] = useState("");

  function openDialog() {
    setStatus("");
    dialogRef.current.showModal();
  }

  function closeOnBackdrop(event) {
    if (event.target === dialogRef.current) dialogRef.current.close();
  }

  function submitReply(event) {
    event.preventDefault();
    if (!formRef.current.reportValidity()) return;

    const reply = Object.fromEntries(new FormData(formRef.current).entries());

    try {
      const savedReplies = JSON.parse(localStorage.getItem(RSVP_STORAGE_KEY) || "[]");
      if (!Array.isArray(savedReplies)) {
        throw new TypeError("Saved RSVP data is not a list.");
      }

      savedReplies.push({ ...reply, submittedAt: new Date().toISOString() });
      localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(savedReplies));
      setStatus(reply.attendance === "yes"
        ? "Thank you! Your reply has been saved on this device."
        : "Thank you for letting us know. Your reply has been saved on this device.");
      formRef.current.reset();
    } catch (error) {
      console.error("Could not save this RSVP in local storage.", error);
      setStatus("Your browser could not save this reply. Please let the couple know directly.");
    }
  }

  return (
    <>
      <Reveal as="section" className="rsvp section-shell" aria-labelledby="rsvp-title">
        <h2 className="script section-title" id="rsvp-title">Confirm Your Attendance</h2>
        <p className="rsvp__intro">
          To help us prepare for a joyful celebration,<br />kindly confirm your attendance.
        </p>
        <button className="rsvp-seal" type="button" aria-label="Open RSVP form" onClick={openDialog}>
          <img src="/assets/wax-seal.webp" alt="" />
        </button>
        <p className="script rsvp__hint">Click to open <span aria-hidden="true">⌃</span></p>
      </Reveal>

      <dialog
        className="rsvp-dialog"
        aria-labelledby="rsvp-dialog-title"
        ref={dialogRef}
        onClick={closeOnBackdrop}
      >
        <button className="rsvp-dialog__close" type="button" aria-label="Close RSVP form" onClick={() => dialogRef.current.close()}>×</button>
        <p className="script section-title" id="rsvp-dialog-title">Kindly reply</p>
        <p className="rsvp-dialog__subtitle">We would be delighted to celebrate with you.</p>
        <form className="rsvp-form" ref={formRef} onSubmit={submitReply}>
          <label htmlFor="guest-name">Your name</label>
          <input id="guest-name" name="name" autoComplete="name" required />
          <label htmlFor="attendance">Will you be joining us?</label>
          <select id="attendance" name="attendance" required defaultValue="">
            <option value="">Please choose</option>
            <option value="yes">Joyfully accepts</option>
            <option value="no">Regretfully declines</option>
          </select>
          <label htmlFor="guest-count">Number of guests</label>
          <select id="guest-count" name="guests" defaultValue="1">
            <option value="1">1 guest</option>
            <option value="2">2 guests</option>
            <option value="3">3 guests</option>
            <option value="4">4 guests</option>
          </select>
          <label htmlFor="guest-note">A note for the couple <span>(optional)</span></label>
          <textarea id="guest-note" name="note" rows="3"></textarea>
          <button className="submit-rsvp" type="submit">Send your reply</button>
          <p className="rsvp-form__status" role="status" aria-live="polite">{status}</p>
        </form>
      </dialog>
    </>
  );
}
