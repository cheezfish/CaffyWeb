# softlanding

Cloudflare Worker `softlanding` (account: the personal Cloudflare account) serving:

- `getcaffy.com/for/<slug>`: SEO landing pages built from the Baserow table 532 (`baserow.getcaffy.com`).
- `getcaffy.com/sitemap.xml`: sitemap of all published landing pages.

Routes are zone routes (`getcaffy.com/for/*`, `getcaffy.com/sitemap.xml`) and run in front of the Pages site.

## Files
| File | What |
|---|---|
| `worker.js` | The deployed Worker (router, Baserow fetch, sitemap, related pages, and the v2 template inlined). |
| `template.js` | The v2 page template as a module (`renderPage`); `worker.js` contains the same code with `export` removed. |
| `worker.v1-original.js` | The previous Worker before the redesign (2026-10-26), for reference. It predates the Access service-token headers. |
| `render-local.mjs` | Render one page locally from a saved Baserow row. |

## Data
Baserow row fields: `Slug`, `H1_Title`, `Meta_Title`, `Meta_Desc`, `Body_Text` (HTML), `FAQ_JSON`, `Status` (Published).

## Secrets (Worker secrets, never in this repo)
- `BASEROW_TOKEN`: Baserow database token.
- `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`: Cloudflare Access service token `softlanding-worker`.
  `baserow.getcaffy.com` is behind Cloudflare Access; without these headers the Worker gets the Access login page
  instead of JSON and the pages and sitemap return 500.

## Deploy
Upload `worker.js` as module `worker.js` with `keep_bindings: ["secret_text"]` so the secrets survive
(API `PUT /accounts/<id>/workers/scripts/softlanding`, or `wrangler deploy` with a config that keeps the secrets).

## Switches
- default: v2 template, cacheable (`max-age=300, s-maxage=900`).
- `?v=1`: previous template, `noindex`, not cached (rollback and comparison).
- `?v=2`: same as default but `noindex` and not cached.

## Content note
The 100 page bodies are AI-written HTML. The v2 template splits the body into the headline, a pull-quote (first
sentence), a lede and numbered chapters; the how-to and FAQ wording comes from getcaffy.com/faq/ (gum and cheek,
20-30 minutes, up to three a day).
