/**
 * CDP 批量回归：逐个加载 examples/ 下所有 HTML，捕获 JS 异常 / 资源 404 / 初始化失败。
 * 用法：node tests/_cdp_all_examples.cjs [port]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = globalThis.WebSocket;
const PORT = Number(process.argv[2] || 9223);
const sleep = ms => new Promise(r => setTimeout(r, ms));

function httpGet(url) {
  return new Promise((res, rej) => {
    http.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); }).on('error', rej);
  });
}

async function getPageTarget() {
  const list = JSON.parse(await httpGet(`http://127.0.0.1:${PORT}/json/list`));
  return list.find(t => t.type === 'page');
}

(async () => {
  const target = await getPageTarget();
  if (!target) { console.error('NO PAGE TARGET'); process.exit(1); }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0;
  const pending = new Map();
  let exceptions = [], failedResources = [];

  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      exceptions.push((d.exception && d.exception.description) || d.text || 'unknown');
    }
    if (m.method === 'Network.loadingFailed') {
      failedResources.push(m.params.errorText || 'load failed');
    }
  };

  const send = (method, params = {}) => new Promise(r => {
    const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params }));
  });
  const evaluate = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r.result && r.result.exceptionDetails) return null;
    return r.result && r.result.result && r.result.result.value;
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');

  const exDir = path.resolve(__dirname, '../examples');
  const files = fs.readdirSync(exDir).filter(f => f.endsWith('.html')).sort();
  const results = [];

  for (const file of files) {
    exceptions = []; failedResources = [];
    const url = `file:///${exDir.replace(/\\/g, '/')}/${file}`;
    await send('Page.navigate', { url });
    await sleep(450);
    const diag = await evaluate(`(() => {
      var scripts = document.querySelectorAll('script');
      var btnCount = document.querySelectorAll('.xf_editor-toolbar a, .xf_editor-toolbar button').length;
      var hasEditor = !!document.querySelector('.xf_editor');
      var hasCM = !!document.querySelector('.CodeMirror');
      var title = document.title || '';
      return { scripts: scripts.length, btnCount: btnCount, hasEditor: hasEditor, hasCM: hasCM, title: title };
    })()`);
    const uniqueEx = [...new Set(exceptions)].slice(0, 3);
    // 允许已删除示例残留的 404 由 failedResources 捕获
    const status = uniqueEx.length === 0 && diag && diag.hasEditor ? 'OK'
      : uniqueEx.length > 0 ? 'JS_ERROR'
      : !diag || !diag.hasEditor ? 'NO_EDITOR' : 'WARN';
    results.push({ file, status, diag, exceptions: uniqueEx, failed: [...new Set(failedResources)].slice(0, 3) });
    process.stdout.write(status[0]);
  }
  console.log('\n\n=== 详细结果 ===');
  for (const r of results) {
    if (r.status === 'OK') continue;
    console.log(`[${r.status}] ${r.file}`);
    if (r.diag) console.log('  DOM:', JSON.stringify(r.diag));
    if (r.exceptions.length) console.log('  JS :', r.exceptions.join(' | ').slice(0, 300));
    if (r.failed.length) console.log('  404:', r.failed.join(' | '));
  }
  const counts = results.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {});
  console.log('\n=== 汇总 ===', JSON.stringify(counts), '总计', results.length);
  ws.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
