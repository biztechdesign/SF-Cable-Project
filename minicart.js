/* ================================================================
   MINICART DRAWER — SF Cable
   Injects a right-side slide-in cart drawer and wires it to every
   cart icon in the header across all pages.
================================================================ */
(function () {
  'use strict';

  /* ── Demo cart data ─────────────────────────────────────────── */
  var cartData = {
    items: [
      {
        id: 'ub12-20',
        name: '20ft USB 2.0 A Male to B Male Cable with Ferrite',
        sku: 'UB12-20',
        qty: 1,
        price: 8.74,
        subtotal: 8.74,
        img: 'images/2.jpg',
        href: 'detail.html'
      }
    ]
  };

  /* ── Helpers ─────────────────────────────────────────────────── */
  function fmt(n) { return '$' + n.toFixed(2); }

  function computeSubtotal() {
    return cartData.items.reduce(function (s, i) { return s + i.subtotal; }, 0);
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function callCreateIcons(el) {
    if (!window.lucide) return;
    try {
      window.lucide.createIcons({ nodes: [el], attrs: { 'stroke-width': '2' } });
    } catch (e1) {
      try { window.lucide.createIcons(); } catch (e2) { /* ignore */ }
    }
  }

  /* ── Build & inject drawer HTML ─────────────────────────────── */
  function buildDrawer() {
    var overlay = document.createElement('div');
    overlay.id = 'minicart-overlay';
    overlay.className = 'minicart-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    var aside = document.createElement('aside');
    aside.id = 'minicart-drawer';
    aside.className = 'minicart-drawer';
    aside.setAttribute('role', 'dialog');
    aside.setAttribute('aria-modal', 'true');
    aside.setAttribute('aria-label', 'My Cart');
    aside.setAttribute('aria-hidden', 'true');

    aside.innerHTML =
      /* ── Drawer header ── */
      '<div class="minicart-head">' +
        '<h2 class="minicart-title">My Cart</h2>' +
        '<button class="minicart-close" id="minicart-close" aria-label="Close cart">' +
          '<i data-lucide="x"></i>' +
        '</button>' +
      '</div>' +

      /* ── Summary bar (hidden when empty) ── */
      '<div class="minicart-summary-bar" id="minicart-summary-bar">' +
        '<div class="minicart-summary-left">' +
          '<span class="minicart-count-text" id="minicart-count-text"></span>' +
          '<a href="cart.html" class="minicart-view-cart">View and Edit Cart</a>' +
        '</div>' +
        '<div class="minicart-summary-right">' +
          '<span class="minicart-subtotal-label">Cart Subtotal:</span>' +
          '<span class="minicart-subtotal-value" id="minicart-subtotal-value"></span>' +
        '</div>' +
      '</div>' +

      /* ── Scrollable body ── */
      '<div class="minicart-body" id="minicart-body">' +
        '<div id="minicart-items-list"></div>' +
        '<div class="minicart-empty-state" id="minicart-empty-state" style="display:none">' +
          '<i data-lucide="shopping-cart"></i>' +
          '<p>Your cart is empty</p>' +
          '<a href="categories.html" class="btn btn-primary">Continue Shopping</a>' +
        '</div>' +
      '</div>' +

      /* ── Footer CTA (hidden when empty) ── */
      '<div class="minicart-footer" id="minicart-footer">' +
        '<a href="checkout-shipping.html" class="cart-checkout-btn minicart-checkout-btn" aria-label="Proceed to Checkout">' +
          '<i data-lucide="lock"></i> Proceed to Checkout' +
        '</a>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(aside);
  }

  /* ── Render cart items ──────────────────────────────────────── */
  function renderItems() {
    var list       = document.getElementById('minicart-items-list');
    var empty      = document.getElementById('minicart-empty-state');
    var summaryBar = document.getElementById('minicart-summary-bar');
    var footer     = document.getElementById('minicart-footer');
    var countEl    = document.getElementById('minicart-count-text');
    var subtotalEl = document.getElementById('minicart-subtotal-value');

    if (!list) return;

    if (!cartData.items.length) {
      list.innerHTML = '';
      empty.style.display = 'flex';
      summaryBar.style.display = 'none';
      footer.style.display = 'none';
      callCreateIcons(empty);
      return;
    }

    empty.style.display = 'none';
    summaryBar.style.display = '';
    footer.style.display = '';

    var n = cartData.items.length;
    countEl.textContent = n + (n === 1 ? ' item' : ' items') + ' in cart';
    subtotalEl.textContent = fmt(computeSubtotal());

    list.innerHTML = cartData.items.map(function (item) {
      return (
        '<div class="minicart-item" data-item-id="' + esc(item.id) + '">' +
          '<div class="minicart-img-wrap">' +
            '<img src="' + esc(item.img) + '" alt="' + esc(item.name) + '" loading="lazy" />' +
          '</div>' +
          '<div class="minicart-item-details">' +
            '<a href="' + esc(item.href) + '" class="minicart-item-name">' + esc(item.name) + '</a>' +
            '<div class="minicart-meta-row"><span class="minicart-meta-label">Qty:</span> ' + item.qty + '</div>' +
            '<div class="minicart-meta-row"><span class="minicart-meta-label">SKU:</span> ' + esc(item.sku) + '</div>' +
            '<div class="minicart-meta-row"><span class="minicart-meta-label">Price:</span> ' + fmt(item.price) + '</div>' +
            '<div class="minicart-item-footer">' +
              '<div class="minicart-meta-row"><span class="minicart-meta-label">Subtotal:</span> ' + fmt(item.subtotal) + '</div>' +
              '<div class="minicart-item-actions">' +
                '<button class="cart-action-btn" aria-label="Edit item" title="Edit" data-edit="' + esc(item.id) + '">' +
                  '<i data-lucide="pencil"></i>' +
                '</button>' +
                '<button class="cart-action-btn cart-remove-btn" aria-label="Remove item" title="Remove" data-remove="' + esc(item.id) + '">' +
                  '<i data-lucide="trash-2"></i>' +
                '</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    callCreateIcons(list);
  }

  /* ── Open / Close ───────────────────────────────────────────── */
  var _lastFocus = null;

  function openDrawer() {
    _lastFocus = document.activeElement;
    var drawer  = document.getElementById('minicart-drawer');
    var overlay = document.getElementById('minicart-overlay');
    if (!drawer) return;
    drawer.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.classList.add('minicart-body-lock');
    var closeBtn = document.getElementById('minicart-close');
    if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 60);
  }

  function closeDrawer() {
    var drawer  = document.getElementById('minicart-drawer');
    var overlay = document.getElementById('minicart-overlay');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('minicart-body-lock');
    if (_lastFocus) { _lastFocus.focus(); _lastFocus = null; }
  }

  /* ── Focus trap ─────────────────────────────────────────────── */
  function trapFocus(e) {
    var drawer = document.getElementById('minicart-drawer');
    if (!drawer || !drawer.classList.contains('is-open')) return;
    var focusables = Array.prototype.slice.call(
      drawer.querySelectorAll('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])')
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

  /* ── Sync header cart count badges ─────────────────────────── */
  function updateHeaderCounts() {
    var count = cartData.items.length;
    /* IDs used across pages */
    ['nav-cart-count', 'header-cart-count', 'mobile-cart-count'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = count;
    });
    /* Class-based badges (no explicit ID) */
    document.querySelectorAll('.nav-cart-count, .cart-count, .mobile-shop-cart-count').forEach(function (el) {
      el.textContent = count;
    });
  }

  /* ── Wire cart icon triggers ────────────────────────────────── */
  function attachTriggers() {
    var triggers = Array.prototype.slice.call(
      document.querySelectorAll(
        '.nav-action-link.nav-action-cart, ' +
        '.mobile-header-btn[aria-label="Cart"], ' +
        '.mobile-shop-icon-btn[aria-label="Cart"]'
      )
    );

    triggers.forEach(function (el) {
      el.setAttribute('aria-haspopup', 'dialog');
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openDrawer();
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawer(); }
      });
    });
  }

  /* ── Global keyboard / overlay listeners ───────────────────── */
  function attachGlobalListeners() {
    var closeBtn = document.getElementById('minicart-close');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    var overlay = document.getElementById('minicart-overlay');
    if (overlay) overlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var drawer = document.getElementById('minicart-drawer');
        if (drawer && drawer.classList.contains('is-open')) closeDrawer();
      }
      if (e.key === 'Tab') trapFocus(e);
    });

    /* Delegated remove / edit on items list */
    var list = document.getElementById('minicart-items-list');
    if (list) {
      list.addEventListener('click', function (e) {
        var removeBtn = e.target.closest('[data-remove]');
        if (removeBtn) {
          var id = removeBtn.getAttribute('data-remove');
          cartData.items = cartData.items.filter(function (item) { return item.id !== id; });
          renderItems();
          updateHeaderCounts();
          return;
        }
        var editBtn = e.target.closest('[data-edit]');
        if (editBtn) {
          var eid = editBtn.getAttribute('data-edit');
          var item = cartData.items.filter(function (i) { return i.id === eid; })[0];
          if (item) window.location.href = item.href;
        }
      });
    }
  }

  /* ── Bootstrap ──────────────────────────────────────────────── */
  function init() {
    buildDrawer();
    renderItems();
    /* Process lucide icons in the injected drawer */
    var drawer = document.getElementById('minicart-drawer');
    if (drawer) callCreateIcons(drawer);
    attachTriggers();
    attachGlobalListeners();
    updateHeaderCounts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
