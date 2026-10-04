// Date-times are ISO 8601 strings in UTC, and are shown in UTC.

export function formatDate(dateTime: string): string {
  return new Date(dateTime).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateTime(dateTime: string): string {
  return new Date(dateTime).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
