(function() {
  var banner = document.createElement('div');
  banner.className = 'site-banner';
  banner.innerHTML = 'For same-day appointments, please call <a href="tel:8015019000">(801) 501-9000</a> or feel free to walk in!';

  var style = document.createElement('style');
  style.textContent =
    '.site-banner {' +
    '  background: var(--color-dark, #2C3E50);' +
    '  color: #fff;' +
    '  text-align: center;' +
    '  padding: 10px 20px;' +
    '  font-family: var(--font-body, "Montserrat", sans-serif);' +
    '  font-size: 0.95rem;' +
    '  font-weight: 500;' +
    '  letter-spacing: 0.3px;' +
    '  position: relative;' +
    '  z-index: 1001;' +
    '}' +
    '.site-banner a {' +
    '  color: var(--color-accent, #C4A77D);' +
    '  text-decoration: none;' +
    '  font-weight: 600;' +
    '}' +
    '.site-banner a:hover { text-decoration: underline; }';

  document.head.appendChild(style);
  document.body.insertBefore(banner, document.body.firstChild);
})();
