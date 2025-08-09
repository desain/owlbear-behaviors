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
                } else {
                    return Response.error();
                }
            } catch {
                return Response.error();
            }
        }
        return new Response(null, { status: 404 });
    },
} satisfies ExportedHandler<Env>;
