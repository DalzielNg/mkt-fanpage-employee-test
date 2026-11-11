import { readFile, writeFile } from 'node:fs/promises';

const [, , templatePath, assetsDir, outputPath] = process.argv;
if (!templatePath || !assetsDir || !outputPath) {
  throw new Error('Usage: node scripts/build-worker.mjs <template> <assets-dir> <output>');
}

const assets = {
  '__INDEX_HTML_B64__': 'index.html',
  '__STYLES_CSS_B64__': 'styles.css',
  '__APP_JS_B64__': 'app.js',
};

let worker = await readFile(templatePath, 'utf8');
for (const [placeholder, filename] of Object.entries(assets)) {
  const content = await readFile(`${assetsDir}/${filename}`);
  const encoded = content.toString('base64');
  if (!worker.includes(placeholder)) throw new Error(`Missing worker placeholder: ${placeholder}`);
  worker = worker.replace(placeholder, encoded);
}

await writeFile(outputPath, worker);
