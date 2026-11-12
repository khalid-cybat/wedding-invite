# Wedding invitation

This Vite + React site supports guest-specific invitation links. An admin can assign one or more celebrations to each guest or group; only the assigned event sections appear after the guest opens their link.

## Supabase setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/migrations/20261113000000_guest_invitations.sql`](./supabase/migrations/20261113000000_guest_invitations.sql).
3. In **Authentication → Users**, create the admin account. Disable public sign-ups in the Supabase Auth settings.
4. Copy the admin user's UUID from the Users page and allowlist it by running this SQL in the SQL Editor:

   ```sql
   insert into public.invitation_admins (user_id)
   values ('<ADMIN_AUTH_USER_UUID>');
   ```

5. Copy the project URL and anon/public key from **Project Settings → API** into a local `.env.local` file:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   The anon key is intended for browser use; the database policies and invitation lookup function restrict its access. Never put a Supabase service-role key in the frontend or commit credentials. [`.env.example`](./.env.example) shows the required variable names.
6. Install dependencies and start the app:

   ```sh
   npm install
   npm run dev
   ```

## Managing invitations

- Open `/?admin=1` on the deployed site and sign in with the allowlisted admin account.
- Create an invitation with a guest/group name and one or more of Manhandi, Barat, and Walima.
- Use **Copy link** to share its unique invitation URL. The URL contains an opaque random token, not the guest's name or event list.
- Change the selected events and save to update an invitation. Clear **Link active** and save to revoke it; an inactive link cannot be used.
- A plain site URL or invalid invitation link does not show the wedding details.

The existing general RSVP form is unchanged. RSVP replies continue to be saved in the guest's browser, not in Supabase.

## Build

```sh
npm run build
```
