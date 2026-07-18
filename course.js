const COURSE_KEY='ept-pilot-access';
function initLock(){const lock=document.querySelector('.lock');if(!lock)return;if(sessionStorage.getItem(COURSE_KEY)==='351'){lock.classList.add('hidden');return}const form=lock.querySelector('form'),input=lock.querySelector('input'),msg=lock.querySelector('.feedback');form.addEventListener('submit',e=>{e.preventDefault();if(input.value.trim()==='351'){sessionStorage.setItem(COURSE_KEY,'351');lock.classList.add('hidden')}else{msg.textContent='That code is not correct. Please try again.';msg.className='feedback bad';input.select()}})}
function speak(text,index=0){if(!('speechSynthesis'in window)){alert('Audio is not supported by this browser.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='pt-PT';const voices=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('pt'));if(voices.length)u.voice=voices[index%voices.length];u.rate=.82;speechSynthesis.speak(u)}
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[.,!?]/g,'').replace(/\s+/g,' ').trim();
function saveProgress(){const page=document.body.dataset.session;if(!page)return;const exercises=[...document.querySelectorAll('.exercise')],states=exercises.map(ex=>ex.dataset.done==='true'),done=states.filter(Boolean).length,total=exercises.length;localStorage.setItem('ept-'+page,JSON.stringify({states,total,date:new Date().toISOString()}));const pct=total?Math.round(done/total*100):0;document.querySelectorAll('.progress span').forEach(x=>x.style.width=pct+'%');document.querySelectorAll('[data-score]').forEach(x=>x.textContent=`Progress saved: ${done}/${total} activities`)}
function loadProgress(){const page=document.body.dataset.session;if(!page)return;try{const saved=JSON.parse(localStorage.getItem('ept-'+page));if(saved&&Array.isArray(saved.states))document.querySelectorAll('.exercise').forEach((ex,i)=>{if(saved.states[i])ex.dataset.done='true'})}catch(e){localStorage.removeItem('ept-'+page)}}
function mark(ex,ok,message){ex.dataset.done=ok?'true':'false';const out=ex.querySelector('.feedback');out.textContent=message;out.className='feedback '+(ok?'ok':'bad');saveProgress()}
function initExercises(){
  document.querySelectorAll('[data-mcq]').forEach(ex=>{
    ex.querySelector('.check').addEventListener('click',()=>{
      const chosen=ex.querySelector('input:checked');
      const ok=!!chosen&&chosen.value===ex.dataset.answer;
      mark(ex,ok,ok?'Correct — muito bem!':'Not quite. Look again and retry.');
    });
  });
  document.querySelectorAll('[data-fill]').forEach(ex=>{
    ex.querySelector('.check').addEventListener('click',()=>{
      const ok=norm(ex.querySelector('input').value)===norm(ex.dataset.answer);
      mark(ex,ok,ok?'Correct — muito bem!':'Try again. Accents are welcome but are not required.');
    });
  });
  document.querySelectorAll('[data-match]').forEach(ex=>{
    ex.querySelector('.check').addEventListener('click',()=>{
      const ok=[...ex.querySelectorAll('select')].every(x=>x.value===x.dataset.answer);
      mark(ex,ok,ok?'All pairs are correct.':'Some pairs need another look.');
    });
  });
  document.querySelectorAll('[data-order]').forEach(ex=>{
    const pool=ex.querySelector('.tokens'),zone=ex.querySelector('.answer-zone');
    ex.querySelectorAll('.token').forEach(t=>t.addEventListener('click',()=>{
      (t.parentElement===pool?zone:pool).appendChild(t);
    }));
    ex.querySelector('.check').addEventListener('click',()=>{
      const value=[...zone.children].map(x=>x.textContent).join(' ');
      const ok=norm(value)===norm(ex.dataset.answer);
      mark(ex,ok,ok?'Perfect order.':'Not yet — move the words and retry.');
    });
  });
  document.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.exercise').forEach(ex=>{
      delete ex.dataset.done;
      const f=ex.querySelector('.feedback');
      if(f){f.textContent='';f.className='feedback'}
      ex.querySelectorAll('input').forEach(i=>{if(i.type==='radio')i.checked=false;else i.value=''});
      ex.querySelectorAll('select').forEach(s=>s.selectedIndex=0);
    });
    localStorage.removeItem('ept-'+document.body.dataset.session);
    saveProgress();
  }));
  loadProgress();
  saveProgress();
}
document.addEventListener('DOMContentLoaded',()=>{initLock();initExercises();document.querySelectorAll('.listen').forEach((b,i)=>b.addEventListener('click',()=>speak(b.dataset.speak,i)))})
