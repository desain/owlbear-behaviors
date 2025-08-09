// function loadGapi(apiKey: string) {
//     return new Promise((resolve, reject) => {
//         try {
//             if (typeof apiKey !== "string") {
//                 throw Error("Invalid GAPI key");
//             }

//             gapi.load(
//                 "client",
//                 () =>
//                     void gapi.client
//                         .init({
//                             apiKey,
//                             discoveryDocs: [
//                                 "https://sheets.googleapis.com/$discovery/rest?version=v4",
//                             ],
//                         })
//                         .then(resolve),
//             );
//         } catch (e) {
//             reject(e instanceof Error ? e : Error(String(e)));
//         }
//     });
// }

interface SheetsResponse {
    values: string[][];
}

function isSheetsResponse(data: unknown): data is SheetsResponse {
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

export default {
    fetch: async (request, env) => {
        const url = new URL(request.url);

        if (url.pathname.startsWith("/api/sheets")) {
            const params = url.searchParams;
            const spreadsheetId = params.get("spreadsheetId");
            const sheet = params.get("sheet");
            const cell = params.get("cell");

            if (!spreadsheetId || !sheet || !cell) {
                return new Response("Missing parameters", { status: 400 });
            }

            const range = `'${sheet.replace("'", "''")}'!${cell}`;

            try {
                const resp = await fetch(
                    new URL(
                        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
                    ),
                    {
                        headers: {
                            "X-Goog-Api-Key": env.VITE_GAPI_KEY,
                        },
                    },
                );

                const data: unknown = await resp.json();

                if (isSheetsResponse(data)) {
                    return Response.json({ contents: data.values[0]?.[0] });
                }
            } catch {
                return Response.error();
            }

            //     const response =
            //         await gapi.client.sheets.spreadsheets.values.get({
            //             spreadsheetId,
            //             range,
            //         });
            //     const result: unknown = response.result.values?.[0]?.[0];
            //     if (typeof result !== "string") {
            //         throw Error("sheets result is not string");
            //     }
            //     return Response.json({ contents: result });
        }
        return new Response(null, { status: 404 });
    },
} satisfies ExportedHandler<Env>;
