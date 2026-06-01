/* LancheiraMágica — Service Worker (modo offline) */
var CACHE = 'lancheira-v2';
var ASSETS = ['./', './index.html', './404.html'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){return cache.addAll(ASSETS);})
    .then(function(){return self.skipWaiting();})
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    }).then(function(){return self.clients.claim();})
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached)return cached;
      return fetch(e.request).then(function(resp){
        if(!resp||resp.status!==200)return resp;
        var clone=resp.clone();
        caches.open(CACHE).then(function(cache){cache.put(e.request,clone);});
        return resp;
      }).catch(function(){
        // offline fallback
        return caches.match('./index.html');
      });
    })
  );
});
