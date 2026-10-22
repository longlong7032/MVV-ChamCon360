// Kiểm tra giao diện ở khổ mobile: chữ tràn, nút/vùng chạm < 44px, trang tràn ngang.
// Chạy: node tools/audit.mjs [prefix]   (cần Google Chrome; không cần cài thêm gói)
import {spawn} from 'node:child_process';import {readdirSync,mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',PORT=9333,W=+(process.env.W||390),H=844;
const only=process.argv[2]||'';
const files=readdirSync('.').filter(f=>/^\d.*\.html$/.test(f)&&f.startsWith(only)).sort();
const proc=spawn(CHROME,['--headless=new','--disable-gpu',`--remote-debugging-port=${PORT}`,`--user-data-dir=${mkdtempSync(path.join(tmpdir(),'aud-'))}`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ver;for(let i=0;i<50;i++){try{ver=await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();break}catch{await sleep(200)}}
const AUDIT=`(()=>{
const vw=innerWidth,out={over:[],tap:[],page:document.documentElement.scrollWidth>vw+1};
const vis=e=>{const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return null;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return null;
 for(let p=e;p&&p!==document.body;p=p.parentElement){const c=getComputedStyle(p);if(c.display==='none')return null;if(p.classList.contains('offcanvas')&&!p.classList.contains('show'))return null;if(p.classList.contains('modal')&&p.id==='tutorial')return null;if(p.classList.contains('tab-pane')&&!p.classList.contains('active'))return null;if(p.tagName==='DETAILS'&&!p.open&&e.tagName!=='SUMMARY'&&!e.closest('summary'))return null}
 return r};
const name=e=>(e.getAttribute('aria-label')||e.innerText||e.value||e.id||e.className||'').toString().replace(/\\s+/g,' ').trim().slice(0,40);
document.querySelectorAll('body *').forEach(e=>{
 if(['SCRIPT','STYLE','SVG','PATH','OPTION'].includes(e.tagName.toUpperCase()))return;
 const r=vis(e);if(!r)return;
 const cs=getComputedStyle(e);
 const tol=e.matches('.btn-sm')?6:1;if(e.matches('.visually-hidden,.visually-hidden *,.stretched-link'))return;
 if(e.scrollWidth>e.clientWidth+tol&&e.clientWidth>0&&cs.display!=='inline'&&(cs.overflowX!=='visible'||e.matches('.btn,label,.badge,button,a'))&&!e.closest('.overflow-auto,.overflow-x-auto,.carousel')&&!e.matches('select,input,textarea')) out.over.push(e.tagName.toLowerCase()+': '+name(e));
 if(e.matches('select,input:not(.btn-check)')&&e.scrollWidth>e.clientWidth+1&&e.tagName!=='INPUT')out.over.push('select cắt chữ: '+name(e));
 if(r.right>vw+1&&!e.closest('.overflow-auto,.overflow-x-auto,.carousel,.modal,.offcanvas'))out.over.push('ngoài khung '+Math.round(r.right-vw)+'px: '+e.tagName.toLowerCase()+' '+name(e));
 const tapEl=e.matches('a[href],button,select,textarea,summary,input:not([type=hidden]):not(.btn-check),label[for]');
 if(tapEl){let t=e;if(e.matches('label[for]')){const i=document.getElementById(e.getAttribute('for'));if(!(i&&i.classList.contains('btn-check')))return}
  // phần tử inline trong đoạn văn không tính
  if(cs.display==='inline'&&e.closest('p,li,small,span,div:not(.btn-group)')&&e.tagName==='A'&&!e.className.match(/btn|nav-link|list-group|card|stretched/))return;
  const pseudo=e.matches('.btn-sm')?8:0;
  if(e.matches('.form-check-input,.stretched-link'))return;
  const w=r.width+pseudo,h=r.height+pseudo;
  if(w<44||h<44)out.tap.push(Math.round(w)+'x'+Math.round(r.height)+' '+e.tagName.toLowerCase()+' '+name(e))}
});
out.over=[...new Set(out.over)];out.tap=[...new Set(out.tap)];return JSON.stringify(out)})()`;
const results={};
for(const f of files){
  const t=await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`,{method:'PUT'})).json();
  const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d.result);delete pend[d.id]}};
  const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
  await send('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:1,mobile:true});
  await send('Page.enable');
  const loaded=new Promise(r=>{const o=ws.onmessage;ws.onmessage=m=>{o(m);if(JSON.parse(m.data).method==='Page.loadEventFired')r()}});
  await send('Page.navigate',{url:'file://'+path.resolve(f)});
  await Promise.race([loaded,sleep(8000)]);await sleep(900);
  const r=await send('Runtime.evaluate',{expression:AUDIT,returnByValue:true});
  results[f]=JSON.parse(r.result.value);
  ws.close();await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`);
}
proc.kill();
let nOver=0,nTap=0;
for(const [f,r] of Object.entries(results)){
  if(!r.over.length&&!r.tap.length&&!r.page)continue;
  console.log('\n== '+f.split('_')[0]+' '+(r.page?'[TRÀN NGANG] ':''));
  r.over.forEach(x=>console.log('  tràn  : '+x));r.tap.forEach(x=>console.log('  nhỏ   : '+x));nOver+=r.over.length;nTap+=r.tap.length;
}
console.log(`\nTổng: ${nOver} chỗ tràn chữ, ${nTap} vùng chạm nhỏ, ${files.length} màn`);
