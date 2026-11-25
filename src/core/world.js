/* Apex GP 3D · world.js — TX/mkTX textures, Track geometry, materials, mkCar, Parts */
const TX={};
let ANISO=8;
function mkt(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=ANISO;return t}
function mkt2(w,h,k,fn){return mkt(w*k,h*k,x=>{x.scale(k,k);fn(x,w,h)})}
function mkTX(){if(TX.a)return;
 TX.a=mkt(1024,1024,(x,w,h)=>{x.fillStyle='#2f343c';x.fillRect(0,0,w,h);for(let i=0;i<120000;i++){const v=34+Math.random()*54|0;x.fillStyle=`rgb(${v},${v+2},${v+5})`;x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2)}
  for(let i=0;i<320;i++){x.fillStyle=`rgba(${Math.random()<.6?'0,0,0':'190,202,218'},${.035+Math.random()*.048})`;x.beginPath();x.arc(Math.random()*w,Math.random()*h,8+Math.random()*28,0,TAU);x.fill()}
  x.strokeStyle='rgba(10,11,14,.38)';x.lineWidth=1.4;for(let i=0;i<16;i++){x.beginPath();let px=Math.random()*w,py=Math.random()*h;x.moveTo(px,py);for(let k=0;k<9;k++){px+=Math.random()*90-45;py+=Math.random()*90-45;x.lineTo(px,py)}x.stroke()}});
 TX.r=mkt(512,512,(x,w,h)=>{x.fillStyle='#c4c4c4';x.fillRect(0,0,w,h);for(let i=0;i<180;i++){const v=110+Math.random()*115|0;x.fillStyle=`rgba(${v},${v},${v},.24)`;x.beginPath();x.arc(Math.random()*w,Math.random()*h,16+Math.random()*58,0,TAU);x.fill()}for(let i=0;i<14000;i++){const v=140+Math.random()*95|0;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(Math.random()*w,Math.random()*h,2,2)}});
 // Diagonal twill carbon fiber weave for F1 floor, wings & diffuser
 TX.cf=mkt(64,64,(x,w,h)=>{x.fillStyle='#14161b';x.fillRect(0,0,w,h);for(let y=0;y<h;y+=4)for(let X=0;X<w;X+=4){x.fillStyle=((X+y)&4)?'#232730':'#0f1115';x.fillRect(X,y,3,3)}});TX.cf.repeat.set(6,6);
 // Natural mowed turf grass texture (replaces flat plastic green)
 TX.g=mkt(512,512,(x,w,h)=>{x.fillStyle='#d4ddd0';x.fillRect(0,0,w,h);for(let s=0;s<8;s++){x.fillStyle=s%2?'rgba(0,0,0,.055)':'rgba(255,255,255,.04)';x.fillRect(0,s*64,w,64)}for(let i=0;i<42000;i++){const v=170+Math.random()*75|0;x.fillStyle=`rgb(${v-12},${v},${v-16})`;x.fillRect(Math.random()*w,Math.random()*h,1.5,3)}for(let i=0;i<140;i++){x.fillStyle=`rgba(${Math.random()<.5?'30,50,20':'210,225,180'},.06)`;x.beginPath();x.arc(Math.random()*w,Math.random()*h,10+Math.random()*32,0,TAU);x.fill()}});
 // Grainy pebble gravel trap texture
 TX.gr=mkt(256,256,(x,w,h)=>{x.fillStyle='#d6caa8';x.fillRect(0,0,w,h);for(let i=0;i<16000;i++){const v=145+Math.random()*95|0;x.fillStyle=`rgb(${v},${v-8},${v-22})`;x.fillRect(Math.random()*w,Math.random()*h,2,2)}});
 // Modern motorsport reflective glass & aluminum louver building facade
 TX.b=mkt(256,256,(x,w,h)=>{x.fillStyle='#dce2ea';x.fillRect(0,0,w,h);for(let r=0;r<4;r++){const y=10+r*62;const g=x.createLinearGradient(0,y,0,y+40);g.addColorStop(0,'#1a3552');g.addColorStop(.5,'#2e587e');g.addColorStop(1,'#0d1e30');x.fillStyle=g;x.fillRect(8,y,w-16,40);x.fillStyle='rgba(255,255,255,.16)';x.fillRect(10,y+4,w-20,6);x.fillStyle='#6c7684';for(let c=0;c<6;c++)x.fillRect(8+c*40,y,3,40)}});
 // Detailed daylight European/urban apartment & tower facade with balconies and recessed windows
 TX.city=mkt(256,256,(x,w,h)=>{x.fillStyle='#e8e2d6';x.fillRect(0,0,w,h);for(let r=0;r<8;r++){const y=4+r*32;x.fillStyle='rgba(0,0,0,.08)';x.fillRect(0,y+26,w,4);for(let c=0;c<6;c++){const X=8+c*41;const g=x.createLinearGradient(0,y,0,y+20);g.addColorStop(0,'#27425d');g.addColorStop(1,'#142538');x.fillStyle=g;x.fillRect(X,y+2,26,20);x.fillStyle='rgba(255,255,255,.22)';x.fillRect(X+2,y+4,22,4);x.fillStyle='#c4bcb0';x.fillRect(X-3,y+21,32,4)}}});
 // Organic mountain slope rock & tropical forest texture
 TX.mt=mkt(256,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#d4dcd8');g.addColorStop(.28,'#9ea9a2');g.addColorStop(.62,'#6f8772');g.addColorStop(1,'#4d6852');x.fillStyle=g;x.fillRect(0,0,w,h);for(let i=0;i<4200;i++){const v=100+Math.random()*100|0;x.fillStyle=`rgba(${v},${v+10},${v},.20)`;x.fillRect(Math.random()*w,Math.random()*h,3,6)}});
 TX.n=mkt(512,512,(x,w,h)=>{x.fillStyle='#d8d8d8';x.fillRect(0,0,w,h);for(let i=0;i<30000;i++){const v=165+Math.random()*90|0;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(Math.random()*w,Math.random()*h,1.5+Math.random()*1.5,1.5+Math.random()*1.5)}});
 TX.w=mkt2(256,64,4,(x,w,h)=>{x.fillStyle='#d6d8dc';x.fillRect(0,0,w,h);x.fillStyle='rgba(0,0,0,.18)';for(let i=1;i<4;i++)x.fillRect(i*64-1,0,2,h);x.fillRect(0,h-6,w,6);for(let i=0;i<500;i++){x.fillStyle=`rgba(0,0,0,${Math.random()*.08})`;x.fillRect(Math.random()*w,Math.random()*h,3,3)}});
 TX.sp=mkt2(SP.length*300,64,2,(x,w,h)=>{x.textAlign='center';x.textBaseline='middle';SP.forEach((b,i)=>{const pw=300;x.fillStyle=b[1];x.fillRect(i*pw,0,pw,h);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(i*pw,0,pw,h*.1);let fs=34;do{x.font='bold '+fs+'px Arial';fs--}while(fs>12&&x.measureText(b[0]).width>pw-36);x.fillStyle=b[2];x.fillText(b[0],i*pw+pw/2,h/2+1);x.fillStyle='rgba(255,255,255,.4)';x.fillRect(i*pw,0,3,h)});x.fillStyle='rgba(0,0,0,.3)';x.fillRect(0,h-5,w,5)});
 TX.s=mkt2(1024,64,2,(x,w,h)=>{const B=[['#d01010','APEX ENERGY'],['#0a2a6a','NOVA BANK'],['#f2f2f2','VELOCITY OIL','#111'],['#0e7a4a','TURBO CLOUD'],['#ffcc00','AETHER TYRES','#111'],['#222','HYPERDRIVE'],['#7a1fa2','QUANTUM']],bw=w/B.length;B.forEach((b,i)=>{x.fillStyle=b[0];x.fillRect(i*bw,0,bw,h);x.fillStyle='rgba(255,255,255,.14)';x.fillRect(i*bw,0,bw,h*.12);let fs=26;x.textAlign='center';x.textBaseline='middle';do{x.font='bold '+fs+'px Arial';fs--}while(fs>12&&x.measureText(b[1]).width>bw-22);x.fillStyle=b[2]||'#fff';x.fillText(b[1],i*bw+bw/2,h/2+1);x.fillStyle='rgba(255,255,255,.35)';x.fillRect(i*bw,0,3,h)});x.fillStyle='rgba(0,0,0,.3)';x.fillRect(0,h-5,w,5)})}

class Track{
 constructor(d){
  const P=d.pts,n=P.length,dense=[];
  for(let i=0;i<n;i++){const q=[(i+n-1)%n,i,(i+1)%n,(i+2)%n];
   for(let k=0;k<24;k++){const t=k/24,t2=t*t,t3=t2*t,cr=(a,b,c,e)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-e)*t2+(-a+3*b-3*c+e)*t3);
    dense.push([cr(P[q[0]][0],P[q[1]][0],P[q[2]][0],P[q[3]][0]),cr(P[q[0]][1],P[q[1]][1],P[q[2]][1],P[q[3]][1])])}}
  const M=dense.length,cum=[0];for(let i=0;i<M;i++){const a=dense[i],b=dense[(i+1)%M];cum.push(cum[i]+Math.hypot(b[0]-a[0],b[1]-a[1]))}
  const sc=(d.len*1000/.2)/cum[M],N=this.N=Math.round(cum[M]*sc/18);this.x=[];this.y=[];let j=0;
  for(let i=0;i<N;i++){const s=i*cum[M]/N;while(cum[j+1]<s)j++;const f=(s-cum[j])/(cum[j+1]-cum[j]||1),a=dense[j],b=dense[(j+1)%M];this.x.push((a[0]+(b[0]-a[0])*f)*sc);this.y.push((a[1]+(b[1]-a[1])*f)*sc)}
  // Multi-pass arc-length smoothing removes polygonal kinks & wobbly S-bends while preserving apexes
  for(let p=0;p<5;p++){const nx=new Array(N),ny=new Array(N);for(let i=0;i<N;i++){const a=(i+N-1)%N,b=(i+1)%N;nx[i]=this.x[a]*.25+this.x[i]*.5+this.x[b]*.25;ny[i]=this.y[a]*.25+this.y[i]*.5+this.y[b]*.25}this.x=nx;this.y=ny}
  this.bw=d.bw;this.gv=d.gv;this.hw=d.hw||54;this.S=this.hw-40;this.pe=d.pe||50;this.px=d.px||90;this.tx=[];this.ty=[];this.h=[];this.s=[];this.ds=[];this.ks=[];this.vl=[];let s=0;
  for(let i=0;i<N;i++){const a=(i+N-1)%N,b=(i+1)%N,dx=this.x[b]-this.x[a],dy=this.y[b]-this.y[a],l=Math.hypot(dx,dy);this.tx[i]=dx/l;this.ty[i]=dy/l;this.h[i]=Math.atan2(dy,dx);this.s[i]=s;const e=Math.hypot(this.x[b]-this.x[i],this.y[b]-this.y[i]);this.ds[i]=e;s+=e}
  this.L=s;
  // Smooth curvature first so gentle sweepers/straights never trigger false braking spikes
  const rawK=new Array(N);
  for(let i=0;i<N;i++){const a=(i+N-1)%N,b=(i+1)%N;rawK[i]=angd(this.h[b],this.h[a])/(this.ds[a]+this.ds[i])}
  for(let i=0;i<N;i++){let t=0;for(let q=-2;q<=2;q++)t+=rawK[(i+q+N)%N];this.ks[i]=t/5}
  // F1 aero downforce cornering speeds: mild sweepers are flat-out (480), only real corners require braking
  const cg=(d.cg||175)*1.48;
  for(let i=0;i<N;i++){const ak=Math.abs(this.ks[i]);this.vl[i]=ak<.00105?480:Math.min(480,Math.sqrt(cg/ak))}
  for(let p=0;p<3;p++)for(let i=N-1;i>=0;i--){const q=(i+1)%N;this.vl[i]=Math.min(this.vl[i],Math.sqrt(this.vl[q]**2+2*210*this.ds[i]))}
  let pv=60;const rv=[];for(let q=0;q<2;q++)for(let i=0;i<N;i++){pv=Math.min(this.vl[i]*.93,Math.sqrt(pv*pv+2*85*(1-pv/520)*this.ds[i]));rv[i]=pv}this.R=0;for(let i=0;i<N;i++)this.R+=this.ds[i]*2/(rv[i]+rv[(i+1)%N]);this.pw=d.pw||this.hw+11;
  this.dec=[];for(let i=0;i<N;i++){const q=(i+1)%N;this.dec[i]=Math.max(0,(this.vl[i]*this.vl[i]-this.vl[q]*this.vl[q])/(2*this.ds[i]))}
  // Smooth F1 racing line (outside entry -> clip inside apex -> unwind outside exit; natural S-bend flow)
  {const raw=new Float64Array(N),wt=new Float64Array(N);
   for(let i=0;i<N;i++){
    const k=this.ks[i],ak=Math.abs(k);
    if(ak>.0011){
     const s=Math.sign(k),str=clamp((ak-.0011)/.0028,0,1);
     for(let q=-5;q<=5;q++){const j=(i+q+N)%N,w=str*(1-Math.abs(q)/6)*2.4;raw[j]+=s*this.hw*.74*w;wt[j]+=w}
     for(let q=9;q<=28;q++){const j=(i-q+N)%N,w=str*Math.sin((q-9)/19*Math.PI)*.95;raw[j]+=-s*this.hw*.68*w;wt[j]+=w}
     for(let q=9;q<=28;q++){const j=(i+q+N)%N,w=str*Math.sin((q-9)/19*Math.PI)*.95;raw[j]+=-s*this.hw*.68*w;wt[j]+=w}
    }
   }
   let a=new Array(N);for(let i=0;i<N;i++)a[i]=wt[i]>.01?clamp(raw[i]/wt[i],-this.hw*.72,this.hw*.72):0;
   for(let p=0;p<6;p++){const b=new Array(N);for(let i=0;i<N;i++){let t=0;for(let q=-6;q<=6;q++)t+=a[(i+q+N)%N];b[i]=t/13}a=b}
   this.lo=a}
  const low=this.ks.map(k=>Math.abs(k)<.0008),s0=Math.max(0,low.findIndex(v=>!v)),runs=[];let run=null;
  for(let q=0;q<N;q++){const i=(s0+q)%N;if(low[i]){if(!run)run=[i,0];run[1]++}else if(run){runs.push(run);run=null}}if(run)runs.push(run);
  this.dz=runs.filter(r=>r[1]>=45).sort((a,b)=>b[1]-a[1]).slice(0,d.dzn||2).map(r=>[r[0]+8,r[0]+r[1]-8]);if(!this.dz.length)this.dz=[[3,90]];
  const E=d.el||[[0,0],[1,0]],el=t=>{for(let q=0;q<E.length-1;q++)if(t<=E[q+1][0]){const u=(t-E[q][0])/(E[q+1][0]-E[q][0]||1);return(E[q][1]+(E[q+1][1]-E[q][1])*(1-Math.cos(u*Math.PI))/2)*5}return E[E.length-1][1]*5};
  this.ey=this.s.map(v=>el(v/this.L));this.gy=Math.min(...this.ey)-4;
  this.tun=null;if(d.tun){let b=1e18,bi=0;for(let i=0;i<N;i++){const dx=this.x[i]-d.tun[0]*sc,dy=this.y[i]-d.tun[1]*sc,q=dx*dx+dy*dy;if(q<b){b=q;bi=i}}this.tun=[bi,d.tun[2]||90]}
  // Per-segment, per-side safe dynamic barrier & gravel/sand offsets (zero curve bow-tie fold, zero adjacent-lane intrusion)
  this.bwL=new Float32Array(N);this.bwR=new Float32Array(N);this.gvL=new Float32Array(N);this.gvR=new Float32Array(N);
  const hw=this.hw,minBw=hw+12,pitMinR=Math.min(d.bw,114+this.S),st=d.gv>1e8;
  for(const s of[-1,1]){
   const cap=new Float32Array(N);
   for(let i=0;i<N;i++){
    let c=d.bw;
    const kIn=Math.max(0,s*rawK[i],s*this.ks[i]);
    if(kIn>1e-5)c=Math.min(c,Math.max(minBw,.80/kIn));
    if(this.tun&&((i-this.tun[0]+N)%N)<this.tun[1])c=Math.min(c,62);
    const nx=-this.ty[i]*s,ny=this.tx[i]*s;
    for(let j=0;j<N;j++){
     const dj=Math.min(Math.abs(j-i),N-Math.abs(j-i));
     if(dj<14)continue;
     const dx=this.x[j]-this.x[i],dy=this.y[j]-this.y[i],pn=dx*nx+dy*ny;
     if(pn<=0||pn>c+hw+24)continue;
     const pt=Math.abs(dx*this.tx[i]+dy*this.ty[i]);
     if(pt<hw+18){
      const clr=pn-Math.sqrt(Math.max(0,(hw+18)*(hw+18)-pt*pt));
      const mid=pn*.5-5;
      c=Math.min(c,Math.max(minBw,Math.min(clr,mid)));
     }
    }
    if(s>0&&this.pitOff(i)!=null)c=Math.max(c,pitMinR);
    cap[i]=c;
   }
   // Envelope-safe smoothing: smooth transitions into/out of tight corners while NEVER exceeding hard safety cap
   let arr=new Float32Array(cap);
   for(let p=0;p<8;p++){const nxt=new Float32Array(N);for(let i=0;i<N;i++){const a=(i+N-1)%N,b=(i+1)%N;nxt[i]=Math.min(cap[i],arr[a]*.25+arr[i]*.5+arr[b]*.25)}arr=nxt}
   // Final segment-level backfold & road-clearance guarantee
   for(let p=0;p<6;p++){
    for(let i=0;i<N;i++){
     const j=(i+1)%N,ax=this.x[i]-this.ty[i]*(s*arr[i]),ay=this.y[i]+this.tx[i]*(s*arr[i]),bx=this.x[j]-this.ty[j]*(s*arr[j]),by=this.y[j]+this.tx[j]*(s*arr[j]);
     if((bx-ax)*this.tx[i]+(by-ay)*this.ty[i]<=1.5){arr[i]=Math.max(minBw,arr[i]*.92);arr[j]=Math.max(minBw,arr[j]*.92)}
    }
   }
   const dstBw=s<0?this.bwL:this.bwR,dstGv=s<0?this.gvL:this.gvR;
   for(let i=0;i<N;i++){
    dstBw[i]=arr[i];
    if(st)dstGv[i]=1e9;
    else dstGv[i]=arr[i]>=hw+32?Math.max(hw+24,Math.min(d.gv,arr[i]-14)):arr[i];
   }
  }
 }
 strip(o1,d1,o2,d2,col,i0,cnt,ab,uvf){const N=this.N,P=[],C=[],U=[],I=[],O=(o,q)=>typeof o==='function'?o(q):o;i0=i0||0;cnt=cnt||N;
  for(let k=0;k<cnt;k++){const i=(i0+k)%N,j=(i+1)%N,c=new THREE.Color(typeof col==='function'?col(i):col);
   for(const v of[[i,O(o1,i),d1,0],[i,O(o2,i),d2,ab],[j,O(o2,j),d2,ab],[j,O(o1,j),d1,0]]){P.push(this.x[v[0]]-this.ty[v[0]]*v[1],(v[3]?0:this.ey[v[0]])+v[2],this.y[v[0]]+this.tx[v[0]]*v[1]);C.push(c.r,c.g,c.b);
    const uv=uvf?uvf(v[0],v[1],v[2]):[v[1]/40,this.s[v[0]]/40];U.push(uv[0],uv[1])}
   I.push(k*4,k*4+1,k*4+2,k*4,k*4+2,k*4+3)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();return g}
 at(i,o){const N=this.N;i=(i%N+N)%N;return{x:this.x[i]-this.ty[i]*o,y:this.ey[i],z:this.y[i]+this.tx[i]*o}}
 near(x,y,h){const N=this.N,full=h<0,R=full?N:61;let b=1e18,bi=0;for(let k=0;k<R;k++){const i=full?k:((h-30+k)%N+N)%N,dx=x-this.x[i],dy=y-this.y[i],q=dx*dx+dy*dy;if(q<b){b=q;bi=i}}return bi}
 side(x,y,i){return -(x-this.x[i])*this.ty[i]+(y-this.y[i])*this.tx[i]}
 bwAt(i,s){const q=(i%this.N+this.N)%this.N,b=s<0?this.bwL[q]:s>0?this.bwR[q]:Math.min(this.bwL[q],this.bwR[q]);return this.tun&&((q-this.tun[0]+this.N)%this.N)<this.tun[1]?Math.min(62,b):b}
 gvAt(i,s){const q=(i%this.N+this.N)%this.N;return s<0?this.gvL[q]:this.gvR[q]}
 inDrs(i){return this.dz.some(z=>(i-z[0]+this.N)%this.N<=z[1]-z[0])}
 lineHeat(i){const N=this.N;let m=0;for(let q=0;q<4;q++)m=Math.max(m,this.dec[(i+q)%N]);return Math.max(clamp(m/150,0,1),clamp((380-this.vl[i])/200,0,.55))}
 pitOff(i){const N=this.N,pe=this.pe,px=this.px,u=i>=N-pe?i-N:i;if(u<-pe||u>px)return null;const r=20,S=this.S;return u<-pe+r?36+S+43*(u+pe)/r:u>px-r?79+S-43*(u-px+r)/r:79+S}
}

const MC={},mat=c=>MC[c]||(MC[c]=new THREE.MeshLambertMaterial({color:c}));
const SM={},sm=(c,r,m,cc)=>{const k=c+'_'+r+'_'+m+'_'+(cc||0);return SM[k]||(SM[k]=cc?new THREE.MeshPhysicalMaterial({color:c,roughness:r,metalness:m,clearcoat:cc,clearcoatRoughness:.06,side:THREE.DoubleSide}):new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,side:THREE.DoubleSide}))};
function loft(S,R,zc){const P=[],I=[];S.forEach(s=>{for(let k=0;k<R;k++){const a=k/R*TAU,ca=Math.cos(a),sa=Math.sin(a),e=s.p||2.4,cx=Math.sign(ca)*Math.pow(Math.abs(ca),2/e),cy=Math.sign(sa)*Math.pow(Math.abs(sa),2/e);P.push(s.x,(s.yb+s.yt)/2+cy*(s.yt-s.yb)/2,(zc||0)+cx*s.w)}});
 for(let i=0;i<S.length-1;i++)for(let k=0;k<R;k++){const a=i*R+k,b=i*R+(k+1)%R,c=(i+1)*R+k,d=(i+1)*R+(k+1)%R;I.push(a,b,c,b,d,c)}
 for(const e of[0,S.length-1]){const s=S[e],ci=P.length/3;P.push(s.x,(s.yb+s.yt)/2,zc||0);for(let k=0;k<R;k++){const a=e*R+k,b=e*R+(k+1)%R;e?I.push(ci,a,b):I.push(ci,b,a)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();return g}
function wing(span,chord,th){const sh=new THREE.Shape();sh.moveTo(0,0);sh.quadraticCurveTo(-chord*.45,th*1.8,-chord,th*.25);sh.lineTo(-chord,-th*.25);sh.quadraticCurveTo(-chord*.45,-th*.5,0,-th*.1);sh.lineTo(0,0);const g=new THREE.ExtrudeGeometry(sh,{depth:span,bevelEnabled:false,curveSegments:6});g.translate(0,0,-span/2);return g}
function plate(len,h,th){const sh=new THREE.Shape();sh.moveTo(-len/2,0);sh.lineTo(len/2,0);sh.quadraticCurveTo(len/2,h*.7,len*.2,h);sh.quadraticCurveTo(-len*.2,h*1.05,-len/2,h*.55);sh.lineTo(-len/2,0);const g=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:false,curveSegments:6});g.translate(0,0,-th/2);return g}
let AOTEX=null,WAOTEX=null;
function aoTex(){if(AOTEX)return AOTEX;const c=document.createElement('canvas');c.width=128;c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(64,32,6,64,32,60);g.addColorStop(0,'rgba(0,0,0,.86)');g.addColorStop(.52,'rgba(0,0,0,.56)');g.addColorStop(.82,'rgba(0,0,0,.16)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,64);return AOTEX=new THREE.CanvasTexture(c)}
function wheelAoTex(){if(WAOTEX)return WAOTEX;const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,4,32,32,30);g.addColorStop(0,'rgba(0,0,0,.88)');g.addColorStop(.55,'rgba(0,0,0,.48)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return WAOTEX=new THREE.CanvasTexture(c)}
const WCTEX={};
function wheelCoverTex(tm){
 if(WCTEX[tm.a])return WCTEX[tm.a];
 const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
 const bg=hex(tm.wc||0x22252d);
 const g=x.createRadialGradient(64,64,10,64,64,62);g.addColorStop(0,'#2c303a');g.addColorStop(.65,bg);g.addColorStop(1,'#14161c');
 x.fillStyle=g;x.fillRect(0,0,128,128);
 // Crisp thin silver inner-rim ring (matches modern F1 aero rim silhouette)
 x.strokeStyle='#d6dbe4';x.lineWidth=4.5;x.beginPath();x.arc(64,64,55,0,TAU);x.stroke();
 x.strokeStyle='rgba(255,255,255,.10)';x.lineWidth=2;x.beginPath();x.arc(64,64,38,0,TAU);x.stroke();
 if(tm.mcl){
  const cols=['#ea4335','#fbbc05','#34a853','#4285f4'];
  cols.forEach((cl,i)=>{x.strokeStyle=cl;x.lineWidth=7;x.beginPath();x.arc(64,64,34,i*Math.PI/2,(i+1)*Math.PI/2);x.stroke()});
 }
 // Clean silver center hub nut
 x.fillStyle='#cfd5de';x.beginPath();x.arc(64,64,14,0,TAU);x.fill();
 x.fillStyle='#161920';x.beginPath();x.arc(64,64,6,0,TAU);x.fill();
 return WCTEX[tm.a]=new THREE.CanvasTexture(c);
}
const RWTEX={};
function rearWingTex(tm){
 if(RWTEX[tm.a])return RWTEX[tm.a];
 const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');
 const bg=tm.rw!=null?tm.rw:tm.c;
 x.fillStyle=hex(bg);x.fillRect(0,0,256,64);
 const lum=((bg>>16&255)*.3+(bg>>8&255)*.6+(bg&255)*.1)>155;
 x.fillStyle=hex(tm.apx?tm.c:tm.d);x.fillRect(0,0,256,6);x.fillRect(0,58,256,6);
 x.fillStyle=lum?'#11151d':'#f4f6fa';x.font='900 30px Arial';x.textAlign='center';x.textBaseline='middle';
 x.fillText((tm.b||tm.n).toUpperCase(),128,33);
 const t=new THREE.CanvasTexture(c);t.anisotropy=4;return RWTEX[tm.a]=t;
}
const SPTEX={};
function sidepodTex(tm){
 if(SPTEX[tm.a])return SPTEX[tm.a];
 const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');
 x.clearRect(0,0,512,96);
 // Sleek tapered horizontal teal/accent stripe across sidepod flank
 x.fillStyle=hex(tm.d);
 x.beginPath();x.moveTo(16,66);x.lineTo(496,26);x.lineTo(496,54);x.lineTo(16,86);x.closePath();x.fill();
 // Subtle highlight edge
 x.fillStyle='rgba(255,255,255,.22)';x.fillRect(24,42,464,4);
 // Crisp upright badge wordmark (e.g. VORTEX)
 const lum=((tm.d>>16&255)*.3+(tm.d>>8&255)*.6+(tm.d&255)*.1)>150;
 x.save();x.translate(230,56);x.rotate(-.06);
 x.font='italic 900 38px "Segoe UI",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';
 x.lineWidth=6;x.strokeStyle=lum?'rgba(12,16,28,.85)':'rgba(0,0,0,.65)';
 const txt=(tm.b||tm.a).toUpperCase();
 x.strokeText(txt,0,0);x.fillStyle='#ffffff';x.fillText(txt,0,0);x.restore();
 const t=new THREE.CanvasTexture(c);t.anisotropy=4;return SPTEX[tm.a]=t;
}
const FINTEX={};
function finTex(num,tm){
 const key=(num||1)+'_'+(tm.apx?1:0);
 if(FINTEX[key])return FINTEX[key];
 const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');
 x.fillStyle='#f2f4f8';x.fillRect(0,0,256,128);
 x.fillStyle='rgba(20,26,44,.10)';x.fillRect(0,116,256,12);
 x.fillStyle='#161a24';x.font='900 84px "Segoe UI",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';
 x.fillText(String(num||1),128,64);
 const t=new THREE.CanvasTexture(c);t.anisotropy=4;return FINTEX[key]=t;
}
function mkCar(tm,tire,drvNum){
 mkTX();
 const g=new THREE.Group(),o={g,sp:[],fwL:[],bd:[]},tcm=o.tcm=new THREE.MeshBasicMaterial({color:TIRES[tire].c,side:THREE.DoubleSide}),rl=o.rl=new THREE.MeshBasicMaterial({color:0x660000}),c=tm.c,d=tm.d,c3=tm.c3!=null?tm.c3:d;
 const isMatte=tm.a==='RBR'||tm.a==='MER'||tm.a==='CAD';
 const body=sm(c,isMatte?.34:.14,isMatte?.24:.36,isMatte?.35:1.0);
 const acc=sm(d,.16,.24,.92);
 const acc3=sm(c3,.2,.28,.8);
 const noseMat=tm.n2!=null?sm(tm.n2,.18,.65,.92):tm.a==='RBR'?acc:body;
 const engMat=tm.mcl?sm(0x16181e,.48,.22,.25):body;
 const cf=new THREE.MeshStandardMaterial({color:0xffffff,map:TX.cf,roughness:.56,metalness:.20,side:THREE.DoubleSide});
 const cfGloss=new THREE.MeshPhysicalMaterial({color:0xd8dde8,map:TX.cf,roughness:.26,metalness:.34,clearcoat:.65,clearcoatRoughness:.14,side:THREE.DoubleSide});
 const tyre=sm(0x13151a,.64,.05),metal=sm(0x9aa2ad,.20,.92),white=sm(0xf2f4f8,.22,.12,.65);
 const add=(geo,m,x,y,z,cast,p)=>{const k=new THREE.Mesh(geo,m);k.position.set(x,y,z);k.castShadow=cast!==false;(p||g).add(k);return k};
 // Tight dark grounded AO contact shadow beneath chassis + 4 wheel contact patches
 const sh=new THREE.Mesh(new THREE.PlaneGeometry(52,22),new THREE.MeshBasicMaterial({map:aoTex(),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));sh.rotation.x=-Math.PI/2;sh.position.set(0,.15,0);g.add(sh);
 const waoMat=new THREE.MeshBasicMaterial({map:wheelAoTex(),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 for(const [wx,wz,wl,ww] of [[12.2,6.6,9.5,5.8],[12.2,-6.6,9.5,5.8],[-11.8,6.7,10.5,7.2],[-11.8,-6.7,10.5,7.2]]){const wp=new THREE.Mesh(new THREE.PlaneGeometry(wl,ww),waoMat);wp.rotation.x=-Math.PI/2;wp.position.set(wx,.14,wz);g.add(wp)}
 // Sleek modern F1 monocoque + long contoured tapered nosecone with crisp teal/accent tip
 add(loft([{x:24.2,w:.42,yb:1.18,yt:1.68},{x:20.4,w:.76,yb:1.22,yt:2.18}],16),tm.apx?acc:noseMat,0,0,0);
 add(loft([{x:20.5,w:.75,yb:1.22,yt:2.17},{x:14.4,w:1.28,yb:1.26,yt:2.92},{x:8.5,w:1.88,yb:1.18,yt:3.68}],16),noseMat,0,0,0);
 add(loft([{x:8.6,w:1.88,yb:1.18,yt:3.68},{x:2.5,w:2.48,yb:1.12,yt:4.38},{x:-3.5,w:2.76,yb:1.12,yt:5.05},{x:-9.5,w:2.05,yb:1.28,yt:4.52},{x:-15.5,w:1.08,yb:1.48,yt:3.38},{x:-18.8,w:.68,yb:1.88,yt:2.82}],16),engMat,0,0,0);
 // Nose accent pinstripe
 if(!tm.apx)add(new THREE.BoxGeometry(15,.14,.85),acc,13.5,2.72,0,false);
 if(tm.a==='FER'){
  const wb=add(new THREE.BoxGeometry(7.2,2.45,3.25),acc,-6.8,3.6,0);wb.rotation.z=-.18;
 }else if(tm.a==='MER'){
  for(const s of[-1,1])add(new THREE.BoxGeometry(18,.28,.35),acc,5.5,3.4,s*1.65,false);
 }
 // Raised sculpted airbox / roll-hoop scoop
 const airMat=tm.a==='MER'?acc3:tm.a==='RBR'?acc:body;
 add(loft([{x:-1.8,w:1.18,yb:4.5,yt:6.15},{x:-4.8,w:1.36,yb:4.5,yt:6.22},{x:-9.6,w:.86,yb:4.1,yt:5.38},{x:-14.5,w:.38,yb:3.1,yt:4.18}],12),airMat,0,0,0);
 const ib=new THREE.CylinderGeometry(.92,1.1,1.1,12);ib.rotateZ(Math.PI/2);add(ib,cf,-1.65,5.35,0);
 // Tall crisp white shark-fin panel with upright driver number on both sides (zero mirroring)
 const finGeo=new THREE.BoxGeometry(8.6,2.45,.24);
 add(finGeo,tm.apx||tm.a==='FER'?white:engMat,-11.2,4.78,0);
 const fMat=new THREE.MeshStandardMaterial({map:finTex(drvNum||1,tm),roughness:.32,metalness:.08});
 for(const s of[-1,1]){
  const fp=new THREE.Mesh(new THREE.PlaneGeometry(7.8,2.25),fMat);
  fp.position.set(-11.2,4.78,s*.14);if(s<0)fp.rotation.y=Math.PI;g.add(fp);
 }
 // T-cam pod on top of airbox
 add(new THREE.BoxGeometry(.65,.85,.42),cf,-3.4,6.48,0,false);add(new THREE.BoxGeometry(.78,.34,3.2),tm.mcl?sm(0xd8ff00,.3,.1):cf,-3.4,6.96,0,false);
 // Sculpted rounded teardrop sidepods with deep undercut, dark intake & upright VORTEX/team sidepod decal
 const spDecalMat=new THREE.MeshBasicMaterial({map:sidepodTex(tm),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 for(const s of[-1,1]){
  add(loft([{x:6.1,w:1.42,yb:2.18,yt:3.86},{x:1.8,w:2.32,yb:1.52,yt:4.08},{x:-4.4,w:2.12,yb:1.28,yt:3.48},{x:-10.8,w:1.25,yb:1.32,yt:2.45},{x:-15.2,w:.55,yb:1.48,yt:2.0}],16,s*4.38),body,0,0,0);
  // Recessed dark matte carbon sidepod intake mouth + sleek upper lip
  add(new THREE.BoxGeometry(.85,1.25,2.55),cf,6.15,2.92,s*4.35,false);
  add(new THREE.BoxGeometry(1.45,.22,2.72),body,6.35,3.58,s*4.35,false);
  // Outward-facing upright sidepod stripe + VORTEX/team badge (never mirrored on either side)
  const spDec=new THREE.Mesh(new THREE.PlaneGeometry(14.8,2.3),spDecalMat);
  spDec.position.set(-1.8,2.98,s*6.62);
  if(s<0)spDec.rotation.y=Math.PI;
  g.add(spDec);
  // Flat matte-carbon Venturi floor edge
  add(new THREE.BoxGeometry(22,.24,1.7),cf,-2.2,1.02,s*6.05);
  // Sleek wing mirrors on thin carbon stalks
  add(new THREE.BoxGeometry(.75,.16,1.15),cf,4.1,4.02,s*3.5,false);
  add(new THREE.BoxGeometry(1.15,.54,1.58),body,4.1,4.34,s*4.38,false);
 }
 // Carbon Venturi floor + 5-strake rear diffuser + central exhaust
 add(new THREE.BoxGeometry(30.5,.36,11.6),cf,-.5,.96,0);
 add(new THREE.BoxGeometry(2.8,1.25,10.4),cf,-17.0,1.45,0);
 for(const sz of[-4.2,-2.1,0,2.1,4.2])add(new THREE.BoxGeometry(3.6,1.45,.22),cf,-17.4,1.5,sz);
 const ex=new THREE.CylinderGeometry(.52,.6,1.8,10);ex.rotateZ(Math.PI/2);add(ex,metal,-18.8,3.9,0,false);
 // Sleek dark matte carbon Halo + cockpit steering wheel + teal/yellow visor helmet
 const haloMat=tm.apx||tm.a==='MER'?cf:body;
 const hp=new THREE.CatmullRomCurve3([new THREE.Vector3(-3.1,4.65,-2.22),new THREE.Vector3(-.5,6.32,-2.02),new THREE.Vector3(3.8,5.08,0),new THREE.Vector3(-.5,6.32,2.02),new THREE.Vector3(-3.1,4.65,2.22)]);
 add(new THREE.TubeGeometry(hp,30,.28,8),haloMat,0,0,0);add(new THREE.CylinderGeometry(.24,.30,1.52,6),haloMat,3.9,4.36,0);
 // F1 Steering wheel with illuminated telemetry screen (visible in T-Cam & Halo Cockpit)
 {const sw=new THREE.Group();sw.position.set(2.05,4.15,0);sw.rotation.z=-.38;
  add(new THREE.BoxGeometry(.28,1.15,2.1),cf,0,0,0,false,sw);
  add(new THREE.BoxGeometry(.32,.52,1.05),new THREE.MeshBasicMaterial({color:0x102840}),-.06,.12,0,false,sw);
  add(new THREE.BoxGeometry(.34,.1,.95),new THREE.MeshBasicMaterial({color:0x22e066}),-.08,.44,0,false,sw);
  g.add(sw);o.sw=sw}
 // Driver helmet (teal/yellow Apex GP style or team accent) with dark glossy visor
 {const hg=new THREE.Group();hg.position.set(-1.1,4.95,0);
  add(new THREE.SphereGeometry(1.22,14,12),tm.apx?sm(0xf2d024,.22,.15,.7):tm.a==='RBR'?acc:white,0,0,0,true,hg);
  if(tm.apx)add(new THREE.SphereGeometry(1.24,14,10,0,TAU,0,Math.PI*.42),acc,0,.04,0,false,hg);
  add(new THREE.BoxGeometry(.85,.48,1.56),sm(0x090b10,.06,.9,.95),.82,.14,0,false,hg);
  g.add(hg);o.helm=hg}
 // Multi-element swept front wing (off-white mainplanes + teal pinstripes + bold two-tone sculpted endplates)
 const fw=o.fw=new THREE.Group();g.add(fw);
 const fwMain=tm.apx?white:body,fwSub=tm.apx?white:acc;
 [[22.2,.46,0,17.8,cf],[21.2,.88,-.08,17.2,fwMain],[20.1,1.42,-.18,16.2,fwMain],[19.1,1.98,-.26,14.8,tm.apx?acc:fwSub]].forEach(e=>{const m=new THREE.Mesh(wing(e[3],2.45,.30),e[4]);m.position.set(e[0],e[1],0);m.rotation.z=e[2];m.castShadow=true;fw.add(m)});
 if(tm.apx){
  // Crisp thin teal/cyan pinstripes across white front wing planes
  add(new THREE.BoxGeometry(.35,.08,16.8),acc,20.8,1.25,0,false,fw);
  add(new THREE.BoxGeometry(.35,.08,15.8),acc,19.8,1.76,0,false,fw);
 }
 // Dual nose-to-front-wing pylons
 for(const s of[-1,1])add(new THREE.BoxGeometry(1.8,1.15,.22),cf,20.2,1.15,s*.58,false,fw);
 // Sculpted two-tone front wing endplates (dark navy rear + crisp teal/accent forward wedge)
 for(const s of[-1,1]){
  const ep=add(plate(6.0,3.6,.30),tm.apx?body:cfGloss,19.8,.22,s*8.85,true,fw);ep.rotation.x=s*-.12;
  add(new THREE.BoxGeometry(3.4,1.95,.34),acc,21.2,1.15,s*8.92,false,fw);
  add(new THREE.BoxGeometry(4.8,.38,.34),acc,19.9,3.05,s*8.88,false,fw);
 }
 // Dual-plane sculpted Rear Wing: tall dark navy endplates + curved teal/accent DRS upper plane + beam wing + pylon
 const rwMat=new THREE.MeshStandardMaterial({map:rearWingTex(tm),roughness:.28,metalness:.22,side:THREE.DoubleSide});
 add(wing(11.6,3.1,.4),tm.apx?acc:(tm.rw!=null?sm(tm.rw,.22,.24,.8):body),-15.8,7.05,0);
 add(wing(10.8,2.3,.3),cf,-16.3,4.45,0);
 add(new THREE.BoxGeometry(.65,4.4,.55),cf,-14.6,5.2,0);
 for(const s of[-1,1]){
  add(plate(6.8,6.4,.32),tm.apx?body:cfGloss,-17.5,3.4,s*5.95);
  add(new THREE.BoxGeometry(5.8,.38,.36),acc,-17.4,8.65,s*5.98,false);
 }
 const fp=o.flap=new THREE.Group();fp.position.set(-16.0,8.02,0);g.add(fp);
 add(wing(11.2,2.25,.3),tm.apx?acc:(tm.rw!=null?sm(tm.rw,.22,.24,.8):acc),0,0,0,true,fp);
 const rwSign=new THREE.Mesh(new THREE.PlaneGeometry(10.8,1.95),rwMat);rwSign.rotation.y=-Math.PI/2;rwSign.position.set(-2.35,.05,0);fp.add(rwSign);
 // Rear crash structure housing + glowing square rain/ERS light
 add(new THREE.BoxGeometry(1.4,1.6,1.75),cf,-18.5,2.9,0,false);
 add(new THREE.BoxGeometry(.35,1.1,1.1),rl,-19.25,2.9,0,false);
 // 18-inch Low-Profile F1 Slicks with dark rims, thin inner silver ring & vivid rotating compound sidewall ring
 const wcMat=new THREE.MeshStandardMaterial({map:wheelCoverTex(tm),roughness:.36,metalness:.42});
 const wh=(x,y,z,r,w,front)=>{const st=new THREE.Group(),sp=new THREE.Group();st.position.set(x,y,z);st.add(sp);const hw=w/2,pf=[[.64,-1],[.93,-1],[1,-.78],[1,.78],[.93,1],[.64,1]].map(q=>new THREE.Vector2(r*q[0],hw*q[1])),tg=new THREE.LatheGeometry(pf,32);tg.rotateX(Math.PI/2);
  add(tg,tyre,0,0,0,true,sp);const sd=Math.sign(z);
  // Crisp rotating colored tyre compound sidewall ring (Yellow Medium, Red Soft, White Hard)
  add(new THREE.RingGeometry(r*.77,r*.87,36),tcm,0,0,sd*(hw+.025),false,sp);
  // Dark concave aero rim cover with silver inner ring & hub nut
  const cov=new THREE.Mesh(new THREE.CircleGeometry(r*.72,32),wcMat);cov.position.set(0,0,sd*(hw+.035));if(sd<0)cov.rotation.y=Math.PI;sp.add(cov);
  const rim=new THREE.CylinderGeometry(r*.68,r*.68,w*.88,24);rim.rotateX(Math.PI/2);add(rim,cf,0,0,0,false,sp);
  // Carbon brake disc inside inner wheel hub (glows hot orange under heavy braking)
  const bdm=new THREE.MeshBasicMaterial({color:0x221008,side:THREE.DoubleSide});
  const bd=new THREE.Mesh(new THREE.RingGeometry(r*.32,r*.58,18),bdm);bd.position.set(0,0,-sd*(hw-.15));st.add(bd);o.bd.push(bdm);
  g.add(st);o.sp.push(sp);if(front)o.fwL.push(st)};
 wh(12.2,3.55,6.6,3.55,3.9,1);wh(12.2,3.55,-6.6,3.55,3.9,1);wh(-11.8,3.95,6.7,3.95,5.2);wh(-11.8,3.95,-6.7,3.95,5.2);
 const rod=(a,b,r)=>{const A=new THREE.Vector3(a[0],a[1],a[2]),B=new THREE.Vector3(b[0],b[1],b[2]),L=A.distanceTo(B),m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,6),cf);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize());g.add(m)};
 for(const s of[-1,1]){rod([12.2,2.55,s*1.9],[12.2,3.55,s*5.9],.18);rod([10.2,1.82,s*1.9],[12.2,3.15,s*5.9],.18);rod([-11.8,2.55,s*1.9],[-11.8,3.95,s*6.0],.2);rod([-9.8,1.95,s*1.9],[-11.8,3.55,s*6.0],.2)}
 g.rotation.order='YZX';return o}

const LBLTEX={};
function mkLabel(txt,colHex){
 const key=txt+'_'+colHex;
 if(!LBLTEX[key]){
  const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');
  x.fillStyle='rgba(10,14,24,.82)';x.beginPath();x.roundRect(6,10,244,44,10);x.fill();
  x.strokeStyle='rgba(255,255,255,.32)';x.lineWidth=2;x.stroke();
  x.fillStyle=colHex||'#ff3b30';x.fillRect(12,16,8,32);
  x.fillStyle='#ffffff';x.font='800 24px "Segoe UI",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';
  x.fillText(String(txt||'DRIVER').toUpperCase().slice(0,13),134,33);
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;LBLTEX[key]=t;
 }
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:LBLTEX[key],transparent:true,depthTest:true,depthWrite:false}));
 sp.scale.set(26,6.5,1);sp.position.set(0,13.5,0);return sp;
}
let PTEX=null;
function partTex(){if(PTEX)return PTEX;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.7)');g.addColorStop(.7,'rgba(255,255,255,.15)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return PTEX=new THREE.CanvasTexture(c)}
class Parts{constructor(n,col,size){this.n=n;this.p=new Float32Array(n*3).fill(-9999);this.v=new Float32Array(n*3);this.t=new Float32Array(n);this.i=0;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(this.p,3));this.m=new THREE.Points(g,new THREE.PointsMaterial({map:partTex(),color:col,size,transparent:true,opacity:.78,blending:THREE.AdditiveBlending,depthWrite:false}));this.m.frustumCulled=false}
 emit(x,y,z,vx,vy,vz,l){const k=this.i++%this.n;this.p.set([x,y,z],k*3);this.v.set([vx,vy,vz],k*3);this.t[k]=l}
 step(dt,g){for(let k=0;k<this.n;k++)if(this.t[k]>0){this.t[k]-=dt;const j=k*3;this.v[j+1]-=g*dt;this.p[j]+=this.v[j]*dt;this.p[j+1]+=this.v[j+1]*dt;this.p[j+2]+=this.v[j+2]*dt;if(this.t[k]<=0)this.p[j+1]=-9999}this.m.geometry.attributes.position.needsUpdate=true}}

// Pooled multi-color 3D radial Fireworks particle system (victory/podium celebration, zero GC churn)
class Fireworks{
 constructor(n,size){
  this.n=n;this.p=new Float32Array(n*3).fill(-9999);this.v=new Float32Array(n*3);this.c=new Float32Array(n*3);this.bc=new Float32Array(n*3);this.t=new Float32Array(n);this.lt=new Float32Array(n);this.i=0;this.active=0;
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(this.p,3));
  g.setAttribute('color',new THREE.BufferAttribute(this.c,3));
  this.m=new THREE.Points(g,new THREE.PointsMaterial({map:partTex(),size:size||5.8,vertexColors:true,transparent:true,opacity:.96,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  this.m.frustumCulled=false;
 }
 burst(x,y,z,colHex,count){
  const col=new THREE.Color(colHex||0xffd43b),col2=col.clone().lerp(new THREE.Color(0xffffff),.42),cnt=count||56;
  for(let q=0;q<cnt;q++){
   const k=this.i++%this.n,j=k*3,th=Math.random()*TAU,ph=Math.acos(rnd(-1,1)),sp=rnd(38,118);
   const vx=Math.sin(ph)*Math.cos(th)*sp,vy=Math.cos(ph)*sp+26,vz=Math.sin(ph)*Math.sin(th)*sp;
   const cc=q%3===0?col2:col;
   this.p[j]=x;this.p[j+1]=y;this.p[j+2]=z;this.v[j]=vx;this.v[j+1]=vy;this.v[j+2]=vz;
   this.bc[j]=this.c[j]=cc.r;this.bc[j+1]=this.c[j+1]=cc.g;this.bc[j+2]=this.c[j+2]=cc.b;
   this.t[k]=this.lt[k]=rnd(1.05,1.85);
  }
  this.active=1;
 }
 clear(){this.p.fill(-9999);this.t.fill(0);this.active=0;this.m.geometry.attributes.position.needsUpdate=true}
 step(dt){
  if(!this.active)return;let alive=0;const drag=Math.exp(-dt*1.35);
  for(let k=0;k<this.n;k++){
   if(this.t[k]<=0)continue;
   this.t[k]-=dt;const j=k*3;
   if(this.t[k]<=0){this.p[j+1]=-9999;continue}
   alive++;
   this.v[j]*=drag;this.v[j+1]=this.v[j+1]*drag-46*dt;this.v[j+2]*=drag;
   this.p[j]+=this.v[j]*dt;this.p[j+1]+=this.v[j+1]*dt;this.p[j+2]+=this.v[j+2]*dt;
   const life=clamp(this.t[k]/Math.max(.1,this.lt[k]),0,1),tw=life<.35?(.55+.45*Math.sin(this.t[k]*48+k)):1,fade=life*tw;
   this.c[j]=this.bc[j]*fade;this.c[j+1]=this.bc[j+1]*fade;this.c[j+2]=this.bc[j+2]*fade;
  }
  this.m.geometry.attributes.position.needsUpdate=true;
  this.m.geometry.attributes.color.needsUpdate=true;
  if(!alive)this.active=0;
 }
}

// Sculpted faceted rocky mountain peak geometry (replaces smooth placeholder spheres/cones)
function mkMountainGeo(){
 const g=new THREE.ConeGeometry(1,1,11,4,false),p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),h=y+.5;
  if(h>.02&&h<.98){
   const ang=Math.atan2(z,x),ridge=1+.18*Math.sin(ang*3.0+h*4.2)+.11*Math.cos(ang*5.0-h*2.5);
   p.setX(i,x*ridge);p.setZ(i,z*ridge);
  }
 }
 g.computeVertexNormals();return g;
}

