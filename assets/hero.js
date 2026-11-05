// Illustrative optimizer: noisy normalized-gradient steps on a multi-well landscape,
// projected onto the feasible set (outside the dashed circle).
(function () {
  var base = document.getElementById('field');
  var over = document.getElementById('trace');
  if (!base || !over) return;

  var S = 520;
  base.width = over.width = S;
  base.height = over.height = S;

  var wells = [[0.5, 0.5, 1.0, 0.17], [0.2, 0.78, 0.8, 0.14], [0.8, 0.24, 0.7, 0.12], [0.78, 0.8, 0.45, 0.1]];
  var C = [0.5, 0.5], R = 0.2;
  var L = 14;
  var stops = [
    [0.0, [43, 45, 110]], [0.3, [106, 58, 140]], [0.55, [192, 69, 122]],
    [0.8, [237, 162, 126]], [1.0, [244, 245, 243]]
  ];

  function f(x, y) {
    var v = 0;
    for (var i = 0; i < wells.length; i++) {
      var w = wells[i], dx = x - w[0], dy = y - w[1];
      v += w[2] * Math.exp(-(dx * dx + dy * dy) / (2 * w[3] * w[3]));
    }
    return 1 - v;
  }
  function grad(x, y) {
    var gx = 0, gy = 0;
    for (var i = 0; i < wells.length; i++) {
      var w = wells[i], dx = x - w[0], dy = y - w[1];
      var e = w[2] * Math.exp(-(dx * dx + dy * dy) / (2 * w[3] * w[3]));
      gx += e * dx / (w[3] * w[3]);
      gy += e * dy / (w[3] * w[3]);
    }
    return [gx, gy];
  }
  function ramp(t) {
    t = Math.max(0, Math.min(1, t));
    for (var i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) {
        var a = stops[i - 1], b = stops[i], u = (t - a[0]) / (b[0] - a[0]);
        return [0, 1, 2].map(function (k) { return a[1][k] + (b[1][k] - a[1][k]) * u; });
      }
    }
    return stops[stops.length - 1][1];
  }

  // Draw banded landscape once.
  (function paintField() {
    var ctx = base.getContext('2d');
    var img = ctx.createImageData(S, S);
    var lv = new Int16Array(S * S);
    for (var j = 0; j < S; j++) {
      for (var i = 0; i < S; i++) {
        var v = Math.max(0, Math.min(0.9999, f(i / (S - 1), j / (S - 1))));
        lv[j * S + i] = Math.floor(v * L);
      }
    }
    for (var j2 = 0; j2 < S; j2++) {
      for (var i2 = 0; i2 < S; i2++) {
        var k = j2 * S + i2, l = lv[k];
        var c = ramp((l + 0.5) / L);
        var edge = (i2 < S - 1 && lv[k + 1] !== l) || (j2 < S - 1 && lv[k + S] !== l);
        var m = edge ? 0.78 : 1;
        img.data[k * 4] = c[0] * m;
        img.data[k * 4 + 1] = c[1] * m;
        img.data[k * 4 + 2] = c[2] * m;
        img.data[k * 4 + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    // Infeasible region
    ctx.beginPath();
    ctx.arc(C[0] * S, C[1] * S, R * S, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244,245,243,0.55)';
    ctx.fill();
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1A2030';
    ctx.stroke();
  })();

  function randn() {
    var u = 1 - Math.random(), v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function makePath(x, y) {
    var pts = [[x, y]];
    // Start outside the constraint.
    var d0 = Math.hypot(x - C[0], y - C[1]);
    if (d0 < R) { x = C[0] + (x - C[0]) * R / Math.max(d0, 1e-6); y = C[1] + (y - C[1]) * R / Math.max(d0, 1e-6); pts[0] = [x, y]; }
    for (var t = 0; t < 320; t++) {
      var lr = 0.016 / Math.pow(1 + t / 90, 0.6) + 0.0015;
      var g = grad(x, y), n = Math.hypot(g[0], g[1]);
      if (n > 1e-8) { x -= lr * g[0] / n; y -= lr * g[1] / n; }
      x += 0.35 * lr * randn();
      y += 0.35 * lr * randn();
      var d = Math.hypot(x - C[0], y - C[1]);
      if (d < R) { x = C[0] + (x - C[0]) * R / d; y = C[1] + (y - C[1]) * R / d; }
      x = Math.max(0.02, Math.min(0.98, x));
      y = Math.max(0.02, Math.min(0.98, y));
      pts.push([x, y]);
    }
    return pts;
  }

  var octx = over.getContext('2d');
  var raf = null;

  function stroke(pts, upto) {
    octx.lineJoin = 'round'; octx.lineCap = 'round'; octx.setLineDash([]);
    [[6, 'rgba(244,245,243,0.95)'], [2.6, '#1A2030']].forEach(function (s) {
      octx.beginPath();
      octx.moveTo(pts[0][0] * S, pts[0][1] * S);
      for (var i = 1; i <= upto; i++) octx.lineTo(pts[i][0] * S, pts[i][1] * S);
      octx.lineWidth = s[0]; octx.strokeStyle = s[1]; octx.stroke();
    });
  }
  function marker(p, filled) {
    octx.beginPath();
    octx.arc(p[0] * S, p[1] * S, 7, 0, Math.PI * 2);
    octx.fillStyle = filled ? '#1A2030' : 'rgba(244,245,243,0.95)';
    octx.fill();
    octx.lineWidth = 2.6; octx.strokeStyle = '#1A2030'; octx.setLineDash([]); octx.stroke();
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function run(x, y) {
    if (raf) cancelAnimationFrame(raf);
    octx.clearRect(0, 0, S, S);
    var pts = makePath(x, y);
    function draw(k) {
      octx.clearRect(0, 0, S, S);
      stroke(pts, k);
      marker(pts[0], false);
      if (k === pts.length - 1) marker(pts[k], true);
    }
    if (reduce) { draw(pts.length - 1); return; }
    var k = 0;
    (function step() {
      k = Math.min(pts.length - 1, k + 3);
      draw(k);
      if (k < pts.length - 1) raf = requestAnimationFrame(step);
    })();
  }

  over.addEventListener('click', function (e) {
    var r = over.getBoundingClientRect();
    run((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  });
  var btn = document.getElementById('rerun');
  if (btn) btn.addEventListener('click', function () {
    run(0.06 + Math.random() * 0.88, 0.06 + Math.random() * 0.88);
  });

  run(0.12, 0.18);
})();
