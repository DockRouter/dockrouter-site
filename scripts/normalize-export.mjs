import { copyFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Some Next.js export hosts write segment-prefetch names as directories.
// The browser requests dotted names. Keep both forms for portable static hosting.
async function segmentAliases(directory, prefix, destination) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = join(directory, entry.name);
    const name = `${prefix}.${entry.name}`;
    if (entry.isDirectory()) await segmentAliases(source, name, destination);
    else if (entry.isFile() && entry.name.endsWith(".txt"))
      await copyFile(source, join(destination, name));
  }
}
async function normalize(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = join(directory, entry.name);
    if (entry.name.startsWith("__next."))
      await segmentAliases(child, entry.name, directory);
    else if (entry.name !== "_next") await normalize(child);
  }
}
await normalize("out");

// GitHub Pages should serve the exported assets without a Jekyll pass.
await writeFile("out/.nojekyll", "");
await writeFile("out/CNAME", "dockrouter.com\n");
