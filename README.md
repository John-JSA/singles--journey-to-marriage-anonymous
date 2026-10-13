# Singles’ Journey to Marriage — Anonymous Questions

A complete Next.js application for GitHub + Vercel, with shared storage in Supabase.

## Features
- Official WhatsApp group display picture and WhatsApp/Telegram invitation buttons.
- Starts empty: no prewritten questions, quizzes, or lessons. Participants write their own marriage and relationship questions.
- Create rooms and invite participants by link or eight-character code.
- Questions appear immediately; participant names are neither requested nor stored.
- Host can publish answers and pause new submissions.
- No question approval or hide controls.
- Anonymous upvotes, question search, sorting, and mobile layout.
- Shared board refreshes every six seconds.

## 1. Create the database
1. Open https://supabase.com/dashboard and create a project (or use an existing project).
2. Open **SQL Editor → New query**.
3. Copy all text from `supabase/setup.sql`, paste it into the query, and click **Run**.
4. In the project settings, locate your **Project URL** and **secret API key**. Legacy `service_role` keys are supported too. A publishable/anon key will not work for this server-only database access.

The tables use the `sjm_` prefix, so they do not conflict with the `profiles` or learning-platform tables. Row Level Security blocks direct browser access; only the server uses the secret key.

## 2. Upload the project to GitHub
1. Download and extract this ZIP.
2. On https://github.com/new create a repository named `singles-journey-questions` (a private repository is fine).
3. Choose **uploading an existing file** or **Add file → Upload files**.
4. Open the extracted `singles-journey-vercel` folder. Upload its **contents**, not the ZIP itself. `package.json`, `app`, and `supabase` must appear at the repository root.
5. Include `.gitignore` and `.env.example` if uploading through your computer. Never upload actual secret keys or `.env.local`.
6. Commit the files.

## 3. Deploy on Vercel
1. Open https://vercel.com/new, connect GitHub, and import the repository.
2. Framework preset: **Next.js**. Root Directory: leave at repository root.
3. Keep the default Install Command and Build Command (`npm run build`). Use Node.js 22 or later.
4. Add these environment variables before deploying:

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | Your Supabase project URL, such as `https://abc.supabase.co` |
| `SUPABASE_SECRET_KEY` | Your secret API key, or legacy service_role key |

Set them for Production and Preview if you want both environments to work. Do not prefix these names with `NEXT_PUBLIC_`.
5. Click **Deploy**.
6. If you add or change variables later, redeploy so the new values are applied.
7. If Vercel Deployment Protection restricts visitors, configure access for the audience you intend to invite. Test the participant link in a signed-out browser before sharing it widely.

## 4. Use the application
1. Open the Vercel URL and create a room.
2. Click **Save host link**. The copied URL contains a private host secret. Keep it confidential; anyone holding it can answer questions and pause that room.
3. Click **Copy invite link** and share that participant link.
4. Participants type a question and press **Send anonymously**. No login or name field is built into this app.
5. Everyone in the room sees submissions automatically; the host can publish answers.

The host credential also stays in the browser's session storage. Save the host link to recover host access after closing the browser. Participants only receive the room code; they do not receive the host secret.

## Privacy and practical limits
- The question database does not store participant names, emails, or IP addresses. People can still identify themselves through the text they write.
- Vercel and Supabase may process technical access logs. Anonymous on the board is not a promise of complete anonymity from hosting providers.
- A random device vote token is stored locally; only a hash of the question ID and token is stored with a vote. This reduces repeat votes in the same browser, but is not a one-person-one-vote guarantee.
- There is a simple room-wide submission limit of 30 questions per minute. It is not a complete abuse-prevention service.
- The board displays up to the latest 500 questions in each room.
- This export starts with a new database. Existing rooms/questions on the earlier hosted site are not migrated automatically.
- Preview and Production use the same database if you supply the same Supabase variables.

## Local development (optional)
1. Install Node.js 22 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in your own values.
4. Run `npm run dev` and open http://localhost:3000.
5. `npm run build` checks and builds the production application.

## Files
- `app/page.tsx`: participant and host interface.
- `app/globals.css`: branding and responsive design.
- `app/api/rooms/route.ts`: server-only database and host authorization.
- `supabase/setup.sql`: database setup.
- `.env.example`: environment variable names without credentials.

Reference documentation:
- https://vercel.com/docs/deployments/git/vercel-for-github
- https://vercel.com/docs/environment-variables
- https://supabase.com/docs/guides/getting-started/api-keys

Community links open WhatsApp or Telegram in a new tab. These services may show your account identity to other group members; anonymity applies to questions submitted on this platform.
