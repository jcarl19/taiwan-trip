const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname,port=Number(process.env.PORT||5173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
http.createServer((req,res)=>{let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400);res.end();return;}
if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
if(file===root||fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
fs.readFile(file,(error,body)=>{if(error){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body);});
}).listen(port,'0.0.0.0',()=>console.log(`Taiwan Together: http://localhost:${port}`));
