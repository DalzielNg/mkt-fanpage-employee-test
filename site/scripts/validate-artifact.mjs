import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const artifactPath = new URL('../dist/server/index.js', import.meta.url);
const manifestPath = new URL('../dist/.openai/hosting.json', import.meta.url);
const source = await readFile(artifactPath, 'utf8');
JSON.parse(await readFile(manifestPath, 'utf8'));
if (source.includes('__INDEX_HTML_B64__') || source.includes('__STYLES_CSS_B64__') || source.includes('__APP_JS_B64__')) {
  throw new Error('Worker artifact still contains an unresolved asset placeholder.');
}

const module = await import(`${pathToFileURL(artifactPath.pathname).href}?check=${Date.now()}`);
assert.equal(typeof module.default?.fetch, 'function', 'Worker artifact must export default.fetch(request, env, ctx).');

const unauthenticated = await module.default.fetch(new Request('https://example.test/'));
if (unauthenticated.status !== 401) throw new Error(`Expected unauthenticated request to return 401, got ${unauthenticated.status}.`);

const authenticated = await module.default.fetch(new Request('https://example.test/api/session', {
  headers: { 'oai-authenticated-user-id': 'validation-user' },
}));
if (authenticated.status !== 200) throw new Error(`Expected authenticated session request to return 200, got ${authenticated.status}.`);

console.log('Worker artifact validation passed.');
