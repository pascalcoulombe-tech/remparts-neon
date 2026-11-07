import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const serve = require('./serve.js');
const { mapUrl, contentType } = serve;

test('Pages base and root both map inside the repo', () => {
  assert.equal(mapUrl('/remparts-neon/'), 'index.html');
  assert.equal(mapUrl('/remparts-neon/js/main.js'), 'js/main.js');
  assert.equal(mapUrl('/js/main.js'), 'js/main.js');
  assert.equal(mapUrl('/'), 'index.html');
});

test('an ES module is served as javascript', async () => {
  assert.equal(contentType('js/weapons.mjs'), 'text/javascript');
  const s = await serve(0);
  try {
    const port = s.address().port;
    const res = await fetch(`http://127.0.0.1:${port}/remparts-neon/js/weapons.mjs`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/javascript');
    assert.match(await res.text(), /buildFoamShots/);
  } finally { s.close(); }
});

test('a base-prefixed parent path cannot escape the repo', () => {
  const escaped = mapUrl('/remparts-neon/../../etc/passwd');
  assert.ok(escaped === null || (!path.isAbsolute(escaped) && !escaped.includes('..')));
  assert.notEqual(escaped, '/etc/passwd');
});
