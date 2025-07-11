import { gapi } from "gapi-script";
import { withTimeout } from "owlbear-utils";

const GAPI_INITIALIZED = new Promise<void>((resolve, reject) => {
    try {
        const apiKey: unknown = import.meta.env.VITE_GAPI_KEY;
        if (typeof apiKey !== "string") {
            throw Error("Invalid GAPI key");
        }

        gapi.load(
            "client",
            () =>
                void gapi.client
                    .init({
                        apiKey,
                        discoveryDocs: [
                            "https://sheets.googleapis.com/$discovery/rest?version=v4",
                        ],
                    })
                    .then(resolve),
        );
    } catch (e) {
        reject(e instanceof Error ? e : Error(String(e)));
    }
});

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
        const range = `'${sheet.replace("'", "''")}'!${cell}`;
        try {
            await withTimeout(GAPI_INITIALIZED);
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });
            const result: unknown = response.result.values?.[0]?.[0];
            if (typeof result !== "string") {
                throw Error("sheets result is not string");
            }
            return result;
        } catch (e) {
            console.warn("Error getting Google Sheets value", e);
            return "";
        }
    },
};
