/* CDP 驱动：验证 xfEditor 左右分栏双向同步滚动（不修改被测代码） */
const http = require('http');
const WebSocket = globalThis.WebSocket;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getTargets() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

(async () => {
  const targets = await getTargets();
  const page = targets.find((target) => target.type === 'page' && target.url.indexOf('sync-scroll-repro') >= 0);
  if (!page) {
    console.error('未找到测试页面', targets.map((target) => target.url));
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

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
    const response = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (response.result && response.result.exceptionDetails) {
      throw new Error(JSON.stringify(response.result.exceptionDetails));
    }
    return response.result && response.result.result && response.result.result.value;
  };

  await send('Runtime.enable');
  await send('Page.reload', { ignoreCache: true });
  await sleep(1500);
  for (let attempt = 0; attempt < 60; attempt++) {
    const ready = await evaluate('!!(window.__ready && window.__editor && window.__editor.cm)');
    if (ready) break;
    await sleep(250);
  }

  const snapshotExpr = `(() => {
    var editor = window.__editor;
    var info = editor.cm.getScrollInfo();
    var scrollEl = editor.preview[0];
    return {
      cmTop: Math.round(info.top),
      cmMax: Math.round(Math.max(0, info.height - info.clientHeight)),
      pvTop: Math.round(scrollEl.scrollTop),
      pvMax: Math.round(Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight)),
      bound: !!editor._scrollSyncBound,
      master: editor._syncState ? editor._syncState.__masterZoneForTest : 'n/a'
    };
  })()`;

  console.log('初始状态:', JSON.stringify(await evaluate(snapshotExpr)));
  const mapDiag = await evaluate(`(() => {
    var editor = window.__editor;
    var state = editor._syncState;
    state._invalidateAnchors();
    var table = state._getAnchorTable();
    return {
      total: table.length,
      head: table.slice(0, 6),
      tail: table.slice(-6)
    };
  })()`);
  console.log('映射表诊断:', JSON.stringify(mapDiag));

  for (const ratio of [0.2, 0.5, 0.8]) {
    await evaluate(`(() => {
      var editor = window.__editor;
      var info = editor.cm.getScrollInfo();
      editor.cm.scrollTo(0, (info.height - info.clientHeight) * ${ratio});
      return true;
    })()`);
    await sleep(400);
    const state = await evaluate(snapshotExpr);
    const expected = Math.round(state.pvMax * ratio);
    const delta = state.pvTop - expected;
    console.log(
      `编辑区滚动 -> 预览区 [${ratio * 100}%]: cmTop=${state.cmTop}/${state.cmMax}, pvTop=${state.pvTop}/${state.pvMax}, 期望≈${expected}, 偏差=${delta}`
    );
  }

  for (const ratio of [0.2, 0.5, 0.8]) {
    await evaluate(`(() => {
      var editor = window.__editor;
      var scrollEl = editor.preview[0];
      scrollEl.scrollTop = (scrollEl.scrollHeight - scrollEl.clientHeight) * ${ratio};
      return true;
    })()`);
    await sleep(400);
    const state = await evaluate(snapshotExpr);
    const expected = Math.round(state.cmMax * ratio);
    const delta = state.cmTop - expected;
    console.log(
      `预览区滚动 -> 编辑区 [${ratio * 100}%]: pvTop=${state.pvTop}/${state.pvMax}, cmTop=${state.cmTop}/${state.cmMax}, 期望≈${expected}, 偏差=${delta}`
    );
  }

  // 语义对齐：编辑区视口中心的源码行 vs 预览区视口中心按块起止行插值得到的源码行
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
    return {
      editorCenterLine: Math.round(centerLine),
      previewBlockLine: blockLine == null ? null : Math.round(blockLine),
      diffLines: blockLine == null ? null : Math.round(centerLine - blockLine)
    };
  })()`;

  for (const ratio of [0.2, 0.5, 0.8]) {
    await evaluate(`(() => {
      var editor = window.__editor;
      var info = editor.cm.getScrollInfo();
      editor.cm.scrollTo(0, (info.height - info.clientHeight) * ${ratio});
      return true;
    })()`);
    await sleep(400);
    console.log(`语义对齐 [${ratio * 100}%]:`, JSON.stringify(await evaluate(semanticExpr)));
  }

  for (const ratio of [0.2, 0.5, 0.8]) {
    await evaluate(`(() => {
      var editor = window.__editor;
      var scrollEl = editor.preview[0];
      scrollEl.scrollTop = (scrollEl.scrollHeight - scrollEl.clientHeight) * ${ratio};
      return true;
    })()`);
    await sleep(400);
    console.log(`反向语义对齐 [${ratio * 100}%]:`, JSON.stringify(await evaluate(semanticExpr)));
  }

  // 真实滚轮：动态取坐标，避免页面自身滚动导致坐标失效
  const coords = await evaluate(`(() => {
    window.scrollTo(0, 0);
    var editor = window.__editor;
    editor.cm.scrollTo(0, 0);
    editor.preview[0].scrollTop = 0;
    var er = editor.editor[0].getBoundingClientRect();
    var pr = editor.preview[0].getBoundingClientRect();
    return {
      editor: { x: Math.round(er.x + er.width / 2), y: Math.round(er.y + er.height / 2) },
      preview: { x: Math.round(pr.x + pr.width / 2), y: Math.round(pr.y + pr.height / 2) }
    };
  })()`);
  console.log('滚轮坐标:', JSON.stringify(coords));
  await sleep(500);
  const beforeWheel = await evaluate(snapshotExpr);
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: coords.editor.x, y: coords.editor.y, deltaX: 0, deltaY: 800 });
  await sleep(600);
  const afterEditorWheel = await evaluate(snapshotExpr);
  console.log('真实滚轮(编辑区): 前', JSON.stringify(beforeWheel), '后', JSON.stringify(afterEditorWheel));

  const hitDiag = await evaluate(`(() => {
    var editor = window.__editor;
    var scrollEl = editor.preview[0];
    var inner = editor.previewContainer[0];
    var hit = document.elementFromPoint(${coords.preview.x}, ${coords.preview.y});
    function info(el) {
      if (!el) return null;
      var style = getComputedStyle(el);
      return { cls: String(el.className).slice(0, 70), overflow: style.overflow, ch: el.clientHeight, sh: el.scrollHeight, st: el.scrollTop, z: style.zIndex };
    }
    var chain = [];
    var node = hit;
    while (node && chain.length < 6) { chain.push(info(node)); node = node.parentElement; }
    return { scrollEl: info(scrollEl), inner: info(inner), chain: chain };
  })()`);
  console.log('预览命中诊断:', JSON.stringify(hitDiag));

  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: coords.preview.x, y: coords.preview.y, deltaX: 0, deltaY: 800 });
  await sleep(600);
  const afterPreviewWheel = await evaluate(snapshotExpr);
  console.log('真实滚轮(预览区): 后', JSON.stringify(afterPreviewWheel));

  await sleep(1200);
  const beforeExpiredWheel = await evaluate(snapshotExpr);
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: coords.preview.x, y: coords.preview.y, deltaX: 0, deltaY: 800 });
  await sleep(600);
  const afterExpiredWheel = await evaluate(snapshotExpr);
  console.log('等待期望值过期后滚轮(预览区): 前', JSON.stringify(beforeExpiredWheel), '后', JSON.stringify(afterExpiredWheel));

  ws.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
