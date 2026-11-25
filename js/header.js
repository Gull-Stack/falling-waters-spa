// Collapsing header: scrolling down hides the banner and header, scrolling back up brings a slim header,
// and within 120px of the top the full banner and header show. The styles are in css/header.css.
(function () {
  var body = document.body, last = window.scrollY, state = '';
  function set(s) {
    if (s === state) return;
    state = s;
    body.classList.toggle('hdr-away', s === 'away');
    body.classList.toggle('hdr-slim', s === 'slim');
  }
  window.addEventListener('scroll', function () {
    var y = window.scrollY, moved = y - last;
    var atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (y < 120) set('full');
    else if (moved > 4) set('away');
    else if (moved < -4 && !atBottom) set('slim');
    last = y;
  }, { passive: true });
})();
