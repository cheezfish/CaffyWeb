// Render one landing page locally from a saved Baserow row (JSON with Slug, H1_Title, Meta_Title,
// Meta_Desc, Body_Text, FAQ_JSON):  node render-local.mjs row.json > page.html
import { renderPage } from "./template.js";
import fs from "fs";
const page = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const related = [{ slug: "example-one", title: "Example one" }, { slug: "example-two", title: "Example two" }];
process.stdout.write(renderPage({ slug: page.Slug, page, related, utm: "&from=" + page.Slug }));
