export async function onRequest({ request, params }) {
    const target = new URL(
        `https://owlbear-behaviors.nicholassdesai.workers.dev/${
            params.path || ""
        }`,
    );
    return fetch(target, request);
}
