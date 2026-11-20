/** Format an ISO timestamp as "20 Nov, 14:30" in Asia/Kolkata local time. */
const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatLastRun(iso: string | null): string {
  if (!iso) return "Never run";
  const p = Object.fromEntries(formatter.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.day} ${p.month}, ${p.hour}:${p.minute}`;
}
