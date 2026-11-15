const KEY="athlete-v1";
const blank={strength:[],cycling:[],nutrition:[],weight:[],goals:{start:90,target:82,calories:2300,protein:180}};
let db=load();
function load(){try{return {...blank,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return structuredClone(blank)}}
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function today(){return new Date().toISOString().slice(0,10)}
document.querySelectorAll('input[type="date"]').forEach(x=>x.value=today());
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tab,.page').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.page).classList.add('active');window.scrollTo(0,0)}));
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