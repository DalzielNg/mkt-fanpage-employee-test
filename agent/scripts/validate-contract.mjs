import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schemaUrl = new URL('../contracts/content-draft.schema.json', import.meta.url);
const exampleUrl = new URL('../examples/content-draft.example.json', import.meta.url);

const schema = JSON.parse(await readFile(schemaUrl, 'utf8'));
const example = JSON.parse(await readFile(exampleUrl, 'utf8'));

assert.equal(schema.type, 'object');
assert.equal(schema.additionalProperties, false);
assert.ok(Array.isArray(schema.required));

for (const key of schema.required) {
  assert.ok(Object.hasOwn(example, key), `Ví dụ thiếu trường bắt buộc: ${key}`);
}

for (const key of Object.keys(example)) {
  assert.ok(Object.hasOwn(schema.properties, key), `Ví dụ có trường ngoài schema: ${key}`);
}

assert.ok(schema.properties.run_status.enum.includes(example.run_status));
assert.ok(schema.properties.confidence.enum.includes(example.confidence));
assert.match(example.source_url, /^https:\/\//);
assert.ok(example.title.length > 0 && example.title.length <= schema.properties.title.maxLength);
assert.ok(example.caption.endsWith('Theo: example.com'));
assert.ok(example.pinned_comment.endsWith(example.source_url));
assert.ok(!example.caption.includes('Nội dung chưa đặt tên'));

console.log('Agent content contract validation passed.');
