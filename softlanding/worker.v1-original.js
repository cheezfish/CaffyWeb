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
          headers: { "Authorization": `Token ${env.BASEROW_TOKEN}` }
        });
        
        const data = await baserowRes.json();
        const page = data.results[0];

        if (!page) return new Response("Page not found", { status: 404 });

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
      headers: { "Authorization": `Token ${env.BASEROW_TOKEN}` }
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