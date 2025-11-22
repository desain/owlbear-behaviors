import { isObject } from "owlbear-utils";

const SPREADSHEET_REGEX =
    /^https?:\/\/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/;

function getSheetsApiUrl(spreadsheetId: string, sheet: string, cell: string) {
    // create Cloudflare Worker API request URL
    return `/api/sheets?spreadsheetId=${encodeURIComponent(
        spreadsheetId,
    )}&sheet=${encodeURIComponent(sheet)}&cell=${encodeURIComponent(cell)}`;
}

export const Gapi = {
    getSpreadsheetId: (url: string): string =>
        SPREADSHEET_REGEX.exec(url)?.[1] ?? url,

    getSheetsValue: async (
        spreadsheetId: string,
        sheet: string,
        cell: string,
    ): Promise<string> => {
        try {
            const response = await fetch(
                getSheetsApiUrl(spreadsheetId, sheet, cell),
                {
                    signal: AbortSignal.timeout(5000),
                },
            );
            const data: unknown = await response.json();
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

    writeSheetsValue: async (
        spreadsheetId: string,
        sheet: string,
        cell: string,
        contents: unknown,
    ) => {
        try {
            const response = await fetch(
                getSheetsApiUrl(spreadsheetId, sheet, cell),
                {
                    method: "PUT",
                    body: JSON.stringify(contents),
                    signal: AbortSignal.timeout(5000),
                },
            );
            if (!response.ok) {
                throw Error("Received error response from Sheets");
            }
        } catch (e) {
            console.warn("Error writing Google Sheets value", e);
        }
    },
};
