// Events are shown in West Africa Time regardless of the visitor's locale,
// so the server and browser render identical strings.
const TZ = "Africa/Lagos";

const month = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: TZ });
const day = new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: TZ });
const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ });
const time = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ });

export const eventMonth = (iso: string) => month.format(new Date(iso)).toUpperCase();
export const eventDay = (iso: string) => day.format(new Date(iso));
export const eventDate = (iso: string) => weekday.format(new Date(iso));
export const eventTimeRange = (start: string, end: string) =>
  `${time.format(new Date(start))} – ${time.format(new Date(end))} WAT`;

export const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));
