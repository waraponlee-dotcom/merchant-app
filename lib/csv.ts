type CsvValue = string | number | boolean | null | undefined;

const escapeCell = (value: CsvValue) => {
  const text = String(value ?? "");
  const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

/** UTF-8 BOM helps spreadsheet apps display Thai text correctly. */
export function toCsv(rows: readonly (readonly CsvValue[])[]) {
  return `\uFEFF${rows.map((row) => row.map(escapeCell).join(",")).join("\r\n")}`;
}
