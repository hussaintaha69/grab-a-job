# Grab a Job — Chrome Extension

Save a job listing from *any* page straight into your tracker, without
leaving the tab.

## 1. Point it at your deployed app

Open `manifest.json` and `popup.js` and replace every instance of
`YOUR-APP.vercel.app` with your actual deployed domain.

## 2. Load it into Chrome

1. Go to `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select this `extension` folder.
5. Pin it to your toolbar (puzzle-piece icon → pin) so it's one click away.

## 3. Sign in

Click the extension icon. It will try to detect your existing website
login automatically — if you're already signed in to the app in that
browser, it should connect with no extra steps.

If that doesn't work (this depends on your browser's cookie handling and
isn't guaranteed to succeed everywhere), it'll show a fallback: click
**Open app to sign in**, sign in with Google, go to **Settings**, copy your
personal token, and paste it into the extension.

Either way, you only do this once — the extension remembers you after that.

## 4. Use it

On any job listing page, click the extension icon → **Grab this job**.
It reads the page's title/company (using LinkedIn/Naukri-specific
selectors where possible, falling back to generic page metadata
everywhere else) and saves it to your tracker with status "saved".

## Notes

- **"Sign out"** in the popup just forgets the locally stored token — it
  doesn't affect your website session.
- If a specific page's title/company comes through wrong (generic pages
  don't have the same structure as LinkedIn/Naukri), it still saves an
  entry using best-effort page metadata — just edit it manually afterward
  in the dashboard.
- To publish this on the Chrome Web Store (optional, only needed if you
  want to install it without Developer mode, or share it with others),
  you'd zip this folder and submit it through the Chrome Web Store
  Developer Dashboard — a one-time $5 registration fee applies. For
  personal use, "Load unpacked" is all you need.
