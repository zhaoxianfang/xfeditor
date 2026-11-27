/* CDP 驱动：验证 v2.1.0 安全加固与缺陷修复（多实例 state / 别名 / XSS / destroy） */
const http = require('http');
const WebSocket = globalThis.WebSocket;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getTargets() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9223/json/list', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

(async () => {
  const targets = await getTargets();
  const page = targets.find((t) => t.type === 'page' && t.url.indexOf('sync-scroll-repro') >= 0);
  if (!page) { console.error('未找到测试页面'); process.exit(1); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let seq = 0; const waiting = new Map();
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && waiting.has(message.id)) { waiting.get(message.id)(message); waiting.delete(message.id); }
  };
  const send = (method, params = {}) => new Promise((resolve) => {
    const id = ++seq; waiting.set(id, resolve); ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.result && response.result.exceptionDetails) throw new Error(JSON.stringify(response.result.exceptionDetails.exception && response.result.exceptionDetails.exception.description));
    return response.result && response.result.result && response.result.result.value;
  };

  await send('Runtime.enable');
  await send('Page.reload', { ignoreCache: true });
  await sleep(1500);
  for (let attempt = 0; attempt < 60; attempt++) {
    if (await evaluate('!!(window.__ready && window.__editor && window.__editor.cm)')) break;
    await sleep(250);
  }

  // 1. 别名清理验证
  const aliases = await evaluate(`({
    escapeHTML: typeof xfEditor.escapeHTML,
    escapeAttr: typeof xfEditor.escapeAttr,
    wordsFirstUpperCase: typeof xfEditor.wordsFirstUpperCase,
    ucfirst: typeof xfEditor.ucfirst,
    versionName: typeof xfEditor.versionName,
    getPreviewedHTMLAlias: typeof window.getPreviewedHTML,
    version: xfEditor.version,
    escapeHtml: typeof xfEditor.escapeHtml,
    escapeMarkdownText: typeof xfEditor.escapeMarkdownText
  })`);
  console.log('别名清理:', JSON.stringify(aliases));

  // 2. 多实例 state 隔离验证（DOM 中动态添加第二个 textarea）
  const stateIsolation = await evaluate(`(() => {
    var ta = document.createElement('textarea');
    ta.id = 'editor2'; ta.value = '# test';
    document.body.appendChild(ta);
    try {
      var ed2 = xfEditor('editor2', { watch: false });
      var e1 = window.__editor;
      // 修改实例1的 state，实例2 不应受影响
      e1.state.fullscreen = true;
      e1.state.watching = true;
      var isolated = (ed2.state.fullscreen === false && ed2.state.watching === false);
      var differentObjects = (e1.state !== ed2.state);
      ed2.destroy();
      ta.remove();
      return { isolated: isolated, differentObjects: differentObjects };
    } catch (e) { try { ta.remove(); } catch (_) {} return { error: String(e) }; }
  })()`);
  console.log('多实例 state 隔离:', JSON.stringify(stateIsolation));

  // 3. XSS 协议白名单验证
  const xss = await evaluate(`(() => {
    var samples = [
      '<a href="javascript:alert(1)">x</a>',
      '<a href="data:text/html,<script>alert(1)</script>">x</a>',
      '<a href="jar:http://evil/x!/">x</a>',
      '<a href="https://safe.example.com">ok</a>',
      '<img src="data:image/png;base64,AAAA">',
      '<img src="data:image/svg+xml,<svg onload=alert(1)>">',
      '<p onclick="alert(1)">x</p>'
    ];
    return samples.map(function(s) { return xfEditor.filterHTMLTags(s, 'all'); });
  })()`);
  console.log('XSS 过滤结果:', JSON.stringify(xss));

  // 4. destroy 后监听清理验证
  const destroyTest = await evaluate(`(() => {
    var ta = document.createElement('textarea');
    ta.id = 'editor3'; ta.value = '# destroy test';
    document.body.appendChild(ta);
    try {
      var ed = xfEditor('editor3', { watch: true, syncScroll: true });
      ed.bindSyncScroll();
      var bound = ed._scrollSyncBound;
      ed.destroy();
      var after = { bound: ed._scrollSyncBound, cm: ed.cm, dragBound: ed._dragBound };
      ta.remove();
      return { before: bound, after: after };
    } catch (e) { try { ta.remove(); } catch (_) {} return { error: String(e) }; }
  })()`);
  console.log('destroy 清理:', JSON.stringify(destroyTest));

  ws.close();
})().catch((e) => { console.error('测试失败:', e.message); process.exit(1); });
