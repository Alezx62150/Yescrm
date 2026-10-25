/* Visionneuse PDF partagée (YES Immobilier) : l'hôte pilote page, zoom et défilement, le client suit */
(function(){
var PJ='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/',pj=null;
function lib(){return pj||(pj=new Promise(function(ok,ko){
  if(window.pdfjsLib){ok(window.pdfjsLib);return}
  var s=document.createElement('script');s.src=PJ+'pdf.min.js';
  s.onload=function(){try{window.pdfjsLib.GlobalWorkerOptions.workerSrc=PJ+'pdf.worker.min.js';ok(window.pdfjsLib)}catch(e){ko(e)}};
  s.onerror=function(){pj=null;ko(new Error('pdf.js indisponible'))};document.head.appendChild(s)}))}
window.YSDoc=function(root,o){
  o=o||{};var ctl=!!o.ctl,doc=null,p=1,z=1,tk=0,rt=null,quiet=false,et=0,name='';
  root.innerHTML='';root.style.display='flex';root.style.flexDirection='column';root.style.minHeight='0';root.style.background='#e9e2dd';
  var bar=document.createElement('div');bar.style.cssText='display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:6px 8px;background:#fff;border-bottom:1px solid #e5d8d1;font:13px system-ui,sans-serif;color:#2b2220';
  var sc=document.createElement('div');sc.style.cssText='flex:1;overflow:auto;min-height:0;padding:8px';
  var cv=document.createElement('canvas');cv.style.cssText='display:block;margin:0 auto;box-shadow:0 1px 6px rgba(0,0,0,.25);background:#fff';sc.appendChild(cv);
  var ttl=document.createElement('b');ttl.style.cssText='flex:1;min-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';bar.appendChild(ttl);
  var lab=document.createElement('span'),pin=null,wide=false;
  function btn(t,ti,fn){var b=document.createElement('button');b.type='button';b.textContent=t;b.title=ti;b.style.cssText='padding:4px 9px;border:1px solid #e5d8d1;border-radius:8px;background:#fff;cursor:pointer;font:inherit';b.addEventListener('click',fn);bar.appendChild(b);return b}
  if(ctl){
    btn('📄 Autres documents','Choisir un autre document',function(){if(o.onList)o.onList()});
    btn('◀','Page précédente',function(){go(p-1)});
    pin=document.createElement('input');pin.type='number';pin.min=1;pin.title='Aller à la page';pin.style.cssText='width:54px;padding:4px;border:1px solid #e5d8d1;border-radius:8px;font:inherit';
    pin.addEventListener('change',function(){go(parseInt(pin.value,10)||p);pin.value=p});pin.addEventListener('keydown',function(e){if(e.key==='Enter')pin.blur()});
    bar.appendChild(pin);bar.appendChild(lab);btn('▶','Page suivante',function(){go(p+1)});
    btn('−','Zoom arrière',function(){zoom(z/1.25)});btn('+','Zoom avant',function(){zoom(z*1.25)});
    btn('⛶','Agrandir ou réduire le panneau du document',function(){wide=!wide;if(o.onWide)o.onWide(wide)});
    btn('✕ Arrêter','Arrêter de montrer ce document',function(){if(o.onStop)o.onStop()})
  }else bar.appendChild(lab);
  root.appendChild(bar);root.appendChild(sc);
  function ratio(a,b){return b>0?a/b:0}
  function view(){return{p:p,z:z,sx:ratio(sc.scrollLeft,sc.scrollWidth-sc.clientWidth),sy:ratio(sc.scrollTop,sc.scrollHeight-sc.clientHeight)}}
  function setScroll(v){sc.scrollLeft=(v.sx||0)*(sc.scrollWidth-sc.clientWidth);sc.scrollTop=(v.sy||0)*(sc.scrollHeight-sc.clientHeight)}
  function emit(){if(!ctl||quiet||!o.onView)return;clearTimeout(et);et=setTimeout(function(){o.onView(view())},120)}
  sc.addEventListener('scroll',emit);
  async function render(){
    var my=++tk;if(!doc)return;var pg=await doc.getPage(p);if(my!==tk)return;
    var w=Math.max(200,sc.clientWidth-16),v0=pg.getViewport({scale:1}),s1=w/v0.width*z,dpr=Math.min(window.devicePixelRatio||1,2),vp=pg.getViewport({scale:s1*dpr});
    if(rt){try{rt.cancel()}catch(e){}}
    cv.width=Math.floor(vp.width);cv.height=Math.floor(vp.height);cv.style.width=(vp.width/dpr)+'px';cv.style.height=(vp.height/dpr)+'px';
    rt=pg.render({canvasContext:cv.getContext('2d'),viewport:vp});try{await rt.promise}catch(e){}
    lab.textContent=pin?'/ '+doc.numPages:p+' / '+doc.numPages;if(pin)pin.value=p}
  async function go(n){if(!doc)return;n=Math.max(1,Math.min(doc.numPages,n));if(n===p)return;p=n;quiet=true;await render();sc.scrollTop=0;sc.scrollLeft=0;quiet=false;if(ctl&&o.onView)o.onView(view())}
  async function zoom(nz){if(!doc)return;nz=Math.max(.5,Math.min(5,nz));if(nz===z)return;var v=view();z=nz;quiet=true;await render();setScroll(v);quiet=false;if(ctl&&o.onView)o.onView(view())}
  var self={
    load:async function(url,nm,v){
      name=nm||'';ttl.textContent=name;lab.textContent='…';
      try{var L=await lib();doc=await L.getDocument({url:url}).promise}catch(e){doc=null;ttl.textContent='Document illisible';throw e}
      p=(v&&v.p)||1;z=(v&&v.z)||1;quiet=true;await render();if(v)setScroll(v);quiet=false},
    apply:async function(v){if(!doc||!v)return;quiet=true;if(v.p!==p||v.z!==z){p=v.p||1;z=v.z||1;await render()}setScroll(v);quiet=false},
    view:view,
    stop:function(){tk++;doc=null;try{if(rt)rt.cancel()}catch(e){}cv.width=cv.height=1;root.innerHTML=''}
  };
  window.addEventListener('resize',function(){if(doc)render()});
  return self};
})();
