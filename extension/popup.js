const APP_URL = "https://YOUR-APP.vercel.app";

const statusEl = document.getElementById("status");
const setupView = document.getElementById("setup-view");
const grabView = document.getElementById("grab-view");
const tokenInput = document.getElementById("token-input");
const saveTokenBtn = document.getElementById("save-token-btn");
const openAppBtn = document.getElementById("open-app-btn");
const grabBtn = document.getElementById("grab-btn");
const forgetBtn = document.getElementById("forget-btn");

init();

async function init() {
  const { token } = await chrome.storage.local.get("token");
  if (token) {
    showGrabView();
    return;
  }
  await tryAutoDetect();
}

// Tries to pick up your existing website login automatically, by making
// a credentialed request to your own app. If your browser doesn't send
// the session cookie cross-origin (this varies), this just fails quietly
// and we fall back to asking for a manually pasted token instead.
async function tryAutoDetect() {
  setStatus("Checking if you're already signed in on the website…");
  try {
    const res = await fetch(`${APP_URL}/api/token`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      await chrome.storage.local.set({ token: data.token });
      showGrabView("Connected automatically — you're all set.");
      return;
    }
  } catch (e) {
    // Network/CORS error — fall through to manual setup.
  }
  showSetupView();
}

function showSetupView() {
  setupView.classList.remove("hidden");
  grabView.classList.add("hidden");
  setStatus("Couldn't detect a session automatically — paste your token below.");
}

function showGrabView(message) {
  setupView.classList.add("hidden");
  grabView.classList.remove("hidden");
  setStatus(message || "");
}

openAppBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: `${APP_URL}/login` });
});

saveTokenBtn.addEventListener("click", async () => {
  const token = tokenInput.value.trim();
  if (!token) return;
  await chrome.storage.local.set({ token });
  showGrabView("Token saved.");
});

forgetBtn.addEventListener("click", async () => {
  await chrome.storage.local.remove("token");
  tokenInput.value = "";
  showSetupView();
});

grabBtn.addEventListener("click", async () => {
  setStatus("Grabbing…");
  const { token } = await chrome.storage.local.get("token");
  if (!token) {
    showSetupView();
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    setStatus("Couldn't find the active tab.");
    return;
  }

  let result;
  try {
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractJobInfo,
    });
    result = injection.result;
  } catch (e) {
    setStatus("Couldn't read this page (some pages block extensions).");
    return;
  }

  try {
    const res = await fetch(`${APP_URL}/api/save-job`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bookmarklet-token": token,
      },
      body: JSON.stringify({
        role: result.title,
        company: result.company,
        job_url: result.url,
        source: result.source,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(`Error: ${data.error || "Could not save."}`);
      if (res.status === 401) showSetupView();
      return;
    }

    setStatus(`Grabbed: ${data.role} — ${data.company}`);
  } catch (e) {
    setStatus("Network error — try again.");
  }
});

// Runs inside the page you're viewing, not in the extension's own context —
// so it can only use plain DOM APIs, nothing from this file's scope.
function extractJobInfo() {
  function getText(selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent && el.textContent.trim()) {
        return el.textContent.trim();
      }
    }
    return "";
  }

  function getMeta(name) {
    const el =
      document.querySelector(`meta[property="${name}"]`) ||
      document.querySelector(`meta[name="${name}"]`);
    return el ? el.content : "";
  }

  const title =
    getText([
      "h1.top-card-layout__title",
      "h1.jobs-unique-title",
      'h1[class*="title"]',
      "h1",
    ]) ||
    getMeta("og:title") ||
    document.title;

  const company =
    getText([
      ".top-card-layout__second-subline a",
      ".jd-header-comp-name a",
      'a[class*="company"]',
      '[class*="company-name"]',
    ]) ||
    getMeta("og:site_name") ||
    window.location.hostname;

  const host = window.location.hostname;
  const source = host.includes("linkedin")
    ? "linkedin"
    : host.includes("naukri")
    ? "naukri"
    : "other";

  return { title, company, url: window.location.href, source };
}

function setStatus(msg) {
  statusEl.textContent = msg;
}
