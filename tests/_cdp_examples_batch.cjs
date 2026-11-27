/**
 * CDP 批量回归（分批版）：node tests/_cdp_examples_batch.cjs [start] [count] [port]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = globalThis.WebSocket;
const START = Number(process.argv[2] || 0);
const COUNT = Number(process.argv[3] || 20);
const PORT = Number(process.argv[4] || 9223);
const BASE_URL = (process.argv[5] || '').replace(/\/$/, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function httpGet(url) {
  return new Promise((res, rej) => {
    http.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); }).on('error', rej);
  });
}

(async () => {
  const list = JSON.parse(await httpGet(`http://127.0.0.1:${PORT}/json/list`));
  const target = list.find(t => t.type === 'page');
  if (!target) { console.error('NO PAGE'); process.exit(1); }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0;
  const pending = new Map();
  let exceptions = [], failed = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      exceptions.push((d.exception && d.exception.description) || d.text || 'unknown');
    }
    if (m.method === 'Network.loadingFailed') failed.push(m.params.errorText || 'fail');
  };
  const send = (method, params = {}) => new Promise(r => {
    const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params }));
  });
  const evaluate = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    return r.result && r.result.result && r.result.result.value;
  };

  const exDir = path.resolve(__dirname, '../examples');
  const files = fs.readdirSync(exDir).filter(f => f.endsWith('.html')).sort().slice(START, START + COUNT);
  const results = [];
  for (const file of files) {
    exceptions = []; failed = [];
    const pageUrl = BASE_URL ? `${BASE_URL}/${file}` : `file:///${exDir.replace(/\\/g, '/')}/${file}`;
    await send('Page.navigate', { url: pageUrl });
    await sleep(700);
    const diagExpr = `(() => ({
      hasEditor: !!document.querySelector('.xf_editor'),
      hasCM: !!document.querySelector('.CodeMirror'),
      btn: document.querySelectorAll('.xf_editor-toolbar a,.xf_editor-toolbar button').length
    }))()`;
    let diag = await evaluate(diagExpr) || {};
    // 部分示例异步加载 md/full.md，给初始化留出最多 2 秒，避免误判为 NO_EDITOR
    for (let attempt = 0; attempt < 8 && !diag.hasEditor; attempt++) {
      await sleep(250);
      diag = await evaluate(diagExpr) || {};
    }
    const uniqueEx = [...new Set(exceptions)].map(x => String(x).split('\n')[0]).slice(0, 2);
    const status = uniqueEx.length ? 'JS_ERROR' : diag.hasEditor ? 'OK' : 'NO_EDITOR';
    results.push({ file, status, diag, exceptions: uniqueEx, failed: [...new Set(failed)].slice(0, 2) });
  }
  for (const r of results) {
    if (r.status === 'OK' && r.failed.length === 0) continue;
    console.log(`[${r.status}] ${r.file} CM=${r.diag.hasCM} btn=${r.diag.btn}`);
    if (r.exceptions.length) console.log('   JS:', r.exceptions.join(' | ').slice(0, 220));
    if (r.failed.length) console.log('   LOAD:', r.failed.join(' | '));
  }
  const counts = results.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {});
  console.log(`BATCH ${START}-${START + files.length}: ${JSON.stringify(counts)}`);
  ws.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
