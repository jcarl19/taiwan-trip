const VERSION='v7';
const CORE='taiwan-core-'+VERSION;
const OFFLINE='taiwan-offline-'+VERSION;
const ROOT=new URL('./',self.location.href);
const FILES=['./','./index.html','./styles.css','./app.js','./data/itinerary.json','./data/photos.json','./manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable.png','./assets/taipei.svg','./assets/longshan.jpg','./assets/cks.jpg','./assets/red-house.jpg','./assets/rainbow.jpg','./assets/donki.jpg','./assets/eslite.jpg','./assets/airport.jpg','./assets/ximending.jpg','./assets/qingtiangang.jpg','./assets/shilin.jpg','./assets/tianhou.jpg','./assets/nishi.jpg','./assets/cixian.jpg','./assets/jiufen.jpg','./assets/yehliu.jpg','./assets/shifen.jpg','./assets/tiaoshi.jpg','./assets/taipei-zoo.jpg','./assets/maokong-gondola.jpg','./assets/maokong.jpg','./assets/xinyi-a13.jpg','./assets/taipei101.jpg','./assets/four-four.jpg','./assets/love101.jpg','./assets/xinyi.jpg','./assets/raohe.jpg','./assets/airport-mrt.jpg','./assets/sortable.min.js','./assets/sortable.LICENSE.txt'];
const urls=FILES.map(p=>new URL(p,ROOT).href);
self.addEventListener('install',e=>e.waitUntil((async()=>{const cache=await caches.open(CORE);await cache.addAll(urls.filter(u=>!u.endsWith('.jpg')));await self.skipWaiting();})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const key of await caches.keys()){if(key.startsWith('taiwan-')&&![CORE,OFFLINE].includes(key))await caches.delete(key);}await self.clients.claim();})()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==ROOT.origin)return;
  e.respondWith((async()=>{
    try{const response=await fetch(e.request);if(response.ok && urls.includes(e.request.url)){const cache=await caches.open(CORE);await cache.put(e.request,response.clone());}return response;}
    catch{const hit=await caches.match(e.request,{ignoreSearch:true});if(hit)return hit;if(e.request.mode==='navigate')return (await caches.match(new URL('./index.html',ROOT).href));return Response.error();}
  })());
});
self.addEventListener('message',e=>{
  if(e.data?.type!=='DOWNLOAD_TRIP')return;
  e.waitUntil((async()=>{try{
    // Only create the completion marker/cache after every requested asset succeeds.
    const responses=await Promise.all(urls.map(async url=>{const r=await fetch(url,{cache:'reload'});if(!r.ok)throw new Error('Some trip files could not be downloaded. Please retry online.');return [url,r];}));
    const cache=await caches.open(OFFLINE);for(const [url,r]of responses)await cache.put(url,r);
    e.ports[0].postMessage({ok:true});
  }catch(error){e.ports[0].postMessage({ok:false,error:error.message});}})());
});
