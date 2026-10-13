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
        details.open = !details.open;
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


// Remove repeated end-of-page calls to action and place one compact action row
// directly inside the existing footer content, on every page.
(function unifyFooterCallToAction() {
  document.querySelectorAll('main .cta-shell').forEach(cta => {
    const wrapper = cta.closest('section');
    if (wrapper && wrapper.contains(cta)) wrapper.remove();
    else cta.remove();
  });

  const footerMain = document.querySelector('.site-footer .footer-main');
  if (!footerMain || footerMain.querySelector('.footer-cta')) return;

  const section = document.createElement('div');
  section.className = 'footer-cta';
  section.innerHTML = `
    <div class="footer-cta-copy">
      <h2>Ready to move freight?</h2>
      <p>Tell ALSA what you need moved. Our team can help plan your next shipment.</p>
    </div>
    <div class="footer-cta-actions">
      <a class="btn btn-primary" href="quote.html">Request a Quote →</a>
      <a class="btn btn-outline-light" href="contact.html">Contact ALSA</a>
    </div>`;
  footerMain.prepend(section);
})();


// A shared visual transition gives every page a purposeful finish before the footer.
(function addPreFooterStory() {
  const footer = document.querySelector('.site-footer');
  if (!footer || document.querySelector('.pre-footer-story')) return;
  const story = document.createElement('section');
  story.className = 'pre-footer-story';
  story.setAttribute('aria-label', 'ALSA transportation coordination');
  story.innerHTML = `
    <div class="container pre-footer-story-inner">
      <div class="pre-footer-story-image">
        <img src="images/warehouse-shippers.jpg" alt="Logistics team coordinating shipments at a warehouse" loading="lazy">
      </div>
      <div class="pre-footer-story-content">
        <span class="pre-footer-story-label">THE ALSA ADVANTAGE</span>
        <h2>Every shipment has a story. We keep yours moving.</h2>
        <p>From the first freight details to the final delivery update, our team brings trucking, brokerage, and hands-on coordination together.</p>
        <div class="pre-footer-story-points">
          <span>Trucking capacity</span>
          <span>Brokerage flexibility</span>
          <span>Clear communication</span>
        </div>
      </div>
    </div>`;
  footer.before(story);
})();

/* Shared production Supabase intake for public-facing website forms. */
window.alsaSubmit = async function(form,type,feedback) {
 const button=form.querySelector('[type="submit"],#da-complete');
 const original=button?.textContent;
 if(button){button.disabled=true;button.textContent="Submitting…";}
 if(feedback){feedback.hidden=false;feedback.classList.remove("show");feedback.textContent="Sending your information securely…";}
 const fields={};
 for(const [key,value] of new FormData(form)){
   if(typeof value==="string"){if(Object.hasOwn(fields,key)){fields[key]=[].concat(fields[key],value)}else fields[key]=value;}
 }
 try{
  let payload={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,fields})};
  if(type==="carrier"){
    const file=form.querySelector('[name="insurance_certificate"]')?.files?.[0];
    if(!file) throw new Error("Certificate of Insurance is required");
    if(file.size>10485760||file.size===0) throw new Error("Insurance certificate must be 10 MB or smaller");
    if(!["application/pdf","image/png","image/jpeg"].includes(file.type)) throw new Error("Use PDF, PNG, or JPG for your certificate");
    const data=new FormData();
    data.append("type",type);
    data.append("fields",JSON.stringify(fields));
    data.append("insurance_certificate",file);
    payload={method:"POST",body:data};
  }
  const response=await fetch("https://ailzwppwsdvxtctryapb.supabase.co/functions/v1/website-intake",payload);
  const result=await response.json();
  if(!response.ok||!result.ok) throw new Error(result.error||"Unable to submit.");
  if(feedback){feedback.textContent="Thank you. Your information has been received by ALSA Logistics.";feedback.classList.add("show");feedback.scrollIntoView({behavior:"smooth",block:"nearest"});}
  form.reset();return true;
 }catch(error){
  if(feedback){feedback.textContent=error.message||"We could not send your information. Please try again or contact ALSA directly.";feedback.classList.add("show");}
  return false;
 }finally{if(button){button.disabled=false;button.textContent=original;}}
};
document.querySelectorAll("form[data-demo-form]").forEach(form=>{
 form.addEventListener("submit",async event=>{
 event.preventDefault();if(!form.reportValidity())return;
 const inputs=[...form.querySelectorAll("input,select,textarea")];
 const type=location.pathname.endsWith("consultation.html")?"consultation":"contact";
 const names=type==="consultation"?["company","contact","email","phone","origin","destination","equipment","pickup_date","shipment_details"]:["name","company","email","phone","topic","message"];
 inputs.forEach((el,index)=>{if(!el.name)el.name=names[index]||"field_"+index;});
 await window.alsaSubmit(form,type,form.querySelector(".form-success"));
 });
});
