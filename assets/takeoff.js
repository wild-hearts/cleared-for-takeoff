/* C4TO take-off hero: pinned scroll sequence.
   Scroll drives a first-person runway roll: lights accelerate, SPD climbs,
   V1 / ROTATE / POSITIVE CLIMB callouts, the horizon falls away and stars
   warp radially outward from the horizon point. Vanilla port of the Academy
   engine. No scroll listeners: progress is computed inside the rAF loop.
   Reduced motion: the section unpins (CSS) and one static frame renders. */
(function () {
  var wrap = document.querySelector('.takeoff-wrap');
  var stage = document.querySelector('.takeoff-stage');
  if (!wrap || !stage) return;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'takeoff-canvas';
  stage.prepend(canvas);
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var content = stage.querySelector('.wrap');
  var cruise = stage.querySelector('.cruise-cta');
  var hud = stage.querySelector('.hud-readout');
  var callout = stage.querySelector('.hud-callout');

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0, h = 0, stars = [], dashes = [], raf = 0, running = false;

  function resize() {
    var r = stage.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    for (var i = 0; i < 190; i++) {
      stars.push({ x: Math.random() * w, y: Math.random() * h, z: 0.3 + Math.random() * 0.7 });
    }
    dashes = [];
    for (var j = 0; j < 14; j++) dashes.push({ z: j / 14 });
  }

  function ease(t) { return 1 - Math.pow(1 - t, 2); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function progress() {
    var r = wrap.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-r.top / total, 0, 1);
  }

  var last = performance.now();
  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    var p = reduce ? 0.12 : progress();

    var speed = 0.12 + ease(Math.min(p / 0.6, 1)) * 2.6;
    var pitch = Math.max(0, (p - 0.55) / 0.45);
    var horizonY = h * (0.60 - pitch * 0.34);

    ctx.clearRect(0, 0, w, h);

    // stars: drift on the ground, radial warp in the climb
    var wx = w / 2, wy = horizonY * 0.9;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = 0.25 + s.z * 0.55;
      if (pitch > 0.04) {
        var dx = s.x - wx, dy = s.y - wy;
        var dist = Math.hypot(dx, dy) || 1.2;
        var ux = dx / dist, uy = dy / dist;
        var vel = (30 + dist * 1.6) * s.z * pitch * speed * 0.55;
        s.x += ux * vel * dt; s.y += uy * vel * dt;
        if (s.x < -20 || s.x > w + 20 || s.y < -20 || s.y > h + 20) {
          var ang = Math.random() * Math.PI * 2;
          var rr = 10 + Math.random() * Math.min(w, h) * 0.25;
          s.x = wx + Math.cos(ang) * rr;
          s.y = wy + Math.sin(ang) * rr;
          s.z = 0.3 + Math.random() * 0.7;
        }
        var len = Math.min(52, (6 + dist * 0.09) * s.z * pitch * 1.6);
        ctx.strokeStyle = 'rgba(244,248,252,' + a + ')';
        ctx.lineWidth = s.z * 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - ux * len, s.y - uy * len);
        ctx.stroke();
      } else {
        s.y += speed * 7 * s.z * dt;
        if (s.y > h + 6) { s.y = -6; s.x = Math.random() * w; }
        ctx.fillStyle = 'rgba(244,248,252,' + a + ')';
        ctx.fillRect(s.x, s.y, s.z * 2.2, s.z * 2.2);
      }
    }

    // runway
    var groundA = Math.max(0, 1 - pitch * 1.15);
    if (groundA > 0.01) {
      var grad = ctx.createLinearGradient(0, horizonY, 0, h);
      grad.addColorStop(0, 'rgba(9,18,34,' + 0.95 * groundA + ')');
      grad.addColorStop(1, 'rgba(6,12,24,' + 0.99 * groundA + ')');
      ctx.fillStyle = grad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      var glow = ctx.createRadialGradient(w / 2, horizonY, 0, w / 2, horizonY, w * 0.5);
      glow.addColorStop(0, 'rgba(200,134,43,' + 0.22 * groundA + ')');
      glow.addColorStop(1, 'rgba(200,134,43,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, horizonY - 80, w, 160);

      var halfBottom = w * 0.42;
      ctx.strokeStyle = 'rgba(200,134,43,' + 0.5 * groundA + ')';
      ctx.lineWidth = 2;
      [-1, 1].forEach(function (side) {
        ctx.beginPath();
        ctx.moveTo(w / 2 + side * halfBottom, h);
        ctx.lineTo(w / 2, horizonY);
        ctx.stroke();
      });

      for (var k = 0; k < dashes.length; k++) {
        var d = dashes[k];
        d.z -= speed * dt * 0.5;
        if (d.z < 0) d.z += 1;
        var sc = Math.pow(1 - d.z, 2.2);
        var yPos = horizonY + (h - horizonY) * sc;
        var dashH = 34 * sc + 2, dashW = 7 * sc + 1;
        ctx.fillStyle = 'rgba(200,134,43,' + (0.25 + 0.65 * sc) * groundA + ')';
        ctx.fillRect(w / 2 - dashW / 2, yPos, dashW, dashH);
        var halfHere = halfBottom * sc;
        ctx.beginPath();
        ctx.arc(w / 2 - halfHere, yPos + dashH / 2, 2.2 * sc + 0.6, 0, Math.PI * 2);
        ctx.arc(w / 2 + halfHere, yPos + dashH / 2, 2.2 * sc + 0.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244,248,252,' + (0.2 + 0.5 * sc) * groundA + ')';
        ctx.fill();
      }
    }

    // content transforms
    if (!reduce && content) {
      var lift = clamp((p - 0.5) / 0.2, 0, 1);
      content.style.transform = 'translateY(' + (-lift * 200 - p * 24) + 'px)';
      content.style.opacity = String(1 - lift);
    }
    if (!reduce && cruise) {
      var arrive = clamp((p - 0.62) / 0.25, 0, 1);
      var e2 = 1 - Math.pow(1 - arrive, 3);
      cruise.style.transform = 'translate(-50%, calc(-50% + ' + ((1 - e2) * 60) + 'vh)) scale(' + (0.9 + e2 * 0.1) + ')';
      cruise.style.opacity = String(arrive > 0.02 ? 1 : 0);
      cruise.style.pointerEvents = arrive > 0.5 ? 'auto' : 'none';
    }
    if (hud) {
      var spd = Math.round(ease(Math.min(p / 0.6, 1)) * 265);
      var alt = Math.max(0, Math.round(pitch * 11800));
      hud.textContent = 'SPD ' + String(spd).padStart(3, '0') + ' KT   ALT ' + alt.toLocaleString() + ' FT   HDG 042';
    }
    if (callout) {
      var call = p < 0.3 ? 'CLEARED FOR TAKE-OFF' : p < 0.55 ? 'V1' : p < 0.68 ? 'ROTATE' : 'POSITIVE CLIMB';
      if (callout.textContent !== call) callout.textContent = call;
    }

    raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);

  if (reduce) {
    running = true;
    frame(performance.now());
    running = false;
    return;
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      var vis = es[0] && es[0].isIntersecting;
      if (vis && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!vis && running) { running = false; cancelAnimationFrame(raf); }
    }).observe(stage);
  } else {
    running = true; last = performance.now(); raf = requestAnimationFrame(frame);
  }
})();
