export function createTripId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `trip-${crypto.randomUUID()}`;
  }

  return `trip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getTripDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0;

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const duration = Math.round((end - start) / 86400000) + 1;

  return Number.isFinite(duration) && duration > 0 ? duration : 0;
}

export function formatTripDates(startDate, endDate) {
  if (!startDate || !endDate) return "Dates not set";

  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  const startText = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endText = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${startText} – ${endText}, ${end.getFullYear()}`;
}
