import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('out');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.wasm':'application/wasm','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
const port=Number(process.env.PORT||8765);
http.createServer(async(req,res)=>{
  try{
    let relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const prefix=process.env.NEXT_PUBLIC_BASE_PATH||'/RelaxAndChill';
    if(relative===prefix||relative.startsWith(prefix+'/'))relative=relative.slice(prefix.length)||'/';
    let file=path.resolve(root,'.'+relative);
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    if((await stat(file)).isDirectory())file=path.join(file,'index.html');
    const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(data);
  }catch{res.writeHead(404).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`RelaxAndChill: http://127.0.0.1:${port}`));
