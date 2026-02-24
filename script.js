document.addEventListener('DOMContentLoaded', () => {

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add class to trigger animation classes (.fade-in-up, etc.)
                const animatedElements = entry.target.querySelectorAll('.fade-in, .fade-in-up, .slide-in-left, .slide-in-right');

                // If the target itself has the animation class
                if (entry.target.classList.contains('fade-in') ||
                    entry.target.classList.contains('fade-in-up')) {
                    entry.target.classList.add('is-visible');
                }

                // If children have the animation classes
                animatedElements.forEach(el => {
                    el.classList.add('is-visible');
                });

                // Unobserve after animating once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Watch all sections
    const sections = document.querySelectorAll('.target-section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Make hero animate immediately on load
    setTimeout(() => {
        const heroAnimates = document.querySelectorAll('.hero .fade-in, .hero .fade-in-up');
        heroAnimates.forEach(el => el.classList.add('is-visible'));
    }, 100);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Offset for fixed header
                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll background effect
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(13, 8, 32, 0.95)';
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            header.style.background = 'rgba(13, 8, 32, 0.7)';
            header.style.boxShadow = 'none';
        }
    });
});
