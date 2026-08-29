// Шапка при скролле + кнопка наверх
addEventListener('scroll',()=>{
  document.getElementById('header').classList.toggle('scrolled',scrollY>10);
  document.getElementById('toTop').classList.toggle('show',scrollY>600);
});
// Мягкое появление блоков
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%4)*.12+'s';io.observe(el)});
// Мобильное меню: открытие + блокировка скролла
const nav=document.getElementById('nav'),
      burger=document.querySelector('.burger');
function setMenu(open){
  nav.classList.toggle('open',open);
  burger.classList.toggle('active',open);
  document.body.classList.toggle('no-scroll',open);
  burger.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
}
burger.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
// Кнопка «Наверх»
document.getElementById('toTop').addEventListener('click',()=>{
  window.scrollTo({top:0,behavior:'smooth'});
});
// Модалка
function openModal(type){
  document.getElementById('modal').classList.add('open');
  if(type){const s=document.getElementById('fType');[...s.options].forEach(o=>{if(o.text.includes(type.split(' ')[0]))s.value=o.text});
    document.getElementById('fComment').value='Хочу: '+type;}
}
function closeModal(){document.getElementById('modal').classList.remove('open')}
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
// Заявка -> WhatsApp Василисы Прекрасной
document.getElementById('orderForm').addEventListener('submit',e=>{
  e.preventDefault();
  const msg=`Здравствуйте, Василиса! Меня зовут ${fName.value}.%0AТелефон: ${fPhone.value}%0AКатегория: ${fType.value}%0AДата: ${fDate.value||'не указана'}%0AПожелания: ${fComment.value||'—'}`;
  window.open('https://wa.me/79999999999?text='+msg,'_blank');
  closeModal();
});
// ============ БЛЁСТКИ НА ПЕРВОМ ЭКРАНЕ ============
const hero=document.querySelector('.hero');
for(let i=0;i<60;i++){
  const s=document.createElement('span');
  s.className='sprinkle';
  s.setAttribute('aria-hidden','true');
  const size=3+Math.random()*6;
  s.style.width=size+'px';
  s.style.height=size+'px';
  s.style.top=(15+Math.random()*83)+'%';
  s.style.left=Math.random()*100+'%';
  s.style.setProperty('--d',(Math.random()*6).toFixed(2)+'s');
  s.style.setProperty('--t',(4+Math.random()*4).toFixed(2)+'s');
  if(Math.random()<.18) s.style.background='var(--caramel)';
  hero.appendChild(s);
}
// ============ НАКРУТКА ЦИФР В ПЛАШКАХ ============
const nio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  const el=e.target, m=el.textContent.match(/(\d+)(\D*)$/);
  if(m){
    const target=+m[1], suf=m[2], t0=performance.now();
    const tick=t=>{
      const p=Math.min((t-t0)/1800,1), ease=1-Math.pow(1-p,3);
      el.textContent=Math.round(target*ease)+suf;
      if(p<1)requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  nio.unobserve(el);
}),{threshold:.6});
document.querySelectorAll('.stat b').forEach(el=>nio.observe(el));