gsap.registerPlugin(ScrollTrigger);

function initTableOfContents() {
    document.querySelectorAll('[data-toc-wrap]').forEach(root => {
        const contentEl = root.querySelector('[data-toc-content]');
        const listEl = root.querySelector('[data-toc-list]');
        const templateLink = listEl?.querySelector('[data-toc-link]');
        if (!contentEl || !listEl || !templateLink) return;

        const levels = (root.getAttribute('data-toc-levels') || 'h2,h3').split(',').map(l => l.trim().toLowerCase()).filter(l => /^h[1-6]$/.test(l));
        const levelSelector = levels.join(', ');
        if (!levelSelector) return;

        const offset = parseInt(root.getAttribute('data-toc-offset')) || 50;
        const marker = '{skip}';

        const slugCounts = new Map();

        function slugify(text) {
            let slug = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            if (!slug) slug = 'section';

            const count = slugCounts.get(slug) || 0;
            slugCounts.set(slug, count + 1);
            return count === 0 ? slug : slug + '-' + (count + 1);
        }

        function stripMarker(el) {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                if (node.textContent.includes(marker)) {
                    node.textContent = node.textContent.replace(marker, '').trim();
                }
            }
        }

        const allHeadings = Array.from(contentEl.querySelectorAll(levelSelector));
        const headings = [];

        allHeadings.forEach(heading => {
            if (heading.hasAttribute('data-toc-ignore')) return;
            if (heading.textContent.includes(marker)) {
                stripMarker(heading);
                return;
            }
            const text = heading.textContent.trim();
            if (!text) return;
            headings.push(heading);
        });

        if (!headings.length) return;

        headings.forEach(heading => {
            if (!heading.id) {
                heading.id = slugify(heading.textContent.trim());
            }
        });

        const tocLinks = [];

        headings.forEach(heading => {
            const clone = templateLink.cloneNode(true);
            const textTarget = clone.querySelector('[data-toc-text]') || clone;
            textTarget.textContent = heading.textContent.trim();

            clone.href = '#' + heading.id;
            clone.removeAttribute('data-toc-link');
            clone.setAttribute('data-toc-item', '');

            const level = heading.tagName.charAt(1);
            clone.setAttribute('data-toc-depth', level);

            listEl.appendChild(clone);
            tocLinks.push(clone);
        });

        listEl.querySelectorAll('[data-toc-link]').forEach(el => el.remove());

        // Active state tracking via ScrollTrigger
        if (typeof ScrollTrigger !== 'undefined') {
            function setActive(index) {
                tocLinks.forEach(link => link.setAttribute('data-toc-status', ''));
                if (tocLinks[index]) tocLinks[index].setAttribute('data-toc-status', 'active');
            }

            headings.forEach((heading, i) => {
                const nextHeading = headings[i + 1];

                ScrollTrigger.create({
                    trigger: heading,
                    start: 'top ' + (offset + 1) + 'px',
                    endTrigger: nextHeading || contentEl,
                    end: nextHeading ? 'top ' + (offset + 1) + 'px' : 'bottom top',
                    onToggle: self => {
                        if (self.isActive) setActive(i);
                    }
                });
            });

            if (window.scrollY <= headings[0].getBoundingClientRect().top + window.scrollY - offset) {
                setActive(0);
            }
        }

        // Click handler with smooth scroll
        listEl.addEventListener('click', e => {
            const link = e.target.closest('[data-toc-item]');
            if (!link) return;
            e.preventDefault();
            e.stopPropagation();

            const id = link.getAttribute('href')?.slice(1);
            const target = document.getElementById(id);
            if (!target) return;

            if (typeof lenis !== 'undefined' && typeof lenis.scrollTo === 'function') {
                lenis.scrollTo(target, { offset: -offset });
            } else {
                const y = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });
}

// Initialze Table of Contents For Article
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTableOfContents); else initTableOfContents();