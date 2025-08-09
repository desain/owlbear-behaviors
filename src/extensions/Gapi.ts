import { isObject } from "owlbear-utils";

const SPREADSHEET_REGEX =
    /^https?:\/\/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/;

export const Gapi = {
    getSpreadsheetId: (url: string): string =>
        SPREADSHEET_REGEX.exec(url)?.[1] ?? url,

    getSheetsValue: async (
        spreadsheetId: string,
        sheet: string,
        cell: string,
    ): Promise<string> => {
        // create Cloudflare Worker API request URL
        const url = `/api/sheets?spreadsheetId=${encodeURIComponent(
            spreadsheetId,
        )}&sheet=${encodeURIComponent(sheet)}&cell=${encodeURIComponent(cell)}`;

        try {
            const resp = await fetch(url, {
                signal: AbortSignal.timeout(5000),
            });
            const data: unknown = await resp.json();
            if (
                isObject(data) &&
                "contents" in data &&
                typeof data.contents === "string"
            ) {
                return data.contents;
            } else {
                console.warn("Unexpected Google Sheets API response", data);
                return "";
            }
        } catch (e) {
            console.warn("Error getting Google Sheets value", e);
            return "";
        }
    },
};
