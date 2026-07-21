# Grab a Job — Chrome Extension

Save a job listing from *any* page straight into your tracker, without
leaving the tab.

## Sign in

Click the extension icon. It will try to detect your existing website
login automatically — if you're already signed in to the app in that
browser, it should connect with no extra steps.

If that doesn't work (this depends on your browser's cookie handling and
isn't guaranteed to succeed everywhere), it'll show a fallback: click
**Open app to sign in**, sign in with Google, go to **Settings**, copy your
personal token, and paste it into the extension.

Either way, you only do this once. The extension remembers you after that.

## Use it

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
