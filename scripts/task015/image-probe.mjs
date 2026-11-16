import { createServer } from "node:http";

const args = process.argv.slice(2);
const images = [];
let port = 4173;
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--image" && args[index + 1]) images.push(args[++index]);
  else if (args[index] === "--port" && args[index + 1]) port = Number(args[++index]);
  else {
    console.error(
      "usage: node scripts/task015/image-probe.mjs --image <loopback-url> [--image <url> ...] [--port 4173]",
    );
    process.exit(2);
  }
}

if (images.length === 0 || !Number.isInteger(port) || port < 1024 || port > 65535) {
  console.error("image_probe_requires_loopback_images_and_valid_port");
  process.exit(2);
}

for (const value of images) {
  let url;
  try {
    url = new URL(value);
  } catch {
    console.error("invalid_image_url");
    process.exit(2);
  }
  if (
    url.protocol !== "http:" ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    console.error("image_probe_only_accepts_local_http_urls_without_credentials_or_query");
    process.exit(2);
  }
}

const safeImages = JSON.stringify(images).replaceAll("<", "\\u003c");
const html = `<!doctype html>
<html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>TASK-015 image probe</title>
<style>body{font:16px system-ui;max-width:64rem;margin:2rem auto;padding:0 1rem}button,input{font:inherit;padding:.5rem}table{border-collapse:collapse}td,th{border:1px solid #888;padding:.4rem}pre{white-space:pre-wrap;overflow-wrap:anywhere}img{max-width:14rem;max-height:14rem}</style>
<h1>Probe local de imagens — TASK-015</h1>
<p>Este probe não aprova o critério automaticamente. Configure o dispositivo/rede no DevTools e escolha cache frio ou aquecido.</p>
<label>Dispositivo/navegador/rede: <input id="environment" size="70" autocomplete="off"></label>
<p><button id="cold">Medir cache frio</button> <button id="warm">Medir cache aquecido</button> <button id="copy" disabled>Copiar JSON</button></p>
<p id="status" role="status">Pronto; ${images.length} URL(s) local(is) carregada(s).</p><div id="results"></div><pre id="json"></pre>
<script>
const urls=${safeImages}; const statusEl=document.querySelector('#status'); const output=document.querySelector('#json'); const results=document.querySelector('#results');
const rank=(values,p)=>{const sorted=[...values].sort((a,b)=>a-b);return sorted.length?sorted[Math.max(0,Math.ceil(p*sorted.length)-1)]:null};
async function load(url){performance.clearResourceTimings();const image=new Image();const start=performance.now();const loaded=new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('image_load_failed'))});image.src=url;await loaded;await image.decode();const ready=performance.now();const entry=performance.getEntriesByName(url,'resource').at(-1);if(!entry)throw new Error('resource_timing_missing');return {ms:+(ready-entry.startTime).toFixed(2),width:image.naturalWidth,height:image.naturalHeight,bytes:entry.transferSize||null,format:(entry.name.split('?')[0].split('.').pop()||'unknown').toLowerCase(),requestStart:+entry.startTime.toFixed(2),probeStart:+start.toFixed(2)}}
async function run(mode){document.querySelector('#cold').disabled=true;document.querySelector('#warm').disabled=true;output.textContent='';results.replaceChildren();const perImage=30;const records=[];try{if(mode==='warm'){statusEl.textContent='Aquecendo cache…';for(const url of urls)await load(url)}for(let index=0;index<urls.length;index++){const samples=[];let errorCount=0;statusEl.textContent='Medindo '+(mode==='cold'?'cache frio':'cache aquecido')+': imagem '+(index+1)+'/'+urls.length;for(let n=0;n<perImage;n++){try{samples.push(await load(urls[index]))}catch{errorCount++}}const times=samples.map(x=>x.ms);records.push({imageIndex:index+1,samples:times.length,failures:errorCount,width:samples[0]?.width??null,height:samples[0]?.height??null,format:samples[0]?.format??null,bytes:samples[0]?.bytes??null,p50_ms:rank(times,.50),p95_ms:rank(times,.95),p99_ms:rank(times,.99),measurements:samples})}const report={task:'TASK-015 image probe',mode,sampleCountPerImage:perImage,environment:document.querySelector('#environment').value||'not entered',capturedAt:new Date().toISOString(),images:records};output.textContent=JSON.stringify(report,null,2);const table=document.createElement('table');table.innerHTML='<thead><tr><th>Imagem</th><th>N</th><th>Falhas</th><th>Formato/dimensões</th><th>p50 ms</th><th>p95 ms</th><th>p99 ms</th></tr></thead>';const body=table.createTBody();for(const row of records){const tr=body.insertRow();for(const cell of [row.imageIndex,row.samples,row.failures,(row.format||'—')+' '+(row.width||'—')+'×'+(row.height||'—'),row.p50_ms??'—',row.p95_ms??'—',row.p99_ms??'—'])tr.insertCell().textContent=String(cell)}results.append(table);statusEl.textContent='Medição concluída. Verifique as falhas e preserve o JSON como evidência.';document.querySelector('#copy').disabled=false}catch(error){statusEl.textContent='Medição interrompida: '+error.message}finally{document.querySelector('#cold').disabled=false;document.querySelector('#warm').disabled=false}}
document.querySelector('#cold').onclick=()=>run('cold');document.querySelector('#warm').onclick=()=>run('warm');document.querySelector('#copy').onclick=()=>navigator.clipboard.writeText(output.textContent);
</script></html>`;

const server = createServer((request, response) => {
  if (
    request.method !== "GET" ||
    new URL(request.url ?? "/", "http://127.0.0.1").pathname !== "/"
  ) {
    response.writeHead(404).end();
    return;
  }
  response
    .writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy":
        "default-src 'none'; img-src http://127.0.0.1:* http://localhost:* http://[::1]:*; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'",
      "X-Content-Type-Options": "nosniff",
    })
    .end(html);
});

server.listen(port, "127.0.0.1", () => {
  console.log(
    `TASK-015 image probe listening on 127.0.0.1:${port}; ${images.length} local image URL(s) configured.`,
  );
  console.log("Press Ctrl+C to stop. No files or external network connections are created.");
});
