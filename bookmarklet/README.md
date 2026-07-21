# Bookmarklet: "Grab This Job"

This lets you click one bookmark while viewing a job on LinkedIn or Naukri,
and it saves the role, company, and URL straight into your Grab a Job tracker.

Since the app now supports multiple users, each person needs their own
copy of this bookmarklet with their own personal token — so a grabbed job
lands in *their* account, not someone else's.

## Setup

1. Sign in to your deployed app and go to **Settings**. Copy your personal
   token from there.
2. Open `save-job.js` in this folder.
3. Replace `YOUR-APP.vercel.app` with your actual deployed domain.
4. Replace `YOUR_PERSONAL_TOKEN` with the token you copied from Settings.
5. Run the minify step again (see below) to regenerate `bookmarklet-uri.txt`,
   or just edit `bookmarklet-uri.txt` directly with find-and-replace.
6. In your browser, create a new bookmark (any browser: right-click the
   bookmarks bar → "Add page" / "Add bookmark").
7. Set the bookmark's **name** to something like "Grab This Job".
8. Set the bookmark's **URL/location** to the entire contents of
   `bookmarklet-uri.txt` (it starts with `javascript:`).
9. Save.

## Using it

Browse to any job listing page on LinkedIn or Naukri, click the bookmark,
and it will POST the job into your tracker with status "saved". Then just
refresh your tracker's dashboard to see it.

## Regenerating the minified URI after editing save-job.js

```bash
node -e "
const fs = require('fs');
let code = fs.readFileSync('save-job.js', 'utf-8');
let minified = code.split('\n').map(l => l.trim()).join(' ').replace(/\s+/g, ' ').trim();
fs.writeFileSync('bookmarklet-uri.txt', 'javascript:' + encodeURIComponent(minified));
"
```

## Note on reliability

LinkedIn and Naukri occasionally change their page structure, which can
cause the automatic title/company detection to miss. If that happens, the
bookmarklet still saves an entry using the page title and URL — you can
just edit the company/role manually afterward in the dashboard. This is
the tradeoff for staying maintenance-free: no scraper to keep patching,
just an occasional manual touch-up.
