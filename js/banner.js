// The home page's banner on every other page; css/header.css pins it above the header.
(function () {
  var b = document.createElement('div');
  b.className = 'site-banner dr-banner';
  b.innerHTML = 'Same-day? Call <a href="tel:+18015019000">(801) 501-9000</a> or walk in.';
  document.body.insertBefore(b, document.body.firstChild);
})();
