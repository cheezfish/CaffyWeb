export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ===== NEW: SITEMAP ENDPOINT =====
    if (url.pathname === '/sitemap.xml') {
      return generateSitemap(env);
    }

    if (url.pathname.startsWith("/for/")) {
      const slug = url.pathname.split("/for/")[1].toLowerCase();

      // 1. UTM PERSISTENCE
      const utmSource = url.searchParams.get("utm_source") || "";
      const utmCampaign = url.searchParams.get("utm_campaign") || "";
      const utmString = `&from=${slug}${utmSource ? `&utm_source=${encodeURIComponent(utmSource)}` : ""}${utmCampaign ? `&utm_campaign=${encodeURIComponent(utmCampaign)}` : ""}`;

      const baserowUrl = `https://baserow.getcaffy.com/api/database/rows/table/532/?user_field_names=true&filter__Slug__equal=${slug}`;
      
      try {
        const baserowRes = await fetch(baserowUrl, {
          headers: { "Authorization": `Token ${env.BASEROW_TOKEN}`, "CF-Access-Client-Id": env.CF_ACCESS_CLIENT_ID, "CF-Access-Client-Secret": env.CF_ACCESS_CLIENT_SECRET }
        });
        
        const data = await baserowRes.json();
        const page = data.results[0];

        if (!page) return new Response("Page not found", { status: 404 });

        // ===== v2 template (default since 2026-10-26) =====
        // v2 is the default; ?v=1 serves the previous template (rollback switch).
        if (url.searchParams.get("v") !== "1") {
          const related = await getRelated(env, slug);
          const html2 = renderPage({ slug, page, related, utm: utmString });
          const hdr = { "Content-Type": "text/html; charset=utf-8", "X-Template": "v2" };
          if (url.searchParams.has("v")) { hdr["X-Robots-Tag"] = "noindex"; hdr["Cache-Control"] = "no-store"; }
          else { hdr["Cache-Control"] = "public, max-age=300, s-maxage=900"; }
          return new Response(html2, { headers: hdr });
        }

        let bodyContent = page.Body_Text || "";
        bodyContent = bodyContent.replace(/```html|```/g, "");
        bodyContent = bodyContent.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

        let pageTitle = page.H1_Title;

        let dynamicFaqs = [];
        try {
          dynamicFaqs = typeof page.FAQ_JSON === 'string' ? JSON.parse(page.FAQ_JSON) : (page.FAQ_JSON || []);
        } catch(e) { dynamicFaqs = []; }

        const globalFaqs = [
          { "q": "Does CAFFY contain nicotine or tobacco?", "a": "No. CAFFY is 100% nicotine-free and tobacco-free. It is a high-performance energy supplement formulated with caffeine and nootropics like Citicoline and L-theanine." },
          { "q": "How do I use and discard the pouch?", "a": "Place one pouch between your lip and gum and leave it for 20 minutes for optimal absorption. The pouch stays intact; do not chew or swallow it. When finished, discard it into the waste compartment located in the can lid." },
          { "q": "Is CAFFY suitable for use during Ramadan?", "a": "CAFFY is ideal for Suhoor (Sehri) to start your day with focus, or after Iftar to eliminate the post-meal 'food coma.' It is not intended for use during the hours of the fast." },
          { "q": "Where do you ship in the UAE?", "a": "We ship across the entire UAE, including Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah. Delivery is fast, reliable, and discreet." }
        ];
        const allFaqsForSchema = [...(Array.isArray(dynamicFaqs) ? dynamicFaqs : []), ...globalFaqs];

        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>${page.Meta_Title}</title>
            <meta name="description" content="${page.Meta_Desc}">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="canonical" href="https://getcaffy.com/for/${slug}" />

            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": ${JSON.stringify(allFaqsForSchema.map(f => ({
                "@type": "Question",
                "name": f.q || f.question,
                "acceptedAnswer": { "@type": "Answer", "text": f.a || f.answer }
              })))}
            }
            </script>

            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;700&family=Ubuntu+Mono&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://getcaffy.com/css/normalize.css">
            <link rel="stylesheet" href="https://getcaffy.com/css/skeleton.css">
            
            <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>
            <script defer src="https://analytics.getcaffy.com/script.js" data-website-id="9ff81ca6-c20a-4e0e-a512-17fc4d51f211"></script>

            <style>
              :root { --cyan: #00ffff; --dark: #0a0a0a; }
              body { background-color: var(--dark); color: #fff; font-family: 'Montserrat', sans-serif; overflow-x: hidden; margin: 0; padding: 0; }
              
              /* Logo Link */
              .logo-link { text-decoration: none; color: inherit; display: inline-block; }

              .model-section { width: 100%; height: 40vh; min-height: 300px; display: flex; align-items: center; justify-content: center; background: #000; border-bottom: 1px solid #1a1a1a; }
              .product-model { width: 100%; height: 100%; outline: none; }
              
              .seo-container { max-width: 800px; margin: 0 auto; padding: 60px 25px 120px 25px; }
              
              /* Serious Typography */
              .main-title { text-align: center; font-weight: 500; font-size: 4.5rem; line-height: 1.1; margin-bottom: 40px; letter-spacing: -1px; }
              .content h1 { font-weight: 500; font-size: 4.2rem; margin-bottom: 40px; text-align: center; color: #fff; }
              .content p { font-size: 1.6rem; color: #bbb; line-height: 1.7; margin-bottom: 30px; font-weight: 300; }
              .content strong { color: var(--cyan); font-weight: 500; }

              /* Serious Pillar Bar */
              .pillar-bar { display: flex; justify-content: space-between; margin: 80px 0; padding: 30px 0; border-top: 1px solid #222; border-bottom: 1px solid #222; }
              .pillar { text-align: center; flex: 1; }
              .pillar-value { font-weight: 500; font-size: 1.6rem; text-transform: uppercase; letter-spacing: 4px; color: #888; }

              /* CTA Section */
              .cta-box { margin-top: 80px; padding: 60px 40px; border-radius: 4px; text-align: center; background: #0d0d0d; border: 1px solid #1a1a1a; }
              .cta-box h3 { color: #fff; font-weight: 500; margin-bottom: 40px; font-size: 2.6rem; }
              
              .product-preview-grid { display: flex; gap: 30px; justify-content: center; margin-bottom: 40px; }
              .product-preview-item { flex: 1; max-width: 160px; }
              .product-preview-item img { width: 100%; height: auto; margin-bottom: 20px; }

              .button-primary { background: var(--cyan) !important; color: #000 !important; border: none !important; font-weight: 700 !important; letter-spacing: 1px; padding: 0 30px !important; height: 50px !important; line-height: 50px !important; text-transform: uppercase; font-size: 1rem; text-decoration: none; display: inline-block; cursor: pointer; }
              .button-blueberry { background: #525fe1 !important; color: #fff !important; }

              /* FAQ Style */
              .faq-section { margin-top: 120px; }
              .faq-header { font-weight: 500; font-size: 5rem; color: #222; text-transform: uppercase; letter-spacing: 5px; text-align: center; margin-bottom: 60px; }
              .faq-item { background: rgba(255,255,255,0.02); padding: 35px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #151515; }
              .faq-q { color: #fff; font-weight: 500; font-size: 1.7rem; margin-bottom: 10px; }
              .faq-a { color: #888; font-size: 1.5rem; line-height: 1.6; font-weight: 300; }

              @media (max-width: 600px) {
                .main-title, .content h1 { font-size: 3rem; }
                .product-preview-grid { flex-direction: column; align-items: center; }
                .button-primary { width: 100% !important; margin-bottom: 10px; }
                .faq-header { font-size: 3rem; }
              }
            </style>
          </head>
          <body>
            
          <div class="container" style="padding-top: 50px; text-align: center;">
            <a href="https://getcaffy.com" class="logo-link">
              <div style="font-weight: 500; font-size: 4.5rem; letter-spacing: 2px; color: #fff; margin-bottom: 2vh; line-height: 1;">CAFFY</div>
            </a>
          </div>
            
            <div class="model-section">
              <model-viewer class="product-model" src="https://getcaffy.com/CaffyPouchMintMVout6b.glb" interaction-prompt="none" auto-rotate rotation-per-second="5deg" camera-controls disable-zoom disable-pan shadow-intensity="0" camera-orbit="80deg 50deg 105%" alt="CAFFY Nootropic Pouch 3D Model"></model-viewer>
            </div>

            <div class="seo-container">
              <!-- <h1 class="main-title">${pageTitle}</h1> -->
              <div class="content">${bodyContent}</div>

              <div class="pillar-bar">
                <div class="pillar"><span class="pillar-value">Energy</span></div>
                <div class="pillar"><span class="pillar-value">Memory</span></div>
                <div class="pillar"><span class="pillar-value">Focus</span></div>
              </div>

              <div class="cta-box">
                <h3>Welcome to the future - you belong here</h3>
                
                <div class="product-preview-grid">
                  <div class="product-preview-item">
                    <img src="https://getcaffy.com/images/caffy-pouch-mint.png" alt="Cool Mint">
                    <a href="https://getcaffy.com/checkout?add=mint${utmString}" class="button button-primary">Add Cool Mint</a>
                  </div>
                  <div class="product-preview-item">
                    <img src="https://getcaffy.com/images/caffy-pouch-blueberry.png" alt="Blueberry">
                    <a href="https://getcaffy.com/checkout?add=berry${utmString}" class="button button-primary button-blueberry">Add Blueberry</a>
                  </div>
                </div>
                
                <p style="font-size: 1.4rem; margin-top: 20px; opacity: 0.5; font-family: 'Ubuntu Mono';">LAUNCH DISCOUNT: -20% APPLIED AUTOMATICALLY</p>
              </div>

              <div class="faq-section" id="faq-section" style="display:none;">
                <div class="faq-header">FAQ</div>
                <div id="faq-list"></div>
              </div>
            </div>

            <script>
              try {
                const dynamicFaqs = ${JSON.stringify(dynamicFaqs)};
                const globalFaqs = ${JSON.stringify(globalFaqs)};
                const allFaqs = [...(Array.isArray(dynamicFaqs) ? dynamicFaqs : []), ...globalFaqs];

                if(allFaqs.length > 0) {
                  document.getElementById('faq-section').style.display = 'block';
                  const list = document.getElementById('faq-list');
                  allFaqs.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'faq-item';
                    div.innerHTML = '<div class="faq-q">' + (item.q || item.question) + '</div><div class="faq-a">' + (item.a || item.answer) + '</div>';
                    list.appendChild(div);
                  });
                }
              } catch(e) { console.error("FAQ Render Error", e); }
            </script>
          </body>
          </html>
        `;

        return new Response(html, { headers: { "Content-Type": "text/html" } });

      } catch (e) {
        return new Response("Error fetching data", { status: 500 });
      }
    }
    return new Response("SEO Worker Active");
  }
};

// ===== SITEMAP GENERATOR FUNCTION =====
async function generateSitemap(env) {
  try {
    // Fetch all published pages from Baserow
    const baserowUrl =
  `https://baserow.getcaffy.com/api/database/rows/table/532/?user_field_names=true&filter__Status__single_select_equal=Published`;

    
    const response = await fetch(baserowUrl, {
      headers: { "Authorization": `Token ${env.BASEROW_TOKEN}`, "CF-Access-Client-Id": env.CF_ACCESS_CLIENT_ID, "CF-Access-Client-Secret": env.CF_ACCESS_CLIENT_SECRET }
    });
    
    const data = await response.json();
    const pages = data.results || [];

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Pages -->
  <url>
    <loc>https://getcaffy.com</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://getcaffy.com/checkout</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Dynamic Landing Pages -->`;

    pages.forEach(page => {
      xml += `
  <url>
    <loc>https://getcaffy.com/for/${page.Slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    return new Response('Sitemap generation failed', { status: 500 });
  }
}

// ===== related pages (v2) =====
async function getRelated(env, slug) {
  try {
    const r = await fetch("https://baserow.getcaffy.com/api/database/rows/table/532/?user_field_names=true&filter__Status__single_select_equal=Published&size=100&include=Slug,H1_Title", {
      headers: { "Authorization": `Token ${env.BASEROW_TOKEN}`, "CF-Access-Client-Id": env.CF_ACCESS_CLIENT_ID, "CF-Access-Client-Secret": env.CF_ACCESS_CLIENT_SECRET },
      cf: { cacheTtl: 3600, cacheEverything: true }
    });
    const d = await r.json();
    const h = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    return (d.results || []).filter((x) => x.Slug && x.Slug !== slug)
      .sort((a, b) => h(slug + a.Slug) - h(slug + b.Slug)).slice(0, 4)
      .map((x) => ({ slug: x.Slug, title: x.H1_Title }));
  } catch (e) { return []; }
}

// CAFFY /for/ landing page template (v2).
// Pure functions: no network, no env. The Worker fetches the Baserow row and calls renderPage().

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const attr = esc;

const SITE = "https://getcaffy.com";

const GLOBAL_FAQS = [
  { q: "Does CAFFY contain nicotine or tobacco?", a: "No. CAFFY is 100% nicotine-free and tobacco-free. It is a high-performance energy supplement formulated with caffeine and nootropics." },
  { q: "How do I use and discard the pouch?", a: "Place one pouch between your gum and cheek and leave it for 20-30 minutes. The pouch stays intact; do not chew or swallow it. Discard it when finished. Take CAFFY on a full stomach for optimal results and have up to three pouches per day." },
  { q: "Is CAFFY suitable for use during Ramadan?", a: "CAFFY is ideal for Suhoor (Sehri) to start your day with focus, or after Iftar to eliminate the post-meal 'food coma.' It is smoke-free, sugar-free and discreet." },
  { q: "Where do you ship in the UAE?", a: "We ship across the entire UAE, including Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah." },
];

const INGREDIENTS = [
  { name: "Caffeine", tag: "from Guarana", text: "A plant native to the Amazon basin, known for its high caffeine content, providing sustained energy release.", links: [["Examine", "https://examine.com/supplements/guarana/"], ["PubMed", "https://pubmed.ncbi.nlm.nih.gov/?term=guarana"]] },
  { name: "L-Theanine", tag: "calm focus", text: "An amino acid found primarily in tea leaves that promotes relaxation without drowsiness, often used to smooth out caffeine's effects and enhance focus.", links: [["Examine", "https://examine.com/supplements/theanine/"], ["PubMed", "https://pubmed.ncbi.nlm.nih.gov/?term=l-theanine+focus"]] },
  { name: "Citicoline", tag: "memory", text: "A naturally occurring brain chemical that supports memory, focus, and overall cognitive function by aiding in the synthesis of phosphatidylcholine.", links: [["Examine", "https://examine.com/supplements/citicoline/"], ["PubMed", "https://pubmed.ncbi.nlm.nih.gov/?term=citicoline+cognitive"]] },
  { name: "Vitamin B6", tag: "clarity", text: "An essential vitamin crucial for brain development and function, playing a key role in neurotransmitter synthesis which impacts mood and mental clarity.", links: [["NIH", "https://ods.od.nih.gov/factsheets/VitaminB6-HealthProfessional/"], ["Examine", "https://examine.com/supplements/vitamin-b6/"]] },
];

const STEPS = [
  { n: "01", t: "Place", d: "One pouch between your gum and cheek. Hands-free, no water, no spill." },
  { n: "02", t: "Settle", d: "Leave it for 20-30 minutes. Do not chew or swallow it. Best on a full stomach." },
  { n: "03", t: "Discard", d: "Bin it when you are done. Up to three pouches a day." },
];

function titleCase(s) {
  return String(s).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Remove active content and inline handlers from the stored HTML, then undo the double escaping the
// Baserow field sometimes carries.
function cleanBody(raw) {
  let b = String(raw || "").replace(/```html|```/g, "");
  b = b.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  b = b.replace(/<(script|style|iframe|object|embed|link|meta)[\s\S]*?(<\/\1>|\/?>)/gi, "");
  b = b.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  b = b.replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "$1=$2#$2");
  return b;
}

// Split the cleaned body into headline, lede and the remaining blocks.
function splitBody(body, fallbackTitle) {
  let headline = fallbackTitle || "";
  const h = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h) { headline = h[1].replace(/<[^>]+>/g, "").trim(); body = body.replace(h[0], ""); }
  const blocks = [];
  const re = /<(p|h2|h3|ul|ol|blockquote)\b[^>]*>[\s\S]*?<\/\1>/gi;
  let m;
  while ((m = re.exec(body))) blocks.push({ tag: m[1].toLowerCase(), html: m[0] });
  if (!blocks.length && body.trim()) blocks.push({ tag: "p", html: `<p>${body.trim()}</p>` });
  const firstP = blocks.findIndex((b) => b.tag === "p");
  const lede = firstP >= 0 ? blocks.splice(firstP, 1)[0] : null;
  return { headline, lede, blocks };
}

function splitFirstSentence(html) {
  const text = html.replace(/^<p[^>]*>|<\/p>$/gi, "");
  const m = text.match(/^(.{20,220}?[.!?])(\s+)([\s\S]+)$/);
  return m ? { first: m[1], rest: m[3] } : { first: "", rest: text };
}

function renderPage({ slug, page, related = [], utm = "", faqs: extraFaqs }) {
  const body = cleanBody(page.Body_Text);
  const { headline, lede, blocks } = splitBody(body, page.H1_Title);
  const topic = titleCase(slug);
  const url = `${SITE}/for/${slug}`;
  const title = page.Meta_Title || `${headline} | CAFFY`;
  const desc = page.Meta_Desc || "";
  let dyn = [];
  try { dyn = typeof page.FAQ_JSON === "string" ? JSON.parse(page.FAQ_JSON) : page.FAQ_JSON || []; } catch (e) { dyn = []; }
  if (!Array.isArray(dyn)) dyn = [];
  const faqs = [...dyn.map((f) => ({ q: f.q || f.question, a: f.a || f.answer })), ...(extraFaqs || GLOBAL_FAQS)].filter((f) => f.q && f.a);
  const ledeParts = lede ? splitFirstSentence(lede.html) : { first: "", rest: "" };
  const hw = esc(headline).split(' ');
  const headlineHtml = hw.length > 3 ? hw.slice(0, -2).join(' ') + ' <em>' + hw.slice(-2).join(' ') + '</em>' : esc(headline);
  const mintHref = `${SITE}/checkout?add=mint${utm}`;
  const berryHref = `${SITE}/checkout?add=berry${utm}`;
  const ev = (name) => `data-umami-event="${name}" data-umami-event-slug="${attr(slug)}"`;

  const ld = [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "CAFFY", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: topic, item: url } ] },
  ];

  const chapters = blocks.map((b, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `<article class="chapter reveal"><div class="chapter-n">${n}</div><div class="chapter-b">${b.html}</div></article>`;
  }).join("");

  const relatedHtml = related.length ? `
    <section class="section reveal" id="more">
      <div class="eyebrow">KEEP READING</div>
      <h2>More ways CAFFY fits your day</h2>
      <div class="related">
        ${related.map((r, i) => `<a class="rel" href="${SITE}/for/${attr(r.slug)}" ${ev("For Related")}><span class="rel-i">${String(i + 1).padStart(2, "0")}</span><span class="rel-t">${esc(r.title || titleCase(r.slug))}</span><span class="rel-a">→</span></a>`).join("")}
      </div>
    </section>` : "";

  const css = `
:root{--cyan:#00ffff;--cyan2:#50f9fa;--berry:#525fe1;--bg:#020912;--bg2:#060f1c;--ink:#f2f6fa;--mute:#9aa7b4;--dim:#5b6877;--line:rgba(255,255,255,.09);--glass:rgba(255,255,255,.035);--mx:50vw;--my:30vh}
*{box-sizing:border-box}html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:'Montserrat',system-ui,sans-serif;font-weight:300;font-size:17px;line-height:1.7;overflow-x:hidden}
a{color:inherit}img{max-width:100%;display:block}
.mono{font-family:'Ubuntu Mono',ui-monospace,monospace}
#glow{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(circle 620px at var(--mx) var(--my),rgba(0,255,255,.07),transparent 75%)}
.grid-bg{position:absolute;inset:0;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse 70% 60% at 50% 30%,#000 20%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 30%,#000 20%,transparent 75%);opacity:.5;pointer-events:none}
main,header,footer{position:relative;z-index:1}
.wrap{max-width:1080px;margin:0 auto;padding:0 24px}
/* nav */
.nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);background:rgba(2,9,18,.72);border-bottom:1px solid var(--line)}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;height:64px}
.logo{font-weight:500;letter-spacing:6px;font-size:22px;text-decoration:none}
.nav-links{display:flex;gap:26px;align-items:center}
.nav-links a{font-family:'Ubuntu Mono',monospace;font-size:13px;letter-spacing:2px;text-decoration:none;color:var(--mute);text-transform:uppercase}
.nav-links a:hover{color:var(--cyan)}
.nav-links a.btn{color:#000;font-family:'Montserrat',sans-serif;font-size:12px;letter-spacing:2px;padding:10px 20px}.nav-links a.btn:hover{color:#000}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:15px 28px;border-radius:2px;border:1px solid var(--cyan);color:#000;background:var(--cyan);transition:transform .2s,box-shadow .2s,background .2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 10px 40px -10px rgba(0,255,255,.7)}
.btn.ghost{background:transparent;color:var(--cyan)}.btn.ghost:hover{background:rgba(0,255,255,.08)}
.btn.berry{background:var(--berry);border-color:var(--berry);color:#fff}.btn.berry:hover{box-shadow:0 10px 40px -10px rgba(82,95,225,.8)}
.btn.sm{padding:10px 18px;font-size:12px}
/* hero */
.hero{position:relative;padding:72px 0 40px;overflow:hidden}
.eyebrow{font-family:'Ubuntu Mono',monospace;font-size:13px;letter-spacing:4px;text-transform:uppercase;color:var(--cyan);margin-bottom:18px}
.eyebrow:before{content:'// ';color:var(--dim)}
.hero-grid{position:relative;display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:center}
h1{font-weight:500;font-size:clamp(2.4rem,5.6vw,4.4rem);line-height:1.05;letter-spacing:-1.5px;margin:0 0 28px}
h1 em{font-style:normal;background:linear-gradient(100deg,var(--cyan),#8ab4ff 70%);-webkit-background-clip:text;background-clip:text;color:transparent}
.pull{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:clamp(1.5rem,2.6vw,2.1rem);line-height:1.3;color:#e9f4f8;margin:0 0 20px;padding-left:20px;border-left:2px solid var(--cyan)}
.lede{color:var(--mute);font-size:1.06rem;margin:0 0 32px;max-width:540px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap}
.fine{margin-top:18px;font-family:'Ubuntu Mono',monospace;font-size:13px;color:var(--dim);letter-spacing:1px}
.stage{position:relative;aspect-ratio:1/1;max-height:520px;margin:0 auto;width:100%}
.stage:before{content:'';position:absolute;inset:8%;border-radius:50%;background:radial-gradient(circle,rgba(0,255,255,.22),transparent 68%);filter:blur(10px);animation:breathe 6s ease-in-out infinite alternate}
@keyframes breathe{from{transform:scale(.92);opacity:.6}to{transform:scale(1.06);opacity:1}}
.stage-fb{position:absolute;inset:0;margin:auto;width:62%;height:auto;opacity:.95;transition:opacity .6s;filter:drop-shadow(0 20px 40px rgba(0,255,255,.25))}
model-viewer{position:relative;z-index:1;width:100%;height:100%;--poster-color:transparent;background:transparent;outline:none}
.pill{position:absolute;font-family:'Ubuntu Mono',monospace;font-size:12px;letter-spacing:3px;text-transform:uppercase;padding:7px 14px;border:1px solid var(--line);border-radius:999px;background:rgba(2,9,18,.7);backdrop-filter:blur(8px);color:var(--cyan2)}
.pill{z-index:2}.pill.p1{top:14%;left:2%}.pill.p2{top:46%;right:-7%}.pill.p3{bottom:12%;left:6%}
/* spec strip */
.specs{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border:1px solid var(--line);margin:34px 0 0}
.spec{background:var(--bg2);padding:20px 18px;text-align:center}
.spec b{display:block;font-weight:500;font-size:15px;letter-spacing:2px;text-transform:uppercase}
.spec span{font-family:'Ubuntu Mono',monospace;font-size:12px;color:var(--dim);letter-spacing:1px}
/* sections */
.section{padding:88px 0}
h2{font-weight:500;font-size:clamp(1.8rem,3.4vw,2.7rem);line-height:1.15;letter-spacing:-.5px;margin:0 0 36px}
.chapter{display:grid;grid-template-columns:90px 1fr;gap:20px;padding:34px 0;border-top:1px solid var(--line)}
.chapter-n{font-family:'Ubuntu Mono',monospace;font-size:34px;color:var(--cyan);opacity:.85}
.chapter-b p,.chapter-b li{color:#c4cdd6;font-size:1.06rem;margin:0 0 14px}
.chapter-b h2,.chapter-b h3{font-size:1.4rem;margin:0 0 12px}
.chapter-b strong{color:var(--cyan2);font-weight:500}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.card{background:var(--glass);border:1px solid var(--line);border-radius:4px;padding:26px 22px;position:relative;overflow:hidden;transition:border-color .3s,transform .3s}
.card:hover{border-color:rgba(0,255,255,.45);transform:translateY(-4px)}
.card:before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--cyan),transparent)}
.card .tag{font-family:'Ubuntu Mono',monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--cyan)}
.card h3{font-weight:500;font-size:1.25rem;margin:8px 0 10px}
.card p{font-size:.93rem;color:var(--mute);margin:0 0 14px;line-height:1.6}
.card .src a{font-family:'Ubuntu Mono',monospace;font-size:12px;color:var(--dim);text-decoration:none;margin-right:12px;border-bottom:1px solid var(--line)}
.card .src a:hover{color:var(--cyan)}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid var(--line)}
.step{padding:34px 28px;border-right:1px solid var(--line);background:var(--glass)}.step:last-child{border-right:0}
.step .n{font-family:'Ubuntu Mono',monospace;color:var(--cyan);font-size:14px;letter-spacing:3px}
.step h3{font-weight:500;font-size:1.6rem;margin:10px 0 8px}.step p{margin:0;color:var(--mute);font-size:.98rem}
/* shop */
.shop{background:linear-gradient(180deg,transparent,rgba(0,255,255,.03));border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.flavours{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:760px;margin:0 auto}
.flav{border:1px solid var(--line);background:var(--glass);border-radius:4px;padding:30px 24px;text-align:center;position:relative;overflow:hidden}
.flav:before{content:'';position:absolute;inset:auto -20% -60% -20%;height:70%;background:radial-gradient(ellipse,var(--g),transparent 70%);opacity:.35}
.flav.mint{--g:rgba(0,255,255,.8)}.flav.berry{--g:rgba(82,95,225,.9)}
.flav img{width:150px;margin:0 auto 18px;filter:drop-shadow(0 14px 24px rgba(0,0,0,.5));position:relative}
.flav h3{font-weight:500;letter-spacing:3px;text-transform:uppercase;font-size:1rem;margin:0 0 16px;position:relative}
.flav .btn{position:relative;width:100%}
.shop-note{text-align:center;margin-top:26px;font-family:'Ubuntu Mono',monospace;font-size:13px;letter-spacing:2px;color:var(--mute)}
.shop-note b{color:var(--cyan);font-weight:400}
/* faq */
.faq details{border-top:1px solid var(--line)}.faq details:last-child{border-bottom:1px solid var(--line)}
.faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:20px;padding:24px 0;font-weight:500;font-size:1.1rem}
.faq summary::-webkit-details-marker{display:none}
.faq summary:after{content:'+';font-family:'Ubuntu Mono',monospace;font-size:26px;line-height:1;color:var(--cyan);transition:transform .25s}
.faq details[open] summary:after{transform:rotate(45deg)}
.faq .ans{padding:0 0 26px;color:var(--mute);max-width:760px}
/* related */
.related{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.rel{display:flex;align-items:center;gap:16px;padding:20px 22px;border:1px solid var(--line);background:var(--glass);text-decoration:none;border-radius:4px;transition:border-color .25s,transform .25s}
.rel:hover{border-color:var(--cyan);transform:translateX(4px)}
.rel-i{font-family:'Ubuntu Mono',monospace;color:var(--cyan);font-size:14px}.rel-t{flex:1;font-weight:500}.rel-a{color:var(--cyan)}
/* footer */
footer{border-top:1px solid var(--line);padding:46px 0 120px;color:var(--dim);font-size:13px}
footer .wrap{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;align-items:center}
footer a{color:var(--mute);text-decoration:none;margin-right:18px;font-family:'Ubuntu Mono',monospace;letter-spacing:1px}footer a:hover{color:var(--cyan)}
/* sticky buy bar (mobile) */
.buybar{position:fixed;left:0;right:0;bottom:0;z-index:60;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:rgba(2,9,18,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid var(--line);transform:translateY(110%);transition:transform .35s;display:none}
.buybar.on{transform:none}.buybar .btn{width:100%}
/* motion */
.reveal{opacity:0;transform:translateY(22px);transition:opacity .8s ease,transform .8s ease}.reveal.in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}.stage:before{animation:none}html{scroll-behavior:auto}}
@media (max-width:900px){.pill.p2{right:0}.hero-grid{grid-template-columns:1fr}.stage{max-height:360px;order:-1}.cards{grid-template-columns:1fr 1fr}.specs{grid-template-columns:1fr 1fr}.nav-links a.hide-m{display:none}}
@media (max-width:640px){body{font-size:16px}.wrap{padding:0 18px}.hero{padding-top:36px}.section{padding:60px 0}.chapter{grid-template-columns:1fr;gap:6px}.cards,.steps,.flavours,.related{grid-template-columns:1fr}.step{border-right:0;border-bottom:1px solid var(--line)}.step:last-child{border-bottom:0}.buybar{display:block}.cta-row .btn{flex:1}.pill{font-size:11px}#glow{background:radial-gradient(circle 70vh at 50% 22%,rgba(0,255,255,.09),transparent 70%);animation:breathe 6s ease-in-out infinite alternate}}
`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="description" content="${attr(desc)}">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#020912">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="CAFFY">
<meta property="og:title" content="${attr(title)}"><meta property="og:description" content="${attr(desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}/images/caffy-pouch-mint.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${SITE}/images/favicon.ico">
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n")}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;700&family=Ubuntu+Mono&family=Cormorant+Garamond:ital,wght@1,300&display=swap" rel="stylesheet">
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>
<script defer src="https://analytics.getcaffy.com/script.js" data-website-id="9ff81ca6-c20a-4e0e-a512-17fc4d51f211"></script>
<style>${css}</style>
</head>
<body>
<div id="glow"></div>
<header class="nav"><div class="wrap">
  <a class="logo" href="${SITE}">CAFFY</a>
  <nav class="nav-links"><a class="hide-m" href="#inside">Inside</a><a class="hide-m" href="#how">How</a><a class="hide-m" href="#faq">FAQ</a><a class="btn sm" href="#shop" ${ev("For Nav Shop")}>Shop</a></nav>
</div></header>
<main>
<section class="hero"><div class="grid-bg"></div><div class="wrap">
  <div class="hero-grid">
    <div class="reveal">
      <div class="eyebrow">For ${esc(topic)}</div>
      <h1>${headlineHtml}</h1>
      ${ledeParts.first ? `<p class="pull">${ledeParts.first}</p>` : ""}
      ${ledeParts.rest ? `<p class="lede">${ledeParts.rest}</p>` : ""}
      <div class="cta-row"><a class="btn" href="${mintHref}" ${ev("For Hero Mint")}>Try Cool Mint</a><a class="btn ghost" href="#inside">What's inside</a></div>
      <div class="fine">NICOTINE-FREE · ZERO SUGAR · UAE DELIVERY</div>
    </div>
    <div class="stage reveal">
      <img id="mvfb" class="stage-fb" src="${SITE}/images/caffy-pouch-mint.png" alt="" width="360" height="360"><model-viewer id="mv" src="${SITE}/CaffyPouchMintMVout6b.glb" poster="${SITE}/images/caffy-pouch-mint.png" alt="CAFFY pouch 3D model" interaction-prompt="none" auto-rotate rotation-per-second="8deg" camera-controls disable-zoom shadow-intensity="0.6" exposure="1.1" loading="lazy" reveal="auto"></model-viewer>
      <span class="pill p1">Energy</span><span class="pill p2">Memory</span><span class="pill p3">Focus</span>
    </div>
  </div>
  <div class="specs reveal">
    <div class="spec"><b>Discreet</b><span>pouch, no mug, no spill</span></div>
    <div class="spec"><b>Nicotine-free</b><span>and tobacco-free</span></div>
    <div class="spec"><b>Two flavours</b><span>Cool Mint · Blueberry</span></div>
    <div class="spec"><b>Across the UAE</b><span>all seven emirates</span></div>
  </div>
</div></section>

${chapters ? `<section class="section" id="story"><div class="wrap"><div class="eyebrow reveal">The brief</div><h2 class="reveal">Made for ${esc(topic)}</h2>${chapters}</div></section>` : ""}

<section class="section" id="inside"><div class="wrap">
  <div class="eyebrow reveal">What's inside</div><h2 class="reveal">Four compounds. One clean lift.</h2>
  <div class="cards">
    ${INGREDIENTS.map((c, i) => `<div class="card reveal" style="transition-delay:${i * 70}ms"><div class="tag">0${i + 1} · ${esc(c.tag)}</div><h3>${esc(c.name)}</h3><p>${esc(c.text)}</p><div class="src">${c.links.map(([n, h]) => `<a href="${h}" target="_blank" rel="noopener">${n}</a>`).join("")}</div></div>`).join("")}
  </div>
</div></section>

<section class="section" id="how"><div class="wrap">
  <div class="eyebrow reveal">How to use it</div><h2 class="reveal">Three steps. No prep.</h2>
  <div class="steps reveal">${STEPS.map((s) => `<div class="step"><div class="n">${s.n}</div><h3>${s.t}</h3><p>${s.d}</p></div>`).join("")}</div>
</div></section>

<section class="section shop" id="shop"><div class="wrap">
  <div class="eyebrow reveal" style="text-align:center">Welcome to the future</div>
  <h2 class="reveal" style="text-align:center">You belong here.</h2>
  <div class="flavours reveal">
    <div class="flav mint"><img src="${SITE}/images/caffy-pouch-mint.png" alt="CAFFY Cool Mint" loading="lazy"><h3>Cool Mint</h3><a class="btn" href="${mintHref}" ${ev("For Shop Mint")}>Add Cool Mint</a></div>
    <div class="flav berry"><img src="${SITE}/images/caffy-pouch-blueberry.png" alt="CAFFY Blueberry" loading="lazy"><h3>Blueberry</h3><a class="btn berry" href="${berryHref}" ${ev("For Shop Berry")}>Add Blueberry</a></div>
  </div>
  <div class="shop-note"><b>LAUNCH DISCOUNT</b> · -20% APPLIED AUTOMATICALLY</div>
</div></section>

<section class="section" id="faq"><div class="wrap faq">
  <div class="eyebrow reveal">Questions</div><h2 class="reveal">FAQ</h2>
  ${faqs.map((f) => `<details class="reveal"><summary>${esc(f.q)}</summary><div class="ans">${esc(f.a)}</div></details>`).join("")}
</div></section>

${relatedHtml ? `<div class="wrap">${relatedHtml}</div>` : ""}
</main>
<footer><div class="wrap">
  <div>© CAFFY FZC LLC</div>
  <div><a href="${SITE}/faq/">FAQ</a><a href="${SITE}/terms/">Terms</a><a href="${SITE}/privacy/">Privacy</a></div>
  <div><a href="https://www.instagram.com/get__caffy/" rel="noopener">Instagram</a><a href="https://www.tiktok.com/@getcaffy" rel="noopener">TikTok</a><a href="https://x.com/GetCaffy" rel="noopener">X</a><a href="https://www.youtube.com/@GetCaffy" rel="noopener">YouTube</a></div>
</div></footer>
<div class="buybar" id="buybar"><a class="btn" href="${mintHref}" ${ev("For Sticky Bar")}>Shop CAFFY · -20%</a></div>
<script>
(function(){
  var mv=document.getElementById('mv'),fb=document.getElementById('mvfb');if(mv&&fb){mv.addEventListener('load',function(){fb.style.opacity=0;});}
  if(mv&&window.matchMedia('(max-width:700px)').matches){mv.setAttribute('reveal','interaction');}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(function(n){io.observe(n);});
  if(window.matchMedia('(pointer:fine)').matches){window.addEventListener('mousemove',function(e){document.documentElement.style.setProperty('--mx',e.clientX+'px');document.documentElement.style.setProperty('--my',e.clientY+'px');},{passive:true});}
  var bar=document.getElementById('buybar'),hero=document.querySelector('.hero'),shop=document.getElementById('shop');
  function bb(){var past=hero.getBoundingClientRect().bottom<0;var s=shop.getBoundingClientRect();var inShop=s.top<innerHeight&&s.bottom>0;bar.classList.toggle('on',past&&!inShop);}
  addEventListener('scroll',bb,{passive:true});bb();
})();
</script>
</body>
</html>`;
}
