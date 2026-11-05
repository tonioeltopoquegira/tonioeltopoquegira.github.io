// Opens a project in a native <dialog>. Supports deep links like projects.html#metamaterials.
(function () {
  var dialogs = document.querySelectorAll('dialog.project');
  if (!dialogs.length) return;
  var lastTrigger = null;

  function openProject(id, trigger) {
    var d = document.getElementById(id);
    if (!d || typeof d.showModal !== 'function') return;
    dialogs.forEach(function (o) { if (o.open) o.close(); });
    lastTrigger = trigger || null;
    d.showModal();
    d.querySelector('.dlg-body').scrollTop = 0;
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }

  document.querySelectorAll('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () { openProject(b.getAttribute('data-open'), b); });
  });

  dialogs.forEach(function (d) {
    d.querySelector('.dlg-close').addEventListener('click', function () { d.close(); });
    // Click on the backdrop (outside the dialog box) closes it.
    d.addEventListener('click', function (e) {
      var r = d.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) d.close();
    });
    d.addEventListener('close', function () {
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
      if (lastTrigger) lastTrigger.focus();
    });
  });

  // Media slots: show a labelled placeholder until the file exists.
  document.querySelectorAll('.media .frame').forEach(function (f) {
    var img = f.querySelector('img');
    function miss() { f.classList.add('missing'); }
    if (img.complete && img.naturalWidth === 0) miss();
    img.addEventListener('error', miss);
  });

  if (location.hash.length > 1) openProject(location.hash.slice(1));
  window.addEventListener('hashchange', function () {
    if (location.hash.length > 1) openProject(location.hash.slice(1));
  });
})();
