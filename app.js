const KEY="athlete-v1";
const blank={strength:[],cycling:[],nutrition:[],weight:[],goals:{start:90,target:82,calories:2300,protein:180}};
let db=load();
function load(){try{return {...blank,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return structuredClone(blank)}}
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function today(){return new Date().toISOString().slice(0,10)}
document.querySelectorAll('input[type="date"]').forEach(x=>x.value=today());
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tab,.page').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.page).classList.add('active');window.scrollTo(0,0)}));
function openPage(page){document.querySelectorAll('.tab,.page').forEach(x=>x.classList.remove('active'));document.querySelector(`.tab[data-page="${page}"]`)?.classList.add('active');document.getElementById(page)?.classList.add('active');window.scrollTo(0,0)}
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.weekday){const day=document.querySelector('#strengthForm [name="day"]');if(day)day.value=b.dataset.weekday;}openPage(b.dataset.open)}));
document.querySelectorAll('[data-rest]').forEach(b=>b.addEventListener('click',()=>alert('Søndag er din restitutionsdag. Husk rolig bevægelse og restitution.')));
function formData(form){return Object.fromEntries(new FormData(form).entries())}
function add(form,key){form.addEventListener('submit',e=>{e.preventDefault();let d=formData(form);d.id=crypto.randomUUID();db[key].unshift(d);form.reset();form.querySelector('[name=date]').value=today();save();})}
add(document.getElementById('strengthForm'),'strength');add(document.getElementById('cyclingForm'),'cycling');add(document.getElementById('nutritionForm'),'nutrition');add(document.getElementById('weightForm'),'weight');
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function list(id,arr,title,sub){const el=document.getElementById(id);el.innerHTML=arr.length?arr.slice(0,30).map(x=>`<div class="record"><button data-del="${x.id}" data-kind="${id}">Slet</button><strong>${esc(title(x))}</strong><small>${esc(sub(x))}</small></div>`).join(''):'<p class="muted">Ingen registreringer endnu.</p>'}
document.addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(!b)return;const key={strengthList:'strength',cyclingList:'cycling',nutritionList:'nutrition',weightList:'weight'}[b.dataset.kind];if(confirm('Vil du slette denne registrering?')){db[key]=db[key].filter(x=>x.id!==b.dataset.del);save()}});
function render(){
 const g=db.goals||blank.goals;
 document.getElementById('goalStart').value=g.start;document.getElementById('goalTarget').value=g.target;document.getElementById('goalCalories').value=g.calories;document.getElementById('goalProtein').value=g.protein;
 const w=db.weight[0];document.getElementById('homeWeight').textContent=w?Number(w.kg).toFixed(1):'–';
 document.getElementById('homeStrength').textContent=new Set(db.strength.map(x=>x.date)).size;
 document.getElementById('homeRides').textContent=db.cycling.length;
 document.getElementById('homeKm').textContent=db.cycling.reduce((a,x)=>a+(Number(x.km)||0),0).toFixed(1);
 const cycle=Number(db.strength[0]?.cycle||1),sets={1:2,2:3,3:4,4:2}[cycle];document.getElementById('cycleText').textContent=`Styrkecyklus · uge ${cycle} af 4 · ${sets} sæt`;
 // Dashboard cards: current day, weekly strip, cycle, weight, cycling and PRs.
 const schedule=[
  {short:'Ma',name:'Bryst + triceps',kind:'strength',icon:'🏋️'},
  {short:'Ti',name:'Ryg + biceps',kind:'strength',icon:'🏋️'},
  {short:'On',name:'Cykling',kind:'cycling',icon:'🚴'},
  {short:'To',name:'Skulder + mave',kind:'strength',icon:'🏋️'},
  {short:'Fr',name:'Ben',kind:'strength',icon:'🏋️'},
  {short:'Lø',name:'Cykling',kind:'cycling',icon:'🚴'},
  {short:'Sø',name:'Hvile',kind:'rest',icon:'—'}
 ];
 const now=new Date(),monday=new Date(now);monday.setHours(0,0,0,0);monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
 const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const weekDates=Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);return dateKey(d)});
 const todayIndex=(now.getDay()+6)%7;
 const todayPlan=schedule[todayIndex];
 const title=document.getElementById('todayTitle'),subtitle=document.getElementById('todaySubtitle'),todayIcon=document.getElementById('todayIcon');
 if(title){title.textContent=todayPlan.kind==='rest'?'HVILE / RESTITUTION':todayPlan.name.toUpperCase();subtitle.textContent=todayPlan.kind==='rest'?'Restitution: søvn, gåture og mobilitet. Ingen planlagt træning.':todayPlan.kind==='cycling'?'Dagens cykelpas – registrér watt, puls og distance.':'Dagens styrkepas – log øvelser, sæt og gentagelser.';todayIcon.textContent=todayPlan.icon;}
 const weekStrength=db.strength.filter(x=>weekDates.includes(x.date));
 const weekCycling=db.cycling.filter(x=>weekDates.includes(x.date));
 const completedDates=new Set([...weekStrength,...weekCycling].map(x=>x.date));
 const strip=document.getElementById('weekStrip');
 if(strip){strip.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('today',i===todayIndex);b.classList.toggle('done',completedDates.has(weekDates[i]));});}
 const sessionsDone=new Set([...weekStrength.map(x=>x.date),...weekCycling.map(x=>x.date)]).size;
 const count=document.getElementById('weekCount');if(count)count.textContent=`${sessionsDone}/6`;
 const cycleLabel=document.getElementById('cycleWeekLabel');if(cycleLabel)cycleLabel.textContent=`Uge ${cycle}/4`;
 const cycleGrid=document.getElementById('cycleGrid');if(cycleGrid)cycleGrid.querySelectorAll('.cycle-step').forEach((x,i)=>x.classList.toggle('active',i===cycle-1));
 const latestWeight=db.weight[0],target=Number(g.target||82),start=Number(g.start||90),current=latestWeight?Number(latestWeight.kg):null;
 const wn=document.getElementById('weightNow'),wg=document.getElementById('weightGoal'),wl=document.getElementById('weightLeft'),wp=document.getElementById('weightProgress'),wNote=document.getElementById('weightNote');
 if(wn)wn.textContent=current===null?'–':current.toFixed(1);if(wg)wg.textContent=target.toFixed(0);if(wl)wl.textContent=current===null?'–':Math.max(0,current-target).toFixed(1);
 if(wp)wp.style.width=current===null?'0%':`${Math.max(0,Math.min(100,((start-current)/(start-target||1))*100))}%`;if(wNote)wNote.textContent=current===null?'Ikke logget':`Senest registreret ${latestWeight.date}`;
 const latestRide=db.cycling[0],ftp=latestRide?.ftp||270,ftpValue=document.getElementById('ftpValue'),ftpNote=document.getElementById('ftpNote');if(ftpValue)ftpValue.textContent=ftp;if(ftpNote)ftpNote.textContent=latestRide?.ftp?'Senest registreret':'Ubekræftet';
 const wr=document.getElementById('weekRides'),wm=document.getElementById('weekMinutes'),wk=document.getElementById('weekKm');if(wr)wr.textContent=weekCycling.length;if(wm)wm.textContent=`${weekCycling.reduce((a,x)=>a+(Number(x.minutes)||0),0)} min`;if(wk)wk.textContent=weekCycling.reduce((a,x)=>a+(Number(x.km)||0),0).toFixed(0);
 const cyclingNote=document.getElementById('cyclingNote');if(cyclingNote)cyclingNote.textContent=weekCycling.length?`${weekCycling.reduce((a,x)=>a+(Number(x.km)||0),0).toFixed(1)} km registreret denne uge.`:'Ingen ture logget endnu.';
 const bestByExercise={};db.strength.forEach(x=>{const k=(x.exercise||'').toLowerCase();if(!bestByExercise[k]||Number(x.kg)>Number(bestByExercise[k].kg))bestByExercise[k]=x;});
 const prs=Object.values(bestByExercise).sort((a,b)=>Number(b.kg)-Number(a.kg)).slice(0,3);const prList=document.getElementById('prList');if(prList)prList.innerHTML=prs.length?prs.map(x=>`<div class="pr-item"><strong>${esc(x.exercise)}</strong><span>${esc(x.kg)} kg</span></div>`).join(''):'<p class="muted">Ingen PR’er endnu. Første registrering bliver din baseline.</p>';
 const volume=weekStrength.reduce((a,x)=>a+(Number(x.kg)||0)*(Number(x.sets)||0)*(Number(x.reps)||0),0),setsThisWeek=weekStrength.reduce((a,x)=>a+(Number(x.sets)||0),0);
 const analysis=document.getElementById('weekAnalysis');if(analysis)analysis.textContent=`${setsThisWeek} sæt · ${Math.round(volume).toLocaleString('da-DK')} kg volumen · ${weekStrength.length} styrkelogninger denne uge`;

 const recent=[...db.strength.slice(0,2).map(x=>({d:x.date,t:`${x.exercise} · ${x.kg} kg × ${x.reps}`,k:'Styrke'})),...db.cycling.slice(0,2).map(x=>({d:x.date,t:`${x.type} · ${x.km||0} km · ${x.watts||0} W`,k:'Cykling'})),...db.weight.slice(0,1).map(x=>({d:x.date,t:`Vægt ${x.kg} kg`,k:'Vægt'}))].sort((a,b)=>b.d.localeCompare(a.d));
 document.getElementById('recent').innerHTML=recent.length?recent.slice(0,4).map(x=>`<div class="record"><strong>${esc(x.t)}</strong><small>${esc(x.d)} · ${x.k}</small></div>`).join(''):'Du har endnu ikke registreret noget. Start med et træningspas.';
 list('strengthList',db.strength,x=>`${x.exercise} · ${x.kg} kg × ${x.reps}`,x=>`${x.date} · ${x.sets} sæt · ${x.day} · uge ${x.cycle}`);
 list('cyclingList',db.cycling,x=>`${x.type} · ${x.km||0} km`,x=>`${x.date} · ${x.minutes||'–'} min · ${x.watts||'–'} W · puls ${x.hr||'–'}`);
 list('nutritionList',db.nutrition,x=>`${x.meal}: ${x.food}`,x=>`${x.date} · ${x.calories||0} kcal · ${x.protein||0} g protein`);
 list('weightList',db.weight,x=>`${x.kg} kg`,x=>`${x.date}${x.waist?' · talje '+x.waist+' cm':''}`);
 const tday=today(),foods=db.nutrition.filter(x=>x.date===tday);document.getElementById('todayCalories').textContent=foods.reduce((a,x)=>a+(+x.calories||0),0);document.getElementById('todayProtein').textContent=foods.reduce((a,x)=>a+(+x.protein||0),0).toFixed(1)+' g';
 document.getElementById('nutritionTargets').textContent=`Dine mål: ${g.calories} kcal · ${g.protein} g protein pr. dag.`;
 const sorted=[...db.weight].sort((a,b)=>a.date.localeCompare(b.date)).slice(-12),vals=sorted.map(x=>+x.kg),min=Math.min(...vals, g.target)-1,max=Math.max(...vals,g.start)+1;
 document.getElementById('weightChart').innerHTML=sorted.length?sorted.map(x=>{let h=Math.max(5,((+x.kg-min)/(max-min))*100);return `<div class="bar-wrap"><small>${(+x.kg).toFixed(1)}</small><div class="bar" style="height:${h}%"></div><small>${esc(x.date.slice(5))}</small></div>`}).join(''):'<p class="muted">Tilføj dine vejninger for at se grafen.</p>';
 const diff=sorted.length>1?(+sorted.at(-1).kg-(+sorted[0].kg)):'–';document.getElementById('weightChange').textContent=diff==='–'?'Ingen data':`${diff>0?'+':''}${diff.toFixed(1)} kg`;
 const ex=document.querySelector('#strengthForm [name=exercise]');const last=db.strength.find(x=>x.exercise.toLowerCase()===ex.value.toLowerCase());document.getElementById('lastLift').textContent=last?`Sidst registreret: ${last.kg} kg · ${last.sets} sæt · ${last.reps} gentagelser (${last.date})`:'Seneste vægt og gentagelser vises her, når du vælger en øvelse, du har logget før.';
}
document.querySelector('#strengthForm [name=exercise]').addEventListener('input',render);
document.getElementById('saveGoals').addEventListener('click',()=>{db.goals={start:+goalStart.value,target:+goalTarget.value,calories:+goalCalories.value,protein:+goalProtein.value};save();alert('Dine mål er gemt.')});
document.getElementById('backupBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='athlete-backup.json';a.click();URL.revokeObjectURL(a.href)});
document.getElementById('importFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!x.strength||!x.cycling||!x.weight||!x.nutrition)throw Error();db={...blank,...x};save();alert('Backup indlæst.')}catch(err){alert('Filen kunne ikke læses som en ATHLETE-backup.')}});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();