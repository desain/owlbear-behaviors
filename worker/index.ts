interface ValueRange {
    values: string[][];
}

function isValueRange(data: unknown): data is ValueRange {
    return (
        typeof data === "object" &&
        data !== null &&
        "values" in data &&
        Array.isArray(data.values) &&
        data.values.every(
            (row) =>
                Array.isArray(row) &&
                row.every((cell) => typeof cell === "string"),
        )
    );
}

function getSheetAndRange(url: URL): [sheet: string, range: string] {
    const params = url.searchParams;
    const spreadsheetId = params.get("spreadsheetId");
    const sheet = params.get("sheet");
    const cell = params.get("cell");

    if (!spreadsheetId || !sheet || !cell) {
        throw Error("Missing parameters");
    }

    const range = `'${sheet.replace("'", "''")}'!${cell}`;

    return [spreadsheetId, range];
}

async function getSheetsCell(
    apiKey: string,
    spreadsheetId: string,
    range: string,
): Promise<string> {
    const response = await fetch(
        new URL(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
        ),
        {
            headers: {
                "X-Goog-Api-Key": apiKey,
            },
        },
    );

    const data: unknown = await response.json();

    if (isValueRange(data) && data.values[0]?.[0]) {
        return data.values[0]?.[0];
    } else {
        throw Error("Failed to parse Sheets API response");
    }
}

async function writeSheetsCell(
    apiKey: string,
    spreadsheetId: string,
    range: string,
    contents: unknown,
) {
    return fetch(
        new URL(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
        ),
        {
            method: "PUT",
            headers: {
                "X-Goog-Api-Key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                range,
                majorDimension: "ROWS",
                values: [[contents]],
            }),
        },
    );
}

export default {
    fetch: async (request, env) => {
        const url = new URL(request.url);

        if (url.pathname.startsWith("/api/sheets")) {
            const apiKey = env.VITE_GAPI_KEY;
            try {
                const [spreadsheetId, range] = getSheetAndRange(url);

                if (request.method === "GET") {
                    const contents = await getSheetsCell(
                        apiKey,
                        spreadsheetId,
                        range,
                    );
                    return Response.json({ contents });
                } else if (request.method === "PUT") {
                    const contents = await request.json();
                    return await writeSheetsCell(
                        apiKey,
                        spreadsheetId,
                        range,
                        contents,
                    );
                }
            } catch (e) {
                if (e instanceof Error) {
                    return new Response(e.message, { status: 400 });
                }
                return Response.error();
            }
        }
        return new Response(null, { status: 404 });
    },
} satisfies ExportedHandler<Env>;
