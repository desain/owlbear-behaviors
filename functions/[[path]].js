export async function onRequest({ request, params, env, waitUntil }) {
    const targetUrl = `https://owlbear-behaviors.nicholassdesai.workers.dev/${
        params.path || ""
    }`;
    try {
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: request.headers,
            body: request.body,
            redirect: "manual",
        });

        console.log(
            `[proxy] ${request.url} → ${targetUrl} [${response.status}]`,
        );

        // clone response headers, preserve CORS only if needed
        const headers = new Headers(response.headers);

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    } catch (err) {
        console.error(`[proxy] error fetching ${targetUrl}:`, err);
        return new Response("Upstream fetch failed", { status: 502 });
    }
}
