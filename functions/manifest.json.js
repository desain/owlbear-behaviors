export async function onRequest(context) {
    return new Response(null, {
        status: 302,
        headers: {
            Location:
                "https://owlbear-behaviors.nicholassdesai.workers.dev//manifest.json",
            "Access-Control-Allow-Origin": "*",
        },
    });
}
