let lessonIndex=0, queue=[], qPos=0, drawing=false, autoToBoard=true, showText=false;
const board=document.getElementById('board'), ctx=board.getContext('2d');
const sel=document.getElementById('lesson'), txtBox=document.getElementById('lessonText'),
ans=document.getElementById('answer'), res=document.getElementById('result'),
scoreEl=document.getElementById('score'), sentBox=document.getElementById('sentence');
let color='#ffffff', lineW=3, mode='chalk', grid=false;
function resize(){ const r=board.getBoundingClientRect(); board.width=r.width*2; board.height=380*2; redrawGrid(); }
window.addEventListener('resize',resize);
function initLessons(){
 sel.innerHTML='';
 LESSONS.forEach((l,i)=>{ const o=document.createElement('option'); o.value=i; o.textContent=l.title+' ('+l.fasl+')'; sel.appendChild(o); });
 sel.onchange=()=>loadLesson(+sel.value); loadLesson(0);
}
function loadLesson(i){
 lessonIndex=i; const L=LESSONS[i];
 document.getElementById('lessonDesc').textContent=L.fasl+' — '+L.desc;
 txtBox.textContent=showText?L.text:'متن برای جلوگیری از تقلب پنهان است. دکمه «نمایش متن» را بزنید یا فقط گوش کنید.';
 sentBox.textContent='درس «'+L.title+'» انتخاب شد. دکمه «خواندن کل املا» یا «کلمه‌به‌کلمه» را بزنید.';
 ans.value=''; res.innerHTML=''; scoreEl.textContent='';
 stopSpeak(); buildQueue();
}
function buildQueue(){
 const L=LESSONS[lessonIndex];
 queue=L.text.replace(/\n/g,' ').split(/(?<=[.؟!])/).map(s=>s.trim()).filter(Boolean);
 qPos=0;
}
function norm(s){ return s.replace(/[ي]/g,'ی').replace(/[ك]/g,'ک').replace(/[‌\u200c]+/g,' ').replace(/[ًٌٍَُِّْٰ]/g,'').replace(/[«»""''(){}\[\]]/g,'').replace(/[،,؛:.؟?!.\-—]/g,' ').replace(/\s+/g,' ').trim(); }
function speak(t,rate){ stopSpeak(); const u=new SpeechSynthesisUtterance(t); u.lang='fa-IR'; u.rate=rate||+document.getElementById('rate').value||0.85; u.pitch=1; speechSynthesis.speak(u); return u; }
function stopSpeak(){ try{speechSynthesis.cancel();}catch(e){} }
document.getElementById('playAll').onclick=()=>{ const L=LESSONS[lessonIndex]; sentBox.textContent='در حال خواندن کل متن... با دقت گوش کنید و بنویسید.'; speak(L.text); };
document.getElementById('playStep').onclick=()=>{ if(!queue.length)buildQueue(); if(qPos>=queue.length)qPos=0; const s=queue[qPos]; sentBox.textContent='جمله '+(qPos+1)+' از '+queue.length+': '+s; speak(s+' . تکرار می‌کنم. '+s); };
document.getElementById('nextStep').onclick=()=>{ if(qPos<queue.length-1){qPos++; document.getElementById('playStep').click();} else sentBox.textContent='املا تمام شد! حالا دکمه تصحیح را بزنید.'; };
document.getElementById('repeatBtn').onclick=()=>document.getElementById('playStep').click();
document.getElementById('stopBtn').onclick=()=>{stopSpeak(); sentBox.textContent='خواندن متوقف شد.';};
document.getElementById('toggleText').onclick=(e)=>{showText=!showText; loadKeep(); e.target.textContent=showText?'پنهان کردن متن':'نمایش متن';};
function loadKeep(){ const v=ans.value, r=res.innerHTML, s=scoreEl.textContent; const L=LESSONS[lessonIndex]; txtBox.textContent=showText?L.text:'متن پنهان است.'; ans.value=v; res.innerHTML=r; scoreEl.textContent=s; }
document.getElementById('check').onclick=()=>{
 const L=LESSONS[lessonIndex];
 const a=norm(L.text).split(' ').filter(Boolean), b=norm(ans.value).split(' ').filter(Boolean);
 if(!b.length){alert('اول در کادر پایین تخته بنویسید!');return;}
 let ok=0, html='', m=Math.max(a.length,b.length);
 for(let i=0;i<m;i++){
  if(a[i]===b[i]&&a[i]){ok++; html+='<span class="ok">'+escapeHtml(b[i])+'</span> ';}
  else if(b[i]&&a[i]){html+='<span class="bad">'+escapeHtml(b[i])+'</span> <span class="miss">('+escapeHtml(a[i]||'')+')</span> ';}
  else if(a[i]){html+='<span class="miss">['+escapeHtml(a[i])+']</span> ';}
 }
 const sc=Math.round(ok/a.length*20*100)/100;
 scoreEl.textContent='نمره: '+sc+' از ۲۰ — '+ok+' کلمه درست از '+a.length;
 res.innerHTML=html;
 speak('آفرین! نمره‌ی تو '+sc+' از بیست شد. '+(sc>=17?'عالی!':sc>=12?'خوب! بیشتر تمرین کن.':'اشکالی ندارد! دوباره گوش کن و تمرین کن.'));
};
function escapeHtml(s){return (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function pos(e){ const r=board.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:(t.clientX-r.left)*2, y:(t.clientY-r.top)*2}; }
board.addEventListener('mousedown',e=>{drawing=true; ctx.beginPath(); const p=pos(e); ctx.moveTo(p.x,p.y); draw(p);});
board.addEventListener('mousemove',e=>{if(drawing)draw(pos(e));});
window.addEventListener('mouseup',()=>drawing=false);
board.addEventListener('touchstart',e=>{e.preventDefault();drawing=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y);},{passive:false});
board.addEventListener('touchmove',e=>{e.preventDefault(); if(drawing)draw(pos(e));},{passive:false});
board.addEventListener('touchend',()=>drawing=false);
function draw(p){ ctx.strokeStyle=mode==='eraser'?'#123c2f':color; ctx.lineWidth=lineW*2; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.globalAlpha=mode==='chalk'?0.92:1; ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x,p.y); }
document.querySelectorAll('.swatch').forEach(s=>s.onclick=()=>{document.querySelectorAll('.swatch').forEach(x=>x.classList.remove('active')); s.classList.add('active'); color=s.dataset.c; mode='chalk';});
document.getElementById('w').oninput=e=>lineW=+e.target.value;
document.getElementById('eraser').onclick=()=>mode='eraser';
document.getElementById('chalkBtn').onclick=()=>{mode='chalk';};
document.getElementById('clear').onclick=()=>{ctx.clearRect(0,0,board.width,board.height); redrawGrid();};
document.getElementById('gridBtn').onclick=e=>{grid=!grid; ctx.clearRect(0,0,board.width,board.height); redrawGrid(); e.target.textContent=grid?'حذف خط‌کشی':'خط‌کشی';};
function redrawGrid(){ if(!grid)return; ctx.save(); ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=2; for(let y=150;y<board.height;y+=140){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(board.width,y);ctx.stroke();} ctx.restore(); }
document.getElementById('save').onclick=()=>{ const a=document.createElement('a'); a.download='takhte.png'; a.href=board.toDataURL(); a.click(); };
ans.addEventListener('input',()=>{ if(!autoToBoard)return; renderTextOnBoard(); });
document.getElementById('autoBoard').onchange=e=>autoToBoard=e.target.checked;
function renderTextOnBoard(){
 ctx.clearRect(0,0,board.width,board.height); redrawGrid();
 ctx.save(); ctx.fillStyle='#ffffff'; ctx.font='44px Vazirmatn, Tahoma'; ctx.direction='rtl'; ctx.textAlign='right';
 const words=ans.value.split(/\s+/); let lines=[''], maxW=board.width-80;
 let cur='';
 words.forEach(w=>{ const t=(cur+' '+w).trim(); if(ctx.measureText(t).width>maxW){lines.push(cur); cur=w;} else cur=t; });
 lines.push(cur); lines=lines.filter(Boolean).slice(-8);
 lines.forEach((ln,i)=>ctx.fillText(ln, board.width-40, 90+i*80));
 ctx.restore();
}
document.getElementById('sendToBoard').onclick=renderTextOnBoard;
initLessons(); setTimeout(resize,300);
