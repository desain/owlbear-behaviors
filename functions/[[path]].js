/**
 * Proxy to Workers, preserving CORS headers. See README
 */
export function onRequest({ request, params }) {
    const path = Array.isArray(params.path)
        ? params.path.join("/")
        : params.path || "";
    const url = new URL(request.url);

    const targetUrl = `https://owlbear-behaviors.nicholassdesai.workers.dev/${path}${url.search}`;

    return fetch(targetUrl, request);
}
