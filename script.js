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

    // --- ACADEMY CURRICULUM ACCORDION ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const item = this.parentElement;
            const content = this.nextElementSibling;
            const icon = this.querySelector('.accordion-icon');
            
            // Check if item is already active
            const isActive = item.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.accordion-item').forEach(el => {
                el.classList.remove('active');
                el.querySelector('.accordion-content').style.maxHeight = null;
                el.querySelector('.accordion-icon').textContent = '+';
            });
            
            // If the clicked item was not active, open it
            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.textContent = '-';
            }
        });
    });

    // Open first week by default on load
    const firstAccordionHeader = document.querySelector('.accordion-header');
    if (firstAccordionHeader) {
        // Run slightly delayed to avoid transition bugs on load
        setTimeout(() => {
            firstAccordionHeader.click();
        }, 300);
    }

    // --- ENQUIRY FORM SUBMISSION → MailerLite via /api/contact ---
    const enrollForm = document.getElementById('academy-enroll-form');
    const formStatus = document.getElementById('form-status');

    if (enrollForm) {
        enrollForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const origBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-text">Sending...</span>';
            formStatus.className = 'form-message';
            formStatus.textContent = '';

            // Collect form values as JSON
            const payload = {
                name: document.getElementById('enroll-name').value,
                email: document.getElementById('enroll-email').value,
                role: document.getElementById('enroll-role').value,
                enquiry_type: document.getElementById('enroll-package').value,
                challenge: document.getElementById('enroll-challenge').value
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    formStatus.className = 'form-message success';
                    formStatus.textContent = '✨ Thank you — we\'ll be in touch within 48 hours.';
                    enrollForm.reset();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (err) {
                formStatus.className = 'form-message error';
                formStatus.textContent = 'Something went wrong. Please email us directly at naomi@wildheartshq.com';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origBtnText;
            }
        });
    }
});
