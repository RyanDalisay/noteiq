/* =====================================================================
   NoteIQ — Features page thread background
   Static threads and hub; the braid on the right waves continuously and the
   glow behind it pulses continuously. No timeline, no GSAP needed.
   Decorative: hidden from assistive tech and ignores pointer events.
   Mount: add  data-niq-anim="thread-bg"  to an empty Div Block in Webflow.
   ===================================================================== */
(function () {
    'use strict';

    /* ---- component markup (artwork from hero-one-thread-1920x740-2.svg) ---- */
    var OT_MARKUP = "<div class=\"ot-stage\"><svg class=\"ot-art\" viewBox=\"0 0 1920 740\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\"><g clip-path=\"url(#clip0_ot)\">\n<path d=\"M1134.5 588.5C1085.5 588.5 1060 564 1011 564V810H1867V569C1796 569 1780.5 588.5 1714.5 588.5C1648.5 588.5 1605.5 551 1549.5 551C1493.5 551 1466.5 588.5 1405 588.5C1343.5 588.5 1316 551 1261.5 551C1207 551 1183.5 588.5 1134.5 588.5Z\" fill=\"url(#paint0_radial_ot)\" class=\"ot-glow\" data-g=\"v\"/>\n<path d=\"M1066.5 551C1044 557.964 1032.5 557 1011 557V262.5H1867V569C1760.5 569 1759.69 584.236 1698.5 559.5C1637.31 534.764 1595.5 588.5 1539.5 588.5C1483.5 588.5 1456.5 551 1395 551C1333.5 551 1306 588.5 1251.5 588.5C1197 588.5 1113.31 536.511 1066.5 551Z\" fill=\"url(#paint1_radial_ot)\" class=\"ot-glow\" data-g=\"c\"/>\n<path d=\"M1146.5 551C1062.5 577 1076 560.5 1011 560.5V879H1867V569C1807 569 1787 566 1755 558.5C1706.12 547.044 1675.5 588.5 1619.5 588.5C1563.5 588.5 1536.5 551 1475 551C1413.5 551 1386 588.5 1331.5 588.5C1277 588.5 1193.31 536.511 1146.5 551Z\" fill=\"url(#paint2_radial_ot)\" class=\"ot-glow\" data-g=\"a\"/>\n<path class=\"ot-src\" d=\"M-2.00 169.50C74.25 169.50 150.45 193.53 226.78 229.58C303.11 265.62 379.56 313.69 456.30 361.75C533.04 409.81 610.06 457.88 687.54 493.92C765.02 529.97 842.95 554.00 921.50 554.00\" stroke=\"url(#paint4_linear_ot)\" stroke-width=\"1\" fill=\"none\"/><path class=\"ot-src\" d=\"M-2.00 318.00C146.75 318.00 307.45 378.00 465.98 438.00C624.52 498.00 780.90 558.00 921.00 558.00\" stroke=\"url(#paint3_linear_ot)\" stroke-width=\"1\" fill=\"none\"/><path class=\"ot-src\" d=\"M-1.50 462.00C130.00 462.00 305.62 487.00 475.87 512.00C646.12 537.00 811.00 562.00 921.00 562.00\" stroke=\"url(#paint5_linear_ot)\" stroke-width=\"1\" fill=\"none\"/><path class=\"ot-src\" d=\"M-2.00 588.00C203.25 588.00 377.32 582.50 528.42 577.00C679.52 571.50 807.64 566.00 921.00 566.00\" stroke=\"url(#paint6_linear_ot)\" stroke-width=\"1\" fill=\"none\"/><path class=\"ot-src\" d=\"M-1.00 679.00C280.25 679.00 456.57 651.75 589.79 624.50C723.02 597.25 813.14 570.00 922.00 570.00\" stroke=\"url(#paint7_linear_ot)\" stroke-width=\"1\" fill=\"none\"/><path class=\"ot-brd\" data-w=\"c\" pathLength=\"1\" d=\"M1000 569\" stroke=\"url(#paint10_linear_ot)\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"ot-brd\" data-w=\"a\" pathLength=\"1\" d=\"M1000 569\" stroke=\"url(#paint9_linear_ot)\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><path class=\"ot-brd\" data-w=\"v\" pathLength=\"1\" d=\"M1000 569\" stroke=\"url(#paint8_linear_ot)\" stroke-width=\"1\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"1867\" cy=\"569\" r=\"18.5\" fill=\"url(#paint11_radial_ot)\" stroke=\"#516FA2\"/>\n<circle class=\"ot-end\" cx=\"1867\" cy=\"569\" r=\"7\" fill=\"#5D3FD3\"/>\n<g class=\"ot-hub\"><g filter=\"url(#filter0_d_ot)\">\n<circle cx=\"960.5\" cy=\"561.5\" r=\"40\" fill=\"#EBEBEB\"/>\n<circle cx=\"960.5\" cy=\"561.5\" r=\"39.4203\" stroke=\"#C2C4C8\" stroke-width=\"1.15942\"/>\n</g>\n<g opacity=\"0.2\" clip-path=\"url(#clip1_ot)\">\n<path d=\"M936.546 553.891C936.821 553.788 937.118 553.763 937.407 553.817L940.687 554.44C940.981 554.496 941.254 554.632 941.475 554.834C941.696 555.036 941.856 555.295 941.939 555.584L947.472 575.077C947.681 575.812 948.064 576.484 948.59 577.037C949.115 577.591 949.767 578.008 950.489 578.253L978.598 587.804L949.436 582.261C948.687 582.118 947.984 581.796 947.387 581.321C946.79 580.846 946.317 580.234 946.009 579.535L935.637 556.053C935.519 555.784 935.476 555.488 935.513 555.197C935.55 554.906 935.666 554.63 935.848 554.4C936.03 554.17 936.272 553.994 936.546 553.891ZM945.295 545.527C945.584 545.478 945.881 545.508 946.154 545.616L949.26 546.843C949.538 546.953 949.78 547.138 949.958 547.378C950.137 547.617 950.246 547.902 950.273 548.2L952.065 568.387C952.133 569.147 952.384 569.88 952.796 570.522C953.209 571.164 953.771 571.696 954.434 572.072L980.264 586.726L952.654 575.81C951.945 575.53 951.315 575.082 950.817 574.504C950.319 573.927 949.968 573.237 949.795 572.494L943.997 547.479C943.931 547.193 943.944 546.894 944.035 546.615C944.126 546.336 944.292 546.087 944.514 545.896C944.736 545.704 945.006 545.576 945.295 545.527ZM955.31 539.815C955.31 538.024 957.317 536.969 958.789 537.986L980.244 552.821C980.716 553.146 981.102 553.582 981.368 554.09C981.634 554.598 981.773 555.163 981.773 555.737V573.885L984.992 576.111C985.115 576.195 985.217 576.309 985.287 576.442C985.357 576.574 985.394 576.722 985.394 576.872V579.2C985.393 579.299 985.366 579.396 985.314 579.481C985.262 579.565 985.189 579.634 985.101 579.68C985.013 579.726 984.915 579.747 984.816 579.741C984.717 579.735 984.622 579.702 984.54 579.645L981.776 577.734V580.868C981.776 582.659 979.769 583.715 978.297 582.697L956.838 567.863C956.367 567.538 955.981 567.102 955.715 566.594C955.448 566.086 955.309 565.521 955.31 564.947V539.815ZM960.105 543.995C959.984 543.987 959.864 544.013 959.757 544.069C959.651 544.125 959.561 544.21 959.498 544.313C959.436 544.417 959.403 544.535 959.402 544.656V562.797C959.402 563.371 959.541 563.936 959.808 564.444C960.074 564.952 960.459 565.387 960.931 565.713L976.642 576.576C976.742 576.644 976.858 576.685 976.978 576.692C977.099 576.699 977.219 576.673 977.326 576.617C977.433 576.561 977.523 576.476 977.585 576.373C977.648 576.269 977.68 576.15 977.68 576.029L977.682 574.905L975.533 573.422C975.41 573.337 975.31 573.223 975.24 573.091C975.17 572.958 975.134 572.81 975.134 572.66V570.335C975.133 570.235 975.16 570.137 975.211 570.052C975.262 569.966 975.336 569.896 975.423 569.849C975.511 569.803 975.611 569.781 975.71 569.787C975.809 569.793 975.905 569.826 975.987 569.883L977.682 571.054V557.889C977.683 557.315 977.544 556.75 977.277 556.242C977.011 555.734 976.626 555.298 976.154 554.973L960.441 544.111C960.342 544.042 960.226 544.002 960.105 543.995ZM963.223 561.157C963.323 561.163 963.419 561.196 963.5 561.253L972.505 567.478C972.629 567.563 972.73 567.677 972.8 567.81C972.87 567.943 972.907 568.091 972.908 568.242V570.567C972.907 570.666 972.88 570.764 972.829 570.849C972.777 570.934 972.704 571.003 972.616 571.049C972.528 571.095 972.429 571.117 972.33 571.111C972.231 571.105 972.136 571.072 972.054 571.015L963.046 564.792C962.923 564.707 962.822 564.593 962.753 564.46C962.683 564.327 962.647 564.18 962.647 564.03V561.705C962.646 561.605 962.673 561.507 962.724 561.422C962.775 561.336 962.849 561.266 962.937 561.219C963.025 561.173 963.124 561.151 963.223 561.157ZM963.223 554.734C963.323 554.74 963.419 554.773 963.5 554.829L974.039 562.115C974.162 562.2 974.263 562.314 974.332 562.446C974.402 562.579 974.438 562.727 974.438 562.877V565.202C974.439 565.302 974.412 565.4 974.361 565.485C974.31 565.571 974.236 565.641 974.148 565.687C974.06 565.734 973.961 565.756 973.862 565.75C973.762 565.744 973.667 565.711 973.584 565.654L963.046 558.369C962.923 558.284 962.822 558.17 962.753 558.037C962.683 557.904 962.647 557.756 962.647 557.606V555.281C962.646 555.182 962.673 555.084 962.724 554.998C962.775 554.913 962.849 554.843 962.937 554.796C963.025 554.75 963.124 554.728 963.223 554.734ZM963.223 548.324C963.323 548.33 963.419 548.363 963.5 548.42L974.039 555.705C974.162 555.79 974.263 555.904 974.332 556.037C974.402 556.17 974.438 556.317 974.438 556.467V558.79C974.439 558.889 974.412 558.987 974.361 559.073C974.31 559.158 974.236 559.228 974.148 559.275C974.06 559.321 973.961 559.343 973.862 559.337C973.762 559.331 973.667 559.298 973.584 559.242L963.046 551.956C962.923 551.871 962.822 551.757 962.753 551.624C962.683 551.492 962.647 551.344 962.647 551.194V548.872C962.646 548.772 962.673 548.674 962.724 548.588C962.775 548.503 962.849 548.433 962.937 548.386C963.025 548.34 963.124 548.318 963.223 548.324ZM947.033 537.082C948.817 537.082 950.263 538.53 950.263 540.317C950.263 542.104 948.817 543.552 947.033 543.552C945.249 543.552 943.803 542.104 943.803 540.317C943.803 538.53 945.249 537.082 947.033 537.082Z\" fill=\"#1E293C\"/>\n</g>\n</g>\n</g>\n<defs>\n<filter id=\"filter0_d_ot\" x=\"886.5\" y=\"499.5\" width=\"148\" height=\"148\" filterUnits=\"userSpaceOnUse\" color-interpolation-filters=\"sRGB\">\n<feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\"/>\n<feColorMatrix in=\"SourceAlpha\" type=\"matrix\" values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\" result=\"hardAlpha\"/>\n<feOffset dy=\"12\"/>\n<feGaussianBlur stdDeviation=\"17\"/>\n<feComposite in2=\"hardAlpha\" operator=\"out\"/>\n<feColorMatrix type=\"matrix\" values=\"0 0 0 0 0.392157 0 0 0 0 0.454902 0 0 0 0 0.545098 0 0 0 0.25 0\"/>\n<feBlend mode=\"normal\" in2=\"BackgroundImageFix\" result=\"effect1_dropShadow_ot\"/>\n<feBlend mode=\"normal\" in=\"SourceGraphic\" in2=\"effect1_dropShadow_ot\" result=\"shape\"/>\n</filter>\n<radialGradient id=\"paint0_radial_ot\" cx=\"0\" cy=\"0\" r=\"1\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"translate(1418 551) rotate(90.1605) scale(178.501 356.433)\">\n<stop stop-color=\"#5D3FD3\" stop-opacity=\"0.3\"/>\n<stop offset=\"0.870033\" stop-color=\"#5D3FD3\" stop-opacity=\"0\"/>\n</radialGradient>\n<radialGradient id=\"paint1_radial_ot\" cx=\"0\" cy=\"0\" r=\"1\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"translate(1403.5 589) rotate(-89.6007) scale(143.504 365.903)\">\n<stop stop-color=\"#3FB4D3\" stop-opacity=\"0.5\"/>\n<stop offset=\"1\" stop-color=\"#3FB4D3\" stop-opacity=\"0\"/>\n</radialGradient>\n<radialGradient id=\"paint2_radial_ot\" cx=\"0\" cy=\"0\" r=\"1\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"translate(1414 548) rotate(90.3032) scale(94.5013 424.147)\">\n<stop stop-color=\"#DFAB51\" stop-opacity=\"0.5\"/>\n<stop offset=\"1\" stop-color=\"#DFAB51\" stop-opacity=\"0\"/>\n</radialGradient>\n<linearGradient id=\"paint3_linear_ot\" x1=\"2\" y1=\"490.999\" x2=\"909.999\" y2=\"490.999\" gradientUnits=\"userSpaceOnUse\">\n<stop stop-color=\"#3FB4D3\" stop-opacity=\"0\"/>\n<stop offset=\"0.25\" stop-color=\"#3FB4D3\"/>\n<stop offset=\"1\" stop-color=\"#5D3FD3\" stop-opacity=\"0.2\"/>\n</linearGradient>\n<linearGradient id=\"paint4_linear_ot\" x1=\"2.49902\" y1=\"419.999\" x2=\"910\" y2=\"419.999\" gradientUnits=\"userSpaceOnUse\">\n<stop stop-color=\"#5D3FD3\" stop-opacity=\"0\"/>\n<stop offset=\"0.246084\" stop-color=\"#5D3FD3\"/>\n<stop offset=\"1\" stop-color=\"#5D3FD3\" stop-opacity=\"0.2\"/>\n</linearGradient>\n<linearGradient id=\"paint5_linear_ot\" x1=\"3.49902\" y1=\"562.5\" x2=\"910.499\" y2=\"562.5\" gradientUnits=\"userSpaceOnUse\">\n<stop stop-color=\"#64748B\" stop-opacity=\"0\"/>\n<stop offset=\"0.25\" stop-color=\"#64748B\"/>\n<stop offset=\"1\" stop-color=\"#5D3FD3\" stop-opacity=\"0.2\"/>\n</linearGradient>\n<linearGradient id=\"paint6_linear_ot\" x1=\"2.49951\" y1=\"633\" x2=\"910\" y2=\"633\" gradientUnits=\"userSpaceOnUse\">\n<stop stop-color=\"#DFAB51\" stop-opacity=\"0\"/>\n<stop offset=\"0.25\" stop-color=\"#DFAB51\"/>\n<stop offset=\"1\" stop-color=\"#5D3FD3\" stop-opacity=\"0.2\"/>\n</linearGradient>\n<linearGradient id=\"paint7_linear_ot\" x1=\"3.49854\" y1=\"704\" x2=\"909.999\" y2=\"704\" gradientUnits=\"userSpaceOnUse\">\n<stop stop-color=\"#07BE9F\" stop-opacity=\"0\"/>\n<stop offset=\"0.25\" stop-color=\"#07BE9F\"/>\n<stop offset=\"1\" stop-color=\"#5D3FD3\" stop-opacity=\"0.2\"/>\n</linearGradient>\n<linearGradient id=\"paint8_linear_ot\" x1=\"1011\" y1=\"569.75\" x2=\"1867\" y2=\"569.75\" gradientUnits=\"userSpaceOnUse\">\n<stop stop-color=\"#5D3FD3\" stop-opacity=\"0.2\"/>\n<stop offset=\"1\" stop-color=\"#5D3FD3\"/>\n</linearGradient>\n<linearGradient id=\"paint9_linear_ot\" x1=\"1011\" y1=\"569.75\" x2=\"1867\" y2=\"569.75\" gradientUnits=\"userSpaceOnUse\">\n<stop stop-color=\"#DFAB51\" stop-opacity=\"0.2\"/>\n<stop offset=\"1\" stop-color=\"#DFAB51\"/>\n</linearGradient>\n<linearGradient id=\"paint10_linear_ot\" x1=\"1011\" y1=\"569.75\" x2=\"1867\" y2=\"569.75\" gradientUnits=\"userSpaceOnUse\">\n<stop stop-color=\"#3FB4D3\" stop-opacity=\"0.2\"/>\n<stop offset=\"1\" stop-color=\"#3FB4D3\"/>\n</linearGradient>\n<radialGradient id=\"paint11_radial_ot\" cx=\"0\" cy=\"0\" r=\"1\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"translate(1867 569) rotate(90) scale(19)\">\n<stop offset=\"0.3\" stop-color=\"#516FA2\" stop-opacity=\"0\"/>\n<stop offset=\"1\" stop-color=\"#516FA2\" stop-opacity=\"0.4\"/>\n</radialGradient>\n<clipPath id=\"clip0_ot\">\n<rect width=\"1920\" height=\"740\" fill=\"white\"/>\n</clipPath>\n<clipPath id=\"clip1_ot\">\n<rect width=\"50\" height=\"50.8163\" fill=\"white\" transform=\"translate(935.5 537.082)\"/>\n</clipPath>\n</defs>\n</svg></div>";

    /* ---- animation ---- */
    function otInit(root) {
        if (root.classList.contains('ot-ready')) return;
        root.classList.add('ot-ready');
        var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /* Everything is static except the braid (continuous wave) and the glow behind it (continuous pulse). */

        /* ---- braid: three threads that wave continuously ---- */
        // same wave as the art: centre 569.75, amplitude 18.75, wavelength 280, peaks at x = 1134 / 1252 / 1332
        var X0 = 1000, X1 = 1867, CY = 569.75, EY = 569, AMP = 18.75, LAMBDA = 280, SPEED = 2 * Math.PI / 3.4;
        var TH = { v: { peak: 1134, hub: 564 }, c: { peak: 1252, hub: 557 }, a: { peak: 1332, hub: 560.5 } };
        var GL = { v: 810, c: 262.5, a: 879 };                       // each glow runs from its thread to this edge (as in the art)
        var brdEls = {}, glowEls = {}, glows = $$('.ot-glow');
        $$('.ot-brd').forEach(function (p) { brdEls[p.getAttribute('data-w')] = p; });
        glows.forEach(function (p) { glowEls[p.getAttribute('data-g')] = p; });
        function smooth(e0, e1, x) { var t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
        function curve(k, t) {
            var th = TH[k], pts = [];
            for (var x = X0; x <= X1 + 0.1; x += 6) {
                var env = smooth(X0, X0 + 120, x) * (1 - smooth(X1 - 200, X1, x));
                var base = th.hub + (CY - th.hub) * smooth(X0, X0 + 100, x);
                base = base + (EY - base) * smooth(X1 - 120, X1, x);
                var y = base + AMP * env * Math.sin(2 * Math.PI * (x - th.peak) / LAMBDA + Math.PI / 2 - t * SPEED);
                pts.push(x.toFixed(1) + ' ' + y.toFixed(2));
            }
            return 'M' + pts.join('L');
        }

        /* ---- glow: continuous pulse ---- */
        var GLOW_MIN = .45, GLOW_MAX = 1, GLOW_PERIOD = 3.2;          // seconds per full pulse
        function glowAt(t) { return GLOW_MIN + (GLOW_MAX - GLOW_MIN) * (.5 + .5 * Math.cos(2 * Math.PI * t / GLOW_PERIOD)); }

        function draw(t) {
            for (var k in brdEls) {
                var d = curve(k, t); brdEls[k].setAttribute('d', d);
                var g = glowEls[k]; if (g) g.setAttribute('d', d + 'L' + X1 + ' ' + GL[k] + 'L' + X0 + ' ' + GL[k] + 'Z');
            }
            var o = glowAt(t).toFixed(3); for (var i = 0; i < glows.length; i++) glows[i].style.opacity = o;
        }

        var clock = 0, last = 0, raf = 0, running = false;
        draw(0);
        function frame(ts) {
            if (!running) return;
            if (last) { clock += Math.min(ts - last, 100) / 1000; }
            last = ts; draw(clock);
            raf = requestAnimationFrame(frame);
        }
        function start() { if (running || reduce) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
        function stop() { running = false; cancelAnimationFrame(raf); }

        if (!reduce) {
            if ('IntersectionObserver' in window) {
                (root._io = new IntersectionObserver(function (es) {
                    es.forEach(function (e) {
                        if (e.isIntersecting) { if (!root._userPaused) start(); } else stop();
                    });
                }, { threshold: .1 })).observe(root);
            } else start();
        }
        root._loop = { start: start, stop: stop, draw: draw, running: function () { return running; } };
    }

    /* ---- mount + boot ---- */
    function mount(el) {
        if (el.getAttribute('data-niq-mounted')) return;
        el.setAttribute('data-niq-mounted', '1');
        el.classList.add('niq-ot');
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = OT_MARKUP;
        otInit(el);
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
    function boot() { NIQ.register('[data-niq-anim="thread-bg"]', mount); NIQ.mount(document); NIQ.watch(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
