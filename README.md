# Pages proxy

This branch deploys to Cloudflare Pages, and proxies requests to the Cloudflare Workers version of this project.

This is done so the original URL (`https://owlbear-behaviors.pages.dev`) still works.

Requsets have to be proxied, rather than redirected, because redirects in Cloudflare don't include CORS headers.
