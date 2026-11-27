/* 用压缩产物 xf_editor.min.js 复测双向同步，确保构建产物与源码一致 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = globalThis.WebSocket;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

http.get('http://127.0.0.1:9223/json/list', (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', async () => {
    const page = JSON.parse(data).find((item) => item.url.indexOf('sync-scroll-repro') >= 0);
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve) => (ws.onopen = resolve));
    let seq = 0;
    const waiting = new Map();
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && waiting.has(message.id)) {
        waiting.get(message.id)(message);
        waiting.delete(message.id);
      }
    };
    const send = (method, params = {}) =>
      new Promise((resolve) => {
        const id = ++seq;
        waiting.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    const evaluate = async (expression) => {
      const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (response.result && response.result.exceptionDetails) throw new Error(JSON.stringify(response.result.exceptionDetails));
      return response.result && response.result.result && response.result.result.value;
    };

    const html = fs.readFileSync(path.join(__dirname, 'sync-scroll-repro.html'), 'utf8')
      .replace('../xf_editor.js', '../xf_editor.min.js');
    fs.writeFileSync(path.join(__dirname, 'sync-scroll-repro-min.html'), html, 'utf8');

    await send('Page.navigate', { url: 'file:///E:/www/xfeditor/tests/sync-scroll-repro-min.html' });
    await sleep(2000);
    for (let attempt = 0; attempt < 40; attempt++) {
      if (await evaluate('!!(window.__ready && window.__editor && window.__editor.cm)')) break;
      await sleep(250);
    }

    const semanticExpr = `(() => {
      var editor = window.__editor;
      var cm = editor.cm;
      var scrollEl = editor.preview[0];
      var container = editor.previewContainer[0];
      var info = cm.getScrollInfo();
      var centerLine = cm.lineAtHeight(info.top + info.clientHeight / 2, 'local');
      var previewCenter = scrollEl.scrollTop + scrollEl.clientHeight / 2;
      var scrollRect = scrollEl.getBoundingClientRect();
      var blocks = container.querySelectorAll('[data-line]');
      var best = null, bestDist = Infinity, bestTop = 0, bestBottom = 0;
      for (var i = 0; i < blocks.length; i++) {
        var rect = blocks[i].getBoundingClientRect();
        var top = scrollEl.scrollTop + (rect.top - scrollRect.top);
        var bottom = top + rect.height;
        var dist = previewCenter < top ? top - previewCenter : (previewCenter > bottom ? previewCenter - bottom : 0);
        if (dist < bestDist) { bestDist = dist; best = blocks[i]; bestTop = top; bestBottom = bottom; }
      }
      var blockLine = null;
      if (best) {
        var startLine = parseInt(best.getAttribute('data-line'), 10);
        var endAttr = best.getAttribute('data-line-end');
        var endLine = endAttr == null ? startLine : parseInt(endAttr, 10);
        if (!isFinite(startLine)) startLine = null;
        if (endLine == null || !isFinite(endLine) || endLine <= startLine) endLine = startLine;
        if (startLine != null) {
          var ratio = Math.max(0, Math.min(1, (previewCenter - bestTop) / Math.max(1, bestBottom - bestTop)));
          blockLine = startLine + (endLine - startLine) * ratio;
        }
      }
      return { editor: Math.round(centerLine), preview: blockLine == null ? null : Math.round(blockLine), diff: blockLine == null ? null : Math.round(centerLine - blockLine) };
    })()`;

    console.log('压缩产物版本检查:', await evaluate('window.xfEditor.version'));
    for (const ratio of [0.2, 0.5, 0.8]) {
      await evaluate(`(() => {
        var editor = window.__editor;
        var info = editor.cm.getScrollInfo();
        editor.cm.scrollTo(0, (info.height - info.clientHeight) * ${ratio});
        return true;
      })()`);
      await sleep(400);
      console.log(`min 正向 [${ratio * 100}%]:`, JSON.stringify(await evaluate(semanticExpr)));
    }
    for (const ratio of [0.2, 0.5, 0.8]) {
      await evaluate(`(() => {
        var editor = window.__editor;
        var scrollEl = editor.preview[0];
        scrollEl.scrollTop = (scrollEl.scrollHeight - scrollEl.clientHeight) * ${ratio};
        return true;
      })()`);
      await sleep(400);
      console.log(`min 反向 [${ratio * 100}%]:`, JSON.stringify(await evaluate(semanticExpr)));
    }
    ws.close();
  });
});
