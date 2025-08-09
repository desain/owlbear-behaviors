export async function onRequest({ request, params }) {
    const target = new URL(`https://your-new-worker-url/${params.path || ""}`);
    return fetch(target, request);
}
