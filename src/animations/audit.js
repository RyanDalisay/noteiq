/* =====================================================================
   NoteIQ — Compliance & Security animation (/home-2)
   A visit note is completed field by field, each change is logged to an
   audit trail, and the note is signed and locked as survey readiness
   reaches 100%. Loops while on screen; pauses off screen and while its
   panel is faded out; reduced motion shows the finished state.
   Mount: add  data-niq-anim="audit"  to an empty Div Block in Webflow.
   ===================================================================== */
(function () {
    'use strict';

    /* ---- component markup ---- */
    var AU_LABEL = "Animated illustration: a visit note is completed field by field, each change is logged to an audit trail, and the note is signed and locked as survey readiness reaches 100%.";
    var AU_MARKUP = "<div class=\"au-wrap\"><div class=\"au-stage\"><svg class=\"au-fx\" viewBox=\"0 0 1000 1000\" aria-hidden=\"true\"></svg><div class=\"au-card au-note\"><div class=\"au-hd\"><div class=\"au-av\">MS</div><div><div class=\"au-name\">Maria Santos</div><div class=\"au-meta\">Routine home care visit</div></div><div class=\"au-state\"><span class=\"au-draft\">Draft</span><span class=\"au-lock\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"4\" y=\"11\" width=\"16\" height=\"10\" rx=\"2\"/><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"/></svg>Locked</span></div></div><div class=\"au-rows\"><div class=\"au-row\"><div class=\"au-lab\">Pain assessment</div><div class=\"au-val\">3/10, resting comfortably</div><div class=\"au-pill\"><span class=\"au-req\">Required</span><span class=\"au-done\">Complete</span></div></div><div class=\"au-row\"><div class=\"au-lab\">Medications</div><div class=\"au-val\">12 of 12 reconciled</div><div class=\"au-pill\"><span class=\"au-req\">Required</span><span class=\"au-done\">Complete</span></div></div><div class=\"au-row\"><div class=\"au-lab\">Plan of care</div><div class=\"au-val\">Reviewed with IDG updates</div><div class=\"au-pill\"><span class=\"au-req\">Required</span><span class=\"au-done\">Complete</span></div></div><div class=\"au-row\"><div class=\"au-lab\">Caregiver education</div><div class=\"au-val\">Daughter, Ana</div><div class=\"au-pill\"><span class=\"au-req\">Required</span><span class=\"au-done\">Complete</span></div></div></div><div class=\"au-sign\"><div class=\"au-siglab\">Clinician signature</div><div class=\"au-sigline\"><span class=\"au-sig\">Jamie Lee, RN</span></div></div></div><div class=\"au-card au-ready\"><svg class=\"au-ring\" viewBox=\"0 0 120 120\"><circle cx=\"60\" cy=\"60\" r=\"50\" class=\"au-track\"/><circle cx=\"60\" cy=\"60\" r=\"50\" class=\"au-prog\"/></svg><div><div class=\"au-pct\"><span class=\"au-num\">0</span>%</div><div class=\"au-rlab\">Survey ready</div><div class=\"au-badge\">Audit-ready</div></div></div><div class=\"au-card au-audit\"><div class=\"au-atitle\"><svg viewBox=\"0 0 24 24\" width=\"26\" height=\"26\" fill=\"none\" stroke=\"#5D3FD3\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 3-6.7L3 8\"/><path d=\"M3 3v5h5\"/><path d=\"M12 7v5l3 2\"/></svg>Audit trail</div><div class=\"au-list\"><div class=\"au-ent\"><div class=\"au-et\">Signed and locked</div><div class=\"au-em\">09:31 AM&nbsp;&nbsp;J. Lee, RN</div></div><div class=\"au-ent\"><div class=\"au-et\">Education added</div><div class=\"au-em\">09:27 AM&nbsp;&nbsp;J. Lee, RN</div></div><div class=\"au-ent\"><div class=\"au-et\">Care plan reviewed</div><div class=\"au-em\">09:22 AM&nbsp;&nbsp;J. Lee, RN</div></div><div class=\"au-ent\"><div class=\"au-et\">Meds reconciled</div><div class=\"au-em\">09:15 AM&nbsp;&nbsp;J. Lee, RN</div></div><div class=\"au-ent\"><div class=\"au-et\">Pain assessed</div><div class=\"au-em\">09:08 AM&nbsp;&nbsp;J. Lee, RN</div></div></div></div></div></div>";

    /* ---- animation ---- */
    function auInit(root) {
        if (root.classList.contains('au-ready')) return;
        root.classList.add('au-ready');
        var wrap = root.querySelector('.au-wrap');
        var stage = wrap.querySelector('.au-stage'), fx = wrap.querySelector('.au-fx'), NS = 'http://www.w3.org/2000/svg';

        // the artwork is drawn at 1000 x 1000 and scaled to fit
        function fit() { stage.style.transform = 'scale(' + (wrap.clientWidth / 1000) + ')'; }
        fit();
        if (window.ResizeObserver) (root._ro = new ResizeObserver(fit)).observe(wrap);

        // background: halftone + waves (static)
        function mk(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; }
        function dots(cx, cy, reach, color, max, op) {
            var g = mk('g', { fill: color, opacity: op }, fx);
            for (var y = 10; y < 1000; y += 20) for (var x = 10; x < 1000; x += 20) {
                var dd = Math.hypot(x - cx, y - cy) / reach;
                if (dd < 1) mk('circle', { cx: x, cy: y, r: (.6 + (max - .6) * Math.pow(1 - dd, 1.6)).toFixed(2) }, g);
            }
        }
        dots(1000, 1000, 640, '#5D3FD3', 6, .4); dots(0, 0, 300, '#ffffff', 4, .8);
        var wg = mk('g', { fill: 'none', stroke: '#ffffff', 'stroke-width': 1.6, opacity: .55 }, fx);
        for (var i = 0; i < 9; i++) {
            var path = '';
            for (var x = -20; x <= 1020; x += 10) { var t = x / 1000 * Math.PI * 2 * 1.1 + i * .2; path += (x < 0 ? 'M' : 'L') + x + ' ' + (70 + i * 15 + Math.sin(t) * 24 + Math.sin(t * .45) * 12).toFixed(1); }
            mk('path', { d: path }, wg);
        }

        var rows = wrap.querySelectorAll('.au-row'), ents = [].slice.call(wrap.querySelectorAll('.au-ent')).reverse(),
            prog = wrap.querySelector('.au-prog'), num = wrap.querySelector('.au-num'), C = 314.16;
        function setPct(v) { prog.style.strokeDashoffset = C * (1 - v / 100); num.textContent = Math.round(v); }

        var tl = gsap.timeline({ repeat: -1, repeatDelay: .4, paused: true, defaults: { ease: 'power2.out' } });
        tl.set(rows, { className: 'au-row' }).set(wrap.querySelectorAll('.au-val'), { clipPath: 'inset(0 100% 0 0)' })
            .set(wrap.querySelectorAll('.au-done'), { opacity: 0 }).set(wrap.querySelectorAll('.au-req'), { opacity: 1 })
            .set(ents, { height: 0, opacity: 0 }).set(wrap.querySelector('.au-sig'), { clipPath: 'inset(0 100% 0 0)' })
            .set([wrap.querySelector('.au-lock'), wrap.querySelector('.au-badge')], { opacity: 0, scale: .9 }).set(wrap.querySelector('.au-draft'), { opacity: 1 })
            .add(function () { setPct(0); }, 0)
            .fromTo(stage, { opacity: 0 }, { opacity: 1, duration: .5 });

        function step(i, at) {
            var r = rows[i];
            tl.add(function () { r.classList.add('au-on'); }, at)
                .to(r.querySelector('.au-val'), { clipPath: 'inset(0 0% 0 0)', duration: .8, ease: 'power1.inOut' }, at + .15)
                .to(r.querySelector('.au-req'), { opacity: 0, duration: .25 }, at + 1)
                .to(r.querySelector('.au-done'), { opacity: 1, duration: .25 }, at + 1)
                .add(function () { r.classList.remove('au-on'); }, at + 1.3);
        }
        function log(i, at, from, to) {
            tl.to(ents[i], { height: 'auto', opacity: 1, duration: .5, ease: 'power3.out' }, at)
                .to({}, { duration: .7, onUpdate: function () { setPct(from + (to - from) * this.ratio); } }, at);
        }
        var t0 = .8, gap = 1.7;
        for (var k = 0; k < 4; k++) { step(k, t0 + k * gap); log(k, t0 + k * gap + 1.05, k * 20, (k + 1) * 20); }
        var ts = t0 + 4 * gap;
        tl.to(wrap.querySelector('.au-sig'), { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'power1.inOut' }, ts)
            .to(wrap.querySelector('.au-draft'), { opacity: 0, duration: .25 }, ts + 1.1)
            .to(wrap.querySelector('.au-lock'), { opacity: 1, scale: 1, duration: .4, ease: 'back.out(2)' }, ts + 1.1);
        log(4, ts + 1.1, 80, 100);
        tl.to(wrap.querySelector('.au-badge'), { opacity: 1, scale: 1, duration: .4, ease: 'back.out(2)' }, ts + 1.8)
            .to(stage, { opacity: 0, duration: .5, ease: 'power1.in' }, ts + 5.2);

        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { tl.progress(.93).pause(); }
        else if ('IntersectionObserver' in window) {
            // Play only while on screen AND shown (Webflow interactions may fade the mount Div)
            var inView = false;
            var sync = function () { if (inView && parseFloat(getComputedStyle(root).opacity) > .01) { if (!root._userPaused) tl.play(); } else tl.pause(); };
            (root._io = new IntersectionObserver(function (es) { es.forEach(function (e) { inView = e.isIntersecting; }); sync(); }, { threshold: .25 })).observe(root);
            (root._mo = new MutationObserver(sync)).observe(root, { attributes: true, attributeFilter: ['style'] });
        } else tl.play();
        root._niq = tl;
    }

    /* ---- mount + boot ---- */
    function mount(el) {
        if (el.getAttribute('data-niq-mounted')) return;
        el.setAttribute('data-niq-mounted', '1');
        el.classList.add('niq-au');
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', AU_LABEL);
        el.innerHTML = AU_MARKUP;
        auInit(el);
    }
    /* ---- shared registry: mounts on page load AND whenever new mounts appear
       (Barba / any AJAX page swap), and cleans up mounts that get removed ---- */
    var NIQ = window.NIQAnims || (window.NIQAnims = (function () {
        var reg = [], watching = false;
        var OWN = /\b(niq-(anim|at|gc|ii|lt|ot|au)|(na|at|gc|ii|lt|ot|au)-ready)\b/g;
        function each(scope, sel, fn) {
            if (!scope) return;
            if (scope.nodeType === 1 && scope.matches(sel)) fn(scope);
            if (scope.querySelectorAll) Array.prototype.forEach.call(scope.querySelectorAll(sel), fn);
        }
        function destroyEl(el) {
            try { if (el._niq && el._niq.kill) el._niq.kill(); } catch (e) { }
            ['_loop', '_dots'].forEach(function (k) { try { if (el[k] && el[k].stop) el[k].stop(); } catch (e) { } });
            try { if (el._io) el._io.disconnect(); } catch (e) { }
            try { if (el._ro) el._ro.disconnect(); } catch (e) { }
            try { if (el._mo) el._mo.disconnect(); } catch (e) { }
            el._niq = el._loop = el._dots = el._io = el._ro = el._mo = null;
            el.removeAttribute('data-niq-mounted'); el.removeAttribute('role'); el.removeAttribute('aria-label');
            el.className = el.className.replace(OWN, '').replace(/\s+/g, ' ').trim();
            el.innerHTML = '';
        }
        var api = {
            register: function (sel, mountFn) {
                for (var i = 0; i < reg.length; i++) if (reg[i].sel === sel) return;
                reg.push({ sel: sel, mount: mountFn });
            },
            mount: function (scope) { scope = scope || document; reg.forEach(function (r) { each(scope, r.sel, r.mount); }); },
            destroy: function (scope) { scope = scope || document; each(scope, '[data-niq-mounted]', destroyEl); },
            watch: function () {
                if (watching || !('MutationObserver' in window)) return;
                watching = true;
                new MutationObserver(function (muts) {
                    muts.forEach(function (m) {
                        Array.prototype.forEach.call(m.removedNodes, function (n) { if (n.nodeType === 1 && !n.isConnected) api.destroy(n); });
                        Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) api.mount(n); });
                    });
                }).observe(document.documentElement, { childList: true, subtree: true });
            }
        };
        return api;
    })());
    function boot() { NIQ.register('[data-niq-anim="audit"]', mount); NIQ.mount(document); NIQ.watch(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
