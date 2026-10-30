import { demoTrips } from "../data/demoTrips";

const STORAGE_KEY = "roam-trips-v1";

export function loadTrips() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (storedValue !== null) {
      const parsedValue = JSON.parse(storedValue);
      return Array.isArray(parsedValue) ? parsedValue : [...demoTrips];
    }
  } catch (error) {
    console.error("Could not read saved Roam trips:", error);
  }

  return [...demoTrips];
}

export function saveTrips(trips) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    return true;
  } catch (error) {
    console.error("Could not save Roam trips:", error);
    return false;
  }
}
