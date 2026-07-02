/* C4TO night sky: drifting star particles + rotating wireframe globe with
   glowing flight arcs. Vanilla port of the Academy's canvas engine.
   Respects prefers-reduced-motion (renders one static frame). */
(function () {
  document.querySelectorAll('[data-nightsky]').forEach(initNightSky);
  function initNightSky(host) {

  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  host.prepend(canvas);
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0, h = 0, stars = [], raf = 0, running = false;

  var COLORS = ['244, 248, 252', '244, 248, 252', '200, 134, 43', '156, 201, 240'];
  var density = parseFloat(host.getAttribute('data-density') || '1');
  var wantGlobe = host.getAttribute('data-globe') !== 'false';

  function resize() {
    var r = host.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    var count = Math.round((w * h) / 6500 * density);
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w, y: Math.random() * h,
        size: 1 + Math.random() * 2.2,
        vx: -4 - Math.random() * 10, vy: 1 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        freq: 0.4 + Math.random() * 1.2,
        base: 0.25 + Math.random() * 0.5,
        amp: 0.2 + Math.random() * 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }
  }

  function toV3(latDeg, lonDeg) {
    var lat = latDeg * Math.PI / 180, lon = lonDeg * Math.PI / 180;
    return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
  }
  function slerp(a, b, t) {
    var dot = Math.max(-1, Math.min(1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2]));
    var th = Math.acos(dot);
    if (th < 1e-4) return a;
    var s = Math.sin(th), k1 = Math.sin((1 - t) * th) / s, k2 = Math.sin(t * th) / s;
    return [a[0]*k1 + b[0]*k2, a[1]*k1 + b[1]*k2, a[2]*k1 + b[2]*k2];
  }

  var latLines = [], lonLines = [], lat, lon, line;
  for (lat = -60; lat <= 60; lat += 30) {
    line = [];
    for (lon = 0; lon <= 360; lon += 6) line.push(toV3(lat, lon));
    latLines.push(line);
  }
  for (lon = 0; lon < 360; lon += 30) {
    line = [];
    for (lat = -90; lat <= 90; lat += 6) line.push(toV3(lat, lon));
    lonLines.push(line);
  }
  var routes = [
    { a: toV3(-34, 151), b: toV3(51, 0),    speed: 0.055, offset: 0 },
    { a: toV3(37, -122), b: toV3(-37, 145), speed: 0.045, offset: 0.4 },
    { a: toV3(1, 104),   b: toV3(49, 2),    speed: 0.06,  offset: 0.7 },
    { a: toV3(-27, 153), b: toV3(35, 140),  speed: 0.05,  offset: 0.2 }
  ];

  function project(p, rot, cx, cy, R) {
    var x = p[0] * Math.cos(rot) + p[2] * Math.sin(rot);
    var z = -p[0] * Math.sin(rot) + p[2] * Math.cos(rot);
    var persp = 1 / (1 + z * 0.22);
    return [cx + x * R * persp, cy - p[1] * R * persp, z];
  }

  function drawGlobe(t) {
    var cx = w * 0.66, cy = h * 0.48, R = Math.min(w, h) * 0.36, rot = t * 0.05;
    ctx.lineWidth = 1;
    function drawLine(pts) {
      ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var s = project(pts[i], rot, cx, cy, R);
        if (i === 0) ctx.moveTo(s[0], s[1]); else ctx.lineTo(s[0], s[1]);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(156, 201, 240, 0.10)';
    latLines.forEach(drawLine);
    lonLines.forEach(drawLine);

    routes.forEach(function (r) {
      var prog = ((t * r.speed + r.offset) % 1 + 1) % 1, i, p, lift, s;
      ctx.beginPath();
      for (i = 0; i <= 40; i++) {
        p = slerp(r.a, r.b, i / 40);
        lift = 1 + 0.08 * Math.sin((i / 40) * Math.PI);
        s = project([p[0]*lift, p[1]*lift, p[2]*lift], rot, cx, cy, R);
        if (i === 0) ctx.moveTo(s[0], s[1]); else ctx.lineTo(s[0], s[1]);
      }
      ctx.strokeStyle = 'rgba(200, 134, 43, 0.16)';
      ctx.stroke();

      ctx.beginPath();
      var trail = 0.14;
      for (i = 0; i <= 16; i++) {
        var tt = Math.max(0, prog - trail + (trail * i) / 16);
        p = slerp(r.a, r.b, tt);
        lift = 1 + 0.08 * Math.sin(tt * Math.PI);
        s = project([p[0]*lift, p[1]*lift, p[2]*lift], rot, cx, cy, R);
        if (i === 0) ctx.moveTo(s[0], s[1]); else ctx.lineTo(s[0], s[1]);
      }
      ctx.strokeStyle = 'rgba(200, 134, 43, 0.6)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.lineWidth = 1;

      p = slerp(r.a, r.b, prog);
      lift = 1 + 0.08 * Math.sin(prog * Math.PI);
      s = project([p[0]*lift, p[1]*lift, p[2]*lift], rot, cx, cy, R);
      ctx.beginPath();
      ctx.arc(s[0], s[1], 2.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200, 134, 43, ' + (s[2] > 0 ? 1 : 0.45) + ')';
      ctx.shadowColor = 'rgba(200, 134, 43, 0.9)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  var last = 0;
  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    var t = now / 1000;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      st.x += st.vx * dt; st.y += st.vy * dt;
      if (st.x < -4) st.x = w + 4;
      if (st.y > h + 4) st.y = -4;
      var alpha = Math.max(0.05, st.base + Math.sin(t * st.freq + st.phase) * st.amp);
      ctx.fillStyle = 'rgba(' + st.color + ', ' + alpha + ')';
      ctx.fillRect(st.x, st.y, st.size, st.size);
    }
    if (wantGlobe) drawGlobe(t);
    raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);

  if (reduce) {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      ctx.fillStyle = 'rgba(' + st.color + ', ' + st.base + ')';
      ctx.fillRect(st.x, st.y, st.size, st.size);
    }
    if (wantGlobe) drawGlobe(12);
    return;
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      var vis = es[0] && es[0].isIntersecting;
      if (vis && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!vis && running) { running = false; cancelAnimationFrame(raf); }
    }).observe(canvas);
  } else {
    running = true; last = performance.now(); raf = requestAnimationFrame(frame);
  }
  }
})();