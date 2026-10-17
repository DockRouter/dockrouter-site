import { writeFile } from "node:fs/promises";

// GitHub Pages should serve the exported assets without a Jekyll pass.
await writeFile("out/.nojekyll", "");
await writeFile("out/CNAME", "wirerift.com\n");
