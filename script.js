// Native links and scrolling remain available without JavaScript.
document.documentElement.classList.add('js');
const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('#primary-nav');
if(menu&&nav){
 menu.hidden=false;
 const close=(restore=false)=>{menu.setAttribute('aria-expanded','false');if(restore)menu.focus();};
 menu.addEventListener('click',()=>menu.setAttribute('aria-expanded',String(menu.getAttribute('aria-expanded')!=='true')));
 nav.addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;close();if(link.hash&&link.pathname===location.pathname){const target=document.querySelector(link.hash);if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}}});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true')close(true);});
 document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))close();});
 const media=window.matchMedia('(max-width: 760px)');
 media.addEventListener('change',()=>close());
}
if(document.body.dataset.page==='home'&&'IntersectionObserver'in window){
 const sections=[...document.querySelectorAll('[data-nav-section]')];
 const update=()=>{const marker=window.scrollY+Math.min(210,window.innerHeight*.28);let current='';for(const s of sections)if(s.offsetTop<=marker)current=s.dataset.navSection;if(window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-10)current='contact';for(const a of nav.querySelectorAll('[data-nav]')){if(a.dataset.nav===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');}};
 let pending=false;window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(()=>{update();pending=false;});}},{passive:true});
 window.addEventListener('resize',update);window.addEventListener('pageshow',update);update();
}
const send=document.querySelector('#send-signal');
if(send){
 send.hidden=false;let index=0,timer;
 const messages=['Chips → dependable systems.','Research → better-informed decisions.','Community → shared opportunities.'];
 send.addEventListener('click',()=>{const figure=send.closest('figure');figure.classList.remove('is-sending');figure.dataset.signal=String(index);document.querySelector('#signal-output').textContent=messages[index];index=(index+1)%messages.length;clearTimeout(timer);requestAnimationFrame(()=>figure.classList.add('is-sending'));timer=setTimeout(()=>figure.classList.remove('is-sending'),700);});
}
