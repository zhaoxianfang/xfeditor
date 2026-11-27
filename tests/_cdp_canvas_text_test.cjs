/**
 * CDP 回归：涂鸦弹窗按钮间距 + 文字工具输入/提交。
 * 用法：node tests/_cdp_canvas_text_test.cjs [port]
 */
const http = require('http');
const WebSocket = globalThis.WebSocket;
const PORT = Number(process.argv[2] || 9224);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  const targets = JSON.parse(await httpGet(`http://127.0.0.1:${PORT}/json/list`));
  const page = targets.find((target) => target.type === 'page');
  if (!page) throw new Error('NO_PAGE');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.onopen = resolve);
  let seq = 0;
  const waiting = new Map();
  const exceptions = [];
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') {
      const detail = message.params.exceptionDetails;
      exceptions.push((detail.exception && detail.exception.description) || detail.text || 'unknown');
    }
    if (message.id && waiting.has(message.id)) {
      waiting.get(message.id)(message);
      waiting.delete(message.id);
    }
  };
  const send = (method, params = {}) => new Promise((resolve) => {
    const id = ++seq;
    waiting.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.result && result.result.exceptionDetails) {
      throw new Error(JSON.stringify(result.result.exceptionDetails.exception || result.result.exceptionDetails));
    }
    return result.result && result.result.result && result.result.result.value;
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: 'file:///E:/www/xfeditor/examples/canvas-graffiti.html' });
  await sleep(1800);

  const opened = await evaluate(`(() => {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('a,button'));
    var button = buttons.find(function(el) { return el.getAttribute('title') === '涂鸦' || (el.className || '').indexOf('fa-yelp') >= 0; });
    if (!button) return false;
    button.click();
    return true;
  })()`);

  await sleep(700);
  const geometry = await evaluate(`(() => {
    var dialog = document.querySelector('.canvas-graffiti-dialog');
    var maxBtn = dialog && dialog.querySelector('.xf-cg-max-btn');
    var closeBtn = dialog && dialog.querySelector('.xf_editor-dialog-close');
    if (!maxBtn || !closeBtn) return null;
    var a = maxBtn.getBoundingClientRect();
    var b = closeBtn.getBoundingClientRect();
    return { gap: Math.round(b.left - a.right), overlap: !(a.right <= b.left || b.right <= a.left) };
  })()`);

  const textResult = await evaluate(`(function() {
    var dialog = document.querySelector('.canvas-graffiti-dialog');
    if (!dialog) return { error: 'NO_DIALOG' };
    var textBtn = dialog.querySelector('[data-act="text"]');
    if (!textBtn) return { error: 'NO_TEXT_BUTTON' };
    textBtn.click();
    var canvas = dialog.querySelector('.xf-cg-canvas');
    var rect = canvas.getBoundingClientRect();
    var options = { clientX: rect.left + 120, clientY: rect.top + 120, bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse' };
    var down = (typeof PointerEvent === 'function') ? new PointerEvent('pointerdown', options) : new MouseEvent('mousedown', options);
    canvas.dispatchEvent(down);
    var input = dialog.querySelector('.xf-cg-text-input');
    if (!input) return { error: 'NO_TEXT_INPUT' };
    input.value = '测试文字';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return {
      inputRemoved: !dialog.querySelector('.xf-cg-text-input'),
      selectActive: !!dialog.querySelector('[data-act="select"].xf-cg-toggle-on'),
      textActive: !!dialog.querySelector('[data-act="text"].xf-cg-toggle-on')
    };
  })()`);

  console.log(JSON.stringify({ opened, geometry, textResult, exceptions: exceptions.slice(0, 3) }, null, 2));
  ws.close();
})().catch((error) => { console.error('FATAL', error); process.exit(1); });
