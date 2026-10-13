// ALSA site-wide navigation and shared interactions.
const toggle = document.querySelector('.menu-toggle');
const mobile = document.querySelector('.mobile-menu');
function closeMobileMenu() {
  if (toggle && mobile) {
    toggle.setAttribute('aria-expanded', 'false');
    mobile.hidden = true;
  }
}
toggle?.addEventListener('click', () => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!isOpen));
  if (mobile) mobile.hidden = isOpen;
});
mobile?.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMobileMenu();
});
document.querySelectorAll('form[data-demo-form]').forEach(form => form.addEventListener('submit', event => {
  event.preventDefault();
  const msg = form.querySelector('.form-success');
  if (msg) {
    msg.classList.add('show');
    msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}));
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

(function initializeSiteNavigation() {
  const desktop = document.querySelector('.desktop-nav');
  const mobileNav = document.querySelector('.mobile-menu');
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  const shipperPages = new Set(['shippers.html', 'shipper-onboarding.html', 'quote.html']);

  function makeShipperDropdown(nav, isMobile) {
    if (!nav || nav.querySelector('.shipper-dropdown')) return;
    const existingShippers = nav.querySelector('a[href="shippers.html"]');
    if (!existingShippers) return;
    const details = document.createElement('details');
    details.className = 'shipper-dropdown' + (isMobile ? ' mobile-shipper-dropdown' : '');
    const summary = document.createElement('summary');
    summary.textContent = 'Shippers';
    if (shipperPages.has(currentPage)) summary.classList.add('active');
    summary.setAttribute('aria-label', 'Shippers menu');
    const menu = document.createElement('div');
    menu.className = 'shipper-dropdown-menu';
    [
      ['shippers.html', 'Shippers Overview'],
      ['shipper-onboarding.html', 'Shipper Setup'],
      ['quote.html', 'Request a Quote']
    ].forEach(([href, label]) => {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      if (currentPage === href) link.classList.add('active');
      menu.append(link);
    });
    details.append(summary, menu);
    existingShippers.replaceWith(details);
    // Remove the separately injected Shipper Setup menu item, if present.
    nav.querySelectorAll('a[href="shipper-onboarding.html"]').forEach(link => {
      if (!details.contains(link)) link.remove();
    });
    if (!isMobile) {
      details.addEventListener('mouseenter', () => { details.open = true; });
      // Keep the menu open when its trigger is clicked; close on leaving
      // the entire dropdown or clicking elsewhere.
      summary.addEventListener('click', event => {
        event.preventDefault();
        details.open = true;
      });
      details.addEventListener('mouseleave', () => { details.open = false; });
      document.addEventListener('click', event => {
        if (!details.contains(event.target)) details.open = false;
      });
      details.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          details.open = false;
          summary.focus();
        }
      });
    }
  }

  makeShipperDropdown(desktop, false);
  makeShipperDropdown(mobileNav, true);

  // Retain the driver application as its own navigation path.
  for (const nav of [desktop, mobileNav]) {
    if (!nav || nav.querySelector('a[href="driver-application.html"]')) continue;
    const driver = document.createElement('a');
    driver.href = 'driver-application.html';
    driver.textContent = 'Drive With ALSA';
    if (currentPage === 'driver-application.html') driver.classList.add('active');
    const cta = nav.querySelector(':scope > .btn');
    if (cta) nav.insertBefore(driver, cta);
    else nav.append(driver);
  }
})();


// Combine the former standalone bottom-page CTA with the global footer.
(function unifyFooterCallToAction() {
  const footer = document.querySelector('.site-footer');
  if (!footer || footer.querySelector('.footer-cta')) return;

  // Remove the entire standalone CTA section, including its excess spacing.
  document.querySelectorAll('main .cta-shell').forEach(cta => {
    const section = cta.closest('section');
    if (section) section.remove();
    else cta.remove();
  });

  const section = document.createElement('section');
  section.className = 'footer-cta';
  section.setAttribute('aria-label', 'Request transportation services');
  section.innerHTML = '<div class="container footer-cta-inner">' +
    '<div class="footer-cta-copy"><h2>Move your next shipment with ALSA.</h2>' +
    '<p>Tell us what is moving, where it is going, and when it needs to arrive. We’ll build the right transportation plan around it.</p></div>' +
    '<div class="footer-cta-actions"><a class="btn btn-primary btn-lg" href="quote.html">Request a Quote →</a>' +
    '<a class="btn btn-outline-light btn-lg" href="contact.html">Talk to ALSA</a></div></div>';
  footer.prepend(section);
})();
