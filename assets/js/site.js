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
