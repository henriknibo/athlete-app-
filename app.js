const KEY="athlete-v1";
const blank={strength:[],cycling:[],nutrition:[],nutritionPlan:{},weight:[],goals:{start:90,target:82,calories:2300,protein:180}};
let db=load();
function load(){try{return {...blank,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return structuredClone(blank)}}
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function today(){return new Date().toISOString().slice(0,10)}
document.querySelectorAll('input[type="date"]').forEach(x=>x.value=today());
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tab,.page').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.page).classList.add('active');window.scrollTo(0,0)}));
function openPage(page){document.querySelectorAll('.tab,.page').forEach(x=>x.classList.remove('active'));document.querySelector(`.tab[data-page="${page}"]`)?.classList.add('active');document.getElementById(page)?.classList.add('active');window.scrollTo(0,0)}
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.weekday){const day=document.querySelector('#strengthForm [name="day"]');if(day)day.value=b.dataset.weekday;const ix=workoutPlan.findIndex(x=>x.day===b.dataset.weekday);if(ix>=0){activeWorkoutIndex=ix;renderProgram();}}openPage(b.dataset.open)}));
document.querySelectorAll('[data-rest]').forEach(b=>b.addEventListener('click',()=>alert('Søndag er din restitutionsdag. Husk rolig bevægelse og restitution.')));
function formData(form){return Object.fromEntries(new FormData(form).entries())}
function add(form,key){form.addEventListener('submit',e=>{e.preventDefault();let d=formData(form);d.id=crypto.randomUUID();db[key].unshift(d);form.reset();form.querySelector('[name=date]').value=today();save();})}
add(document.getElementById('strengthForm'),'strength');add(document.getElementById('cyclingForm'),'cycling');add(document.getElementById('nutritionForm'),'nutrition');add(document.getElementById('weightForm'),'weight');
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function list(id,arr,title,sub){const el=document.getElementById(id);el.innerHTML=arr.length?arr.slice(0,30).map(x=>`<div class="record"><button data-del="${x.id}" data-kind="${id}">Slet</button><strong>${esc(title(x))}</strong><small>${esc(sub(x))}</small></div>`).join(''):'<p class="muted">Ingen registreringer endnu.</p>'}
document.addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(!b)return;const key={strengthList:'strength',cyclingList:'cycling',nutritionList:'nutrition',weightList:'weight'}[b.dataset.kind];if(confirm('Vil du slette denne registrering?')){db[key]=db[key].filter(x=>x.id!==b.dataset.del);save()}});
const workoutPlan=[
 {day:'Bryst + triceps',label:'Mandag',short:'MAN',type:'strength',items:[['Dumbbell Bench Press','8–12'],['Dumbbell Fly','10–15'],['Incline Chest Press','8–12'],['Cable Triceps Extension','10–15'],['Triceps Pushdown','10–15']]},
 {day:'Ryg + biceps',label:'Tirsdag',short:'TIR',type:'strength',items:[['Lat Pulldown','8–12'],['Seated Cable Row','8–12'],['Plate Loaded Machine Row','10–15'],['EZ Bar Bicep Curl','8–12'],['Hammer Curl','10–12']]},
 {day:'Cykling',label:'Onsdag',short:'ONS',type:'cycling',items:[]},
 {day:'Skulder + mave',label:'Torsdag',short:'TOR',type:'strength',items:[['Shoulder Press','8–12'],['Lateral Raise','10–15'],['Reverse Fly','10–15'],['Cable Crunch','12–15'],['Plank','30–45 sek.']]},
 {day:'Ben',label:'Fredag',short:'FRE',type:'strength',items:[['Leg Press','8–12'],['Leg Curl','10–15'],['Leg Extension','10–15'],['Calf Raise','12–15'],['Goblet Squat','10–12']]},
 {day:'Cykling',label:'Lørdag',short:'LØR',type:'cycling',items:[]},
 {day:'Hvile',label:'Søndag',short:'SØN',type:'rest',items:[]}
];
let activeWorkoutIndex=(new Date().getDay()+6)%7;
let selectedCycle=Math.max(1,Math.min(4,Number(db.strength[0]?.cycle||1)));
function cycleNumber(){return selectedCycle}
function setsForCycle(){return ({1:2,2:3,3:4,4:2})[cycleNumber()]}
function lastExercise(name){return db.strength.find(x=>(x.exercise||'').toLowerCase()===name.toLowerCase())}
function renderProgram(){
 const count=setsForCycle(),cycle=cycleNumber();
 const cycleSelect=document.getElementById('programCycleSelect');if(cycleSelect)cycleSelect.value=String(cycle);
 const home=document.getElementById('homeProgram');
 if(home)home.innerHTML=workoutPlan.map((d,i)=>`<button class="home-day ${i===(new Date().getDay()+6)%7?'today':''}" data-plan-day="${i}"><strong>${d.label}: ${esc(d.day)}</strong><small>${d.type==='strength'?`${d.items.length} øvelser · ${count} sæt pr. øvelse`:d.type==='cycling'?'Cykeltræning':'Restitution'}</small><em>${d.type==='strength'?'Åbn styrkepas →':d.type==='cycling'?'Log cykeltur →':'Hviledag'}</em></button>`).join('');
 const days=document.getElementById('workoutDays');
 if(days)days.innerHTML=workoutPlan.map((d,i)=>`<button class="workout-day-btn ${i===activeWorkoutIndex?'active':''}" data-workout-day="${i}"><strong>${d.label} · ${esc(d.day)}</strong><small>${d.type==='strength'?`${d.items.length} øvelser`:d.type==='cycling'?'Cykelpas':'Restitution'}</small></button>`).join('');
 const area=document.getElementById('activeWorkout');if(!area)return;
 const d=workoutPlan[activeWorkoutIndex];
 if(d.type==='cycling'){area.innerHTML=`<div class="workout-heading"><h3>${d.label}: Cykling</h3></div><p class="hint">Dagens cykelpas registreres under Cykling med distance, tid, watt og puls.</p><button class="primary" type="button" data-open-cycling>Åbn cykellog</button>`;return}
 if(d.type==='rest'){area.innerHTML=`<div class="workout-heading"><h3>Søndag: Hvile / restitution</h3></div><p class="hint">Restitution: søvn, gåture og let mobilitet. Ingen planlagt styrketræning.</p>`;return}
 area.innerHTML=`<div class="workout-heading"><h3>${d.label}: ${esc(d.day)}</h3><span class="tag">${count} sæt pr. øvelse</span></div>`+d.items.map((name,j)=>{
  const last=lastExercise(name),kg=last?.kg??'',reps=last?.reps??Number((name==='Plank'?'30':d.items[j][1].split('–')[0]));
  return `<div class="exercise-card" data-exercise-card="${j}"><div class="exercise-title"><div><strong>${esc(name)}</strong><small>Mål: ${esc(d.items[j][1])} gentagelser</small></div><span class="muted">${last?`Sidst ${esc(last.kg)} kg`:'Ny øvelse'}</span></div><div class="set-table">${Array.from({length:count},(_,k)=>`<div class="set-row"><span class="set-num">${k+1}</span><label>Reps<input type="number" min="1" max="200" inputmode="numeric" data-reps="${j}" value="${esc(reps)}"></label><label>Kg<input type="number" min="0" step="0.5" inputmode="decimal" data-kg="${j}" value="${esc(kg)}" placeholder="kg"></label><input type="checkbox" aria-label="Sæt ${k+1} gennemført" data-done="${j}" data-set="${k}"></div>`).join('')}</div><div class="exercise-progress"><span>Gennemførte sæt</span><b data-progress="${j}">0 / ${count}</b></div></div>`;
 }).join('')+`<div class="workout-actions"><button class="workout-complete" type="button" id="saveWorkoutSession">Gem træningspas</button><p class="hint">Kun afkrydsede sæt gemmes i din historik. Tidligere registreringer bevares.</p></div>`;
}
document.getElementById('programCycleSelect')?.addEventListener('change',e=>{selectedCycle=Number(e.target.value)||1;renderProgram()});
document.addEventListener('click',e=>{
 const home=e.target.closest('[data-plan-day]');if(home){const i=Number(home.dataset.planDay);activeWorkoutIndex=i;if(workoutPlan[i].type==='cycling'){openPage('cycling')}else{openPage('strength');renderProgram()}return}
 const day=e.target.closest('[data-workout-day]');if(day){activeWorkoutIndex=Number(day.dataset.workoutDay);renderProgram();return}
 if(e.target.closest('[data-open-cycling]')){openPage('cycling');return}
 if(e.target.closest('#saveWorkoutSession')){saveWorkoutSession();return}
});
document.addEventListener('change',e=>{const cb=e.target.closest('[data-done]');if(cb){const j=cb.dataset.done,card=cb.closest('.exercise-card'),n=card.querySelectorAll(`[data-done="${j}"]:checked`).length,total=card.querySelectorAll(`[data-done="${j}"]`).length;card.querySelector(`[data-progress="${j}"]`).textContent=`${n} / ${total}`;}});
function saveWorkoutSession(){
 const d=workoutPlan[activeWorkoutIndex];if(d.type!=='strength')return;
 const date=today(),cycle=cycleNumber(),count=setsForCycle();let saved=0;
 document.querySelectorAll('#activeWorkout .exercise-card').forEach((card,j)=>{
  const name=d.items[j][0],rows=[...card.querySelectorAll('.set-row')],details=[];
  rows.forEach(row=>{if(row.querySelector('[data-done]').checked){details.push({reps:Number(row.querySelector('[data-reps]').value)||0,kg:Number(row.querySelector('[data-kg]').value)||0});}});
  if(details.length){const valid=details.filter(x=>x.reps>0);if(!valid.length)return;db.strength.unshift({id:crypto.randomUUID(),date,cycle,day:d.day,exercise:name,sets:valid.length,kg:valid.reduce((a,x)=>a+x.kg,0)/valid.length,reps:valid[0].reps,setsDetail:valid,notes:'Registreret fra træningsprogram'});saved++;}
 });
 if(!saved){alert('Markér mindst ét gennemført sæt, før du gemmer.');return;}
 save();renderProgram();alert(`${saved} øvelse(r) gemt i din træningshistorik.`);
}
const mealNames=['Morgenmad','Snack 1','Frokost','Snack 2','Aftensmad'];
let mealWeekOffset=0;
function dateAtWeek(offset,day){const now=new Date();now.setHours(12,0,0,0);const monday=(now.getDay()+6)%7;now.setDate(now.getDate()-monday+offset*7+day);return now.toISOString().slice(0,10)}
function dateLabel(iso){return new Date(iso+'T12:00:00').toLocaleDateString('da-DK',{weekday:'long',day:'numeric',month:'short'})}
function renderMealPlan(){
 const root=document.getElementById('mealWeekPlan');if(!root)return;
 const start=dateAtWeek(mealWeekOffset,0),end=dateAtWeek(mealWeekOffset,6);
 document.getElementById('mealWeekLabel').textContent=mealWeekOffset===0?'Denne uge':`${dateLabel(start)} – ${dateLabel(end)}`;
 root.innerHTML=Array.from({length:7},(_,day)=>{
  const date=dateAtWeek(mealWeekOffset,day),items=db.nutritionPlan[date]||{};
  const completed=mealNames.filter((_,i)=>items[i]?.done).length;
  return `<details class="meal-day-card" ${date===today()?'open':''}><summary><span><b>${dateLabel(date)}</b><small>${completed}/5 måltider</small></span><span class="meal-day-progress">${completed===5?'✓':'›'}</span></summary><div class="meal-slots">${mealNames.map((meal,i)=>{const item=items[i]||{};return `<div class="meal-slot"><label class="meal-slot-check"><input type="checkbox" data-meal-done="${date}" data-meal-index="${i}" ${item.done?'checked':''}><span>${meal}</span></label><input class="meal-slot-input" type="text" data-meal-text="${date}" data-meal-index="${i}" value="${esc(item.text||'')}" placeholder="Skriv ${meal.toLowerCase()} ind…"></div>`}).join('')}</div></details>`
 }).join('');
}
document.getElementById('mealPrevWeek')?.addEventListener('click',()=>{mealWeekOffset--;renderMealPlan()});
document.getElementById('mealNextWeek')?.addEventListener('click',()=>{mealWeekOffset++;renderMealPlan()});
document.getElementById('mealThisWeek')?.addEventListener('click',()=>{mealWeekOffset=0;renderMealPlan()});
document.addEventListener('change',e=>{
 const field=e.target.closest('[data-meal-text],[data-meal-done]');if(!field)return;
 const date=field.dataset.mealText||field.dataset.mealDone,index=Number(field.dataset.mealIndex);
 db.nutritionPlan[date]??={};db.nutritionPlan[date][index]??={text:'',done:false};
 if(field.hasAttribute('data-meal-text'))db.nutritionPlan[date][index].text=field.value;
 else db.nutritionPlan[date][index].done=field.checked;
 localStorage.setItem(KEY,JSON.stringify(db));
 if(field.hasAttribute('data-meal-done'))renderMealPlan();
});

function render(){
 renderMealPlan();
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
 renderProgram();
 const ex=document.querySelector('#strengthForm [name=exercise]');const last=db.strength.find(x=>x.exercise.toLowerCase()===ex.value.toLowerCase());document.getElementById('lastLift').textContent=last?`Sidst registreret: ${last.kg} kg · ${last.sets} sæt · ${last.reps} gentagelser (${last.date})`:'Seneste vægt og gentagelser vises her, når du vælger en øvelse, du har logget før.';
}
document.querySelector('#strengthForm [name=exercise]').addEventListener('input',render);
document.getElementById('saveGoals').addEventListener('click',()=>{db.goals={start:+goalStart.value,target:+goalTarget.value,calories:+goalCalories.value,protein:+goalProtein.value};save();alert('Dine mål er gemt.')});
document.getElementById('backupBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='athlete-backup.json';a.click();URL.revokeObjectURL(a.href)});
document.getElementById('importFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!x.strength||!x.cycling||!x.weight||!x.nutrition)throw Error();db={...blank,...x};save();alert('Backup indlæst.')}catch(err){alert('Filen kunne ikke læses som en ATHLETE-backup.')}});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();