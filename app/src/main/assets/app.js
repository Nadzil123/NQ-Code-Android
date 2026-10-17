'use strict';
// NQ Code 1.0.0-alpha.2 — offline-first Android source editor.
const $ = id => document.getElementById(id);
const iconPaths = {
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  code:'<path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  save:'<path d="M5 4h13l3 3v13H3V4h2Zm2 0v6h10V4M7 20v-7h10v7"/>',
  files:'<rect x="8" y="7" width="12" height="15" rx="1"/><path d="M5 17H4V3h12v2"/>',
  'file-plus':'<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9ZM13 2v7h7M9 16h6m-3-3v6"/>',
  'folder-plus':'<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v2M3 7v12h18v-7M12 15h7m-3.5-3.5v7"/>',
  folder:'<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
  'folder-open':'<path d="M3 10V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v2M3 19l3-9h16l-3 11H3l3-11"/>',
  file:'<path d="M12 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h8"/>',
  'chevron-down':'<path d="m6 9 6 6 6-6"/>',
  'chevron-right':'<path d="m9 6 6 6-6 6"/>',
  'more-horizontal':'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5M5.5 9A7 7 0 0 1 18 6l2 1M4 17l2 1a7 7 0 0 0 12.5-3"/>',
  upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 17v4h16v-4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  keyboard:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M7 16h10"/>',
  'git-branch':'<circle cx="6" cy="3" r="2"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="6" r="2"/><path d="M6 5v10M18 8a6 6 0 0 1-6 6H6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  command:'<path d="M9 7V5a3 3 0 1 0-3 3h13a3 3 0 1 0-3-3v14a3 3 0 1 0 3-3H5a3 3 0 1 0 3 3V5"/>',
  settings:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6 1.5 2.4 2.6.6 2.3-1 2 3.4-1.9 1.9.4 2.7 1.8 2-2 3.5-2.7-.3-2 1.5L12 21l-2-2.3-2.7.1-2-3.4 1.8-2.1.1-2.8L5.4 8l2-3.4 2.8.4Z"/>',
  'close':'<path d="M5 5l14 14M19 5 5 19"/>',
  undo:'<path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-2"/>',
  moon:'<path d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z"/>',
  terminal:'<path d="m4 6 6 6-6 6M12 18h8"/>',
  wrap:'<path d="M3 6h18M3 11h13a4 4 0 0 1 0 8h-5m3-3-3 3 3 3M3 16h5"/>'
};
const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.file}</svg>`;
document.querySelectorAll('[data-icon]').forEach(node => { node.innerHTML = svg(node.dataset.icon); });
const native = () => !!window.NQAndroid;
const escaped = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const lang = name => NQLanguage.detect(name);
const colorExt = name => ({Kotlin:'kt',Java:'kt',JavaScript:'js',TypeScript:'js',Python:'py',Rust:'kt',HTML:'html',CSS:'css',JSON:'json',Markdown:'md',Shell:'py'})[lang(name)] || 'other';
const textBytes = str => {
  const array = new TextEncoder().encode(str); let binary='';
  for(let i=0;i<array.length;i+=8192) binary+=String.fromCharCode(...array.subarray(i,i+8192));
  return btoa(binary);
};
const bytesText = b64 => {
  const raw=atob(b64);const bytes=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i);
  return new TextDecoder('utf-8',{ignoreBOM:true}).decode(bytes);
};
const seedFiles = {
  'demo:/app/Main.kt': `package dev.nolqu.sample

/** Welcome to NQ Code for Android! */
fun main() {
    val appName = "NQ Code"
    val platform = "Android"
    println("Welcome to $appName on $platform!")

    val features = listOf(
        "Syntax highlighting",
        "File explorer",
        "Multiple tabs",
        "Search and replace"
    )

    features.forEach { feature ->
        println("✓ $feature")
    }
}
`,
  'demo:/app/theme.json': `{
  "name": "NQ Midnight",
  "accent": "#6caafa",
  "background": "#0e1117",
  "editor": {
    "fontSize": 14,
    "wordWrap": false,
    "tabSize": 4
  }
}
`,
  'demo:/scripts/hello.py': `# A tiny Python example

def greet(name: str) -> str:
    return f"Hello, {name}!"

for name in ["Android", "NQ Code"]:
    print(greet(name))
`,
  'demo:/README.md': `# NQ Code

Your lightweight Android code editor.

## Get started

1. Open a sample file from Explorer.
2. Edit the source code.
3. Save with Ctrl+S or the save button.

On Android, **Buka folder proyek** opens the system folder picker.
`,
  'demo:/package.json': `{
  "name": "nq-code-sample",
  "version": "0.1.0",
  "description": "A sample workspace",
  "private": true
}
`
};
let demoFiles;try { demoFiles = JSON.parse(localStorage.getItem('nq-demo-files')) || {...seedFiles}; }catch{demoFiles={...seedFiles};}
let demoDirs;try {demoDirs=JSON.parse(localStorage.getItem('nq-demo-dirs')) || ['demo:/','demo:/app','demo:/scripts'];}catch{demoDirs=['demo:/','demo:/app','demo:/scripts'];}
const state = {
  root:'demo:/', name:'DEMO WORKSPACE', selectedFolder:'demo:/',
  expanded:new Set(['demo:/','demo:/app']), folders:new Map(), tabs:[], active:null,
  theme:localStorage.getItem('nq-theme')||'dark', wrap:localStorage.getItem('nq-wrap')==='true',
  font:Number(localStorage.getItem('nq-font')||14), autoPairs:localStorage.getItem('nq-autopairs')!=='false', pendingSave:null,
  searchAt:0, dialogAction:null, hasAndroid:false, entryTarget:null, pendingWrites:[], pendingSaveAs:null
};
let demoSaveTimer, tabSaveTimer;
const flushDemo = () => {clearTimeout(demoSaveTimer);try{localStorage.setItem('nq-demo-files',JSON.stringify(demoFiles));localStorage.setItem('nq-demo-dirs',JSON.stringify(demoDirs));}catch{toast('Penyimpanan browser penuh, ekspor file agar tidak hilang.');}};
const saveDemo = () => {clearTimeout(demoSaveTimer);demoSaveTimer=setTimeout(flushDemo,300);};
const flushTabs = () => {
  clearTimeout(tabSaveTimer);
  try {
    // Never silently truncate unsaved documents: keep complete small buffers only.
    const tabs=state.tabs.filter(t=>t.text.length<=450000 && t.saved.length<=450000).slice(-12)
      .map(({undoStack,redoStack,lastEdit,...tab})=>tab);
    localStorage.setItem('nq-open-tabs',JSON.stringify({tabs,active:state.active}));
    if(state.tabs.some(t=>t.text!==t.saved && !tabs.includes(t)))
      $('statusInfo').textContent='Large unsaved file: save to disk';
  } catch {toast('Cadangan tab penuh. Simpan file ke penyimpanan Android.');}
};
const persist = () => {clearTimeout(tabSaveTimer);tabSaveTimer=setTimeout(flushTabs,300);};
const activeTab = () => state.tabs.find(t=>t.id===state.active);
const toast = msg => {const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2700);};
const badgeName = uri => (uri.split(':').pop().split('/').filter(Boolean).pop() || 'WORKSPACE').toUpperCase();
function applySettings() {
  document.body.dataset.theme=state.theme;
  document.body.classList.toggle('wrap',state.wrap);
  document.documentElement.style.setProperty('--font-size',state.font+'px');
  document.documentElement.style.setProperty('--line-height',Math.round(state.font*1.65)+'px');
  $('lightTheme').checked=state.theme==='light';$('wordWrap').checked=state.wrap;$('autoPairs').checked=state.autoPairs;
  $('fontSize').value=state.font;$('fontSizeLabel').textContent=state.font+'px';
  if(activeTab()) renderHighlight();
}
function setWorkspace(root,name) {
  state.root=root;state.name=(name||badgeName(root)).toUpperCase();state.selectedFolder=root;
  state.expanded=new Set([root]);state.folders.clear();
  $('projectTitle').textContent=state.name;
  $('workspaceTitle').querySelector('span:nth-child(2)').textContent=state.name;
  refreshFolder(root);
  closeSidebar();
}
function getDemoChildren(parent) {
  const parents = new Set();
  for(const key of demoDirs){if(key!==parent){const p=key.substring(0,key.lastIndexOf('/'));if(p===parent.replace(/\/$/,''))parents.add(key);}}
  const folders=[...parents].map(uri=>({uri,name:uri.split('/').pop(),folder:true}));
  const files=Object.keys(demoFiles).filter(uri=>uri.substring(0,uri.lastIndexOf('/'))===parent.replace(/\/$/,'')).map(uri=>({uri,name:uri.split('/').pop(),folder:false}));
  return folders.concat(files);
}
function refreshFolder(uri) {
  if(uri.startsWith('demo:')) {state.folders.set(uri,getDemoChildren(uri));renderTree();}
  else if(native()) {window.NQAndroid.listFolder(uri);}
}
function sorted(entries){return [...entries].sort((a,b)=>Number(b.folder)-Number(a.folder)||a.name.localeCompare(b.name,undefined,{numeric:true}));}
function renderTree(){
  const tree=$('fileTree');tree.replaceChildren();
  const add=(parent,depth)=>{
    let entries=state.folders.get(parent);
    if(!entries){refreshFolder(parent);entries=[];}
    for(const entry of sorted(entries)){
      const row=document.createElement('button'); row.className='file-row';
      if(state.tabs.some(t=>t.uri===entry.uri&&t.id===state.active))row.classList.add('selected');
      row.style.paddingLeft=(12+depth*17)+'px';row.title=entry.name;
      const caret=document.createElement('span');caret.className='caret';caret.innerHTML=entry.folder?svg(state.expanded.has(entry.uri)?'chevron-down':'chevron-right'):'';
      const ico=document.createElement('span');ico.className='file-type '+(entry.folder?'dir':colorExt(entry.name));ico.innerHTML=svg(entry.folder?'folder':'file');
      const title=document.createElement('span');title.textContent=entry.name;
      row.append(caret,ico,title);
      if(!entry.folder){
        const more=document.createElement('span');more.className='entry-more';more.title='Aksi file';
        more.setAttribute('role','button');more.setAttribute('aria-label','Aksi file '+entry.name);
        more.setAttribute('tabindex','0');more.innerHTML=svg('more-horizontal');
        const menu=e=>{e.stopPropagation();openFileActions(entry);};
        more.addEventListener('click',menu);
        more.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();menu(e);}});
        row.append(more);
      }
      row.addEventListener('click',()=>{
        if(entry.folder){state.selectedFolder=entry.uri;if(state.expanded.has(entry.uri))state.expanded.delete(entry.uri);else{state.expanded.add(entry.uri);if(!state.folders.has(entry.uri))refreshFolder(entry.uri);}renderTree();}
        else openEntry(entry);
      });
      tree.append(row);
      if(entry.folder&&state.expanded.has(entry.uri)&&depth<10)add(entry.uri,depth+1);
    }
  };
  add(state.root,0);
  if(!tree.children.length){let note=document.createElement('div');note.className='tree-empty';note.textContent='Folder kosong. Gunakan + untuk membuat file baru.';tree.append(note);}
}
function parentForEntry(uri){
  for(const [parent,items] of state.folders){if(items.some(item=>item.uri===uri))return parent;}
  return state.root;
}
function openFileActions(entry){state.entryTarget={...entry,parent:parentForEntry(entry.uri)};openModal('fileActionsDialog');}
function renameEntry(){
  const target=state.entryTarget;if(!target)return;
  $('fileActionsDialog').close();state.dialogAction='rename';
  $('textDialogTitle').textContent='Ganti nama file';
  $('textDialogDescription').textContent='Ekstensi file dapat diubah';
  $('textDialogInput').value=target.name;
  $('textDialog').showModal();setTimeout(()=>$('textDialogInput').select(),30);
}
function applyRename(name){
  const target=state.entryTarget;if(!target)return;
  name=name.trim();
  if(!name || /[\\/]/.test(name) || name==='.' || name==='..'){toast('Nama file tidak valid.');return;}
  if(target.uri.startsWith('demo:')){
    const updated=target.parent.replace(/\/$/,'')+'/'+name;
    if(updated!==target.uri && (Object.prototype.hasOwnProperty.call(demoFiles,updated)||demoDirs.includes(updated))){toast('Nama sudah digunakan.');return;}
    demoFiles[updated]=demoFiles[target.uri];delete demoFiles[target.uri];saveDemo();
    applyRenamed(target.uri,updated,name,target.parent);
  }else if(native())window.NQAndroid.renameFile(target.uri,name);
}
function requestDelete(){
  const target=state.entryTarget;if(!target)return;
  $('fileActionsDialog').close();
  if(state.tabs.some(t=>t.uri===target.uri && t.text!==t.saved)){
    toast('File masih memiliki perubahan. Simpan dahulu.');return;
  }
  if(!confirm('Hapus file "'+target.name+'" secara permanen? Tindakan ini tidak dapat dibatalkan.'))return;
  if(target.uri.startsWith('demo:')){delete demoFiles[target.uri];saveDemo();applyDeleted(target.uri,target.parent);}
  else if(native())window.NQAndroid.deleteFile(target.uri);
}
function applyRenamed(oldUri,newUri,name,parent){
  state.tabs.filter(t=>t.uri===oldUri).forEach(t=>{t.uri=newUri;t.name=name;});
  for(const items of state.folders.values())items.filter(item=>item.uri===oldUri).forEach(item=>{item.uri=newUri;item.name=name;});
  refreshFolder(parent||state.root);renderTabs();loadEditor();renderTree();persist();toast('Nama berhasil diubah: '+name);
}
function applyDeleted(uri,parent){
  for(const items of state.folders.values()){
    const index=items.findIndex(item=>item.uri===uri);if(index>=0)items.splice(index,1);
  }
  state.tabs=state.tabs.filter(t=>t.uri!==uri);
  if(!state.tabs.some(t=>t.id===state.active))state.active=state.tabs[0]?.id||null;
  refreshFolder(parent||state.root);renderTabs();loadEditor();renderTree();persist();toast('File dihapus.');
}
function openEntry(entry){
  const existing=state.tabs.find(t=>t.uri===entry.uri);
  if(existing){selectTab(existing.id);return;}
  if(entry.uri.startsWith('demo:')) openTab(entry.name,demoFiles[entry.uri]||'',entry.uri);
  else if(native()){toast('Membuka '+entry.name+'...');window.NQAndroid.openUri(entry.uri);}
}
function openTab(name,text,uri=null){
  const matched=uri&&state.tabs.find(t=>t.uri===uri);if(matched){selectTab(matched.id);return;}
  const bom=text.startsWith('\uFEFF');
  if(bom)text=text.slice(1);
  const lineEnding=text.includes('\r\n')?'CRLF':'LF';
  text=text.replace(/\r\n/g,'\n');
  const tab={bom,lineEnding,languageOverride:null,undoStack:[],redoStack:[],lastEdit:0,id:'tab-'+Date.now()+'-'+Math.random().toString(16).slice(2),uri,name,text,saved:text,selectionStart:0,selectionEnd:0,scrollTop:0,scrollLeft:0};
  state.tabs.push(tab);selectTab(tab.id);persist();closeSidebar();
}
function selectTab(id){
  const previous=activeTab();if(previous)rememberCursor(previous);
  state.active=id;renderTabs();loadEditor();renderTree();persist();
}
function rememberCursor(tab){
  if(tab.id===state.active){tab.selectionStart=$('codeInput').selectionStart;tab.selectionEnd=$('codeInput').selectionEnd;tab.scrollTop=$('codeInput').scrollTop;tab.scrollLeft=$('codeInput').scrollLeft;}
}
function closeTab(id){
  const idx=state.tabs.findIndex(t=>t.id===id);if(idx<0)return;
  const tab=state.tabs[idx];
  if(tab.text!==tab.saved && !confirm('Perubahan pada '+tab.name+' belum disimpan. Tutup tetap?'))return;
  state.tabs.splice(idx,1);
  if(state.active===id)state.active=state.tabs[Math.max(0,idx-1)]?.id||null;
  renderTabs();loadEditor();renderTree();persist();
}
function renderTabs(){
  const wrap=$('tabbar');wrap.replaceChildren();
  for(const tab of state.tabs){
    const btn=document.createElement('button');btn.className='tab'+(tab.id===state.active?' active':'');btn.setAttribute('role','tab');btn.setAttribute('aria-selected',String(tab.id===state.active));
    const pic=document.createElement('span');pic.className='file-type '+colorExt(tab.name);pic.innerHTML=svg('file');
    const title=document.createElement('span');title.className='tab-label';title.textContent=tab.name;
    const close=document.createElement('span');close.className='tab-close';close.innerHTML=tab.text!==tab.saved?'<span class="dirty-dot"></span>':svg('close');
    btn.append(pic,title,close);btn.addEventListener('click',e=>{if(close.contains(e.target))closeTab(tab.id);else selectTab(tab.id);});
    wrap.append(btn);
  }
}
function loadEditor(){
  const tab=activeTab();$('welcome').hidden=!!tab;$('codeEditor').hidden=!tab;
  if(!tab){$('breadcrumbs').innerHTML=`${svg('folder')}<span>Workspace</span>${svg('chevron-right')}<b>Mulai mengedit</b>`;$('statusLanguage').textContent='Plain Text';$('statusPosition').textContent='Ln 1, Col 1';return;}
  $('codeInput').value=tab.text;
  $('codeInput').selectionStart=Math.min(tab.selectionStart,tab.text.length);$('codeInput').selectionEnd=Math.min(tab.selectionEnd,tab.text.length);
  $('codeInput').scrollTop=tab.scrollTop;$('codeInput').scrollLeft=tab.scrollLeft;
  $('breadcrumbs').innerHTML=`${svg('folder')}<span>${escaped(state.name)}</span>${svg('chevron-right')}<b>${escaped(tab.name)}</b>`;
  $('statusLanguage').textContent=tab.languageOverride||lang(tab.name);renderHighlight();updatePosition();
}
 let highlightFrame=null;
 let lastGutterLines=0;
 let largeFileWarningId=null;
 function renderHighlight() {
   if (highlightFrame !== null) cancelAnimationFrame(highlightFrame);
   highlightFrame=requestAnimationFrame(() => {
     highlightFrame=null;
     const input=$('codeInput');const tab=activeTab();
     if (!tab) return;
     const text=input.value;
     const lines=(text.match(/\n/g)||[]).length+1;
     if (lines!==lastGutterLines) {
       // 50k is a safeguard against excessive line-number DOM work.
       $('lineNumbers').textContent=Array.from({length:Math.min(lines,50000)},(_,i)=>i+1).join('\n');
       lastGutterLines=lines;
     }
     const preview=$('syntaxText');
     // The textarea always retains ALL text; disable rich markup for large files to
     // avoid building hundreds of thousands of DOM nodes on Android WebView.
     if (text.length > 180000) {
       preview.textContent=text+(text.endsWith('\n')?'\u200b':'');
       if (largeFileWarningId!==tab.id){largeFileWarningId=tab.id;toast('Highlight detail ditunda untuk file besar. Teks tetap dapat diedit.');}
     } else {
       preview.innerHTML=NQLanguage.highlight(text,tab.languageOverride||lang(tab.name))+(text.endsWith('\n')?'\u200b':'');
     }
     syncScroll();
   });
 }
function syncScroll(){
  $('syntaxPane').scrollTop=$('codeInput').scrollTop;$('syntaxPane').scrollLeft=$('codeInput').scrollLeft;
  $('gutter').scrollTop=$('codeInput').scrollTop;
}
function updatePosition(){
  const input=$('codeInput');const prefix=input.value.slice(0,input.selectionStart);let line=1,col=1;
  const n=prefix.lastIndexOf('\n');line=(prefix.match(/\n/g)||[]).length+1;col=prefix.length-(n+1)+1;
  $('statusPosition').textContent=`Ln ${line}, Col ${col}`;
  $('statusInfo').innerHTML=svg('check')+(activeTab()&&activeTab().text!==activeTab().saved?' Modified':' Ready');
}
function prepareHistory(tab, oldText) {
  if (!Array.isArray(tab.undoStack)) tab.undoStack=[];
  if (!Array.isArray(tab.redoStack)) tab.redoStack=[];
  const now=Date.now();
  if (!tab.lastEdit || now-tab.lastEdit>650 || tab.undoStack.length===0) {
    tab.undoStack.push({text:oldText,position:tab.selectionStart||0});
    const limit=oldText.length>200000?1:oldText.length>60000?5:30;
    while (tab.undoStack.length>limit) tab.undoStack.shift();
  }
  tab.lastEdit=now;tab.redoStack=[];
}
function stepHistory(direction) {
  const tab=activeTab();if(!tab)return;
  const from=direction==='undo'?tab.undoStack:tab.redoStack;
  const to=direction==='undo'?tab.redoStack:tab.undoStack;
  if(!from?.length)return;
  const prior=from.pop();to.push({text:tab.text,position:$('codeInput').selectionStart});
  while(to.length>(tab.text.length>200000?1:tab.text.length>60000?5:30))to.shift();
  tab.text=prior.text;tab.lastEdit=0;
  const input=$('codeInput');input.value=prior.text;
  input.setSelectionRange(Math.min(prior.position,prior.text.length),Math.min(prior.position,prior.text.length));
  rememberCursor(tab);renderHighlight();updatePosition();renderTabs();persist();input.focus();
}
function editText(newVal){
  const tab=activeTab();if(!tab)return;
  if(tab.text!==newVal)prepareHistory(tab,tab.text);
  tab.text=newVal;rememberCursor(tab);renderHighlight();updatePosition();renderTabs();persist();
  if(tab.uri&&tab.uri.startsWith('demo:')){demoFiles[tab.uri]=tab.text;saveDemo();}
}

function newScratch(name='Untitled.kt'){openTab(name,'',null);}
function promptCreate(folder){
  state.dialogAction=folder?'folder':'file';
  $('textDialogTitle').textContent=folder?'Folder baru':'File baru';
  $('textDialogDescription').textContent=folder?'Nama folder di direktori terpilih':'Nama file beserta ekstensi (contoh: main.kt)';
  $('textDialogInput').value=folder?'new-folder':'main.kt';
  $('textDialog').showModal();setTimeout(()=>$('textDialogInput').select(),30);
}
function createEntry(folder,name){
  name=name.trim();if(!name || /[\\/]/.test(name)){toast('Nama tidak boleh kosong atau berisi / dan \\.');return;}
  const parent=state.selectedFolder||state.root;
  if(state.root.startsWith('demo:')){
    const id=parent.replace(/\/$/,'')+'/'+name;
    if(demoFiles[id]!==undefined||demoDirs.includes(id)){toast('Nama tersebut sudah ada.');return;}
    if(folder)demoDirs.push(id);else demoFiles[id]='';
    saveDemo();refreshFolder(parent);
    if(!folder)openTab(name,'',id);
    else {state.expanded.add(parent);toast('Folder '+name+' dibuat.');}
  }else if(native())window.NQAndroid.create(parent,name,folder);
  else if(!folder)newScratch(name);
}
function openFilePicker(){if(native())window.NQAndroid.openDocument();else $('browserFiles').click();}
function openFolderPicker(){if(native())window.NQAndroid.openFolder();else toast('Mode demo browser. Pilih folder dari aplikasi Android untuk akses penyimpanan.');}
function serializeTab(tab){
  const text=tab.lineEnding==='CRLF'?tab.text.replace(/\r?\n/g,'\r\n'):tab.text;
  return (tab.bom?'\uFEFF':'')+text;
}
function saveActive(saveAs=false){
  const tab=activeTab();if(!tab){toast('Belum ada file aktif.');return;}
  if(native() && (!tab.uri || saveAs || tab.uri.startsWith('demo:'))){
    if(state.pendingSaveAs){toast('Selesaikan dialog Simpan Sebagai dahulu.');return;}
    state.pendingSaveAs={id:tab.id,snapshot:tab.text};
    window.NQAndroid.saveAs(tab.name,textBytes(serializeTab(tab)));
  }else if(native()&&!tab.uri.startsWith('demo:')){
    state.pendingWrites.push({id:tab.id,uri:tab.uri,snapshot:tab.text});
    window.NQAndroid.save(tab.uri,textBytes(serializeTab(tab)));
  }else{
    if(tab.uri?.startsWith('demo:')){demoFiles[tab.uri]=tab.text;saveDemo();}
    if(saveAs || !tab.uri){
      const blob=new Blob([serializeTab(tab)],{type:'text/plain;charset=utf-8'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=tab.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2500);
    }
    tab.saved=tab.text;renderTabs();updatePosition();persist();toast('Tersimpan dalam demo lokal'+(!tab.uri?' / unduhan':'')+'.');
  }
}
function findNext(){
  const input=$('findInput').value;const t=activeTab();if(!t||!input){toast('Masukkan kata yang dicari.');return;}
  const txt=$('codeInput');let at=txt.value.toLowerCase().indexOf(input.toLowerCase(),txt.selectionEnd);
  if(at<0)at=txt.value.toLowerCase().indexOf(input.toLowerCase());
  if(at<0){$('searchMeta').textContent='Tidak ditemukan';return;}
  $('searchMeta').textContent=`Ditemukan di indeks ${at+1}`;txt.focus();txt.setSelectionRange(at,at+input.length);updatePosition();
}
function replaceAll(){
  const q=$('findInput').value;const t=activeTab();if(!t||!q)return;
  const escapeRe=q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp(escapeRe,'gi');const matches=(t.text.match(re)||[]).length;
  if(!matches){$('searchMeta').textContent='Tidak ditemukan';return;}
  $('codeInput').value=t.text.replace(re,()=>$('replaceInput').value);editText($('codeInput').value);
  $('searchMeta').textContent=`${matches} kemunculan telah diganti.`;
}
function insertAtCursor(text){
  if(!activeTab())return;
  const el=$('codeInput');el.focus();let a=el.selectionStart,b=el.selectionEnd;
  el.setRangeText(text,a,b,'end');editText(el.value);updatePosition();
}
function openLanguage(){
  const tab=activeTab();if(!tab){toast('Buka sebuah file terlebih dahulu.');return;}
  $('languageSelect').value=tab.languageOverride||'auto';
  openModal('languageDialog');
}
function gotoLine(){
  const tab=activeTab();if(!tab){toast('Belum ada file aktif.');return;}
  const requested=Number($('gotoNumber').value);
  if(!Number.isInteger(requested)||requested<1){toast('Nomor baris tidak valid.');return;}
  const text=$('codeInput').value;let pos=0,line=1;
  while(line<requested){const end=text.indexOf('\n',pos);if(end<0)break;pos=end+1;line++;}
  $('gotoDialog').close();const el=$('codeInput');el.focus();el.setSelectionRange(pos,pos);
  // Position the caret visibly without affecting the stored file contents.
  const lh=Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--line-height'))||23;
  el.scrollTop=Math.max(0,(line-2)*lh);syncScroll();updatePosition();
}
const commands=[
  {name:'File baru',hint:'New File',icon:'file-plus',act:()=>promptCreate(false)},
  {name:'Folder baru',hint:'New Folder',icon:'folder-plus',act:()=>promptCreate(true)},
  {name:'Buka file',hint:'Open File',icon:'file',act:openFilePicker},
  {name:'Buka folder proyek',hint:'Open Folder',icon:'folder-open',act:openFolderPicker},
  {name:'Simpan',hint:'Ctrl+S',icon:'save',act:()=>saveActive()},
  {name:'Simpan sebagai...',hint:'Save As',icon:'save',act:()=>saveActive(true)},
  {name:'Cari & ganti',hint:'Ctrl+F',icon:'search',act:()=>openModal('searchDialog')},
  {name:'Menuju baris',hint:'Ctrl+G',icon:'code',act:()=>openModal('gotoDialog')},
  {name:'Pilih bahasa file',hint:'Syntax Language',icon:'code',act:()=>openLanguage()},
  {name:'Undo',hint:'Ctrl+Z',icon:'undo',act:()=>stepHistory('undo')},
  {name:'Redo',hint:'Ctrl+Shift+Z',icon:'undo',act:()=>stepHistory('redo')},
  {name:'Ganti tema',hint:'Light / Dark',icon:'moon',act:()=>{state.theme=state.theme==='dark'?'light':'dark';localStorage.setItem('nq-theme',state.theme);applySettings();}},
  {name:'Toggle word wrap',hint:'Wrap long lines',icon:'wrap',act:()=>{state.wrap=!state.wrap;localStorage.setItem('nq-wrap',state.wrap);applySettings();}},
  {name:'Pengaturan',hint:'Preferences',icon:'settings',act:()=>openModal('settingsDialog')}
];
function openModal(id){$(id).showModal();if(id==='commandDialog'){renderCommands('');setTimeout(()=>$('commandQuery').focus(),40);}if(id==='searchDialog'){setTimeout(()=>$('findInput').focus(),40);}}
function renderCommands(q){
  const wrap=$('commandResults');wrap.replaceChildren();let matches=commands.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.hint.toLowerCase().includes(q.toLowerCase()));
  if(!matches.length){wrap.innerHTML='<div class="tree-empty">Perintah tidak ditemukan.</div>';return;}
  for(const c of matches){const b=document.createElement('button');b.className='command-item';
    const ico=document.createElement('span');ico.innerHTML=svg(c.icon);const title=document.createElement('span');title.textContent=c.name;
    const hint=document.createElement('small');hint.textContent=c.hint;b.append(ico,title,hint);
    b.addEventListener('click',()=>{$('commandDialog').close();c.act();});wrap.append(b);
  }
}
function showSidebar(){ $('sidebar').classList.add('open');$('scrim').classList.add('show'); }
function closeSidebar(){ $('sidebar').classList.remove('open');$('scrim').classList.remove('show'); }
function attach(){
  $('toggleExplorer').onclick=()=>{if($('sidebar').classList.contains('open'))closeSidebar();else showSidebar();};
  $('scrim').onclick=closeSidebar;$('railExplorer').onclick=showSidebar;$('railSearch').onclick=()=>openModal('searchDialog');$('railSettings').onclick=()=>openModal('settingsDialog');
  $('searchButton').onclick=()=>openModal('searchDialog');$('openButton').onclick=openFilePicker;$('saveButton').onclick=()=>saveActive();$('commandButton').onclick=()=>openModal('commandDialog');
  $('newFileButton').onclick=()=>promptCreate(false);$('newFolderButton').onclick=()=>promptCreate(true);
  $('refreshButton').onclick=()=>{state.folders.clear();refreshFolder(state.root);toast('Explorer disegarkan.');};
  $('openFolderButton').onclick=openFolderPicker;$('importFileButton').onclick=openFilePicker;
  $('welcomeNew').onclick=()=>promptCreate(false);$('welcomeFolder').onclick=openFolderPicker;
  $('projectTitle').parentElement.onclick=openFolderPicker;
  $('codeInput').addEventListener('input',()=>editText($('codeInput').value));
  $('codeInput').addEventListener('scroll',syncScroll);
  $('codeInput').addEventListener('beforeinput',e=>{
    if(!state.autoPairs||e.isComposing||e.inputType!=='insertText'||typeof e.data!=='string')return;
    const pairs={'(':')','[':']','{':'}','\"':'\"',"'":"'"};
    if(!Object.prototype.hasOwnProperty.call(pairs,e.data))return;
    const el=$('codeInput');const a=el.selectionStart,b=el.selectionEnd;
    // Only pair at end/whitespace or with a selection; don't interfere with IME edits.
    if(a===b && a<el.value.length && /[\w\])}]/.test(el.value[a]))return;
    e.preventDefault();
    const body=el.value.slice(a,b);const insert=e.data+body+pairs[e.data];
    el.setRangeText(insert,a,b,'end');
    const pos=a+1;el.setSelectionRange(pos,pos+body.length);
    editText(el.value);
  });
  $('codeInput').addEventListener('click',updatePosition);
  $('codeInput').addEventListener('keyup',updatePosition);
  $('codeInput').addEventListener('select',updatePosition);
  $('codeInput').addEventListener('keydown',e=>{
    if(e.isComposing)return;
    if(e.key==='Tab'){e.preventDefault();insertAtCursor('    ');}
    if(e.key==='Enter'){
      const ta=e.currentTarget;const head=ta.value.slice(0,ta.selectionStart);const line=head.slice(head.lastIndexOf('\n')+1);const indent=(line.match(/^\s*/)||[''])[0];
      if(indent){e.preventDefault();insertAtCursor('\n'+indent);}
    }
  });
  document.querySelectorAll('.quick-keys [data-insert]').forEach(b=>b.onclick=()=>insertAtCursor(b.dataset.insert==='\\t'?'    ':b.dataset.insert));
  $('undoButton').onclick=()=>stepHistory('undo');
  $('textDialogCancel').onclick=()=>$('textDialog').close();
  $('textForm').addEventListener('submit',e=>{
    if(e.submitter?.value==='cancel')return;
    const val=$('textDialogInput').value;const action=state.dialogAction;
    setTimeout(()=>action==='rename'?applyRename(val):createEntry(action==='folder',val),0);
  });
  $('findNext').onclick=findNext;$('replaceAll').onclick=replaceAll;$('searchClose').onclick=()=>$('searchDialog').close();
  $('findInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();findNext();}});
  $('commandQuery').addEventListener('input',e=>renderCommands(e.target.value));
  $('commandQuery').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('commandResults').querySelector('.command-item')?.click();}});
  $('settingsClose').onclick=()=>$('settingsDialog').close();
  $('statusLanguage').onclick=openLanguage;
  $('languageCancel').onclick=()=>$('languageDialog').close();
  $('languageOkay').onclick=()=>{
    const tab=activeTab();if(!tab)return;
    tab.languageOverride=$('languageSelect').value==='auto'?null:$('languageSelect').value;
    $('statusLanguage').textContent=tab.languageOverride||lang(tab.name);
    $('languageDialog').close();renderHighlight();persist();
  };
  $('gotoCancel').onclick=()=>$('gotoDialog').close();
  $('gotoConfirm').onclick=gotoLine;
  $('gotoNumber').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();gotoLine();}});
  $('autoPairs').onchange=e=>{state.autoPairs=e.target.checked;localStorage.setItem('nq-autopairs',state.autoPairs);};
  $('fileRename').onclick=renameEntry; $('fileDelete').onclick=requestDelete; $('fileCancel').onclick=()=>$('fileActionsDialog').close();
  $('lightTheme').onchange=e=>{state.theme=e.target.checked?'light':'dark';localStorage.setItem('nq-theme',state.theme);applySettings();};
  $('wordWrap').onchange=e=>{state.wrap=e.target.checked;localStorage.setItem('nq-wrap',state.wrap);applySettings();};
  $('fontSize').oninput=e=>{state.font=+e.target.value;localStorage.setItem('nq-font',state.font);applySettings();};
  $('browserFiles').addEventListener('change',async e=>{
    for(const file of e.target.files){if(file.size>2*1024*1024){toast(file.name+' melebihi 2 MB.');continue;}
      try{openTab(file.name,await file.text(),null);}catch{toast('Gagal membaca '+file.name);}}
    e.target.value='';
  });
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){flushTabs();flushDemo();}});
  window.addEventListener('pagehide',()=>{flushTabs();flushDemo();});
  window.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey) && !e.altKey){
      const k=e.key.toLowerCase();
      if(k==='s'){e.preventDefault();saveActive();}
      if(k==='o'){e.preventDefault();openFilePicker();}
      if(k==='p'){e.preventDefault();openModal('commandDialog');}
      if(k==='f'){e.preventDefault();openModal('searchDialog');}
      if(k==='n'){e.preventDefault();newScratch();}
      if(k==='g'){e.preventDefault();openModal('gotoDialog');}
      if(k==='z'){e.preventDefault();stepHistory(e.shiftKey?'redo':'undo');}
      if(k==='y'){e.preventDefault();stepHistory('redo');}
    }
    if(e.key==='Escape')closeSidebar();
  });
}
window.NativeEvents={
  ready(root,name){state.hasAndroid=true;if(root)setWorkspace(root,badgeName(name));else setWorkspace('demo:/','DEMO WORKSPACE');},
  folderSelected(root,name){setWorkspace(root,badgeName(name));toast('Folder dibuka.');},
  directory(parent,entries){state.folders.set(parent,entries);renderTree();},
  fileOpened(uri,name,encoded){try{openTab(name,bytesText(encoded),uri);}catch(e){toast('File tidak bisa dibuka: '+e.message);}},
  saved(uri,name,newFile){
    let operation;
    if(newFile){operation=state.pendingSaveAs;state.pendingSaveAs=null;}
    else {const index=state.pendingWrites.findIndex(w=>w.uri===uri);if(index>=0)operation=state.pendingWrites.splice(index,1)[0];}
    if(!operation){toast('File disimpan, tetapi tab sudah tidak tersedia.');return;}
    const tab=state.tabs.find(t=>t.id===operation.id);
    if(tab){tab.uri=uri;tab.name=name;tab.saved=operation.snapshot;}
    renderTabs();updatePosition();persist();toast('Berhasil disimpan: '+name);
    if(!state.root.startsWith('demo:'))refreshFolder(state.root);
  },
  created(parent,uri,name,folder){refreshFolder(parent);if(folder){state.expanded.add(parent);toast('Folder dibuat: '+name);}else{toast('File dibuat: '+name);window.NQAndroid.openUri(uri);}},
  renamed(oldUri,newUri,name){applyRenamed(oldUri,newUri,name,state.entryTarget?.parent);},
  deleted(uri){applyDeleted(uri,state.entryTarget?.parent);},
  saveCancelled(){state.pendingSaveAs=null;toast('Simpan Sebagai dibatalkan.');},
  error(message){toast('Gagal: '+message);state.pendingSaveAs=null;state.pendingWrites.shift();}
};
window.App={back(){
  const dialog=document.querySelector('dialog[open]');if(dialog){dialog.close();return;}
  if($('sidebar').classList.contains('open')){closeSidebar();return;}
  if(activeTab()){closeTab(state.active);return;}
  toast('NQ Code siap digunakan.');
}};
(function init(){
  const select=$('languageSelect');
  for(const language of NQLanguage.languages){
    const option=document.createElement('option');option.value=language;option.textContent=language;
    select.append(option);
  }
  applySettings();attach();
  let stored;try{stored=JSON.parse(localStorage.getItem('nq-open-tabs'));}catch{}
  if(stored?.tabs?.length){state.tabs=stored.tabs.filter(t=>typeof t.text==='string'&&typeof t.name==='string').slice(0,12).map(t=>({...t,undoStack:[],redoStack:[],lastEdit:0}));
    state.active=state.tabs.some(t=>t.id===stored.active)?stored.active:state.tabs[0]?.id||null;}
  setWorkspace('demo:/','DEMO WORKSPACE');
  renderTabs();loadEditor();
  if(!state.tabs.length && !native())openEntry({uri:'demo:/app/Main.kt',name:'Main.kt',folder:false});
})();
