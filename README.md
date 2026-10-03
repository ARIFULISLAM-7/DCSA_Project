# Havenwork — plain HTML/CSS/JS job portal

This is a static rebuild of the original Next.js + MySQL/Drizzle job portal,
using nothing but HTML, CSS, and vanilla JavaScript.

## Running it

No build step, no npm install. Just serve the folder and open it:

```bash
cd job-portal-html
python3 -m http.server 5500
# then open http://localhost:5500
```

(Opening `index.html` directly by double-clicking mostly works too, but a
local server avoids occasional browser restrictions on `localStorage`.)

Demo accounts (seeded automatically on first load):
- **demo / password123** — candidate account
- **technova / password123** — employer account (TechNova Inc.)
- **buildworks / password123** — employer account (BuildWorks Studio)

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Landing page, hero search, featured jobs |
| `jobs.html` | Full listing with filters (work type, location type, level) and pagination |
| `job-details.html?id=` | Job detail + apply modal |
| `login.html` / `register.html` | Auth (role: candidate or employer) |
| `applicant-dashboard.html` | Candidate overview, profile completeness, recent applications |
| `applicant-applied.html` | All of a candidate's applications and their status |
| `applicant-settings.html` | Candidate profile + resume "uploads" |
| `employer-dashboard.html` | Employer overview, recent jobs & applicants |
| `employer-jobs.html` | Manage postings (edit / close / reopen) |
| `employer-job-form.html?id=` | Create or edit a job, with a small rich-text description editor |
| `employer-applications.html` | Review applicants across all jobs, set status, read cover letters |
| `employer-settings.html` | Company profile |

## How it's structured

- `css/style.css` — one stylesheet, custom design tokens (no framework)
- `js/db.js` — **the mock backend.** Every "API call" your Next.js app used
  to make to Drizzle/MySQL is now a plain JS function that reads and writes
  `localStorage`. This is the one file you'd replace with real `fetch()`
  calls if you ever add a real backend.
- `js/ui.js` — shared chrome: navbar, footer, toasts, modal helper, the
  dashboard sidebar, and the job-card renderer
- `js/*.js` — one small script per page

## What's different from the Next.js version, and why

Plain HTML/CSS/JS has **no server**, so anything that used to happen on the
server had to be approximated in the browser:

- **Database → `localStorage`.** All users, jobs, applications, and resumes
  live in your browser's local storage. Clearing site data wipes everything;
  data isn't shared between browsers or devices.
- **Auth → fake sessions.** Passwords are stored in plain text and "sessions"
  are just a user id in local storage. This is fine for a learning demo, not
  for anything real.
- **Server actions/API routes → functions in `db.js`.** Things like
  `applyToJob()` or `createJob()` used to be server actions hitting MySQL;
  now they're synchronous functions against local storage.
- **File uploads (UploadThing) → filename only.** A static page can't upload
  a file to a server it doesn't have, so resume "uploads" just record the
  file's name and size, not its contents.
- **Tiptap/ProseMirror editor → a minimal `contenteditable` editor.** The job
  description field on `employer-job-form.html` uses the browser's built-in
  `document.execCommand` for bold/italic/lists — a much lighter stand-in for
  the real rich-text editor.
- **Routing → real page navigation.** Next.js's App Router (folders like
  `app/employer-dashboard/jobs/[jobId]/edit`) becomes plain HTML pages with
  query strings, e.g. `employer-job-form.html?id=3`.

If you want this backed by a real database and real accounts, the natural
next step is a small backend (Node/Express, or whatever you're comfortable
with) that exposes the same functions `db.js` currently provides, and to
swap `db.js`'s bodies for `fetch()` calls to it.
