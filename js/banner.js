(function () {
  // One bar, not two. It already carried the same-day/walk-in message; it now
  // also carries the standing TAC offer and a booking CTA, because this strip
  // is the first thing every visitor reads and it was doing one job.
  var banner = document.createElement('div');
  banner.className = 'site-banner';
  banner.innerHTML =
    '<span class="site-banner-eyebrow">Treehouse members save 10%</span>' +
    '<span class="site-banner-msg">Same-day appointments welcome — call ' +
    '<a href="tel:8015019000" data-cta="banner-call">(801) 501-9000</a> or walk in.</span>' +
    '<a class="site-banner-cta" href="https://go.booker.com/#/location/fallingwaters" ' +
    'data-cta="banner-book">Book now &rarr;</a>';

  var style = document.createElement('style');
  style.textContent =
    '.site-banner {' +
    '  background: var(--color-dark, #2C3E50);' +
    '  color: #fff;' +
    '  text-align: center;' +
    '  padding: 10px 20px;' +
    '  font-family: var(--font-body, "Montserrat", sans-serif);' +
    '  font-size: 0.9rem;' +
    '  font-weight: 500;' +
    '  letter-spacing: 0.3px;' +
    '  position: relative;' +
    '  z-index: 1001;' +
    '  display: flex;' +
    '  flex-wrap: wrap;' +
    '  align-items: baseline;' +
    '  justify-content: center;' +
    '  gap: 0.35rem 0.85rem;' +
    '}' +
    /* The mono eyebrow — the one type device carried over from the Pardoe site. */
    '.site-banner-eyebrow {' +
    '  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;' +
    '  font-size: 0.62rem;' +
    '  text-transform: uppercase;' +
    '  letter-spacing: 0.2em;' +
    '  font-weight: 500;' +
    '  color: var(--color-accent, #C4A77D);' +
    '}' +
    '.site-banner a {' +
    '  color: var(--color-accent, #C4A77D);' +
    '  text-decoration: none;' +
    '  font-weight: 600;' +
    '}' +
    '.site-banner a:hover { text-decoration: underline; }' +
    '.site-banner-cta {' +
    '  color: #fff !important;' +
    '  text-decoration: underline;' +
    '  text-underline-offset: 4px;' +
    '  text-decoration-color: var(--color-accent, #C4A77D);' +
    '  white-space: nowrap;' +
    '}' +
    '.site-banner-cta:hover { color: var(--color-accent, #C4A77D) !important; }' +
    '@media (max-width: 600px) {' +
    '  .site-banner { font-size: 0.8rem; padding: 8px 14px; }' +
    '  .site-banner-msg { display: none; }' +
    '}';

  document.head.appendChild(style);
  document.body.insertBefore(banner, document.body.firstChild);
})();
