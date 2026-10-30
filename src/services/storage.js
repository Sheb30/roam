const STORAGE_KEY = "roam-app-data-v1";

export function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      trips: Array.isArray(parsed.trips) ? parsed.trips : [],
      savedPlaces: Array.isArray(parsed.savedPlaces) ? parsed.savedPlaces : [],
    };
  } catch {
    return null;
  }
}

export function saveAppData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function resetAppData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage restrictions.
  }
}
