const STORAGE_KEY = "pixel-bakery-v1";

export function createDefaultState() {
  return {
    version: 1,
    bakeryName: "El Meatball's bakery",
    cookies: 0,
    totalCookies: 0,
    totalClicks: 0,
    buildings: {
      cursor: 0,
      grandma: 0,
      farm: 0,
      factory: 0,
      bank: 0,
      temple: 0,
    },
    upgrades: {},
    achievements: {},
    legacyPoints: 0,
    ascends: 0,
    settings: {
      sound: false,
      reducedMotion: false,
      numberFormat: "short",
    },
    timePlayed: 0,
    lastSave: Date.now(),
  };
}

export function loadState() {
  const base = createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return base;
    }
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) {
      return base;
    }
    return sanitizeState({ ...base, ...parsed });
  } catch {
    return base;
  }
}

export function saveState(state) {
  state.lastSave = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportState(state) {
  return JSON.stringify(state, null, 2);
}

export function importState(payload) {
  try {
    const parsed = JSON.parse(payload);
    if (parsed?.version !== 1) {
      return { ok: false, error: "Invalid save version." };
    }
    return { ok: true, state: sanitizeState(parsed) };
  } catch {
    return { ok: false, error: "Invalid JSON format." };
  }
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
}

function sanitizeState(state) {
  const base = createDefaultState();
  const next = { ...base, ...state };
  next.cookies = Math.max(0, Number(next.cookies) || 0);
  next.totalCookies = Math.max(0, Number(next.totalCookies) || 0);
  next.totalClicks = Math.max(0, Number(next.totalClicks) || 0);
  next.timePlayed = Math.max(0, Number(next.timePlayed) || 0);
  next.legacyPoints = Math.max(0, Number(next.legacyPoints) || 0);
  next.ascends = Math.max(0, Number(next.ascends) || 0);
  next.settings = {
    ...base.settings,
    ...next.settings,
  };
  next.buildings = { ...base.buildings, ...next.buildings };
  Object.keys(next.buildings).forEach((key) => {
    next.buildings[key] = Math.max(0, Number(next.buildings[key]) || 0);
  });
  next.upgrades = next.upgrades && typeof next.upgrades === "object" ? next.upgrades : {};
  next.achievements =
    next.achievements && typeof next.achievements === "object" ? next.achievements : {};
  return next;
}
