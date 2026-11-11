// ALSA unified role-specific employment application.
(()=>{"use strict";
const form=document.getElementById("career-application");
if(!form)return;
const roleSelect=document.getElementById("ca-role");
const feedback=document.getElementById("ca-feedback");
const submit=document.getElementById("ca-submit");
const roles=[...roleSelect.options].map(option=>option.value).filter(Boolean);
const groups={
  driving:["New CDL Class A Driver","Experienced CDL Driver"],
  dispatch:["Dispatcher"],
  brokerage:["Freight Agent","Freight Broker","Carrier Sales Representative"],
  operations:["Logistics Coordinator","Fleet / Operations Manager","Owner-Operator Relations"],
  compliance:["Safety & Compliance Coordinator","Administrative / Billing Specialist"],
  general:["Customer Account Representative","Other Transportation Role"]
};
function renderRole(){
  const role=roleSelect.value;
  const group=Object.keys(groups).find(name=>groups[name].includes(role))||"general";
  document.querySelectorAll(".ca-role-fields").forEach(section=>{
    const active=!!role&&section.dataset.group===group;
    section.hidden=!active;
    section.querySelectorAll("input, select, textarea").forEach(input=>{input.disabled=!active;});
  });
}
const url=new URL(window.location.href),selected=url.searchParams.get("role");
if(selected&&roles.includes(selected))roleSelect.value=selected;
roleSelect.addEventListener("change",renderRole);
renderRole();
form.addEventListener("submit",async event=>{
  event.preventDefault();
  feedback.hidden=true;
  if(!form.reportValidity()){
    const invalid=form.querySelector(":invalid");if(invalid)invalid.focus();
    feedback.textContent="Please complete the required application fields.";
    feedback.hidden=false;return;
  }
  const data={};
  new FormData(form).forEach((value,key)=>{if(typeof value==="string")data[key]=value.trim();});
  data.certify=form.elements.certify.checked;
  data.consent=form.elements.consent.checked;
  const original=submit.textContent;
  submit.disabled=true;submit.textContent="Submitting application…";
  try{
    const response=await fetch("https://ailzwppwsdvxtctryapb.supabase.co/functions/v1/career-application-intake",{
      method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)
    });
    const result=await response.json();
    if(!response.ok||!result.ok)throw new Error(result.error||"Application could not be submitted.");
    const container=document.getElementById("application-container");
    container.replaceChildren();
    const success=document.createElement("div");success.className="ca-success";success.setAttribute("role","status");
    const heading=document.createElement("h2");heading.textContent="Application submitted successfully";
    const note=document.createElement("p");note.textContent="ALSA Logistics Network LLC received your application for "+data.role+". Our recruiting team may contact you if there is an opportunity that matches your qualifications. Submission does not guarantee employment.";
    const link=document.createElement("a");link.href="careers.html";link.className="btn btn-primary";link.textContent="Return to Careers →";
    success.append(heading,note,link);container.append(success);
    success.scrollIntoView({behavior:"smooth",block:"start"});
  }catch(err){
    feedback.textContent=err instanceof Error?err.message:"Unable to submit. Please try again.";
    feedback.hidden=false;feedback.scrollIntoView({behavior:"smooth",block:"nearest"});
  }finally{submit.disabled=false;submit.textContent=original;}
});
})();