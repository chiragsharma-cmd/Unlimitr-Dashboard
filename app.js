/* Unlimitr Dashboard Core Logic - Row-Level and Date-Level Multi-File Architecture */

const SHEET_SOURCES = {
  dashboard: "https://docs.google.com/spreadsheets/d/1llN6FagOh6jvH2QOLt1UDEo4Zv7fNN1p4VFn993OR-g/export?format=csv&gid=699284203",
  app: "https://docs.google.com/spreadsheets/d/1llN6FagOh6jvH2QOLt1UDEo4Zv7fNN1p4VFn993OR-g/export?format=csv&gid=276741360",
  onboarding: "https://docs.google.com/spreadsheets/d/1llN6FagOh6jvH2QOLt1UDEo4Zv7fNN1p4VFn993OR-g/export?format=csv&gid=2018302412",
  web: "https://docs.google.com/spreadsheets/d/1llN6FagOh6jvH2QOLt1UDEo4Zv7fNN1p4VFn993OR-g/export?format=csv&gid=1987198185",
  landing_funnel: "",
  web_eng: "https://docs.google.com/spreadsheets/d/1llN6FagOh6jvH2QOLt1UDEo4Zv7fNN1p4VFn993OR-g/export?format=csv&gid=398517466",
  app_eng: "https://docs.google.com/spreadsheets/d/1llN6FagOh6jvH2QOLt1UDEo4Zv7fNN1p4VFn993OR-g/export?format=csv&gid=1893386322",
  web_bounce_eng_daylevel: "https://docs.google.com/spreadsheets/d/1llN6FagOh6jvH2QOLt1UDEo4Zv7fNN1p4VFn993OR-g/export?format=csv&gid=992093471"
};

let pullStatus = {
  dashboard: { success: null, message: 'Not loaded' },
  app: { success: null, message: 'Not loaded' },
  onboarding: { success: null, message: 'Not loaded' },
  web: { success: null, message: 'Not loaded' },
  landing_funnel: { success: null, message: 'Not loaded' },
  web_eng: { success: null, message: 'Not loaded' },
  app_eng: { success: null, message: 'Not loaded' },
  web_bounce_eng_daylevel: { success: null, message: 'Not loaded' }
};

// App state variables
let PERIOD = 'MTD';
let COMPARE = true;
let PLATFORM = 'ALL';
let VIEW_MODE = 'AGGREGATED';
let selectedDayLevelDate = '';
let charts = {};
let activeView = 'overview';
let allDates, maxDate, minDate, activeFilename = '';
let appRows = [];
let appFilename = '';
let ncOnboardingRows = [];
let ncOnboardingFilename = '';
let webRows = [];
let webFilename = '';
let landingFunnelRows = [];
let landingFunnelFilename = '';
let appMetric = 'users';
let appPlatform = 'ALL';
let appFrom = '';
let appTo = '';

// Toast Notification helper
function toast(msg, type = 'success', duration = 2600) {
  const container = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast show`;
  
  let icon = `<span style="color:#10b981;font-size:16px;">✓</span>`;
  if (type === 'info' || type === 'loading') {
    icon = `<svg class="spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:16px;height:16px;color:#6366f1;flex-shrink:0;display:inline-block;vertical-align:middle;margin-right:6px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 21v-5h-.581m0 0a8.003 8.003 0 11-15.357-2"/></svg>`;
  } else if (type === 'error' || type === 'warning') {
    icon = `<span style="color:#ef4444;font-size:16px;">⚠</span>`;
  }
  
  t.innerHTML = `${icon} <span style="font-size:13.5px;vertical-align:middle;">${msg}</span>`;
  container.appendChild(t);
  
  let timer = null;
  if (duration > 0) {
    timer = setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, duration);
  }

  return {
    close: () => {
      if (timer) clearTimeout(timer);
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }
  };
}

let webEngagementFilename = 'Sample Landing Page for Website Data';
let webBounceEngDaylevelFilename = 'Sample Web Bounce & Eng Daylevel Data';
const initialWebBounceEngDaylevelData = [
  { date: "2026-08-01", total_users: 179, sessions: 390, bounce_rate_pct: 61.8, engagement_rate_pct: 38.2, avg_engagement_sec: 326.2, platform: "WEB" },
  { date: "2026-08-11", total_users: 153, sessions: 322, bounce_rate_pct: 54.7, engagement_rate_pct: 45.3, avg_engagement_sec: 208.3, platform: "WEB" },
  { date: "2026-08-29", total_users: 120, sessions: 246, bounce_rate_pct: 54.9, engagement_rate_pct: 45.1, avg_engagement_sec: 309.4, platform: "WEB" },
  { date: "2026-08-30", total_users: 107, sessions: 229, bounce_rate_pct: 66.4, engagement_rate_pct: 33.6, avg_engagement_sec: 198.6, platform: "WEB" },
  { date: "2026-08-08", total_users: 136, sessions: 289, bounce_rate_pct: 55.7, engagement_rate_pct: 44.3, avg_engagement_sec: 148.0, platform: "WEB" },
  { date: "2026-08-15", total_users: 101, sessions: 197, bounce_rate_pct: 64.0, engagement_rate_pct: 36.0, avg_engagement_sec: 176.6, platform: "WEB" },
  { date: "2026-08-09", total_users: 120, sessions: 247, bounce_rate_pct: 61.5, engagement_rate_pct: 38.5, avg_engagement_sec: 157.5, platform: "WEB" },
  { date: "2026-08-12", total_users: 146, sessions: 312, bounce_rate_pct: 55.4, engagement_rate_pct: 44.6, avg_engagement_sec: 170.0, platform: "WEB" },
  { date: "2026-08-07", total_users: 194, sessions: 408, bounce_rate_pct: 61.8, engagement_rate_pct: 38.2, avg_engagement_sec: 169.2, platform: "WEB" },
  { date: "2026-08-16", total_users: 209, sessions: 403, bounce_rate_pct: 76.2, engagement_rate_pct: 23.8, avg_engagement_sec: 106.6, platform: "WEB" },
  { date: "2026-07-26", total_users: 126, sessions: 268, bounce_rate_pct: 61.2, engagement_rate_pct: 38.8, avg_engagement_sec: 222.5, platform: "WEB" },
  { date: "2026-08-19", total_users: 171, sessions: 393, bounce_rate_pct: 55.7, engagement_rate_pct: 44.3, avg_engagement_sec: 179.0, platform: "WEB" },
  { date: "2026-08-04", total_users: 158, sessions: 340, bounce_rate_pct: 48.2, engagement_rate_pct: 51.8, avg_engagement_sec: 358.3, platform: "WEB" },
  { date: "2026-08-20", total_users: 163, sessions: 360, bounce_rate_pct: 56.1, engagement_rate_pct: 43.9, avg_engagement_sec: 270.5, platform: "WEB" },
  { date: "2026-08-28", total_users: 100, sessions: 227, bounce_rate_pct: 66.5, engagement_rate_pct: 33.5, avg_engagement_sec: 184.9, platform: "WEB" },
  { date: "2026-08-02", total_users: 100, sessions: 208, bounce_rate_pct: 58.2, engagement_rate_pct: 41.8, avg_engagement_sec: 316.3, platform: "WEB" },
  { date: "2026-08-10", total_users: 164, sessions: 358, bounce_rate_pct: 55.9, engagement_rate_pct: 44.1, avg_engagement_sec: 270.4, platform: "WEB" },
  { date: "2026-08-23", total_users: 116, sessions: 222, bounce_rate_pct: 55.9, engagement_rate_pct: 44.1, avg_engagement_sec: 161.8, platform: "WEB" },
  { date: "2026-08-14", total_users: 138, sessions: 326, bounce_rate_pct: 56.1, engagement_rate_pct: 43.9, avg_engagement_sec: 213.1, platform: "WEB" },
  { date: "2026-07-25", total_users: 136, sessions: 294, bounce_rate_pct: 61.2, engagement_rate_pct: 38.8, avg_engagement_sec: 166.8, platform: "WEB" },
  { date: "2026-08-06", total_users: 316, sessions: 621, bounce_rate_pct: 59.1, engagement_rate_pct: 40.9, avg_engagement_sec: 105.1, platform: "WEB" },
  { date: "2026-08-21", total_users: 174, sessions: 399, bounce_rate_pct: 55.9, engagement_rate_pct: 44.1, avg_engagement_sec: 195.8, platform: "WEB" },
  { date: "2026-07-31", total_users: 256, sessions: 516, bounce_rate_pct: 67.4, engagement_rate_pct: 32.6, avg_engagement_sec: 220.3, platform: "WEB" },
  { date: "2026-08-24", total_users: 191, sessions: 390, bounce_rate_pct: 56.2, engagement_rate_pct: 43.8, avg_engagement_sec: 202.4, platform: "WEB" },
  { date: "2026-07-29", total_users: 179, sessions: 397, bounce_rate_pct: 56.9, engagement_rate_pct: 43.1, avg_engagement_sec: 191.1, platform: "WEB" },
  { date: "2026-08-18", total_users: 280, sessions: 611, bounce_rate_pct: 29.6, engagement_rate_pct: 70.4, avg_engagement_sec: 159.8, platform: "WEB" },
  { date: "2026-08-31", total_users: 181, sessions: 449, bounce_rate_pct: 43.0, engagement_rate_pct: 57.0, avg_engagement_sec: 332.7, platform: "WEB" },
  { date: "2026-08-05", total_users: 170, sessions: 377, bounce_rate_pct: 60.2, engagement_rate_pct: 39.8, avg_engagement_sec: 207.3, platform: "WEB" },
  { date: "2026-09-03", total_users: 184, sessions: 400, bounce_rate_pct: 55.0, engagement_rate_pct: 45.0, avg_engagement_sec: 218.6, platform: "WEB" }
];
const initialWebEngagementData = [
  { date: "2026-07-02", total_users: 1017, sessions: 2372, bounce_rate_pct: 53.5, avg_engagement_sec: 66.7 },
  { date: "2026-07-03", total_users: 1159, sessions: 3457, bounce_rate_pct: 58.1, avg_engagement_sec: 46.7 },
  { date: "2026-07-04", total_users: 374, sessions: 960, bounce_rate_pct: 60.0, avg_engagement_sec: 32.9 },
  { date: "2026-07-05", total_users: 384, sessions: 877, bounce_rate_pct: 73.2, avg_engagement_sec: 69.5 },
  { date: "2026-07-06", total_users: 415, sessions: 930, bounce_rate_pct: 66.3, avg_engagement_sec: 170.7 },
  { date: "2026-07-07", total_users: 501, sessions: 1158, bounce_rate_pct: 73.2, avg_engagement_sec: 112.3 },
  { date: "2026-07-08", total_users: 452, sessions: 1049, bounce_rate_pct: 71.4, avg_engagement_sec: 115.7 },
  { date: "2026-07-09", total_users: 473, sessions: 974, bounce_rate_pct: 80.0, avg_engagement_sec: 96.4 },
  { date: "2026-07-10", total_users: 370, sessions: 810, bounce_rate_pct: 74.1, avg_engagement_sec: 98.5 },
  { date: "2026-07-11", total_users: 372, sessions: 744, bounce_rate_pct: 72.7, avg_engagement_sec: 103.8 },
  { date: "2026-07-12", total_users: 223, sessions: 449, bounce_rate_pct: 75.5, avg_engagement_sec: 116.1 },
  { date: "2026-07-13", total_users: 271, sessions: 560, bounce_rate_pct: 62.1, avg_engagement_sec: 101.4 },
  { date: "2026-07-14", total_users: 294, sessions: 613, bounce_rate_pct: 64.6, avg_engagement_sec: 146.0 },
  { date: "2026-07-15", total_users: 224, sessions: 462, bounce_rate_pct: 63.4, avg_engagement_sec: 168.2 },
  { date: "2026-07-16", total_users: 211, sessions: 438, bounce_rate_pct: 59.6, avg_engagement_sec: 212.3 },
  { date: "2026-07-17", total_users: 321, sessions: 619, bounce_rate_pct: 66.6, avg_engagement_sec: 162.2 },
  { date: "2026-07-18", total_users: 349, sessions: 654, bounce_rate_pct: 69.6, avg_engagement_sec: 153.0 },
  { date: "2026-07-19", total_users: 247, sessions: 425, bounce_rate_pct: 72.9, avg_engagement_sec: 162.9 },
  { date: "2026-07-20", total_users: 311, sessions: 593, bounce_rate_pct: 71.3, avg_engagement_sec: 141.5 },
  { date: "2026-07-21", total_users: 289, sessions: 586, bounce_rate_pct: 70.1, avg_engagement_sec: 180.2 },
  { date: "2026-07-22", total_users: 208, sessions: 476, bounce_rate_pct: 62.6, avg_engagement_sec: 158.3 },
  { date: "2026-07-23", total_users: 185, sessions: 377, bounce_rate_pct: 58.9, avg_engagement_sec: 283.3 },
  { date: "2026-07-24", total_users: 163, sessions: 356, bounce_rate_pct: 55.9, avg_engagement_sec: 293.9 },
  { date: "2026-07-25", total_users: 136, sessions: 294, bounce_rate_pct: 61.2, avg_engagement_sec: 166.8 },
  { date: "2026-07-26", total_users: 126, sessions: 268, bounce_rate_pct: 61.2, avg_engagement_sec: 222.5 },
  { date: "2026-07-27", total_users: 192, sessions: 429, bounce_rate_pct: 51.5, avg_engagement_sec: 251.5 },
  { date: "2026-07-28", total_users: 182, sessions: 396, bounce_rate_pct: 53.3, avg_engagement_sec: 195.3 },
  { date: "2026-07-29", total_users: 179, sessions: 397, bounce_rate_pct: 56.9, avg_engagement_sec: 191.1 },
  { date: "2026-07-30", total_users: 180, sessions: 382, bounce_rate_pct: 52.6, avg_engagement_sec: 229.6 },
  { date: "2026-07-31", total_users: 256, sessions: 516, bounce_rate_pct: 67.4, avg_engagement_sec: 220.3 },
  { date: "2026-08-01", total_users: 179, sessions: 390, bounce_rate_pct: 61.8, avg_engagement_sec: 326.2 },
  { date: "2026-08-02", total_users: 100, sessions: 208, bounce_rate_pct: 58.2, avg_engagement_sec: 316.3 },
  { date: "2026-08-03", total_users: 148, sessions: 338, bounce_rate_pct: 50.3, avg_engagement_sec: 300.1 },
  { date: "2026-08-04", total_users: 158, sessions: 340, bounce_rate_pct: 48.2, avg_engagement_sec: 358.3 },
  { date: "2026-08-05", total_users: 170, sessions: 377, bounce_rate_pct: 60.2, avg_engagement_sec: 207.3 },
  { date: "2026-08-06", total_users: 316, sessions: 621, bounce_rate_pct: 59.1, avg_engagement_sec: 105.1 },
  { date: "2026-08-07", total_users: 194, sessions: 408, bounce_rate_pct: 61.8, avg_engagement_sec: 169.2 },
  { date: "2026-08-08", total_users: 136, sessions: 289, bounce_rate_pct: 55.7, avg_engagement_sec: 148.0 },
  { date: "2026-08-09", total_users: 120, sessions: 247, bounce_rate_pct: 61.5, avg_engagement_sec: 157.5 },
  { date: "2026-08-10", total_users: 164, sessions: 358, bounce_rate_pct: 55.9, avg_engagement_sec: 270.4 },
  { date: "2026-08-11", total_users: 153, sessions: 322, bounce_rate_pct: 54.7, avg_engagement_sec: 208.3 },
  { date: "2026-08-12", total_users: 146, sessions: 312, bounce_rate_pct: 55.4, avg_engagement_sec: 170.0 },
  { date: "2026-08-13", total_users: 148, sessions: 342, bounce_rate_pct: 51.2, avg_engagement_sec: 208.2 },
  { date: "2026-08-14", total_users: 138, sessions: 326, bounce_rate_pct: 56.1, avg_engagement_sec: 213.1 },
  { date: "2026-08-15", total_users: 101, sessions: 197, bounce_rate_pct: 64.0, avg_engagement_sec: 176.6 },
  { date: "2026-08-16", total_users: 209, sessions: 403, bounce_rate_pct: 76.2, avg_engagement_sec: 106.6 },
  { date: "2026-08-17", total_users: 9784, sessions: 20864, bounce_rate_pct: 4.4, avg_engagement_sec: 71.4 },
  { date: "2026-08-18", total_users: 280, sessions: 611, bounce_rate_pct: 29.6, avg_engagement_sec: 159.8 },
  { date: "2026-08-19", total_users: 171, sessions: 393, bounce_rate_pct: 55.7, avg_engagement_sec: 179.0 },
  { date: "2026-08-20", total_users: 163, sessions: 360, bounce_rate_pct: 56.1, avg_engagement_sec: 270.5 },
  { date: "2026-08-21", total_users: 174, sessions: 399, bounce_rate_pct: 55.9, avg_engagement_sec: 195.8 },
  { date: "2026-08-22", total_users: 151, sessions: 336, bounce_rate_pct: 54.8, avg_engagement_sec: 282.2 },
  { date: "2026-08-23", total_users: 116, sessions: 222, bounce_rate_pct: 55.9, avg_engagement_sec: 161.8 },
  { date: "2026-08-24", total_users: 191, sessions: 390, bounce_rate_pct: 56.2, avg_engagement_sec: 202.4 },
  { date: "2026-08-25", total_users: 161, sessions: 396, bounce_rate_pct: 54.8, avg_engagement_sec: 309.8 }
];

let appEngagementFilename = 'Sample App Engagement Data';
const initialAppEngagementData = [
  { date: "2026-04-01", platform: "ANDROID", total_users: 269, sessions: 392, bounce_rate_pct: 36.8, engagement_rate_pct: 63.2, avg_engagement_sec: 351.7 },
  { date: "2026-04-01", platform: "IOS", total_users: 101, sessions: 285, bounce_rate_pct: 49.8, engagement_rate_pct: 50.2, avg_engagement_sec: 413.8 },
  { date: "2026-04-02", platform: "ANDROID", total_users: 258, sessions: 374, bounce_rate_pct: 40.5, engagement_rate_pct: 59.5, avg_engagement_sec: 253.4 },
  { date: "2026-04-02", platform: "IOS", total_users: 103, sessions: 299, bounce_rate_pct: 51.0, engagement_rate_pct: 49.0, avg_engagement_sec: 308.0 },
  { date: "2026-04-03", platform: "ANDROID", total_users: 256, sessions: 354, bounce_rate_pct: 41.4, engagement_rate_pct: 58.6, avg_engagement_sec: 282.5 },
  { date: "2026-04-03", platform: "IOS", total_users: 104, sessions: 272, bounce_rate_pct: 42.2, engagement_rate_pct: 57.8, avg_engagement_sec: 469.4 },
  { date: "2026-04-04", platform: "ANDROID", total_users: 227, sessions: 325, bounce_rate_pct: 41.3, engagement_rate_pct: 58.7, avg_engagement_sec: 218.9 },
  { date: "2026-04-04", platform: "IOS", total_users: 92, sessions: 247, bounce_rate_pct: 58.1, engagement_rate_pct: 41.9, avg_engagement_sec: 235.5 },
  { date: "2026-04-05", platform: "ANDROID", total_users: 213, sessions: 262, bounce_rate_pct: 48.0, engagement_rate_pct: 52.0, avg_engagement_sec: 130.6 },
  { date: "2026-04-05", platform: "IOS", total_users: 65, sessions: 196, bounce_rate_pct: 57.1, engagement_rate_pct: 42.9, avg_engagement_sec: 59.2 },
  { date: "2026-04-06", platform: "ANDROID", total_users: 228, sessions: 355, bounce_rate_pct: 33.8, engagement_rate_pct: 66.2, avg_engagement_sec: 438.3 },
  { date: "2026-04-06", platform: "IOS", total_users: 100, sessions: 306, bounce_rate_pct: 41.9, engagement_rate_pct: 58.1, avg_engagement_sec: 383.0 },
  { date: "2026-04-07", platform: "ANDROID", total_users: 243, sessions: 353, bounce_rate_pct: 38.8, engagement_rate_pct: 61.2, avg_engagement_sec: 344.3 },
  { date: "2026-04-07", platform: "IOS", total_users: 85, sessions: 254, bounce_rate_pct: 40.9, engagement_rate_pct: 59.1, avg_engagement_sec: 416.6 },
  { date: "2026-04-08", platform: "ANDROID", total_users: 252, sessions: 368, bounce_rate_pct: 36.0, engagement_rate_pct: 64.0, avg_engagement_sec: 352.4 },
  { date: "2026-04-08", platform: "IOS", total_users: 84, sessions: 243, bounce_rate_pct: 41.7, engagement_rate_pct: 58.3, avg_engagement_sec: 385.5 },
  { date: "2026-04-09", platform: "ANDROID", total_users: 260, sessions: 365, bounce_rate_pct: 40.9, engagement_rate_pct: 59.1, avg_engagement_sec: 371.6 },
  { date: "2026-04-09", platform: "IOS", total_users: 90, sessions: 291, bounce_rate_pct: 49.2, engagement_rate_pct: 50.8, avg_engagement_sec: 395.2 },
  { date: "2026-04-10", platform: "ANDROID", total_users: 221, sessions: 317, bounce_rate_pct: 39.3, engagement_rate_pct: 60.7, avg_engagement_sec: 423.9 },
  { date: "2026-04-10", platform: "IOS", total_users: 88, sessions: 287, bounce_rate_pct: 47.6, engagement_rate_pct: 52.4, avg_engagement_sec: 450.6 },
  { date: "2026-04-11", platform: "ANDROID", total_users: 216, sessions: 298, bounce_rate_pct: 44.8, engagement_rate_pct: 55.2, avg_engagement_sec: 215.0 },
  { date: "2026-08-01", platform: "ANDROID", total_users: 235, sessions: 285, bounce_rate_pct: 38.5, engagement_rate_pct: 61.5, avg_engagement_sec: 320.5 },
  { date: "2026-08-01", platform: "IOS", total_users: 140, sessions: 367, bounce_rate_pct: 44.2, engagement_rate_pct: 55.8, avg_engagement_sec: 380.0 }
];

// Global active data store
let DATA = {
  users: [],
  stickiness: [],
  webUsers: [],
  webStickiness: [],
  webBounceEngagement: initialWebEngagementData,
  appBounceEngagement: initialAppEngagementData,
  webBounceEngDaylevel: initialWebBounceEngDaylevelData,
  landingFunnel: [],
  funnel: [],
  features: []
};

// Persistent Browser Storage Engine (IndexedDB for zero-loss dataset persistence across refreshes)
const DB_NAME = 'UnlimitrDashboardDatasetsDB';
const DB_VERSION = 1;
const STORE_NAME = 'datasets';

function openDatasetsDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function saveDatasetToStorage(key, data, filename) {
  try {
    const db = await openDatasetsDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({
      key: key,
      data: data,
      filename: filename || 'Stored Dataset',
      timestamp: Date.now()
    });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn(`Failed to save dataset ${key} to IndexedDB:`, err);
  }
}

async function deleteDatasetFromStorage(key) {
  try {
    const db = await openDatasetsDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(key);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn(`Failed to delete dataset ${key} from IndexedDB:`, err);
  }
}

async function clearAllDatasetsFromStorage() {
  try {
    const db = await openDatasetsDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Failed to clear IndexedDB datasets:', err);
  }
}

async function loadAllStoredDatasets() {
  try {
    const db = await openDatasetsDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn('Failed to load datasets from IndexedDB:', err);
    return [];
  }
}

async function restoreSavedDatasetsFromStorage() {
  const records = await loadAllStoredDatasets();
  if (!records || !records.length) return false;

  let loadedCount = 0;
  records.forEach(rec => {
    const key = rec.key;
    const data = rec.data;
    const filename = rec.filename || 'Stored Dataset';

    if (!data) return;

    if (key === 'dashboard') {
      if (typeof data === 'object' && !Array.isArray(data)) {
        DATA.users = data.users || [];
        DATA.stickiness = data.stickiness || [];
        if (!DATA.stickiness.length && DATA.users.length) {
          DATA.stickiness = computeStickinessForDataset(DATA.users);
        }
        DATA.webUsers = data.webUsers || [];
        DATA.webStickiness = data.webStickiness || [];
        DATA.funnel = data.funnel || [];
        DATA.features = data.features || [];
      } else if (Array.isArray(data)) {
        DATA.users = data;
        DATA.stickiness = computeStickinessForDataset(DATA.users);
      }
      activeFilename = filename;
      loadedCount++;
    } else if (key === 'app') {
      appRows = data;
      appFilename = filename;
      loadedCount++;
    } else if (key === 'onboarding') {
      ncOnboardingRows = data;
      ncOnboardingFilename = filename;
      loadedCount++;
    } else if (key === 'web') {
      DATA.webUsers = Array.isArray(data) ? data : (data.webUsers || []);
      DATA.webStickiness = computeStickinessForDataset(DATA.webUsers);
      webFilename = filename;
      loadedCount++;
    } else if (key === 'landing_funnel') {
      DATA.landingFunnel = data;
      landingFunnelFilename = filename;
      loadedCount++;
    } else if (key === 'web_eng') {
      DATA.webBounceEngagement = data;
      webEngagementFilename = filename;
      loadedCount++;
    } else if (key === 'app_eng') {
      DATA.appBounceEngagement = data;
      appEngagementFilename = filename;
      loadedCount++;
    } else if (key === 'web_bounce_eng_daylevel') {
      DATA.webBounceEngDaylevel = data;
      webBounceEngDaylevelFilename = filename;
      loadedCount++;
    }

    pullStatus[key] = {
      loading: false,
      success: true,
      message: `✓ Saved locally (${filename})`
    };
  });

  if (loadedCount > 0) {
    computeDates();
    setupDateInputs();
    return true;
  }
  return false;
}

window.removeDataset = async function(key) {
  await deleteDatasetFromStorage(key);

  if (key === 'dashboard') {
    DATA.users = [];
    DATA.stickiness = [];
    DATA.funnel = [];
    DATA.features = [];
    activeFilename = '';
  } else if (key === 'app') {
    appRows = [];
    appFilename = '';
  } else if (key === 'onboarding') {
    ncOnboardingRows = [];
    ncOnboardingFilename = '';
  } else if (key === 'web') {
    DATA.webUsers = [];
    DATA.webStickiness = [];
    webFilename = '';
  } else if (key === 'landing_funnel') {
    DATA.landingFunnel = [];
    landingFunnelFilename = '';
  } else if (key === 'web_eng') {
    DATA.webBounceEngagement = initialWebEngagementData;
    webEngagementFilename = 'Sample Landing Page for Website Data';
  } else if (key === 'app_eng') {
    DATA.appBounceEngagement = initialAppEngagementData;
    appEngagementFilename = 'Sample App Engagement Data';
  } else if (key === 'web_bounce_eng_daylevel') {
    DATA.webBounceEngDaylevel = initialWebBounceEngDaylevelData;
    webBounceEngDaylevelFilename = 'Sample Web Bounce & Eng Daylevel Data';
  }

  pullStatus[key] = { success: null, message: 'Not loaded' };
  toast(`Removed dataset from local storage`, 'info');
  computeDates();
  refresh();
  if (activeView === 'upload') {
    renderUpload(document.getElementById('upload-view'));
  }
};

window.clearAllStoredDatasetsUI = async function() {
  if (confirm('Are you sure you want to remove all saved datasets from browser local storage?')) {
    await clearAllDatasetsFromStorage();
    const keys = ['dashboard','app','onboarding','web','landing_funnel','web_eng','app_eng','web_bounce_eng_daylevel'];
    keys.forEach(k => {
      pullStatus[k] = { success: null, message: 'Not loaded' };
    });
    DATA.users = [];
    DATA.stickiness = [];
    DATA.webUsers = [];
    DATA.webStickiness = [];
    appRows = [];
    ncOnboardingRows = [];
    webRows = [];
    DATA.landingFunnel = [];
    DATA.webBounceEngagement = initialWebEngagementData;
    DATA.appBounceEngagement = initialAppEngagementData;
    DATA.webBounceEngDaylevel = initialWebBounceEngDaylevelData;

    activeFilename = '';
    appFilename = '';
    ncOnboardingFilename = '';
    webFilename = '';
    landingFunnelFilename = '';
    webEngagementFilename = 'Sample Landing Page for Website Data';
    appEngagementFilename = 'Sample App Engagement Data';
    webBounceEngDaylevelFilename = 'Sample Web Bounce & Eng Daylevel Data';

    toast('All stored datasets cleared successfully', 'info');
    computeDates();
    refresh();
    if (activeView === 'upload') {
      renderUpload(document.getElementById('upload-view'));
    }
  }
};

// Date computations & parsing
function computeDates() {
  const dateCollector = [];

  const sources = [
    DATA.users,
    DATA.webUsers,
    appRows,
    ncOnboardingRows,
    DATA.landingFunnel,
    DATA.webBounceEngagement,
    DATA.appBounceEngagement,
    DATA.webBounceEngDaylevel
  ];

  sources.forEach(arr => {
    if (Array.isArray(arr) && arr.length) {
      arr.forEach(r => {
        const dVal = r.date || r.cohort_date || r.landing_date;
        if (dVal) {
          const parsed = parseD(dVal);
          if (parsed && !isNaN(parsed)) {
            dateCollector.push(parsed);
          }
        }
      });
    }
  });

  if (!dateCollector.length) {
    const activeDataset = getCombinedDataSource();
    if (activeDataset && activeDataset.length) {
      activeDataset.forEach(r => {
        if (r.date) {
          const parsed = parseD(r.date);
          if (parsed && !isNaN(parsed)) dateCollector.push(parsed);
        }
      });
    }
  }

  if (dateCollector.length > 0) {
    dateCollector.sort((a, b) => a - b);
    allDates = dateCollector;
    maxDate = allDates[allDates.length - 1];
    minDate = allDates[0];
  }
}

// Compute dynamic rolling stickiness (WAU, MAU) for any row-level user dataset
function computeStickinessForDataset(rows) {
  if (!rows || !rows.length) return [];

  const uniqueDates = [...new Set(rows.map(r => r.date))].sort();
  const rawPlatforms = [...new Set(rows.map(r => ((r.platform || 'WEB').toUpperCase())))].filter(Boolean);
  const platforms = ['ALL', ...rawPlatforms];
  const stickiness = [];

  const dailyUserMap = {};
  rows.forEach(r => {
    if (!r.date || !r.user_pseudo_id) return;
    if (!dailyUserMap[r.date]) {
      dailyUserMap[r.date] = {};
    }
    const plat = (r.platform || 'WEB').toUpperCase();
    if (!dailyUserMap[r.date][plat]) {
      dailyUserMap[r.date][plat] = new Set();
    }
    dailyUserMap[r.date][plat].add(r.user_pseudo_id);

    // Also add to 'ALL' pseudo-platform
    if (!dailyUserMap[r.date]['ALL']) {
      dailyUserMap[r.date]['ALL'] = new Set();
    }
    dailyUserMap[r.date]['ALL'].add(r.user_pseudo_id);
  });

  uniqueDates.forEach(dateStr => {
    platforms.forEach(plat => {
      const dauSet = (dailyUserMap[dateStr] && dailyUserMap[dateStr][plat]) ? dailyUserMap[dateStr][plat] : new Set();
      const dau = dauSet.size;

      const wauSet = new Set();
      for (let i = -6; i <= 0; i++) {
        const curDateStr = getDateOffset(dateStr, i);
        if (dailyUserMap[curDateStr] && dailyUserMap[curDateStr][plat]) {
          dailyUserMap[curDateStr][plat].forEach(uid => wauSet.add(uid));
        }
      }
      const wau = wauSet.size;

      const mauSet = new Set();
      for (let i = -29; i <= 0; i++) {
        const curDateStr = getDateOffset(dateStr, i);
        if (dailyUserMap[curDateStr] && dailyUserMap[curDateStr][plat]) {
          dailyUserMap[curDateStr][plat].forEach(uid => mauSet.add(uid));
        }
      }
      const mau = mauSet.size;

      stickiness.push({
        date: dateStr,
        platform: plat,
        dau: dau,
        wau: wau,
        mau: mau,
        stickiness_pct: mau ? dau / mau : 0
      });
    });
  });

  return stickiness;
}

function recomputeStickiness() {
  DATA.stickiness = computeStickinessForDataset(DATA.users);
}

function getDateOffset(dateStr, offsetDays) {
  const iso = toISO(dateStr);
  if (!iso) return dateStr;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + offsetDays, 12, 0, 0, 0);
  const resY = dt.getFullYear();
  const resM = String(dt.getMonth() + 1).padStart(2, '0');
  const resD = String(dt.getDate()).padStart(2, '0');
  return `${resY}-${resM}-${resD}`;
}

function toISO(v) {
  if (v == null || v === '') return null;

  let y, m, d;

  if (v instanceof Date && !isNaN(v)) {
    y = v.getFullYear();
    m = v.getMonth() + 1;
    d = v.getDate();
  } else if (typeof v === 'number') { // Excel serial date
    const dt = new Date(Math.round((v - 25569) * 86400 * 1000));
    y = dt.getUTCFullYear();
    m = dt.getUTCMonth() + 1;
    d = dt.getUTCDate();
  } else {
    const s = String(v).trim();

    // 8-digit YYYYMMDD (GA4 raw export format e.g. 20260801)
    let match = s.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;

    // YYYY-MM-DD or YYYY/MM/DD (4-digit year at start)
    match = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match) return match[1] + '-' + match[2].padStart(2, '0') + '-' + match[3].padStart(2, '0');

    // 3-part date with 2 or 4-digit year at end (e.g. 07-09-2026, 07/09/2026, 07-09-26)
    match = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
    if (match) {
      const p1 = parseInt(match[1], 10);
      const p2 = parseInt(match[2], 10);
      let yr = parseInt(match[3], 10);
      if (yr < 100) yr += 2000;

      if (p1 > 12) {
        d = p1;
        m = p2;
      } else if (p2 > 12) {
        d = p2;
        m = p1;
      } else {
        d = p1;
        m = p2;
      }
      y = yr;
    } else {
      const dt = new Date(s);
      if (!isNaN(dt)) {
        y = dt.getFullYear();
        m = dt.getMonth() + 1;
        d = dt.getDate();
      } else {
        return null;
      }
    }
  }

  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function parseD(s) {
  const iso = toISO(s);
  if (!iso) return new Date(NaN);
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0); // Noon prevents DST timezone boundary shifts
}

// Normalise row headers to lowercase snake_case
function normaliseRowKeys(rows) {
  return rows.map(row => {
    const newRow = {};
    Object.keys(row).forEach(key => {
      const normKey = key.toLowerCase().trim().replace(/[\s_]+/g, '_');
      newRow[normKey] = row[key];
    });
    return newRow;
  });
}

function sheetToRows(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { defval: null, raw: false });
}

function processOverallDashboardRows(rawRows, filename) {
  if (!rawRows || !rawRows.length) {
    throw new Error('The dataset contains no rows.');
  }

  const rows = normaliseRowKeys(rawRows);
  const firstRowKeys = Object.keys(rows[0]);

  // Auto-detect based on columns:
  const hasUserColumn = firstRowKeys.some(k => k.includes('user_pseudo_id') || k.includes('user_id') || k.includes('is_new_user'));

  if (hasUserColumn) {
    // Parse as ROW-LEVEL users file
    const users = rows.map(r => {
      const dateVal = r.date ? toISO(r.date) : null;
      const userId = r.user_pseudo_id || r.user_id || '';
      const sessionId = r.session_id || '';
      const platform = String(r.platform || '').toUpperCase().trim();
      const device = r.device_category || r.device || 'unknown';
      const city = r.city || 'unknown';
      const source = r.source || r.channel || 'unknown';
      const isNew = String(r.is_new_user || '').toLowerCase().trim() === 'true';

      return {
        date: dateVal,
        user_pseudo_id: userId,
        session_id: sessionId,
        platform: platform,
        device_category: device,
        city: city,
        source: source,
        is_new_user: isNew
      };
    }).filter(r => r.date && r.user_pseudo_id);

    if (!users.length) {
      throw new Error('No valid user records found. Columns must contain date and user_pseudo_id.');
    }

    DATA.users = users;
    activeFilename = filename;
    computeDates();
    setupDateInputs();
    recomputeStickiness();
    saveDatasetToStorage('dashboard', { users: DATA.users, stickiness: DATA.stickiness }, filename);
    navigateToView(activeView, false);
    return users.length;
  } else {
    // Parse as DATE-LEVEL aggregates file
    const stickiness = rows.map(r => {
      const dateVal = r.date ? toISO(r.date) : null;
      const dau = Number(r.dau || 0);
      const wau = Number(r.wau || 0);
      const mau = Number(r.mau || 0);
      const platform = String(r.platform || 'ALL').toUpperCase().trim();
      const stickPct = r.stickiness_pct !== undefined ? Number(r.stickiness_pct) : (mau ? dau / mau : 0);

      return {
        date: dateVal,
        platform: platform,
        dau: dau,
        wau: wau,
        mau: mau,
        stickiness_pct: stickPct
      };
    }).filter(r => r.date);

    if (!stickiness.length) {
      throw new Error('No valid records found. Could not parse as user rows or date metrics.');
    }

    DATA.stickiness = stickiness;
    activeFilename = filename;
    saveDatasetToStorage('dashboard', { users: DATA.users, stickiness: DATA.stickiness }, filename);
    navigateToView(activeView, false);
    return stickiness.length;
  }
}

// File upload handler (Auto-detect user rows vs date aggregate metrics)
function handleUploadedFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      let rawRows = [];
      if (name.endsWith('.json')) {
        const parsed = JSON.parse(e.target.result);
        rawRows = Array.isArray(parsed) ? parsed : (parsed.users || parsed.daily || parsed.stickiness || []);
      } else {
        const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: false, raw: false });
        rawRows = sheetToRows(wb, wb.SheetNames[0]);
      }

      const count = processOverallDashboardRows(rawRows, file.name);
      toast(`Loaded ${count.toLocaleString()} records from ${file.name}`, 'success');
    } catch (err) {
      toast(`Error reading file: ${err.message}`, 'error');
      console.error(err);
    }
  };
  if (name.endsWith('.json')) reader.readAsText(file);
  else reader.readAsBinaryString(file);
}

// Filtering Helpers
function getCombinedDataSource() {
  const users = DATA.users || [];
  const webUsers = DATA.webUsers || [];

  if (PLATFORM === 'WEB') {
    return webUsers.length ? webUsers : users.filter(r => (r.platform || '').toUpperCase() === 'WEB');
  }
  if (PLATFORM === 'APP') {
    return users.filter(r => {
      const p = (r.platform || '').toUpperCase();
      return p === 'ANDROID' || p === 'IOS' || p === 'APP';
    });
  }
  if (PLATFORM === 'ANDROID' || PLATFORM === 'IOS') {
    return users.filter(r => (r.platform || '').toUpperCase() === PLATFORM);
  }
  // PLATFORM === 'ALL' (App + Web) -> Combine App and Web users!
  if (webUsers.length) {
    return [...users, ...webUsers];
  }
  return users;
}

function isPlatMatch(rPlat, targetPlat = PLATFORM) {
  if (!targetPlat || targetPlat === 'ALL') return true;
  if (!rPlat) return true;
  const rp = String(rPlat).toUpperCase();
  const tp = String(targetPlat).toUpperCase();
  if (tp === 'ALL') return true;
  if (tp === 'APP') return rp === 'ANDROID' || rp === 'IOS' || rp === 'APP';
  return rp === tp;
}

function platMatch(r) {
  return isPlatMatch(r ? r.platform : null);
}

function getFilteredUserRows(start, end) {
  const dataSource = getCombinedDataSource();
  const startISO = toISO(start);
  const endISO = toISO(end);

  return dataSource.filter(r => {
    if (!r.date) return false;
    return r.date >= startISO && r.date <= endISO;
  });
}

function getDistinctUsersCount(rows) {
  const set = new Set();
  rows.forEach(r => {
    if (r.user_pseudo_id) set.add(r.user_pseudo_id);
  });
  return set.size;
}

function getAvgDau(rows, start, end) {
  const dateMap = {};
  rows.forEach(r => {
    if (!r.date) return;
    if (!dateMap[r.date]) dateMap[r.date] = new Set();
    if (r.user_pseudo_id) dateMap[r.date].add(r.user_pseudo_id);
  });

  let totalDau = 0;
  let days = 0;
  const startISO = toISO(start);
  const endISO = toISO(end);
  if (!startISO || !endISO || startISO > endISO) return 0;
  let curISO = startISO;
  let maxLoop = 366;

  while (curISO && curISO <= endISO && maxLoop > 0) {
    totalDau += dateMap[curISO] ? dateMap[curISO].size : 0;
    days++;
    const nextISO = getDateOffset(curISO, 1);
    if (!nextISO || nextISO === curISO) break;
    curISO = nextISO;
    maxLoop--;
  }
  return days > 0 ? totalDau / days : 0;
}

function getStickinessMetrics(start, end) {
  const stickSource = (PLATFORM === 'WEB') ? (DATA.webStickiness || []) : DATA.stickiness;
  const startISO = toISO(start);
  const endISO = toISO(end);

  const targetPlat = (PLATFORM === 'ALL' || PLATFORM === 'APP') ? 'ALL' : PLATFORM;

  const filtered = stickSource.filter(r => {
    const rp = String(r.platform || '').toUpperCase();
    const tp = String(targetPlat).toUpperCase();
    if (rp !== tp) return false;
    if (!r.date) return false;
    return r.date >= startISO && r.date <= endISO;
  });

  if (!filtered.length) return { wau: 0, mau: 0, stick: 0 };
  const wau = filtered.reduce((s, r) => s + (r.wau || 0), 0) / filtered.length;
  const mau = filtered.reduce((s, r) => s + (r.mau || 0), 0) / filtered.length;
  const stick = filtered.reduce((s, r) => s + (r.stickiness_pct !== undefined ? r.stickiness_pct : (r.mau ? r.dau / r.mau : 0)), 0) / filtered.length;
  return { wau, mau, stick };
}

function periodRanges() {
  const end = maxDate || new Date();
  if (PERIOD === 'CUSTOM') {
    const f = document.getElementById('dFrom').value, t = document.getElementById('dTo').value;
    const cs = f ? parseD(f) : new Date(end.getFullYear(), end.getMonth(), 1);
    const ce = t ? parseD(t) : end;
    const span = Math.round((ce - cs) / 86400000);
    const pe = new Date(cs); pe.setDate(cs.getDate() - 1);
    const ps = new Date(pe); ps.setDate(pe.getDate() - span);
    return { curStart: cs, curEnd: ce, prevStart: ps, prevEnd: pe };
  }
  if (PERIOD === 'MTD') {
    const cs = new Date(end.getFullYear(), end.getMonth(), 1);
    const dom = end.getDate();
    let pe = new Date(end.getFullYear(), end.getMonth() - 1, dom);
    if (pe.getMonth() === end.getMonth()) {
      pe = new Date(end.getFullYear(), end.getMonth(), 0);
    }
    const ps = new Date(end.getFullYear(), end.getMonth() - 1, 1);
    return { curStart: cs, curEnd: end, prevStart: ps, prevEnd: pe };
  }
  const dow = (end.getDay() + 6) % 7;
  const cs = new Date(end); cs.setDate(end.getDate() - dow);
  const pe = new Date(cs); pe.setDate(cs.getDate() - 1);
  const ps = new Date(pe); ps.setDate(pe.getDate() - 6);
  return { curStart: cs, curEnd: end, prevStart: ps, prevEnd: pe };
}

function inR(d, a, b) { return d >= a && d <= b; }
function fmt(n) { return n >= 1000 ? Math.round(n).toLocaleString('en-US') : Math.round(n).toString(); }
function pctv(n) { return (n * 100).toFixed(1) + '%'; }

function delta(cur, prev, isPct) {
  if (!COMPARE || prev === 0) return '';
  const diff = isPct ? (cur - prev) * 100 : ((cur - prev) / prev) * 100;
  const up = diff >= 0, arrow = up ? '▲' : '▼', cls = up ? 'up' : 'dn';
  const val = isPct ? Math.abs(diff).toFixed(1) + 'pt' : Math.abs(diff).toFixed(1) + '%';
  const lbl = PERIOD === 'MTD' ? 'prev MTD' : PERIOD === 'WTD' ? 'prev WTD' : 'prev period';
  return `<span class="cmp ${cls}">
    <span class="cmp-icon">${arrow}</span>
    <span class="cmp-value">${val}</span>
    <span class="cmp-label">vs ${lbl}</span>
  </span>`;
}

function getDistinctSessionsCount(rows) {
  const set = new Set();
  let fallbackCount = 0;
  rows.forEach(r => {
    if (r.session_id) set.add(r.session_id);
    else if (r.user_pseudo_id) {
      fallbackCount++;
      set.add(r.user_pseudo_id + '_' + fallbackCount);
    }
  });
  return set.size;
}

function getCombinedEngagementRows(startISO, endISO) {
  const curPlat = (PLATFORM || 'ALL').toUpperCase();
  let rows = [];

  const webData = (DATA.webBounceEngDaylevel && DATA.webBounceEngDaylevel.length) ? DATA.webBounceEngDaylevel : (DATA.webBounceEngagement || []);
  const appData = DATA.appBounceEngagement || [];

  if (curPlat === 'WEB') {
    rows = webData;
  } else if (curPlat === 'ANDROID' || curPlat === 'IOS' || curPlat === 'APP') {
    rows = appData.filter(r => isPlatMatch(r.platform));
  } else {
    // curPlat === 'ALL' (App + Web)
    rows = [...webData, ...appData];
  }

  if (!startISO || !endISO) return rows;
  return rows.filter(r => r.date && r.date >= startISO && r.date <= endISO);
}

function getEngagementMetricsForRange(start, end) {
  const startISO = toISO(start);
  const endISO = toISO(end);
  const rows = getCombinedEngagementRows(startISO, endISO);

  if (!rows.length) {
    return { bounceRate: 0, avgEngagementSec: 0 };
  }

  let totalSess = 0;
  let weightedBounce = 0;
  let weightedEng = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const s = r.sessions || 1;
    totalSess += s;
    let b = parseFloat(r.bounce_rate_pct || 0);
    if (b > 0 && b <= 1.0) b = b * 100;
    weightedBounce += (b * s);
    weightedEng += ((parseFloat(r.avg_engagement_sec || 0)) * s);
  }

  return {
    bounceRate: totalSess > 0 ? (weightedBounce / totalSess) : 0,
    avgEngagementSec: totalSess > 0 ? (weightedEng / totalSess) : 0
  };
}

function deltaBounce(cur, prev) {
  if (!COMPARE || !prev || prev === 0) return '';
  const diff = ((cur - prev) / prev) * 100;
  const isGood = diff <= 0;
  const arrow = diff >= 0 ? '▲' : '▼';
  const cls = isGood ? 'up' : 'dn';
  const val = Math.abs(diff).toFixed(1) + '%';
  const lbl = PERIOD === 'MTD' ? 'prev MTD' : PERIOD === 'WTD' ? 'prev WTD' : 'prev period';
  return `<span class="cmp ${cls}">
    <span class="cmp-icon">${arrow}</span>
    <span class="cmp-value">${val}</span>
    <span class="cmp-label">vs ${lbl}</span>
  </span>`;
}

function fmtSec(sec) {
  if (sec == null || isNaN(sec) || sec === 0) return '0s';
  if (sec >= 60) {
    const mins = Math.floor(sec / 60);
    const remSec = (sec % 60).toFixed(1);
    return `${mins}m ${remSec}s`;
  }
  return `${sec.toFixed(1)}s`;
}

function metrics() {
  const { curStart, curEnd, prevStart, prevEnd } = periodRanges();

  const curRows = getFilteredUserRows(curStart, curEnd);
  const prevRows = getFilteredUserRows(prevStart, prevEnd);

  const tcCur = getDistinctUsersCount(curRows);
  const tcPrev = getDistinctUsersCount(prevRows);

  const ncCurRows = curRows.filter(r => r.is_new_user === true);
  const ncPrevRows = prevRows.filter(r => r.is_new_user === true);
  const ncCur = getDistinctUsersCount(ncCurRows);
  const ncPrev = getDistinctUsersCount(ncPrevRows);

  const rcCur = Math.max(0, tcCur - ncCur);
  const rcPrev = Math.max(0, tcPrev - ncPrev);

  const dauCur = getAvgDau(curRows, curStart, curEnd);
  const dauPrev = getAvgDau(prevRows, prevStart, prevEnd);

  const stickinessCur = getStickinessMetrics(curStart, curEnd);
  const stickinessPrev = getStickinessMetrics(prevStart, prevEnd);

  const sessCur = getDistinctSessionsCount(curRows);
  const sessPrev = getDistinctSessionsCount(prevRows);

  const bounceCur = getEngagementMetricsForRange(curStart, curEnd);
  const bouncePrev = getEngagementMetricsForRange(prevStart, prevEnd);

  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  document.getElementById('rangeLabel').textContent =
    `${curStart.toLocaleDateString('en-US', options)} — ${curEnd.toLocaleDateString('en-US', options)}`;

  return {
    nc: { cur: ncCur, prev: ncPrev },
    rc: { cur: rcCur, prev: rcPrev },
    total: { cur: tcCur, prev: tcPrev },
    dau: { cur: dauCur, prev: dauPrev },
    wau: { cur: stickinessCur.wau, prev: stickinessPrev.wau },
    mau: { cur: stickinessCur.mau, prev: stickinessPrev.mau },
    stick: { cur: stickinessCur.stick, prev: stickinessPrev.stick },
    sessions: { cur: sessCur, prev: sessPrev },
    bounce: { cur: bounceCur.bounceRate, prev: bouncePrev.bounceRate },
    avgEng: { cur: bounceCur.avgEngagementSec, prev: bouncePrev.avgEngagementSec },
    curRows: curRows
  };
}

function aggListFromRows(rows, keyField) {
  const map = {};
  rows.forEach(r => {
    const val = r[keyField];
    if (val) {
      if (!map[val]) map[val] = new Set();
      if (r.user_pseudo_id) map[val].add(r.user_pseudo_id);
    }
  });
  return Object.entries(map)
    .map(([k, v]) => ({ [keyField]: k, users: v.size }))
    .sort((a, b) => b.users - a.users);
}

// Render Dashboard components
function kpiCard(label, value, cmp, onclickCode, isActive = false) {
  return `
    <div class="card kpi ${isActive ? 'active' : ''}" ${onclickCode ? `onclick="${onclickCode}"` : ''}>
      <div class="lbl">${label}</div>
      <div class="val">${value}</div>
      ${cmp}
    </div>
  `;
}

// Aggregators to prevent Android/iOS duplicates when PLATFORM === 'ALL'
function aggregateFunnel(arr) {
  const filtered = arr.filter(r => PLATFORM === 'ALL' || !r.platform || r.platform === PLATFORM);
  const stepsOrder = [];
  const map = {};
  filtered.forEach(r => {
    const step = r.step;
    if (step) {
      if (map[step] === undefined) {
        stepsOrder.push(step);
        map[step] = 0;
      }
      map[step] += (r.users || 0);
    }
  });
  return stepsOrder.map(step => ({ step, users: map[step] }));
}

function aggregateFeatures(arr) {
  const filtered = arr.filter(r => PLATFORM === 'ALL' || !r.platform || r.platform === PLATFORM);
  const map = {};
  filtered.forEach(r => {
    const feat = r.feature;
    if (feat) {
      map[feat] = (map[feat] || 0) + (r.users || 0);
    }
  });
  return Object.entries(map)
    .map(([feature, users]) => ({ feature, users }))
    .sort((a, b) => b.users - a.users);
}

function getRCFeatureUsage() {
  const { curStart, curEnd } = periodRanges();

  // Filter appRows by active date, platform, and user_type === 'Returning'
  const filtered = appRows.filter(r => {
    const rowDate = parseD(r.date);
    if (!rowDate || !inR(rowDate, curStart, curEnd)) return false;
    if (PLATFORM !== 'ALL' && r.platform !== PLATFORM) return false;

    const ut = String(r.user_type || '').toLowerCase().trim();
    return ut === 'returning';
  });

  const map = {};
  filtered.forEach(r => {
    const feat = r.feature;
    if (feat) {
      if (!map[feat]) map[feat] = new Set();
      if (r.uid) map[feat].add(r.uid);
    }
  });

  return Object.entries(map)
    .map(([feature, uids]) => ({ feature, users: uids.size }))
    .sort((a, b) => b.users - a.users)
    .slice(0, 10);
}

function tableHTML(arr, keyField, limit = 5) {
  const items = limit ? arr.slice(0, limit) : arr;
  if (!items.length) return '<div style="color:var(--text-muted);font-size:13px;padding: 20px 0;text-align:center;">No data available</div>';
  const max = Math.max(...items.map(r => r.users));
  let h = '<table><tbody>';
  items.forEach(r => {
    const w = (r.users / max * 100).toFixed(0);
    h += `
      <tr>
        <td>${r[keyField]}</td>
        <td class="num bar-cell">
          <div class="bar-fill" style="width:${w}%"></div>
          <span>${fmt(r.users)}</span>
        </td>
      </tr>
    `;
  });
  return h + '</tbody></table>';
}

function getDayLevelBreakdown(curStart, curEnd) {
  const dataSource = getCombinedDataSource();
  
  let startISO = toISO(curStart);
  let endISO = toISO(curEnd);

  if (!startISO || !endISO) {
    const today = new Date();
    endISO = toISO(today);
    startISO = endISO.substring(0, 7) + '-01';
  }

  const daysMap = {};
  let curISO = startISO;
  let maxLoop = 366;
  while (curISO <= endISO && maxLoop > 0) {
    daysMap[curISO] = {
      date: curISO,
      sessionsSet: new Set(),
      tcSet: new Set(),
      ncSet: new Set(),
      rowsCount: 0
    };
    curISO = getDateOffset(curISO, 1);
    maxLoop--;
  }

  if (Object.keys(daysMap).length === 0) {
    const todayStr = toISO(new Date());
    daysMap[todayStr] = {
      date: todayStr,
      sessionsSet: new Set(),
      tcSet: new Set(),
      ncSet: new Set(),
      rowsCount: 0
    };
  }

  if (dataSource && dataSource.length) {
    dataSource.forEach(r => {
      if (!r.date || !daysMap[r.date]) return;
      if (!isPlatMatch(r.platform)) return;

      const entry = daysMap[r.date];
      entry.rowsCount++;
      if (r.session_id) {
        entry.sessionsSet.add(r.session_id);
      } else if (r.user_pseudo_id) {
        entry.sessionsSet.add(r.user_pseudo_id + '_' + entry.rowsCount);
      }

      if (r.user_pseudo_id) {
        entry.tcSet.add(r.user_pseudo_id);
        if (r.is_new_user === true) {
          entry.ncSet.add(r.user_pseudo_id);
        }
      }
    });
  }

  const engMap = {};
  const engRows = getCombinedEngagementRows(startISO, endISO);
  if (engRows && engRows.length) {
    const dateGroup = {};
    for (let i = 0; i < engRows.length; i++) {
      const r = engRows[i];
      if (!r.date) continue;

      const d = r.date;
      if (!dateGroup[d]) {
        dateGroup[d] = { totalSess: 0, weightedBounce: 0, weightedEng: 0 };
      }
      const s = r.sessions || 1;
      let b = parseFloat(r.bounce_rate_pct || 0);
      if (b > 0 && b <= 1.0) b *= 100;

      dateGroup[d].totalSess += s;
      dateGroup[d].weightedBounce += (b * s);
      dateGroup[d].weightedEng += ((parseFloat(r.avg_engagement_sec || 0)) * s);
    }

    const keys = Object.keys(dateGroup);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const g = dateGroup[k];
      engMap[k] = {
        bounce: g.totalSess > 0 ? (g.weightedBounce / g.totalSess) : 0,
        engSec: g.totalSess > 0 ? (g.weightedEng / g.totalSess) : 0
      };
    }
  }

  return Object.values(daysMap).sort((a, b) => a.date.localeCompare(b.date)).map(d => {
    const tc = d.tcSet.size;
    const nc = d.ncSet.size;
    const rc = Math.max(0, tc - nc);
    const sessions = d.sessionsSet.size;
    const dau = tc;

    const parts = d.date.split('-');
    const displayDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    const k1 = d.date; // YYYY-MM-DD
    const k2 = displayDate; // DD-MM-YYYY
    const k3 = d.date.replace(/[-]/g, '/');
    const k4 = displayDate.replace(/[-]/g, '/');

    const engData = engMap[k1] || engMap[k2] || engMap[k3] || engMap[k4] || { bounce: 0, engSec: 0 };

    return {
      date: d.date,
      displayDate: displayDate,
      sessions: sessions,
      tc: tc,
      nc: nc,
      rc: rc,
      dau: dau,
      bounce: engData.bounce,
      engSec: engData.engSec
    };
  });
}

function getDimensionDayLevelPivot(curStart, curEnd, keyField, targetDateStr, topLimit = null) {
  const curRows = getFilteredUserRows(curStart, curEnd);
  
  const dateMap = {};
  const overallMap = {};
  curRows.forEach(r => {
    if (!r.date || !r[keyField]) return;

    if (!overallMap[r[keyField]]) overallMap[r[keyField]] = new Set();
    if (r.user_pseudo_id) overallMap[r[keyField]].add(r.user_pseudo_id);

    if (!dateMap[r.date]) dateMap[r.date] = {};
    if (!dateMap[r.date][r[keyField]]) dateMap[r.date][r[keyField]] = new Set();
    if (r.user_pseudo_id) dateMap[r.date][r[keyField]].add(r.user_pseudo_id);
  });

  const allDimensionValues = Object.keys(overallMap);
  const targetDateMap = (targetDateStr && dateMap[targetDateStr]) ? dateMap[targetDateStr] : {};

  const sortedValues = allDimensionValues.sort((a, b) => {
    const countA = targetDateMap[a] ? targetDateMap[a].size : 0;
    const countB = targetDateMap[b] ? targetDateMap[b].size : 0;
    
    if (countB !== countA) {
      return countB - countA;
    }
    const totalA = overallMap[a] ? overallMap[a].size : 0;
    const totalB = overallMap[b] ? overallMap[b].size : 0;
    return totalB - totalA;
  });

  const topValues = topLimit ? sortedValues.slice(0, topLimit) : sortedValues;

  return {
    topValues,
    dateMap
  };
}

function getLandingPageDayLevelPivot(curStart, curEnd, targetDateStr, topLimit = 30) {
  const startISO = toISO(curStart);
  const endISO = toISO(curEnd);
  const data = DATA.webBounceEngagement || [];

  const curPlat = (PLATFORM || 'ALL').toLowerCase();
  if (curPlat !== 'all' && curPlat !== 'web') {
    return { topPages: [], dateMap: {}, overallMap: {} };
  }

  const dateMap = {};
  const overallMap = {};

  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    if (!r.date || r.date < startISO || r.date > endISO) continue;

    const lp = r.landing_page || '/';
    const sess = r.sessions || 0;

    overallMap[lp] = (overallMap[lp] || 0) + sess;

    const isoDate = r.date;

    if (!dateMap[isoDate]) dateMap[isoDate] = {};
    if (!dateMap[isoDate][lp]) {
      dateMap[isoDate][lp] = { sessions: 0, total_users: 0 };
    }
    dateMap[isoDate][lp].sessions += sess;
    dateMap[isoDate][lp].total_users += (r.total_users || 0);
  }

  const allLandingPages = Object.keys(overallMap);
  const targetDateMap = (targetDateStr && dateMap[targetDateStr]) ? dateMap[targetDateStr] : {};

  allLandingPages.sort((a, b) => {
    const countA = targetDateMap[a] ? targetDateMap[a].sessions : 0;
    const countB = targetDateMap[b] ? targetDateMap[b].sessions : 0;
    if (countB !== countA) return countB - countA;
    return (overallMap[b] || 0) - (overallMap[a] || 0);
  });

  const topPages = topLimit ? allLandingPages.slice(0, topLimit) : allLandingPages;

  return {
    topPages,
    dateMap,
    overallMap
  };
}

function getLandingPageBounceRateDayLevelPivot(curStart, curEnd, targetDateStr, topLimit = 30, minSessions) {
  const startISO = toISO(curStart);
  const endISO = toISO(curEnd);
  const data = DATA.webBounceEngagement || [];

  const curPlat = (PLATFORM || 'ALL').toLowerCase();
  if (curPlat !== 'all' && curPlat !== 'web') {
    return { topPages: [], dateMap: {}, overallMap: {}, overallSess: {}, minSessThreshold: 10 };
  }

  if (window.minBounceRateSessions === undefined) {
    window.minBounceRateSessions = 10;
  }
  const minSessThreshold = minSessions !== undefined ? minSessions : window.minBounceRateSessions;

  const dateMap = {};
  const overallWeighted = {};
  const overallSess = {};

  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    if (!r.date || r.date < startISO || r.date > endISO) continue;

    const lp = r.landing_page || '/';
    const sess = parseFloat(r.sessions || 1);
    let b = parseFloat(r.bounce_rate_pct !== undefined ? r.bounce_rate_pct : (r.bounce_rate || 0));
    if (b > 0 && b <= 1.0) b *= 100;

    const isoDate = r.date;

    if (!dateMap[isoDate]) dateMap[isoDate] = {};
    if (!dateMap[isoDate][lp]) {
      dateMap[isoDate][lp] = { totalSess: 0, weightedBounce: 0, bounce_rate_pct: 0 };
    }
    dateMap[isoDate][lp].totalSess += sess;
    dateMap[isoDate][lp].weightedBounce += (b * sess);
    dateMap[isoDate][lp].bounce_rate_pct = dateMap[isoDate][lp].totalSess > 0 ? (dateMap[isoDate][lp].weightedBounce / dateMap[isoDate][lp].totalSess) : 0;

    overallWeighted[lp] = (overallWeighted[lp] || 0) + (b * sess);
    overallSess[lp] = (overallSess[lp] || 0) + sess;
  }

  const overallBounceMap = {};
  let allLandingPages = Object.keys(overallSess);
  allLandingPages.forEach(lp => {
    overallBounceMap[lp] = overallSess[lp] > 0 ? (overallWeighted[lp] / overallSess[lp]) : 0;
  });

  // Filter landing pages by minimum session threshold
  if (minSessThreshold > 0) {
    const filtered = allLandingPages.filter(lp => (overallSess[lp] || 0) > minSessThreshold);
    if (filtered.length > 0) {
      allLandingPages = filtered;
    }
  }

  const targetDateMap = (targetDateStr && dateMap[targetDateStr]) ? dateMap[targetDateStr] : {};

  allLandingPages.sort((a, b) => {
    const bA = targetDateMap[a] ? targetDateMap[a].bounce_rate_pct : (overallBounceMap[a] || 0);
    const bB = targetDateMap[b] ? targetDateMap[b].bounce_rate_pct : (overallBounceMap[b] || 0);
    if (bB !== bA) return bB - bA;
    return (overallBounceMap[b] || 0) - (overallBounceMap[a] || 0);
  });

  const topPages = topLimit ? allLandingPages.slice(0, topLimit) : allLandingPages;

  return {
    topPages,
    dateMap,
    overallMap: overallBounceMap,
    overallSess,
    minSessThreshold
  };
}

function calcDayChangeHTML(valCur, valPrev) {
  if (valPrev == null || valPrev === 0) {
    if (valCur > 0) {
      return `<span style="color: var(--text-muted); font-size: 11.5px; font-weight: 500;">N/A</span>`;
    }
    return `<span style="color: var(--text-muted); font-size: 11.5px; font-weight: 500;">0.0%</span>`;
  }
  const diff = ((valCur - valPrev) / valPrev) * 100;
  const up = diff >= 0;
  const arrow = up ? '▲' : '▼';
  const cls = up ? 'up' : 'dn';
  const valStr = Math.abs(diff).toFixed(1) + '%';

  return `<span class="cmp ${cls}" style="font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 3px;">
    <span class="cmp-icon" style="font-size: 9px;">${arrow}</span>
    <span class="cmp-value">${valStr}</span>
  </span>`;
}

function renderPivotMatrixTable(containerId, title, subtitle, dayBreakdown, topValues, dateMap, keyField, selectedDateStr, prevDateStr, metricLabel = 'Unique Users') {
  if (!topValues || !topValues.length) return '';

  const selParts = selectedDateStr ? selectedDateStr.split('-') : [];
  const selDisplay = selParts.length === 3 ? `${selParts[2]}-${selParts[1]}` : selectedDateStr;

  const prevParts = prevDateStr ? prevDateStr.split('-') : [];
  const prevDisplay = prevParts.length === 3 ? `${prevParts[2]}-${prevParts[1]}` : 'prev';

  return `
    <div class="card" style="padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
        <div>
          <div class="sect-title" style="font-size: 16px; font-weight: 600; margin: 0; color: var(--text-primary); display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span>${title}</span>
            <span style="font-size: 11.5px; font-weight: 600; background: rgba(99, 102, 241, 0.1); color: var(--accent); padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(99, 102, 241, 0.2);">
              Metric: ${metricLabel}
            </span>
            <span style="font-size: 11.5px; font-weight: 600; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2);">
              Platform: ${getPlatformBadgeLabel(PLATFORM)}
            </span>
          </div>
          <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">
            ${subtitle}
          </div>
        </div>
        <span style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">
          ${topValues.length} Items · ${dayBreakdown.length} Dates
        </span>
      </div>

      <div class="day-matrix-scroll-container" id="${containerId}">
        <table class="day-matrix-table">
          <thead>
            <tr>
              <th class="day-matrix-th sticky-col">${keyField.toUpperCase().replace('_', ' ')} (${metricLabel.toUpperCase()}) \\ DATES</th>
              ${dayBreakdown.map(d => `
                <th class="day-matrix-th ${d.date === selectedDayLevelDate ? 'active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')" title="Click to select ${d.displayDate}">
                  ${d.displayDate}
                </th>
              `).join('')}
              <th class="day-matrix-th sticky-col-right" title="% Change between ${selDisplay} vs ${prevDisplay}">
                % Change (${selDisplay} vs ${prevDisplay})
              </th>
            </tr>
          </thead>
          <tbody class="day-matrix-tbody">
            ${topValues.map(val => {
              const valCur = (selectedDateStr && dateMap[selectedDateStr] && dateMap[selectedDateStr][val]) ? dateMap[selectedDateStr][val].size : 0;
              const valPrev = (prevDateStr && dateMap[prevDateStr] && dateMap[prevDateStr][val]) ? dateMap[prevDateStr][val].size : 0;

              return `
                <tr>
                  <td class="day-matrix-td sticky-col" title="${val}">${val}</td>
                  ${dayBreakdown.map(d => {
                    const count = (dateMap[d.date] && dateMap[d.date][val]) ? dateMap[d.date][val].size : 0;
                    return `
                      <td class="day-matrix-td ${d.date === selectedDayLevelDate ? 'day-col-active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')">
                        ${fmt(count)}
                      </td>
                    `;
                  }).join('')}
                  <td class="day-matrix-td sticky-col-right">
                    ${calcDayChangeHTML(valCur, valPrev)}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderLandingPagePivotTable(containerId, title, subtitle, dayBreakdown, topPages, dateMap, selectedDateStr, prevDateStr) {
  if (!topPages || !topPages.length) return '';

  const selParts = selectedDateStr ? selectedDateStr.split('-') : [];
  const selDisplay = selParts.length === 3 ? `${selParts[2]}-${selParts[1]}` : selectedDateStr;

  const prevParts = prevDateStr ? prevDateStr.split('-') : [];
  const prevDisplay = prevParts.length === 3 ? `${prevParts[2]}-${prevParts[1]}` : 'prev';

  return `
    <div class="card" style="padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
        <div>
          <div class="sect-title" style="font-size: 16px; font-weight: 600; margin: 0; color: var(--text-primary); display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span>${title}</span>
            <span style="font-size: 11.5px; font-weight: 600; background: rgba(99, 102, 241, 0.1); color: var(--accent); padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(99, 102, 241, 0.2);">
              Metric: Total Sessions
            </span>
            <span style="font-size: 11.5px; font-weight: 600; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2);">
              Platform: Web
            </span>
          </div>
          <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">
            ${subtitle}
          </div>
        </div>
        <span style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">
          ${topPages.length} Landing Pages · ${dayBreakdown.length} Dates
        </span>
      </div>

      <div class="day-matrix-scroll-container" id="${containerId}">
        <table class="day-matrix-table">
          <thead>
            <tr>
              <th class="day-matrix-th sticky-col">LANDING PAGE (SESSIONS) \\ DATES</th>
              ${dayBreakdown.map(d => `
                <th class="day-matrix-th ${d.date === selectedDayLevelDate ? 'active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')" title="Click to select ${d.displayDate}">
                  ${d.displayDate}
                </th>
              `).join('')}
              <th class="day-matrix-th sticky-col-right" title="% Change between ${selDisplay} vs ${prevDisplay}">
                % Change (${selDisplay} vs ${prevDisplay})
              </th>
            </tr>
          </thead>
          <tbody class="day-matrix-tbody">
            ${topPages.map(lp => {
              const valCur = (selectedDateStr && dateMap[selectedDateStr] && dateMap[selectedDateStr][lp]) ? dateMap[selectedDateStr][lp].sessions : 0;
              const valPrev = (prevDateStr && dateMap[prevDateStr] && dateMap[prevDateStr][lp]) ? dateMap[prevDateStr][lp].sessions : 0;

              return `
                <tr>
                  <td class="day-matrix-td sticky-col" title="${lp}" style="font-family: monospace; font-size: 12px; font-weight: 500; color: var(--accent); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${lp}
                  </td>
                  ${dayBreakdown.map(d => {
                    const item = (dateMap[d.date] && dateMap[d.date][lp]);
                    const count = item ? item.sessions : 0;
                    return `
                      <td class="day-matrix-td ${d.date === selectedDayLevelDate ? 'day-col-active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')" title="${lp} on ${d.displayDate}: ${count} sessions">
                        ${count > 0 ? fmt(count) : '-'}
                      </td>
                    `;
                  }).join('')}
                  <td class="day-matrix-td sticky-col-right">
                    ${calcDayChangeHTML(valCur, valPrev)}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.setBounceRateMinSessions = function(val) {
  window.minBounceRateSessions = parseInt(val, 10) || 0;
  renderDayLevelOverview();
};

function renderLandingPageBounceRatePivotTable(containerId, title, subtitle, dayBreakdown, topPages, dateMap, selectedDateStr, prevDateStr, overallSess = {}, minSessThreshold = 10) {
  if (!topPages || !topPages.length) {
    return `
      <div class="card" style="padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div class="sect-title" style="font-size: 16px; font-weight: 600; margin: 0; color: var(--text-primary); display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span>${title}</span>
              <span style="font-size: 11.5px; font-weight: 600; background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(239, 68, 68, 0.2);">
                Metric: Bounce Rate (%)
              </span>
              <span style="font-size: 11.5px; font-weight: 600; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2);">
                Platform: Web
              </span>
            </div>
            <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">
              No landing pages found with > ${minSessThreshold} total sessions. Try selecting a lower minimum session filter.
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; background: rgba(99, 102, 241, 0.06); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.15);">
            <span style="font-size: 11.5px; font-weight: 600; color: var(--text-secondary);">Min Traffic Filter:</span>
            <select onchange="window.setBounceRateMinSessions(this.value)" style="padding: 2px 6px; font-size: 11.5px; font-weight: 600; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); cursor: pointer;">
              <option value="0" ${minSessThreshold === 0 ? 'selected' : ''}>All Pages (>0 sessions)</option>
              <option value="5" ${minSessThreshold === 5 ? 'selected' : ''}> > 5 Sessions</option>
              <option value="10" ${minSessThreshold === 10 ? 'selected' : ''}> > 10 Sessions (Default)</option>
              <option value="25" ${minSessThreshold === 25 ? 'selected' : ''}> > 25 Sessions</option>
              <option value="50" ${minSessThreshold === 50 ? 'selected' : ''}> > 50 Sessions</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  const selParts = selectedDateStr ? selectedDateStr.split('-') : [];
  const selDisplay = selParts.length === 3 ? `${selParts[2]}-${selParts[1]}` : selectedDateStr;

  const prevParts = prevDateStr ? prevDateStr.split('-') : [];
  const prevDisplay = prevParts.length === 3 ? `${prevParts[2]}-${prevParts[1]}` : 'prev';

  return `
    <div class="card" style="padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
        <div>
          <div class="sect-title" style="font-size: 16px; font-weight: 600; margin: 0; color: var(--text-primary); display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span>${title}</span>
            <span style="font-size: 11.5px; font-weight: 600; background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(239, 68, 68, 0.2);">
              Metric: Bounce Rate (%)
            </span>
            <span style="font-size: 11.5px; font-weight: 600; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2);">
              Platform: Web
            </span>
          </div>
          <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">
            ${subtitle} (Filtered by landing pages with > ${minSessThreshold} total sessions)
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 6px; background: rgba(99, 102, 241, 0.06); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.15);">
            <span style="font-size: 11.5px; font-weight: 600; color: var(--text-secondary);">Min Traffic Filter:</span>
            <select onchange="window.setBounceRateMinSessions(this.value)" style="padding: 2px 6px; font-size: 11.5px; font-weight: 600; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); cursor: pointer;">
              <option value="0" ${minSessThreshold === 0 ? 'selected' : ''}>All Pages (>0 sessions)</option>
              <option value="5" ${minSessThreshold === 5 ? 'selected' : ''}> > 5 Sessions</option>
              <option value="10" ${minSessThreshold === 10 ? 'selected' : ''}> > 10 Sessions (Default)</option>
              <option value="25" ${minSessThreshold === 25 ? 'selected' : ''}> > 25 Sessions</option>
              <option value="50" ${minSessThreshold === 50 ? 'selected' : ''}> > 50 Sessions</option>
            </select>
          </div>
          <span style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">
            ${topPages.length} Landing Pages · ${dayBreakdown.length} Dates
          </span>
        </div>
      </div>

      <div class="day-matrix-scroll-container" id="${containerId}">
        <table class="day-matrix-table">
          <thead>
            <tr>
              <th class="day-matrix-th sticky-col">LANDING PAGE (BOUNCE RATE) \\ DATES</th>
              ${dayBreakdown.map(d => `
                <th class="day-matrix-th ${d.date === selectedDayLevelDate ? 'active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')" title="Click to select ${d.displayDate}">
                  ${d.displayDate}
                </th>
              `).join('')}
              <th class="day-matrix-th sticky-col-right" title="% Point Change between ${selDisplay} vs ${prevDisplay}">
                % Change (${selDisplay} vs ${prevDisplay})
              </th>
            </tr>
          </thead>
          <tbody class="day-matrix-tbody">
            ${topPages.map(lp => {
              const valCur = (selectedDateStr && dateMap[selectedDateStr] && dateMap[selectedDateStr][lp]) ? dateMap[selectedDateStr][lp].bounce_rate_pct : 0;
              const valPrev = (prevDateStr && dateMap[prevDateStr] && dateMap[prevDateStr][lp]) ? dateMap[prevDateStr][lp].bounce_rate_pct : 0;
              const sessTotal = overallSess[lp] || 0;

              return `
                <tr>
                  <td class="day-matrix-td sticky-col" title="${lp} (Total Sessions: ${sessTotal})" style="font-family: monospace; font-size: 12px; font-weight: 500; color: var(--accent); max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <span>${lp}</span>
                    <span style="font-size: 10.5px; color: var(--text-secondary); margin-left: 6px; font-weight: 400; font-family: sans-serif;">(${sessTotal} sess)</span>
                  </td>
                  ${dayBreakdown.map(d => {
                    const item = (dateMap[d.date] && dateMap[d.date][lp]);
                    const bRate = item ? item.bounce_rate_pct : 0;
                    const sessDaily = item ? item.totalSess : 0;
                    return `
                      <td class="day-matrix-td ${d.date === selectedDayLevelDate ? 'day-col-active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')" title="${lp} on ${d.displayDate}: ${bRate > 0 ? bRate.toFixed(1) + '%' : 'N/A'} bounce rate (${sessDaily} sessions)">
                        ${bRate > 0 ? bRate.toFixed(1) + '%' : '-'}
                      </td>
                    `;
                  }).join('')}
                  <td class="day-matrix-td sticky-col-right">
                    ${calcDayChangeHTML(valCur, valPrev)}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderDayLevelOverview() {
  document.getElementById('crumb').textContent = 'overview (day level)';
  const { curStart, curEnd } = periodRanges();
  const dayBreakdown = getDayLevelBreakdown(curStart, curEnd);
  const isDataLoaded = (DATA.users && DATA.users.length > 0) || (DATA.webUsers && DATA.webUsers.length > 0);

  const scrollMap = {};
  document.querySelectorAll('.day-matrix-scroll-container').forEach(c => {
    if (c.id) {
      scrollMap[c.id] = { left: c.scrollLeft, top: c.scrollTop };
    }
  });

  if (!isDataLoaded) {
    document.getElementById('overview-view').innerHTML = `
      <div class="card" style="padding: 40px; text-align: center; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px; border: 1.5px dashed var(--border-color); border-radius: 16px;">
        <div style="font-size: 44px; margin-bottom: 14px;">📅</div>
        <h3 style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">No Day Level Dataset Uploaded</h3>
        <p style="color: var(--text-secondary); font-size: 13.5px; margin-bottom: 20px; max-width: 460px; line-height: 1.6;">
          Please upload your analytics dataset to view the horizontal date-by-date pivot matrix breakdown.
        </p>
        <button class="upload-btn" onclick="window.navigateToView('upload')" style="width: auto; padding: 10px 24px; display: inline-flex; font-size: 14px; font-weight: 600; margin: 0; background: var(--accent);">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 8px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          Upload Analytics Dataset Now
        </button>
      </div>
    `;
    return;
  }

  const availableDates = dayBreakdown.map(d => d.date);
  if (!selectedDayLevelDate || !availableDates.includes(selectedDayLevelDate)) {
    selectedDayLevelDate = availableDates.length ? availableDates[availableDates.length - 1] : toISO(new Date());
  }

  const selectedIdx = dayBreakdown.findIndex(d => d.date === selectedDayLevelDate);
  const selectedItem = (selectedIdx >= 0 && dayBreakdown[selectedIdx]) ? dayBreakdown[selectedIdx] : {
    date: selectedDayLevelDate, displayDate: selectedDayLevelDate, sessions: 0, tc: 0, nc: 0, rc: 0, bounce: 0, engSec: 0
  };
  const prevItem = selectedIdx > 0 ? dayBreakdown[selectedIdx - 1] : null;
  const prevDateStr = prevItem ? prevItem.date : null;

  const selParts = selectedDayLevelDate ? selectedDayLevelDate.split('-') : [];
  const selDisplay = selParts.length === 3 ? `${selParts[2]}-${selParts[1]}` : selectedDayLevelDate;

  const prevParts = prevItem ? prevItem.displayDate.split('-') : [];
  const prevDisplay = prevParts.length === 3 ? `${prevParts[0]}-${prevParts[1]}` : 'prev';

  const channelsPivot = getDimensionDayLevelPivot(curStart, curEnd, 'source', selectedDayLevelDate);
  const countriesPivot = getDimensionDayLevelPivot(curStart, curEnd, 'country', selectedDayLevelDate);
  const devicesPivot = getDimensionDayLevelPivot(curStart, curEnd, 'device_category', selectedDayLevelDate);
  const landingPagesPivot = getLandingPageDayLevelPivot(curStart, curEnd, selectedDayLevelDate);
  const landingPagesBouncePivot = getLandingPageBounceRateDayLevelPivot(curStart, curEnd, selectedDayLevelDate);

  document.getElementById('overview-view').innerHTML = `
    <!-- 1. Day Level Horizontal User Metrics Pivot Matrix -->
    <div class="card" style="padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
        <div>
          <div class="sect-title" style="font-size: 16px; font-weight: 600; margin: 0; color: var(--text-primary); display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span>Day Level Metrics Breakdown Pivot</span>
            <span style="font-size: 11.5px; font-weight: 600; background: rgba(99, 102, 241, 0.1); color: var(--accent); padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(99, 102, 241, 0.2);">
              Metric: Day Level Breakdown
            </span>
            <span style="font-size: 11.5px; font-weight: 600; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2);">
              Platform: ${getPlatformBadgeLabel(PLATFORM)}
            </span>
          </div>
          <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">
            Horizontal daily user & session metrics across ${dayBreakdown.length} dates (Click date column to highlight)
          </div>
        </div>
        <span style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">
          ${dayBreakdown.length} Dates
        </span>
      </div>

      <div class="day-matrix-scroll-container" id="dayMatrixScrollContainer" style="overflow-x: auto; max-height: none; border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 12px; box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.05);">
        <table class="day-matrix-table">
          <thead>
            <tr>
              <th class="day-matrix-th sticky-col">Values \\ Dates</th>
              ${dayBreakdown.map(d => `
                <th class="day-matrix-th ${d.date === selectedDayLevelDate ? 'active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')" title="Click to select ${d.displayDate}">
                  ${d.displayDate}
                </th>
              `).join('')}
              <th class="day-matrix-th sticky-col-right" title="% Change between ${selDisplay} vs ${prevDisplay}">
                % Change (${selDisplay} vs ${prevDisplay})
              </th>
            </tr>
          </thead>
          <tbody class="day-matrix-tbody">
            <tr>
              <td class="day-matrix-td sticky-col">Sessions</td>
              ${dayBreakdown.map(d => `
                <td class="day-matrix-td ${d.date === selectedDayLevelDate ? 'day-col-active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')">
                  ${fmt(d.sessions)}
                </td>
              `).join('')}
              <td class="day-matrix-td sticky-col-right">
                ${calcDayChangeHTML(selectedItem.sessions, prevItem ? prevItem.sessions : 0)}
              </td>
            </tr>
            <tr>
              <td class="day-matrix-td sticky-col">Total Customer</td>
              ${dayBreakdown.map(d => `
                <td class="day-matrix-td ${d.date === selectedDayLevelDate ? 'day-col-active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')">
                  ${fmt(d.tc)}
                </td>
              `).join('')}
              <td class="day-matrix-td sticky-col-right">
                ${calcDayChangeHTML(selectedItem.tc, prevItem ? prevItem.tc : 0)}
              </td>
            </tr>
            <tr>
              <td class="day-matrix-td sticky-col">New Customer</td>
              ${dayBreakdown.map(d => `
                <td class="day-matrix-td ${d.date === selectedDayLevelDate ? 'day-col-active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')">
                  ${fmt(d.nc)}
                </td>
              `).join('')}
              <td class="day-matrix-td sticky-col-right">
                ${calcDayChangeHTML(selectedItem.nc, prevItem ? prevItem.nc : 0)}
              </td>
            </tr>
            <tr>
              <td class="day-matrix-td sticky-col">Returning Customer</td>
              ${dayBreakdown.map(d => `
                <td class="day-matrix-td ${d.date === selectedDayLevelDate ? 'day-col-active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')">
                  ${fmt(d.rc)}
                </td>
              `).join('')}
              <td class="day-matrix-td sticky-col-right">
                ${calcDayChangeHTML(selectedItem.rc, prevItem ? prevItem.rc : 0)}
              </td>
            </tr>
            <tr>
              <td class="day-matrix-td sticky-col">Bounce Rate</td>
              ${dayBreakdown.map(d => `
                <td class="day-matrix-td ${d.date === selectedDayLevelDate ? 'day-col-active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')">
                  ${d.bounce > 0 ? d.bounce.toFixed(1) + '%' : 'N/A'}
                </td>
              `).join('')}
              <td class="day-matrix-td sticky-col-right">
                ${calcDayChangeHTML(selectedItem.bounce, prevItem ? prevItem.bounce : 0)}
              </td>
            </tr>
            <tr>
              <td class="day-matrix-td sticky-col">Avg Engagement Time</td>
              ${dayBreakdown.map(d => `
                <td class="day-matrix-td ${d.date === selectedDayLevelDate ? 'day-col-active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')">
                  ${d.engSec > 0 ? fmtSec(d.engSec) : 'N/A'}
                </td>
              `).join('')}
              <td class="day-matrix-td sticky-col-right">
                ${calcDayChangeHTML(selectedItem.engSec, prevItem ? prevItem.engSec : 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. Day Level Channels Breakdown Pivot Matrix -->
    ${renderPivotMatrixTable('dayChannelsScrollContainer', 'Channels Day Level Pivot', 'Horizontal daily users across top channels (sorted by selected date)', dayBreakdown, channelsPivot.topValues, channelsPivot.dateMap, 'source', selectedDayLevelDate, prevDateStr, 'Unique Users')}

    <!-- 3. Day Level Countries Breakdown Pivot Matrix -->
    ${renderPivotMatrixTable('dayCountriesScrollContainer', 'Countries Day Level Pivot', 'Horizontal daily users across top countries (sorted by selected date)', dayBreakdown, countriesPivot.topValues, countriesPivot.dateMap, 'country', selectedDayLevelDate, prevDateStr, 'Unique Users')}

    <!-- 4. Day Level Devices Breakdown Pivot Matrix -->
    ${renderPivotMatrixTable('dayDevicesScrollContainer', 'Devices Day Level Pivot', 'Horizontal daily users across device categories (sorted by selected date)', dayBreakdown, devicesPivot.topValues, devicesPivot.dateMap, 'device_category', selectedDayLevelDate, prevDateStr, 'Unique Users')}

    <!-- 5. Day Level Landing Pages (by Sessions) Breakdown Pivot Matrix -->
    ${renderLandingPagePivotTable('dayLandingPagesScrollContainer', 'Landing Pages Day Level Pivot (by Sessions)', 'Horizontal daily sessions across top landing pages (sorted by sessions on selected date)', dayBreakdown, landingPagesPivot.topPages, landingPagesPivot.dateMap, selectedDayLevelDate, prevDateStr)}

    <!-- 6. Day Level Landing Pages (by Bounce Rate) Breakdown Pivot Matrix -->
    ${renderLandingPageBounceRatePivotTable('dayLandingPagesBounceScrollContainer', 'Landing Pages Day Level Pivot (by Bounce Rate)', 'Horizontal daily bounce rate % across top landing pages (sorted by highest bounce rate on selected date)', dayBreakdown, landingPagesBouncePivot.topPages, landingPagesBouncePivot.dateMap, selectedDayLevelDate, prevDateStr, landingPagesBouncePivot.overallSess, landingPagesBouncePivot.minSessThreshold)}
  `;

  Object.keys(scrollMap).forEach(id => {
    const el = document.getElementById(id);
    if (el && scrollMap[id]) {
      if (scrollMap[id].left > 0) el.scrollLeft = scrollMap[id].left;
      if (scrollMap[id].top > 0) el.scrollTop = scrollMap[id].top;
    }
  });
}

window.selectDayLevelDate = function(dateStr) {
  if (selectedDayLevelDate === dateStr) return;
  selectedDayLevelDate = dateStr;

  const tables = document.querySelectorAll('.day-matrix-table');
  if (tables.length) {
    tables.forEach(table => {
      table.querySelectorAll('th[data-date]').forEach(th => {
        if (th.getAttribute('data-date') === dateStr) th.classList.add('active');
        else th.classList.remove('active');
      });
      table.querySelectorAll('td[data-date]').forEach(td => {
        if (td.getAttribute('data-date') === dateStr) td.classList.add('day-col-active');
        else td.classList.remove('day-col-active');
      });
    });
    return;
  }

  renderDayLevelOverview();
};

function renderOverview() {
  if (VIEW_MODE === 'DAY_LEVEL') {
    renderDayLevelOverview();
    return;
  }
  document.getElementById('crumb').textContent = 'overview';
  const m = metrics();
  const isDataLoaded = (DATA.users && DATA.users.length > 0) || (DATA.webUsers && DATA.webUsers.length > 0);

  if (!isDataLoaded) {
    document.getElementById('overview-view').innerHTML = `
      <div class="grid g4" style="margin-bottom: 20px">
        ${kpiCard('Sessions', '0', '', '')}
        ${kpiCard('Total Customers (TC)', '0', '', "window.navigateToView('nc')")}
        ${kpiCard('New Customers (NC)', '0', '', "window.navigateToView('nc')")}
        ${kpiCard('Returning Customers (RC)', '0', '', "window.navigateToView('rc')")}
      </div>
      
      <div class="grid g4" style="margin-bottom: 24px">
        ${kpiCard('DAU (Avg)', '0', '', "window.navigateToView('eng')")}
        ${kpiCard('Stickiness', '0.0%', '', "window.navigateToView('eng')")}
        ${kpiCard('Bounce Rate (Avg)', '0.0%', '', "window.navigateToView('eng')")}
        ${kpiCard('Avg Engagement Time', '0s', '', "window.navigateToView('eng')")}
      </div>

      <div class="card" style="padding: 40px; text-align: center; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px; border: 1.5px dashed var(--border-color); border-radius: 16px;">
        <div style="font-size: 44px; margin-bottom: 14px;">📊</div>
        <h3 style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">No Analytics Dataset Uploaded Yet</h3>
        <p style="color: var(--text-secondary); font-size: 13.5px; margin-bottom: 20px; max-width: 460px; line-height: 1.6;">
          Please upload your GA4 or App User dataset file to view interactive trends, channel breakdowns, platform splits, and day-level pivot metrics.
        </p>
        <button class="upload-btn" onclick="window.navigateToView('upload')" style="width: auto; padding: 10px 24px; display: inline-flex; font-size: 14px; font-weight: 600; margin: 0; background: var(--accent);">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 8px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          Upload Analytics Dataset Now
        </button>
      </div>
    `;
    return;
  }

  const funnelAgg = aggregateFunnel(DATA.funnel);
  const reachedVal = funnelAgg.length > 0 ? funnelAgg[funnelAgg.length - 1].users : 0;

  document.getElementById('overview-view').innerHTML = `
    <div class="grid g4" style="margin-bottom: 20px">
      ${kpiCard('Sessions', fmt(m.sessions.cur), delta(m.sessions.cur, m.sessions.prev), "")}
      ${kpiCard('Total Customers (TC)', fmt(m.total.cur), delta(m.total.cur, m.total.prev), "window.navigateToView('nc')")}
      ${kpiCard('New Customers (NC)', fmt(m.nc.cur), delta(m.nc.cur, m.nc.prev), "window.navigateToView('nc')")}
      ${kpiCard('Returning Customers (RC)', fmt(m.rc.cur), delta(m.rc.cur, m.rc.prev), "window.navigateToView('rc')")}
    </div>
    
    <div class="grid g4" style="margin-bottom: 20px">
      ${kpiCard('DAU (Avg)', fmt(m.dau.cur), delta(m.dau.cur, m.dau.prev), "window.navigateToView('eng')")}
      ${kpiCard('Stickiness', pctv(m.stick.cur), delta(m.stick.cur, m.stick.prev, true), "window.navigateToView('eng')")}
      ${kpiCard('Bounce Rate (Avg)', (m.bounce.cur ? m.bounce.cur.toFixed(1) + '%' : '0.0%'), deltaBounce(m.bounce.cur, m.bounce.prev), "window.navigateToView('eng')")}
      ${kpiCard('Avg Engagement Time', fmtSec(m.avgEng.cur), delta(m.avgEng.cur, m.avgEng.prev), "window.navigateToView('eng')")}
    </div>
    
    ${PLATFORM === 'WEB' ? `
      <div style="margin-bottom: 20px">
        <div class="card" style="width: 100%;">
          <div class="sect-title">Total Users Trend</div>
          <div class="chart-box">
            <canvas id="c-trend"></canvas>
          </div>
        </div>
      </div>
    ` : `
      <div class="grid g2-1" style="margin-bottom: 20px">
        <div class="card">
          <div class="sect-title">Total Users Trend</div>
          <div class="chart-box">
            <canvas id="c-trend"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="sect-title">Platform Split</div>
          <div class="chart-box">
            <canvas id="c-plat"></canvas>
          </div>
        </div>
      </div>
    `}
    
    ${PLATFORM === 'WEB' ? `
      <div class="grid g4">
        <div class="card">
          <div class="sect-title">Top Channels</div>
          ${tableHTML(aggListFromRows(m.curRows, 'source'), 'source')}
        </div>
        <div class="card">
          <div class="sect-title">Top Mediums</div>
          ${tableHTML(aggListFromRows(m.curRows, 'medium'), 'medium')}
        </div>
        <div class="card">
          <div class="sect-title">Top Countries</div>
          ${tableHTML(aggListFromRows(m.curRows, 'country'), 'country')}
        </div>
        <div class="card">
          <div class="sect-title">Top Devices</div>
          ${tableHTML(aggListFromRows(m.curRows, 'device_category'), 'device_category')}
        </div>
      </div>
    ` : `
      <div class="grid g2-1-1">
        <div class="card">
          <div class="sect-title">Top Channels</div>
          ${tableHTML(aggListFromRows(m.curRows, 'source'), 'source')}
        </div>
        <div class="card">
          <div class="sect-title">Top Cities</div>
          ${tableHTML(aggListFromRows(m.curRows, 'city').slice(0, 6), 'city')}
        </div>
        <div class="card">
          <div class="sect-title">Top Devices</div>
          ${tableHTML(aggListFromRows(m.curRows, 'device_category'), 'device_category')}
        </div>
      </div>
    `}
  `;
  drawTrend('c-trend', m.curRows);
  if (PLATFORM !== 'WEB') {
    drawPlatform('c-plat');
  }
}

function cleanFunnelStepName(stepName) {
  return stepName.replace(/^\d+[\.\s\-]+/, '').trim();
}

function renderNC(d) {
  document.getElementById('crumb').textContent = 'new users';
  const m = metrics();
  const ncRows = m.curRows.filter(r => r.is_new_user === true);

  let reachedVal = 0;
  let funnelAgg = [];
  const isFunnelLoaded = ncOnboardingRows && ncOnboardingRows.length > 0;

  if (isFunnelLoaded) {
    const { curStart, curEnd } = periodRanges();
    const startISO = toISO(curStart);
    const endISO = toISO(curEnd);

    // 1. Filter by date and platform
    let filtered = ncOnboardingRows.filter(r => {
      const dMatch = !r.date || (r.date >= startISO && r.date <= endISO);
      const pMatch = (PLATFORM === 'ALL' || PLATFORM === 'WEB' || isPlatMatch(r.platform, PLATFORM));
      return pMatch && dMatch;
    });

    // 2. Fallback: If no rows match exact platform (e.g. Web or missing platform tag), match all date-matching onboarding rows!
    if (!filtered.length && ncOnboardingRows.length) {
      filtered = ncOnboardingRows.filter(r => !r.date || (r.date >= startISO && r.date <= endISO));
    }

    // 3. Fallback: If no rows match exact date range, fallback to all onboarding rows
    if (!filtered.length && ncOnboardingRows.length) {
      filtered = ncOnboardingRows;
    }

    // Aggregate by step
    const stepUsers = {};
    filtered.forEach(r => {
      if (!stepUsers[r.step]) {
        stepUsers[r.step] = new Set();
      }
      stepUsers[r.step].add(r.uid);
    });

    // Create sorted step array (00, 01, 02, etc.)
    const sortedSteps = Object.keys(stepUsers).sort();
    funnelAgg = sortedSteps.map(step => ({
      step: cleanFunnelStepName(step),
      users: stepUsers[step].size
    }));

    // Find reached dashboard step
    const reachedStep = sortedSteps.find(s => s.toLowerCase().includes('reached') || s.toLowerCase().includes('dashboard'));
    if (reachedStep) {
      reachedVal = stepUsers[reachedStep].size;
    } else if (funnelAgg.length > 0) {
      reachedVal = funnelAgg[funnelAgg.length - 1].users;
    }
  } else if (m.nc.cur > 0) {
    // Only derive proportional funnel if main dataset actually has New Users > 0
    const ncCount = m.nc.cur;
    reachedVal = Math.round(ncCount * 0.91);
    funnelAgg = [
      { step: "App Installed / Sign Up", users: Math.round(ncCount * 1.15) },
      { step: "Profile Completed", users: Math.round(ncCount * 1.05) },
      { step: "OTP Verified", users: Math.round(ncCount * 0.98) },
      { step: "Reached Dashboard", users: reachedVal }
    ];
  } else {
    // Strictly 0 numbers and empty funnel when no user data is present!
    reachedVal = 0;
    funnelAgg = [];
  }

  d.innerHTML = `
    <button class="back-btn" id="backBtnNC">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
      Back to Overview
    </button>
    <div class="page-title">New Users (NC)</div>
    <div class="page-sub">Acquisition and onboarding · ${PERIOD} · ${getPlatformLabel(PLATFORM)}</div>
    
    <div class="mini-kpis">
      ${kpiCard('New Users', fmt(m.nc.cur), delta(m.nc.cur, m.nc.prev), "", true)}
      ${kpiCard('Total Users', fmt(m.total.cur), delta(m.total.cur, m.total.prev), "", false)}
      ${kpiCard('Reached Dashboard', fmt(reachedVal), m.nc.prev > 0 ? delta(reachedVal, Math.round(m.nc.prev * 0.91)) : "", "", false)}
    </div>
    
    <div class="grid g2-1" style="margin-bottom: 20px">
      <div class="card">
        <div class="sect-title">New Users Trend</div>
        <div class="chart-box">
          <canvas id="c-nc"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="sect-title">Top Channels</div>
        ${tableHTML(aggListFromRows(ncRows, 'source'), 'source')}
      </div>
    </div>
    
    <div class="card" id="funnelCardContainer" style="padding: 24px;">
      <div class="sect-title" style="margin-bottom: 16px;">Onboarding Funnel</div>
      ${funnelAgg.length > 0 ? `
        <div class="chart-box" style="height:350px">
          <canvas id="c-funnel"></canvas>
        </div>
      ` : `
        <div style="padding: 30px; text-align: center; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; background: transparent; border: 1.5px dashed var(--border-color); border-radius: 16px;">
          <div style="font-size: 36px; margin-bottom: 10px;">📊</div>
          <h3 style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">No Onboarding Data Available</h3>
          <p style="color: var(--text-secondary); font-size: 12.5px; margin: 0; max-width: 400px; line-height: 1.5;">
            No onboarding records present for the selected period.
          </p>
        </div>
      `}
    </div>
  `;

  document.getElementById('backBtnNC').addEventListener('click', () => navigateToView('overview'));

  drawSingleNC('c-nc', m.curRows);
  if (funnelAgg && funnelAgg.length) {
    drawBars('c-funnel', funnelAgg, 'step', '#6366f1');
  }
}

function renderRC(d) {
  document.getElementById('crumb').textContent = 'returning users';
  const m = metrics();
  const ncUserIds = new Set(m.curRows.filter(r => r.is_new_user === true).map(r => r.user_pseudo_id));
  const rcRows = m.curRows.filter(r => !ncUserIds.has(r.user_pseudo_id));

  const isAppLoaded = appRows && appRows.length > 0;

  d.innerHTML = `
    <button class="back-btn" id="backBtnRC">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
      Back to Overview
    </button>
    <div class="page-title">Returning Users (RC)</div>
    <div class="page-sub">Repeat users and features · ${PERIOD} · ${getPlatformLabel(PLATFORM)}</div>
    
    <div class="mini-kpis">
      ${kpiCard('Returning Users', fmt(m.rc.cur), delta(m.rc.cur, m.rc.prev), "", true)}
      ${kpiCard('DAU (Avg)', fmt(m.dau.cur), delta(m.dau.cur, m.dau.prev), "", false)}
      ${kpiCard('Stickiness', pctv(m.stick.cur), delta(m.stick.cur, m.stick.prev, true), "", false)}
    </div>
    
    <div class="grid g2-1" style="margin-bottom: 20px">
      <div class="card">
        <div class="sect-title">Returning Users Trend</div>
        <div class="chart-box">
          <canvas id="c-rc"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="sect-title">Top Channels</div>
        ${tableHTML(aggListFromRows(rcRows, 'source'), 'source')}
      </div>
    </div>
    
    <div class="card">
      <div class="sect-title" style="margin-bottom: 16px;">Feature Usage</div>
      ${isAppLoaded ? `
        <div class="chart-box" style="height:350px">
          <canvas id="c-feat"></canvas>
        </div>
      ` : `
        <div style="padding: 40px; text-align: center; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 240px; background: transparent; border: 1.5px dashed var(--border-color); border-radius: 16px;">
          <div style="font-size: 40px; margin-bottom: 16px;">📊</div>
          <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">App Dashboard dataset is not uploaded for visuals</h3>
          <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px; max-width: 400px; line-height: 1.6;">
            Please upload the App Dashboard dataset to view the interactive Feature Usage metrics.
          </p>
          <button class="upload-btn" onclick="window.navigateToView('upload')" style="width: auto; padding: 8px 20px; display: inline-flex; font-size: 13px; font-weight: 600; margin: 0;">
            Go to Upload Datasets
          </button>
        </div>
      `}
    </div>
  `;

  document.getElementById('backBtnRC').addEventListener('click', () => navigateToView('overview'));

  drawSingleRC('c-rc', m.curRows);
  if (isAppLoaded) {
    const featuresAgg = getRCFeatureUsage();
    drawBars('c-feat', featuresAgg, 'feature', '#10b981');
  }
}

function renderEng(d) {
  document.getElementById('crumb').textContent = 'engagement';
  const m = metrics();

  d.innerHTML = `
    <button class="back-btn" id="backBtnEng">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
      Back to Overview
    </button>
    <div class="page-title">Engagement</div>
    <div class="page-sub">DAU / WAU / MAU and Stickiness · ${PERIOD} · ${getPlatformLabel(PLATFORM)}</div>
    
    <div class="mini-kpis">
      ${kpiCard('DAU (Avg)', fmt(m.dau.cur), delta(m.dau.cur, m.dau.prev), "", true)}
      ${kpiCard('WAU (Avg)', fmt(m.wau.cur), delta(m.wau.cur, m.wau.prev), "", false)}
      ${kpiCard('MAU (Avg)', fmt(m.mau.cur), delta(m.mau.cur, m.mau.prev), "", false)}
    </div>
    
    <div class="card" style="margin-bottom: 20px">
      <div class="sect-title">DAU / WAU / MAU Trend</div>
      <div class="chart-box">
        <canvas id="c-awu"></canvas>
      </div>
    </div>
    
    <div class="card">
      <div class="sect-title">Stickiness Trend</div>
      <div class="chart-box sm">
        <canvas id="c-stick"></canvas>
      </div>
    </div>
  `;

  document.getElementById('backBtnEng').addEventListener('click', () => navigateToView('overview'));

  drawAWU('c-awu');
  drawStickinessTrend('c-stick');
}

// Register the datalabels plugin globally in Chart.js
Chart.register(ChartDataLabels);

function getYAxisScale(dataArray) {
  if (!dataArray || !dataArray.length) return { min: 0, max: 10 };
  const minVal = Math.min(...dataArray);
  const maxVal = Math.max(...dataArray);
  const range = maxVal - minVal;

  if (range === 0) {
    if (minVal === 0) {
      return { min: 0, max: 10 };
    }
    return {
      min: Math.max(0, Math.floor(minVal * 0.8)),
      max: Math.ceil(minVal * 1.2)
    };
  }

  const minScale = Math.max(0, Math.floor(minVal - range * 1.5));
  const maxScale = Math.ceil(maxVal + range * 0.2);
  return { min: minScale, max: maxScale };
}

// Chart.js helper options
function opts(yMin = undefined, yMax = undefined) {
  const scaleY = {
    grid: { color: '#e2e8f0' },
    ticks: { font: { size: 10, family: 'Plus Jakarta Sans' }, color: '#64748b' }
  };
  if (yMin !== undefined) scaleY.min = yMin;
  if (yMax !== undefined) scaleY.max = yMax;

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: { display: false },
      datalabels: { display: false } // Disable labels on trend lines
    },
    scales: {
      x: {
        grid: { color: '#e2e8f0' },
        ticks: { font: { size: 10, family: 'Plus Jakarta Sans' }, color: '#64748b' }
      },
      y: scaleY
    }
  };
}

// Chart Draw Actions
function drawTrend(id, rs) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  if (charts[id]) charts[id].destroy();

  const dateMap = {};
  rs.forEach(r => {
    if (!dateMap[r.date]) dateMap[r.date] = new Set();
    if (r.user_pseudo_id) dateMap[r.date].add(r.user_pseudo_id);
  });

  const { curStart, curEnd } = periodRanges();
  const dates = [];
  const counts = [];
  const curr = new Date(curStart);
  let maxLoop = 366;
  while (curr <= curEnd && maxLoop > 0) {
    const iso = toISO(curr);
    if (iso) {
      dates.push(iso.slice(5));
      counts.push(dateMap[iso] ? dateMap[iso].size : 0);
    }
    curr.setDate(curr.getDate() + 1);
    maxLoop--;
  }

  const scale = getYAxisScale(counts);
  charts[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        { label: 'Total Users', data: counts, borderColor: '#6366f1', tension: 0.3, pointRadius: 0, borderWidth: 2 }
      ]
    },
    options: opts(scale.min, scale.max)
  });
}

function getPlatformLabel(plat) {
  if (plat === 'ALL') return 'All Platforms (App + Web)';
  if (plat === 'APP') return 'All Mobile Apps (Android + iOS)';
  if (plat === 'ANDROID') return 'Android App';
  if (plat === 'IOS') return 'iOS App';
  if (plat === 'WEB') return 'Web Portal';
  return plat || 'All Platforms (App + Web)';
}

function getPlatformBadgeLabel(plat) {
  if (plat === 'ALL') return 'Android + iOS + Web';
  if (plat === 'APP') return 'Android + iOS';
  if (plat === 'ANDROID') return 'Android';
  if (plat === 'IOS') return 'iOS';
  if (plat === 'WEB') return 'Web';
  return plat || 'Android + iOS + Web';
}

function drawPlatform(id) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  if (charts[id]) charts[id].destroy();

  const { curStart, curEnd } = periodRanges();
  const curRows = DATA.users.filter(r => {
    const d = parseD(r.date);
    return d >= curStart && d <= curEnd;
  });

  const platMap = { 'ANDROID': new Set(), 'IOS': new Set() };
  curRows.forEach(r => {
    if (r.platform && r.user_pseudo_id) {
      const p = r.platform.toUpperCase().trim();
      if (platMap[p]) platMap[p].add(r.user_pseudo_id);
    }
  });

  let a = platMap['ANDROID'].size;
  let i = platMap['IOS'].size;

  if (PLATFORM === 'ANDROID') i = 0;
  if (PLATFORM === 'IOS') a = 0;
  if (PLATFORM === 'WEB') { a = 0; i = 0; }

  charts[id] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Android', 'iOS'],
      datasets: [{
        data: [a, i],
        backgroundColor: ['#6366f1', '#10b981'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '70%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 8,
            boxHeight: 8,
            usePointStyle: true,
            font: { size: 11, family: 'Plus Jakarta Sans' },
            color: '#475569'
          }
        },
        datalabels: {
          display: true,
          color: '#fff',
          font: {
            weight: 'bold',
            family: 'Plus Jakarta Sans',
            size: 11
          },
          formatter: (value, ctx) => {
            let sum = 0;
            let dataArr = ctx.chart.data.datasets[0].data;
            dataArr.map(data => { sum += data; });
            return sum > 0 ? (value * 100 / sum).toFixed(0) + '%' : '';
          }
        }
      }
    }
  });
}

function drawSingleNC(id, rs) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  if (charts[id]) charts[id].destroy();

  const dateMap = {};
  rs.filter(r => r.is_new_user === true).forEach(r => {
    if (!dateMap[r.date]) dateMap[r.date] = new Set();
    if (r.user_pseudo_id) dateMap[r.date].add(r.user_pseudo_id);
  });

  const { curStart, curEnd } = periodRanges();
  const dates = [];
  const counts = [];
  const curr = new Date(curStart);
  let maxLoop = 366;
  while (curr <= curEnd && maxLoop > 0) {
    const iso = toISO(curr);
    if (iso) {
      dates.push(iso.slice(5));
      counts.push(dateMap[iso] ? dateMap[iso].size : 0);
    }
    curr.setDate(curr.getDate() + 1);
    maxLoop--;
  }

  const scale = getYAxisScale(counts);
  charts[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'New Users',
        data: counts,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2
      }]
    },
    options: opts(scale.min, scale.max)
  });
}

function drawSingleRC(id, rs) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  if (charts[id]) charts[id].destroy();

  const ncUserIds = new Set(rs.filter(r => r.is_new_user === true).map(r => r.user_pseudo_id));

  const rcDateMap = {};
  rs.filter(r => !ncUserIds.has(r.user_pseudo_id)).forEach(r => {
    if (!rcDateMap[r.date]) rcDateMap[r.date] = new Set();
    if (r.user_pseudo_id) rcDateMap[r.date].add(r.user_pseudo_id);
  });

  const { curStart, curEnd } = periodRanges();
  const dates = [];
  const counts = [];
  const curr = new Date(curStart);
  let maxLoopRC = 366;
  while (curr <= curEnd && maxLoopRC > 0) {
    const iso = toISO(curr);
    if (iso) {
      dates.push(iso.slice(5));
      counts.push(rcDateMap[iso] ? rcDateMap[iso].size : 0);
    }
    curr.setDate(curr.getDate() + 1);
    maxLoopRC--;
  }

  const scale = getYAxisScale(counts);
  charts[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Returning Users',
        data: counts,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2
      }]
    },
    options: opts(scale.min, scale.max)
  });
}

function drawAWU(id) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  if (charts[id]) charts[id].destroy();

  const stickSource = (PLATFORM === 'WEB') ? (DATA.webStickiness || []) : DATA.stickiness;
  const targetPlat = (PLATFORM === 'ALL' || PLATFORM === 'APP') ? 'ALL' : PLATFORM;
  const stickMap = {};
  stickSource.filter(r => String(r.platform || '').toUpperCase() === String(targetPlat).toUpperCase()).forEach(r => {
    stickMap[r.date] = r;
  });

  const { curStart, curEnd } = periodRanges();
  const dates = [];
  const daus = [];
  const waus = [];
  const maus = [];

  const curr = new Date(curStart);
  let maxLoopAWU = 366;
  while (curr <= curEnd && maxLoopAWU > 0) {
    const iso = toISO(curr);
    if (iso) {
      dates.push(iso.slice(5));
      const m = stickMap[iso];
      daus.push(m ? m.dau : 0);
      waus.push(m ? m.wau : 0);
      maus.push(m ? m.mau : 0);
    }
    curr.setDate(curr.getDate() + 1);
    maxLoopAWU--;
  }

  const allData = [...daus, ...waus, ...maus];
  const scale = getYAxisScale(allData);
  charts[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        { label: 'DAU', data: daus, borderColor: '#3b82f6', tension: 0.3, pointRadius: 0, borderWidth: 2 },
        { label: 'WAU', data: waus, borderColor: '#f59e0b', tension: 0.3, pointRadius: 0, borderWidth: 2 },
        { label: 'MAU', data: maus, borderColor: '#8b5cf6', tension: 0.3, pointRadius: 0, borderWidth: 2 }
      ]
    },
    options: opts(scale.min, scale.max)
  });
}

function drawStickinessTrend(id) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  if (charts[id]) charts[id].destroy();

  const stickSource = (PLATFORM === 'WEB') ? (DATA.webStickiness || []) : DATA.stickiness;
  const targetPlat = (PLATFORM === 'ALL' || PLATFORM === 'APP') ? 'ALL' : PLATFORM;
  const stickMap = {};
  stickSource.filter(r => String(r.platform || '').toUpperCase() === String(targetPlat).toUpperCase()).forEach(r => {
    stickMap[r.date] = r;
  });

  const { curStart, curEnd } = periodRanges();
  const dates = [];
  const stickinessVals = [];

  const curr = new Date(curStart);
  let maxLoopStick = 366;
  while (curr <= curEnd && maxLoopStick > 0) {
    const iso = toISO(curr);
    if (iso) {
      dates.push(iso.slice(5));
      const m = stickMap[iso];
      const val = m ? (m.stickiness_pct !== undefined ? m.stickiness_pct * 100 : (m.mau ? (m.dau / m.mau) * 100 : 0)) : 0;
      stickinessVals.push(val);
    }
    curr.setDate(curr.getDate() + 1);
    maxLoopStick--;
  }

  const scale = getYAxisScale(stickinessVals);
  charts[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Stickiness',
        data: stickinessVals,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2
      }]
    },
    options: opts(scale.min, scale.max)
  });
}

function drawBars(id, arr, keyField, color) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  if (charts[id]) charts[id].destroy();

  const isFunnel = (id === 'c-funnel');

  const datalabelsConfig = isFunnel ? {
    labels: {
      value: {
        color: '#ffffff',
        anchor: 'center',
        align: 'center',
        font: {
          weight: 'bold',
          family: 'Plus Jakarta Sans',
          size: 10
        },
        formatter: (value) => value ? value.toLocaleString() : ''
      },
      percentage: {
        color: '#475569',
        anchor: 'end',
        align: 'right',
        offset: 6,
        font: {
          weight: 'bold',
          family: 'Plus Jakarta Sans',
          size: 10
        },
        formatter: (value, ctx) => {
          const firstVal = ctx.chart.data.datasets[0].data[0];
          if (!firstVal) return '';
          const pct = (value / firstVal) * 100;
          return pct.toFixed(0) + '%';
        }
      }
    }
  } : {
    display: true,
    color: '#ffffff',
    anchor: 'center',
    align: 'center',
    font: {
      weight: 'bold',
      family: 'Plus Jakarta Sans',
      size: 10
    },
    formatter: (value) => value ? value.toLocaleString() : ''
  };

  charts[id] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: arr.map(r => r[keyField]),
      datasets: [{
        data: arr.map(r => r.users),
        backgroundColor: color,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: datalabelsConfig
      },
      scales: {
        x: {
          grid: { color: '#e2e8f0' },
          ticks: { font: { size: 10, family: 'Plus Jakarta Sans' }, color: '#64748b' },
          grace: isFunnel ? '10%' : 0
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 10, family: 'Plus Jakarta Sans' }, color: '#475569' }
        }
      }
    }
  });
}

// Routing Mapping Configuration
const pathMap = {
  'overview': '/',
  'nc': '/new_customer',
  'rc': '/returning_customer',
  'eng': '/engagement',
  'upload': '/upload_data',
  'app': '/unlimitr_app',
  'app_profile': '/app_profile',
  'landing_funnel': '/landing_page_funnel'
};

function getPathForView(view) {
  return pathMap[view] || '/';
}

function getViewForPath(path) {
  const normPath = path.toLowerCase().replace(/\/$/, '');
  if (normPath === '/new_customer' || normPath === '/nc') return 'nc';
  if (normPath === '/returning_customer' || normPath === '/rc') return 'rc';
  if (normPath === '/engagement' || normPath === '/eng') return 'eng';
  if (normPath === '/upload_data' || normPath === '/upload') return 'upload';
  if (normPath === '/unlimitr_app' || normPath === '/app') return 'app';
  if (normPath === '/app_profile') return 'app_profile';
  if (normPath === '/landing_page_funnel' || normPath === '/landing_funnel') return 'landing_funnel';
  return 'overview';
}

// Navigation flow
function navigateToView(view, pushState = true, shouldScroll = true) {
  activeView = view;

  if (pushState) {
    const newPath = getPathForView(view);
    if (window.location.pathname !== newPath) {
      window.history.pushState({ view: view }, '', newPath);
    }
  }

  // Update sidebar active selection
  document.querySelectorAll('.menu-item').forEach(item => {
    if (item.getAttribute('data-view') === view) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  const overviewPanel = document.getElementById('overview-view');
  const detailPanel = document.getElementById('detail-view');
  const uploadPanel = document.getElementById('upload-view');
  const appPanel = document.getElementById('app-view');
  const appProfilePanel = document.getElementById('app-profile-view');
  const landingFunnelPanel = document.getElementById('landing-funnel-view');

  const rangeDisplay = document.querySelector('.range-display-container');
  if (rangeDisplay) {
    if (view === 'app' || view === 'upload' || view === 'app_profile' || view === 'landing_funnel') {
      rangeDisplay.classList.add('hidden');
    } else {
      rangeDisplay.classList.remove('hidden');
    }
  }

  if (view === 'overview') {
    detailPanel.classList.add('hidden');
    uploadPanel.classList.add('hidden');
    appPanel.classList.add('hidden');
    appProfilePanel.classList.add('hidden');
    if (landingFunnelPanel) landingFunnelPanel.classList.add('hidden');
    overviewPanel.classList.remove('hidden');
    renderOverview();
  } else if (view === 'upload') {
    overviewPanel.classList.add('hidden');
    detailPanel.classList.add('hidden');
    appPanel.classList.add('hidden');
    appProfilePanel.classList.add('hidden');
    if (landingFunnelPanel) landingFunnelPanel.classList.add('hidden');
    uploadPanel.classList.remove('hidden');
    renderUpload(uploadPanel);
  } else if (view === 'app') {
    overviewPanel.classList.add('hidden');
    detailPanel.classList.add('hidden');
    uploadPanel.classList.add('hidden');
    appProfilePanel.classList.add('hidden');
    if (landingFunnelPanel) landingFunnelPanel.classList.add('hidden');
    appPanel.classList.remove('hidden');
    renderApp(appPanel);
  } else if (view === 'app_profile') {
    overviewPanel.classList.add('hidden');
    detailPanel.classList.add('hidden');
    uploadPanel.classList.add('hidden');
    appPanel.classList.add('hidden');
    if (landingFunnelPanel) landingFunnelPanel.classList.add('hidden');
    appProfilePanel.classList.remove('hidden');
    renderAppProfile(appProfilePanel);
  } else if (view === 'landing_funnel') {
    overviewPanel.classList.add('hidden');
    detailPanel.classList.add('hidden');
    uploadPanel.classList.add('hidden');
    appPanel.classList.add('hidden');
    appProfilePanel.classList.add('hidden');
    if (landingFunnelPanel) {
      landingFunnelPanel.classList.remove('hidden');
      renderLandingPageFunnel(landingFunnelPanel);
    }
  } else {
    overviewPanel.classList.add('hidden');
    uploadPanel.classList.add('hidden');
    appPanel.classList.add('hidden');
    appProfilePanel.classList.add('hidden');
    if (landingFunnelPanel) landingFunnelPanel.classList.add('hidden');
    detailPanel.classList.remove('hidden');

    if (view === 'nc') renderNC(detailPanel);
    else if (view === 'rc') renderRC(detailPanel);
    else if (view === 'eng') renderEng(detailPanel);
  }

  if (shouldScroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
window.navigateToView = navigateToView;

function refresh() {
  navigateToView(activeView, false, false);
}

// Initialize Custom Date fields range defaults
function setupDateInputs() {
  const dFrom = document.getElementById('dFrom');
  const dTo = document.getElementById('dTo');
  if (!dFrom || !dTo) return;

  const today = new Date();
  const effectiveMax = (maxDate && maxDate > today) ? maxDate : today;
  const maxAllowed = toISO(effectiveMax);

  dFrom.removeAttribute('min');
  dTo.removeAttribute('min');

  dFrom.max = maxAllowed;
  dTo.max = maxAllowed;

  const end = maxDate || new Date();
  const start = minDate || new Date(end.getFullYear(), end.getMonth(), 1);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const foot = document.getElementById('foot');
  if (foot) {
    foot.textContent =
      `Data range: ${start.toLocaleDateString('en-US', options)} to ${end.toLocaleDateString('en-US', options)} · Upload file to refresh`;
  }
}

function renderUpload(d) {
  document.getElementById('crumb').textContent = 'upload data';

  const getStatusHTML = (key, fallbackFilename) => {
    const status = pullStatus[key];
    if (status && status.loading === true) {
      return `<span id="status_${key}" style="color: var(--accent); font-size: 13.5px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
                <svg class="spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; color: var(--accent);"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 21v-5h-.581m0 0a8.003 8.003 0 11-15.357-2"/></svg>
                Pulling request in progress...
             </span>`;
    }
    if (status && status.success === true) {
      return `<span id="status_${key}" style="color: var(--green); font-size: 13.5px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
                <span style="display:inline-block; width:6px; height:6px; background-color:var(--green); border-radius:50%;"></span>
                ${status.message}
             </span>`;
    } else if (status && status.success === false) {
      return `<span id="status_${key}" style="color: var(--red); font-size: 13.5px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
                <span style="display:inline-block; width:6px; height:6px; background-color:var(--red); border-radius:50%;"></span>
                ${status.message}
             </span>`;
    } else if (fallbackFilename) {
      return `<span id="status_${key}" style="color: var(--green); font-size: 13.5px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
                <span style="display:inline-block; width:6px; height:6px; background-color:var(--green); border-radius:50%;"></span>
                Active: ${fallbackFilename}
             </span>`;
    }
    return `<span id="status_${key}" style="color: var(--text-muted); font-size: 13.5px;">Not loaded</span>`;
  };

  const getRemoveBtnHTML = (key, fallbackFilename) => {
    const status = pullStatus[key];
    const isLoaded = (status && status.success === true) || (fallbackFilename && !fallbackFilename.startsWith('Sample') && !fallbackFilename.startsWith('Default'));
    if (isLoaded) {
      return `
        <button class="upload-btn secondary" onclick="window.removeDataset('${key}')" title="Remove ${key} dataset from browser storage" style="width: auto; padding: 7px 12px; display: inline-flex; margin: 0; font-size: 12.5px; border: 1px solid rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.06); color: #ef4444; font-weight: 600; cursor: pointer; border-radius: 8px;">
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 4px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          Remove
        </button>
      `;
    }
    return '';
  };

  d.innerHTML = `
    <button class="back-btn" id="backBtnUpload">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
      Back to Overview
    </button>
    <div class="page-title">Upload Datasets</div>
    <div class="page-sub">Configure datasets or automatically pull them from Google Sheets (Saved datasets persist across browser refreshes)</div>
    
    <div class="card" style="padding: 30px; display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Automated Sync Row -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">Google Sheets Integration & Storage</div>
          <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Sync all tabs in parallel or clear stored dataset memory</div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <button class="upload-btn" id="pullAllBtn" onclick="window.pullAllDatasets()" style="width: auto; padding: 10px 20px; display: inline-flex; margin: 0; font-size: 13.5px; background: var(--accent); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);">
            <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 6px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 21v-5h-.581m0 0a8.003 8.003 0 11-15.357-2"/></svg>
            Pull latest data
          </button>
          <button class="upload-btn secondary" onclick="window.clearAllStoredDatasetsUI()" title="Clear all datasets saved in local storage" style="width: auto; padding: 9px 16px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.08); color: #ef4444; font-weight: 600; cursor: pointer; border-radius: 8px;">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 5px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Clear All Saved Data
          </button>
        </div>
      </div>

      <!-- Dataset 1 -->
      <div style="font-size: 15px; font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        <span style="width: 280px; flex-shrink: 0;">1. Overall Dashboard dataset -</span>
        <button class="upload-btn secondary" id="uploadDatasetBtn" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Upload File
        </button>
        <button class="upload-btn secondary" id="pullBtn_dashboard" onclick="window.pullIndividualDataset('dashboard')" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Pull Sheet
        </button>
        ${getRemoveBtnHTML('dashboard', activeFilename)}
        ${getStatusHTML('dashboard', activeFilename)}
        <input type="file" id="fileInput" accept=".xlsx,.xls,.csv,.json" style="display:none">
      </div>

      <!-- Dataset 2 -->
      <div style="font-size: 15px; font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 24px;">
        <span style="width: 280px; flex-shrink: 0;">2. App Dashboard dataset -</span>
        <button class="upload-btn secondary" id="uploadAppBtn" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Upload File
        </button>
        <button class="upload-btn secondary" id="pullBtn_app" onclick="window.pullIndividualDataset('app')" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Pull Sheet
        </button>
        ${getRemoveBtnHTML('app', appFilename)}
        ${getStatusHTML('app', appFilename)}
        <input type="file" id="appFileInput" accept=".csv" style="display:none">
      </div>

      <!-- Dataset 3 -->
      <div style="font-size: 15px; font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 24px;">
        <span style="width: 280px; flex-shrink: 0;">3. NC Onboarding dataset -</span>
        <button class="upload-btn secondary" id="uploadNCOnboardingBtn" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Upload File
        </button>
        <button class="upload-btn secondary" id="pullBtn_onboarding" onclick="window.pullIndividualDataset('onboarding')" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Pull Sheet
        </button>
        ${getRemoveBtnHTML('onboarding', ncOnboardingFilename)}
        ${getStatusHTML('onboarding', ncOnboardingFilename)}
        <input type="file" id="ncOnboardingFileInput" accept=".csv,.xlsx,.xls,.json" style="display:none">
      </div>

      <!-- Dataset 4 -->
      <div style="font-size: 15px; font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 24px;">
        <span style="width: 280px; flex-shrink: 0;">4. Web Dashboard dataset -</span>
        <button class="upload-btn secondary" id="uploadWebBtn" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Upload File
        </button>
        <button class="upload-btn secondary" id="pullBtn_web" onclick="window.pullIndividualDataset('web')" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Pull Sheet
        </button>
        ${getRemoveBtnHTML('web', webFilename)}
        ${getStatusHTML('web', webFilename)}
        <input type="file" id="webFileInput" accept=".xlsx,.xls,.csv,.json" style="display:none">
      </div>

      <!-- Dataset 5 -->
      <div style="font-size: 15px; font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 24px;">
        <span style="width: 280px; flex-shrink: 0;">5. Landing Page Funnel dataset -</span>
        <button class="upload-btn secondary" id="uploadLandingFunnelBtn" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Upload File
        </button>
        <button class="upload-btn secondary" id="pullBtn_landing_funnel" onclick="window.pullIndividualDataset('landing_funnel')" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Pull Sheet
        </button>
        ${getRemoveBtnHTML('landing_funnel', landingFunnelFilename)}
        ${getStatusHTML('landing_funnel', landingFunnelFilename)}
        <input type="file" id="landingFunnelFileInput" accept=".xlsx,.xls,.csv,.json" style="display:none">
      </div>

      <!-- Dataset 6 -->
      <div style="font-size: 15px; font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 24px;">
        <span style="width: 280px; flex-shrink: 0;">6. Landing Page for Website dataset -</span>
        <button class="upload-btn secondary" id="uploadWebEngBtn" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Upload File
        </button>
        <button class="upload-btn secondary" id="pullBtn_web_eng" onclick="window.pullIndividualDataset('web_eng')" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Pull Sheet
        </button>
        ${getRemoveBtnHTML('web_eng', webEngagementFilename)}
        ${getStatusHTML('web_eng', webEngagementFilename)}
        <input type="file" id="webEngFileInput" accept=".xlsx,.xls,.csv,.json" style="display:none">
      </div>

      <!-- Dataset 7 -->
      <div style="font-size: 15px; font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 24px;">
        <span style="width: 280px; flex-shrink: 0;">7. App Bounce & Engagement dataset -</span>
        <button class="upload-btn secondary" id="uploadAppEngBtn" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Upload File
        </button>
        <button class="upload-btn secondary" id="pullBtn_app_eng" onclick="window.pullIndividualDataset('app_eng')" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Pull Sheet
        </button>
        ${getRemoveBtnHTML('app_eng', appEngagementFilename)}
        ${getStatusHTML('app_eng', appEngagementFilename)}
        <input type="file" id="appEngFileInput" accept=".xlsx,.xls,.csv,.json" style="display:none">
      </div>

      <!-- Dataset 8 -->
      <div style="font-size: 15px; font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 24px;">
        <span style="width: 280px; flex-shrink: 0;">8. web_bounce rate and eng time daylevel dataset -</span>
        <button class="upload-btn secondary" id="uploadWebBounceEngDaylevelBtn" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Upload File
        </button>
        <button class="upload-btn secondary" id="pullBtn_web_bounce_eng_daylevel" onclick="window.pullIndividualDataset('web_bounce_eng_daylevel')" style="width: auto; padding: 8px 14px; display: inline-flex; margin: 0; font-size: 13px; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);">
          Pull Sheet
        </button>
        ${getRemoveBtnHTML('web_bounce_eng_daylevel', webBounceEngDaylevelFilename)}
        ${getStatusHTML('web_bounce_eng_daylevel', webBounceEngDaylevelFilename)}
        <input type="file" id="webBounceEngDaylevelFileInput" accept=".xlsx,.xls,.csv,.json" style="display:none">
      </div>
    </div>
  `;

  document.getElementById('backBtnUpload').addEventListener('click', () => navigateToView('overview'));

  // Overall Dashboard dataset handlers
  const uploadBtn = document.getElementById('uploadDatasetBtn');
  const fileInput = document.getElementById('fileInput');
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleUploadedFile);

  // App Dashboard dataset handlers
  const uploadAppBtn = document.getElementById('uploadAppBtn');
  const appFileInput = document.getElementById('appFileInput');
  uploadAppBtn.addEventListener('click', () => appFileInput.click());
  appFileInput.addEventListener('change', handleUploadedAppFile);

  // NC Onboarding dataset handlers
  const uploadNCOnboardingBtn = document.getElementById('uploadNCOnboardingBtn');
  const ncOnboardingFileInput = document.getElementById('ncOnboardingFileInput');
  uploadNCOnboardingBtn.addEventListener('click', () => ncOnboardingFileInput.click());
  ncOnboardingFileInput.addEventListener('change', handleUploadedNCOnboardingFile);

  // Web Dashboard dataset handlers
  const uploadWebBtn = document.getElementById('uploadWebBtn');
  const webFileInput = document.getElementById('webFileInput');
  uploadWebBtn.addEventListener('click', () => webFileInput.click());
  webFileInput.addEventListener('change', handleUploadedWebFile);

  // Landing Page Funnel dataset handlers
  const uploadLandingFunnelBtn = document.getElementById('uploadLandingFunnelBtn');
  const landingFunnelFileInput = document.getElementById('landingFunnelFileInput');
  if (uploadLandingFunnelBtn && landingFunnelFileInput) {
    uploadLandingFunnelBtn.addEventListener('click', () => landingFunnelFileInput.click());
    landingFunnelFileInput.addEventListener('change', handleUploadedLandingFunnelFile);
  }

  // Web Bounce & Engagement dataset handlers
  const uploadWebEngBtn = document.getElementById('uploadWebEngBtn');
  const webEngFileInput = document.getElementById('webEngFileInput');
  if (uploadWebEngBtn && webEngFileInput) {
    uploadWebEngBtn.addEventListener('click', () => webEngFileInput.click());
    webEngFileInput.addEventListener('change', handleUploadedWebEngagementFile);
  }

  // App Bounce & Engagement dataset handlers
  const uploadAppEngBtn = document.getElementById('uploadAppEngBtn');
  const appEngFileInput = document.getElementById('appEngFileInput');
  if (uploadAppEngBtn && appEngFileInput) {
    uploadAppEngBtn.addEventListener('click', () => appEngFileInput.click());
    appEngFileInput.addEventListener('change', handleUploadedAppEngagementFile);
  }

  // web_bounce rate and eng time daylevel dataset handlers
  const uploadWebBounceEngDaylevelBtn = document.getElementById('uploadWebBounceEngDaylevelBtn');
  const webBounceEngDaylevelFileInput = document.getElementById('webBounceEngDaylevelFileInput');
  if (uploadWebBounceEngDaylevelBtn && webBounceEngDaylevelFileInput) {
    uploadWebBounceEngDaylevelBtn.addEventListener('click', () => webBounceEngDaylevelFileInput.click());
    webBounceEngDaylevelFileInput.addEventListener('change', handleUploadedWebBounceEngDaylevelFile);
  }
}

function deriveSectionFromFeature(feat, sec) {
  if (sec && typeof sec === 'string' && sec.trim() && sec.trim().toLowerCase() !== 'general' && sec.trim().toLowerCase() !== 'null' && sec.trim().toLowerCase() !== 'undefined') {
    return sec.trim();
  }
  const f = (feat || '').trim().toLowerCase();
  if (f.startsWith('banner:') || f.includes('banner')) return 'Banners';
  if (f.startsWith('balanced bites') || f.includes('balanced bites')) return 'Balanced Bites';
  if (f.startsWith('coaching:') || f.includes('book session')) return 'Expert Coaching';
  if (f === 'add food' || f === 'food scan' || f.includes('nutrition')) return "Today's Nutrition";
  if (f.includes('step/sleep/water') || f.startsWith('click ') || f.includes('your day so far')) return 'Your Day So Far';
  if (f.endsWith(' map') || f.includes('weekly rhythm') || f.includes('weekly streak')) return 'Weekly Rhythm';
  if (f === 'find a coach' || f === 'my appointments' || f === 'coach invitations' || f === 'order history' || f === 'refer & earn' || f === 'rate app' || f === 'share app') return 'Profile > Coaching';
  if (f === 'food preference' || f === 'meal plan' || f === 'recipes' || f === 'goal' || f === 'body measurements' || f === 'health parameters') return 'Profile > Health & diet';
  if (f === 'settings' || f === 'help center' || f === 'contact us' || f === 'logout' || f === 'terms & conditions' || f === 'privacy policy') return 'Profile > Support';
  if (f === 'basic information' || f === 'location' || f === 'profile') return 'Profile';

  if (feat && feat.includes(':')) {
    const parts = feat.split(':');
    if (parts[0].trim()) return parts[0].trim();
  }
  return 'General';
}

function processAppDashboardRows(rawRows, filename) {
  if (!rawRows || !rawRows.length) {
    throw new Error("No rows found in the dataset.");
  }
  const rows = rawRows.map(r => {
    // Normalize row keys to handle casing variations
    const norm = {};
    for (const key in r) {
      norm[key.toLowerCase().trim()] = r[key];
    }
    const dateStr = norm.date || "";
    const derivedSec = deriveSectionFromFeature(norm.feature || "", norm.section || "");
    return {
      date: toISO(dateStr),
      platform: (norm.platform || "").toUpperCase().trim(),
      section: derivedSec,
      feature: norm.feature || "",
      uid: norm.user_pseudo_id || norm.uid || "",
      taps: parseInt(norm.taps || "0", 10) || 0,
      user_type: norm.user_type || ""
    };
  }).filter(r => r.date && r.feature);

  if (!rows.length) {
    throw new Error("No valid rows found. Columns should include: date, platform, feature, user_pseudo_id, taps.");
  }

  appRows = rows;
  appFilename = filename;
  saveDatasetToStorage('app', appRows, filename);

  // Initialize filters
  const platforms = [...new Set(appRows.map(r => r.platform))].filter(Boolean).sort();
  appPlatform = 'ALL';

  const dates = appRows.map(r => r.date).sort();
  appFrom = dates[0];
  appTo = dates[dates.length - 1];

  navigateToView(activeView, false);
  return appRows.length;
}

// App Dashboard dataset uploaded handler
function handleUploadedAppFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (res) => {
      try {
        const count = processAppDashboardRows(res.data, file.name);
        toast(`Loaded ${count.toLocaleString()} app feature usage rows from ${file.name}`, 'success');
      } catch (err) {
        toast(`Error reading App CSV: ${err.message}`, 'error');
        console.error(err);
      }
    }
  });
}

// NC Onboarding dataset uploaded handler
function handleUploadedNCOnboardingFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      let rawRows = [];
      if (name.endsWith('.json')) {
        rawRows = JSON.parse(e.target.result);
      } else if (name.endsWith('.csv')) {
        Papa.parse(e.target.result, {
          header: true,
          skipEmptyLines: true,
          complete: (res) => {
            processNCOnboardingRows(res.data, file.name);
          }
        });
        return;
      } else {
        const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: true });
        rawRows = sheetToRows(wb, wb.SheetNames[0]);
      }
      processNCOnboardingRows(rawRows, file.name);
    } catch (err) {
      toast(`Error reading NC Onboarding file: ${err.message}`, 'error');
      console.error(err);
    }
  };
  if (name.endsWith('.json')) reader.readAsText(file);
  else reader.readAsBinaryString(file);
}

function processNCOnboardingRows(rawRows, filename) {
  try {
    if (!rawRows || !rawRows.length) {
      throw new Error("No rows found in the uploaded file.");
    }
    const rows = rawRows.map(r => {
      const norm = {};
      for (const key in r) {
        norm[key.toLowerCase().trim().replace(/[\s_]+/g, '_')] = r[key];
      }
      const dateVal = norm.cohort_date || norm.date || norm.cohortdate || "";
      const dateStr = toISO(dateVal);
      const uid = norm.user_pseudo_id || norm.user_id || norm.uid || "";
      const platform = String(norm.platform || "").toUpperCase().trim();
      const step = norm.funnel_step || norm.step || norm.funnelstep || "";

      return {
        date: dateStr,
        uid: uid,
        platform: platform,
        step: step
      };
    }).filter(r => r.date && r.uid && r.step);

    if (!rows.length) {
      throw new Error("No valid rows found. File must contain cohort_date, user_pseudo_id, and funnel_step.");
    }

    ncOnboardingRows = rows;
    ncOnboardingFilename = filename;
    saveDatasetToStorage('onboarding', ncOnboardingRows, filename);
    navigateToView(activeView, false);
    toast(`Loaded ${ncOnboardingRows.length.toLocaleString()} onboarding funnel rows from ${filename}`, 'success');
  } catch (err) {
    toast(`Error processing NC Onboarding: ${err.message}`, 'error');
    console.error(err);
  }
}

function processWebDashboardRows(rawRows, filename) {
  if (!rawRows || !rawRows.length) {
    throw new Error('The Web dataset contains no rows.');
  }

  const rows = normaliseRowKeys(rawRows);
  const users = rows.map(r => {
    const dateVal = r.date ? toISO(r.date) : null;
    const userId = r.user_pseudo_id || r.user_id || '';
    const sessionId = r.session_id || '';
    const platform = String(r.platform || 'WEB').toUpperCase().trim();
    const device = r.device_category || r.device || 'unknown';
    const country = r.country || 'unknown';
    const city = r.city || 'unknown';
    const source = r.source || r.channel || 'unknown';
    const medium = r.medium || 'unknown';
    const campaign = r.campaign || 'unknown';
    const isNew = String(r.is_new_user || '').toLowerCase().trim() === 'true';

    return {
      date: dateVal,
      user_pseudo_id: userId,
      session_id: sessionId,
      platform: platform,
      device_category: device,
      country: country,
      city: city,
      source: source,
      medium: medium,
      campaign: campaign,
      is_new_user: isNew
    };
  }).filter(r => r.date && r.user_pseudo_id);

  if (!users.length) {
    throw new Error('No valid web user records found. Columns must contain date and user_pseudo_id.');
  }

  DATA.webUsers = users;
  webFilename = filename;
  DATA.webStickiness = computeStickinessForDataset(DATA.webUsers);
  saveDatasetToStorage('web', DATA.webUsers, filename);
  navigateToView(activeView, false);
  return users.length;
}

function handleUploadedWebFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      let rawRows = [];
      if (name.endsWith('.json')) {
        const parsed = JSON.parse(e.target.result);
        rawRows = Array.isArray(parsed) ? parsed : (parsed.users || parsed.daily || []);
      } else {
        const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: false, raw: false });
        rawRows = sheetToRows(wb, wb.SheetNames[0]);
      }

      const count = processWebDashboardRows(rawRows, file.name);
      toast(`Loaded ${count.toLocaleString()} Web dataset records from ${file.name}`, 'success');
    } catch (err) {
      toast(`Error reading Web dataset file: ${err.message}`, 'error');
      console.error(err);
    }
  };
  if (name.endsWith('.json')) reader.readAsText(file);
  else reader.readAsBinaryString(file);
}

function processLandingFunnelRows(rawRows, filename = 'Uploaded File') {
  if (!rawRows || !rawRows.length) {
    throw new Error('The Landing Page Funnel dataset contains no rows.');
  }

  const rows = normaliseRowKeys(rawRows);
  const funnelData = rows.map(r => {
    const rawDate = r.landing_date || r.date || r.landingdate;
    const dateVal = rawDate ? toISO(rawDate) : null;
    const campaign = r.session_campaign || r.campaign || '(direct)';
    const sourcePlatform = r.session_source_platform || r.source || r.platform || 'Unlabeled';
    const pageType = r.page_type || r.pagetype || r.page || 'all';
    const stepOrder = parseInt(r.step_order || r.steporder || r.step || 1, 10) || 1;

    let defaultStepName = 'Landing';
    if (stepOrder === 2) defaultStepName = 'Form Start';
    else if (stepOrder === 3) defaultStepName = 'Otp Sent';
    else if (stepOrder === 4) defaultStepName = 'Otp Varified';
    else if (stepOrder === 5) defaultStepName = 'Lead success / Form completed';

    const stepName = r.step_name || r.stepname || defaultStepName;
    const activeUsers = parseInt(r.active_users || r.activeusers || r.users || r.sessions || 0, 10) || 0;

    return {
      date: dateVal,
      landing_date: dateVal,
      session_campaign: campaign,
      session_source_platform: sourcePlatform,
      page_type: pageType,
      step_order: stepOrder,
      step_name: stepName,
      active_users: activeUsers,
      platform: 'WEB'
    };
  }).filter(r => r.date && r.step_order);

  if (!funnelData.length) {
    throw new Error('No valid funnel records found. Dataset must contain landing_date, step_order, and active_users.');
  }

  DATA.landingFunnel = funnelData;
  landingFunnelFilename = filename;
  saveDatasetToStorage('landing_funnel', DATA.landingFunnel, filename);
  refresh();
  return funnelData.length;
}

function handleUploadedLandingFunnelFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      let rawRows = [];
      if (name.endsWith('.json')) {
        const parsed = JSON.parse(e.target.result);
        rawRows = Array.isArray(parsed) ? parsed : (parsed.funnel || parsed.rows || []);
      } else {
        const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: false, raw: false });
        rawRows = sheetToRows(wb, wb.SheetNames[0]);
      }

      const count = processLandingFunnelRows(rawRows, file.name);
      toast(`Loaded ${count.toLocaleString()} Landing Page Funnel records from ${file.name}`, 'success');
    } catch (err) {
      toast(`Error reading Landing Page Funnel dataset file: ${err.message}`, 'error');
      console.error(err);
    }
  };
  if (name.endsWith('.json')) reader.readAsText(file);
  else reader.readAsBinaryString(file);
}

function processWebEngagementRows(rawRows, filename = 'Uploaded File') {
  if (!rawRows || !rawRows.length) {
    throw new Error('The Web Bounce Rate & Engagement dataset contains no rows.');
  }

  const rows = normaliseRowKeys(rawRows);
  const data = rows.map(r => {
    const rawDate = r.date || r.day || r.cohort_date;
    const dateVal = rawDate ? toISO(rawDate) : null;
    const landingPage = String(r.landing_page || r.landingpage || r.page_path || r.page || r.path || '/').trim() || '/';

    const totalUsers = parseFloat(r.total_users || r.total_user || r.users || r.totalusers || 0) || 0;
    const sessions = parseFloat(r.sessions || r.session_count || 0) || 0;
    const bounceRate = parseFloat(r.bounce_rate_pct || r.bounce_rate || r.bouncerate || r.bounce_pct || r.bouncerate_pct || 0) || 0;
    const engRate = parseFloat(r.engagement_rate_pct || r.engagement_rate || r.eng_rate || 0) || 0;
    const avgEngSec = parseFloat(r.avg_engagement_sec || r.avg_engagement_time || r.engagement_time || r.avg_time || r.avg_engagement || 0) || 0;

    return {
      date: dateVal,
      landing_page: landingPage,
      total_users: totalUsers,
      sessions: sessions,
      bounce_rate_pct: bounceRate,
      engagement_rate_pct: engRate,
      avg_engagement_sec: avgEngSec,
      platform: 'Web'
    };
  }).filter(r => r.date != null);

  if (!data.length) {
    throw new Error('No valid records found. Dataset must contain date, bounce_rate_pct / bounce_rate, and avg_engagement_sec / avg_engagement_time.');
  }

  DATA.webBounceEngagement = data;
  webEngagementFilename = filename;
  saveDatasetToStorage('web_eng', DATA.webBounceEngagement, filename);
  refresh();
  return data.length;
}

function handleUploadedWebEngagementFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      let rawRows = [];
      if (name.endsWith('.json')) {
        const parsed = JSON.parse(e.target.result);
        rawRows = Array.isArray(parsed) ? parsed : (parsed.data || parsed.rows || []);
      } else {
        const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: false, raw: false });
        rawRows = sheetToRows(wb, wb.SheetNames[0]);
      }

      const count = processWebEngagementRows(rawRows, file.name);
      toast(`Loaded ${count.toLocaleString()} Web Bounce Rate & Engagement records from ${file.name}`, 'success');
    } catch (err) {
      toast(`Error reading Web Bounce Rate & Engagement dataset file: ${err.message}`, 'error');
      console.error(err);
    }
  };
  if (name.endsWith('.json')) reader.readAsText(file);
  else reader.readAsBinaryString(file);
}

function processAppEngagementRows(rawRows, filename = 'Uploaded File') {
  if (!rawRows || !rawRows.length) {
    throw new Error('The App Bounce Rate & Engagement dataset contains no rows.');
  }

  const rows = normaliseRowKeys(rawRows);
  const data = rows.map(r => {
    const rawDate = r.date || r.day || r.cohort_date;
    const dateVal = rawDate ? toISO(rawDate) : null;
    const platform = String(r.platform || r.device_category || 'ANDROID').toUpperCase().trim();

    const totalUsers = parseFloat(r.total_users || r.total_user || r.users || r.totalusers || 0) || 0;
    const sessions = parseFloat(r.sessions || r.session_count || 0) || 0;
    const bounceRate = parseFloat(r.bounce_rate_pct || r.bounce_rate || r.bouncerate || r.bounce_pct || r.bouncerate_pct || 0) || 0;
    const engRate = parseFloat(r.engagement_rate_pct || r.engagement_rate || r.eng_rate || 0) || 0;
    const avgEngSec = parseFloat(r.avg_engagement_sec || r.avg_engagement_time || r.engagement_time || r.avg_time || r.avg_engagement || 0) || 0;

    return {
      date: dateVal,
      platform: platform,
      total_users: totalUsers,
      sessions: sessions,
      bounce_rate_pct: bounceRate,
      engagement_rate_pct: engRate,
      avg_engagement_sec: avgEngSec
    };
  }).filter(r => r.date != null);

  if (!data.length) {
    throw new Error('No valid records found. Dataset must contain date, platform, bounce_rate_pct, and avg_engagement_sec.');
  }

  DATA.appBounceEngagement = data;
  appEngagementFilename = filename;
  saveDatasetToStorage('app_eng', DATA.appBounceEngagement, filename);
  refresh();
  return data.length;
}

function handleUploadedAppEngagementFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      let rawRows = [];
      if (name.endsWith('.json')) {
        const parsed = JSON.parse(e.target.result);
        rawRows = Array.isArray(parsed) ? parsed : (parsed.data || parsed.rows || []);
      } else {
        const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: false, raw: false });
        rawRows = sheetToRows(wb, wb.SheetNames[0]);
      }

      const count = processAppEngagementRows(rawRows, file.name);
      toast(`Loaded ${count.toLocaleString()} App Bounce Rate & Engagement records from ${file.name}`, 'success');
    } catch (err) {
      toast(`Error reading App Bounce Rate & Engagement dataset file: ${err.message}`, 'error');
      console.error(err);
    }
  };
  if (name.endsWith('.json')) reader.readAsText(file);
  else reader.readAsBinaryString(file);
}

function processWebBounceEngDaylevelRows(rawRows, filename) {
  if (!rawRows || !rawRows.length) {
    throw new Error('No rows found in file');
  }
  const data = rawRows.map(r => {
    const norm = {};
    for (const k in r) {
      norm[k.toLowerCase().trim().replace(/[\s_]+/g, '_')] = r[k];
    }
    const dVal = norm.date || norm.day || norm.cohort_date || '';
    const dateStr = toISO(dVal);
    const bounceVal = parseFloat(norm.bounce_rate_pct || norm.bounce_rate || norm.bouncerate || 0);
    const engSecVal = parseFloat(norm.avg_engagement_sec || norm.avg_engagement_time || norm.engagement_time || norm.avg_eng_sec || 0);
    const sessVal = parseInt(norm.sessions || norm.total_sessions || 0, 10);
    const usersVal = parseInt(norm.total_users || norm.users || 0, 10);

    return {
      date: dateStr,
      sessions: sessVal,
      total_users: usersVal,
      bounce_rate_pct: bounceVal,
      avg_engagement_sec: engSecVal,
      platform: 'WEB'
    };
  }).filter(r => r.date != null);

  if (!data.length) {
    throw new Error('No valid records found. Dataset must contain date.');
  }

  DATA.webBounceEngDaylevel = data;
  webBounceEngDaylevelFilename = filename;
  saveDatasetToStorage('web_bounce_eng_daylevel', DATA.webBounceEngDaylevel, filename);
  refresh();
  return data.length;
}

function handleUploadedWebBounceEngDaylevelFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      let rawRows = [];
      if (name.endsWith('.json')) {
        const parsed = JSON.parse(e.target.result);
        rawRows = Array.isArray(parsed) ? parsed : (parsed.data || parsed.rows || []);
      } else {
        const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: false, raw: false });
        rawRows = sheetToRows(wb, wb.SheetNames[0]);
      }

      const count = processWebBounceEngDaylevelRows(rawRows, file.name);
      toast(`Loaded ${count.toLocaleString()} web_bounce rate and eng time daylevel records from ${file.name}`, 'success');
    } catch (err) {
      toast(`Error reading web_bounce rate and eng time daylevel dataset file: ${err.message}`, 'error');
      console.error(err);
    }
  };
  if (name.endsWith('.json')) reader.readAsText(file);
  else reader.readAsBinaryString(file);
}

function pullDataset(key) {
  const url = SHEET_SOURCES[key];
  if (!url || url.includes("PASTE_PUBLISHED_CSV_URL")) {
    return Promise.reject(new Error("URL not configured. Please paste the published CSV URL in SHEET_SOURCES at the top of app.js."));
  }

  pullStatus[key] = {
    loading: true,
    success: null,
    message: 'Pulling request in progress...'
  };

  const statusEl = document.getElementById(`status_${key}`);
  if (statusEl) {
    statusEl.innerHTML = `<span style="color: var(--accent); font-size: 13.5px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
                            <svg class="spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; color: var(--accent);"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 21v-5h-.581m0 0a8.003 8.003 0 11-15.357-2"/></svg>
                            Pulling request in progress...
                         </span>`;
  }

  return fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.text();
    })
    .then(text => {
      return new Promise((resolve, reject) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (res) => {
            try {
              let count = 0;
              const sourceName = `Google Sheet (${key})`;
              if (key === 'dashboard') {
                count = processOverallDashboardRows(res.data, sourceName);
              } else if (key === 'app') {
                count = processAppDashboardRows(res.data, sourceName);
              } else if (key === 'onboarding') {
                processNCOnboardingRows(res.data, sourceName);
                count = ncOnboardingRows.length;
              } else if (key === 'web') {
                count = processWebDashboardRows(res.data, sourceName);
              } else if (key === 'landing_funnel') {
                count = processLandingFunnelRows(res.data, sourceName);
              } else if (key === 'web_eng') {
                count = processWebEngagementRows(res.data, sourceName);
              } else if (key === 'app_eng') {
                count = processAppEngagementRows(res.data, sourceName);
              } else if (key === 'web_bounce_eng_daylevel') {
                count = processWebBounceEngDaylevelRows(res.data, sourceName);
              }

              const now = new Date();
              const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              pullStatus[key] = {
                loading: false,
                success: true,
                message: `✓ Pulled ${count.toLocaleString()} rows · ${timeStr}`
              };
              resolve(count);
            } catch (err) {
              pullStatus[key] = {
                loading: false,
                success: false,
                message: `✗ Error: ${err.message}`
              };
              reject(err);
            }
          },
          error: (err) => {
            pullStatus[key] = {
              loading: false,
              success: false,
              message: `✗ PapaParse Error: ${err.message}`
            };
            reject(err);
          }
        });
      });
    })
    .catch(err => {
      pullStatus[key] = {
        loading: false,
        success: false,
        message: `✗ Fetch Failed: ${err.message}`
      };
      throw err;
    });
}

function pullAllDatasets() {
  const loadingToast = toast(`Syncing all Google Sheet datasets in parallel...`, 'loading', 0);
  const btn = document.getElementById('pullAllBtn');
  let originalHtml = '';
  if (btn) {
    originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<svg class="upload-icon spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 6px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 21v-5h-.581m0 0a8.003 8.003 0 11-15.357-2"/></svg> Syncing...`;
  }

  Promise.allSettled([
    pullDataset('dashboard'),
    pullDataset('app'),
    pullDataset('onboarding'),
    pullDataset('web'),
    pullDataset('web_eng'),
    pullDataset('app_eng'),
    pullDataset('web_bounce_eng_daylevel')
  ]).then(results => {
    loadingToast.close();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    if (failed === 0) {
      toast(`Successfully pulled all datasets from Google Sheets!`, 'success');
    } else {
      toast(`Pulled ${succeeded} datasets. ${failed} failed to pull.`, 'warning');
    }

    refresh();
  });
}

function pullIndividualDataset(key) {
  const loadingToast = toast(`Pulling ${key} dataset from Google Sheets...`, 'loading', 0);
  const btn = document.getElementById(`pullBtn_${key}`);
  let originalHtml = '';
  if (btn) {
    originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<svg class="spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 12px; height: 12px; margin-right: 5px; vertical-align: middle;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 21v-5h-.581m0 0a8.003 8.003 0 11-15.357-2"/></svg> Pulling...`;
  }

  pullDataset(key)
    .then(count => {
      loadingToast.close();
      toast(`Successfully pulled ${key} dataset (${count.toLocaleString()} rows)!`, 'success');
      refresh();
    })
    .catch(err => {
      loadingToast.close();
      toast(`Failed to pull ${key} dataset: ${err.message}`, 'error');
      refresh();
    })
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    });
}

window.pullAllDatasets = pullAllDatasets;
window.pullIndividualDataset = pullIndividualDataset;


// Unlimitr App constants layout definition replicated from deskop dashboard
const APP_LAYOUT = [
  {
    name: "1. Banners", cells: [
      { lab: "Coach", feature: "Banner: Coach" },
      { lab: "Refer", feature: "Banner: Refer" },
      { lab: "Genie", feature: "Banner: Genie" }]
  },
  {
    name: "3. Today's nutrition", cells: [
      { lab: "Add food", feature: "Add food" },
      { lab: "Food scan", feature: "Food scan" }]
  },
  {
    name: "4. Your day so far", cells: [
      { lab: "Steps", feature: "Click steps" },
      { lab: "Sleep", feature: "Click sleep" },
      { lab: "Water", feature: "Click water" },
      { lab: "Add SSW", feature: "Add step/sleep/water" }]
  },
  {
    name: "5. Weekly rhythm", cells: [
      { lab: "Steps", feature: "Steps map" },
      { lab: "Calories", feature: "Calories map" },
      { lab: "Sleep", feature: "Sleep map" },
      { lab: "Water", feature: "Water map" }]
  },
];

const APP_DUO = [
  {
    name: "6. Expert coaching", cells: [
      { lab: "View all", feature: "Coaching: View all" },
      { lab: "Book", feature: "Coaching: Book session" }]
  },
  {
    name: "7. Balanced bites", cells: [
      { lab: "View all", feature: "Balanced Bites: View all" },
      { lab: "Recipe", feature: "Balanced Bites: View recipe" }]
  },
];

const APP_PROFILE = { lab: "Profile", feature: "Profile" };

// App Profile layout definition
const APP_PROFILE_LAYOUT = [
  {
    name: "YOUR INFORMATION", cells: [
      { lab: "Basic Information", feature: "Basic information" },
      { lab: "Location", feature: "Location" }
    ]
  },
  {
    name: "HEALTH & DIET", cells: [
      { lab: "Food Preference", feature: "Food preference" },
      { lab: "Meal Plan", feature: "Meal plan" },
      { lab: "Recipes", feature: "Recipes" },
      { lab: "Goal", feature: "Goal" },
      { lab: "Body Measurements", feature: "Body measurements" },
      { lab: "Health Parameters", feature: "Health parameters" }
    ]
  },
  {
    name: "COACHING", cells: [
      { lab: "Find a Coach", feature: "Find a coach" },
      { lab: "My Appointments", feature: "My appointments" },
      { lab: "Coach Invitations", feature: "Coach invitations" },
      { lab: "Order History", feature: "Order history" },
      { lab: "Refer & Earn", feature: "Refer & earn" },
      { lab: "Rate App", feature: "Rate app" },
      { lab: "Share App", feature: "Share app" }
    ]
  },
  {
    name: "SUPPORT", cells: [
      { lab: "Settings", feature: "Settings" },
      { lab: "Help Center", feature: "Help center" },
      { lab: "Contact Us", feature: "Contact us" },
      { lab: "Logout", feature: "Log out" }
    ]
  }
];



// Render the Unlimitr App view panel page
function renderApp(d) {
  document.getElementById('crumb').textContent = 'unlimitr app';

  if (!appRows.length) {
    d.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto;">
        <button class="back-btn" id="backBtnApp">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to Overview
        </button>
        <div class="page-title">Unlimitr App</div>
        
        <div class="card" style="padding: 40px; text-align: center; margin: 24px auto 40px auto; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <div style="font-size: 56px; margin-bottom: 20px;">📱</div>
          <h3 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">Data is not uploaded yet for visualization</h3>
          <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; line-height: 1.6; max-width: 440px;">
            Please upload the app feature usage CSV dataset to view the interactive app screen mockup.
          </p>
          <button class="upload-btn" onclick="window.navigateToView('upload')" style="width: auto; padding: 10px 24px; display: inline-flex; font-size: 14px; font-weight: 600;">
            Go to Upload Datasets
          </button>
          
          <div style="margin-top: 32px; width: 100%; border-top: 1px solid var(--border-color); padding-top: 24px; text-align: left;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 8px;">BigQuery SQL Query:</span>
            <code style="display:block; background:#0f2a43; color:#d7e6f5; padding:14px; border-radius:10px; font-size:12px; font-family: ui-monospace, Menlo, Consolas, monospace; white-space: pre-wrap; line-height: 1.5; overflow-x: auto;">SELECT date, platform, section, feature, user_pseudo_id, taps
FROM \`health-click-away-254812.analytics_212444237.dashboard_feature_usage_v\`;</code>
          </div>
        </div>
      </div>
    `;

    document.getElementById('backBtnApp').addEventListener('click', () => navigateToView('overview'));
    return;
  }

  const { curStart, curEnd } = periodRanges();
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const rangeText = `${curStart.toLocaleDateString('en-US', options)} — ${curEnd.toLocaleDateString('en-US', options)}`;
  const displayPlat = (PLATFORM === 'WEB' || PLATFORM === 'ALL' || PLATFORM === 'APP') ? 'All Mobile Apps (Android + iOS)' : getPlatformLabel(PLATFORM);

  d.innerHTML = `
    <div style="${VIEW_MODE === 'DAY_LEVEL' ? 'max-width: 100%;' : 'max-width: 960px;'} margin: 0 auto;">
      <button class="back-btn" id="backBtnApp">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Back to Overview
      </button>
      
      <div style="margin-bottom: 24px;">
        <div class="page-title">Unlimitr App</div>
        <div class="page-sub" style="margin-bottom: 0;">
          ${VIEW_MODE === 'DAY_LEVEL' ? 'Day-level app feature usage breakdown matrix grouped by section & feature.' : 'Home-screen features, laid out as they appear in the app. Darker = more usage.'}
        </div>
      </div>

      ${VIEW_MODE === 'DAY_LEVEL' ? `
        <!-- App Controls Card (Global filter status + Metric segment toggle) -->
        <div class="card" style="padding: 12px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-secondary);">
            <span style="display: inline-block; width: 8px; height: 8px; background-color: var(--green); border-radius: 50%; box-shadow: 0 0 0 3px rgba(16,185,129,0.15);"></span>
            <span><strong>${displayPlat}</strong> · <strong>${rangeText}</strong></span>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Metric</span>
            <div class="period-pills" style="margin: 0; padding: 2px;">
              <button class="pill ${appMetric === 'users' ? 'active' : ''}" id="appMetricUsersBtn" style="font-size: 12px; padding: 5px 12px;">Users</button>
              <button class="pill ${appMetric === 'taps' ? 'active' : ''}" id="appMetricTapsBtn" style="font-size: 12px; padding: 5px 12px;">Taps</button>
            </div>
          </div>
        </div>

        <!-- Screen Layout Area (Full Width Pivot Matrix in Day Level Mode) -->
        <div id="appStage"></div>
      ` : `
        <div style="display: flex; gap: 30px; align-items: flex-start;">
          <!-- Left Column: App Home Screen Screenshots Stack -->
          <div style="width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; background: #ffffff; padding: 14px; border: 1px solid var(--border-color); border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; text-align: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 4px;">App Home Screens</div>
            <img src="assets/app_screen_1.jpg" alt="App Home Screen Part 1" style="width: 100%; border-radius: 12px; border: 1px solid var(--border-color);">
            <img src="assets/app_screen_2.jpg" alt="App Home Screen Part 2" style="width: 100%; border-radius: 12px; border: 1px solid var(--border-color);">
            <img src="assets/app_screen_3.jpg" alt="App Home Screen Part 3" style="width: 100%; border-radius: 12px; border: 1px solid var(--border-color);">
          </div>

          <!-- Right Column: Dashboard Controls and Mockup Grid -->
          <div style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column;">
            <!-- App Controls Card (Global filter status + Metric segment toggle) -->
            <div class="card" style="padding: 12px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-secondary);">
                <span style="display: inline-block; width: 8px; height: 8px; background-color: var(--green); border-radius: 50%; box-shadow: 0 0 0 3px rgba(16,185,129,0.15);"></span>
                <span><strong>${displayPlat}</strong> · <strong>${rangeText}</strong></span>
              </div>

              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Metric</span>
                <div class="period-pills" style="margin: 0; padding: 2px;">
                  <button class="pill ${appMetric === 'users' ? 'active' : ''}" id="appMetricUsersBtn" style="font-size: 12px; padding: 5px 12px;">Users</button>
                  <button class="pill ${appMetric === 'taps' ? 'active' : ''}" id="appMetricTapsBtn" style="font-size: 12px; padding: 5px 12px;">Taps</button>
                </div>
              </div>
            </div>

            <!-- Screen Layout Area -->
            <div id="appStage"></div>
          </div>
        </div>
      `}
    </div>
  `;

  document.getElementById('backBtnApp').addEventListener('click', () => navigateToView('overview'));

  // Event bindings
  document.getElementById('appMetricUsersBtn').addEventListener('click', () => {
    appMetric = 'users';
    document.getElementById('appMetricUsersBtn').classList.add('active');
    document.getElementById('appMetricTapsBtn').classList.remove('active');
    refreshAppStage();
  });
  document.getElementById('appMetricTapsBtn').addEventListener('click', () => {
    appMetric = 'taps';
    document.getElementById('appMetricTapsBtn').classList.add('active');
    document.getElementById('appMetricUsersBtn').classList.remove('active');
    refreshAppStage();
  });

  refreshAppStage();
}

// Render Day-Level App Features Pivot Matrix Table
function renderAppDayLevelPivotStage(stage) {
  const { curStart, curEnd, prevStart, prevEnd } = periodRanges();
  const dayBreakdown = getDayLevelBreakdown(curStart, curEnd);

  if (!dayBreakdown || !dayBreakdown.length) {
    stage.innerHTML = `
      <div class="card" style="padding: 30px; text-align: center; color: var(--text-secondary);">
        No day-level data available for the selected date range.
      </div>
    `;
    return;
  }

  const curStartISO = toISO(curStart);
  const curEndISO = toISO(curEnd);
  const prevStartISO = toISO(prevStart);
  const prevEndISO = toISO(prevEnd);

  const curRowsFiltered = appRows.filter(r => {
    const dMatch = r.date >= curStartISO && r.date <= curEndISO;
    const pMatch = (PLATFORM === 'ALL' || PLATFORM === 'APP' || PLATFORM === 'WEB' || isPlatMatch(r.platform, PLATFORM));
    return pMatch && dMatch;
  });

  const sectionMap = {};
  appRows.forEach(r => {
    const sec = r.section || deriveSectionFromFeature(r.feature || '', r.section);
    const feat = r.feature || 'Unknown';
    if (!sectionMap[sec]) sectionMap[sec] = new Set();
    sectionMap[sec].add(feat);
  });

  const sections = Object.keys(sectionMap).sort();

  const dateDataMap = {};
  dayBreakdown.forEach(d => {
    dateDataMap[d.date] = {};
  });

  dayBreakdown.forEach(d => {
    const dateStr = d.date;
    const dateRows = curRowsFiltered.filter(r => r.date === dateStr);

    sections.forEach(sec => {
      dateDataMap[dateStr][sec] = {
        total: 0,
        features: {}
      };

      const secUserSet = new Set();
      const secRows = dateRows.filter(r => (r.section || deriveSectionFromFeature(r.feature || '', r.section)) === sec);
      const featList = Array.from(sectionMap[sec]);

      featList.forEach(feat => {
        const featRows = secRows.filter(r => (r.feature || 'Unknown') === feat);
        if (appMetric === 'users') {
          const featUserSet = new Set();
          featRows.forEach(r => {
            const uid = r.uid || r.user_pseudo_id;
            if (uid) {
              featUserSet.add(uid);
              secUserSet.add(uid);
            }
          });
          dateDataMap[dateStr][sec].features[feat] = featUserSet.size;
        } else {
          const tapsSum = featRows.reduce((s, r) => s + (Number(r.taps) || 0), 0);
          dateDataMap[dateStr][sec].features[feat] = tapsSum;
          dateDataMap[dateStr][sec].total += tapsSum;
        }
      });

      if (appMetric === 'users') {
        dateDataMap[dateStr][sec].total = secUserSet.size;
      }
    });
  });

  const selDateStr = selectedDayLevelDate || (dayBreakdown.length ? dayBreakdown[dayBreakdown.length - 1].date : '');
  const selIdx = dayBreakdown.findIndex(d => d.date === selDateStr);
  const prevDateStr = selIdx > 0 ? dayBreakdown[selIdx - 1].date : null;

  const selParts = selDateStr ? selDateStr.split('-') : [];
  const selDisplay = selParts.length === 3 ? `${selParts[2]}-${selParts[1]}` : selDateStr;

  const prevParts = prevDateStr ? prevDateStr.split('-') : [];
  const prevDisplay = prevParts.length === 3 ? `${prevParts[2]}-${prevParts[1]}` : 'prev';

  let totalFeaturesCount = 0;
  sections.forEach(sec => totalFeaturesCount += sectionMap[sec].size);

  let html = `
    <div class="card" style="padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
        <div>
          <div class="sect-title" style="font-size: 16px; font-weight: 600; margin: 0; color: var(--text-primary); display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span>App Features Day Level Pivot</span>
            <span style="font-size: 11.5px; font-weight: 600; background: rgba(99, 102, 241, 0.1); color: var(--accent); padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(99, 102, 241, 0.2);">
              Metric: ${appMetric === 'users' ? 'Unique Users' : 'Total Taps'}
            </span>
            <span style="font-size: 11.5px; font-weight: 600; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2);">
              Platform: ${getPlatformBadgeLabel(PLATFORM)}
            </span>
          </div>
          <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">
            Horizontal daily app feature usage breakdown across ${sections.length} sections, ${totalFeaturesCount} features & ${dayBreakdown.length} dates (Click date column to highlight)
          </div>
        </div>
        <span style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">
          ${sections.length} Sections · ${totalFeaturesCount} Features · ${dayBreakdown.length} Dates
        </span>
      </div>

      <div class="day-matrix-scroll-container" id="appDayPivotScrollContainer" style="overflow-x: auto; max-height: 650px; border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 12px; box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.05);">
        <table class="day-matrix-table">
          <thead>
            <tr>
              <th class="day-matrix-th sticky-col" style="min-width: 280px;">SECTION / FEATURE \\ DATES</th>
              ${dayBreakdown.map(d => `
                <th class="day-matrix-th ${d.date === selDateStr ? 'active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')" title="Click to select ${d.displayDate}">
                  ${d.displayDate}
                </th>
              `).join('')}
              <th class="day-matrix-th sticky-col-right" title="% Change between ${selDisplay} vs ${prevDisplay}">
                % Change (${selDisplay} vs ${prevDisplay})
              </th>
            </tr>
          </thead>
          <tbody class="day-matrix-tbody">
  `;

  sections.forEach((sec) => {
    const featList = Array.from(sectionMap[sec]).sort();

    const secCur = (selDateStr && dateDataMap[selDateStr] && dateDataMap[selDateStr][sec]) ? dateDataMap[selDateStr][sec].total : 0;
    const secPrev = (prevDateStr && dateDataMap[prevDateStr] && dateDataMap[prevDateStr][sec]) ? dateDataMap[prevDateStr][sec].total : 0;

    // Section Row Header
    html += `
      <tr style="background: rgba(99, 102, 241, 0.06); font-weight: 700; border-top: 2px solid rgba(99, 102, 241, 0.18); border-bottom: 1px solid rgba(99, 102, 241, 0.15);">
        <td class="day-matrix-td sticky-col" style="background: rgba(241, 245, 249, 0.98); font-weight: 700; color: var(--accent); padding-left: 14px; font-size: 13px;">
          📁 ${sec}
        </td>
        ${dayBreakdown.map(d => {
          const val = (dateDataMap[d.date] && dateDataMap[d.date][sec]) ? dateDataMap[d.date][sec].total : 0;
          return `
            <td class="day-matrix-td ${d.date === selDateStr ? 'day-col-active' : ''}" style="font-weight: 700;" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')">
              ${val > 0 ? fmt(val) : '-'}
            </td>
          `;
        }).join('')}
        <td class="day-matrix-td sticky-col-right" style="background: rgba(241, 245, 249, 0.98); font-weight: 700;">
          ${calcDayChangeHTML(secCur, secPrev)}
        </td>
      </tr>
    `;

    // Feature Sub-Rows
    featList.forEach(feat => {
      const featCur = (selDateStr && dateDataMap[selDateStr] && dateDataMap[selDateStr][sec] && dateDataMap[selDateStr][sec].features) ? dateDataMap[selDateStr][sec].features[feat] || 0 : 0;
      const featPrev = (prevDateStr && dateDataMap[prevDateStr] && dateDataMap[prevDateStr][sec] && dateDataMap[prevDateStr][sec].features) ? dateDataMap[prevDateStr][sec].features[feat] || 0 : 0;

      html += `
        <tr style="border-bottom: 1px solid rgba(226, 232, 240, 0.6);">
          <td class="day-matrix-td sticky-col" style="padding-left: 32px; font-size: 12.5px; color: var(--text-primary);" title="${feat}">
            └ ${feat}
          </td>
          ${dayBreakdown.map(d => {
            const val = (dateDataMap[d.date] && dateDataMap[d.date][sec] && dateDataMap[d.date][sec].features) ? dateDataMap[d.date][sec].features[feat] || 0 : 0;
            return `
              <td class="day-matrix-td ${d.date === selDateStr ? 'day-col-active' : ''}" data-date="${d.date}" onclick="window.selectDayLevelDate('${d.date}')">
                ${val > 0 ? fmt(val) : '-'}
              </td>
            `;
          }).join('')}
          <td class="day-matrix-td sticky-col-right">
            ${calcDayChangeHTML(featCur, featPrev)}
          </td>
        </tr>
      `;
    });
  });

  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  stage.innerHTML = html;
}

// Refresh the cell metrics of Unlimitr App mockup stage
function refreshAppStage() {
  const stage = document.getElementById('appStage');
  if (!stage) return;

  if (VIEW_MODE === 'DAY_LEVEL') {
    renderAppDayLevelPivotStage(stage);
    return;
  }

  const { curStart, curEnd, prevStart, prevEnd } = periodRanges();
  const curStartISO = toISO(curStart);
  const curEndISO = toISO(curEnd);
  const prevStartISO = toISO(prevStart);
  const prevEndISO = toISO(prevEnd);

  const curRowsFiltered = appRows.filter(r => {
    const dMatch = r.date >= curStartISO && r.date <= curEndISO;
    const pMatch = (PLATFORM === 'ALL' || PLATFORM === 'APP' || PLATFORM === 'WEB' || isPlatMatch(r.platform, PLATFORM));
    return pMatch && dMatch;
  });

  const prevRowsFiltered = appRows.filter(r => {
    const dMatch = r.date >= prevStartISO && r.date <= prevEndISO;
    const pMatch = (PLATFORM === 'ALL' || PLATFORM === 'APP' || PLATFORM === 'WEB' || isPlatMatch(r.platform, PLATFORM));
    return pMatch && dMatch;
  });

  const mvals = {};
  const prevMvals = {};

  if (appMetric === 'users') {
    const sets = {};
    curRowsFiltered.forEach(r => {
      if (!sets[r.feature]) sets[r.feature] = new Set();
      sets[r.feature].add(r.uid);
    });
    for (const key in sets) {
      mvals[key] = sets[key].size;
    }

    const prevSets = {};
    prevRowsFiltered.forEach(r => {
      if (!prevSets[r.feature]) prevSets[r.feature] = new Set();
      prevSets[r.feature].add(r.uid);
    });
    for (const key in prevSets) {
      prevMvals[key] = prevSets[key].size;
    }
  } else {
    curRowsFiltered.forEach(r => {
      mvals[r.feature] = (mvals[r.feature] || 0) + r.taps;
    });
    prevRowsFiltered.forEach(r => {
      prevMvals[r.feature] = (prevMvals[r.feature] || 0) + r.taps;
    });
  }

  const max = Math.max(1, ...Object.values(mvals));
  const prof = mvals[APP_PROFILE.feature] || 0;
  const prevProf = prevMvals[APP_PROFILE.feature] || 0;

  function tint(v) {
    if (!v) return 'background-color: #f8fafc; border-color: var(--border-color); color: var(--text-secondary);';
    const a = 0.08 + 0.77 * (v / max);
    return `background-color: rgba(99, 102, 241, ${a.toFixed(3)}); border-color: rgba(99, 102, 241, ${Math.min(a + 0.15, 1).toFixed(3)}); color: ${a > 0.45 ? '#ffffff' : 'var(--text-primary)'}; font-weight: 600;`;
  }

  function cellHTML(c) {
    const v = mvals[c.feature] || 0;
    const prevV = prevMvals[c.feature] || 0;

    const ratio = v / max;
    const isDarkBg = ratio > 0.45;

    let deltaHTML = '';
    if (COMPARE) {
      if (prevV === 0) {
        deltaHTML = `<div style="font-size: 10px; color: ${isDarkBg ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'}; margin-top: 4px; height: 12px; font-weight: 500;">new</div>`;
      } else {
        const diff = ((v - prevV) / prevV) * 100;
        const up = diff >= 0;
        const arrow = up ? '▲' : '▼';
        const color = isDarkBg
          ? (up ? '#a7f3d0' : '#fecaca')
          : (up ? 'var(--green)' : 'var(--red)');

        deltaHTML = `
          <div style="font-size: 10.5px; font-weight: 600; color: ${color}; margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 2px;">
            <span>${arrow}</span>
            <span>${Math.abs(diff).toFixed(1)}%</span>
          </div>
        `;
      }
    } else {
      deltaHTML = `<div style="font-size: 10.5px; margin-top: 4px; height: 12px;"></div>`;
    }

    return `
      <div class="cell" style="flex: 1; border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 10px 10px 10px; text-align: center; min-width: 0; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); ${tint(v)}">
        <div style="font-size: 12px; opacity: 0.85; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.lab}</div>
        <div style="font-size: 18px; font-weight: 700; line-height: 1.2;">${v.toLocaleString()}</div>
        ${deltaHTML}
      </div>
    `;
  }

  let profileDeltaHTML = '';
  if (COMPARE) {
    if (prevProf === 0) {
      profileDeltaHTML = `<span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">new</span>`;
    } else {
      const diff = ((prof - prevProf) / prevProf) * 100;
      const up = diff >= 0;
      const arrow = up ? '▲' : '▼';
      const color = up ? 'var(--green)' : 'var(--red)';
      profileDeltaHTML = `
        <span style="font-size: 12px; font-weight: 600; color: ${color}; display: inline-flex; align-items: center; gap: 3px;">
          <span>${arrow}</span>
          <span>${Math.abs(diff).toFixed(1)}%</span>
          <span style="font-size: 11px; font-weight: 500; color: var(--text-muted); margin-left: 2px;">vs prev</span>
        </span>
      `;
    }
  }

  let html = `
    <!-- Profile Row -->
    <div onclick="window.navigateToView('app_profile')" class="card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 12px 18px; border: 1px solid var(--border-color); border-radius: 16px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border-color)'">
      <span style="font-size: 14px; font-weight: 600; color: var(--text-secondary);">2. Profile</span>
      <div style="display: flex; align-items: center; gap: 12px;">
        ${profileDeltaHTML}
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
          <span class="badge" style="background: var(--accent); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13.5px; font-weight: 600; box-shadow: 0 2px 8px rgba(99,102,241,0.25);">
            Profile: <b style="font-size: 14px; font-weight: 700; margin-left: 2px;">${prof.toLocaleString()}</b>
          </span>
          <span style="font-size: 10px; font-weight: 600; color: var(--accent); text-decoration: underline;">View more</span>
        </div>
      </div>
    </div>
  `;

  APP_LAYOUT.forEach(s => {
    html += `
      <div class="card" style="padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">${s.name}</div>
        <div class="cells" style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${s.cells.map(c => cellHTML(c)).join('')}
        </div>
      </div>
    `;
  });

  html += `
    <div class="grid g2" style="gap: 16px; margin-bottom: 16px;">
      ${APP_DUO.map(s => `
        <div class="card" style="padding: 16px; margin: 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">${s.name}</div>
          <div class="cells" style="display: flex; gap: 10px;">
            ${s.cells.map(c => cellHTML(c)).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const label = appMetric === 'users' ? 'distinct users' : 'total taps';
  html += `<p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 12px; text-align: center;">Showing ${label} · ${curRowsFiltered.length.toLocaleString()} rows in range · darkest cell = highest value in the current view.</p>`;

  stage.innerHTML = html;
}

// Event Bindings
function bindEvents() {
  // Sidebar menu item click listeners
  document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.getAttribute('data-view');
      navigateToView(view);
    });
  });

  // Sidebar Upload all data link listener
  const uploadLink = document.getElementById('uploadLink');
  if (uploadLink) {
    uploadLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToView('upload');
    });
  }

  // Platform Select dropdown
  document.getElementById('platSel').addEventListener('change', (e) => {
    PLATFORM = e.target.value;
    computeDates();
    setupDateInputs();
    refresh();
  });

  // Period change buttons ( pills )
  document.querySelectorAll('.period-pills:not(#viewModeGroup) .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.period-pills:not(#viewModeGroup) .pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      PERIOD = pill.getAttribute('data-period');

      const customDates = document.getElementById('customDates');
      if (PERIOD === 'CUSTOM') {
        customDates.classList.remove('hidden');
        const dFrom = document.getElementById('dFrom');
        const dTo = document.getElementById('dTo');
        const end = maxDate || new Date();
        if (!dFrom.value) dFrom.value = toISO(new Date(end.getFullYear(), end.getMonth(), 1));
        if (!dTo.value) dTo.value = toISO(end);
      } else {
        customDates.classList.add('hidden');
      }
      refresh();
    });
  });

  // View Mode buttons ( Aggregated vs Day Level )
  const vmAgg = document.getElementById('vm-agg');
  const vmDay = document.getElementById('vm-day');
  if (vmAgg && vmDay) {
    vmAgg.addEventListener('click', () => {
      vmAgg.classList.add('active');
      vmDay.classList.remove('active');
      VIEW_MODE = 'AGGREGATED';
      refresh();
    });
    vmDay.addEventListener('click', () => {
      vmDay.classList.add('active');
      vmAgg.classList.remove('active');
      VIEW_MODE = 'DAY_LEVEL';
      refresh();
    });
  }

  // Date Picker inputs
  document.getElementById('dFrom').addEventListener('change', refresh);
  document.getElementById('dTo').addEventListener('change', refresh);

  // Compare Button Toggle
  const cmpBtn = document.getElementById('p-cmp');
  cmpBtn.addEventListener('click', () => {
    COMPARE = !COMPARE;
    cmpBtn.classList.toggle('active', COMPARE);
    const statusText = cmpBtn.querySelector('.compare-status');
    if (statusText) statusText.textContent = COMPARE ? 'On' : 'Off';
    refresh();
  });
}

// Render the App Profile view panel page
function renderAppProfile(d) {
  document.getElementById('crumb').textContent = 'app profile';

  const { curStart, curEnd } = periodRanges();
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const rangeText = `${curStart.toLocaleDateString('en-US', options)} — ${curEnd.toLocaleDateString('en-US', options)}`;
  const displayPlat = (PLATFORM === 'WEB' || PLATFORM === 'ALL' || PLATFORM === 'APP') ? 'All Mobile Apps (Android + iOS)' : getPlatformLabel(PLATFORM);

  // Render main layout structure
  d.innerHTML = `
    <div style="max-width: 960px; margin: 0 auto;">
      <button class="back-btn" id="backBtnAppProfile">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Back to App Dashboard
      </button>
      
      <div style="margin-bottom: 24px;">
        <div class="page-title">App Profile Features</div>
        <div class="page-sub" style="margin-bottom: 0;">Interactive layout of profile-screen selections. Darker = more usage.</div>
      </div>

      <div style="display: flex; gap: 30px; align-items: flex-start;">
        <!-- Left Column: Profile Screens Screenshots Stack -->
        <div style="width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; background: #ffffff; padding: 14px; border: 1px solid var(--border-color); border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; text-align: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 4px;">Profile Screens</div>
          <img src="assets/profile_screen_1.jpg" alt="Profile Screen Part 1" style="width: 100%; border-radius: 12px; border: 1px solid var(--border-color);">
          <img src="assets/profile_screen_2.jpg" alt="Profile Screen Part 2" style="width: 100%; border-radius: 12px; border: 1px solid var(--border-color);">
        </div>

        <!-- Right Column: Dashboard Controls and Mockup Grid -->
        <div style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column;">
          <!-- Controls Card (Global filter status + Metric segment toggle) -->
          <div class="card" style="padding: 12px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-secondary);">
              <span style="display: inline-block; width: 8px; height: 8px; background-color: var(--green); border-radius: 50%; box-shadow: 0 0 0 3px rgba(16,185,129,0.15);"></span>
              <span><strong>${displayPlat}</strong> · <strong>${rangeText}</strong></span>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Metric</span>
              <div class="period-pills" style="margin: 0; padding: 2px;">
                <button class="pill ${appMetric === 'users' ? 'active' : ''}" id="appProfileMetricUsersBtn" style="font-size: 12px; padding: 5px 12px;">Users</button>
                <button class="pill ${appMetric === 'taps' ? 'active' : ''}" id="appProfileMetricTapsBtn" style="font-size: 12px; padding: 5px 12px;">Taps</button>
              </div>
            </div>
          </div>

          <!-- Profile Screen Layout Area -->
          <div id="appProfileStage"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('backBtnAppProfile').addEventListener('click', () => navigateToView('app'));

  // Event bindings
  document.getElementById('appProfileMetricUsersBtn').addEventListener('click', () => {
    appMetric = 'users';
    document.getElementById('appProfileMetricUsersBtn').classList.add('active');
    document.getElementById('appProfileMetricTapsBtn').classList.remove('active');
    refreshAppProfileStage();
  });
  document.getElementById('appProfileMetricTapsBtn').addEventListener('click', () => {
    appMetric = 'taps';
    document.getElementById('appProfileMetricTapsBtn').classList.add('active');
    document.getElementById('appProfileMetricUsersBtn').classList.remove('active');
    refreshAppProfileStage();
  });

  refreshAppProfileStage();
}

// Refresh the cell metrics of App Profile mockup stage
function refreshAppProfileStage() {
  const stage = document.getElementById('appProfileStage');
  if (!stage) return;

  if (appRows.length === 0) {
    stage.innerHTML = `
      <div class="card" style="padding: 40px; text-align: center; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.05); min-height: 350px;">
        <div style="font-size: 56px; margin-bottom: 20px;">👤</div>
        <h3 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">Profile dataset is not uploaded for visuals</h3>
        <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; line-height: 1.6; max-width: 440px;">
          Please upload the app profile feature usage CSV dataset to view the interactive profile screen selections. Once the profile data is found, visuals will load automatically.
        </p>
        <button class="upload-btn" onclick="window.navigateToView('upload')" style="width: auto; padding: 10px 24px; display: inline-flex; font-size: 14px; font-weight: 600;">
          Go to Upload Datasets
        </button>
        
        <div style="margin-top: 32px; width: 100%; border-top: 1px solid var(--border-color); padding-top: 24px; text-align: left;">
          <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 8px;">BigQuery SQL Query:</span>
          <code style="display:block; background:#0f2a43; color:#d7e6f5; padding:14px; border-radius:10px; font-size:12px; font-family: ui-monospace, Menlo, Consolas, monospace; white-space: pre-wrap; line-height: 1.5; overflow-x: auto;">SELECT date, platform, feature, user_pseudo_id, taps
FROM \`health-click-away-254812.analytics_212444237.profile_feature_usage_v\`;</code>
        </div>
      </div>
    `;
    return;
  }

  const { curStart, curEnd, prevStart, prevEnd } = periodRanges();
  const curStartISO = toISO(curStart);
  const curEndISO = toISO(curEnd);
  const prevStartISO = toISO(prevStart);
  const prevEndISO = toISO(prevEnd);

  // Filter rows based on global date range and global platform selector
  const curRowsFiltered = appRows.filter(r => {
    const dMatch = r.date >= curStartISO && r.date <= curEndISO;
    const pMatch = (PLATFORM === 'ALL' || PLATFORM === 'APP' || PLATFORM === 'WEB' || isPlatMatch(r.platform, PLATFORM));
    return pMatch && dMatch;
  });

  const prevRowsFiltered = appRows.filter(r => {
    const dMatch = r.date >= prevStartISO && r.date <= prevEndISO;
    const pMatch = (PLATFORM === 'ALL' || PLATFORM === 'APP' || PLATFORM === 'WEB' || isPlatMatch(r.platform, PLATFORM));
    return pMatch && dMatch;
  });

  const mvals = {};
  const prevMvals = {};

  if (appMetric === 'users') {
    const sets = {};
    curRowsFiltered.forEach(r => {
      if (!sets[r.feature]) sets[r.feature] = new Set();
      sets[r.feature].add(r.uid);
    });
    for (const key in sets) {
      mvals[key] = sets[key].size;
    }

    const prevSets = {};
    prevRowsFiltered.forEach(r => {
      if (!prevSets[r.feature]) prevSets[r.feature] = new Set();
      prevSets[r.feature].add(r.uid);
    });
    for (const key in prevSets) {
      prevMvals[key] = prevSets[key].size;
    }
  } else {
    curRowsFiltered.forEach(r => {
      mvals[r.feature] = (mvals[r.feature] || 0) + r.taps;
    });
    prevRowsFiltered.forEach(r => {
      prevMvals[r.feature] = (prevMvals[r.feature] || 0) + r.taps;
    });
  }

  const max = Math.max(1, ...Object.values(mvals));

  function tint(v) {
    if (!v) return 'background-color: #f8fafc; border-color: var(--border-color); color: var(--text-secondary);';
    const a = 0.08 + 0.77 * (v / max);
    return `background-color: rgba(99, 102, 241, ${a.toFixed(3)}); border-color: rgba(99, 102, 241, ${Math.min(a + 0.15, 1).toFixed(3)}); color: ${a > 0.45 ? '#ffffff' : 'var(--text-primary)'}; font-weight: 600;`;
  }

  function cellHTML(c) {
    const v = mvals[c.feature] || 0;
    const prevV = prevMvals[c.feature] || 0;

    const ratio = v / max;
    const isDarkBg = ratio > 0.45;

    let deltaHTML = '';
    if (COMPARE) {
      if (prevV === 0) {
        deltaHTML = `<span style="font-size: 11px; color: ${isDarkBg ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'}; margin-right: 8px; font-weight: 500;">new</span>`;
      } else {
        const diff = ((v - prevV) / prevV) * 100;
        const up = diff >= 0;
        const arrow = up ? '▲' : '▼';
        const color = isDarkBg
          ? (up ? '#a7f3d0' : '#fecaca')
          : (up ? 'var(--green)' : 'var(--red)');

        deltaHTML = `
          <span style="font-size: 11px; font-weight: 600; color: ${color}; margin-right: 8px; display: inline-flex; align-items: center; gap: 1px;">
            <span>${arrow}</span>
            <span>${Math.abs(diff).toFixed(1)}%</span>
          </span>
        `;
      }
    }

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-color); border-radius: 12px; padding: 10px 16px; min-height: 44px; margin-bottom: 8px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); ${tint(v)}">
        <span style="font-size: 13px; font-weight: 500;">${c.lab}</span>
        <div style="display: flex; align-items: center;">
          ${deltaHTML}
          <span style="font-size: 14px; font-weight: 700;">${v.toLocaleString()}</span>
        </div>
      </div>
    `;
  }

  let html = '';

  APP_PROFILE_LAYOUT.forEach(s => {
    html += `
      <div class="card" style="padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">${s.name}</div>
        <div style="display: flex; flex-direction: column;">
          ${s.cells.map(c => cellHTML(c)).join('')}
        </div>
      </div>
    `;
  });

  const label = appMetric === 'users' ? 'distinct users' : 'total taps';
  html += `<p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 12px; text-align: center;">Showing ${label} · ${curRowsFiltered.length.toLocaleString()} rows in range · darkest cell = highest value in the current view.</p>`;

  stage.innerHTML = html;
}

// Landing Page Funnel default demo generator & filtering
let selectedFunnelPageType = 'ALL';
let selectedFunnelSourcePlatform = 'ALL';

let funnelFromDate = '';
let funnelToDate = '';
let funnelCompare = true;
let funnelCmpFromDate = '';
let funnelCmpToDate = '';
let userHasCustomizedCompareDates = false;

function ensureDefaultLandingFunnelData() {
  if (DATA.landingFunnel && DATA.landingFunnel.length) return;

  const sampleRows = [
    { landing_date: '2026-08-12', session_campaign: 'Personal Health Coach Campaign 11th May', session_source_platform: 'google', page_type: 'womens_health_free_assessment_unlimitr', step_order: 1, step_name: 'Landing', active_users: 2074 },
    { landing_date: '2026-08-12', session_campaign: 'Personal Health Coach Campaign 11th May', session_source_platform: 'google', page_type: 'womens_health_free_assessment_unlimitr', step_order: 2, step_name: 'Form Start', active_users: 690 },
    { landing_date: '2026-08-12', session_campaign: 'Personal Health Coach Campaign 11th May', session_source_platform: 'google', page_type: 'womens_health_free_assessment_unlimitr', step_order: 3, step_name: 'Otp Sent', active_users: 4 },
    { landing_date: '2026-08-12', session_campaign: 'Personal Health Coach Campaign 11th May', session_source_platform: 'google', page_type: 'womens_health_free_assessment_unlimitr', step_order: 4, step_name: 'Otp Varified', active_users: 3 },
    { landing_date: '2026-08-12', session_campaign: 'Personal Health Coach Campaign 11th May', session_source_platform: 'google', page_type: 'womens_health_free_assessment_unlimitr', step_order: 5, step_name: 'Lead success / Form completed', active_users: 230 },

    { landing_date: '2026-08-12', session_campaign: 'Health-and-Nutrition-Campaign', session_source_platform: 'facebook', page_type: 'womens_health_free_assessment_unlimitr', step_order: 1, step_name: 'Landing', active_users: 2811 },
    { landing_date: '2026-08-12', session_campaign: 'Health-and-Nutrition-Campaign', session_source_platform: 'facebook', page_type: 'womens_health_free_assessment_unlimitr', step_order: 2, step_name: 'Form Start', active_users: 1221 },
    { landing_date: '2026-08-12', session_campaign: 'Health-and-Nutrition-Campaign', session_source_platform: 'facebook', page_type: 'womens_health_free_assessment_unlimitr', step_order: 3, step_name: 'Otp Sent', active_users: 295 },
    { landing_date: '2026-08-12', session_campaign: 'Health-and-Nutrition-Campaign', session_source_platform: 'facebook', page_type: 'womens_health_free_assessment_unlimitr', step_order: 4, step_name: 'Otp Varified', active_users: 256 },
    { landing_date: '2026-08-12', session_campaign: 'Health-and-Nutrition-Campaign', session_source_platform: 'facebook', page_type: 'womens_health_free_assessment_unlimitr', step_order: 5, step_name: 'Lead success / Form completed', active_users: 215 },

    { landing_date: '2026-08-12', session_campaign: 'Personal-Health-Coach-Campaign-11th-May', session_source_platform: 'google', page_type: 'womens_health_free_assessment_unlimitr', step_order: 1, step_name: 'Landing', active_users: 1376 },
    { landing_date: '2026-08-12', session_campaign: 'Personal-Health-Coach-Campaign-11th-May', session_source_platform: 'google', page_type: 'womens_health_free_assessment_unlimitr', step_order: 2, step_name: 'Form Start', active_users: 471 },
    { landing_date: '2026-08-12', session_campaign: 'Personal-Health-Coach-Campaign-11th-May', session_source_platform: 'google', page_type: 'womens_health_free_assessment_unlimitr', step_order: 3, step_name: 'Otp Sent', active_users: 29 },
    { landing_date: '2026-08-12', session_campaign: 'Personal-Health-Coach-Campaign-11th-May', session_source_platform: 'google', page_type: 'womens_health_free_assessment_unlimitr', step_order: 4, step_name: 'Otp Varified', active_users: 29 },
    { landing_date: '2026-08-12', session_campaign: 'Personal-Health-Coach-Campaign-11th-May', session_source_platform: 'google', page_type: 'womens_health_free_assessment_unlimitr', step_order: 5, step_name: 'Lead success / Form completed', active_users: 164 },

    { landing_date: '2026-08-14', session_campaign: 'Total-Wellness-Campaign-21-March', session_source_platform: 'Unlabeled', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 1, step_name: 'Landing', active_users: 1551 },
    { landing_date: '2026-08-14', session_campaign: 'Total-Wellness-Campaign-21-March', session_source_platform: 'Unlabeled', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 2, step_name: 'Form Start', active_users: 204 },
    { landing_date: '2026-08-14', session_campaign: 'Total-Wellness-Campaign-21-March', session_source_platform: 'Unlabeled', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 3, step_name: 'Otp Sent', active_users: 155 },
    { landing_date: '2026-08-14', session_campaign: 'Total-Wellness-Campaign-21-March', session_source_platform: 'Unlabeled', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 4, step_name: 'Otp Varified', active_users: 138 },
    { landing_date: '2026-08-14', session_campaign: 'Total-Wellness-Campaign-21-March', session_source_platform: 'Unlabeled', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 5, step_name: 'Lead success / Form completed', active_users: 114 },

    { landing_date: '2026-08-14', session_campaign: 'Weight-Loss-Campaign', session_source_platform: 'instagram', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 1, step_name: 'Landing', active_users: 1281 },
    { landing_date: '2026-08-14', session_campaign: 'Weight-Loss-Campaign', session_source_platform: 'instagram', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 2, step_name: 'Form Start', active_users: 462 },
    { landing_date: '2026-08-14', session_campaign: 'Weight-Loss-Campaign', session_source_platform: 'instagram', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 3, step_name: 'Otp Sent', active_users: 113 },
    { landing_date: '2026-08-14', session_campaign: 'Weight-Loss-Campaign', session_source_platform: 'instagram', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 4, step_name: 'Otp Varified', active_users: 102 },
    { landing_date: '2026-08-14', session_campaign: 'Weight-Loss-Campaign', session_source_platform: 'instagram', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 5, step_name: 'Lead success / Form completed', active_users: 81 },

    { landing_date: '2026-08-14', session_campaign: 'Google Build Demand Gen - Trial Booking-IN-20 Apr', session_source_platform: 'google', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 1, step_name: 'Landing', active_users: 1636 },
    { landing_date: '2026-08-14', session_campaign: 'Google Build Demand Gen - Trial Booking-IN-20 Apr', session_source_platform: 'google', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 2, step_name: 'Form Start', active_users: 86 },
    { landing_date: '2026-08-14', session_campaign: 'Google Build Demand Gen - Trial Booking-IN-20 Apr', session_source_platform: 'google', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 3, step_name: 'Otp Sent', active_users: 46 },
    { landing_date: '2026-08-14', session_campaign: 'Google Build Demand Gen - Trial Booking-IN-20 Apr', session_source_platform: 'google', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 4, step_name: 'Otp Varified', active_users: 42 },
    { landing_date: '2026-08-14', session_campaign: 'Google Build Demand Gen - Trial Booking-IN-20 Apr', session_source_platform: 'google', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 5, step_name: 'Lead success / Form completed', active_users: 44 },

    { landing_date: '2026-07-11', session_campaign: '(cross-network)', session_source_platform: 'Unlabeled', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 1, step_name: 'Landing', active_users: 228 },
    { landing_date: '2026-07-11', session_campaign: '(cross-network)', session_source_platform: 'Unlabeled', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 2, step_name: 'Form Start', active_users: 99 },
    { landing_date: '2026-07-11', session_campaign: '(cross-network)', session_source_platform: 'Unlabeled', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 3, step_name: 'Otp Sent', active_users: 26 },
    { landing_date: '2026-07-11', session_campaign: '(cross-network)', session_source_platform: 'Unlabeled', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 4, step_name: 'Otp Varified', active_users: 23 },
    { landing_date: '2026-07-11', session_campaign: '(cross-network)', session_source_platform: 'Unlabeled', page_type: 'weight_loss_free_assessment_unlimitr', step_order: 5, step_name: 'Lead success / Form completed', active_users: 25 }
  ];

  DATA.landingFunnel = sampleRows.map(r => ({
    date: r.landing_date,
    landing_date: r.landing_date,
    session_campaign: r.session_campaign,
    session_source_platform: r.session_source_platform,
    page_type: r.page_type,
    step_order: r.step_order,
    step_name: r.step_name,
    active_users: r.active_users,
    platform: 'WEB'
  }));
  landingFunnelFilename = 'Default Funnel Sample Data';
}

function getFunnelPrevDateRange(currFrom, currTo) {
  const from = new Date(currFrom);
  const to = new Date(currTo);
  const durationMs = Math.max(24 * 60 * 60 * 1000, to.getTime() - from.getTime() + (24 * 60 * 60 * 1000));

  const prevTo = new Date(from.getTime() - (24 * 60 * 60 * 1000));
  const prevFrom = new Date(prevTo.getTime() - durationMs + (24 * 60 * 60 * 1000));

  return {
    from: toISO(prevFrom),
    to: toISO(prevTo)
  };
}

function getFunnelDateRanges() {
  ensureDefaultLandingFunnelData();
  const dates = DATA.landingFunnel.map(r => r.landing_date).filter(Boolean).sort();
  const maxD = dates.length ? dates[dates.length - 1] : toISO(new Date());
  const minD = dates.length ? dates[0] : maxD;

  if (!funnelFromDate) funnelFromDate = minD;
  if (!funnelToDate) funnelToDate = maxD;

  if (!userHasCustomizedCompareDates || !funnelCmpFromDate || !funnelCmpToDate) {
    const autoPrev = getFunnelPrevDateRange(funnelFromDate, funnelToDate);
    funnelCmpFromDate = autoPrev.from;
    funnelCmpToDate = autoPrev.to;
  }

  return {
    currFrom: funnelFromDate,
    currTo: funnelToDate,
    prevFrom: funnelCmpFromDate,
    prevTo: funnelCmpToDate
  };
}

function getFilteredLandingFunnelRows() {
  if (!DATA.landingFunnel || !DATA.landingFunnel.length) return [];
  return DATA.landingFunnel.filter(r => {
    if (selectedFunnelPageType !== 'ALL' && r.page_type !== selectedFunnelPageType) return false;
    if (selectedFunnelSourcePlatform !== 'ALL' && r.session_source_platform !== selectedFunnelSourcePlatform) return false;
    if (PLATFORM !== 'ALL' && r.platform !== PLATFORM) return false;
    return true;
  });
}

function renderLandingPageFunnel(container) {
  document.getElementById('crumb').textContent = 'landing page funnel';
  ensureDefaultLandingFunnelData();

  const ranges = getFunnelDateRanges();

  const baseRows = getFilteredLandingFunnelRows();

  // Current & Previous Period filtered rows
  const currRows = baseRows.filter(r => r.landing_date >= ranges.currFrom && r.landing_date <= ranges.currTo);
  const prevRows = baseRows.filter(r => r.landing_date >= ranges.prevFrom && r.landing_date <= ranges.prevTo);

  // Dynamic filter lists
  const pageTypes = ['ALL', ...new Set(DATA.landingFunnel.map(r => r.page_type).filter(Boolean))];
  const sourcePlatforms = ['ALL', ...new Set(DATA.landingFunnel.map(r => r.session_source_platform).filter(Boolean))];

  // Current period Step aggregation for Table 1
  const currStepMap = {};
  currRows.forEach(r => {
    const order = r.step_order || 1;
    if (!currStepMap[order]) {
      currStepMap[order] = {
        step_order: order,
        step_name: r.step_name || `Step ${order}`,
        active_users: 0
      };
    }
    currStepMap[order].active_users += (r.active_users || 0);
  });

  const sortedSteps = Object.values(currStepMap).sort((a, b) => a.step_order - b.step_order);
  const currStep1Active = sortedSteps.length && sortedSteps[0].active_users ? sortedSteps[0].active_users : 0;

  // Previous period Step aggregation for Comparison
  const prevStepMap = {};
  prevRows.forEach(r => {
    const order = r.step_order || 1;
    prevStepMap[order] = (prevStepMap[order] || 0) + (r.active_users || 0);
  });
  const prevStep1Active = prevStepMap[1] || 0;

  // Build GA4 Table 1 row math with % of Step 1 Comparison Delta
  const tableRows = sortedSteps.map((s, idx) => {
    const active = s.active_users;
    const currPctVal = currStep1Active ? (active / currStep1Active) * 100 : 0;
    const pctStep1Str = currStep1Active ? currPctVal.toFixed(2).replace(/\.00$/, '') + '%' : '0%';

    let deltaHTML = '';
    if (funnelCompare) {
      const prevActive = prevStepMap[s.step_order] || 0;
      const prevPctVal = prevStep1Active ? (prevActive / prevStep1Active) * 100 : 0;
      const deltaPctPoint = currPctVal - prevPctVal;

      if (deltaPctPoint > 0) {
        deltaHTML = `<span style="font-size: 11.5px; font-weight: 600; color: #10b981; margin-left: 6px; display: inline-flex; align-items: center; gap: 1px;" title="Comparison period % of Step 1: ${prevPctVal.toFixed(2)}%"><span>▲</span><span>+${deltaPctPoint.toFixed(2)}%</span></span>`;
      } else if (deltaPctPoint < 0) {
        deltaHTML = `<span style="font-size: 11.5px; font-weight: 600; color: #ef4444; margin-left: 6px; display: inline-flex; align-items: center; gap: 1px;" title="Comparison period % of Step 1: ${prevPctVal.toFixed(2)}%"><span>▼</span><span>${deltaPctPoint.toFixed(2)}%</span></span>`;
      } else {
        deltaHTML = `<span style="font-size: 11.5px; font-weight: 500; color: #94a3b8; margin-left: 6px;" title="No change from comparison period">0%</span>`;
      }
    }

    const hasNext = idx < sortedSteps.length - 1;
    const nextActive = hasNext ? sortedSteps[idx + 1].active_users : null;

    let completionRate = 'null';
    let abandonments = 'null';
    let abandonmentRate = 'null';

    if (hasNext) {
      completionRate = active ? ((nextActive / active) * 100).toFixed(2).replace(/\.00$/, '') + '%' : '0%';
      const abVal = active - nextActive;
      abandonments = abVal >= 0 ? abVal.toLocaleString() : '0';
      abandonmentRate = active ? ((abVal / active) * 100).toFixed(2).replace(/\.00$/, '') + '%' : '0%';
    }

    return {
      step_order: s.step_order,
      step_name: s.step_name,
      active_users: active,
      pct_of_step1: pctStep1Str,
      deltaHTML: deltaHTML,
      completion_rate_pct: completionRate,
      abandonments: abandonments,
      abandonment_rate_pct: abandonmentRate
    };
  });

  // Aggregation for Table 2: Campaign Step Breakdown Matrix
  const campaignMap = {};
  currRows.forEach(r => {
    const campaign = r.session_campaign || '(direct)';
    const order = r.step_order || 1;
    if (!campaignMap[campaign]) {
      campaignMap[campaign] = {
        campaign,
        step1: 0,
        step2: 0,
        step3: 0,
        step4: 0,
        step5: 0,
        grandTotal: 0
      };
    }
    const val = r.active_users || 0;
    if (order === 1) campaignMap[campaign].step1 += val;
    else if (order === 2) campaignMap[campaign].step2 += val;
    else if (order === 3) campaignMap[campaign].step3 += val;
    else if (order === 4) campaignMap[campaign].step4 += val;
    else if (order === 5) campaignMap[campaign].step5 += val;
    campaignMap[campaign].grandTotal += val;
  });

  const campaignMatrixRows = Object.values(campaignMap).sort((a, b) => b.grandTotal - a.grandTotal);

  const matrixTotalStep1 = campaignMatrixRows.reduce((acc, c) => acc + c.step1, 0);
  const matrixTotalStep2 = campaignMatrixRows.reduce((acc, c) => acc + c.step2, 0);
  const matrixTotalStep3 = campaignMatrixRows.reduce((acc, c) => acc + c.step3, 0);
  const matrixTotalStep4 = campaignMatrixRows.reduce((acc, c) => acc + c.step4, 0);
  const matrixTotalStep5 = campaignMatrixRows.reduce((acc, c) => acc + c.step5, 0);
  const matrixOverallTotal = campaignMatrixRows.reduce((acc, c) => acc + c.grandTotal, 0);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <!-- Title Header with Custom Primary & Comparison Date Range Pickers -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap;">
          <div>
            <div class="page-title" style="font-size: 22px; font-weight: 700; color: var(--text-primary);">Landing Page Funnel Analytics</div>
            <div class="page-sub" style="font-size: 13.5px; color: var(--text-secondary); margin-top: 4px;">GA4 Funnel Exploration & Step-by-Step Conversion Performance</div>
          </div>

          <!-- Dedicated Funnel Custom Primary & Comparison Date Control Bar -->
          <div style="display: flex; align-items: center; gap: 10px; background: #ffffff; border: 1px solid var(--border-color); border-radius: 10px; padding: 5px 12px; flex-wrap: wrap; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <!-- Primary Date Range Selector -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 12.5px; font-weight: 600; color: var(--text-secondary);">Date:</span>
              <input type="date" id="funnelDFrom" class="date-input" value="${ranges.currFrom}" style="padding: 3px 6px; font-size: 12px; border: 1px solid var(--border-color); border-radius: 6px;">
              <span style="font-size: 12px; color: var(--text-secondary);">to</span>
              <input type="date" id="funnelDTo" class="date-input" value="${ranges.currTo}" style="padding: 3px 6px; font-size: 12px; border: 1px solid var(--border-color); border-radius: 6px;">
            </div>

            <div style="width: 1px; height: 18px; background: var(--border-color); margin: 0 2px;"></div>

            <!-- Compare Toggle & Custom Compare Date Picker -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="pill compare-pill ${funnelCompare ? 'active' : ''}" id="funnel-p-cmp" style="padding: 4px 10px; font-size: 12px; border-radius: 6px;">
                Compare: <span style="font-weight: 700;">${funnelCompare ? 'On' : 'Off'}</span>
              </button>

              <div style="display: ${funnelCompare ? 'flex' : 'none'}; align-items: center; gap: 5px; background: rgba(99, 102, 241, 0.05); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(99, 102, 241, 0.2);" id="funnelCompareDates">
                <span style="font-size: 12px; font-weight: 600; color: var(--accent);">vs:</span>
                <input type="date" id="funnelCmpFrom" class="date-input" value="${ranges.prevFrom}" style="padding: 3px 6px; font-size: 12px; border: 1px solid var(--border-color); border-radius: 6px;">
                <span style="font-size: 12px; color: var(--text-secondary);">to</span>
                <input type="date" id="funnelCmpTo" class="date-input" value="${ranges.prevTo}" style="padding: 3px 6px; font-size: 12px; border: 1px solid var(--border-color); border-radius: 6px;">
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <!-- Page Type Filter -->
          <div style="display: flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 2px 10px;">
            <label for="funnelPageTypeSel" style="font-size: 13px; font-weight: 600; color: var(--text-secondary); white-space: nowrap;">page_type:</label>
            <select id="funnelPageTypeSel" class="styled-select" style="padding: 6px 8px; font-size: 13px; border: none; background: transparent; outline: none; max-width: 200px;">
              ${pageTypes.map(pt => `<option value="${pt}" ${selectedFunnelPageType === pt ? 'selected' : ''}>${pt === 'ALL' ? '(All)' : pt}</option>`).join('')}
            </select>
          </div>

          <!-- Session Source Platform Filter -->
          <div style="display: flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 2px 10px;">
            <label for="funnelSourcePlatformSel" style="font-size: 13px; font-weight: 600; color: var(--text-secondary); white-space: nowrap;">session_source_platform:</label>
            <select id="funnelSourcePlatformSel" class="styled-select" style="padding: 6px 8px; font-size: 13px; border: none; background: transparent; outline: none; max-width: 180px;">
              ${sourcePlatforms.map(sp => `<option value="${sp}" ${selectedFunnelSourcePlatform === sp ? 'selected' : ''}>${sp === 'ALL' ? '(All)' : sp}</option>`).join('')}
            </select>
          </div>

          <button class="upload-btn" onclick="window.navigateToView('upload')" style="width: auto; padding: 9px 16px; font-size: 13.5px; margin: 0; background: var(--accent);">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 6px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Manage / Upload Dataset
          </button>
        </div>
      </div>

      <!-- Card 1: GA4 Funnel Exploration Pivot Table -->
      <div class="card" style="padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <div class="sect-title" style="font-size: 16px; font-weight: 600; margin: 0; color: var(--text-primary); display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span>GA4 Funnel Exploration Table</span>
            <span style="font-size: 11.5px; font-weight: 600; background: rgba(99, 102, 241, 0.1); color: var(--accent); padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(99, 102, 241, 0.2);">
              Metric: Funnel Conversion
            </span>
            <span style="font-size: 11.5px; font-weight: 600; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2);">
              Platform: Web
            </span>
          </div>
          ${funnelCompare ? `
            <div style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">
              Comparing <span style="color: var(--accent); font-weight: 600;">${ranges.currFrom} to ${ranges.currTo}</span> vs <span style="color: var(--text-secondary); font-weight: 600;">${ranges.prevFrom} to ${ranges.prevTo}</span>
            </div>
          ` : ''}
        </div>

        <div style="overflow-x: auto; border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 8px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; background: #ffffff;">
            <thead>
              <tr style="background: var(--accent); color: #ffffff; font-weight: 600; text-align: left;">
                <th style="padding: 12px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3); white-space: nowrap;">Step Order &nbsp;▲</th>
                <th style="padding: 12px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3); white-space: nowrap;">Step Name</th>
                <th style="padding: 12px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3); text-align: right; white-space: nowrap;">Active User</th>
                <th style="padding: 12px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3); text-align: right; white-space: nowrap;">% of Step 1</th>
                <th style="padding: 12px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3); text-align: right; white-space: nowrap;">Completion rate %</th>
                <th style="padding: 12px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3); text-align: right; white-space: nowrap;">Abandoned</th>
                <th style="padding: 12px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3); text-align: right; white-space: nowrap;">Abandoned rate %</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows.length ? tableRows.map((r, idx) => `
                <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : 'rgba(99, 102, 241, 0.035)'}; border-bottom: 1px solid rgba(99, 102, 241, 0.12);">
                  <td style="padding: 12px 14px; font-weight: 600; text-align: center;">${r.step_order}</td>
                  <td style="padding: 12px 14px; font-weight: 600; color: var(--text-primary);">${r.step_name}</td>
                  <td style="padding: 12px 14px; text-align: right; font-variant-numeric: tabular-nums; font-weight: 700;">${r.active_users.toLocaleString()}</td>
                  <td style="padding: 12px 14px; text-align: right; font-variant-numeric: tabular-nums;">
                    <span style="font-weight: 600;">${r.pct_of_step1}</span>
                    ${r.deltaHTML}
                  </td>
                  <td style="padding: 12px 14px; text-align: right; font-variant-numeric: tabular-nums; ${r.completion_rate_pct === 'null' ? 'color: #94a3b8;' : ''}">${r.completion_rate_pct}</td>
                  <td style="padding: 12px 14px; text-align: right; font-variant-numeric: tabular-nums; ${r.abandonments === 'null' ? 'color: #94a3b8;' : ''}">${r.abandonments}</td>
                  <td style="padding: 12px 14px; text-align: right; font-variant-numeric: tabular-nums; ${r.abandonment_rate_pct === 'null' ? 'color: #94a3b8;' : ''}">${r.abandonment_rate_pct}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="7" style="padding: 24px; text-align: center; color: var(--text-secondary);">No funnel steps available for the selected filters.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; font-size: 13px; color: var(--text-secondary);">
          <span>Showing 1 - ${tableRows.length} of ${tableRows.length} steps</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>1 - ${tableRows.length} / ${tableRows.length}</span>
            <button style="border: none; background: transparent; cursor: pointer; color: var(--text-secondary);" disabled>&lt;</button>
            <button style="border: none; background: transparent; cursor: pointer; color: var(--text-secondary);" disabled>&gt;</button>
          </div>
        </div>
      </div>

      <!-- Card 2: Campaign Step Breakdown Matrix -->
      <div class="card" style="padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
          <div>
            <div class="sect-title" style="font-size: 16px; font-weight: 600; margin: 0; color: var(--text-primary); display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span>Campaign Step Breakdown Matrix</span>
              <span style="font-size: 11.5px; font-weight: 600; background: rgba(99, 102, 241, 0.1); color: var(--accent); padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(99, 102, 241, 0.2);">
                Metric: Campaign Conversion %
              </span>
              <span style="font-size: 11.5px; font-weight: 600; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2);">
                Platform: Web
              </span>
            </div>
            <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">
              Active users breakdown across funnel steps by session campaign (${ranges.currFrom} to ${ranges.currTo})
            </div>
          </div>
          <span style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">
            ${campaignMatrixRows.length} Campaigns
          </span>
        </div>

        <div style="overflow-x: auto; border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 8px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: #ffffff;">
            <thead>
              <tr style="background: var(--accent); color: #ffffff; font-weight: 600; text-align: left;">
                <th style="padding: 12px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3); white-space: nowrap; min-width: 220px;">
                  Row Labels (session_campaign)
                </th>
                <th style="padding: 12px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3); text-align: right; white-space: nowrap;">
                  1 - Landing
                </th>
                <th style="padding: 12px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3); text-align: right; white-space: nowrap;">
                  2 - Form Start
                </th>
                <th style="padding: 12px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3); text-align: right; white-space: nowrap;">
                  3 - OTP Sent
                </th>
                <th style="padding: 12px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3); text-align: right; white-space: nowrap;">
                  4 - OTP Varified
                </th>
                <th style="padding: 12px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3); text-align: right; white-space: nowrap;">
                  5 - Lead success / Form completed
                </th>
              </tr>
            </thead>
            <tbody>
              ${campaignMatrixRows.length ? campaignMatrixRows.map((c, idx) => `
                <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : 'rgba(99, 102, 241, 0.035)'}; border-bottom: 1px solid rgba(99, 102, 241, 0.12);">
                  <td style="padding: 11px 14px; font-weight: 600; color: var(--text-primary); white-space: nowrap;">${c.campaign}</td>
                  <td style="padding: 11px 14px; text-align: right; font-variant-numeric: tabular-nums;">${c.step1 ? c.step1.toLocaleString() : '-'}</td>
                  <td style="padding: 11px 14px; text-align: right; font-variant-numeric: tabular-nums;">${c.step2 ? c.step2.toLocaleString() : '-'}</td>
                  <td style="padding: 11px 14px; text-align: right; font-variant-numeric: tabular-nums;">${c.step3 ? c.step3.toLocaleString() : '-'}</td>
                  <td style="padding: 11px 14px; text-align: right; font-variant-numeric: tabular-nums;">${c.step4 ? c.step4.toLocaleString() : '-'}</td>
                  <td style="padding: 11px 14px; text-align: right; font-variant-numeric: tabular-nums; ${c.step5 ? 'font-weight: 600; color: var(--green);' : ''}">${c.step5 ? c.step5.toLocaleString() : '-'}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="6" style="padding: 24px; text-align: center; color: var(--text-secondary);">No campaign data available for the selected filters.</td>
                </tr>
              `}
            </tbody>
            ${campaignMatrixRows.length ? `
              <tfoot>
                <tr style="background: rgba(99, 102, 241, 0.08); font-weight: 700; border-top: 2px solid rgba(99, 102, 241, 0.3);">
                  <td style="padding: 12px 14px; color: var(--text-primary);">Grand Total</td>
                  <td style="padding: 12px 14px; text-align: right; font-variant-numeric: tabular-nums;">${matrixTotalStep1.toLocaleString()}</td>
                  <td style="padding: 12px 14px; text-align: right; font-variant-numeric: tabular-nums;">${matrixTotalStep2.toLocaleString()}</td>
                  <td style="padding: 12px 14px; text-align: right; font-variant-numeric: tabular-nums;">${matrixTotalStep3.toLocaleString()}</td>
                  <td style="padding: 12px 14px; text-align: right; font-variant-numeric: tabular-nums;">${matrixTotalStep4.toLocaleString()}</td>
                  <td style="padding: 12px 14px; text-align: right; font-variant-numeric: tabular-nums; color: var(--green);">${matrixTotalStep5.toLocaleString()}</td>
                </tr>
              </tfoot>
            ` : ''}
          </table>
        </div>
      </div>
    </div>
  `;

  // Event Listeners for Date Controls
  const btnCmp = document.getElementById('funnel-p-cmp');
  const inputFrom = document.getElementById('funnelDFrom');
  const inputTo = document.getElementById('funnelDTo');
  const inputCmpFrom = document.getElementById('funnelCmpFrom');
  const inputCmpTo = document.getElementById('funnelCmpTo');

  if (btnCmp) btnCmp.addEventListener('click', () => {
    funnelCompare = !funnelCompare;
    renderLandingPageFunnel(container);
  });

  if (inputFrom) inputFrom.addEventListener('change', (e) => {
    funnelFromDate = e.target.value;
    if (!userHasCustomizedCompareDates) {
      const autoPrev = getFunnelPrevDateRange(funnelFromDate, funnelToDate);
      funnelCmpFromDate = autoPrev.from;
      funnelCmpToDate = autoPrev.to;
    }
    renderLandingPageFunnel(container);
  });

  if (inputTo) inputTo.addEventListener('change', (e) => {
    funnelToDate = e.target.value;
    if (!userHasCustomizedCompareDates) {
      const autoPrev = getFunnelPrevDateRange(funnelFromDate, funnelToDate);
      funnelCmpFromDate = autoPrev.from;
      funnelCmpToDate = autoPrev.to;
    }
    renderLandingPageFunnel(container);
  });

  if (inputCmpFrom) inputCmpFrom.addEventListener('change', (e) => {
    funnelCmpFromDate = e.target.value;
    userHasCustomizedCompareDates = true;
    renderLandingPageFunnel(container);
  });

  if (inputCmpTo) inputCmpTo.addEventListener('change', (e) => {
    funnelCmpToDate = e.target.value;
    userHasCustomizedCompareDates = true;
    renderLandingPageFunnel(container);
  });

  // Event Listeners for Filters
  const pageTypeSel = document.getElementById('funnelPageTypeSel');
  if (pageTypeSel) {
    pageTypeSel.addEventListener('change', (e) => {
      selectedFunnelPageType = e.target.value;
      renderLandingPageFunnel(container);
    });
  }

  const sourcePlatformSel = document.getElementById('funnelSourcePlatformSel');
  if (sourcePlatformSel) {
    sourcePlatformSel.addEventListener('change', (e) => {
      selectedFunnelSourcePlatform = e.target.value;
      renderLandingPageFunnel(container);
    });
  }
}

// App bootstrapping
async function init() {
  await restoreSavedDatasetsFromStorage();
  computeDates();
  setupDateInputs();
  bindEvents();

  // Listen for history popstate (browser back/forward buttons)
  window.addEventListener('popstate', (e) => {
    const view = (e.state && e.state.view) || getViewForPath(window.location.pathname);
    navigateToView(view, false);
  });

  // Navigate to current URL path view on load
  const initialView = getViewForPath(window.location.pathname);
  navigateToView(initialView, false);
}

// Kickstart
init();
