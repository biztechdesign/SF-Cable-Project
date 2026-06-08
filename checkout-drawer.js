/* ================================================================
   CHECKOUT — Order Summary Drawer (mobile ≤900px)
   Used by: checkout-shipping.html, checkout-review.html

   Behaviour:
   - Reads .co-sidebar children and clones them into a slide-in
     right drawer, avoiding content duplication in the HTML.
   - The compact estimated-total bar (#co-mobile-summary-bar)
     triggers the drawer.
   - Matches minicart drawer interaction patterns (overlay, Escape,
     focus trap, focus restore).
================================================================ */
(function () {
  'use strict';

  var _lastFocus = null;

  /* ── Helpers ───────────────────────────────────────────────── */
  function callCreateIcons(el) {
    if (!window.lucide) return;
    try {
      window.lucide.createIcons({
        nodes: [el],
        attrs: { 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }
      });
    } catch (e) {
      try { window.lucide.createIcons(); } catch (e2) { /* noop */ }
    }
  }

  /* ── Build & inject drawer into <body> ─────────────────────── */
  function buildDrawer() {
    /* --- Overlay --- */
    var overlay = document.createElement('div');
    overlay.id        = 'co-summary-overlay';
    overlay.className = 'co-summary-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    /* --- Drawer panel --- */
    var drawer = document.createElement('aside');
    drawer.id        = 'co-summary-drawer';
    drawer.className = 'co-summary-drawer';
    drawer.setAttribute('role',        'dialog');
    drawer.setAttribute('aria-modal',  'true');
    drawer.setAttribute('aria-label',  'Order Summary');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('tabindex',    '-1');

    /* Clone sidebar children (co-summary, co-info-card, …) into body */
    var sidebar      = document.querySelector('.co-sidebar');
    var bodyContent  = '';
    var editCartHtml = '';
    if (sidebar) {
      var tmp = document.createElement('div');
      Array.prototype.forEach.call(sidebar.children, function (child) {
        tmp.appendChild(child.cloneNode(true));
      });

      /* Pull "Edit Cart" button out of the cloned co-summary-head,
         then remove the entire head so the title isn't duplicated. */
      var summaryHead = tmp.querySelector('.co-summary-head');
      if (summaryHead) {
        var editBtn = summaryHead.querySelector('.co-edit-cart-btn');
        if (editBtn) editCartHtml = editBtn.outerHTML;
        summaryHead.parentNode.removeChild(summaryHead);
      }

      bodyContent = tmp.innerHTML;
    }

    drawer.innerHTML =
      '<div class="co-summary-drawer-head">' +
        '<h2 class="co-summary-drawer-title">Order Summary</h2>' +
        '<div class="co-summary-drawer-head-actions">' +
          editCartHtml +
          '<button class="co-summary-drawer-close" id="co-summary-drawer-close"' +
            ' aria-label="Close order summary">' +
            '<i data-lucide="x"></i>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="co-summary-drawer-body" id="co-summary-drawer-body">' +
        bodyContent +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    /* Reinitialise Lucide icons inside the cloned content */
    callCreateIcons(drawer);
  }

  /* ── Sync total amount from DOM into mobile bar ─────────────── */
  function syncTotal() {
    var totalSpan = document.getElementById('co-mobile-total');
    if (!totalSpan) return;
    /* Try #co-total first (shipping page), then .co-total-value (review page) */
    var srcEl = document.getElementById('co-total') ||
                document.querySelector('.co-summary-total .co-total-value');
    if (srcEl) totalSpan.textContent = srcEl.textContent.trim();
  }

  /* ── Open ──────────────────────────────────────────────────── */
  function openDrawer() {
    _lastFocus = document.activeElement;
    var drawer  = document.getElementById('co-summary-drawer');
    var overlay = document.getElementById('co-summary-overlay');
    var trigger = document.getElementById('co-mobile-summary-bar');
    if (!drawer) return;
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('minicart-body-lock');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    /* Move focus to close button after animation starts */
    var closeBtn = document.getElementById('co-summary-drawer-close');
    if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 60);
  }

  /* ── Close ─────────────────────────────────────────────────── */
  function closeDrawer() {
    var drawer  = document.getElementById('co-summary-drawer');
    var overlay = document.getElementById('co-summary-overlay');
    var trigger = document.getElementById('co-mobile-summary-bar');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('minicart-body-lock');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (_lastFocus) { _lastFocus.focus(); _lastFocus = null; }
  }

  /* ── Focus trap ─────────────────────────────────────────────── */
  function trapFocus(e) {
    var drawer = document.getElementById('co-summary-drawer');
    if (!drawer || !drawer.classList.contains('is-open')) return;
    var focusables = Array.prototype.slice.call(
      drawer.querySelectorAll(
        'a[href], button:not([disabled]), input, textarea, select,' +
        ' [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) { return el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0];
    var last  = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  /* ── Wire all event listeners ───────────────────────────────── */
  function attachListeners() {
    var trigger  = document.getElementById('co-mobile-summary-bar');
    var closeBtn = document.getElementById('co-summary-drawer-close');
    var overlay  = document.getElementById('co-summary-overlay');

    if (trigger) {
      trigger.addEventListener('click', openDrawer);
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawer(); }
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay)  overlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      var drawer = document.getElementById('co-summary-drawer');
      if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
      if (e.key === 'Tab') trapFocus(e);
    });
  }

  /* ── Bootstrap ──────────────────────────────────────────────── */
  function init() {
    buildDrawer();
    syncTotal();
    attachListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
