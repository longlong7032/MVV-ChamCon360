// Chụp màn ở khổ mobile: node tools/shot.mjs <thư mục ra> <prefix...>  (W=390 H=844 FULL=1 để chụp cả trang)
import {spawn} from 'node:child_process';import {readdirSync,mkdtempSync,writeFileSync,mkdirSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',PORT=9444,W=+(process.env.W||390),H=+(process.env.H||844);
const out=process.argv[2],pre=process.argv.slice(3);mkdirSync(out,{recursive:true});
const files=readdirSync('.').filter(f=>/^\d.*\.html$/.test(f)&&pre.some(p=>f.startsWith(p)));
const proc=spawn(CHROME,['--headless=new','--disable-gpu',`--remote-debugging-port=${PORT}`,`--user-data-dir=${mkdtempSync(path.join(tmpdir(),'shot-'))}`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
for(let i=0;i<50;i++){try{await fetch(`http://127.0.0.1:${PORT}/json/version`);break}catch{await sleep(200)}}
for(const f of files){
  const t=await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`,{method:'PUT'})).json();
  const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend={};let onload;ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d.result);delete pend[d.id]}if(d.method==='Page.loadEventFired'&&onload)onload()};
  const send=(method,params={})=>new Promise(r=>{pend[++id]=r;ws.send(JSON.stringify({id,method,params}))});
  await send('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:2,mobile:true});await send('Page.enable');
  const loaded=new Promise(r=>onload=r);await send('Page.navigate',{url:'file://'+path.resolve(f)});await Promise.race([loaded,sleep(8000)]);await sleep(900);
  await send('Runtime.evaluate',{expression:"document.querySelectorAll('.modal.show#tutorial').forEach(e=>e.remove());document.querySelectorAll('.modal-backdrop:not(.show)').forEach(e=>e.remove())"});
  const full=process.env.FULL?{captureBeyondViewport:true}:{};
  const r=await send('Page.captureScreenshot',{format:'png',...full,...(process.env.FULL?{clip:{x:0,y:0,width:W,height:(await send('Runtime.evaluate',{expression:'document.documentElement.scrollHeight',returnByValue:true})).result.value,scale:1}}:{})});
  writeFileSync(path.join(out,f.split('_')[0]+'.png'),Buffer.from(r.data,'base64'));ws.close();await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`);
}
proc.kill();
