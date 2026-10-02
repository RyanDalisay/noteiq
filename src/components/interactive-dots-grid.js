// -----------------------------------------
// INTERACTIVE DOTS GRID (Barba-aware)
// initInteractiveDotsGridBackground(scope)    → sets up every grid inside `scope` (default: whole page)
// destroyInteractiveDotsGridBackground(scope) → tears down every grid inside `scope`
// -----------------------------------------

const interactiveDotsGrids = []; // { elements, destroy }

function initInteractiveDotsGridBackground(scope = document) {
  const elements = [...scope.querySelectorAll('[data-dots-canvas-init]')]
    .filter(element => !interactiveDotsGrids.some(grid => grid.elements.includes(element)));
  if (!elements.length) return;

  const gap = '1em';
  const dotSize = '0.125em';
  const shape = 'circle'; // 'circle' or 'square'
  const dotColorInactive = 'var(--swatch--morning-slate-brand-500)';
  const dotColorActive = 'rgba(0, 0, 0, 0.75)';
  const dotMaxScale = 1.75;
  const pressScale = 1.5;
  const hoverRadius = 12;
  const easeDuration = 0.5;

  const hasPointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const pointer = { x: 0, y: 0, cx: 0, cy: 0, active: false };
  const hover = { value: 0, from: 0, to: 0, start: 0 };
  const press = { value: 0, from: 0, to: 0, start: 0 };
  const canvases = [];

  let dpr, size, spacing, radius, raf, scrollRaf, destroyed = false, lastTime = performance.now();

  function toPx(value, element) {
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;width:${value};`;
    element.appendChild(probe);
    const px = probe.getBoundingClientRect().width;
    probe.remove();
    return px;
  }

  function parseColor(color, element) {
    const probe = document.createElement('span');
    probe.style.color = color;
    element.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = resolved;
    ctx.fillRect(0, 0, 1, 1);

    const data = [...ctx.getImageData(0, 0, 1, 1).data];
    data[3] /= 255;
    return data;
  }

  function mixColor(a, b, p) {
    return `rgba(${a.map((v, i) => v + (b[i] - v) * p).join(',')})`;
  }

  function setEase(state, to) {
    Object.assign(state, { from: state.value, to, start: performance.now() });
  }

  function updateEase(state, time) {
    if (!easeDuration) return state.value = state.to;
    const p = Math.min(Math.max((time - state.start) / (easeDuration * 1000), 0), 1);
    state.value = state.from + (state.to - state.from) * (1 - Math.pow(1 - p, 4));
  }

  elements.forEach((element) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' });

    const setPosition = getComputedStyle(element).position === 'static';
    if (setPosition) element.style.position = 'relative';

    element.prepend(canvas);
    canvases.push({
      element, canvas, ctx, setPosition, width: 0, height: 0, visible: false,
      inactive: parseColor(element.getAttribute('data-dots-color-inactive') || dotColorInactive, element),
      active: parseColor(element.getAttribute('data-dots-color-active') || dotColorActive, element)
    });
  });

  function pointerInside() {
    return canvases.some(({ element }) => {
      const r = element.getBoundingClientRect();
      return pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom;
    });
  }

  // The grid is anchored to the viewport, not the section, so the dots stay
  // fixed in the background while the section scrolls over them.
  function render(state) {
    const rect = state.element.getBoundingClientRect();
    const left = rect.left;
    const top = rect.top;
    const px = pointer.cx;
    const py = pointer.cy;
    const maxScale = dotMaxScale * (1 + (pressScale - 1) * press.value);

    state.ctx.clearRect(0, 0, state.width, state.height);

    // Only draw the part of the section that is on screen
    const colStart = Math.floor(Math.max(left, 0) / spacing);
    const colEnd = Math.ceil(Math.min(left + state.width, innerWidth) / spacing);
    const rowStart = Math.floor(Math.max(top, 0) / spacing);
    const rowEnd = Math.ceil(Math.min(top + state.height, innerHeight) / spacing);

    for (let row = rowStart; row <= rowEnd; row++) {
      const gy = row * spacing;
      const y = gy - top;

      for (let col = colStart; col <= colEnd; col++) {
        const gx = col * spacing;
        const x = gx - left;
        const influence = hasPointer && hover.value ? Math.max(0, 1 - Math.hypot(gx - px, gy - py) / radius) * hover.value : 0;
        const currentSize = size * (1 + (maxScale - 1) * influence);

        state.ctx.fillStyle = mixColor(state.inactive, state.active, influence);

        if (shape === 'square') {
          state.ctx.fillRect(x - currentSize / 2, y - currentSize / 2, currentSize, currentSize);
        } else {
          state.ctx.beginPath();
          state.ctx.arc(x, y, currentSize / 2, 0, Math.PI * 2);
          state.ctx.fill();
        }
      }
    }
  }

  function renderAll(visibleOnly = false) {
    canvases.forEach(state => (!visibleOnly || state.visible) && render(state));
  }

  function tick(time) {
    raf = null;
    if (!canvases.some(state => state.visible)) return;

    const delta = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    updateEase(hover, time);
    updateEase(press, time);

    if (!easeDuration) {
      pointer.cx = pointer.x;
      pointer.cy = pointer.y;
    } else {
      const strength = 1 - Math.exp(-delta * 6 / easeDuration);
      pointer.cx += (pointer.x - pointer.cx) * strength;
      pointer.cy += (pointer.y - pointer.cy) * strength;
    }

    renderAll(true);
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (hasPointer && !destroyed && !raf && canvases.some(state => state.visible)) {
      lastTime = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    size = toPx(dotSize, elements[0]);
    spacing = size + toPx(gap, elements[0]);
    radius = spacing * hoverRadius;

    canvases.forEach(state => {
      const rect = state.element.getBoundingClientRect();
      state.width = rect.width;
      state.height = rect.height;
      state.canvas.width = Math.round(rect.width * dpr);
      state.canvas.height = Math.round(rect.height * dpr);
      state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });

    renderAll();
    start();
  }

  function onPointerMove(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;

    const inside = pointerInside();

    if (inside !== pointer.active) {
      pointer.active = inside;
      setEase(hover, +inside);

      if (inside) {
        pointer.cx = pointer.x;
        pointer.cy = pointer.y;
      } else {
        setEase(press, 0);
      }
    }

    start();
  }

  // Redraw on scroll so the dots stay put (at most once per frame; the hover
  // loop already redraws every frame while it runs)
  function onScroll() {
    if (destroyed || raf || scrollRaf || !canvases.some(state => state.visible)) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;
      renderAll(true);
    });
  }

  const onPointerDown = () => pointer.active && setEase(press, 1);
  const onPointerUp = () => setEase(press, 0);

  if (hasPointer) {
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
  }

  const intersectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = canvases.find(state => state.element === entry.target);
      if (state) state.visible = entry.isIntersecting;
    });

    hasPointer ? start() : renderAll(true);
  });

  const resizeObserver = new ResizeObserver(resize);

  elements.forEach(element => {
    intersectionObserver.observe(element);
    resizeObserver.observe(element);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resize);
  resize();

  interactiveDotsGrids.push({
    elements,
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      raf = scrollRaf = null;

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();

      // Put the markup back the way Webflow rendered it, so it can be set up again
      canvases.forEach(state => {
        state.canvas.remove();
        if (state.setPosition) state.element.style.position = '';
      });
    }
  });
}

function destroyInteractiveDotsGridBackground(scope = document) {
  for (let i = interactiveDotsGrids.length - 1; i >= 0; i--) {
    const grid = interactiveDotsGrids[i];
    if (scope !== document && !grid.elements.some(element => scope.contains(element))) continue;

    grid.destroy();
    interactiveDotsGrids.splice(i, 1);
  }
}

// First page load. After that, barba.js sets up / tears down grids on each page change.
// Wrapped so the DOMContentLoaded event isn't passed in as `scope`.
const bootInteractiveDotsGridBackground = () => initInteractiveDotsGridBackground();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootInteractiveDotsGridBackground); else bootInteractiveDotsGridBackground();