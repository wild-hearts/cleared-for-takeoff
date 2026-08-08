/* Cleared For Take-Off — conversion event tracking (GA4)
 *
 * GA4 was recording pageviews and nothing else, which meant there was no way to tell
 * whether a weak month was a traffic problem or a conversion problem. This adds the
 * funnel: preview starts, checkout starts, enquiries, waitlist joins and access grants.
 *
 * Uses one delegated listener rather than inline handlers, so nothing needs to change
 * in the markup when a button moves.
 *
 * Note on `purchase`: the real ecommerce event is sent server-side from the Stripe
 * webhook, where the amount and a de-duplicating transaction id are actually known.
 * The client only reports `course_access_granted`, which is a funnel step, not revenue.
 */
(function () {
  'use strict';

  function track(name, params) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', name, params || {});
  }

  // Fire once per tab for a given key, so a refresh or a back-button does not double count.
  function trackOnce(key, name, params) {
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch (e) { /* private mode: fall through and send anyway */ }
    track(name, params);
  }

  var BOOK_RETAILERS = /(amazon|apple|kobo|books\.google|google\.com\/books)/i;

  // ── Clicks ────────────────────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!href) return;

    // Paid checkout started
    if (href.indexOf('/api/create-checkout') === 0) {
      var m = href.match(/product=([\w-]+)/);
      track('begin_checkout', {
        product: m ? m[1] : 'self-paced',
        link_text: (a.innerText || '').trim().slice(0, 60),
        page_path: location.pathname
      });
      return;
    }

    // Free preview / course area
    if (href === '/course/' || href.indexOf('/course/?') === 0 || href === '/course') {
      track('start_free_preview', {
        link_text: (a.innerText || '').trim().slice(0, 60),
        page_path: location.pathname
      });
      return;
    }

    // Internal article clicks, so the value of the blog is measurable
    if (href.indexOf('/blog/') === 0 && location.pathname.indexOf('/blog/') !== 0) {
      track('article_click', { article: href, from: location.pathname });
      return;
    }

    // Outbound: book retailers and anything else off-site
    if (/^https?:\/\//i.test(href) && href.indexOf(location.hostname) === -1) {
      track(BOOK_RETAILERS.test(href) ? 'book_retailer_click' : 'outbound_click', {
        destination: href.slice(0, 120),
        page_path: location.pathname
      });
    }
  }, true);

  // ── Forms ─────────────────────────────────────────────────────────────────
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.tagName !== 'FORM') return;
    if (f.id === 'wait-form' || f.className.indexOf('wait-form') > -1) {
      track('join_waitlist', { page_path: location.pathname });
    } else if (f.className.indexOf('cform') > -1 || f.getAttribute('action') === '/api/contact') {
      track('generate_lead', { page_path: location.pathname });
    } else if (f.id === 'signin-form') {
      track('login_link_requested', { page_path: location.pathname });
    }
  }, true);

  // ── Post-checkout landing ─────────────────────────────────────────────────
  // Stripe returns the buyer to /course/?welcome=1 (plus track params for kids).
  if (location.pathname.indexOf('/course') === 0) {
    var qs = new URLSearchParams(location.search);
    if (qs.get('welcome') === '1') {
      var trackName = qs.get('track') || qs.get('next') || 'self-paced';
      trackOnce('c4to_welcome_' + trackName, 'course_access_granted', {
        product: trackName,
        page_path: location.pathname
      });
    }
  }

  // ── Scroll depth on articles ──────────────────────────────────────────────
  // Tells you whether people finish a piece, which is the signal that decides
  // which topics are worth writing more of.
  if (location.pathname.indexOf('/blog/') === 0 && document.querySelector('article')) {
    var marks = [25, 50, 75, 100], hit = {};
    var onScroll = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      var pct = Math.min(100, Math.round((window.pageYOffset / max) * 100));
      for (var i = 0; i < marks.length; i++) {
        var m = marks[i];
        if (pct >= m && !hit[m]) {
          hit[m] = true;
          track('scroll_depth', { percent: m, page_path: location.pathname });
        }
      }
      if (hit[100]) window.removeEventListener('scroll', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
