const toggle=document.querySelector('.menu-toggle');const mobile=document.querySelector('.mobile-menu');toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));mobile.hidden=open;});document.querySelectorAll('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>{if(toggle&&mobile){toggle.setAttribute('aria-expanded','false');mobile.hidden=true;}}));document.querySelectorAll('form[data-demo-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const msg=form.querySelector('.form-success');if(msg){msg.classList.add('show');msg.scrollIntoView({behavior:'smooth',block:'nearest'});}}));const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();

// Audience-specific navigation injected site-wide without duplicating links in each HTML file.
(function addAudienceNavigation(){
  const desktop=document.querySelector('.desktop-nav');
  const mobile=document.querySelector('.mobile-menu');
  const items=[['shipper-onboarding.html','Shipper Setup'],['driver-application.html','Drive With ALSA']];
  for(const [href,label] of items){
    if(desktop&&!desktop.querySelector('a[href="'+href+'"]')){
      const a=document.createElement('a');a.href=href;a.textContent=label;
      if(location.pathname.endsWith('/'+href))a.classList.add('active');
      desktop.append(a);
    }
    if(mobile&&!mobile.querySelector('a[href="'+href+'"]')){
      const a=document.createElement('a');a.href=href;a.textContent=label;
      a.addEventListener('click',()=>{const t=document.querySelector('.menu-toggle');if(t){t.setAttribute('aria-expanded','false');mobile.hidden=true;}});
      const cta=mobile.querySelector('.btn');if(cta)mobile.insertBefore(a,cta);else mobile.append(a);
    }
  }
})();
