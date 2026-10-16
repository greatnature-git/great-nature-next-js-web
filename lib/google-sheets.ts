/**
 * Sends a lead row to a Google Apps Script Web App bound to the target
 * spreadsheet (Extensions > Apps Script in the sheet itself). The script
 * owns the spreadsheet ID and appends the row with SpreadsheetApp, so this
 * client only needs the deployed /exec URL — no service account or Sheets
 * API credentials.
 */
export async function appendEnquiryRow(values: string[]): Promise<boolean> {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!scriptUrl) {
    return false;
  }

  const res = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.GOOGLE_APPS_SCRIPT_SECRET,
      sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME || "Sheet1",
      values,
    }),
  });

  if (!res.ok) {
    throw new Error(`Google Apps Script append failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (data && data.ok === false) {
    throw new Error(`Google Apps Script reported failure: ${data.error ?? "unknown error"}`);
  }

  return true;
}
