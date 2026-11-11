/* YES CRM – rendu 3D réaliste (three.js, gratuit, sans service externe) */
(function(){
const T=window.THREE;if(!T){window.YR3D=null;return}
const rnd=(function(){let s=7;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}})();
function tex(kind,base,rep){const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');
 const col=h=>{const v=parseInt(String(h).replace('#',''),16);return[(v>>16)&255,(v>>8)&255,v&255]},b=col(base||'#dddddd');
 const sh=(k)=>'rgb('+b.map(x=>Math.max(0,Math.min(255,Math.round(x*k)))).join(',')+')';
 g.fillStyle=sh(1);g.fillRect(0,0,S,S);
 if(/parquet|vinyle/i.test(kind)){const pw=/vinyle/i.test(kind)?42:64,pl=S/2;for(let r=0;r*pw<S;r++){const off=(r%2?pl/2:0)+rnd()*pl*.3;for(let x=-pl;x<S+pl;x+=pl){const k=.9+rnd()*.2;g.fillStyle=sh(k);g.fillRect(x+off,r*pw,pl,pw);for(let i=0;i<9;i++){g.strokeStyle='rgba(90,60,30,'+(.04+rnd()*.07)+')';g.beginPath();const y=r*pw+rnd()*pw;g.moveTo(x+off,y);g.lineTo(x+off+pl,y+(rnd()-.5)*3);g.stroke()}g.strokeStyle='rgba(60,40,20,.35)';g.lineWidth=1.2;g.strokeRect(x+off,r*pw,pl,pw)}}}
 else if(/carrelage/i.test(kind)){const n=2,t=S/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){g.fillStyle=sh(.96+rnd()*.07);g.fillRect(i*t,j*t,t,t);const gr=g.createLinearGradient(i*t,j*t,(i+1)*t,(j+1)*t);gr.addColorStop(0,'rgba(255,255,255,.14)');gr.addColorStop(1,'rgba(0,0,0,.06)');g.fillStyle=gr;g.fillRect(i*t,j*t,t,t)}g.strokeStyle='rgba(70,70,70,.55)';g.lineWidth=3;for(let i=0;i<=n;i++){g.beginPath();g.moveTo(i*t,0);g.lineTo(i*t,S);g.stroke();g.beginPath();g.moveTo(0,i*t);g.lineTo(S,i*t);g.stroke()}}
 else if(/béton/i.test(kind)){for(let i=0;i<260;i++){g.fillStyle='rgba('+(rnd()>.5?'255,255,255':'0,0,0')+','+(.02+rnd()*.05)+')';g.beginPath();g.arc(rnd()*S,rnd()*S,10+rnd()*60,0,7);g.fill()}}
 else if(/moquette/i.test(kind)){const d=g.getImageData(0,0,S,S),a=d.data;for(let i=0;i<a.length;i+=4){const k=(rnd()-.5)*26;a[i]+=k;a[i+1]+=k;a[i+2]+=k}g.putImageData(d,0,0)}
 else{for(let i=0;i<80;i++){g.fillStyle='rgba(0,0,0,.02)';g.beginPath();g.arc(rnd()*S,rnd()*S,20+rnd()*50,0,7);g.fill()}}
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep[0],rep[1]);t.colorSpace=T.SRGBColorSpace||undefined;if(T.sRGBEncoding&&!T.SRGBColorSpace)t.encoding=T.sRGBEncoding;return t}
function sky(top,bot){const c=document.createElement('canvas');c.width=4;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,top);gr.addColorStop(1,bot);g.fillStyle=gr;g.fillRect(0,0,4,256);const t=new T.CanvasTexture(c);if(T.SRGBColorSpace)t.colorSpace=T.SRGBColorSpace;return t}
const M=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.8,metalness:0},o||{}));
function rb(w,h,d,r,mat){r=Math.min(r,w/2-.001,h/2-.001,d/2-.001);if(r<=.003){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);return m}
 const sh=new T.Shape(),x=-(w/2-r),y=-(h/2-r),W=w-2*r,H=h-2*r;sh.moveTo(x,y);sh.lineTo(x+W,y);sh.lineTo(x+W,y+H);sh.lineTo(x,y+H);sh.closePath();
 const g=new T.ExtrudeGeometry(sh,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,curveSegments:4});g.translate(0,0,-(d-2*r)/2);return new T.Mesh(g,mat)}
const bx=(w,h,d,mat,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x||0,y||0,z||0);return m};
const cy=(r,h,mat,x,y,z,seg)=>{const m=new T.Mesh(new T.CylinderGeometry(r,r,h,seg||24),mat);m.position.set(x||0,y||0,z||0);return m};
const WOOD='#b8895a',DARK='#3a3532',WHITE='#f4f3ef',STEEL='#b9c0c6';
/* modèles : repère local, x = largeur, z = profondeur (z<0 = dos), y = hauteur */
function model(it){const w=it.w,d=it.h,k=it.k,hz=it.z||0.8,c=it.c||'#cccccc',g=new T.Group(),col=M(c),wood=M(WOOD,{roughness:.55}),dark=M(DARK,{roughness:.5}),white=M(WHITE,{roughness:.45}),steel=M(STEEL,{roughness:.28,metalness:.45});
 const add=m=>{g.add(m);return m};
 if(k==='sofa'||k==='corner'){const sH=.42,ar=Math.min(.16,w*.1),bk=Math.min(.22,d*.28);add(rb(w,.12,d,.02,dark)).position.y=.1;
  const seatW=w-2*ar,n=Math.max(1,Math.round(seatW/.7));for(let i=0;i<n;i++){const s=add(rb(seatW/n-.01,.18,d-bk,.06,col));s.position.set(-seatW/2+(i+.5)*seatW/n,sH-.14,bk/2)}
  for(let i=0;i<n;i++){const s=add(rb(seatW/n-.01,.42,.16,.07,col));s.position.set(-seatW/2+(i+.5)*seatW/n,sH+.12,-d/2+.12);s.rotation.x=-.12}
  [-1,1].forEach(sg=>{const a=add(rb(ar,.34,d,.06,col));a.position.set(sg*(w/2-ar/2),sH-.02,0)});
  if(k==='corner'){const ch=add(rb(w*.36,.18,d*.6,.06,col));ch.position.set(-w/2+w*.18+ar,sH-.14,d/2-d*.3)}}
 else if(k==='bed'){const bw=w,bl=d,baby=hz>.8;add(rb(bw,.3,bl,.02,wood)).position.y=.2;const mat=add(rb(bw-.08,.22,bl-.12,.06,white));mat.position.set(0,.45,.02);
  const duv=add(rb(bw-.04,.1,bl*.62,.05,col));duv.position.set(0,.58,bl*.18);const np=bw>1.2?2:1;for(let i=0;i<np;i++){const p=add(rb(bw/np*.8,.12,.34,.05,white));p.position.set(-bw/2+bw*(i+.5)/np,.62,-bl/2+.32)}
  const hb=add(rb(bw+.04,baby?.9:.95,.06,.02,wood));hb.position.set(0,baby?.55:.55,-bl/2-.01)}
 else if(k==='chair'){const sw=w*.9;add(rb(sw,.05,sw,.015,wood)).position.y=.45;add(rb(sw,.46,.04,.015,wood)).position.set(0,.7,-sw/2+.02);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(p=>add(bx(.035,.45,.035,wood,p[0]*(sw/2-.03),.225,p[1]*(sw/2-.03))))}
 else if(k==='table'){add(rb(w,.04,d,.012,wood)).position.y=hz-.02;[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(p=>add(bx(.06,hz-.04,.06,wood,p[0]*(w/2-.07),(hz-.04)/2,p[1]*(d/2-.07))))}
 else if(k==='round'){if(hz>1){add(cy(w/2,hz,steel,0,hz/2,0,32));add(cy(w/2*.98,.04,white,0,hz,0,32))}else{add(cy(w/2,.04,wood,0,hz-.02,0,36));add(cy(.05,hz-.04,wood,0,(hz-.04)/2,0));add(cy(w*.3,.03,wood,0,.015,0,24))}}
 else if(k==='tv'){add(rb(w,.45,d,.015,wood)).position.y=.225;const sc=add(bx(Math.min(1.3,w*.8),.7,.05,dark,0,.45+.05+.35,0));add(bx(.4,.05,.18,dark,0,.475,0))}
 else if(k==='shelf'){if(hz>1.5){add(bx(w,hz,d,wood,0,hz/2,0));const n=Math.round(hz/.35);for(let i=0;i<n;i++){const y=.15+i*(hz-.2)/n;add(bx(w-.04,.02,d-.02,M('#d8c9b0'),0,y,.01));for(let j=0;j<5;j++){const bw=.03+rnd()*.03,bh=.18+rnd()*.1,m=M(['#7b8fa6','#a65a4c','#6c8f6b','#c9a85a','#d9d4c8'][Math.floor(rnd()*5)]);add(bx(bw,bh,d*.6,m,-w/2+.1+j*(w-.2)/5,y+.01+bh/2,.04))}}}
  else{add(rb(w,hz,d,.01,wood)).position.y=hz/2;const n=Math.max(2,Math.round(w/.5));for(let i=1;i<n;i++)add(bx(.006,hz-.06,.01,dark,-w/2+w*i/n,hz/2,d/2+.002));for(let i=0;i<n;i++)add(bx(.12,.02,.02,steel,-w/2+w*(i+.5)/n,hz*.75,d/2+.01))}}
 else if(k==='wardrobe'){add(rb(w,hz,d,.01,wood)).position.y=hz/2;const n=Math.max(2,Math.round(w/.6));for(let i=0;i<n;i++){add(bx(w/n-.01,hz-.06,.012,M('#cdb99c',{roughness:.5}),-w/2+w*(i+.5)/n,hz/2,d/2+.004));add(bx(.015,.3,.02,steel,-w/2+w*(i+(i%2?.12:.88))/n,hz*.5,d/2+.02))}}
 else if(k==='rug'){add(bx(w,.02,d,M(c,{roughness:1}),0,.01,0));add(bx(w*.9,.022,d*.86,M('#c8b49b',{roughness:1}),0,.011,0))}
 else if(k==='stove'){add(rb(w,hz,d,.02,M('#2d2b2a',{roughness:.5}))).position.y=hz/2;add(bx(w*.6,hz*.35,.01,M('#ff9a4a',{emissive:'#ff7a20',emissiveIntensity:.6}),0,hz*.4,d/2+.005));add(cy(.07,.6,dark,0,hz+.3,0))}
 else if(k==='plant'){add(cy(w*.3,.35,M('#9a6a4a'),0,.175,0));[0,1,2,3,4].forEach(i=>{const s=new T.Mesh(new T.SphereGeometry(w*.38,14,10),M('#5c9a4a',{roughness:.9}));s.position.set((rnd()-.5)*.18,.55+i*.1,(rnd()-.5)*.18);g.add(s)})}
 else if(k==='kitchen'||k==='sink'||k==='sink2'||k==='hob'||k==='dish'){const bh=.85,n=Math.max(1,Math.round(w/.6));add(bx(w,bh,d,M('#e8e4dc'),0,bh/2,0));
  for(let i=0;i<n;i++){add(bx(w/n-.012,bh-.14,.014,M(k==='kitchen'?'#9bb09a':'#d9d9d6',{roughness:.45}),-w/2+w*(i+.5)/n,bh/2+.02,d/2+.005));add(bx(.1,.014,.02,steel,-w/2+w*(i+.5)/n,bh-.12,d/2+.02))}
  add(bx(w+.01,.04,d+.02,M('#5a5149',{roughness:.35}),0,bh+.02,.005));
  if(k==='sink'||k==='sink2'){const nn=k==='sink'?1:2;for(let i=0;i<nn;i++)add(bx(w*.68/nn,.012,d*.62,steel,-w/2+w*(i+.5)/nn,bh+.045,.02));add(cy(.015,.25,steel,0,bh+.17,-d*.28));add(bx(.015,.015,.14,steel,0,bh+.29,-d*.2))}
  if(k==='hob'){add(bx(w*.9,.01,d*.9,dark,0,bh+.045,0));[[-.22,-.22],[.22,-.22],[-.22,.22],[.22,.22]].forEach(p=>{const r=new T.Mesh(new T.TorusGeometry(Math.min(w,d)*.12,.005,6,24),M('#888'));r.rotation.x=Math.PI/2;r.position.set(p[0]*w,bh+.055,p[1]*d);g.add(r)})}
  if(k==='kitchen'&&w>2){const up=M('#f0eee9');for(let i=0;i<Math.floor(w/.6);i++){add(bx(.6-.012,.7,.34,up,-w/2+.3+i*.6,1.6,-d/2+.17));add(bx(.6-.02,.64,.012,M('#9bb09a',{roughness:.45}),-w/2+.3+i*.6,1.6,-d/2+.345))}}}
 else if(k==='fridge'){add(rb(w,hz,d,.02,M('#e3e6e8',{roughness:.3,metalness:.25}))).position.y=hz/2;add(bx(w*.95,.01,.01,dark,0,hz*.62,d/2+.003));add(bx(.015,.5,.03,steel,w*.38,hz*.82,d/2+.02));add(bx(.015,.3,.03,steel,w*.38,hz*.4,d/2+.02))}
 else if(k==='washer'){add(rb(w,hz,d,.015,white)).position.y=hz/2;const r=new T.Mesh(new T.TorusGeometry(Math.min(w,d)*.3,.025,10,28),steel);r.position.set(0,hz*.5,d/2+.005);g.add(r);const gl=new T.Mesh(new T.CircleGeometry(Math.min(w,d)*.28,28),M('#2a3a46',{roughness:.1}));gl.position.set(0,hz*.5,d/2+.008);g.add(gl);add(bx(w*.9,.06,.01,M('#cfd4d8'),0,hz*.9,d/2+.004))}
 else if(k==='basin'||k==='basin2'){const n=k==='basin'?1:2,bh=hz-.12;add(bx(w,bh,d,M('#e8e4dc'),0,bh/2,0));add(bx(w+.01,.04,d+.01,M('#d5d3cc',{roughness:.3}),0,bh+.02,0));for(let i=0;i<n;i++){const x=-w/2+w*(i+.5)/n;const s=new T.Mesh(new T.CylinderGeometry(w*.3/n,w*.22/n,.12,28),M('#ffffff',{roughness:.15}));s.scale.z=.8;s.position.set(x,bh+.07,.02);g.add(s);add(cy(.012,.18,steel,x,bh+.13,-d*.3));add(bx(.012,.012,.1,steel,x,bh+.21,-d*.25))}}
 else if(k==='shower'){const gl=M('#bfe0ee',{transparent:true,opacity:.28,roughness:.05});add(bx(w,.05,d,M('#f4f4f2',{roughness:.3}),0,.025,0));add(cy(.04,.02,steel,0,.055,0));add(bx(w,1.95,.012,gl,0,1.0,d/2));add(bx(.012,1.95,d,gl,w/2,1.0,0));add(bx(w,.02,.02,steel,0,1.97,d/2));add(bx(.02,.02,d,steel,w/2,1.97,0));add(cy(.012,.5,steel,-w/2+.1,1.8,-d/2+.03));add(cy(.09,.02,steel,-w/2+.1,2.05,-d/2+.12))}
 else if(k==='bath'){add(rb(w,.55,d,.06,white)).position.y=.275;const inn=add(rb(w-.16,.3,d-.16,.1,M('#dfe9ee',{roughness:.2})));inn.position.set(0,.44,0);add(cy(.012,.2,steel,w/2-.12,.65,0))}
 else if(k==='wc'){add(rb(w*.9,.75,.2,.03,white)).position.set(0,.4,-d/2+.1);const bowl=new T.Mesh(new T.CylinderGeometry(w*.42,w*.3,.4,28),white);bowl.scale.z=1.5;bowl.position.set(0,.2,d*.1);g.add(bowl);add(cy(.03,.02,steel,0,.78,-d/2+.1))}
 else if(k==='rad'){const th=Math.max(.03,d);add(bx(w,hz,.04,M('#f2f2f0',{roughness:.35}),0,hz/2+.12,0));const n=Math.max(3,Math.round(w/.1));for(let i=1;i<n;i++)add(bx(.004,hz,.045,M('#d4d4d2'),-w/2+w*i/n,hz/2+.12,0))}
 else if(k==='box'){add(rb(w,hz,d,.02,white)).position.y=hz/2;add(bx(w*.5,.12,.01,M('#4b8bbe'),0,hz*.75,d/2+.005))}
 else if(k==='stairs'){const n=Math.max(5,Math.round(d/.25)),top=2.6;for(let i=0;i<n;i++){const sh=(i+1)*top/n,z=d/2-(i+.5)*d/n;add(bx(w,.04,d/n+.02,wood,0,sh-.02,z));add(bx(w,sh-.04,d/n-.01,M('#cdbfa8'),0,(sh-.04)/2,z))}[-1,1].forEach(sg=>add(bx(.04,.9,d,M('#e8e4dc'),sg*(w/2-.02),top*.5+.45,0)).rotation.x=Math.atan(top/d)*-1)}
 else{add(rb(w,hz,d,.02,col)).position.y=hz/2}
 g.traverse(m=>{if(m.isMesh){m.castShadow=m.material&&!m.material.transparent;m.receiveShadow=true}});return g}
/* scène */
function build(P,st){const sc=new T.Scene(),root=new T.Group();sc.add(root);const Tk=0.1,H=2.5;const walls=[],labels=[],ceils=[],lights=[];
 const wallMat={};const wm=c=>wallMat[c]||(wallMat[c]=M(c,{roughness:.92}));const outer=wm('#efeae2'),cap=wm('#f6f3ee');
 P.rooms.forEach(r=>{const rep=[r.w/1.2,r.h/1.2],fl=new T.Mesh(new T.PlaneGeometry(r.w,r.h),new T.MeshStandardMaterial({map:tex(r.sol||'',((typeof PL_SOL!=='undefined'&&PL_SOL[r.sol])||'#dddddd'),rep),roughness:/carrelage|vinyle/i.test(r.sol||'')?.35:.6}));fl.rotation.x=-Math.PI/2;fl.position.set(r.x+r.w/2,0,r.y+r.h/2);fl.receiveShadow=true;root.add(fl);
  const ce=new T.Mesh(new T.PlaneGeometry(r.w,r.h),M('#f8f6f2',{side:T.DoubleSide}));ce.rotation.x=Math.PI/2;ce.position.set(r.x+r.w/2,H,r.y+r.h/2);ce.visible=false;root.add(ce);ceils.push(ce);
  const gr=r.g?P.rooms.filter(z=>z.g===r.g):null;if(!gr||gr[0]===r)labels.push({x:r.x+r.w/2,z:r.y+r.h/2,t:(r.n||'Pièce')+' · '+((gr?gr.reduce((s,z)=>s+z.w*z.h,0):r.w*r.h)).toFixed(1).replace('.',',')+' m²'});
  const inner=wm(r.mur||'#ffffff');
  [['n',[0,-1]],['s',[0,1]],['w',[-1,0]],['e',[1,0]]].forEach(([s,out])=>{const hz=(s==='n'||s==='s'),L=hz?r.w:r.h,pad=hz?0:Tk,a0=pad,a1=L-pad,grp=new T.Group();grp.userData={out,room:r.id};root.add(grp);walls.push(grp);
   const pt=(at,d)=>s==='n'?[r.x+at,r.y+d]:s==='s'?[r.x+at,r.y+r.h-d]:s==='w'?[r.x+d,r.y+at]:[r.x+r.w-d,r.y+at];
   const seg=(a,b,z0,z1,mat,d0,d1)=>{if(b-a<.005||z1-z0<.005)return;d0=d0==null?0:d0;d1=d1==null?Tk:d1;const p=pt(a,d0),q=pt(b,d1),cx=(p[0]+q[0])/2,cz=(p[1]+q[1])/2,sx=Math.abs(q[0]-p[0]),sz=Math.abs(q[1]-p[1]);
    const im=inner,mats=[outer,outer,cap,cap,outer,outer];/* +x,-x,+y,-y,+z,-z */
    if(!mat){if(s==='n')mats[4]=im;else if(s==='s')mats[5]=im;else if(s==='w')mats[0]=im;else mats[1]=im}
    const m=new T.Mesh(new T.BoxGeometry(sx,z1-z0,sz),mat?mat:mats);m.position.set(cx,(z0+z1)/2,cz);m.castShadow=!mat;m.receiveShadow=true;grp.add(m);return m};
   const ops=P.ops.filter(o=>o.r===r.id&&o.s===s).map(o=>{const p=Math.min(Math.max(o.p,o.w/2),Math.max(o.w/2,L-o.w/2));return{g0:Math.max(a0,p-o.w/2),g1:Math.min(a1,p+o.w/2),t:o.t}}).concat(r.g?P.rooms.filter(z=>z!==r&&z.g===r.g).map(z=>{const ad=(typeof plAdj==='function'?plAdj(r,z,s):null);return ad?{g0:Math.max(a0,ad[0]),g1:Math.min(a1,ad[1]),t:'cut'}:null}).filter(Boolean):[]).sort((x,y)=>x.g0-y.g0);
   let cur=a0;const glass=M('#cfe7f3',{transparent:true,opacity:.25,roughness:.05,metalness:.1}),frame=M('#f5f5f3',{roughness:.4}),door=M('#f3f1ec',{roughness:.45});
   ops.forEach(o=>{if(o.g0>cur)seg(cur,o.g0,0,H);if(o.t==='cut'){cur=Math.max(cur,o.g1);return}const zt=o.t==='porte'?2.05:o.t==='baie'?2.2:2.1;if(o.t==='fen')seg(o.g0,o.g1,0,.9);seg(o.g0,o.g1,zt,H);
    const zb=o.t==='porte'?0:o.t==='fen'?.9:0,m=(o.g0+o.g1)/2,len=o.g1-o.g0;
    if(o.t==='porte'){seg(o.g0,o.g1,0,zt,door,Tk/2-.02,Tk/2+.02);const hd=bx(.02,.02,.1,M(STEEL,{metalness:.5,roughness:.3}),0,0,0);const p=pt(o.g1-.1,Tk/2);hd.position.set(p[0],1.0,p[1]);grp.add(hd)}
    else{seg(o.g0,o.g1,zb,zt,glass,Tk/2-.005,Tk/2+.005);const f=.035;seg(o.g0,o.g0+f,zb,zt,frame,Tk/2-.03,Tk/2+.03);seg(o.g1-f,o.g1,zb,zt,frame,Tk/2-.03,Tk/2+.03);seg(o.g0,o.g1,zt-f,zt,frame,Tk/2-.03,Tk/2+.03);seg(o.g0,o.g1,zb,zb+f,frame,Tk/2-.03,Tk/2+.03);if(len>1){seg(m-f/2,m+f/2,zb,zt,frame,Tk/2-.03,Tk/2+.03)}
     if(o.t==='fen'){const p=pt(m,Tk/2),sill=bx(hz?len+.1:.12,.03,hz?.12:len+.1,wm('#f6f3ee'),p[0],.9,p[1]);grp.add(sill)}}
    cur=Math.max(cur,o.g1)});if(a1>cur)seg(cur,a1,0,H)})});
 (P.walls||[]).forEach(w=>{if(w.t==='demo')return;const L=Math.hypot(w.x2-w.x1,w.y2-w.y1);if(L<.05)return;const m=new T.Mesh(new T.BoxGeometry(L,H,.1),wm('#f2eee8'));m.position.set((w.x1+w.x2)/2,H/2,(w.y1+w.y2)/2);m.rotation.y=-Math.atan2(w.y2-w.y1,w.x2-w.x1);m.castShadow=m.receiveShadow=true;root.add(m)});
 P.items.forEach(it=>{const g=model(it);g.position.set(it.x,0,it.y);g.rotation.y=-(it.rot||0)*Math.PI/180;root.add(g)});
 return{scene:sc,root,walls,labels,ceils}}
function bounds(P){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;P.rooms.forEach(r=>{x0=Math.min(x0,r.x);z0=Math.min(z0,r.y);x1=Math.max(x1,r.x+r.w);z1=Math.max(z1,r.y+r.h)});P.items.forEach(i=>{x0=Math.min(x0,i.x-1);z0=Math.min(z0,i.y-1);x1=Math.max(x1,i.x+1);z1=Math.max(z1,i.y+1)});if(x0>x1){x0=z0=0;x1=z1=5}return{x0,z0,x1,z1}}
window.YR3D={open(b,P,env){const old=document.getElementById('r3ov');if(old)old.remove();
 const o=document.createElement('div');o.id='r3ov';o.style.cssText='position:fixed;inset:0;z-index:9996;background:#dfe6ea;display:flex;flex-direction:column';
 const rooms=P.rooms.map((r,i)=>`<option value='${i}'>${(r.n||'Pièce '+(i+1)).replace(/</g,'&lt;')}</option>`).join('');
 o.innerHTML=`<div style='display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px;background:#fff;border-bottom:1px solid #e3dcd4'><b>✨ Rendu réaliste · ${(P.name||'Plan').replace(/</g,'&lt;')}</b><span style='flex:1'></span><button type='button' id='r3o'>🧭 Vue d’ensemble</button><button type='button' id='r3t'>⬆ Dessus</button><select id='r3v'><option value=''>🚶 Visite : choisir une pièce</option>${rooms}</select><button type='button' id='r3d'>☀ Jour</button><label style='font-size:12px'>Soleil <input type='range' id='r3s' min='0' max='360' value='215' style='width:80px;vertical-align:middle'></label><button type='button' id='r3i'>⬇ Image HD</button><button type='button' id='r3p'>📷 Aux photos</button><button type='button' class='p' id='r3x'>✕ Fermer</button></div><div id='r3w' style='flex:1;position:relative;min-height:0;overflow:hidden'><div id='r3l' style='position:absolute;inset:0;pointer-events:none'></div><div id='r3m' style='position:absolute;left:10px;bottom:10px;font:12px Arial;background:rgba(255,255,255,.85);padding:5px 9px;border-radius:8px'>Glissez pour tourner · pincez ou molette pour zoomer · deux doigts pour déplacer</div></div>`;
 document.body.appendChild(o);const q=s=>o.querySelector(s),wrap=q('#r3w');
 let rd;try{rd=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true})}catch(e){o.remove();if(typeof toast==='function')toast('Votre navigateur ne gère pas le rendu 3D réaliste.');return}
 rd.setPixelRatio(Math.min(2,window.devicePixelRatio||1));rd.shadowMap.enabled=true;rd.shadowMap.type=T.PCFSoftShadowMap;if(T.ACESFilmicToneMapping){rd.toneMapping=T.ACESFilmicToneMapping;rd.toneMappingExposure=1.0}if(T.SRGBColorSpace)rd.outputColorSpace=T.SRGBColorSpace;else if(T.sRGBEncoding)rd.outputEncoding=T.sRGBEncoding;
 const cv=rd.domElement;cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;touch-action:none';wrap.insertBefore(cv,wrap.firstChild);
 const S=build(P,{}),sc=S.scene,B=bounds(P),cx=(B.x0+B.x1)/2,cz=(B.z0+B.z1)/2,span=Math.max(B.x1-B.x0,B.z1-B.z0);
 const ground=new T.Mesh(new T.PlaneGeometry(span*8,span*8),M('#cfd8dc',{roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.set(cx,-.02,cz);ground.receiveShadow=true;sc.add(ground);
 const hemi=new T.HemisphereLight('#ffffff','#a89f94',.8),sun=new T.DirectionalLight('#fff1d8',1.2),amb=new T.AmbientLight('#ffffff',.12);sc.add(hemi,amb,sun,sun.target);
 sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const e=span*.8+3;Object.assign(sun.shadow.camera,{left:-e,right:e,top:e,bottom:-e,near:1,far:span*5+30});sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;sun.target.position.set(cx,0,cz);
 const night={on:false},pls=[];P.rooms.slice(0,10).forEach(r=>{const l=new T.PointLight('#ffd9a0',0,Math.max(r.w,r.h)*2.2,1.6);l.position.set(r.x+r.w/2,2.2,r.y+r.h/2);l.visible=false;sc.add(l);pls.push(l)});
 const bgDay=sky('#a9cbe8','#eef3f6'),bgNight=sky('#1b2433','#3a3f52');sc.background=bgDay;
 const setSun=()=>{const az=(+q('#r3s').value)*Math.PI/180,el=night.on?.35:.95,r=span*2+10;sun.position.set(cx+Math.cos(az)*Math.cos(el)*r,Math.sin(el)*r,cz+Math.sin(az)*Math.cos(el)*r)};
 const setNight=()=>{const n=night.on;sc.background=n?bgNight:bgDay;hemi.intensity=n?.28:.8;amb.intensity=n?.08:.12;sun.intensity=n?.18:1.2;sun.color.set(n?'#9db4ff':'#fff4e0');pls.forEach(l=>{l.visible=n;l.intensity=n?.9:0});q('#r3d').textContent=n?'🌙 Soirée':'☀ Jour';setSun()};
 const cam=new T.PerspectiveCamera(45,1,.05,500);let st={mode:'orbit',yaw:.6,pit:.75,dist:span*1.5+4,tx:cx,tz:cz,ey:0,ex:0,ez:0,eyaw:0,epit:0};
 const place=()=>{if(st.mode==='orbit'){const cp=Math.cos(st.pit);cam.position.set(st.tx+st.dist*Math.sin(st.yaw)*cp,.3+st.dist*Math.sin(st.pit),st.tz+st.dist*Math.cos(st.yaw)*cp);cam.lookAt(st.tx,.3,st.tz)}else{cam.position.set(st.ex,1.6,st.ez);cam.lookAt(st.ex+Math.sin(st.eyaw)*Math.cos(st.epit),1.6+Math.sin(st.epit),st.ez+Math.cos(st.eyaw)*Math.cos(st.epit))}};
 const lab=q('#r3l');lab.innerHTML=S.labels.map(l=>`<div style="position:absolute;transform:translate(-50%,-50%);font:bold 12px Arial;color:#2b2723;text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 3px #fff;white-space:nowrap">${l.t.replace(/</g,'&lt;')}</div>`).join('');
 const frame=()=>{const w=wrap.clientWidth,h=wrap.clientHeight;if(cv.width!==Math.round(w*rd.getPixelRatio())||cv.height!==Math.round(h*rd.getPixelRatio())){rd.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}place();
  const vis=st.mode==='eye';S.ceils.forEach(c=>c.visible=vis);const cd=[Math.sin(st.yaw),Math.cos(st.yaw)];S.walls.forEach(g=>{const low=!vis&&(g.userData.out[0]*cd[0]+g.userData.out[1]*cd[1])>.25;g.scale.y=low?.14:1});
  rd.render(sc,cam);[...lab.children].forEach((d,i)=>{if(vis){d.style.display='none';return}const v=new T.Vector3(S.labels[i].x,.05,S.labels[i].z).project(cam);d.style.display=v.z<1?'':'none';d.style.left=((v.x+1)/2*wrap.clientWidth)+'px';d.style.top=((1-v.y)/2*wrap.clientHeight)+'px'})};
 let raf=0;const dirty=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(!document.getElementById('r3ov'))return;frame()})};
 const pts=new Map();let pin=null;
 cv.addEventListener('pointerdown',ev=>{cv.setPointerCapture(ev.pointerId);pts.set(ev.pointerId,{x:ev.clientX,y:ev.clientY,b:ev.button});pin=null});
 cv.addEventListener('pointermove',ev=>{const p=pts.get(ev.pointerId);if(!p)return;const dx=ev.clientX-p.x,dy=ev.clientY-p.y;p.x=ev.clientX;p.y=ev.clientY;
  if(pts.size===2){const [a,c]=[...pts.values()],dd=Math.hypot(a.x-c.x,a.y-c.y),mx=(a.x+c.x)/2,my=(a.y+c.y)/2;if(pin){const k=pin.d/dd;if(st.mode==='orbit')st.dist=Math.max(1.5,Math.min(span*6,st.dist*k));else{st.ex+=Math.sin(st.eyaw)*(dd-pin.d)*.01;st.ez+=Math.cos(st.eyaw)*(dd-pin.d)*.01}
    if(st.mode==='orbit'){const f=st.dist*.0016;st.tx-=(Math.cos(st.yaw)*(mx-pin.mx)-Math.sin(st.yaw)*Math.sin(st.pit)*(my-pin.my))*f;st.tz+=(Math.sin(st.yaw)*(mx-pin.mx)+Math.cos(st.yaw)*Math.sin(st.pit)*(my-pin.my))*f}}pin={d:dd,mx,my};dirty();return}
  if(pts.size===1){if(st.mode==='orbit'){st.yaw-=dx*.008;st.pit=Math.max(.08,Math.min(1.5,st.pit+dy*.008))}else{st.eyaw+=dx*.006;st.epit=Math.max(-1,Math.min(1,st.epit-dy*.004))}dirty()}});
 const up=ev=>{pts.delete(ev.pointerId);pin=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',ev=>{ev.preventDefault();if(st.mode==='orbit')st.dist=Math.max(1.5,Math.min(span*6,st.dist*(ev.deltaY>0?1.1:.9)));else{const k=ev.deltaY>0?-.3:.3;st.ex+=Math.sin(st.eyaw)*k;st.ez+=Math.cos(st.eyaw)*k}dirty()},{passive:false});
 const key=ev=>{if(!document.getElementById('r3ov'))return;if(st.mode==='eye'){const k={ArrowUp:[1,0],ArrowDown:[-1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[ev.key];if(k){st.ex+=Math.sin(st.eyaw)*k[0]*.25;st.ez+=Math.cos(st.eyaw)*k[0]*.25;st.eyaw-=k[1]*.08;dirty();ev.preventDefault()}}};document.addEventListener('keydown',key);
 q('#r3o').onclick=()=>{st=Object.assign(st,{mode:'orbit',yaw:.6,pit:.75,dist:span*1.5+4,tx:cx,tz:cz});q('#r3v').value='';dirty()};
 q('#r3t').onclick=()=>{st=Object.assign(st,{mode:'orbit',yaw:0,pit:1.5,dist:span*1.4+3,tx:cx,tz:cz});q('#r3v').value='';dirty()};
 q('#r3v').onchange=ev=>{const r=P.rooms[+ev.target.value];if(!r){return}const long=r.w>=r.h;st.mode='eye';st.ex=long?r.x+r.w*.15:r.x+r.w/2;st.ez=long?r.y+r.h/2:r.y+r.h*.15;st.eyaw=long?Math.PI/2:0;st.epit=-.03;dirty()};
 q('#r3d').onclick=()=>{night.on=!night.on;setNight();dirty()};q('#r3s').oninput=()=>{setSun();dirty()};
 const shot=cb=>{const w=wrap.clientWidth,h=wrap.clientHeight,pr=rd.getPixelRatio();rd.setPixelRatio(Math.max(2,pr));rd.setSize(w,h,false);frame();cv.toBlob(bl=>{rd.setPixelRatio(pr);rd.setSize(w,h,false);dirty();cb(bl)},'image/jpeg',.93)};
 q('#r3i').onclick=()=>shot(bl=>{if(bl&&typeof xdl==='function')xdl('rendu-'+((P.name||'plan').replace(/[^\w-]+/g,'_'))+'.jpg',bl)});
 q('#r3p').onclick=()=>{if(b.id==='free'){typeof toast==='function'&&toast('Disponible quand le plan est ouvert depuis un bien.');return}shot(async bl=>{if(!bl)return;try{const id=uid();await fput('bp_'+id,bl);b.ph=b.ph||[];b.ph.push(id);save();toast('Rendu ajouté aux photos du bien.')}catch(er){toast('Ajout impossible.')}})};
 q('#r3x').onclick=()=>{document.removeEventListener('keydown',key);cancelAnimationFrame(raf);rd.dispose();o.remove()};
 window.addEventListener('resize',dirty);setNight();setSun();dirty();setTimeout(dirty,200);window.__r3={st,S,rd,sc,cam,dirty,night:()=>{night.on=!night.on;setNight();dirty()}}}};
})();
