export function now(): number {
  return Date.now() / 1000;
}

// Take a daystamp like "20210201" and return unixtime
export function parseDate(s: string): number {
  const y = +s.slice(0, 4);
  const m = +s.slice(4, 6);
  const d = +s.slice(6, 8);
  return Date.UTC(y, m - 1, d, 12) / 1000;
}

export function unixToBeeminderDateString(t: number): string {
  return new Date(t * 1000).toISOString().slice(0, 10).replace(/-/g, "");
}
