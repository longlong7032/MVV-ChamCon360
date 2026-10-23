// HTML to Figma - main thread (có quyền truy cập Figma API).
// Nhận cây node đã trích xuất từ ui.html và dựng thành frame / text / ảnh / vector.

figma.showUI(__html__, { width: 380, height: 620, themeColors: true });

const createdRoots = [];
// Constraints áp sau khi dựng xong cả cây: nếu đặt sớm, khi khung cha còn đổi kích thước
// (Fill co lại lúc thêm node anh em) thì con neo đáy/giữa sẽ bị trượt.
const pendingCons = [];
const fontCache = new Map();

const WEIGHT_STYLE = {
  100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium',
  600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black',
};

async function tryFont(family, style) {
  const key = family + '|' + style;
  if (fontCache.has(key)) return fontCache.get(key);
  let result = null;
  try {
    await figma.loadFontAsync({ family, style });
    result = { family, style };
  } catch (e) {
    result = null;
  }
  fontCache.set(key, result);
  return result;
}

async function resolveFont(family, weight, italic) {
  const w = Math.min(900, Math.max(100, Math.round(weight / 100) * 100));
  const base = WEIGHT_STYLE[w] || 'Regular';
  const styles = [];
  if (italic) styles.push(base === 'Regular' ? 'Italic' : base + ' Italic');
  styles.push(base);
  if (w >= 600) styles.push('Bold');
  styles.push('Regular');
  for (const fam of [family, 'Inter']) {
    for (const st of styles) {
      const f = await tryFont(fam, st);
      if (f) return f;
    }
  }
  const f = { family: 'Roboto', style: 'Regular' };
  await figma.loadFontAsync(f);
  return f;
}

function toPaint(f) {
  if (f.type === 'solid') {
    return { type: 'SOLID', color: { r: f.r, g: f.g, b: f.b }, opacity: f.a };
  }
  if (f.type === 'linear') {
    return {
      type: 'GRADIENT_LINEAR',
      gradientTransform: f.transform,
      gradientStops: f.stops,
    };
  }
  if (f.type === 'image' && f.bytes) {
    try {
      const img = figma.createImage(f.bytes);
      return { type: 'IMAGE', imageHash: img.hash, scaleMode: f.mode || 'FILL' };
    } catch (e) {
      return null;
    }
  }
  return null;
}

function toEffect(s) {
  return {
    type: s.inset ? 'INNER_SHADOW' : 'DROP_SHADOW',
    color: s.color,
    offset: { x: s.x, y: s.y },
    radius: Math.max(0, s.blur),
    spread: s.spread,
    visible: true,
    blendMode: 'NORMAL',
  };
}

function applyBox(frame, n) {
  frame.name = n.name || 'box';
  frame.fills = (n.fills || []).map(toPaint).filter(Boolean);
  frame.clipsContent = !!n.clip;
  if (n.opacity != null && n.opacity < 1) frame.opacity = n.opacity;

  if (n.radius) {
    const maxR = Math.min(n.w, n.h) / 2;
    const [tl, tr, br, bl] = n.radius.map((r) => Math.min(r, maxR));
    frame.topLeftRadius = tl;
    frame.topRightRadius = tr;
    frame.bottomRightRadius = br;
    frame.bottomLeftRadius = bl;
  }

  const b = n.border;
  if (b) {
    frame.strokes = [{ type: 'SOLID', color: { r: b.color.r, g: b.color.g, b: b.color.b }, opacity: b.color.a }];
    frame.strokeAlign = 'INSIDE';
    if (b.uniform) {
      frame.strokeWeight = b.top;
    } else {
      frame.strokeTopWeight = b.top;
      frame.strokeRightWeight = b.right;
      frame.strokeBottomWeight = b.bottom;
      frame.strokeLeftWeight = b.left;
    }
    if (b.dashed) frame.dashPattern = [Math.max(b.top, 2) * 2, Math.max(b.top, 2) * 2];
  }

  if (n.shadows && n.shadows.length) frame.effects = n.shadows.map(toEffect);
}

const isAuto = (p) => p.type === 'FRAME' && p.layoutMode && p.layoutMode !== 'NONE';

// Vị trí / ràng buộc / kích thước của node con tuỳ theo cha có Auto Layout hay không.
function place(node, n, parent, ox, oy) {
  const auto = isAuto(parent);
  if (auto && n.abs) node.layoutPositioning = 'ABSOLUTE';
  if (!auto || n.abs) {
    node.x = n.x - ox;
    node.y = n.y - oy;
    if (n.cons) pendingCons.push([node, n.cons]);
  }
}

function applySizing(node, n, parent) {
  if (!isAuto(parent) || n.abs || !n.sz) return;
  try { node.layoutSizingHorizontal = n.sz[0]; } catch (e) { /* bỏ qua */ }
  try { node.layoutSizingVertical = n.sz[1]; } catch (e) { /* bỏ qua */ }
}

function applyLayout(frame, lay) {
  frame.layoutMode = lay.dir === 'H' ? 'HORIZONTAL' : 'VERTICAL';
  if (lay.wrap) frame.layoutWrap = 'WRAP';
  // Wrap: bớt chút xíu để làm tròn số lẻ không đẩy phần tử cuối hàng xuống dòng mới
  frame.itemSpacing = lay.wrap ? Math.max(0, (lay.spacing || 0) - 0.1) : (lay.spacing || 0);
  if (lay.wrap) frame.counterAxisSpacing = lay.crossSpacing || 0;
  frame.paddingTop = lay.pad[0];
  frame.paddingRight = lay.pad[1];
  frame.paddingBottom = lay.pad[2];
  frame.paddingLeft = lay.pad[3];
  frame.primaryAxisAlignItems = lay.primary;
  frame.counterAxisAlignItems = lay.counter;
  frame.primaryAxisSizingMode = 'FIXED';
  frame.counterAxisSizingMode = 'FIXED';
}

async function buildText(n, parent, ox, oy) {
  const t = figma.createText();
  parent.appendChild(t);
  const font = await resolveFont(n.fontFamily, n.weight, n.italic);
  t.fontName = font;
  t.fontSize = Math.max(1, n.fontSize);
  t.characters = n.chars;
  t.name = n.chars.length > 24 ? n.chars.slice(0, 24) + '…' : n.chars;
  if (n.letterSpacing) t.letterSpacing = { value: n.letterSpacing, unit: 'PIXELS' };
  if (n.lineHeight) t.lineHeight = { value: n.lineHeight, unit: 'PIXELS' };
  t.textAlignHorizontal = n.align || 'LEFT';
  if (n.decoration === 'UNDERLINE' || n.decoration === 'STRIKETHROUGH') t.textDecoration = n.decoration;
  t.fills = [{ type: 'SOLID', color: { r: n.color.r, g: n.color.g, b: n.color.b }, opacity: n.color.a }];

  for (const r of n.runs || []) {
    const f = await resolveFont(r.fontFamily, r.weight, r.italic);
    t.setRangeFontName(r.start, r.end, f);
    t.setRangeFontSize(r.start, r.end, Math.max(1, r.fontSize));
    t.setRangeFills(r.start, r.end, [{ type: 'SOLID', color: { r: r.color.r, g: r.color.g, b: r.color.b }, opacity: r.color.a }]);
    t.setRangeTextDecoration(r.start, r.end, r.decoration === 'NONE' ? 'NONE' : r.decoration);
    t.setRangeLetterSpacing(r.start, r.end, { value: r.letterSpacing || 0, unit: 'PIXELS' });
  }

  const auto = isAuto(parent) && !n.abs;
  const wFill = auto && n.sz && n.sz[0] === 'FILL';
  if (n.hard) {
    // Đã chốt xuống dòng cứng theo trình duyệt: không cho Figma tự wrap thêm.
    t.textAutoResize = 'WIDTH_AND_HEIGHT';
    let ls0 = n.letterSpacing || 0;
    for (let i = 0; i < 8 && t.width > n.w; i++) {
      ls0 -= 0.1 * Math.max(1, n.fontSize / 12);
      t.letterSpacing = { value: ls0, unit: 'PIXELS' };
    }
    if (auto && parent.layoutMode === 'VERTICAL') {
      t.layoutAlign = n.align === 'CENTER' ? 'CENTER' : n.align === 'RIGHT' ? 'MAX' : 'MIN';
    }
    if (auto) return;
  } else if (n.multiline || wFill) {
    t.textAutoResize = 'HEIGHT';
    t.resize(Math.max(1, n.w), t.height);
    t.textAutoResize = 'HEIGHT';
    // Font trong Figma hơi rộng hơn trình duyệt nên dễ rớt thêm dòng: nén chữ nhẹ cho tới khi đủ số dòng.
    const want = n.lines && n.lineHeight ? n.lines * n.lineHeight : 0;
    let ls = n.letterSpacing || 0;
    for (let i = 0; want && i < 6 && t.height > want + 1; i++) {
      ls -= 0.1 * Math.max(1, n.fontSize / 12);
      t.letterSpacing = { value: ls, unit: 'PIXELS' };
    }
  } else {
    t.textAutoResize = 'WIDTH_AND_HEIGHT';
  }
  if (auto) {
    if (wFill) { try { t.layoutSizingHorizontal = 'FILL'; } catch (e) { /* bỏ qua */ } }
    return;
  }
  t.x = n.x - ox;
  if (n.hard) t.x += n.align === 'CENTER' ? (n.w - t.width) / 2 : n.align === 'RIGHT' ? n.w - t.width : 0;
  t.y = n.y + n.h / 2 - t.height / 2 - oy;
  if (n.abs && isAuto(parent)) t.layoutPositioning = 'ABSOLUTE';
}

const hasFill = (n) => (n.fills || []).some((f) => f.type !== 'solid' || f.a > 0);

// Frame không có nền mà đặt shadow thì Figma đổ bóng lên cả con (chữ bị đúp). Thay bằng
// hình "bóng trừ hộp" nằm sau frame, giống CSS (bóng chỉ hiện ngoài viền).
function buildOuterShadows(n, parent, ox, oy) {
  const auto = isAuto(parent);
  // Dựng trong frame bọc riêng (không Auto Layout) để vị trí hình bóng không bị Auto Layout của cha xê dịch.
  const wrap = figma.createFrame();
  parent.appendChild(wrap);
  wrap.name = 'shadow';
  wrap.fills = [];
  wrap.clipsContent = false;
  wrap.resize(Math.max(0.01, n.w), Math.max(0.01, n.h));
  if (auto) wrap.layoutPositioning = 'ABSOLUTE';
  wrap.x = n.x - ox;
  wrap.y = n.y - oy;
  for (const sh of n.shadows) {
    if (sh.inset) continue;
    const mk = (x, y, w, h) => {
      const r = figma.createRectangle();
      wrap.appendChild(r);
      r.resize(Math.max(0.01, w), Math.max(0.01, h));
      r.x = x;
      r.y = y;
      if (n.radius) {
        const maxR = Math.min(w, h) / 2;
        const [tl, tr, br, bl] = n.radius.map((v) => Math.min(v, maxR));
        r.topLeftRadius = tl; r.topRightRadius = tr; r.bottomRightRadius = br; r.bottomLeftRadius = bl;
      }
      return r;
    };
    const sp = sh.spread || 0;
    const shape = mk(sh.x - sp, sh.y - sp, n.w + sp * 2, n.h + sp * 2);
    shape.fills = [{ type: 'SOLID', color: { r: sh.color.r, g: sh.color.g, b: sh.color.b }, opacity: sh.color.a }];
    const hole = mk(0, 0, n.w, n.h);
    const cut = figma.subtract([shape, hole], wrap);
    cut.name = 'shadow';
    if (sh.blur > 0) cut.effects = [{ type: 'LAYER_BLUR', radius: sh.blur / 2, visible: true }];
  }
}

async function buildNode(n, parent, ox, oy) {
  if (n.t === 'text') return buildText(n, parent, ox, oy);

  if (n.t === 'svg') {
    try {
      const s = figma.createNodeFromSvg(n.svg);
      parent.appendChild(s);
      s.name = n.name || 'svg';
      place(s, n, parent, ox, oy);
      if (n.opacity != null && n.opacity < 1) s.opacity = n.opacity;
    } catch (e) {
      const r = figma.createRectangle();
      parent.appendChild(r);
      r.name = 'svg (lỗi)';
      r.resize(Math.max(1, n.w), Math.max(1, n.h));
      place(r, n, parent, ox, oy);
      r.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
    }
    return;
  }

  // box (kể cả ảnh / icon: ảnh là fill của box)
  if (n.shadows && n.shadows.length && !hasFill(n)) {
    try { buildOuterShadows(n, parent, ox, oy); } catch (e) { /* bỏ qua bóng */ }
    n = Object.assign({}, n, { shadows: [] });
  }
  const frame = figma.createFrame();
  parent.appendChild(frame);
  frame.resize(Math.max(0.01, n.w), Math.max(0.01, n.h));
  applyBox(frame, n);
  if (n.layout) {
    applyLayout(frame, n.layout);
    frame.resize(Math.max(0.01, n.w), Math.max(0.01, n.h));
  }
  place(frame, n, parent, ox, oy);
  applySizing(frame, n, parent);
  for (const c of n.children || []) await buildNode(c, frame, n.x, n.y);
}

async function importTree(msg) {
  const root = msg.tree;
  let startX = 0;
  for (const c of figma.currentPage.children) startX = Math.max(startX, c.x + c.width + 100);

  const frame = figma.createFrame();
  figma.currentPage.appendChild(frame);
  frame.resize(Math.max(1, root.w), Math.max(1, root.h));
  frame.x = startX;
  frame.y = 0;
  applyBox(frame, root);
  if (root.layout) {
    applyLayout(frame, root.layout);
    frame.resize(Math.max(1, root.w), Math.max(1, root.h));
  }
  frame.name = msg.name || root.name || 'HTML';
  for (const c of root.children || []) await buildNode(c, frame, 0, 0);
  for (const [node, cons] of pendingCons.splice(0)) {
    try { node.constraints = cons; } catch (e) { /* bỏ qua */ }
  }
  createdRoots.push(frame);
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'import') {
    try {
      await importTree(msg);
      figma.ui.postMessage({ type: 'imported', id: msg.id });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', id: msg.id, message: String((e && e.message) || e) });
    }
  } else if (msg.type === 'finish') {
    if (createdRoots.length) {
      figma.currentPage.selection = createdRoots;
      figma.viewport.scrollAndZoomIntoView(createdRoots);
      figma.notify('Đã nhập ' + createdRoots.length + ' trang HTML vào Figma');
    }
    createdRoots.length = 0;
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};
