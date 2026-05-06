const DATE_DISPLAY_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const DATE_ISO_RE = /^(\d{4})-(\d{2})-(\d{2})/;

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";

  const displayMatch = DATE_DISPLAY_RE.exec(value);
  if (displayMatch) return value;

  const isoMatch = DATE_ISO_RE.exec(value);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function parseDisplayDateToIso(value: string | null | undefined): string | null {
  const cleanValue = String(value ?? "").trim();
  if (!cleanValue) return null;

  const isoMatch = DATE_ISO_RE.exec(cleanValue);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}-${month}-${day}`;
  }

  const displayMatch = DATE_DISPLAY_RE.exec(cleanValue);
  if (!displayMatch) return null;

  const [, day, month, year] = displayMatch;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  const isValid =
    parsed.getFullYear() === Number(year) &&
    parsed.getMonth() === Number(month) - 1 &&
    parsed.getDate() === Number(day);

  return isValid ? `${year}-${month}-${day}` : null;
}

export function isValidDisplayDate(value: string | null | undefined): boolean {
  const cleanValue = String(value ?? "").trim();
  return !cleanValue || parseDisplayDateToIso(cleanValue) !== null;
}
