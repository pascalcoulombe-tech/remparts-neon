import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { mapUrl } = require('./serve.js');

test('Pages base and root both map inside the repo', () => {
  assert.equal(mapUrl('/remparts-neon/'), 'index.html');
  assert.equal(mapUrl('/remparts-neon/js/main.js'), 'js/main.js');
  assert.equal(mapUrl('/js/main.js'), 'js/main.js');
  assert.equal(mapUrl('/'), 'index.html');
});

test('a base-prefixed parent path cannot escape the repo', () => {
  const escaped = mapUrl('/remparts-neon/../../etc/passwd');
  assert.ok(escaped === null || (!path.isAbsolute(escaped) && !escaped.includes('..')));
  assert.notEqual(escaped, '/etc/passwd');
});
