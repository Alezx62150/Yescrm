// YES CRM – service worker : notifications de rappel d'agenda
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{});
self.addEventListener('push',e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(x){d={title:'YES Agenda',body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'YES Agenda',{
    body:d.body||'',icon:'/icon-192.png',badge:'/icon-192.png',tag:d.tag||undefined,
    data:{url:'/agenda.html'}
  }));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url='/agenda.html';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
    for(const c of l){if('focus' in c)return c.focus()}
    return self.clients.openWindow(url);
  }));
});
