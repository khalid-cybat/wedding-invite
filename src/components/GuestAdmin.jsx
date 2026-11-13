import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabase.js";

const EVENTS = [
  { id: "manhandi", label: "Manhandi" },
  { id: "barat", label: "Barat" },
  { id: "walima", label: "Walima" }
];

function makeInvitationToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function invitationUrl(token) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("invite", token);
  return url.toString();
}

export default function GuestAdmin() {
  const supabase = getSupabaseClient();
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [guests, setGuests] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAdmin(false);
      setGuests([]);
      setError("");
      setMessage("");
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError("Could not check your sign-in status. Please refresh and try again.");
      setSession(data.session);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const loadGuests = useCallback(async () => {
    if (!supabase) return;
    const { data, error: loadError } = await supabase
      .from("guests")
      .select("id, name, recipient_type, invitation_token, event_ids, active, created_at")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError("Could not load guest invitations. Check the Supabase setup and try again.");
      return;
    }

    setGuests(data);
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) {
      setAdminLoading(false);
      setIsAdmin(false);
      return;
    }

    let active = true;
    setAdminLoading(true);
    supabase
      .from("invitation_admins")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(async ({ data, error: lookupError }) => {
        if (!active) return;
        if (lookupError) {
          setError("Could not verify admin access. Check the Supabase access policies.");
          setAdminLoading(false);
          return;
        }

        setIsAdmin(Boolean(data));
        if (data) await loadGuests();
        if (active) setAdminLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadGuests, session, supabase]);

  async function signIn(event) {
    event.preventDefault();
    if (!supabase) return;
    setError("");
    setMessage("");
    setSaving(true);
    const formData = new FormData(event.currentTarget);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.get("email"),
      password: formData.get("password")
    });
    setSaving(false);
    if (signInError) setError("Sign-in failed. Check your email and password.");
  }

  async function signOut() {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError("Could not sign out. Please try again.");
      return;
    }
    setMessage("You have signed out.");
  }

  async function createGuest(event) {
    event.preventDefault();
    if (!supabase) return;
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const recipientType = formData.get("recipientType");
    const eventIds = formData.getAll("eventIds");
    if (!name || !["guest", "group"].includes(recipientType) || eventIds.length === 0) {
      setError("Enter a guest or group name and select at least one event.");
      return;
    }

    let token;
    try {
      token = makeInvitationToken();
    } catch (tokenError) {
      console.error("Could not generate an invitation token.", tokenError);
      setError("This browser could not create a secure invitation link. Please use a modern browser over HTTPS.");
      return;
    }

    setSaving(true);
    const { error: insertError } = await supabase.from("guests").insert({
      name,
      recipient_type: recipientType,
      event_ids: eventIds,
      invitation_token: token
    });
    setSaving(false);

    if (insertError) {
      console.error("Could not create this guest invitation.", insertError);
      setError("Could not create the invitation. Check the selected events and Supabase access policies.");
      return;
    }

    form.reset();
    await loadGuests();
    setMessage(`Invitation created for ${name}. Use its Copy link button below.`);
  }

  async function saveGuest(event, guestId) {
    event.preventDefault();
    if (!supabase) return;
    setError("");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const recipientType = formData.get("recipientType");
    const eventIds = formData.getAll("eventIds");
    if (!name || !["guest", "group"].includes(recipientType) || eventIds.length === 0) {
      setError("Each guest needs a name and at least one selected event.");
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase
      .from("guests")
      .update({
        name,
        recipient_type: recipientType,
        event_ids: eventIds,
        active: formData.get("active") === "on"
      })
      .eq("id", guestId);
    setSaving(false);

    if (updateError) {
      console.error("Could not update this guest invitation.", updateError);
      setError("Could not save this invitation. Check the selected events and Supabase access policies.");
      return;
    }

    await loadGuests();
    setMessage(`Invitation updated for ${name}.`);
  }

  async function copyInvitationLink(token) {
    setError("");
    setMessage("");
    try {
      await navigator.clipboard.writeText(invitationUrl(token));
      setMessage("Invitation link copied.");
    } catch (copyError) {
      console.error("Could not copy the invitation link.", copyError);
      setError("Could not copy the link. Check clipboard permissions and try again.");
    }
  }

  if (!supabase) {
    return (
      <AdminShell>
        <h1 className="script section-title">Guest Invitations</h1>
        <p>Admin access is not configured yet. Add the Supabase URL and anon key to your environment, then reload this page.</p>
      </AdminShell>
    );
  }

  if (authLoading || adminLoading) {
    return <AdminShell><p role="status">Checking admin access…</p></AdminShell>;
  }

  if (!session) {
    return (
      <AdminShell>
        <h1 className="script section-title">Guest Invitations</h1>
        <p className="admin__intro">Sign in to create invitations and choose which celebrations each guest can attend.</p>
        <form className="admin-form" onSubmit={signIn}>
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" name="email" type="email" autoComplete="username" required />
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" name="password" type="password" autoComplete="current-password" required />
          <button className="submit-rsvp" type="submit" disabled={saving}>Sign in</button>
        </form>
        <AdminMessage error={error} message={message} />
      </AdminShell>
    );
  }

  if (!isAdmin) {
    return (
      <AdminShell>
        <h1 className="script section-title">Guest Invitations</h1>
        <p>This account does not have permission to manage invitations.</p>
        <button className="admin__secondary-button" type="button" onClick={signOut}>Sign out</button>
        <AdminMessage error={error} message={message} />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <header className="admin__header">
        <div>
          <h1 className="script section-title">Guest Invitations</h1>
          <p className="admin__intro">Assign events and share a private link with each guest or group.</p>
        </div>
        <button className="admin__secondary-button" type="button" onClick={signOut}>Sign out</button>
      </header>

      <section className="admin-card" aria-labelledby="create-guest-title">
        <h2 className="script section-title" id="create-guest-title">Create an invitation</h2>
        <form className="admin-form" onSubmit={createGuest}>
          <label htmlFor="new-guest-name">Guest or group name</label>
          <input id="new-guest-name" name="name" maxLength="120" required />
          <label htmlFor="new-recipient-type">Invitation type</label>
          <select id="new-recipient-type" name="recipientType" defaultValue="guest">
            <option value="guest">Individual guest</option>
            <option value="group">Group</option>
          </select>
          <fieldset className="admin-events">
            <legend>Events they may attend</legend>
            {EVENTS.map((event) => (
              <label key={event.id}>
                <input type="checkbox" name="eventIds" value={event.id} />
                {event.label}
              </label>
            ))}
          </fieldset>
          <button className="submit-rsvp" type="submit" disabled={saving}>Create invitation</button>
        </form>
      </section>

      <AdminMessage error={error} message={message} />

      <section className="admin-list" aria-labelledby="guest-list-title">
        <h2 className="script section-title" id="guest-list-title">Invitations ({guests.length})</h2>
        {guests.length === 0
          ? <p>No invitations yet. Create one above to get started.</p>
          : guests.map((guest) => (
            <form className="admin-card admin-guest" key={guest.id} onSubmit={(event) => saveGuest(event, guest.id)}>
              <label htmlFor={`guest-name-${guest.id}`}>Guest or group name</label>
              <input id={`guest-name-${guest.id}`} name="name" defaultValue={guest.name} maxLength="120" required />
              <label htmlFor={`guest-type-${guest.id}`}>Invitation type</label>
              <select
                id={`guest-type-${guest.id}`}
                name="recipientType"
                defaultValue={guest.recipient_type ?? "guest"}
              >
                <option value="guest">Individual guest</option>
                <option value="group">Group</option>
              </select>
              <fieldset className="admin-events">
                <legend>Allowed events</legend>
                {EVENTS.map((event) => (
                  <label key={event.id} htmlFor={`guest-${guest.id}-${event.id}`}>
                    <input
                      id={`guest-${guest.id}-${event.id}`}
                      type="checkbox"
                      name="eventIds"
                      value={event.id}
                      defaultChecked={guest.event_ids.includes(event.id)}
                    />
                    {event.label}
                  </label>
                ))}
              </fieldset>
              <label className="admin-active" htmlFor={`guest-active-${guest.id}`}>
                <input
                  id={`guest-active-${guest.id}`}
                  type="checkbox"
                  name="active"
                  defaultChecked={guest.active}
                />
                Link active
              </label>
              <div className="admin-guest__actions">
                <button className="submit-rsvp" type="submit" disabled={saving}>Save changes</button>
                <button
                  className="admin__secondary-button"
                  type="button"
                  disabled={!guest.active}
                  onClick={() => copyInvitationLink(guest.invitation_token)}
                >
                  Copy link
                </button>
              </div>
              {!guest.active && <p className="admin-guest__revoked">This invitation link has been revoked.</p>}
            </form>
          ))}
      </section>
    </AdminShell>
  );
}

function AdminShell({ children }) {
  return (
    <>
      <div className="paper-grain" aria-hidden="true"></div>
      <main className="admin section-shell">
        <a className="admin__back-link" href="/">← Back to invitation</a>
        {children}
      </main>
    </>
  );
}

function AdminMessage({ error, message }) {
  if (!error && !message) return null;
  return (
    <p className={`admin__message${error ? " admin__message--error" : ""}`} role={error ? "alert" : "status"}>
      {error || message}
    </p>
  );
}
