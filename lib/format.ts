export const fmtNum = (n: number) => n.toLocaleString("en-US");

const pad = (n: number) => String(n).padStart(2, "0");
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** "YYYY-MM-DD" is read as a local date (not UTC) so it never shifts a day. */
export const toDate = (v: string | Date): Date => {
  if (v instanceof Date) return v;
  const m = DATE_ONLY.exec(v);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(v);
};
export const dayKey = (v: string | Date) => {
  const d = toDate(v);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const isToday = (v: string | Date) => dayKey(v) === dayKey(new Date());

const time = new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const short = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" });
const full = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }); // พ.ศ.

export const fmtTime = (v: string | Date) => time.format(toDate(v));        // 21:42
export const fmtDate = (v: string | Date) => short.format(toDate(v));       // 29 ต.ค.
export const fmtFullDate = (v: string | Date) => full.format(toDate(v));    // 29 ต.ค. 2569

/** "ปิยะ สุขใจ" → "คุณปิยะ ส." (hides the surname on the home screen). */
export function maskName(name: string) {
  const [first = "", last] = name.trim().split(/\s+/);
  const initial = last ? [...last].find((c) => !"เแโใไ".includes(c)) : undefined;
  return `คุณ${first}${initial ? ` ${initial}.` : ""}`;
}
