        // Basic JavaScript for Navbar Toggler (no smooth scroll or content switching for this simple page)
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.getElementById('navbarIndustrialNav');

        if (navbarToggler && navbarCollapse) {
            navbarToggler.addEventListener('click', () => {
                const isExpanded = navbarToggler.getAttribute('aria-expanded') === 'true' || false;
                navbarToggler.setAttribute('aria-expanded', !isExpanded);
                navbarCollapse.classList.toggle('show');
                // Optional: playClickSound(); if you have it defined and want it here
            });
        }

        // Optional: Close mobile menu when a nav link is clicked (if linking to anchors on same page)
        document.querySelectorAll('.navbar-industrial .nav-link').forEach(link => {
            link.addEventListener('click', (event) => {
                const targetHref = link.getAttribute('href');
                // Only close if it's an anchor link on the same page
                if (targetHref && targetHref.startsWith('#') && navbarCollapse.classList.contains('show')) {
                    navbarToggler.setAttribute('aria-expanded', 'false');
                    navbarCollapse.classList.remove('show');
                }
                // If it's a link to another page (like index.html), let it navigate normally
            });
        });

        // Add active class to TOC links for smooth scrolling effect (basic)
        document.querySelectorAll('.manual-section ul a').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                        // Optional: Update URL hash without page jump
                        // history.pushState(null, null, href);
                    }
                }
            });
        });