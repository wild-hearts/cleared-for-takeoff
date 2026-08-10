/* Site chrome behaviour: mobile nav toggle and the scrolled header state.
   Loaded on every page by the footer partial. Was previously inline on the
   homepage only, which is why the header CTA and hamburger did nothing
   anywhere else. */
(function () {
  var head = document.querySelector('.site-head');
  if (!head) return;

  /* ---- mobile nav ---- */
  var btn = head.querySelector('.navtoggle');
  var panel = document.getElementById('site-nav-mobile');

  if (btn && panel) {
    var setOpen = function (open) {
      head.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!head.classList.contains('nav-open'));
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (head.classList.contains('nav-open') && !head.contains(e.target)) setOpen(false);
    });
    // Close the menu if the viewport is resized up to desktop.
    var mq = matchMedia('(min-width:1081px)');
    var onChange = function (m) { if (m.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---- scrolled state ----
     The header is translucent over the hero and opaque once the page moves,
     so the wordmark stays legible against body copy. */
  var ticking = false;
  var sync = function () {
    head.classList.toggle('scrolled', window.scrollY > 8);
    ticking = false;
  };
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(sync); }
  }, { passive: true });
  sync();
})();
