import { readFile, writeFile, mkdir } from "node:fs/promises";
const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
const project = JSON.parse(await readFile("package.json", "utf8"));
const allowed = new Set([
  "MIT",
  "ISC",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "0BSD",
  "BlueOak-1.0.0",
  "Python-2.0",
  "CC-BY-4.0",
  "MPL-2.0",
  "LGPL-3.0-or-later",
  "Apache-2.0 AND LGPL-3.0-or-later",
  "Apache-2.0 AND LGPL-3.0-or-later AND MIT",
]);
const entries = Object.entries(lock.packages).filter(([path]) => path);
for (const [path, item] of entries)
  if (!allowed.has(item.license))
    throw new Error(`Review license: ${path}: ${item.license}`);
const direct = [
  ...Object.keys(project.dependencies),
  ...Object.keys(project.devDependencies),
].sort();
let output =
  "# Dependency licenses\n\nGenerated from the installed lockfile by `npm run licenses`. No unknown license expressions were found.\n\nThe shipped browser application uses MIT-licensed libraries and the ISC-licensed Lucide icon set. Tailwind output is built locally. No third-party runtime CDN, paid encoder, or WASM binary is used.\n\nNext.js includes optional native build/server packages. Sharp and its native libraries are used only for development fixture generation and assertions in this static application; the original LGPL/MPL/Apache notices remain in their npm distributions. They are not included in the exported browser application. ESLint, Vitest, and Playwright are development tools.\n\n## Direct dependencies\n\n| Package | Version | License | Use |\n| --- | --- | --- | --- |\n";
for (const name of direct) {
  const info = lock.packages[`node_modules/${name}`];
  output += `| ${name} | ${info.version} | ${info.license} | ${project.dependencies[name] ? "Application / build" : "Development"} |\n`;
}
output +=
  "\n## Full dependency inventory\n\n| Package path | Version | License |\n| --- | --- | --- |\n";
for (const [path, info] of entries.sort(([a], [b]) => a.localeCompare(b)))
  output += `| ${path.replace(/^node_modules\//, "")} | ${info.version} | ${info.license} |\n`;
output +=
  "\n## shadcn/ui\n\nLocally owned primitives follow the shadcn/ui composition pattern with Radix primitives. shadcn/ui is MIT licensed: <https://github.com/shadcn-ui/ui/blob/main/LICENSE.md>. Components are in `src/components/ui/primitives.tsx`.\n";
await mkdir("docs", { recursive: true });
await writeFile("docs/DEPENDENCY-LICENSES.md", output);
console.log(
  `Reviewed ${entries.length} locked package entries and ${direct.length} direct dependencies; no unknown licenses.`,
);
