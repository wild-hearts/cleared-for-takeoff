/* Enquiry form submit handler, shared by the homepage section and /contact/.
   Progressive enhancement: the form has a real action and method, so it still
   posts if this file fails to load. */
(function () {
  document.querySelectorAll('form.cform').forEach(function (f) {
    if (f.dataset.enhanced) return;
    f.dataset.enhanced = '1';

    var status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.style.cssText = 'margin-top:14px;font-size:16px;font-weight:700;display:none';
    f.appendChild(status);

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('button[type="submit"]');
      var original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Sending…';
      status.style.display = 'none';

      var data = {};
      new FormData(f).forEach(function (v, k) { data[k] = v; });

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then(function (r) {
          if (!r.ok) throw new Error('bad status');
          status.style.display = 'block';
          status.style.color = '#1F7A4D';
          status.textContent = 'Thank you. We will be in touch within 48 hours.';
          f.reset();
        })
        .catch(function () {
          status.style.display = 'block';
          status.style.color = '#B23A3A';
          status.textContent = 'Something went wrong. Please email info@wildheartspublishing.com.au';
        })
        .finally(function () {
          btn.disabled = false;
          btn.innerHTML = original;
        });
    });
  });
})();
