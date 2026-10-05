// -----------------------------------------
// STORIES FILTER (/stories)
// Instant tag filtering for the Stories CMS list, with a hand-picked featured story
// per view, "Load more" pagination and a ?tag= query parameter.
//
// Webflow setup (custom attributes):
//   [data-stories]                     wrapper; data-stories-per-page="9" (editable)
//   [data-stories-filter="all"]        the "All" button
//   [data-stories-filter="{tag slug}"] each tag button (Collection List of Story Tags);
//                                      data-stories-featured="{Featured Story: Slug}"
//   [data-stories-featured-list]       Collection List of Stories in the large layout
//     [data-story-slug="{slug}"]       each item
//     [data-story-flag="featured-all"] inside an item, conditionally visible when
//                                      "Featured on All" is on
//   [data-stories-list]                Collection List of Stories (cards), newest first
//     [data-story-slug="{slug}"]       each item
//     [data-story-tag="{tag slug}"]    inside an item, one per tag (nested list)
//   [data-stories-load-more]           the Load more button
//   [data-stories-empty]               shown when a view has no stories
//
// Featured story per view: All -> the story with "Featured on All" on; a tag -> the
// tag's Featured Story. Fallback: the newest story in that view. The featured story
// is left out of that view's grid.
// initStoriesFilter(scope) / destroyStoriesFilter(scope)
// -----------------------------------------

const storiesFilters = []; // { root, destroy }

function initStoriesFilter(scope = document) {
    scope.querySelectorAll("[data-stories]").forEach((root) => {
        if (storiesFilters.some(s => s.root === root)) return;

        const perPage = Math.max(1, parseInt(root.getAttribute("data-stories-per-page"), 10) || 9);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const filters = [...root.querySelectorAll("[data-stories-filter]")];
        const featuredItems = [...root.querySelectorAll("[data-stories-featured-list] [data-story-slug]")];
        const cards = [...root.querySelectorAll("[data-stories-list] [data-story-slug]")].map(el => ({
            el,
            slug: el.getAttribute("data-story-slug"),
            tags: [...el.querySelectorAll("[data-story-tag]")].map(t => t.getAttribute("data-story-tag")).filter(Boolean),
        }));
        const loadMore = root.querySelector("[data-stories-load-more]");
        const empty = root.querySelector("[data-stories-empty]");

        // "Featured on All": the flag element is conditionally visible in Webflow
        // (hidden flags stay in the DOM with .w-condition-invisible)
        const isFlagged = item => [...item.querySelectorAll('[data-story-flag="featured-all"]')]
            .some(f => !f.classList.contains("w-condition-invisible"));

        const validTags = new Set(filters.map(f => f.getAttribute("data-stories-filter")).filter(t => t && t !== "all"));
        let current = "all";
        let shown = perPage;

        function readTagFromUrl() {
            const tag = new URLSearchParams(window.location.search).get("tag");
            return tag && validTags.has(tag) ? tag : "all";
        }

        function writeTagToUrl(tag) {
            const url = new URL(window.location.href);
            if (tag === "all") url.searchParams.delete("tag"); else url.searchParams.set("tag", tag);
            history.replaceState(history.state, "", url);
        }

        function featuredSlugFor(tag, matching) {
            let slug = null;
            if (tag === "all") {
                const flagged = featuredItems.find(isFlagged);
                slug = flagged && flagged.getAttribute("data-story-slug");
            } else {
                const button = filters.find(f => f.getAttribute("data-stories-filter") === tag);
                slug = button && button.getAttribute("data-stories-featured");
            }
            // Only if that story is actually in this view; otherwise the newest one
            if (!slug || !matching.some(c => c.slug === slug)) slug = matching[0] ? matching[0].slug : null;
            return slug;
        }

        function render(animate) {
            const matching = current === "all" ? cards : cards.filter(c => c.tags.includes(current));
            const featured = featuredSlugFor(current, matching);
            const grid = matching.filter(c => c.slug !== featured);
            const visible = grid.slice(0, shown);

            featuredItems.forEach(item => item.classList.toggle("stories-is-shown", item.getAttribute("data-story-slug") === featured));
            cards.forEach(c => c.el.classList.toggle("stories-is-hidden", !visible.includes(c)));
            if (loadMore) loadMore.classList.toggle("stories-is-hidden", grid.length <= shown);
            if (empty) empty.classList.toggle("stories-is-hidden", matching.length > 0);

            filters.forEach(f => {
                const active = f.getAttribute("data-stories-filter") === current;
                f.classList.toggle("is-active", active);
                f.setAttribute("aria-pressed", String(active));
            });

            if (animate && !reduceMotion) {
                const targets = [...featuredItems.filter(i => i.classList.contains("stories-is-shown")), ...visible.map(c => c.el)];
                gsap.fromTo(targets, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.03, overwrite: true });
            }

            // The page height changed: keep scroll-based effects in sync
            if (window.ScrollTrigger) ScrollTrigger.refresh();
        }

        function select(tag) {
            if (tag === current) return;
            current = tag;
            shown = perPage;
            writeTagToUrl(tag);
            render(true);
        }

        const onFilterClick = (e) => {
            const button = e.target.closest("[data-stories-filter]");
            if (!button || !root.contains(button)) return;
            e.preventDefault();
            select(button.getAttribute("data-stories-filter"));
        };

        const onLoadMore = (e) => {
            e.preventDefault();
            const before = new Set(cards.filter(c => !c.el.classList.contains("stories-is-hidden")).map(c => c.el));
            shown += perPage;
            render(false);
            const added = cards.map(c => c.el).filter(el => !el.classList.contains("stories-is-hidden") && !before.has(el));
            if (added.length && !reduceMotion) {
                gsap.fromTo(added, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.03 });
            }
        };

        root.addEventListener("click", onFilterClick);
        if (loadMore) loadMore.addEventListener("click", onLoadMore);

        current = readTagFromUrl();
        // A ?tag= for a tag that doesn't exist (renamed or deleted): show All and tidy the URL
        if (current === "all" && new URLSearchParams(window.location.search).has("tag")) writeTagToUrl("all");
        render(false);
        root.classList.add("stories-is-ready");

        storiesFilters.push({
            root,
            destroy() {
                root.removeEventListener("click", onFilterClick);
                if (loadMore) loadMore.removeEventListener("click", onLoadMore);
                root.classList.remove("stories-is-ready");
                root.querySelectorAll(".stories-is-hidden, .stories-is-shown, .is-active").forEach(el => el.classList.remove("stories-is-hidden", "stories-is-shown", "is-active"));
            },
        });
    });
}

function destroyStoriesFilter(scope = document) {
    for (let i = storiesFilters.length - 1; i >= 0; i--) {
        const s = storiesFilters[i];
        if (scope !== document && !scope.contains(s.root)) continue;
        s.destroy();
        storiesFilters.splice(i, 1);
    }
}

// Runs once per page load (scope/teardown functions above are available if ever needed).
// Wrapped so the DOMContentLoaded event isn't passed in as `scope`.
const bootStoriesFilter = () => initStoriesFilter();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootStoriesFilter); else bootStoriesFilter();
