// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

function initProgressNavigation() {
    // Cache the parent container
    let navProgress = document.querySelector('[data-progress-nav-list]');

    // Bail out if the progress nav isn't on this page — prevents crashing
    // the rest of the bundle on pages without it.
    if (!navProgress) return;

    // Create or select the moving indicator
    let indicator = navProgress.querySelector('.progress-nav__indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'progress-nav__indicator';
        navProgress.appendChild(indicator);
    }

    // Function to update the indicator based on the active nav link
    function updateIndicator(activeLink) {
        let parentWidth = navProgress.offsetWidth;
        let parentHeight = navProgress.offsetHeight;

        // Get the active link's position relative to the parent
        let parentRect = navProgress.getBoundingClientRect();
        let linkRect = activeLink.getBoundingClientRect();
        let linkPos = {
            left: linkRect.left - parentRect.left,
            top: linkRect.top - parentRect.top
        };

        let linkWidth = activeLink.offsetWidth;
        let linkHeight = activeLink.offsetHeight;

        // Calculate percentage values relative to parent dimensions
        let leftPercent = (linkPos.left / parentWidth) * 100;
        let topPercent = (linkPos.top / parentHeight) * 100;
        let widthPercent = (linkWidth / parentWidth) * 100;
        let heightPercent = (linkHeight / parentHeight) * 100;

        // Update the indicator with a smooth CSS transition (set in your CSS)
        indicator.style.left = leftPercent + '%';
        indicator.style.top = topPercent + '%';
        indicator.style.width = widthPercent + '%';
        indicator.style.height = heightPercent + '%';
    }

    // Get all anchor sections
    let progressAnchors = gsap.utils.toArray('[data-progress-nav-anchor]');

    progressAnchors.forEach((progressAnchor) => {
        let anchorID = progressAnchor.getAttribute('id');

        ScrollTrigger.create({
            trigger: progressAnchor,
            start: '0% 50%',
            end: '100% 50%',
            onEnter: () => {
                let activeLink = navProgress.querySelector('[data-progress-nav-target="#' + anchorID + '"]');
                if (!activeLink) return;
                activeLink.classList.add('is--active');
                // Remove 'is--active' class from sibling links
                let siblings = navProgress.querySelectorAll('[data-progress-nav-target]');
                siblings.forEach((sib) => {
                    if (sib !== activeLink) {
                        sib.classList.remove('is--active');
                    }
                });
                updateIndicator(activeLink);
            },
            onEnterBack: () => {
                let activeLink = navProgress.querySelector('[data-progress-nav-target="#' + anchorID + '"]');
                if (!activeLink) return;
                activeLink.classList.add('is--active');
                // Remove 'is--active' class from sibling links
                let siblings = navProgress.querySelectorAll('[data-progress-nav-target]');
                siblings.forEach((sib) => {
                    if (sib !== activeLink) {
                        sib.classList.remove('is--active');
                    }
                });
                updateIndicator(activeLink);
            }
        });
    });
}

// Initialize One Page Progress Navigation
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initProgressNavigation); else initProgressNavigation();