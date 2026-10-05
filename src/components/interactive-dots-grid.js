// -----------------------------------------
// INTERACTIVE DOTS GRID
// initInteractiveDotsGridBackground(scope)    → sets up every grid inside `scope` (default: whole page)
// destroyInteractiveDotsGridBackground(scope) → tears down every grid inside `scope`
// -----------------------------------------

const interactiveDotsGrids = []; // { elements, destroy }

function initInteractiveDotsGridBackground(scope = document) {
  const elements = [...scope.querySelectorAll('[data-dots-canvas-init]')]
    .filter(element => !interactiveDotsGrids.some(grid => grid.elements.includes(element)));
  if (!elements.length) return;

  const gap = '1em';
  const dotSize = '0.078125em'; // 1.25px at a 16px font size
  const shape = 'circle'; // 'circle' or 'square'
  const dotColorInactive = 'var(--swatch--brand-300)';
  const dotColorActive = 'var(--swatch--brand-300)';
  const dotMaxScale = 3.5 / 1.25; // hovered dot: 0.21875em (3.5px at 16px)
  const pressScale = 1.5;
  const hoverRadius = 12;
  const easeDuration = 0.5;
  const followSpeed = 8; // how quickly the glow catches up with the pointer (higher = tighter)
  const trailLifetime = 0.7; // seconds a trail point keeps dots lit after the pointer passes
  const trailRadius = 0.6; // trail glow radius, relative to the hover radius
  const trailStrength = 0.85; // trail glow at its brightest, relative to the hover glow

  const hasPointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = { x: 0, y: 0, cx: 0, cy: 0, active: false };
  const trail = []; // { x, y, t }: where the glow has been, in viewport coordinates (like the dots)
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
    // At most one screen tall: it's moved to the visible part of the section as you
    // scroll (the dots are fixed to the viewport, so nothing off screen needs pixels)
    Object.assign(canvas.style, { position: 'absolute', left: 0, top: 0, width: '100%', pointerEvents: 'none' });

    const setPosition = getComputedStyle(element).position === 'static';
    if (setPosition) element.style.position = 'relative';

    element.prepend(canvas);
    canvases.push({
      element, canvas, ctx, setPosition, width: 0, elementHeight: 0, height: 0, offset: -1, visible: false,
      inactive: parseColor(element.getAttribute('data-dots-color-inactive') || dotColorInactive, element),
      get inactiveStyle() { return `rgba(${this.inactive.join(',')})`; },
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

    // Move the (screen-sized) canvas to the part of the section that's on screen.
    // Snapped to whole device pixels: a canvas at a fractional position gets resampled,
    // which blurs and lightens the 1-2px dots.
    const offset = Math.round(Math.min(Math.max(-rect.top, 0), Math.max(0, state.elementHeight - state.height)) * dpr) / dpr;
    if (offset !== state.offset) {
      state.offset = offset;
      state.canvas.style.transform = `translateY(${offset}px)`;
    }
    const left = rect.left;
    const top = rect.top + offset;
    const px = pointer.cx;
    const py = pointer.cy;
    const maxScale = dotMaxScale * (1 + (pressScale - 1) * press.value);
    const hovering = hasPointer && hover.value > 0;
    const ctx = state.ctx;

    // Trail points still glowing: position, glow strength (fades with age) and reach
    const now = performance.now();
    const trailRadiusPx = radius * trailRadius;
    const glow = [];
    let minX = px - radius, maxX = px + radius, minY = py - radius, maxY = py + radius;
    if (hovering) {
      for (const point of trail) {
        const life = 1 - (now - point.t) / (trailLifetime * 1000);
        if (life <= 0) continue;
        glow.push(point.x, point.y, life * life * trailStrength);
        minX = Math.min(minX, point.x - trailRadiusPx); maxX = Math.max(maxX, point.x + trailRadiusPx);
        minY = Math.min(minY, point.y - trailRadiusPx); maxY = Math.max(maxY, point.y + trailRadiusPx);
      }
    }

    // How lit a dot is: the pointer's glow or the strongest trail point near it
    const influenceAt = (gx, gy) => {
      if (!hovering || gx < minX || gx > maxX || gy < minY || gy > maxY) return 0;
      let value = Math.max(0, 1 - Math.hypot(gx - px, gy - py) / radius);
      for (let i = 0; i < glow.length; i += 3) {
        if (glow[i + 2] <= value) continue;
        const d = Math.hypot(gx - glow[i], gy - glow[i + 1]);
        if (d < trailRadiusPx) value = Math.max(value, (1 - d / trailRadiusPx) * glow[i + 2]);
      }
      return value * hover.value;
    };

    ctx.clearRect(0, 0, state.width, state.height);

    // Only draw the part of the canvas that is on screen
    const colStart = Math.floor(Math.max(left, 0) / spacing);
    const colEnd = Math.ceil(Math.min(left + state.width, innerWidth) / spacing);
    const rowStart = Math.floor(Math.max(top, 0) / spacing);
    const rowEnd = Math.ceil(Math.min(top + state.height, innerHeight) / spacing);

    // Resting dots all share one colour and size: draw them as a single path.
    // Dots near the pointer are drawn individually afterwards.
    const near = [];
    ctx.fillStyle = state.inactiveStyle;
    ctx.beginPath();
    for (let row = rowStart; row <= rowEnd; row++) {
      const gy = row * spacing;
      const y = gy - top;

      for (let col = colStart; col <= colEnd; col++) {
        const gx = col * spacing;
        const x = gx - left;
        const influence = influenceAt(gx, gy);

        if (influence > 0) { near.push(x, y, influence); continue; }
        if (shape === 'square') {
          ctx.rect(x - size / 2, y - size / 2, size, size);
        } else {
          ctx.moveTo(x + size / 2, y);
          ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        }
      }
    }
    ctx.fill();

    for (let i = 0; i < near.length; i += 3) {
      const x = near[i], y = near[i + 1], influence = near[i + 2];
      const currentSize = size * (1 + (maxScale - 1) * influence);
      ctx.fillStyle = mixColor(state.inactive, state.active, influence);
      if (shape === 'square') {
        ctx.fillRect(x - currentSize / 2, y - currentSize / 2, currentSize, currentSize);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, currentSize / 2, 0, Math.PI * 2);
        ctx.fill();
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
      const strength = 1 - Math.exp(-delta * followSpeed);
      pointer.cx += (pointer.x - pointer.cx) * strength;
      pointer.cy += (pointer.y - pointer.cy) * strength;
    }

    // Leave a trail point every half dot-spacing the glow travels; drop the faded ones
    if (!reduceMotion && pointer.active) {
      const last = trail[trail.length - 1];
      if (!last || Math.hypot(pointer.cx - last.x, pointer.cy - last.y) > spacing / 2) {
        trail.push({ x: pointer.cx, y: pointer.cy, t: time });
      }
    }
    while (trail.length && (time - trail[0].t > trailLifetime * 1000 || trail.length > 64)) trail.shift();

    renderAll(true);

    // Keep going only while something is still moving or fading; scrolling redraws on its own
    const moving = hover.value !== hover.to || press.value !== press.to || (hover.value > 0 && trail.length > 0) ||
      (hover.value > 0 && (Math.abs(pointer.x - pointer.cx) > 0.5 || Math.abs(pointer.y - pointer.cy) > 0.5));
    if (moving) raf = requestAnimationFrame(tick);
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
      state.elementHeight = rect.height;
      state.height = Math.min(rect.height, innerHeight);
      state.offset = -1;
      state.canvas.style.height = state.height + 'px';
      state.canvas.width = Math.round(rect.width * dpr);
      state.canvas.height = Math.round(state.height * dpr);
      state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });

    renderAll();
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
        trail.length = 0;
      } else {
        setEase(press, 0);
      }
    }

    if (pointer.active || hover.value !== hover.to || hover.value > 0) start();
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

    renderAll(true);
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

// Runs once per page load (scope/teardown functions above are available if ever needed).
// Wrapped so the DOMContentLoaded event isn't passed in as `scope`.
const bootInteractiveDotsGridBackground = () => initInteractiveDotsGridBackground();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootInteractiveDotsGridBackground); else bootInteractiveDotsGridBackground();