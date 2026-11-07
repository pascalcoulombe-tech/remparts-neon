// Petit serveur statique pour les tests (les modules ES ne marchent pas en file://).
// Sert la racine et le préfixe /remparts-neon/ (base GitHub Pages).
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const BASE = '/remparts-neon';
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

function mapUrl(url) {
  let p = decodeURIComponent(String(url || '/').split('?')[0]);
  if (p === BASE || p.startsWith(BASE + '/')) p = p.slice(BASE.length) || '/';
  if (!p.startsWith('/')) p = '/' + p;
  if (p.endsWith('/')) p += 'index.html';
  p = path.posix.normalize(p);
  if (!p.startsWith('/')) return null;
  const rel = p.slice(1);
  if (!rel || rel.split('/').some(s => s === '..')) return null;
  const abs = path.resolve(ROOT, rel);
  const fromRoot = path.relative(ROOT, abs);
  if (!fromRoot || fromRoot.startsWith('..') || path.isAbsolute(fromRoot)) return null;
  return fromRoot.split(path.sep).join('/');
}

module.exports = function serve(port = 8765) {
  const s = http.createServer((q, r) => {
    const rel = mapUrl(q.url);
    if (rel == null) { r.writeHead(404); return r.end(); }
    const f = path.resolve(ROOT, rel);
    const fromRoot = path.relative(ROOT, f);
    if (fromRoot.startsWith('..') || path.isAbsolute(fromRoot) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(r);
  });
  return new Promise(res => s.listen(port, () => res(s)));
};
module.exports.mapUrl = mapUrl;
if (require.main === module) module.exports(+process.argv[2] || 8765).then(() => console.log('http://localhost:' + (+process.argv[2] || 8765) + '/remparts-neon/'));
