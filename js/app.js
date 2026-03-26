'use strict';
const App={
_data:null,_loading:false,
async loadData(){
  if(this._data)return this._data;
  if(this._loading)return new Promise(r=>setTimeout(()=>r(this.loadData()),60));
  this._loading=true;
  try{const resp=await fetch('data/subjects.json');if(!resp.ok)throw new Error('HTTP '+resp.status);this._data=await resp.json();}
  catch(e){console.warn('Data load failed:',e.message);this._data={subjects:[]};}
  this._loading=false;this._mergeAdminData();return this._data;
},
_mergeAdminData(){
  if(!this._data)return;
  const ov=this._parseLS('vm_overrides',{});
  const ad=this._parseLS('vm_admin_data',{subjects:[],quiz:[],pdfs:[],ncertTopics:[],announcements:[],teachers:[],animations:[],images:[],activities:[]});
  this._data.subjects.forEach(s=>{
    s.chapters.forEach(ch=>{
      const key=`${s.id}::${ch.id}`,o=ov[key];if(!o)return;
      if(o.videoId&&ch.lessons?.length)ch.lessons[0].videoId=o.videoId;
      if(o.lesson0Title&&ch.lessons?.length)ch.lessons[0].title=o.lesson0Title;
      if(o.extraLessons?.length)ch.lessons=[...(ch.lessons||[]),...o.extraLessons];
      if(o.adminNote)ch._adminNote=o.adminNote;
      if(o.extraTopics?.length)ch.ncertTopics=[...(ch.ncertTopics||[]),...o.extraTopics];
      if(o.extraQuiz?.length)ch.quiz=[...(ch.quiz||[]),...o.extraQuiz];
      if(o.replaceQuiz?.length)ch.quiz=o.replaceQuiz;
      if(o.extraAnimations?.length)ch.animations=[...(ch.animations||[]),...o.extraAnimations];
      if(o.extraImages?.length)ch.images=[...(ch.images||[]),...o.extraImages];
      if(o.extraActivities?.length)ch.activities=[...(ch.activities||[]),...o.extraActivities];
    });
  });
  (ad.subjects||[]).forEach(cs=>{
    if(!this._data.subjects.find(s=>s.id===cs.id)){
      this._data.subjects.push({id:cs.id||this._slug(cs.name),name:cs.name,nameHi:'',icon:cs.icon||'📖',description:cs.desc||'',chapters:cs.chapters||[],gradient:`linear-gradient(135deg,${cs.color||'#6C63FF'},#4F46E5)`,glow:'rgba(108,99,255,.1)',bg:'rgba(108,99,255,.07)',border:'rgba(108,99,255,.2)',color:cs.color||'#6C63FF'});
    }
  });
},
saveOverride(sid,cid,patch){const ov=this._parseLS('vm_overrides',{});const key=`${sid}::${cid}`;ov[key]={...(ov[key]||{}),...patch};this._saveLS('vm_overrides',ov);this._data=null;},
getOverride(sid,cid){return(this._parseLS('vm_overrides',{}))[`${sid}::${cid}`]||{};},
_parseLS(k,def){try{return JSON.parse(localStorage.getItem(k)||'null')??def;}catch{return def;}},
_saveLS(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
_slug(s){return(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');},
getSubject(id){return(this._data?.subjects||[]).find(s=>s.id===id)||null;},
getChapter(sid,cid){return(this.getSubject(sid)?.chapters||[]).find(c=>c.id===cid)||null;},
getParam(k){return new URLSearchParams(location.search).get(k);},
/* Profile */
getProfile(){return this._parseLS('vm_profile',null);},
saveProfile(p){this._saveLS('vm_profile',p);},
hasProfile(){const p=this.getProfile();return!!(p?.name);},
showOnboarding(cb){
  const el=document.createElement('div');el.className='wall-overlay';el.id='obOverlay';
  let step=0,selSubj='',obName='',role='student';
  const subs=[{id:'mathematics',icon:'📐',name:'Mathematics'},{id:'science',icon:'🔬',name:'Science'},{id:'social-science',icon:'🌍',name:'Social Science'},{id:'english',icon:'📚',name:'English'}];
  const render=()=>{
    if(step===0){
      el.innerHTML=`<div class="glass-card ob-step" style="width:400px;text-align:center">
        <span class="wall-icon" style="font-size:48px;display:block;margin-bottom:16px">✨</span>
        <h2 class="grad-text" style="margin-bottom:12px">Welcome to Class 10Edu</h2>
        <p style="color:var(--ink-dim);margin-bottom:24px">Choose your role to begin your cinematic learning journey.</p>
        <div style="display:grid;gap:12px">
          <div class="ob-option ${role==='student'?'on':''}" onclick="role='student';render()" style="cursor:pointer;padding:16px;border-radius:16px;border:1px solid var(--glass-border);background:rgba(255,255,255,${role==='student'?'.1':'.03'})">🎓 Student</div>
          <div class="ob-option ${role==='teacher'?'on':''}" onclick="role='teacher';render()" style="cursor:pointer;padding:16px;border-radius:16px;border:1px solid var(--glass-border);background:rgba(255,255,255,${role==='teacher'?'.1':'.03'})">👨‍🏫 Teacher</div>
        </div>
        <button class="btn-glow" id="obR1" style="width:100%;margin-top:24px;justify-content:center">Continue →</button>
      </div>`;
      el.querySelector('#obR1').addEventListener('click',()=>{step=1;render();});
      return;
    }
    // ... Simplified other steps to match style
  };
  document.body.appendChild(el);render();
},
/* Theme & Interaction */
toggleMode(){
  const m = localStorage.getItem('vm_mode') === 'light' ? 'dark' : 'light';
  this.setMode(m);
},
toggleFocus(){
  const body = document.body;
  body.classList.toggle('focus-mode');
  if(body.classList.contains('focus-mode')){
    this.toast('Focus Mode: ENGAGED', '🎯');
  } else {
    this.toast('Focus Mode: DISENGAGED', '🔓');
  }
},
ThemeEngine: {
  extract(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Mock color extraction logic for Signature OS
      const colors = ['#6366F1', '#A855F7', '#06B6D4']; 
      document.documentElement.style.setProperty('--accent-1', colors[0]);
      document.documentElement.style.setProperty('--accent-2', colors[1]);
      document.documentElement.style.setProperty('--accent-3', colors[2]);
      App.toast('Neural Theme Synced', '🎨');
    };
    reader.readAsDataURL(file);
  }
},
initTilt(){
  document.querySelectorAll('.glass-card, .subj-tile').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const dx = x - xc;
      const dy = y - yc;
      card.style.transform = `perspective(1000px) rotateY(${dx / 20}deg) rotateX(${-dy / 20}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)`;
    });
  });
},
/* Progress & Streak */
getProgress(){return this._parseLS('vm_prog',{});},
saveProgress(p){this._saveLS('vm_prog',p);},
_ep(p,sid){if(!p[sid])p[sid]={done:[],scores:{},last:null,watched:[]};},
markDone(sid,cid){const p=this.getProgress();this._ep(p,sid);if(!p[sid].done.includes(cid))p[sid].done.push(cid);this.saveProgress(p);this.updateStreak();},
updateStreak(){
  const today=new Date().toDateString(), last=localStorage.getItem('vm_sdate');
  let s=parseInt(localStorage.getItem('vm_streak')||'0');
  if(last!==today){
    s=(last===new Date(Date.now()-86400000).toDateString())?s+1:1;
    localStorage.setItem('vm_streak',s);
    localStorage.setItem('vm_sdate',today);
  }
},
/* Theme */
applyMode(){document.documentElement.setAttribute('data-mode',localStorage.getItem('vm_mode')||'dark');},
setMode(m){document.documentElement.setAttribute('data-mode',m);localStorage.setItem('vm_mode',m);},
/* UI Components */
navbarHTML(){
  const site=VidyaSec.sanitize(localStorage.getItem('vm_site_name')||'Class 10Edu');
  return `<nav class="topnav">
    <a href="dashboard.html" class="nav-brand">
      <div class="nav-gem">V</div>
      <span class="nav-title grad-text">${site}</span>
    </a>
    <div style="margin-left:auto;display:flex;gap:12px;align-items:center">
      <button class="btn-glow" style="padding:8px 16px;font-size:0.8rem" onclick="App.toggleFocus()">Focus</button>
      <input type="file" id="themeUp" style="display:none" onchange="App.ThemeEngine.extract(this.files[0])">
      <button class="btn-glow" style="padding:8px 16px;font-size:0.8rem" onclick="document.getElementById('themeUp').click()">🎨</button>
      <button class="btn-glow" style="padding:8px 16px;font-size:0.8rem" onclick="App.toggleMode()">Theme</button>
      <div class="nav-gem" style="width:32px;height:32px;cursor:pointer" onclick="App.logout()">↩</div>
    </div>
  </nav>`;
},
sidebarHTML(active){
  const role = localStorage.getItem('vm_user_role') || 'student';
  const links = role === 'teacher' ? 
    [{id:'dashboard',n:'Dashboard',i:'🏠',h:'dashboard.html'},{id:'question-papers',n:'Exam Gen',i:'✍️',h:'question-papers.html'},{id:'admin',n:'Admin',i:'⚙️',h:'admin.html'}] :
    [{id:'dashboard',n:'Dashboard',i:'🏠',h:'dashboard.html'},{id:'todo',n:'Goals',i:'🎯',h:'todo.html'},{id:'bookmarks',n:'Saved',i:'🔖',h:'bookmarks.html'}];
  
  return `<aside class="sidebar">
    ${links.map(l=>`<a href="${l.h}" class="sb-link ${active===l.id?'on':''}"><span style="font-size:1.2rem">${l.i}</span> ${l.n}</a>`).join('')}
  </aside>`;
},
aiHTML(){
  return `<div class="ai-orb" onclick="App.toggleAI()">✨</div>
    <div class="ai-panel glass-card" id="aiPanel" style="position:fixed;bottom:120px;right:40px;width:320px;height:450px;display:none;z-index:1000;flex-direction:column">
      <div style="padding:20px;border-bottom:1px solid var(--glass-border);font-weight:800">AI Assistant</div>
      <div id="aiBody" style="flex:1;overflow-y:auto;padding:20px"></div>
      <div style="padding:15px;display:flex;gap:8px">
        <input id="aiInp" class="todo-inp" placeholder="Ask something...">
        <button class="btn-glow" style="padding:10px" onclick="App.sendAI()">→</button>
      </div>
    </div>`;
},
/* AI Logic */
toggleAI(){ const p=document.getElementById('aiPanel'); p.style.display=p.style.display==='none'?'flex':'none'; },
sendAI(){
  const inp=document.getElementById('aiInp'), body=document.getElementById('aiBody');
  if(!inp.value) return;
  body.innerHTML += `<div style="text-align:right;margin-bottom:12px"><span class="glass-card" style="padding:8px 12px;font-size:0.85rem">${inp.value}</span></div>`;
  inp.value = '';
  setTimeout(() => {
    body.innerHTML += `<div style="margin-bottom:12px"><span class="glass-card" style="padding:8px 12px;font-size:0.85rem;border-color:var(--accent-1)">Analyzing context... (Signature Response)</span></div>`;
    body.scrollTop = body.scrollHeight;
  }, 1000);
},
/* To-Do App Logic */
TodoApp: {
  tasks: [],
  init() {
    this.tasks = JSON.parse(localStorage.getItem('vm_todos') || '[]');
    this.render();
  },
  add() {
    const inp = document.getElementById('todoInp');
    if (!inp.value) return;
    this.tasks.push({ id: Date.now(), text: inp.value, done: false });
    inp.value = '';
    this.save();
    this.render();
  },
  toggle(id) {
    const t = this.tasks.find(x => x.id === id);
    if (t) t.done = !t.done;
    this.save();
    this.render();
  },
  save() { localStorage.setItem('vm_todos', JSON.stringify(this.tasks)); },
  render() {
    const list = document.getElementById('todoList');
    if (!list) return;
    list.innerHTML = this.tasks.map(t => `
      <div class="todo-item">
        <div class="todo-check ${t.done?'done':''}" onclick="App.TodoApp.toggle(${t.id})"></div>
        <div class="todo-text ${t.done?'done':''}">${VidyaSec.sanitize(t.text)}</div>
      </div>
    `).join('');
  }
},
/* Page Init */
toast(msg,ico='✅'){
  let t=document.getElementById('appToast');
  if(!t){t=document.createElement('div');t.id='appToast';t.className='toast';document.body.appendChild(t);}
  t.innerHTML=`<span style="margin-right:8px">${ico}</span> ${VidyaSec.sanitize(msg)}`;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t=setTimeout(()=>t.classList.remove('show'),3000);
},
initPage(active){
  const role = localStorage.getItem('vm_user_role');
  if (!role && !window.location.pathname.includes('login.html')) { window.location.href = 'login.html'; return; }
  
  this.applyMode();
  const nb=document.getElementById('nb'), sb=document.getElementById('sb');
  if(nb) nb.innerHTML=this.navbarHTML();
  if(sb) sb.innerHTML=this.sidebarHTML(active);
  
  document.body.insertAdjacentHTML('beforeend', `<div class="ambient-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div><div class="blob blob-3"></div></div>`);
  document.body.insertAdjacentHTML('beforeend', this.aiHTML());
  
  this.initTilt();
  this.TodoApp.init();
}
};
