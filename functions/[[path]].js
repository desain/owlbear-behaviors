export async function onRequest({ request, params }) {
    const path = Array.isArray(params.path)
        ? params.path.join("/")
        : params.path || "";
    const url = new URL(request.url);

    // preserve original query string
    const targetUrl = `https://owlbear-behaviors.nicholassdesai.workers.dev/${path}${url.search}`;

    const response = await fetch(targetUrl, request);
    return response;
}
