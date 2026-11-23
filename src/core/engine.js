/* Apex Formula GP · src/core/engine.js — Shared Core (Sfx, Car physics, AI, Pit stops, Phase 3 MP Sync, Game) */
// Fallback profiles if platform adapter (src/pc/pc.js or src/mobile/mobile.js) is not preloaded
const PERF_CFG={
 mobile:{dprCap:1.25,shadowSize:512,aniso:4,sparks:120,ersP:90,hudMs:80,mmMs:100,crowdWave:false,fxVignette:false},
 desktop:{dprCap:1.5,shadowSize:2048,aniso:16,sparks:400,ersP:300,hudMs:33,mmMs:50,crowdWave:true,fxVignette:true}
};
// Phase 3: Cross-Play Multiplayer (STUN + public TURN relay) & Fixed-Timestep Physics Tuning
const NET_CFG={fixedDt:1/60,maxSubSteps:4,sendHz:20,interpMs:90,maxExtrapMs:120,snapDist:130,pingMs:1500,peerOpts:{
 debug:1,pingInterval:5000,config:{
  iceServers:[
   {urls:'stun:stun.l.google.com:19302'},
   {urls:'stun:stun1.l.google.com:19302'},
   {urls:'stun:stun2.l.google.com:19302'},
   {urls:'stun:stun.cloudflare.com:3478'},
   {urls:'turn:openrelay.metered.ca:80',username:'openrelayproject',credential:'openrelayproject'},
   {urls:'turn:openrelay.metered.ca:443',username:'openrelayproject',credential:'openrelayproject'},
   {urls:'turn:openrelay.metered.ca:443?transport=tcp',username:'openrelayproject',credential:'openrelayproject'}
  ],iceCandidatePoolSize:4
 }
}};
class Sfx{
 init(){try{if(this.A){if(this.A.state==='suspended')this.A.resume().catch(()=>{});return}const A=this.A=new(window.AudioContext||window.webkitAudioContext)(),mk=t=>{const o=A.createOscillator();o.type=t;o.start();return o};
  if(A.state==='suspended')A.resume().catch(()=>{});
  // F1 Power unit oscillators + filter + MGU-H/harmonic voice
  this.o1=mk('sawtooth');this.o2=mk('sawtooth');this.o3=mk('sine');
  this.f=A.createBiquadFilter();this.f.type='lowpass';this.f.Q.value=2.4;
  const g2=A.createGain();g2.gain.value=.42;this.tg=A.createGain();this.tg.gain.value=0;
  this.o1.connect(this.f);this.o2.connect(g2);g2.connect(this.f);this.o3.connect(this.tg);this.tg.connect(A.destination);
  this.g=A.createGain();this.g.gain.value=0;this.f.connect(this.g);this.g.connect(A.destination);
  // Noise buffer for tyre screech, carbon brake hiss & exhaust crackle
  const b=A.createBuffer(1,A.sampleRate,A.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.nb=b;
  const n=A.createBufferSource();n.buffer=b;n.loop=true;const bp=A.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1900;bp.Q.value=1.2;this.sg=A.createGain();this.sg.gain.value=0;n.connect(bp);bp.connect(this.sg);this.sg.connect(A.destination);n.start();
  const bn=A.createBufferSource();bn.buffer=b;bn.loop=true;const bbp=A.createBiquadFilter();bbp.type='bandpass';bbp.frequency.value=3400;bbp.Q.value=3.2;this.bg=A.createGain();this.bg.gain.value=0;bn.connect(bbp);bbp.connect(this.bg);this.bg.connect(A.destination);bn.start();
  if(this._wantTheme&&this._wantTheme!=='off')this.playTheme(this._wantTheme)}catch(e){this.A=null}}
 engine(r,th,v,ers){if(!this.A)return;r=+r||0;th=+th||0;v=+v||0;try{this._eng(r,th,v,!!ers)}catch(e){}}
 _eng(r,th,v,ers){if(this.mu)v=0;const t=this.A.currentTime,m=this.mode||'v8';
  if(m==='v10'){const fr=115+r*435;this.o1.frequency.setTargetAtTime(fr,t,.02);this.o2.frequency.setTargetAtTime(fr*2.003,t,.02);this.f.frequency.setTargetAtTime(750+th*2400+r*2200,t,.035);this.g.gain.setTargetAtTime(v*this.ev*(.05+th*.055),t,.035);this.o3.frequency.setTargetAtTime(fr*3.01,t,.03);this.tg.gain.setTargetAtTime(v*this.ev*(.012+th*.018),t,.04)}
  else if(m==='v8'){const fr=66+r*255;this.o1.frequency.setTargetAtTime(fr,t,.025);this.o2.frequency.setTargetAtTime(fr*.501,t,.025);this.f.frequency.setTargetAtTime(420+th*1650+r*1150,t,.04);this.g.gain.setTargetAtTime(v*this.ev*(.065+th*.06),t,.04);this.o3.frequency.setTargetAtTime(fr*1.5,t,.04);this.tg.gain.setTargetAtTime(v*this.ev*(.01+th*.014),t,.04)}
  else{const fr=78+r*315;this.o1.frequency.setTargetAtTime(fr,t,.025);this.o2.frequency.setTargetAtTime(fr*1.502,t,.025);this.f.frequency.setTargetAtTime(520+th*1900+r*1400,t,.04);this.g.gain.setTargetAtTime(v*this.ev*(.055+th*.055),t,.04);this.o3.frequency.setTargetAtTime(920+r*2500+(ers?420:0),t,.04);this.tg.gain.setTargetAtTime(v*this.ev*(.008+th*.014+(ers?.018:0)),t,.05)}}
 // Cleanly silence all looping race audio (engine, turbo, tyre screech, brake hiss) with zero clicks/static
 silenceRace(){try{if(!this.A)return;const t=this.A.currentTime;for(const g of[this.g,this.tg,this.sg,this.bg]){if(!g)continue;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+.035)}}catch(e){}}
 // Shared PC & Mobile music engine: plays uploaded assets/music/theme.mp3 for Intro/Selection/Outro with smooth fade & synth fallback
 _fadeMp3(target,ms,pauseAtEnd){
  const el=this.bgm;if(!el)return;
  if(this._bf)clearInterval(this._bf);
  const start=el.volume,steps=Math.max(1,Math.round((ms||400)/25));let k=0;
  this._bf=setInterval(()=>{k++;const u=Math.min(1,k/steps);try{el.volume=clamp(start+(target-start)*u,0,1)}catch(e){}
   if(k>=steps){clearInterval(this._bf);this._bf=null;if(pauseAtEnd&&target<=.002)try{el.pause()}catch(e){}}},25);
 }
 playTheme(mode){
  const prev=this._wantTheme||'off';
  this._wantTheme=mode||'off';
  const wantOn=this._wantTheme!=='off'&&!this.mu&&this.mus!==false&&!document.hidden;
  const vol=clamp(.48*(this.sv!=null?this.sv:.7),0,1);
  // Primary: uploaded high-energy rock theme (assets/music/theme.mp3)
  if(!this._mp3Err&&typeof Audio!=='undefined'){
   try{
    if(!this.bgm){
     const a=this.bgm=new Audio('assets/music/theme.mp3');
     a.loop=true;a.preload='auto';a.volume=0;a.setAttribute('playsinline','');
     a.onerror=()=>{this._mp3Err=true;this.bgm=null;if(this._wantTheme!=='off')this._playSynth(this._wantTheme)};
    }
    const a=this.bgm;
    if(wantOn){
     if(this._wantTheme==='outro'&&prev!=='outro'){try{a.currentTime=96}catch(e){}}
     else if(this._wantTheme==='intro'&&prev==='off'&&a.paused){try{if(a.currentTime>90)a.currentTime=0}catch(e){}}
     const p=a.play();if(p&&p.catch)p.catch(()=>{});
     this._fadeMp3(vol,380,false);
     this._playSynth('off');this.theme=this._wantTheme;this.mOn=true;return;
    }else{
     this._fadeMp3(0,420,true);
     this._playSynth('off');this.theme='off';this.mOn=false;return;
    }
   }catch(e){this._mp3Err=true}
  }
  this._playSynth(this._wantTheme);
 }
 _playSynth(mode){
  try{if(!this.A)return;if(this.A.state==='suspended')this.A.resume().catch(()=>{});
   if(!this.mg){const A=this.A;this.mg=A.createGain();this.mg.gain.value=0;this.mlp=A.createBiquadFilter();this.mlp.type='lowpass';this.mlp.frequency.value=1050;this.mg.connect(this.mlp);this.mlp.connect(A.destination);
    this.mo=[];[110,164.81,220,277.18].forEach((f,i)=>{const o=A.createOscillator(),g=A.createGain();o.type=i%2?'triangle':'sine';o.frequency.value=f;g.gain.value=i<2?.18:.1;o.connect(g);g.connect(this.mg);o.start();this.mo.push(o)});
    this.mStep=0;this.mInt=setInterval(()=>{if(!this.A||document.hidden||this.theme==='off'||this.mu||this.mus===false||!(this.sv>.005)||(!this._mp3Err&&this.bgm))return;
     const isOut=this.theme==='outro',pk=Math.max(.002,(isOut?.075:.05)*this.sv);
     const seq=isOut?[261.63,329.63,392.0,523.25,659.25,523.25,392.0,523.25]:[220,277.18,329.63,440,329.63,277.18,246.94,329.63];
     const fr=seq[this.mStep++%seq.length],o=this.A.createOscillator(),g=this.A.createGain(),t=this.A.currentTime;
     o.type=isOut?'triangle':'sine';o.frequency.value=fr;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(pk,t+.018);g.gain.exponentialRampToValueAtTime(.0005,t+(isOut?.48:.42));o.connect(g);g.connect(this.mg);o.start(t);o.stop(t+.5)},440)}
   this.theme=mode||'off';const on=this.theme!=='off'&&!this.mu&&this.mus!==false,t=this.A.currentTime;
   const freqs=this.theme==='outro'?[130.81,196.0,261.63,329.63]:[110,164.81,220,277.18];
   if(this.mo)this.mo.forEach((o,i)=>o.frequency.setTargetAtTime(freqs[i],t,.25));
   if(this.mlp)this.mlp.frequency.setTargetAtTime(this.theme==='outro'?1550:980,t,.25);
   const tgt=on?(this.theme==='outro'?.20:.16)*this.sv:0;
   this.mg.gain.cancelScheduledValues(t);this.mg.gain.setValueAtTime(this.mg.gain.value,t);this.mg.gain.linearRampToValueAtTime(tgt,t+(on?.38:.25));this.mOn=on}catch(e){}
 }
 music(on){this.playTheme(on?'intro':'off')}
 fanfare(){if(!this.A||this.mu)return;try{const A=this.A,t=A.currentTime;[261.63,329.63,392.0,523.25].forEach((f,i)=>{const o=A.createOscillator(),g=A.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.001,t+i*.08);g.gain.linearRampToValueAtTime(.14*this.sv,t+i*.08+.06);g.gain.exponentialRampToValueAtTime(.001,t+i*.08+1.6);o.connect(g);g.connect(A.destination);o.start(t+i*.08);o.stop(t+i*.08+1.7)})}catch(e){}}
 shift(up){if(!this.A||this.mu||!this.nb)return;try{const A=this.A,t=A.currentTime,n=A.createBufferSource(),f=A.createBiquadFilter(),g=A.createGain();n.buffer=this.nb;f.type='bandpass';f.frequency.value=up?340:520;f.Q.value=up?1.4:2.2;const dur=up?.065:.095;g.gain.setValueAtTime((up?.22:.16)*this.sv,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);n.connect(f);f.connect(g);g.connect(A.destination);n.start(t);n.stop(t+dur)}catch(e){}}
 brake(v){if(!this.A||!this.bg)return;try{this.bg.gain.setTargetAtTime(this.mu?0:(+v||0)*.055*this.sv,this.A.currentTime,.04)}catch(e){}}
 gun(){if(!this.A||this.mu)return;try{const A=this.A,t=A.currentTime,o=A.createOscillator(),g=A.createGain();o.type='sawtooth';o.frequency.setValueAtTime(620,t);o.frequency.exponentialRampToValueAtTime(1180,t+.09);o.frequency.exponentialRampToValueAtTime(420,t+.22);g.gain.setValueAtTime(.16*this.sv,t);g.gain.exponentialRampToValueAtTime(.001,t+.24);o.connect(g);g.connect(A.destination);o.start(t);o.stop(t+.24)}catch(e){}}
 screech(v){if(!this.A)return;try{this.sg.gain.setTargetAtTime(this.mu?0:(+v||0)*.12*this.sv,this.A.currentTime,.05)}catch(e){}}
 beep(f,d,v){if(!this.A||this.mu)return;const o=this.A.createOscillator(),g=this.A.createGain(),t=this.A.currentTime;o.type='square';o.frequency.value=f;g.gain.setValueAtTime(v*.3*this.sv,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(this.A.destination);o.start(t);o.stop(t+d)}
 crash(v){if(!this.A||this.mu)return;const n=this.A.createBufferSource(),g=this.A.createGain(),l=this.A.createBiquadFilter(),t=this.A.currentTime;n.buffer=this.nb;l.type='lowpass';l.frequency.value=900;g.gain.setValueAtTime(.5*v*this.sv,t);g.gain.exponentialRampToValueAtTime(.001,t+.4);n.connect(l);l.connect(g);g.connect(this.A.destination);n.start(t);n.stop(t+.4)}
}

class Car{
 constructor(team,tire,isP,skill,line,drv){const dIdx=drv||0,dNum=(DR[team]&&DR[team][dIdx])?DR[team][dIdx][1]:1;Object.assign(this,{team,tire,isP,skill,line,x:0,y:0,a:0,vx:0,vy:0,steer:0,thr:0,brk:0,ers:100,ersOn:false,drs:false,drsOpen:0,drsAv:false,wear:0,dmg:0,warm:0,lap:-1,maxLap:-1,idx:0,pidx:0,best:1e9,lapStart:0,laps:[],fin:null,topV:0,rpm:.3,gear:1,spd:0,prog:0,gap:0,d:0,slip:0,pits:0,pitDone:false,inPit:false,pos:1,ws:0,ey:0,pitL:0,drv:dIdx,hold:false,pitS:0,pitT:0,stopFor:0,pitAt:.74+Math.random()*.08,lastPitLap:-2,evadeOff:0,sAdd:0,bAs:0});this.o=mkCar(TEAMS[team],tire,dNum)}
 update(dt,G){
  const T=G.T,tc=TIRES[this.tire],st=G.set.steer;
  this.pidx=this.idx;this.idx=T.near(this.x,this.y,this.idx);
  if(this.pidx>T.N*.8&&this.idx<T.N*.2){this.lap++;if(this.lap>this.maxLap){this.maxLap=this.lap;G.cross(this)}}else if(this.pidx<T.N*.2&&this.idx>T.N*.8)this.lap--;
  const i=this.idx,d=this.d=T.side(this.x,this.y,i),ad=Math.abs(d),po=T.pitOff(i);
  this.inPit=po!=null&&d>52+T.S&&Math.abs(d-po)<23;
  let sg=1,roll=0;if(!this.inPit){if(ad>T.gv){sg=.32;roll=1.6}else if(ad>T.pw){sg=.5;roll=.7}else if(ad>T.hw)sg=.95}
  const BW=T.bwAt(i);if(ad>BW){const sn=Math.sign(d),nx=-T.ty[i]*sn,ny=T.tx[i]*sn,vn=this.vx*nx+this.vy*ny;this.x=T.x[i]-T.ty[i]*BW*sn;this.y=T.y[i]+T.tx[i]*BW*sn;
   if(vn>0){this.vx-=1.3*vn*nx;this.vy-=1.3*vn*ny;this.vx*=.75;this.vy*=.75;if(vn>40){G.hit(this,(vn-40)/420);if(this.isP){G.sfx.crash(Math.min(1,vn/200));G.msg('BARRIER IMPACT: FRONT WING DAMAGE')}}}}
  if(this.isP&&G.state!=='done2'&&G.doneT<0)G.ctrlP(this,dt);else G.ctrlAI(this,dt);
  let f=[Math.cos(this.a),Math.sin(this.a)],vf=this.vx*f[0]+this.vy*f[1];
  // 3-stage realistic F1 tyre degradation curve (0-60% stable, 60-80% progressive loss, >80% cliff)
  const w=this.wear,wMul=w<.6?1-.08*(w/.6):w<.8?.92-.16*((w-.6)/.2):.76-.34*((w-.8)/.2);
  const grip=tc.g*wMul*(.88+.12*this.warm)*(1-.22*this.dmg)*sg,maxLat=grip*(168+.00062*(1-.55*this.dmg)*vf*vf),av=Math.abs(vf);
  const yawMax=Math.min(av/19*.62,1.18*maxLat/Math.max(av,38));
  const cliffWobble=w>.8&&av>120?Math.sin(performance.now()*.018)*(w-.8)*.75*Math.sign(this.steer||1):0;
  this.a+=clamp(this.steer+(this.sAdd||0)+cliffWobble,-1.3,1.3)*st*yawMax*clamp(vf/15,-1,1)*dt;
  f=[Math.cos(this.a),Math.sin(this.a)];const r=[-f[1],f[0]];
  vf=this.vx*f[0]+this.vy*f[1];let vl=this.vx*r[0]+this.vy*r[1],ac=0;
  if(this.thr>0)ac+=Math.min(95*this.thr,135*grip);
  if(this.ersOn&&this.ers>0){ac+=50;this.ers=Math.max(0,this.ers-12*dt)}
  ac-=(this.drs?.00034:.00047)*(1+.3*this.dmg)*vf*Math.abs(vf)+roll*.9*vf;
  if(this.brk>0&&vf>2){ac-=235*Math.min(1,grip)*this.brk;if(vf>60)this.ers=Math.min(100,this.ers+20*dt*this.brk)}
  else if(this.brk>0&&this.thr==0)ac-=vf>-70?70*this.brk:0;else if(this.thr==0)ac-=10*Math.sign(vf);
  vf+=ac*dt;vl+=clamp(-vl/dt,-maxLat,maxLat)*dt;const slip=this.slip=Math.abs(vl);
  vf-=Math.sign(vf)*Math.min(slip*1.2,160)*dt*.6;if(this.inPit&&vf>111)vf=Math.max(111,vf-500*dt);
  this.vx=f[0]*vf+r[0]*vl;this.vy=f[1]*vf+r[1]*vl;this.x+=this.vx*dt;this.y+=this.vy*dt;
  this.spd=Math.hypot(this.vx,this.vy);this.topV=Math.max(this.topV,this.spd*.72);
  // Distance-normalized tyre wear per lap (Soft ~45-55%, Medium ~20-28%, Hard ~10-15%; 0% when stationary)
  if(this.spd>2&&!this.inPit){const stress=.82+Math.abs(this.steer)*av/420+slip/95+(this.brk>0?.25:0);this.wear=Math.min(1,this.wear+(this.spd*dt/T.L)*tc.w*stress)}
  this.warm=Math.min(1,this.warm+dt/tc.t*(1+slip/60));this.ers=Math.min(100,this.ers+1.2*dt);
  let g=0;const UP=[70,120,170,225,280,335,395,520];while(g<7&&this.spd>UP[g])g++;const lo=g?UP[g-1]:0;this.gear=g+1;
  this.rpm+=((g?.5:.3)+(g?.5:.7)*clamp((this.spd-lo)/(UP[g]-lo),0,1)-this.rpm)*Math.min(1,dt*10);
  this.drsOpen+=((this.drs?1:0)-this.drsOpen)*Math.min(1,dt*10);
  const ey=this.ey;
  if(this.spd>150&&(G.state==='menu'||G.state==='setup'?Math.random()<.04:ad>T.hw&&ad<T.hw+9&&Math.random()<.3))G.sparks.emit(this.x-f[0]*13,ey+1.4,this.y-f[1]*13,-f[0]*this.spd*.2+rnd(-30,30),rnd(20,80),-f[1]*this.spd*.2+rnd(-30,30),.5);
  if(this.ersOn&&this.ers>0&&this.spd>40)for(let q=0;q<2;q++)G.ersP.emit(this.x-f[0]*18,ey+4,this.y-f[1]*18,-f[0]*(this.spd*.3+40)+rnd(-15,15),rnd(0,12),-f[1]*(this.spd*.3+40)+rnd(-15,15),.5);
  const e1=T.ey[(i+1)%T.N]-2*T.ey[i]+T.ey[(i+T.N-1)%T.N];
  if(this.spd>220&&Math.abs(e1)>.7&&Math.random()<.5)for(let q=0;q<3;q++)G.sparks.emit(this.x-f[0]*10+rnd(-4,4),ey+.8,this.y-f[1]*10+rnd(-4,4),-f[0]*this.spd*.25+rnd(-40,40),rnd(20,90),-f[1]*this.spd*.25+rnd(-40,40),.45);
  if(ad>BW-16&&this.spd>100&&Math.random()<.6){const sn=Math.sign(d);G.sparks.emit(this.x-T.ty[i]*sn*9,ey+2,this.y+T.tx[i]*sn*9,-f[0]*this.spd*.2+rnd(-30,30),rnd(10,70),-f[1]*this.spd*.2+rnd(-30,30),.45)}
  if((slip>34||(this.brk>.8&&vf>150))&&sg>.9){const px=this.x-f[0]*11,pz=this.y-f[1]*11;this.lsk=this.lsk||{};for(const sd of[-6,6]){const wx=px+r[0]*sd,wz=pz+r[1]*sd,l=this.lsk[sd];if(l&&Math.hypot(wx-l[0],wz-l[1])<30)G.skid(l[0],l[1],wx,wz,ey);this.lsk[sd]=[wx,wz]}}else this.lsk=null;
 }
 sync(G,dt){const o=this.o,T=G.T,i=this.idx,j=(i+1)%T.N,k=(i+T.N-1)%T.N;this.ey+=(T.ey[i]-this.ey)*Math.min(1,dt*14);this.pitL+=((this.hold?3:0)-this.pitL)*Math.min(1,dt*10);
  o.g.position.set(this.x,this.ey+this.pitL,this.y);o.g.rotation.y=-this.a;o.g.rotation.z=Math.atan2(T.ey[j]-T.ey[k],T.ds[k]+T.ds[i]);
  this.ws+=this.spd/3.7*dt;for(const s of o.sp)s.rotation.z=-this.ws;for(const f of o.fwL)f.rotation.y=-this.steer*.4;
  if(o.sw)o.sw.rotation.x=-this.steer*.55;
  if(o.bd&&o.bd.length){const heat=this.brk>.3&&this.spd>110?clamp((this.brk*this.spd)/280,0,1):0;const bh=heat>.55?0xff8c1a:heat>.15?0xd93800:0x221008;for(const m of o.bd)m.color.setHex(bh)}
  o.flap.rotation.z=-this.drsOpen*.65;o.fw.scale.z=1-.7*this.dmg;o.rl.color.setHex(this.brk>0?0xff2222:this.ersOn&&this.ers>0?0x66ccff:0x550000);o.tcm.color.setHex(TIRES[this.tire].c)}
}

class Game{
 constructor(){
  this.set={ev:.7,sv:.7,mu:false,shadows:true,detail:'high',gfx:'balanced',fov:75,steer:1,line:true,bsz:1.15,dbg:false};this.sel={team:0,tire:'M',track:0,laps:3,mode:0};
  const plat=this.plat=window.APEX_PLATFORM||null;
  const isMob=this.isMob=plat?!!plat.isMobile:('ontouchstart' in window||navigator.maxTouchPoints>0||Math.min(innerWidth,innerHeight)<=600);
  this.view=plat&&plat.defaultCam!=null?plat.defaultCam:1;this.keys={};this.sfx=new Sfx();this.sfx.ev=.7;this.sfx.sv=.7;this.sfx.mode='v8';this.sfx.mus=true;this.state='menu';this.cars=[];this.cam={a:0};this.laps=3;this.msgT=0;this.tick=0;this.acc=0;this.rtt=0;this.netHz=0;this._netCnt=0;this._netSec=0;this._pingT=0;
  const prof=this.prof=(plat&&plat.perf)||PERF_CFG[isMob?'mobile':'desktop'];
  const R=this.r=new THREE.WebGLRenderer({canvas:$('gl'),antialias:true,powerPreference:'high-performance'});R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFShadowMap;ANISO=Math.max(4,Math.min(prof.aniso,+R.capabilities.getMaxAnisotropy()||4));R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.15;
  $('gl').addEventListener('webglcontextlost',e=>{e.preventDefault();this.ctxLost=true;this.msg('GRAPHICS CONTEXT LOST · RESTORING…')},false);
  $('gl').addEventListener('webglcontextrestored',()=>{this.ctxLost=false;this.resize();this.clearFade();this.msg('GRAPHICS RESTORED')},false);
  {const es=new THREE.Scene(),eg=new THREE.SphereGeometry(50,24,16),ep=eg.attributes.position,ec=[],a1=new THREE.Color(0x82b4f2),a2=new THREE.Color(0xf5f8fc),a3=new THREE.Color(0x1b1e24),cc=new THREE.Color();
   for(let i=0;i<ep.count;i++){const y=ep.getY(i)/50;y>0?cc.copy(a2).lerp(a1,Math.pow(y,.55)):cc.copy(a2).lerp(a3,Math.min(1,-y*2.2));ec.push(cc.r,cc.g,cc.b)}eg.setAttribute('color',new THREE.Float32BufferAttribute(ec,3));
   es.add(new THREE.Mesh(eg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
   const hb=new THREE.Mesh(new THREE.CylinderGeometry(48,48,14,24,1,true),new THREE.MeshBasicMaterial({color:new THREE.Color(1.45,1.5,1.58),side:THREE.BackSide}));hb.position.y=6;es.add(hb);
   const sn=new THREE.Mesh(new THREE.SphereGeometry(9,10,8),new THREE.MeshBasicMaterial({color:new THREE.Color(9,8.6,7.8)}));sn.position.set(28,34,18);es.add(sn);
   this.env=new THREE.PMREMGenerator(R).fromScene(es,.018).texture}
  this.scene=new THREE.Scene();this.scene.environment=this.env;this.camera=new THREE.PerspectiveCamera(70,1,.5,18000);
  this.hemi=new THREE.HemisphereLight(0xdff0ff,0x355a36,1.0);this.sun=new THREE.DirectionalLight(0xfff1d6,1.55);this.sun.castShadow=true;this.sun.shadow.mapSize.set(prof.shadowSize,prof.shadowSize);
  const sc=this.sun.shadow.camera;sc.left=sc.bottom=-220;sc.right=sc.top=220;sc.near=10;sc.far=1400;this.sun.shadow.bias=-.0004;this.pl=new THREE.PointLight(0xfff0cc,0,900);
  this.scene.add(this.hemi,this.sun,this.sun.target,this.pl);
  this.sparks=new Parts(prof.sparks,0xffb43c,2.2);this.ersP=new Parts(prof.ersP,0x38b6ff,2.6);this.scene.add(this.sparks.m,this.ersP.m);
  const SK=1400,spp=new Float32Array(SK*12).fill(-9999),sI=[];for(let i=0;i<SK;i++)sI.push(i*4,i*4+1,i*4+2,i*4,i*4+2,i*4+3);const sgm=new THREE.BufferGeometry();sgm.setAttribute('position',new THREE.BufferAttribute(spp,3));sgm.setIndex(sI);
  this.skP=spp;this.skI=0;this.skD=false;this.skM=new THREE.Mesh(sgm,new THREE.MeshBasicMaterial({color:0x08080a,transparent:true,opacity:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide}));this.skM.frustumCulled=false;this.scene.add(this.skM);
  this.comp=null;this.useBloom=false;this.tunK=0;this._v1=new THREE.Vector3();this._v2=new THREE.Vector3();this._hudT=0;this._hs={};
  const resize=()=>{const w=Math.max(1,(window.visualViewport&&window.visualViewport.width)||innerWidth),h=Math.max(1,(window.visualViewport&&window.visualViewport.height)||innerHeight),g=this.set.gfx||'balanced',cap=g==='maxfps'?1:g==='ultra'?Math.min(2,this.prof.dprCap+.25):this.prof.dprCap;R.setPixelRatio(this.set.detail==='high'?Math.min(devicePixelRatio||1,cap):1);R.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();if(this.show){this.show.cam.aspect=w/h;this.show.cam.updateProjectionMatrix()}};
  this.resize=resize;addEventListener('resize',resize);addEventListener('orientationchange',()=>{setTimeout(resize,120);setTimeout(resize,360)});if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);resize();
  this.ui();this.loadP();this.syncSet();this.loadTrack(this.sel.track);this.spawnBG();this.makeShow();
  const joinQ=(new URLSearchParams(location.search).get('join')||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4);
  if(joinQ.length===4){this.go('gate');if($('code'))$('code').value=joinQ;$('mps').textContent='Invite code '+joinQ+' ready — press Join'}else this.go('main');
  addEventListener('keydown',e=>this.key(e,1));addEventListener('keyup',e=>this.key(e,0));
  this.last=performance.now();requestAnimationFrame(t=>this.loop(t));
 }
ui(){
  const S=this.set;this.hist=[];this.scr=null;this.flow={};this.cs=new Set([0]);this.mpf=null;this.showMode=false;this.screens=['main','mode','custom','team','driver','ready','gate','msetup','lobby','exit'];Object.assign(this.sel,{drv:0,sess:'race',sa:'low',ba:'low',ln:'corner',ea:'on',diff:'normal',mpai:'on',yr:2027,pname:'',eng:'v8'});setSeason(2027);this.sfx.mode='v8';
  if($('mpName'))$('mpName').oninput=e=>{this.sel.pname=e.target.value.trim().slice(0,14);this.saveP()};
  const chips=(el,arr,cls)=>{const k=el.dataset.k;arr.forEach(a=>{const b=document.createElement('button');b.className='btn sm'+(cls?' '+cls:'');b.innerHTML=a[1];if(a[2])b.style.cssText=a[2];b.dataset.v=a[0];b.onclick=()=>{this.sel[k]=a[0];if(k==='yr'){setSeason(a[0]);if(this.scr==='driver')this.driverUI()}if(k==='eng')this.sfx.mode=a[0];if(k==='tire'&&this.show&&this.show.cur&&this.show.cur.tcm)this.show.cur.tcm.color.setHex(TIRES[a[0]].c);this.mark();this.saveP();if(this.scr==='ready')this.readyUI()};el.append(b)})};
  const tMeta={S:'Max Grip · 1–2 Laps',M:'Balanced · 3–5 Laps',H:'Endurance · 6–10 Laps'};
  chips($('tires'),Object.keys(TIRES).map(k=>[k,`<span class="tc-top"><i class="tc-dot" style="background:${hex(TIRES[k].c)};color:${hex(TIRES[k].c)}"></i>${TIRES[k].n}</span><span class="tc-meta">${tMeta[k]}</span>`]),'tchip');
  for(const id of['lapc','lapr','lapm'])chips($(id),[[2,'2 laps'],[3,'3 laps'],[5,'5 laps'],[6,'6 laps']]);
  for(const id of['diffr','diffm','diffc'])if($(id))chips($(id),[['easy','Easy'],['normal','Normal'],['hard','Hard']]);
  for(const id of['yrd','yrc'])if($(id))chips($(id),[[2026,'2026'],[2027,'2027']]);
  if($('engc'))chips($('engc'),[['v10','V10 Scream'],['v8','V8 Growl'],['v6','V6 Hybrid']]);
  if($('mpaic'))chips($('mpaic'),[['on','On (Fill to '+TEAMS.length+')'],['off','Players only']]);
  chips($('sessc'),[['practice','Practice'],['quali','Qualifying'],['race','Race']]);
  for(const id of['sac','bac','sar','bar2'])chips($(id),[['off','Off'],['low','Low'],['high','High']]);
  for(const id of['lnc','lnr'])chips($(id),[['off','Off'],['corner','Corners'],['full','Full lap']]);for(const id of['eac','ear'])chips($(id),[['off','Off'],['on','Auto']]);
  const it=[...document.querySelectorAll('#nav .mi')];it.forEach((b,i)=>{b.onmouseenter=()=>this.nsel(it,i);b.onfocus=()=>this.nsel(it,i)});this.nsel(it,0);
  $('bSP').onclick=()=>{this.mpf=null;this.go('mode')};$('bMP').onclick=()=>{this.mpf=null;this.go('gate')};$('bST').onclick=()=>this.openSet('c');$('bHT').onclick=()=>this.openSet('h');$('bEX').onclick=()=>this.exit();$('xb').onclick=()=>{this.hist=[];this.go('main',true)};
  $('lnb').onclick=()=>this.setLine();if($('camb'))$('camb').onclick=()=>this.nextCam();if($('qF'))$('qF').onclick=()=>this.toggleFS();$('qS').onclick=()=>this.openSet('c');$('qB').onclick=()=>this.back();$('qM').onclick=()=>this.menuBtn();
  $('mGP').onclick=()=>{this.flow={mode:'gp'};this.sel.sess='race';this.go('team')};$('mCU').onclick=()=>{this.flow={mode:'custom'};this.go('custom')};
  $('cAll').onclick=()=>{TRACKS.forEach((_,i)=>this.cs.add(i));this.cgrid()};$('cNone').onclick=()=>{this.cs.clear();this.cgrid()};
  $('cNext').onclick=()=>{if(!this.cs.size){$('cnt').textContent='(select at least one)';return}this.flow={mode:'custom',queue:[...this.cs].sort((a,b)=>a-b)};this.go('team')};
  $('tPrev').onclick=()=>this.teamUI(-1,1);$('tNext').onclick=()=>this.teamUI(1,1);$('tOk').onclick=()=>this.go('driver');$('dOk').onclick=()=>this.driverDone();
  $('rp').onclick=()=>this.pickTrack(this.sel.track-1);$('rnx').onclick=()=>this.pickTrack(this.sel.track+1);$('rGo').onclick=()=>this.startSeries();
  $('mp1').onclick=()=>this.pickTrack(this.sel.track-1);$('mp2').onclick=()=>this.pickTrack(this.sel.track+1);$('mOk').onclick=()=>this.toLobby();
  $('gHost').onclick=()=>this.host();$('gJoin').onclick=()=>this.join($('code').value);$('gomp').onclick=()=>this.hostStart();
  if($('cpLink'))$('cpLink').onclick=()=>{const u=location.origin+location.pathname+'?join='+this.code;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).then(()=>{$('cpLink').textContent='✓ Link Copied!';setTimeout(()=>{if($('cpLink'))$('cpLink').textContent='📋 Copy Invite Link'},1800)}).catch(()=>prompt('Share this link:',u))}else prompt('Share this link:',u)};
  $('sx').onclick=()=>this.settings(false);document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x===b));for(const k of'cagh')$('t_'+k).hidden=k!==b.dataset.t});
  const syncTheme=()=>this.sfx.playTheme(this.state==='menu'?'intro':this.state==='done2'?'outro':'off');
  $('s_st').oninput=e=>{S.steer=+e.target.value;$('v_st').textContent=S.steer.toFixed(2);this.saveP()};if($('s_bsz'))$('s_bsz').oninput=e=>{S.bsz=+e.target.value;$('v_bsz').textContent=S.bsz.toFixed(2)+'x';document.documentElement.style.setProperty('--btn-sc',S.bsz);this.saveP()};if($('s_dbg'))$('s_dbg').onchange=e=>{S.dbg=e.target.checked;if($('netDbg'))$('netDbg').classList.toggle('on',!!S.dbg);this.saveP()};$('s_ev').oninput=e=>{this.sfx.ev=+e.target.value;this.saveP()};$('s_sv').oninput=e=>{this.sfx.sv=+e.target.value;syncTheme();this.saveP()};if($('s_mus'))$('s_mus').onchange=e=>{this.sfx.mus=e.target.checked;syncTheme();this.saveP()};$('s_mu').onchange=e=>{this.sfx.mu=e.target.checked;syncTheme();this.saveP()};
  $('s_sh').onchange=e=>{S.shadows=e.target.checked;this.r.shadowMap.enabled=S.shadows;this.sun.castShadow=S.shadows;this.scene.traverse(o=>{if(o.material)o.material.needsUpdate=true});this.saveP()};
  $('s_fov').oninput=e=>{S.fov=+e.target.value;$('v_fov').textContent=S.fov;this.saveP()};
  const det=d=>{S.detail=d;this.saveP();$('dl').classList.toggle('on',d==='low');$('dh').classList.toggle('on',d==='high');this.resize();if(this.state==='menu'){this.loadTrack(this.sel.track);this.spawnBG()}};$('dl').onclick=()=>det('low');$('dh').onclick=()=>det('high');
  if($('gfxc'))[...$('gfxc').children].forEach(b=>b.onclick=()=>{this.applyGfx(b.dataset.g,true)});
  $('pr').onclick=()=>this.pause(false);$('pc').onclick=()=>this.nextCam();$('ps').onclick=()=>this.openSet('c');$('pq').onclick=()=>this.quit();
  this.mark();
 }
 applyGfx(mode,save){
  const S=this.set,m=['maxfps','balanced','ultra'].includes(mode)?mode:'balanced';S.gfx=m;
  if($('gfxc'))[...$('gfxc').children].forEach(b=>{const on=b.dataset.g===m;b.classList.toggle('on',on);b.classList.toggle('is-selected',on)});
  const shOn=m!=='maxfps';S.shadows=shOn;if($('s_sh'))$('s_sh').checked=shOn;
  this.r.shadowMap.enabled=shOn;if(this.sun){this.sun.castShadow=shOn;const sz=m==='ultra'?(this.isMob?1024:2048):(this.isMob?512:1024);if(this.sun.shadow.mapSize.x!==sz){this.sun.shadow.mapSize.set(sz,sz);if(this.sun.shadow.map){this.sun.shadow.map.dispose();this.sun.shadow.map=null}}}
  this.r.shadowMap.type=m==='ultra'?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;
  if(this.camera){this.camera.far=m==='maxfps'?5500:18000;this.camera.updateProjectionMatrix()}
  this.scene.traverse(o=>{if(o.material)o.material.needsUpdate=true});
  this.resize();if(save)this.saveP();
 }
 saveP(){try{const S=this.set,e=this.sel;localStorage.setItem('apexgp3d.v3',JSON.stringify({v:3,set:{ev:this.sfx.ev,sv:this.sfx.sv,mu:!!this.sfx.mu,mus:this.sfx.mus!==false,shadows:!!S.shadows,detail:S.detail,gfx:S.gfx||'balanced',fov:S.fov,steer:S.steer,bsz:S.bsz||1.15,dbg:!!S.dbg},sel:{team:e.team,drv:e.drv,tire:e.tire,track:e.track,laps:e.laps,sess:e.sess,sa:e.sa,ba:e.ba,ea:e.ea,ln:e.ln,diff:e.diff,mpai:e.mpai,yr:e.yr,pname:e.pname||'',eng:e.eng||'v8'}}))}catch(x){}}
 loadP(){let d=null;try{d=JSON.parse(localStorage.getItem('apexgp3d.v3')||'null')}catch(x){return}if(!d||typeof d!=='object')return;
  try{const S=this.set,e=this.sel,o=d.set||{},s=d.sel||{},n=(v,a,b,df)=>typeof v==='number'&&isFinite(v)?clamp(v,a,b):df,pk=(v,A,df)=>A.includes(v)?v:df;
   S.fov=Math.round(n(o.fov,60,100,S.fov));S.steer=n(o.steer,.5,1.5,S.steer);S.bsz=n(o.bsz,.8,1.4,1.15);S.dbg=!!o.dbg;S.gfx=pk(o.gfx,['maxfps','balanced','ultra'],'balanced');S.shadows=typeof o.shadows==='boolean'?o.shadows:(S.gfx!=='maxfps');S.detail=pk(o.detail,['low','high'],S.detail);
   this.sfx.ev=n(o.ev,0,1,this.sfx.ev);this.sfx.sv=n(o.sv,0,1,this.sfx.sv);this.sfx.mu=!!o.mu;this.sfx.mus=o.mus!==false;if($('s_mus'))$('s_mus').checked=this.sfx.mus;
   e.team=Math.round(n(s.team,0,TEAMS.length-1,e.team));e.drv=Math.round(n(s.drv,0,1,e.drv));e.tire=pk(s.tire,Object.keys(TIRES),e.tire);e.track=Math.round(n(s.track,0,TRACKS.length-1,e.track));e.laps=pk(s.laps,[2,3,5,6],e.laps);
   e.sess=pk(s.sess,['practice','quali','race'],e.sess);e.sa=pk(s.sa,['off','low','high'],'low');e.ba=pk(s.ba,['off','low','high'],'low');e.ea=pk(s.ea,['on','off'],'on');e.ln=pk(s.ln,['full','corner','off'],'corner');e.diff=pk(s.diff,['easy','normal','hard'],'normal');e.mpai=pk(s.mpai,['on','off'],'on');e.yr=pk(+s.yr,[2026,2027],2027);e.eng=pk(s.eng,['v10','v8','v6'],'v8');this.sfx.mode=e.eng;e.pname=typeof s.pname==='string'?s.pname.slice(0,14):'';if($('mpName'))$('mpName').value=e.pname;setSeason(e.yr)}catch(x){console.warn('settings restore failed',x)}}
 syncSet(){try{const S=this.set,v=(id,x)=>{const e=$(id);if(e)e.value=x},t=(id,x)=>{const e=$(id);if(e)e.textContent=x};v('s_st',S.steer);t('v_st',S.steer.toFixed(2));v('s_bsz',S.bsz||1.15);t('v_bsz',(S.bsz||1.15).toFixed(2)+'x');document.documentElement.style.setProperty('--btn-sc',S.bsz||1.15);if($('s_dbg'))$('s_dbg').checked=!!S.dbg;if($('netDbg'))$('netDbg').classList.toggle('on',!!S.dbg);v('s_ev',this.sfx.ev);v('s_sv',this.sfx.sv);v('s_fov',S.fov);t('v_fov',S.fov);
   const cb=$('camb');if(cb)cb.textContent='Cam: '+['Chase','Close 3P','T-Cam','Halo','Eagle'][this.view]+' (C)';
   $('s_mu').checked=!!this.sfx.mu;this.applyGfx(S.gfx||'balanced',false);$('s_sh').checked=!!S.shadows;this.r.shadowMap.enabled=!!S.shadows;if(this.sun)this.sun.castShadow=!!S.shadows;$('dl').classList.toggle('on',S.detail==='low');$('dh').classList.toggle('on',S.detail==='high');this.resize();this.mark()}catch(x){console.warn(x)}}
 mark(){document.querySelectorAll('.chips[data-k]').forEach(c=>[...c.children].forEach(b=>{const on=String(this.sel[c.dataset.k])===b.dataset.v;b.classList.toggle('on',on);b.classList.toggle('is-selected',on)}))}
 go(n,back){this.saveP();if(n&&this.scr&&this.scr!==n&&!back)this.hist.push(this.scr);this.scr=n;for(const s of this.screens)$('s_'+s).classList.toggle('on',s===n);this.showMode=n==='team'||n==='driver';
  if(n==='team')this.teamUI(0);if(n==='driver')this.driverUI();if(n==='ready'||n==='msetup'){this.syncTrack();this.trackUI();if(n==='ready')this.readyUI()}if(n==='lobby')this.lobby();if(n==='custom')this.cgrid();this.qbar()}
 back(){if(this.state!=='menu'){this.pause();return}const p=this.hist.pop();if(p==='gate'||p==='main'){this.netClose();this.mpf=null}if(p)this.go(p,true);else if(this.scr&&this.scr!=='main')this.go('main',true)}
 menuBtn(){if(this.state!=='menu'){this.quit();return}if(this.scr==='main')this.exit();else{this.netClose();this.mpf=null;this.hist=[];this.go('main',true)}}
 exit(){this.go('exit');try{window.close()}catch(e){}}
 qbar(){const r=this.state!=='menu',m=this.scr==='main';$('qB').textContent=r?'⏸ Pause':'‹ Back';$('qB').disabled=!r&&(m||!this.scr||this.scr==='exit');$('qM').textContent=r||m?'✕ Exit':'⌂ Menu';$('qb').style.display=this.scr||r?'flex':'none'}
 settings(on){$('set').style.display=on?'flex':'none'}
 openSet(tab){this.settings(true);document.querySelector('.tabs [data-t="'+tab+'"]').click()}
 nsel(it,i){it.forEach((b,j)=>b.classList.toggle('sel',j===i));$('nd').textContent=it[i].dataset.d}
 navKey(e){const k=e.key,it=[...document.querySelectorAll('#nav .mi')],i=Math.max(0,it.findIndex(b=>b.classList.contains('sel')));
  if(k==='ArrowDown'||k==='ArrowUp'){this.nsel(it,(i+(k==='ArrowDown'?1:-1)+it.length)%it.length);e.preventDefault();return true}if(k==='Enter'){it[i].click();e.preventDefault();return true}return false}
 key(e,dn){if(e.target.tagName==='INPUT')return;const k=e.key.toLowerCase(),M={w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right',' ':'ers'};
  if(dn&&this.outro&&(k===' '||k==='enter')){this.outro=null;this.results();return}
  if(dn&&this.scr==='main'&&this.state==='menu'&&$('set').style.display==='none'&&this.navKey(e))return;
  if(M[k]){this.keys[M[k]]=dn;if(k.startsWith('arrow')||k===' ')e.preventDefault()}if(!dn)return;
  if(k==='escape'){if($('set').style.display!=='none')this.settings(false);else if(this.state==='menu')this.back();else this.pause();return}
  if(k==='f3'){e.preventDefault();this.set.dbg=!this.set.dbg;if($('s_dbg'))$('s_dbg').checked=this.set.dbg;if($('netDbg'))$('netDbg').classList.toggle('on',this.set.dbg);return}
  if(k==='c'&&this.state!=='menu')this.nextCam();
  if(k==='m'){this.sfx.mu=!this.sfx.mu;$('s_mu').checked=this.sfx.mu;this.saveP();if(this.state!=='menu')this.msg(this.sfx.mu?'SOUND: MUTED':'SOUND: ON')}
  if(k==='l')this.setLine();
  if(k==='p')this.pause();
  if(this.P&&this.state==='race'&&'123'.includes(k)&&k.length==1){this.nextTire=['S','M','H'][k-1];this.msg('NEXT PIT TYRE: '+TIRES[this.nextTire].n)}}
 msg(t){$('msg').textContent=t;this.msgT=3.2}
 snapBox(c,dt){const T=this.T,b=(pitBox(c.team)+T.N)%T.N,o=79+T.S,tx=T.x[b]-T.ty[b]*o,ty=T.y[b]+T.tx[b]*o,k=Math.min(1,dt*5);c.x+=(tx-c.x)*k;c.y+=(ty-c.y)*k;c.a+=angd(T.h[b],c.a)*k}
 mkBeacon(){const g=new THREE.Group(),mt=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}),cy=new THREE.CylinderGeometry(5,5,260,20,1,true);cy.translate(0,130,0);const b=new THREE.Mesh(cy,mt),rg=new THREE.Mesh(new THREE.RingGeometry(11,15,32),mt.clone());rg.rotation.x=-Math.PI/2;rg.position.y=.6;g.add(b,rg);g.visible=false;g.frustumCulled=false;this.scene.add(g);return {g,mt,rg}}
 pitAid(P,pu,dt){const B=this.beacon||(this.beacon=this.mkBeacon()),T=this.T,on=P.inPit&&!P.pitDone&&this.state==='race'&&!!this.P;B.g.visible=on;if(!on){this.gT=0;return}
  const b=(pitBox(P.team)+T.N)%T.N,o=79+T.S,col=TEAMS[P.team].c;B.mt.color.setHex(col);B.rg.material.color.setHex(col);B.g.position.set(T.x[b]-T.ty[b]*o,T.ey[b],T.y[b]+T.tx[b]*o);this.bT=(this.bT||0)+dt;B.mt.opacity=.2+.14*Math.sin(this.bT*5);B.rg.scale.setScalar(1+.12*Math.sin(this.bT*5));
  this.gT=(this.gT||0)-dt;if(this.gT>0||this.pit||P.pitDone)return;this.gT=.2;const dm=(pitBox(P.team)-pu)*3.6,a=Math.abs(dm)|0;
  this.msg(this.pitAuto===1?`PIT AUTOPILOT · BOX IN ${a} m · ${Math.round(P.spd*.72)} KM/H`:dm>9?`PIT BOX AHEAD ${a} m · ${Math.round(P.spd*.72)} km/h`:dm<-9?`OVERSHOT BY ${a} m`:P.spd>=28?'IN THE BOX ZONE · BRAKE TO STOP':'STOPPING…')}
 rel(c){const s=48;c.vx=Math.cos(c.a)*s;c.vy=Math.sin(c.a)*s}
 flash(c){const f=[Math.cos(c.a),Math.sin(c.a)];for(let i=0;i<16;i++)this.sparks.emit(c.x+f[0]*19,c.ey+4,c.y+f[1]*19,rnd(-60,60),rnd(30,110),rnd(-60,60),.5)}
 crewRig(c){const tm=TEAMS[c.team],g=new THREE.Group(),suit=sm(tm.c,.55,.15),acc=sm(tm.d,.4,.2),dark=sm(0x15161a,.65,.2),wh=sm(0xf4f6f9,.3,.2),vis=sm(0x090b10,.08,.9,.95),R={g,m:[],nt:new THREE.MeshBasicMaterial({color:0xffffff}),ot:new THREE.MeshBasicMaterial({color:0x111111}),t:0};
  // Proportioned humanoid pit mechanic (legs, torso, chest stripe, arms, helmet + dark visor)
  const man=(x,z,face,tyre)=>{const m=new THREE.Group();m.position.set(x,0,z);m.rotation.y=face;
   for(const lx of[-.65,.65]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.42,.38,3.6,6),dark);leg.position.set(lx,1.8,0);m.add(leg)}
   const torso=new THREE.Mesh(new THREE.BoxGeometry(2.3,3.2,1.5),suit);torso.position.y=5.1;torso.castShadow=true;m.add(torso);
   const stripe=new THREE.Mesh(new THREE.BoxGeometry(2.38,.55,1.56),acc);stripe.position.y=5.6;m.add(stripe);
   const h=new THREE.Mesh(new THREE.SphereGeometry(1.15,10,8),wh);h.position.y=7.7;m.add(h);
   const vs=new THREE.Mesh(new THREE.BoxGeometry(1.45,.45,.65),vis);vs.position.set(0,7.75,.88);m.add(vs);
   for(const ax of[-1.4,1.4]){const arm=new THREE.Mesh(new THREE.CylinderGeometry(.32,.28,2.6,6),suit);arm.position.set(ax,5.3,1.0);arm.rotation.x=Math.PI*.36;m.add(arm)}
   if(tyre){const t=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.2,2.6,14),R.nt);t.rotation.x=Math.PI/2;t.position.set(0,4.2,2.9);m.add(t);m.userData.tyre=t}
   else{const gn=new THREE.Mesh(new THREE.BoxGeometry(.9,1.0,3.2),dark);gn.position.set(0,4.9,2.4);m.add(gn)}
   g.add(m);R.m.push(m);return m};
  for(const [x,zs] of [[11,1],[-11.5,1]])for(const s of [-1,1]){man(x,s*(zs*14),s>0?-Math.PI/2:Math.PI/2,false);man(x+(x>0?5:-5),s*19,s>0?-Math.PI/2:Math.PI/2,true)}
  man(27,0,Math.PI,false);man(-27,0,0,false);man(24,-9,Math.PI,false);
  const lp=man(34,0,Math.PI,false);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,11,6),dark);pole.position.set(0,7,-3);lp.add(pole);const sg=R.sg=new THREE.Mesh(new THREE.CircleGeometry(3.4,16),new THREE.MeshBasicMaterial({color:0xff2222,side:THREE.DoubleSide}));sg.position.set(0,12,-3);lp.add(sg);
  g.visible=false;this.scene.add(g);return R}
 crewUpd(dt){this.crews=this.crews||new Map();for(const c of this.cars){let hold=c.isP?!!this.pit:c.pitS===3&&c.hold;let R=this.crews.get(c);if(!hold){if(R&&R.g.visible){R.g.visible=false;R.t=0}continue}
  if(!R){R=this.crewRig(c);this.crews.set(c,R)}const p=c.isP?this.pit.t/3:c.pitT/Math.max(.1,c.stopFor);R.t+=dt;R.g.visible=true;R.g.position.set(c.x,c.ey,c.y);R.g.rotation.y=-c.a;const k=Math.min(1,R.t*6);R.g.scale.set(1,.25+.75*k,1);
  R.nt.color.setHex(TIRES[c.isP?this.nextTire:c.tire].c);
  // Crew rush-in (0..0.15), wheel gun vibration + sparks (0.15..0.65), step back on release (0.85..1.0)
  const slide=p<.15?(1-p/.15)*4.5:p>.85?((p-.85)/.15)*4.5:0;
  R.m.forEach((m,i)=>{if(m.userData.bx==null){m.userData.bx=m.position.x;m.userData.bz=m.position.z}const sd=Math.sign(m.userData.bz)||1;
   if(Math.abs(m.userData.bz)>5)m.position.z=m.userData.bz+sd*slide;
   const w=Math.sin(R.t*42+i*2)*(p>.14&&p<.65?.14:.025);m.rotation.z=w;
   if(m.userData.tyre)m.userData.tyre.visible=p<.55||p>.88});
  if(p>.16&&p<.62&&Math.random()<.35){const wx=c.x+rnd(-12,12),wz=c.y+rnd(-8,8);this.sparks.emit(wx,c.ey+3.2,wz,rnd(-35,35),rnd(15,55),rnd(-35,35),.32)}
  R.sg.material.color.setHex(p>.88?0x22dd55:0xff2222)}}
 pause(on){if(on===undefined)on=$('pm').style.display==='none';if(on){if(!['race','lights'].includes(this.state)&&this.state!=='paused')return;if(!this.mp&&this.state!=='paused'){this.ps=this.state;this.state='paused'}$('pm').style.display='flex';this.sfx.silenceRace()}else{if(this.state==='paused')this.state=this.ps;$('pm').style.display='none'}}
 toggleFS(){const d=document,el=d.documentElement,fs=d.fullscreenElement||d.webkitFullscreenElement;try{if(!fs){const req=el.requestFullscreen||el.webkitRequestFullscreen;if(req)req.call(el).catch(()=>{});else this.msg('TIP: USE "ADD TO HOME SCREEN" FOR FULLSCREEN')}else{const ex=d.exitFullscreen||d.webkitExitFullscreen;if(ex)ex.call(d).catch(()=>{})}}catch(e){}}
 setLine(v){const O=['full','corner','off'];this.sel.ln=v||O[(O.indexOf(this.sel.ln)+1)%3];this.mark();this.lnTxt();this.saveP()}
 lnTxt(){$('lnb').textContent='Line: '+({off:'Off',corner:'Corners',full:'Full lap'}[this.sel.ln]||'')+' (L)'}
 clearFade(){const f=$('fade');if(f){f.style.opacity=0;f.style.pointerEvents='none'}this.fading=false;if(this._ft){clearTimeout(this._ft);this._ft=null}}
 fade(fn){if(this.fading){try{fn()}catch(e){this.err(e)}this.clearFade();return}this.fading=true;const f=$('fade');if(f){f.style.pointerEvents='auto';f.style.opacity=1}
  clearTimeout(this._ft);this._ft=setTimeout(()=>this.clearFade(),900);
  setTimeout(()=>{try{fn()}catch(e){this.err(e)}finally{requestAnimationFrame(()=>setTimeout(()=>this.clearFade(),80))}},260)}
 mmBuild(){const T=this.T,S=300,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');let x0=1e18,x1=-1e18,y0=1e18,y1=-1e18;
  for(let i=0;i<T.N;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);y0=Math.min(y0,T.y[i]);y1=Math.max(y1,T.y[i])}
  const k=(S-40)/Math.max(x1-x0,y1-y0,1),ox=(S-(x1-x0)*k)/2-x0*k,oy=(S-(y1-y0)*k)/2-y0*k,path=(a,b)=>{x.beginPath();for(let i=a;i<=b;i+=2){const j=i%T.N,X=T.x[j]*k+ox,Y=T.y[j]*k+oy;i===a?x.moveTo(X,Y):x.lineTo(X,Y)}};
  x.lineJoin=x.lineCap='round';x.strokeStyle='rgba(0,0,0,.75)';x.lineWidth=13*T.hw/54;path(0,T.N);x.closePath();x.stroke();x.strokeStyle='#e8ecf4';x.lineWidth=7*T.hw/54;path(0,T.N);x.closePath();x.stroke();x.strokeStyle='#1a1f2c';x.lineWidth=4*T.hw/54;path(0,T.N);x.closePath();x.stroke();
  x.strokeStyle='#3cff8c';x.lineWidth=4;x.lineCap='butt';for(const z of T.dz){path(z[0],z[1]);x.stroke()}
  const X=T.x[0]*k+ox,Y=T.y[0]*k+oy;x.save();x.translate(X,Y);x.rotate(T.h[0]);x.fillStyle='#ff3b30';x.fillRect(-2,-9,4,18);x.restore();
  this.mm={c,k,ox,oy,T}}
 mmDraw(){const cv=$('mm'),P=this.P;if(!cv||!P||!cv.getContext)return;if(!this.mm||this.mm.T!==this.T)this.mmBuild();const m=this.mm,x=cv.getContext('2d'),W=cv.width,q=W/300;
  x.clearRect(0,0,W,W);x.drawImage(m.c,0,0,W,W);
  for(const c of this.cars){if(c===P)continue;x.fillStyle=hex(TEAMS[c.team].c);x.beginPath();x.arc((c.x*m.k+m.ox)*q,(c.y*m.k+m.oy)*q,3,0,TAU);x.fill();x.strokeStyle='rgba(0,0,0,.85)';x.lineWidth=1;x.stroke()}
  x.save();x.translate((P.x*m.k+m.ox)*q,(P.y*m.k+m.oy)*q);x.rotate(P.a);x.fillStyle='#ff3b30';x.strokeStyle='#fff';x.lineWidth=1.6;x.beginPath();x.moveTo(8,0);x.lineTo(-5,-5.5);x.lineTo(-3,0);x.lineTo(-5,5.5);x.closePath();x.fill();x.stroke();x.restore()}
 aiPit(c,dt,u){const T=this.T,bx=pitBox(c.team);
  if(c.pitS===0){if(c.pits<3&&c.lap>=0&&c.lap<this.laps-1&&c.lastPitLap!==c.lap&&(c.wear>c.pitAt||c.dmg>.45)&&u>=-T.pe-45&&u<-T.pe-4&&c.spd>60){c.pitS=1;c.pitT=0}}
  else{c.pitT+=dt;
   if(c.pitS===1&&c.inPit)c.pitS=2;
   if(c.pitS===2){const dist=(bx-u)*18;if(c.inPit&&((dist<10&&c.spd<26)||dist<-70)){c.pitS=3;c.pitT=0;c.stopFor=2.6+Math.random()*1.4;c.vx=c.vy=0}}
   else if(c.pitS===3){const p=c.pitT/c.stopFor,rem=this.laps-c.lap;if(!c.swp&&p>=.5){c.swp=1;Object.assign(c,{wear:0,tire:rem>=5?'H':rem>=3?'M':'S',warm:.3})}if(c.dmg>0&&p>=.65){c.dmg=0;this.flash(c)}if(c.pitT>=c.stopFor){c.swp=0;c.dmg=0;c.pitDone=true;c.pits++;c.lastPitLap=c.lap;c.pitS=4;c.pitT=0;this.rel(c)}}
   else if(c.pitS===4){if((u>T.px&&!c.inPit)||c.pitT>25)c.pitS=0}
   if((c.pitS===1||c.pitS===2)&&c.pitT>45)c.pitS=0}
  c.hold=c.pitS===3}
 quit(){this.fade(()=>this.quitNow())}
 cleanRun(){for(const k in this.keys)this.keys[k]=false;this.pit=null;this.pitAuto=0;this.outro=null;this.doneT=-1;this.lastGear=null;this.acc=0;this.sfx.silenceRace();if(this.skP){this.skP.fill(-9999);this.skD=true}if(this.sparks){this.sparks.p.fill(-9999);this.sparks.t.fill(0)}if(this.ersP){this.ersP.p.fill(-9999);this.ersP.t.fill(0)}if(this.camera){this.camera.clearViewOffset();this.camera.fov=this.set.fov;this.camera.updateProjectionMatrix()}if($('res')){$('res').classList.remove('split');$('res').style.display='none'}if($('winBadge'))$('winBadge').style.display='none';if(this.trophy){this.scene.remove(this.trophy);this.trophy=null}this.wasPit=false;this.wn=0;this.yel=0;this.gT=0;if(this.beacon)this.beacon.g.visible=false;if(this.crews)this.crews.forEach(r=>{r.g.visible=false;r.t=0});$('msg').textContent='';const sv=$('svc');if(sv)sv.style.display='none';document.querySelectorAll('.tb.p,.is-pressed').forEach(e=>e.classList.remove('p','is-pressed'))}
 quitNow(){this.cleanRun();this.wasPit=false;$('pm').style.display='none';$('res').style.display='none';this.netClose();$('hud').style.display='none';this.state='menu';this.P=null;this.ser=null;this.mpf=null;this.hist=[];this.loadTrack(this.sel.track);this.spawnBG();this.sfx.silenceRace();this.sfx.playTheme('intro');this.go('main',true)}
 /* ---- showcase (team / driver pages) ---- */
 makeShow(){const sc=new THREE.Scene();sc.background=new THREE.Color(0x06080d);sc.environment=this.env;const cam=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.5,600);cam.position.set(0,20,82);cam.lookAt(0,5,0);
  sc.add(new THREE.HemisphereLight(0xffffff,0x1a1d28,.7));const a=new THREE.DirectionalLight(0xffffff,1.5);a.position.set(40,70,50);sc.add(a);const b=new THREE.DirectionalLight(0xff5a4a,.8);b.position.set(-60,25,-40);sc.add(b);
  const fl=new THREE.Mesh(new THREE.CylinderGeometry(70,70,1,64),new THREE.MeshStandardMaterial({color:0x11141c,roughness:.35,metalness:.6}));fl.position.set(18,-.5,0);sc.add(fl);
  const rg=new THREE.Mesh(new THREE.TorusGeometry(70,.7,8,80),new THREE.MeshBasicMaterial({color:0xff3b30}));rg.rotation.x=Math.PI/2;rg.position.x=18;sc.add(rg);this.show={sc,cam,fl,rg,cur:null,old:null,t:1,dir:1,rot:0}}
 showX(){return innerHeight<=500?25:16}
 showCar(team,dir){const s=this.show,cx=this.showX(),dNum=(DR[team]&&DR[team][this.sel.drv||0])?DR[team][this.sel.drv||0][1]:1,o=mkCar(TEAMS[team],this.sel.tire,dNum);o.g.scale.setScalar(innerHeight<=500?1.32:1.5);s.sc.add(o.g);if(s.old)s.sc.remove(s.old.g);s.old=s.cur;s.cur=o;s.dir=dir||0;s.t=dir?0:1;s.rg.material.color.setHex(TEAMS[team].c);s.rg.position.x=s.fl.position.x=cx;
  if(!dir&&s.old){s.sc.remove(s.old.g);s.old=null}o.g.position.set(cx+(dir?dir*95:0),0,0)}
 showStep(dt){const s=this.show,cx=this.showX();s.rg.position.x=s.fl.position.x=cx;s.rot+=dt*.5;if(s.t<1){s.t=Math.min(1,s.t+dt*2.2);const e=1-Math.pow(1-s.t,3);if(s.cur)s.cur.g.position.x=cx+s.dir*95*(1-e);if(s.old)s.old.g.position.x=cx-s.dir*95*e;if(s.t>=1&&s.old){s.sc.remove(s.old.g);s.old=null}}else if(s.cur)s.cur.g.position.x=cx;
  if(s.cur)s.cur.g.rotation.y=Math.PI*.2+s.rot;if(s.old)s.old.g.rotation.y=Math.PI*.2+s.rot}
 teamUI(d,anim){const n=TEAMS.length;if(d)this.sel.team=(this.sel.team+d+n)%n;const t=TEAMS[this.sel.team],e=$('tinf');e.classList.remove('sl','sr');void e.offsetWidth;e.classList.add(d>=0?'sl':'sr');
  $('tcnt').textContent=`TEAM ${this.sel.team+1} / ${n}`;$('tnm').textContent=t.n;$('tco').textContent=t.co;$('tsw').innerHTML=`<i style="background:${hex(t.c)}"></i><i style="background:${hex(t.d)}"></i>`;
  $('tbars').innerHTML=[['Pace',t.s],['Cornering',t.s-.01+.01*((this.sel.team*7)%3)],['Reliability',.9+((this.sel.team*3)%5)/50]].map(b=>`<div class="bl"><span>${b[0]}</span><div class="bar"><i style="width:${Math.round(clamp((b[1]-.85)/.12,.05,1)*100)}%"></i></div></div>`).join('');this.showCar(this.sel.team,anim?d:0)}
 driverUI(){const t=TEAMS[this.sel.team],el=$('dcards');el.innerHTML='';$('dsub').textContent=t.n+' · Select driver';
  DR[this.sel.team].forEach((d,i)=>{const b=document.createElement('button');b.className='dcard'+(this.sel.drv===i?' on is-selected':'');const c=document.createElement('canvas');c.width=170;c.height=210;drawDrv(c,t,d,i);b.insertAdjacentHTML('beforeend','<span class="sel-tag">✓ SELECTED</span>');b.append(c);b.insertAdjacentHTML('beforeend',`<b>${d[0]}</b><small>#${d[1]} · ${d[2]}</small>`);b.onclick=()=>{this.sel.drv=i;this.driverUI()};el.append(b)});this.showCar(this.sel.team,0);this.mark()}
 driverDone(){if(this.mpf==='host')this.go('msetup');else if(this.mpf==='guest'){this.sendHello();this.go('lobby')}else this.go('ready')}
 cgrid(){const g=$('cgrid');g.innerHTML='';TRACKS.forEach((d,i)=>{const b=document.createElement('button');b.className='tcard'+(this.cs.has(i)?' on':'');const c=document.createElement('canvas');c.width=120;c.height=70;drawTrk(c,d);b.append(c);
  b.insertAdjacentHTML('beforeend',`<b>${d.n.replace('Circuit de ','').replace('Autodromo ','').replace(' International','').replace(' Circuit','')}</b><small>${d.len.toFixed(2)} km</small>`);b.onclick=()=>{this.cs.has(i)?this.cs.delete(i):this.cs.add(i);this.cgrid()};g.append(b)});$('cnt').textContent=`(${this.cs.size} selected)`;this.mark()}
 syncTrack(){if(this.curTrack!==this.sel.track){this.loadTrack(this.sel.track);this.spawnBG()}}
 pickTrack(i){i=(i%TRACKS.length+TRACKS.length)%TRACKS.length;this.sel.track=i;this.syncTrack();this.trackUI()}
 trackUI(){const d=TRACKS[this.sel.track];for(const q of[['rmc','rn','ri'],['mmc','mn','mi']]){drawTrk($(q[0]),d);$(q[1]).textContent=d.n;$(q[2]).textContent=d.cc+' · '+d.len.toFixed(2)+' km'}}
 readyUI(){const gp=this.flow.mode==='gp',t=TEAMS[this.sel.team],d=DR[this.sel.team][this.sel.drv],q=this.flow.queue||[];$('rcar').style.display=gp?'':'none';
  $('rlist').innerHTML=gp?'':'<h4>Calendar</h4>'+q.map((i,k)=>`<div>${k+1}. ${TRACKS[i].n}</div>`).join('');
  $('rteam').innerHTML=`<span style="color:${hex(t.c)}">■</span> ${t.n}`;$('rdrv').textContent=`Driver #${d[1]} ${d[0]}`;$('rses').textContent={practice:'Practice',quali:'Qualifying',race:'Race'}[this.sel.sess]+' · '+this.sel.laps+' laps · AI: '+(this.sel.diff||'normal').toUpperCase();$('rGo').textContent=gp?'Start Grand Prix':'Start event';this.mark()}
 toLobby(){const nm=(this.sel.pname||'').trim()||DR[this.sel.team][this.sel.drv][0];if(!this.roster.some(r=>r.id===0))this.roster.unshift({id:0,team:this.sel.team,tire:this.sel.tire,drv:this.sel.drv,name:nm});this.go('lobby');this.lobby(true)}

 /* ---------- world ---------- */
 loadTrack(ix){
  this.skP.fill(-9999);this.skD=true;
  if(this.pylon&&this.pylon.tx){this.pylon.tx.dispose();this.pylon=null}
  if(this.dome&&this.dome.material&&this.dome.material.map){this.dome.material.map.dispose();this.dome=null}
  if(this.root){this.root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(m&&!Object.values(MC).includes(m)&&!Object.values(SM).includes(m)){if(m.map&&!Object.values(TX).includes(m.map))m.map.dispose();m.dispose()}})}});this.scene.remove(this.root)}
  this.mm=null;this.rl=null;this.crowdWaves=[];this.nSt=0;this.nGa=[];this.nPad=0;this.flagM=null;this.gantryBulbs=null;this.curTrack=ix;const def=TRACKS[ix],cfg=trackCfg(def.id),R=this.root=new THREE.Group();this.scene.add(R);
  const T=this.T=new Track(def),N=T.N,hw=T.hw,S=T.S,hi=this.set.detail==='high',f=this.isMob?.5:(hi?1:.45),night=!!def.night,bw=def.bw,gv=def.gv,gy=T.gy,st=gv>1e8;
  const sg=new THREE.SphereGeometry(12000,24,16),c1=new THREE.Color(def.sky[0]),c2=new THREE.Color(def.sky[1]);
  // Universal seamless procedural sky dome from shared TRACK_THEMES (zero UV seam on all 9 circuits)
  {const scv=document.createElement('canvas');scv.width=1024;scv.height=512;const sx=scv.getContext('2d');
   const SKY=cfg.sky||['#2468c6','#5b9ee4','#bdddf4','#f3e5cc','#345a32',34,.55,280];
   const grd=sx.createLinearGradient(0,0,0,512);grd.addColorStop(0,SKY[0]);grd.addColorStop(.28,SKY[1]);grd.addColorStop(.46,SKY[2]);grd.addColorStop(.52,SKY[3]);grd.addColorStop(.64,SKY[4]);grd.addColorStop(1,SKY[4]);
   sx.fillStyle=grd;sx.fillRect(0,0,1024,512);
   if(!night){
    const drawSun=ox=>{const sunG=sx.createRadialGradient(ox,165,6,ox,165,170);sunG.addColorStop(0,'rgba(255,252,235,1)');sunG.addColorStop(.14,'rgba(255,238,190,.75)');sunG.addColorStop(.45,'rgba(255,220,165,.18)');sunG.addColorStop(1,'rgba(255,220,165,0)');sx.fillStyle=sunG;sx.fillRect(ox-175,0,350,340)};
    drawSun(SKY[7]);drawSun(SKY[7]-1024);drawSun(SKY[7]+1024);
   }
   for(let cl=0;cl<SKY[5];cl++){const cx=Math.random()*1024,cy=130+Math.random()*115,cw=44+Math.random()*95,ch=12+Math.random()*24;
    for(let p=0;p<6;p++){const px=cx+(Math.random()-.5)*cw,py=cy+(Math.random()-.5)*ch,pr=10+Math.random()*24;
     for(const wx of[px-1024,px,px+1024]){if(wx+pr<0||wx-pr>1024)continue;const cg=sx.createRadialGradient(wx,py-pr*.2,pr*.1,wx,py,pr);
      cg.addColorStop(0,`rgba(255,253,248,${SKY[6]})`);cg.addColorStop(.6,`rgba(225,236,248,${SKY[6]*.5})`);cg.addColorStop(1,'rgba(220,235,250,0)');sx.fillStyle=cg;sx.beginPath();sx.arc(wx,py,pr,0,TAU);sx.fill()}}}
   const skyTex=new THREE.CanvasTexture(scv);skyTex.wrapS=THREE.RepeatWrapping;skyTex.wrapT=THREE.ClampToEdgeWrapping;
   this.dome=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,fog:false,toneMapped:false}));R.add(this.dome);
   c2.set(SKY[2]);
  }
  const fogCol=cfg.fog!=null?new THREE.Color(cfg.fog):c2;
  this.scene.fog=new THREE.Fog(fogCol,night?1300:1500,night?5200:9800);this.scene.background=c2.clone();
  if($('gl'))$('gl').style.filter=cfg.grade;
  this.hemi.intensity=this.baseHemi=night?.9:def.id==='spa'?1.05:1.15;this.r.toneMappingExposure=night?1.24:1.22;this.hemi.color.set(night?0x8aa0ff:0xecf4ff);this.hemi.groundColor.set(night?0x222638:0x2d4830);this.sun.intensity=this.baseSun=night?.62:def.id==='spa'?1.42:1.72;this.sun.color.set(night?0x9fb4ff:0xfff6e6);this.pl.intensity=this.basePl=night?1.25:0;this.tunK=0;for(const q in SM)SM[q].envMapIntensity=night?.75:1.85;
  const gndCol=cfg.turf||(def.bg||def.gnd);
  mkTX();
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(36000,36000),new THREE.MeshLambertMaterial({color:gndCol,map:cfg.turf?TX.g:null}));if(cfg.turf)TX.g.repeat.set(90,90);gnd.rotation.x=-Math.PI/2;gnd.position.y=gy-.5;gnd.receiveShadow=true;R.add(gnd);
  const ew=new Float32Array(N);{const raw=[];for(let i=0;i<N;i++){let m=1e18;for(let j=0;j<N;j+=2){const k=Math.min((j-i+N)%N,(i-j+N)%N);if(k<90)continue;const dx=T.x[i]-T.x[j],dz=T.y[i]-T.y[j],d=dx*dx+dz*dz;if(d<m)m=d}raw.push(Math.sqrt(m))}
   for(let i=0;i<N;i++){let m=1e18;for(let q=-12;q<=12;q++)m=Math.min(m,raw[(i+q+N)%N]);ew[i]=clamp((m-2*bw)/2-6,30,700)}}
  const Ms=(map,r,bm,rm,mt,ei)=>new THREE.MeshStandardMaterial({vertexColors:true,map,roughness:r||.95,metalness:mt||0,envMapIntensity:ei!=null?ei:1,side:THREE.DoubleSide,...(bm?{bumpMap:bm,bumpScale:.42}:{}),...(rm?{roughnessMap:rm}:{})}),
   mA=Ms(TX.a,.62,TX.a,TX.r,.14,night?.85:1.35),mGrr=Ms(TX.a,.44,TX.a,TX.r,.18,night?.95:1.55),mG=Ms(TX.g,.94),mGr=Ms(TX.gr,.96),lam=Ms(TX.n),mK=Ms(TX.n,.58),mW=Ms(st?TX.w:cfg.wallSp?TX.sp:TX.s,.56),
   L=(g,m,rs)=>{const k=new THREE.Mesh(g,m||lam);k.receiveShadow=rs!==0;R.add(k)},dk=c=>new THREE.Color(c).multiplyScalar(.88).getHex(),K=def.k,K2=def.k2||def.k,sa=i=>Math.floor(T.s[i]/14)&1,gc=cfg.turf?new THREE.Color(cfg.turf).multiplyScalar(1.10).getHex():new THREE.Color(def.gnd).multiplyScalar(1.04).getHex(),wuv=(q,o,d)=>[T.s[q]/(st?36:cfg.wallSp?28*SP.length:170),d/(st?9:6)];
  for(const s of[1,-1]){L(T.strip(s*bw,-.4,i=>s*(bw+ew[i]),gy,gc,0,N,1),cfg.turf?mG:lam);L(T.strip(s*(hw+8),-.35,s*Math.min(gv,bw),-.35,i=>Math.floor(T.s[i]/220)&1?gc:dk(gc)),cfg.turf?mG:lam);
   if(gv<bw&&!def.csand)L(T.strip(s*gv,-.3,s*bw,-.3,def.id==='bahrain'?0xe8cf94:0xc2b07e),mGr);L(T.strip(s*(hw-1.9),.1,s*(hw-.5),.1,0xf6f7f9),lam,0);
   L(T.strip(s*bw,0,s*bw,st?9:6,st?0xd0d4da:0xffffff,0,N,0,wuv),mW)}
  L(T.strip(-hw,0,hw,0,i=>Math.floor(T.s[i]/300)&1?0x50555e:0x494e57),mA);
  L(T.strip(i=>T.lo[i]-11,.07,i=>T.lo[i]+11,.07,0x282b32),mGrr);
  {const pl=T.pe+T.px;L(T.strip(i=>T.pitOff(i)-21,.1,i=>T.pitOff(i)+21,.1,0xa0a4ac,N-T.pe,pl),mA);L(T.strip(i=>T.pitOff(i)-.5,.15,i=>T.pitOff(i)+.5,.15,0xffe14a,N-T.pe,pl))}
  const dm=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide});for(const z of T.dz)L(T.strip(-hw,.12,hw,.12,0x3cff8c,z[0],z[1]-z[0]+1),dm,0);
  {const hs=[];for(let i=0;i<N;i++)hs[i]=T.lineHeat(i);const hh=hs.map((_,i)=>{let t=0;for(let q=-3;q<=3;q++)t+=hs[(i+q+N)%N];return t/7}),cG=new THREE.Color(0x2dff7a),cA=new THREE.Color(0xffc21f),cR=new THREE.Color(0xff2b2b),
   col=i=>{const h=hh[i%N];return h<.5?cG.clone().lerp(cA,h*2):cA.clone().lerp(cR,(h-.5)*2)},lo=i=>T.lo[i%N],wc=i=>clamp((hh[i%N]-.04)/.12,0,1),
   chev=(()=>{const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');x.clearRect(0,0,64,64);x.strokeStyle='#fff';x.lineWidth=15;x.lineJoin='miter';x.beginPath();x.moveTo(3,58);x.lineTo(32,18);x.lineTo(61,58);x.stroke();const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t})(),
   cm=()=>new THREE.MeshBasicMaterial({map:chev,vertexColors:true,transparent:true,opacity:.95,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),
   hm=()=>new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),
   mkL=(w,k,m)=>{const g=new THREE.Mesh(T.strip(i=>lo(i)-w*k(i),.4,i=>lo(i)+w*k(i),.4,m?i=>col(i).multiplyScalar(.5):col,0,2*N,undefined,m?undefined:(i,o)=>[(o-lo(i))/(w*Math.max(k(i),.05))*.5+.5,T.s[i]/(w*1.5)]),m?hm():cm());g.frustumCulled=false;g.visible=false;g.renderOrder=m?5:6;R.add(g);return g},
   one=()=>1;
   this.rl={core:mkL(2.6,one,0),halo:mkL(6,one,1),coreC:mkL(2.8,wc,0),haloC:mkL(6.5,wc,1),n:hi?100:70}}
  const cv=document.createElement('canvas');cv.width=cv.height=32;let x=cv.getContext('2d');for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)%2?'#111':'#fff';x.fillRect(i*8,j*8,8,8)}
  const sl=new THREE.Mesh(new THREE.PlaneGeometry(10,hw*2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv)}));sl.rotation.x=-Math.PI/2;const p0=T.at(0,0);sl.position.set(p0.x,p0.y+.2,p0.z);sl.rotation.order='YXZ';sl.rotation.y=-T.h[0];R.add(sl);
  const inst=(geo,m,A)=>{if(!A.length)return;const im=new THREE.InstancedMesh(geo,m,A.length),o=new THREE.Object3D(),col=new THREE.Color();A.forEach((a,i)=>{o.position.set(a.x,a.y,a.z);o.scale.set(a.sx||1,a.sy||1,a.sz||1);o.rotation.set(a.rx||0,a.r||0,a.rz||0);o.updateMatrix();im.setMatrixAt(i,o.matrix);if(a.c!=null)im.setColorAt(i,col.set(a.c))});im.frustumCulled=false;R.add(im)};
  const surf=(i,o)=>{const a=Math.abs(o),b=T.ey[i]-.4;if(a<=bw)return b;const t=Math.min(1,(a-bw)/ew[i]);return b+(gy-b)*t},nz=i=>(i%N+N)%N;
  const free=(x,z,r)=>{for(let i=0;i<N;i+=3){const dx=x-T.x[i],dz=z-T.y[i];if(dx*dx+dz*dz<r*r)return false}return true};
  const rp=(a,b,r)=>{for(let t=0;t<14;t++){const o=(Math.random()<.5?-1:1)*rnd(a,b),i=Math.random()*N|0,p=T.at(i,o);if(free(p.x,p.z,Math.max(r,bw+10))){p.y=surf(i,o);return p}}return null},many=(n,a,b,r,fn)=>{const A=[];for(let i=0;i<n*f;i++){const p=rp(a,b,r);if(p)A.push(fn(p))}return A};
  const tex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=Math.min(8,ANISO);return t},tex2=(w,h,k,fn)=>tex(w*k,h*k,x=>{x.scale(k,k);fn(x,w,h)});
  const crowd=tex2(256,32,2,(x,w,h)=>{x.fillStyle='#7d7468';x.fillRect(0,0,w,h);for(let r=0;r<4;r++){x.fillStyle=r%2?'#6c645a':'#857b6e';x.fillRect(0,r*8,w,4)}for(let i=0;i<700;i++){x.fillStyle=`hsl(${[8,28,45,200,215,0][i%6]},${28+Math.random()*18}%,${42+Math.random()*24}%)`;x.fillRect(Math.random()*w,Math.random()*h,2,3)}});
  const banner=(i,txt,bg,fg)=>{const g=new THREE.Group(),p=T.at(i,0);g.position.set(p.x,p.y,p.z);g.rotation.y=-T.h[i];
   const b=new THREE.Mesh(new THREE.BoxGeometry(6,12,bw*2+30),mat(0x222226));b.position.set(0,34,0);g.add(b);
   const tb=new THREE.Mesh(new THREE.PlaneGeometry(bw*2+20,10),new THREE.MeshBasicMaterial({map:(bg?tex2(1056,32,2,(x,w,h)=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.14)';x.fillRect(0,0,w,3);x.fillStyle=fg||'#fff';x.font='bold 24px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2+1)}):tex2(512,32,2,(x,w,h)=>{x.fillStyle='#d01010';x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font='bold 22px Arial';x.textAlign='center';x.fillText(txt,w/2,24)}))}));tb.rotation.y=-Math.PI/2;tb.position.set(3.2,34,0);g.add(tb);const tb2=tb.clone();tb2.rotation.y=Math.PI/2;tb2.position.set(-3.2,34,0);g.add(tb2);
   for(const s of[-1,1]){const pl=new THREE.Mesh(new THREE.BoxGeometry(5,30,5),mat(0x333338));pl.position.set(0,15,s*(bw+8));g.add(pl)}R.add(g)};
  if(def.id!=='sepang'){banner(2,'APEX GP · '+def.n.toUpperCase());T.dz.forEach((z,k)=>banner(Math.floor((z[0]+z[1])/2)%N,['APEX ENERGY','VELOCITY OIL','NOVA BANK','TURBO CLOUD'][k%4]))}
  const stand=(i,side,len,lotus,rc)=>{const g=new THREE.Group(),p=T.at(i,0);if(![-.5,-.25,0,.25,.5].every(q=>{const pl=T.at(i,side*(bw+100));return free(pl.x+T.tx[i]*q*len,pl.z+T.ty[i]*q*len,bw+8)}))return;const top=surf(i,side*(bw+30)),hb=top-gy;this.nSt=(this.nSt||0)+1;g.position.set(p.x,top,p.z);g.rotation.y=-T.h[i];if(hb>2){const fb=new THREE.Mesh(new THREE.BoxGeometry(len,hb,86),mat(0x6b6f78));fb.position.set(0,-hb/2,side*(bw+62));g.add(fb)}const m=new THREE.MeshLambertMaterial({map:crowd});
   for(let t=0;t<5;t++){const b=new THREE.Mesh(new THREE.BoxGeometry(len,5,14),m);b.position.set(0,2.5+t*5,side*(bw+30+t*13));g.add(b)}
   // Animated 3D cheering spectators + waving flags on grandstand tiers
   {const fA=[],fB=[],fl=[],FC=[0xe00000,0xffd200,0x00d2be,0xff8000,0x1e3cff,0xf4f6f9,0x22cc66,0xff4fa0];
    const step=len>700?18:16;
    for(let t=0;t<5;t++)for(let sx=-len/2+14;sx<=len/2-14;sx+=step){if(Math.random()<.22)continue;
     const bx=sx+rnd(-4,4),by=5+t*5,bz=side*(bw+28+t*13+rnd(-2.5,2.5)),col=FC[Math.random()*FC.length|0];
     ((Math.floor((sx+len)/28)+t)%2?fA:fB).push({x:bx,y:by,z:bz,c:col});
     if(Math.random()<.09)fl.push({x:bx,y:by+5.2,z:bz,c:FC[Math.random()*FC.length|0]})}
    const mkC=(arr,ph)=>{if(!arr.length)return;const wg=new THREE.Group(),bg=new THREE.BoxGeometry(2.4,3.6,1.8),hg=new THREE.SphereGeometry(1.1,6,5),ag=new THREE.BoxGeometry(4.2,.9,.8),bm=new THREE.MeshLambertMaterial({color:0xffffff}),hm=mat(0xdeb892);
     const imB=new THREE.InstancedMesh(bg,bm,arr.length),imH=new THREE.InstancedMesh(hg,hm,arr.length),imA=new THREE.InstancedMesh(ag,bm,arr.length),o=new THREE.Object3D(),cl=new THREE.Color();
     arr.forEach((a,k)=>{o.position.set(a.x,a.y+1.8,a.z);o.updateMatrix();imB.setMatrixAt(k,o.matrix);imB.setColorAt(k,cl.set(a.c));o.position.set(a.x,a.y+4.4,a.z);o.updateMatrix();imH.setMatrixAt(k,o.matrix);o.position.set(a.x,a.y+3.8,a.z);o.updateMatrix();imA.setMatrixAt(k,o.matrix);imA.setColorAt(k,cl.set(a.c))});
     wg.add(imB,imH,imA);g.add(wg);this.crowdWaves.push({g:wg,ph,baseY:0})};
    mkC(fA,0);mkC(fB,Math.PI*.55);
    if(fl.length){const fg=new THREE.Group(),fm=new THREE.InstancedMesh(new THREE.BoxGeometry(4.2,2.6,.3),new THREE.MeshBasicMaterial({color:0xffffff}),fl.length),o=new THREE.Object3D(),cl=new THREE.Color();
     fl.forEach((a,k)=>{o.position.set(a.x,a.y+2.5,a.z);o.updateMatrix();fm.setMatrixAt(k,o.matrix);fm.setColorAt(k,cl.set(a.c))});fg.add(fm);g.add(fg);this.crowdWaves.push({g:fg,ph:1.4,baseY:0,flag:1})}}
   if(lotus){
    // Sepang iconic Hibiscus / Lotus-petal cantilevered grandstand canopy + VIP glass suites
    const canopyMat=new THREE.MeshStandardMaterial({color:rc||0xf4f6fa,roughness:.35,metalness:.15,side:THREE.DoubleSide});
    const ribMat=sm(0x2a323e,.4,.7),glassMat=sm(0x10283c,.12,.85,.8),tealMat=mat(0x00b8a9);
    const vip=new THREE.Mesh(new THREE.BoxGeometry(len*.96,11,24),glassMat);vip.position.set(0,31,side*(bw+86));g.add(vip);
    const fascia=new THREE.Mesh(new THREE.BoxGeometry(len,2.6,3),tealMat);fascia.position.set(0,26.5,side*(bw+26));g.add(fascia);
    const bays=len>700?9:5;
    for(let k=0;k<bays;k++){const bx=-len/2+len/(bays*2)+k*len/bays;
     const petal=new THREE.Mesh(new THREE.SphereGeometry(1,16,10,0,TAU,0,Math.PI*.48),canopyMat);
     petal.scale.set(len/(bays*1.85),21,54);petal.position.set(bx,35,side*(bw+56));petal.castShadow=true;g.add(petal);
     const arch=new THREE.Mesh(new THREE.TorusGeometry(46,1.1,6,18,Math.PI),ribMat);
     arch.position.set(bx,36,side*(bw+56));arch.rotation.y=Math.PI/2;g.add(arch);
     const col=new THREE.Mesh(new THREE.CylinderGeometry(1.4,2.2,38,8),ribMat);
     col.position.set(bx,19,side*(bw+92));col.rotation.x=side*.16;g.add(col)}}
   else{const r=new THREE.Mesh(new THREE.BoxGeometry(len,1.5,70),mat(0xe9e4da));r.position.set(0,38,side*(bw+60));g.add(r);const te=new THREE.Mesh(new THREE.BoxGeometry(len,2.4,2),mat(0x2fd6c0));te.position.set(0,38.2,side*(bw+25));g.add(te)}
   for(const e of[-1,1]){const pl=new THREE.Mesh(new THREE.BoxGeometry(3,36,3),mat(0x777777));pl.position.set(e*len/2,18,side*(bw+94));g.add(pl)}R.add(g)};
  const sc=def.id;
  this.nSt=0;this.nGa=[];this.nPad=0;this.nBr=0;
  const freeO=(x,z,i,r)=>{for(let j=0;j<N;j+=3){const dj=Math.min(Math.abs(j-i),N-Math.abs(j-i));if(dj<110)continue;const dx=x-T.x[j],dz=z-T.y[j];if(dx*dx+dz*dz<r*r)return false}return true};
  // Universal 5-pod physical F1 start light gantry (synced with countdown/lights out on ALL 9 circuits)
  this.gantryBulbs=[];
  {const sg3=new THREE.Group(),p0s=T.at(0,0);sg3.position.set(p0s.x,p0s.y,p0s.z);sg3.rotation.y=-T.h[0];
   const bar=new THREE.Mesh(new THREE.BoxGeometry(2.5,2.5,hw*2+18),mat(0x1e222a));bar.position.set(0,26,0);sg3.add(bar);
   for(const s of[-1,1]){const col=new THREE.Mesh(new THREE.BoxGeometry(3,26,3),mat(0x2d323c));col.position.set(0,13,s*(hw+10));sg3.add(col)}
   for(let k=-2;k<=2;k++){const pod=new THREE.Mesh(new THREE.BoxGeometry(2.8,6.5,4.2),mat(0x111318));pod.position.set(0,22,k*11);sg3.add(pod);
    const bm=new THREE.MeshBasicMaterial({color:0x2a0808,side:THREE.DoubleSide});
    const bulb=new THREE.Mesh(new THREE.CircleGeometry(1.3,12),bm);bulb.rotation.y=-Math.PI/2;bulb.position.set(-1.5,21,k*11);sg3.add(bulb);this.gantryBulbs.push(bm)}
   R.add(sg3)}
  // Universal Race Control Tower + Live Top-3 LED Timing Pylon near start/finish
  this.pylon=null;
  {const rp2=T.at(2,bw+116),ry2=surf(2,bw+116);if(free(rp2.x,rp2.z,bw+10)){const rc=new THREE.Group();rc.position.set(rp2.x,ry2,rp2.z);rc.rotation.y=-T.h[2];
   const core=new THREE.Mesh(new THREE.BoxGeometry(24,84,22),new THREE.MeshLambertMaterial({color:night?0x66748f:0xffffff,map:TX.b}));core.position.y=42;core.castShadow=true;rc.add(core);
   const band=new THREE.Mesh(new THREE.BoxGeometry(26,2.8,24),new THREE.MeshBasicMaterial({color:cfg.rcAccent}));band.position.y=84;rc.add(band);R.add(rc)}}
  {const pp=T.at(6,-(bw+16)),py=surf(6,-(bw+16));if(free(pp.x,pp.z,bw+6)){const pg=new THREE.Group();pg.position.set(pp.x,py,pp.z);pg.rotation.y=-T.h[6];
   const body=new THREE.Mesh(new THREE.BoxGeometry(8,68,14),mat(0x11151f));body.position.y=34;body.castShadow=true;pg.add(body);
   const cv=document.createElement('canvas');cv.width=128;cv.height=256;const tx=new THREE.CanvasTexture(cv);
   const scr=new THREE.Mesh(new THREE.PlaneGeometry(12.5,52),new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide}));scr.rotation.y=-Math.PI/2;scr.position.set(-4.2,37,0);pg.add(scr);
   const scr2=scr.clone();scr2.rotation.y=Math.PI/2;scr2.position.set(4.2,37,0);pg.add(scr2);
   this.pylon={cv,tx,t:0};R.add(pg)}}
  // Universal authentic white/black F1 braking distance boards (150 / 100 / 50) on ALL 9 circuits
  {const ap=[];for(let i=0;i<N;i++){const v=T.vl[i];if(v>=300)continue;let mn=true,mx=0;for(let q=-6;q<=6;q++)if(T.vl[nz(i+q)]<v){mn=false;break}if(!mn)continue;for(let q=1;q<=45;q++)mx=Math.max(mx,T.vl[nz(i-q)]);if(mx>v*1.5)ap.push({i,r:mx/v})}
   ap.sort((p,q)=>q.r-p.r);const br=[];for(const c of ap)if(br.length<9&&br.every(a=>Math.min(Math.abs(a-c.i),N-Math.abs(a-c.i))>50))br.push(c.i);
   const mkNum=(n)=>tex2(128,88,2,(x,w,h)=>{x.fillStyle='#f6f7f9';x.fillRect(0,0,w,h);x.strokeStyle='#15181f';x.lineWidth=6;x.strokeRect(3,3,w-6,h-6);x.fillStyle='#10131a';x.font='900 54px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(String(n),w/2,h/2+2)}),T3={150:mkNum(150),100:mkNum(100),50:mkNum(50)};
   for(const a of br){const s=-(Math.sign(T.ks[a])||1);for(const [n,off] of[[150,42],[100,28],[50,14]]){const i=nz(a-off),o=s*(bw-1),p=T.at(i,o);if(!freeO(p.x,p.z,i,bw+4))continue;const gp=new THREE.Group(),sy=surf(i,o);gp.position.set(p.x,sy,p.z);gp.rotation.y=-T.h[i];
     const pl=new THREE.Mesh(new THREE.BoxGeometry(.7,11,.7),mat(0x464c56));pl.position.set(0,5.5,0);gp.add(pl);const bd=new THREE.Mesh(new THREE.PlaneGeometry(11,7.5),new THREE.MeshBasicMaterial({map:T3[n],side:THREE.DoubleSide}));bd.rotation.y=-Math.PI/2;bd.position.set(0,11.5,0);gp.add(bd);R.add(gp)}}}
  // Universal Sepang-grade F1 Circuit Factory (applied across ALL 9 tracks from shared TRACK_BASELINE + TRACK_THEMES)
  {const bx1=new THREE.BoxGeometry(1,1,1),mw1=new THREE.MeshLambertMaterial({color:0xffffff}),
    pm=lam.clone();pm.polygonOffset=true;pm.polygonOffsetFactor=-3;pm.polygonOffsetUnits=-3;
   const sg=T.ks.map(k=>Math.abs(k)>1/650?Math.sign(k):0),runs=[];{let i=0;while(i<N){if(sg[i]){let j=i;while(j<N&&sg[j]===sg[i])j++;if(j-i>=5)runs.push({a:i,b:j,sn:sg[i],k:Math.max(...T.ks.slice(i,j).map(Math.abs))});i=j}else i++}}
   const sharp=runs.slice().sort((p,q)=>q.k-p.k);
   if(sc==='sepang'){
    stand(40,-1,1500,1,0xf4f6fa);
    {const tp=T.at(12,bw+165),ty=surf(12,bw+165);if(free(tp.x,tp.z,bw+14)){const tg=new THREE.Group();tg.position.set(tp.x,ty,tp.z);
     const shaft=new THREE.Mesh(new THREE.CylinderGeometry(11,16,145,16),sm(0xeef2f6,.4,.2));shaft.position.y=72.5;shaft.castShadow=true;tg.add(shaft);
     const deck=new THREE.Mesh(new THREE.CylinderGeometry(36,24,16,24),sm(0x10283c,.12,.85,.8));deck.position.y=124;deck.castShadow=true;tg.add(deck);
     const cap=new THREE.Mesh(new THREE.CylinderGeometry(42,38,6,24),sm(0xf4f6fa,.35,.2));cap.position.y=135;tg.add(cap);
     const ring=new THREE.Mesh(new THREE.TorusGeometry(39,1.8,8,32),new THREE.MeshBasicMaterial({color:0x00d2be}));ring.rotation.x=Math.PI/2;ring.position.y=135;tg.add(ring);
     const spire=new THREE.Mesh(new THREE.CylinderGeometry(.6,3.2,48,10),sm(0xcbd2dc,.3,.8));spire.position.y=162;tg.add(spire);R.add(tg)}}
    {const cols=[0x1fb5a6,0xffcf3a,0xff8a3d,0xf4f6f8,0x1fb5a6];let n=0;for(const r of sharp){if(n>=5)break;const m=nz(Math.floor((r.a+r.b)/2));if(m>N-120||m<130)continue;const before=this.nSt;stand(m,-r.sn,300,1,cols[n%5]);if(this.nSt>before)n++}}
    {const used=[],ok=i=>{for(let q=-8;q<=8;q+=2)if(Math.abs(T.ks[nz(i+q)])>1/1800)return false;return used.every(u=>Math.abs(((u-i+N*1.5)%N)-N/2)>45)};let n=0;const put=i=>{used.push(i);this.nGa.push(i);const s=SP[n++%SP.length];banner(i,s[0],s[1],s[2])};
     if(ok(3))put(3);T.dz.forEach(z=>{const i=Math.floor((z[0]+z[1])/2)%N;if(ok(i))put(i)});
     for(let k=1;k<=7;k++){for(let dd=0;dd<70;dd++){let done=false;for(const sgn of[1,-1]){const i=nz(Math.floor(N*k/7)+sgn*dd);if(ok(i)){put(i);done=true;break}}if(done)break}}}
   }
   // Universal Team Paddock Garages & Conical Hospitality Tents (all non-street circuits)
   if(cfg.paddock&&!st){
    const A=[],K=[],F=[],Tnt=[],box=(i,o,sx,sy,sz,c,roof)=>{const p=T.at(i,o);if(!free(p.x,p.z,bw+8))return;const top=surf(i,o),hb=top-gy;if(hb>1)F.push({x:p.x,y:gy+hb/2,z:p.z,r:-T.h[i],sx:sx+4,sy:hb,sz:sz+4,c:0x6b6f78});A.push({x:p.x,y:top+sy/2,z:p.z,r:-T.h[i],sx,sy,sz,c});K.push({x:p.x,y:top+sy+1.5,z:p.z,r:-T.h[i],sx:sx+2,sy:3,sz:sz+2,c:roof})};
    for(let k=-3;k<=9;k++)box(nz(k*7),bw+55,62,32,38,0xeef1f4,TEAMS[(k+3)%TEAMS.length].c);
    for(let k=-3;k<=9;k++){const i=nz(k*7+3),p=T.at(i,bw+116);if(!free(p.x,p.z,bw+8))continue;const top=surf(i,bw+116);A.push({x:p.x,y:top+7,z:p.z,r:-T.h[i],sx:26,sy:14,sz:26,c:0xf4f6f9});Tnt.push({x:p.x,y:top+21,z:p.z,sx:21,sy:15,sz:21,c:0xfafcff})}
    this.nPad=A.length;inst(bx1,new THREE.MeshLambertMaterial({color:0xffffff,map:TX.b}),A);inst(bx1,mw1,K);inst(bx1,mw1,F);inst(new THREE.ConeGeometry(1,1,4),mw1,Tnt)
   }
   // Universal Corner Advertising Billboards (all 9 circuits)
   if(cfg.billboards){
    const adTex={},ad=(k)=>adTex[k]||(adTex[k]=tex2(512,96,2,(x,w,h)=>{const s=SP[k];x.fillStyle=s[1];x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.16)';x.fillRect(0,0,w,8);let fs=58;x.textAlign='center';x.textBaseline='middle';do{x.font='bold '+fs+'px Arial';fs--}while(fs>16&&x.measureText(s[0]).width>w-50);x.fillStyle=s[2];x.fillText(s[0],w/2,h/2+3);x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=4;x.strokeRect(2,2,w-4,h-4)}));let n=0;
    for(const r of sharp.slice(0,sc==='sepang'?10:6)){const s=-r.sn,c=nz(Math.floor((r.a+r.b)/2));for(const dd of[-9,0,9]){const i=nz(c+dd),o=s*(bw+7),p=T.at(i,o);if(!freeO(p.x,p.z,i,bw+8))continue;const gp=new THREE.Group(),sy=surf(i,o);gp.position.set(p.x,sy,p.z);gp.rotation.y=-T.h[i];
      const back=new THREE.Mesh(new THREE.BoxGeometry(44,9,.8),mat(0x20232a));back.position.set(0,12,s*.5);gp.add(back);const face=new THREE.Mesh(new THREE.PlaneGeometry(43,8.2),new THREE.MeshBasicMaterial({map:ad(n++%SP.length)}));face.position.set(0,12,0);if(s>0)face.rotation.y=Math.PI;gp.add(face);
      for(const e of[-18,18]){const pl=new THREE.Mesh(new THREE.BoxGeometry(1,8,1),mat(0x555a63));pl.position.set(e,4,s*.5);gp.add(pl)}R.add(gp)}}
   }
   // Universal Multi-Zone Corner Run-Offs & Catch Fencing (all non-street circuits)
   if(cfg.catchFence&&!st){
    const fm=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.30,side:THREE.DoubleSide,depthWrite:false}),pA=[];
    runs.forEach(r=>{const s=-r.sn,a0=nz(r.a-8),n=r.b-r.a+18;
     if(sc==='sepang'){L(T.strip(s*(hw+10),.13,s*(hw+20),.13,0x2a7d44,a0,n),pm,0);L(T.strip(s*(hw+20),.14,s*(hw+56),.14,0x464b54,a0,n),pm,0);L(T.strip(s*(hw+58),.15,s*(bw-10),.15,0xd8c392,a0,n),pm,0)}
     L(T.strip(s*(bw+.6),5,s*(bw+.6),17,0x9aa3ad,a0,n),fm,0);for(let q=0;q<n;q+=2){const ii=nz(a0+q),p=T.at(ii,s*(bw+.6));pA.push({x:p.x,y:p.y+8.5,z:p.z})}});
    inst(new THREE.CylinderGeometry(.5,.5,17,5),mat(0x59606b),pA)
   }
  }
  if(sc==='silver'){stand(30,-1,380,0);stand(30,1,380,0);stand(Math.floor(N*.3),-1,300,0);stand(Math.floor(N*.7),1,300,0);
   inst(new THREE.CylinderGeometry(1.4,2,16,6),mat(0x5a3d22),(this.pP=many(80,bw+40,bw+700,16,p=>p)).map(p=>({x:p.x,y:p.y+8,z:p.z})));inst(new THREE.SphereGeometry(13,8,6),mat(0x2f7d32),this.pP.map(p=>({x:p.x,y:p.y+24,z:p.z,sy:1.2})))}
  if(sc==='spa'){inst(new THREE.SphereGeometry(1,10,8),mat(0x1f4a28),many(26,600,2200,420,p=>{const r=rnd(260,520);return{x:p.x,y:p.y-60,z:p.z,sx:r,sy:rnd(140,240),sz:r}}));
   inst(new THREE.CylinderGeometry(1.3,2,10,5),mat(0x4a2f1a),(this.pP=many(520,bw+30,bw+700,18,p=>p)).map(p=>({x:p.x,y:p.y+5,z:p.z})));inst(new THREE.ConeGeometry(11,44,7),mat(0x1d4a2a),this.pP.map(p=>({x:p.x,y:p.y+30,z:p.z,sy:rnd(.8,1.4),sx:rnd(.8,1.2),sz:rnd(.8,1.2)})));stand(30,-1,300,0)}
  if(sc==='bahrain'){stand(30,-1,420,0);stand(30,1,420,0);inst(new THREE.SphereGeometry(1,10,8),mat(0xd7b676),many(30,500,2200,330,p=>({x:p.x,y:p.y-14,z:p.z,sx:rnd(150,300),sy:rnd(20,50),sz:rnd(150,300)})));
   const tp=rp(500,900,200);if(tp){const g=new THREE.Group();g.position.set(tp.x,tp.y,tp.z);const t=new THREE.Mesh(new THREE.CylinderGeometry(6,14,300,10),mat(0xe8e4dc));t.position.y=150;g.add(t);const ring=new THREE.Mesh(new THREE.TorusGeometry(24,4,8,24),new THREE.MeshBasicMaterial({color:0xffd27a}));ring.rotation.x=Math.PI/2;ring.position.y=280;g.add(ring);const top=new THREE.Mesh(new THREE.ConeGeometry(10,60,8),new THREE.MeshBasicMaterial({color:0xfff0c0}));top.position.y=320;g.add(top);R.add(g)}}
  if(sc==='marina'){stand(30,-1,260,0);const win=tex2(64,128,2,(x,w,h)=>{x.fillStyle='#0b1428';x.fillRect(0,0,w,h);for(let i=0;i<14;i++)for(let j=0;j<7;j++){if(Math.random()<.6){x.fillStyle=Math.random()<.5?'#ffd98a':'#9fd0ff';x.fillRect(4+j*8,4+i*9,5,5)}}});
   inst(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({map:win}),many(110,170,1100,70,p=>{const h=rnd(120,520);return{x:p.x,y:p.y+h/2,z:p.z,sx:rnd(50,110),sy:h,sz:rnd(50,110),c:[0xaab4d0,0x8895bb,0xc8d0e8,0x9aa6c8][Math.random()*4|0]}}));
   const mb=rp(420,700,200);if(mb){const g=new THREE.Group();g.position.set(mb.x,mb.y,mb.z);const tm=new THREE.MeshBasicMaterial({map:win});for(let k=-1;k<=1;k++){const t=new THREE.Mesh(new THREE.BoxGeometry(34,200,56),tm);t.position.set(k*64,100,0);g.add(t)}const sh=new THREE.Mesh(new THREE.BoxGeometry(220,10,60),new THREE.MeshBasicMaterial({color:0xcfd8e8}));sh.position.y=205;g.add(sh);R.add(g)}
   const fw=rp(420,800,200);if(fw){const g=new THREE.Group();g.position.set(fw.x,fw.y,fw.z);const mt=new THREE.MeshBasicMaterial({color:0x9fd0ff}),t=new THREE.Mesh(new THREE.TorusGeometry(110,2.5,8,48),mt);t.position.y=120;g.add(t);const t2=new THREE.Mesh(new THREE.TorusGeometry(55,1.2,6,32),mt);t2.position.y=120;g.add(t2);
    for(let k=0;k<12;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(220,1,1),mt);sp.position.y=120;sp.rotation.z=k*Math.PI/12;g.add(sp)}R.add(g)}}
  const matW=new THREE.MeshLambertMaterial({color:0xffffff}),B1=new THREE.BoxGeometry(1,1,1);
  if(sc==='monaco'){stand(30,-1,200,0);
   inst(B1,matW,many(150,bw+25,bw+620,55,p=>{const h=rnd(45,170);return{x:p.x,y:p.y+h/2,z:p.z,sx:rnd(40,90),sy:h,sz:rnd(40,90),r:rnd(0,3),c:[0xf2e4c8,0xe8c9a0,0xf0b9a0,0xfafafa,0xd9b38c][Math.random()*5|0]}}));
   const hu=[],cb=[];for(let i=0;i<45*f;i++){const p=rp(900,1900,900);if(p){const l=rnd(60,120),r=rnd(0,TAU);hu.push({x:p.x,y:gy+3,z:p.z,sx:l,sy:7,sz:l*.28,r,c:0xffffff});cb.push({x:p.x,y:gy+10,z:p.z,sx:l*.5,sy:7,sz:l*.2,r,c:0xdfe6ee})}}inst(B1,matW,hu);inst(B1,matW,cb);
   const t0=T.tun[0],tw=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});for(const s of[-1,1])L(T.strip(s*62,0,s*62,38,0x8a8478,t0,T.tun[1]));L(T.strip(-62,38,62,38,0x6e6a62,t0,T.tun[1]));for(const o of[-26,26])L(T.strip(o-3,37.5,o+3,37.5,0xffd9a0,t0,T.tun[1]),tw,0)}
  if(sc==='imola'){stand(30,-1,360,0);stand(30,1,300,0);stand(Math.floor(N*.5),-1,260,0);
   inst(new THREE.SphereGeometry(1,10,8),mat(0x2f6f33),many(18,500,1800,420,p=>{const r=rnd(200,420);return{x:p.x,y:p.y-50,z:p.z,sx:r,sy:rnd(80,160),sz:r}}));
   const P=many(260,bw+35,bw+800,20,p=>p);inst(new THREE.CylinderGeometry(1.5,2.2,18,6),mat(0x5a3d22),P.map(p=>({x:p.x,y:p.y+9,z:p.z})));
   inst(new THREE.SphereGeometry(1,8,6),matW,P.map(p=>({x:p.x,y:p.y+26,z:p.z,sx:rnd(12,18),sy:rnd(12,18),sz:rnd(12,18),c:[0x2f7d32,0x3f8f3a,0x5a8a2a,0xa07a2a][Math.random()*4|0]})))}
  if(sc==='monza'){stand(30,-1,520,0);stand(30,1,520,0);stand(Math.floor(N*.9),-1,300,0);
   const P=many(430,bw+30,bw+950,22,p=>p);inst(new THREE.CylinderGeometry(1.6,2.4,20,6),mat(0x4f3520),P.map(p=>({x:p.x,y:p.y+10,z:p.z})));
   inst(new THREE.SphereGeometry(1,8,6),matW,P.map(p=>({x:p.x,y:p.y+30,z:p.z,sx:rnd(14,22),sy:rnd(16,26),sz:rnd(14,22),c:[0x1f5a26,0x2a6b2a,0x346e22,0x1b4d2a][Math.random()*4|0]})))}
  if(sc==='jeddah'){stand(30,-1,320,0);const wt=tex2(64,128,2,(x,w,h)=>{x.fillStyle='#0a1530';x.fillRect(0,0,w,h);for(let i=0;i<14;i++)for(let j=0;j<7;j++)if(Math.random()<.65){x.fillStyle=Math.random()<.5?'#fff2b0':'#7fe0ff';x.fillRect(4+j*8,4+i*9,5,5)}});
   inst(B1,new THREE.MeshBasicMaterial({map:wt}),many(110,bw+70,bw+1000,60,p=>{const h=rnd(160,700);return{x:p.x,y:p.y+h/2,z:p.z,sx:rnd(45,100),sy:h,sz:rnd(45,100),c:[0xbfd6ff,0xaec4f0,0xd8e4ff][Math.random()*3|0]}}));
   const led=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});for(const s of[1,-1])L(T.strip(s*(bw-.2),4,s*(bw-.2),5.6,i=>(i>>4)&1?0x6fd8ff:0xff5fae),led,0)}
  if(night){const P=[],H=[],hp=[],pl=[],gap=Math.round(22/(f>.5?1:.6)),gt=tex2(64,64,2,(x,w,h)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.4)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});
   for(let i=0;i<N;i+=gap){const s=(i/gap|0)%2?1:-1,p=T.at(i,s*(bw+10)),q=T.at(i,s*(bw+5)),w=T.at(i,s*Math.min(bw*.5,66));P.push({x:p.x,y:p.y+37,z:p.z});H.push({x:q.x,y:q.y+75,z:q.z,r:-T.h[i],sx:1.3});hp.push(q.x,q.y+74,q.z);pl.push({x:w.x,y:w.y+.3,z:w.z})}
   inst(new THREE.CylinderGeometry(1.2,1.8,74,6),mat(0x555560),P);inst(new THREE.BoxGeometry(16,3,8),new THREE.MeshBasicMaterial({color:0xfff3c0}),H);
   const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(hp,3));const hpts=new THREE.Points(hg,new THREE.PointsMaterial({map:gt,color:0xfff0c8,size:38,sizeAttenuation:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));hpts.frustumCulled=false;R.add(hpts);
   const pg=new THREE.PlaneGeometry(200,200);pg.rotateX(-Math.PI/2);inst(pg,new THREE.MeshBasicMaterial({map:gt,color:0xffe3a0,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),pl);
   const nc=def.id==='marina'?[0xff3df0,0x38e8ff]:def.id==='bahrain'?[0xffa63a,0xfff0c8]:[0x6fd8ff,0xff5fae],cf=i=>new THREE.Color(nc[(i>>3)&1]),
    gl=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}),gh=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
   for(const s of[1,-1]){if(def.id!=='jeddah')L(T.strip(s*(bw-.5),4,s*(bw-.5),5.8,cf,0,N),gl,0);L(T.strip(s*(bw-.6),1,s*(bw-.6),18,i=>cf(i).multiplyScalar(.5),0,N),gh,0)}
   const bm=new THREE.MeshBasicMaterial({color:0x9fd0ff,transparent:true,opacity:.09,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
   for(let k=0;k<(hi?6:3);k++){const p=rp(300,1100,150);if(!p)continue;const b=new THREE.Mesh(new THREE.CylinderGeometry(5,26,1000,10,1,true),bm);b.position.set(p.x,p.y+460,p.z);b.rotation.set(rnd(-.4,.4),0,rnd(-.4,.4));R.add(b)}
   const sp=[];for(let k=0;k<(hi?900:400);k++){const a=Math.random()*TAU,v=Math.random()*.95+.05,r=Math.sqrt(1-v*v);sp.push(Math.cos(a)*r*4700,v*4700,Math.sin(a)*r*4700)}
   const sg2=new THREE.BufferGeometry();sg2.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));const stars=new THREE.Points(sg2,new THREE.PointsMaterial({color:0xffffff,size:2.2,sizeAttenuation:false,transparent:true,opacity:.85,fog:false,depthWrite:false}));stars.frustumCulled=false;this.dome.add(stars)}
  {const cr=[];for(let i=0;i<N;i++){const v=T.vl[i];if(v>=300)continue;let mn=true,mx=0;for(let q=-6;q<=6;q++)if(T.vl[(i+q+N)%N]<v){mn=false;break}if(!mn)continue;for(let q=1;q<=45;q++)mx=Math.max(mx,T.vl[(i-q+N)%N]);if(mx>v*1.7)cr.push({i,r:mx/v})}
   const cn=[];cr.sort((a,b)=>b.r-a.r);for(const c of cr)if(cn.length<7&&cn.every(a=>Math.abs(a-c.i)>60&&Math.abs(a-c.i)<N-60))cn.push(c.i);
   const skm=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),tyr=[],tec=[],msh=[],roof=[],mp=(i,s,o)=>{const m=T.at(i,s*o),h=-T.h[(i%N+N)%N];msh.push({x:m.x,y:m.y+4,z:m.z,sx:7,sy:8,sz:7,r:h,c:0xff7a00});roof.push({x:m.x,y:m.y+8.5,z:m.z,sx:9,sy:1,sz:9,r:h,c:0x222222})};
   for(const a of cn){const s=-Math.sign(T.ks[a])||1;
    for(const o of[5,11])L(T.strip(s*o-1.1,.1,s*o+1.1,.1,0x0a0a0c,a-36,28),skm,0);
    if(!st){if(def.id==='silver'){L(T.strip(s*(hw+8),.1,s*108,.1,0x555963,a-24,52),lam,0);L(T.strip(s*(hw+8),.14,s*(hw+20),.14,i=>((T.s[i]/9)|0)&1?K[0]:K[1],a-24,52),mK,0);L(T.strip(s*107,.14,s*109,.14,0xffffff,a-24,52),lam,0)}
     else{L(T.strip(s*(hw+8),.1,s*(hw+44),.1,0x4a4d55,a-14,30),lam,0);L(T.strip(s*(hw+44),.1,s*(bw-16),.1,def.id==='bahrain'?0xdcc085:0xb3a272,a-14,30),lam,0)}}
    for(let k=a-12;k<=a+14;k+=2){const p=T.at(k,s*(bw-7));for(let y=0;y<3;y++)tyr.push({x:p.x,y:p.y+1.6+y*3.2,z:p.z,c:((k>>1)+y)%3?0x1a1a1a:0xdd2222});
     if(k%4==0){const q=T.at(k,s*(bw-1.5));tec.push({x:q.x,y:q.y+2.5,z:q.z,sx:8,sy:5,sz:3.5,r:-T.h[(k%N+N)%N],c:cfg.tecPro[(k>>2)&1]})}}
    mp(a+6,s,bw+16)}
   const fl=[],fp=[],gp=Math.round(N/16);for(let i=20;i<N;i+=gp){const s=(i/gp|0)%2?1:-1,p=T.at(i,s*(bw+8));fp.push({x:p.x,y:p.y+9,z:p.z});fl.push({x:p.x,y:p.y+18,z:p.z,r:-T.h[i]})}
   for(let i=40;i<N;i+=65)mp(i,(i/65|0)%2?1:-1,bw+14);
   inst(new THREE.CylinderGeometry(3.6,3.6,3,10),matW,tyr);inst(B1,matW,tec);inst(B1,matW,msh);inst(B1,matW,roof);inst(new THREE.CylinderGeometry(.6,.6,18,5),mat(0x444444),fp);
   this.flagM=new THREE.MeshBasicMaterial({color:0x39d353});inst(new THREE.BoxGeometry(9,5,.8),this.flagM,fl)}
{/* ---- selective apex / exit kerbs + start grid ---- */
   const kc=[],ord=[];for(let i=0;i<N;i++){const v=T.vl[i];if(v>=400)continue;let mn=true;for(let q=-6;q<=6;q++)if(T.vl[(i+q+N)%N]<v){mn=false;break}if(mn)ord.push(i)}
   ord.sort((a,b)=>T.vl[a]-T.vl[b]);for(const i of ord){if(kc.length>=18)break;if(kc.every(a=>{const d=Math.abs(a-i);return Math.min(d,N-d)>34}))kc.push(i)}
   for(const a of kc){const si=Math.sign(T.ks[a])||1,len=T.vl[a]<220?11:8;
    L(T.strip(si*hw,.2,si*(hw+7.5),.36,i=>sa(i)?K[0]:K[1],(a-len+N)%N,len*2+1),mK,0);
    L(T.strip(-si*hw,.2,-si*(hw+7.5),.36,i=>sa(i)?K2[0]:K2[1],(a+3)%N,len+12),mK,0);
    if(cfg.kerbBorder!=null){L(T.strip(si*(hw+7.5),.22,si*(hw+10.5),.22,cfg.kerbBorder,(a-len+N)%N,len*2+1),lam,0);L(T.strip(-si*(hw+7.5),.22,-si*(hw+10.5),.22,cfg.kerbBorder,(a+3)%N,len+12),lam,0)}}
   const pf=new THREE.PlaneGeometry(1,1);pf.rotateX(-Math.PI/2);const G2=[];
   for(let k=0;k<TEAMS.length;k++){const si=(N-4-k*6+N)%N,p=T.at(si,k%2?hw*.4:-hw*.4),h=-T.h[si],fx=T.tx[si],fy=T.ty[si],nx=-T.ty[si],nz=T.tx[si];
    G2.push({x:p.x+fx*7,y:p.y+.16,z:p.z+fy*7,sx:1.4,sz:12,r:h});for(const o of[-6,6])G2.push({x:p.x+nx*o-fx*0,y:p.y+.16,z:p.z+nz*o-fy*0,sx:14,sz:1.1,r:h})}
   inst(pf,new THREE.MeshBasicMaterial({color:0xffffff,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),G2)}
  this.sun.position.set(300,500,200);
  {/* ---- per-circuit atmosphere ---- */
   const flat=q=>{q=q.toNonIndexed();q.computeVertexNormals();return q},
   pines=(P,cols)=>{inst(new THREE.CylinderGeometry(1.2,1.8,10,5),mat(0x3d2a18),P.map(p=>({x:p.x,y:p.y+5,z:p.z})));inst(flat(new THREE.ConeGeometry(11,24,6)),matW,P.map(p=>({x:p.x,y:p.y+18,z:p.z,sx:rnd(.8,1.3),sz:rnd(.8,1.3),sy:rnd(.9,1.5),c:cols[Math.random()*cols.length|0]})));inst(flat(new THREE.ConeGeometry(8.5,20,6)),matW,P.map(p=>({x:p.x,y:p.y+30,z:p.z,sy:rnd(.9,1.4),c:cols[Math.random()*cols.length|0]})));inst(flat(new THREE.ConeGeometry(5.5,16,6)),matW,P.map(p=>({x:p.x,y:p.y+42,z:p.z,sy:rnd(.9,1.4),c:cols[Math.random()*cols.length|0]})))},
    broad=(P,cols)=>{inst(new THREE.CylinderGeometry(1.3,2,12,5),mat(0x4a3220),P.map(p=>({x:p.x,y:p.y+6,z:p.z})));inst(flat(new THREE.IcosahedronGeometry(1,0)),matW,P.map(p=>({x:p.x,y:p.y+22,z:p.z,sx:rnd(11,17),sy:rnd(9,14),sz:rnd(11,17),c:cols[Math.random()*cols.length|0]})));inst(flat(new THREE.IcosahedronGeometry(1,0)),matW,P.map(p=>({x:p.x+rnd(-5,5),y:p.y+30,z:p.z+rnd(-5,5),sx:rnd(7,11),sy:rnd(6,9),sz:rnd(7,11),c:cols[Math.random()*cols.length|0]})))},
    palms=P=>{const hA=P.map(p=>({x:p.x,y:p.y,z:p.z,h:rnd(30,44),ln:rnd(-.1,.1)}));
     inst(new THREE.CylinderGeometry(.9,1.9,1,6),mat(0x6e5236),hA.map(p=>({x:p.x,y:p.y+p.h*.5,z:p.z,sy:p.h,rz:p.ln})));
     const fg=new THREE.ConeGeometry(3.2,24,4);fg.rotateZ(-Math.PI/2);fg.scale(1,.18,1);fg.translate(11,0,0);
     const A=[],PC=[0x1f7e32,0x2b943c,0x37a644,0x246e2b];
     hA.forEach(p=>{const tx=p.x-Math.sin(p.ln)*p.h*.5,ty=p.y+p.h;for(let k=0;k<8;k++)A.push({x:tx,y:ty,z:p.z,r:k*TAU/8+rnd(-.2,.2),rz:-rnd(.18,.52),sx:rnd(.85,1.15),c:PC[k%4]});for(let k=0;k<4;k++)A.push({x:tx,y:ty+1.2,z:p.z,r:k*TAU/4+rnd(0,.6),rz:rnd(.1,.3),sx:.72,c:0x3eb44c})});
     inst(fg,matW,A)},
    hills=(n,a,b,hc,hmn,hmx)=>{const A=[];for(let k=0;k<n;k++){const p=rp(a,b,a*.8);if(p){const r=rnd(hmx*1.4,hmx*2.6);A.push({x:p.x,y:gy-10,z:p.z,sx:r,sy:rnd(hmn,hmx),sz:r,c:hc[Math.random()*hc.length|0]})}}inst(new THREE.SphereGeometry(1,12,8),matW,A)},
    outerRidge=(c1,c2,h1,h2)=>{let cx=0,cz=0,maxR=0;for(let i=0;i<N;i++){cx+=T.x[i];cz+=T.y[i]}cx/=N;cz/=N;for(let i=0;i<N;i++)maxR=Math.max(maxR,Math.hypot(T.x[i]-cx,T.y[i]-cz));
     const mtGeo=flat(new THREE.ConeGeometry(1,1,5)),mtMat=new THREE.MeshLambertMaterial({color:0xffffff,map:TX.mt}),A1=[],A2=[];
     for(let k=0;k<30;k++){const a=k/30*TAU+rnd(-.07,.07),w=rnd(680,1120),r=maxR+w*.65+rnd(700,1300),h=rnd(h1[0],h1[1]),mx=cx+Math.cos(a)*r,mz=cz+Math.sin(a)*r;if(free(mx,mz,w*.7+bw+300))A1.push({x:mx,y:gy+h*.44,z:mz,sx:w,sy:h,sz:w,r:rnd(0,TAU),c:c1[k%c1.length]})}
     for(let k=0;k<26;k++){const a=k/26*TAU+rnd(-.08,.08),w=rnd(950,1500),r=maxR+w*.75+rnd(1900,2900),h=rnd(h2[0],h2[1]),mx=cx+Math.cos(a)*r,mz=cz+Math.sin(a)*r;if(free(mx,mz,w*.7+bw+400))A2.push({x:mx,y:gy+h*.45,z:mz,sx:w,sy:h,sz:w,r:rnd(0,TAU),c:c2[k%c2.length]})}
     inst(mtGeo,mtMat,A1);inst(mtGeo,mtMat,A2)},
    bush=(n,a,b,cols)=>inst(new THREE.SphereGeometry(1,6,5),matW,many(n,a,b,8,p=>({x:p.x,y:p.y+2,z:p.z,sx:rnd(5,9),sy:rnd(3,6),sz:rnd(5,9),c:cols[Math.random()*cols.length|0]})));
   if(sc==='spa'){this.scene.fog.near=900;this.scene.fog.far=6500;outerRidge([0x24472e,0x2c5436,0x1d3b26],[0x4b635e,0x58726d,0x3f5753],[460,820],[720,1240]);pines(many(480,bw+22,bw+480,16,p=>p),[0x143d22,0x1b4a2a,0x0f3320]);bush(240,bw+8,bw+200,[0x2c5a2a,0x3a6a2e,0x21501f])}
   if(sc==='imola'){outerRidge([0x3b6935,0x49783a,0x647d38],[0x68856d,0x76927c,0x5e7a64],[320,580],[520,880]);broad(many(200,bw+30,bw+560,18,p=>p),[0x2f7d32,0x3f8f3a,0x5a8a2a,0x8a8a2a]);bush(120,bw+8,bw+160,[0x3a7a30,0x4a8a3a])}
   if(sc==='monza'){outerRidge([0x356233,0x40703a,0x2d542d],[0x6a838c,0x7a939e,0x5e7782],[260,460],[540,940]);broad(many(380,bw+26,bw+760,20,p=>p),[0x2c6b2e,0x3a7a30,0x23572a,0x5a8a2a]);bush(120,bw+8,bw+160,[0x2c5a2a,0x3a6a2e])}
   if(sc==='sepang'){palms(many(150,bw+16,bw+420,14,p=>p));
    {const P=[],st2=hi?6:10;for(let i=-40;i<N;i+=st2)for(const s of[1,-1]){const o=s*(bw+190+rnd(-8,8)),ii=nz(i),p=T.at(ii,o);if(free(p.x,p.z,bw+8)){p.y=surf(ii,o);P.push(p)}}palms(P)}
    broad(many(55,bw+55,bw+560,20,p=>p),[0x2a6d33,0x357d3b,0x225a2b,0x3f843a]);
    bush(200,bw+8,bw+160,[0xd62858,0xf27036,0x2b7e38,0xe8bc34,0x246b30]);
    outerRidge([0x426e52,0x4b785c,0x3a644b],[0x6c8c88,0x769696,0x648482],[380,720],[620,1100]);
    const bf=[],bp=[],BC=[0xe0245e,0xffd23f,0x1fb5a6,0xff7a3d,0xffffff];for(let i=0;i<150;i+=3)for(const s of[1,-1]){const o=s*(bw+16),p=T.at(i,o);if(!free(p.x,p.z,bw+4))continue;const y=surf(i,o);bf.push({x:p.x,y:y+22,z:p.z,r:-T.h[i],sx:.4,sy:4,sz:5,c:BC[(i/3|0)%5]});if(i%6===0)bp.push({x:p.x,y:y+12,z:p.z})}
    inst(B1,matW,bf);inst(new THREE.CylinderGeometry(.5,.5,24,5),mat(0x666666),bp)}
   if(sc==='silver'){outerRidge([0x3b6338,0x456e40,0x335832],[0x6e857a,0x7c9288,0x627970],[140,260],[240,420]);const hg=[];for(let k=0;k<5;k++){const p=rp(420,900,240);if(p)hg.push({x:p.x,y:p.y+22,z:p.z,sx:rnd(220,300),sy:44,sz:rnd(80,110),r:rnd(0,TAU),c:0xb9c0c8})}inst(B1,matW,hg);
    for(const s of[1,-1]){L(T.strip(s*(hw+8),.06,s*92,.06,0x5b5f69,0,N),lam,0);L(T.strip(s*90.5,.07,s*92,.07,0xffffff,0,N),lam,0)}}
   if(sc==='bahrain'){outerRidge([0x8f744c,0x7e6440,0x9a7e54],[0x4c3f34,0x3f342d,0x56483b],[180,340],[300,520]);palms(many(40,bw+20,bw+240,14,p=>p))}
   if(sc==='jeddah')palms(many(50,bw+30,bw+300,14,p=>p));
   if(sc==='monaco'){outerRidge([0x7c7b72,0x8b867a,0x6d6e68],[0x8a959c,0x98a2aa,0x7e8a92],[380,680],[620,1040]);const bt=[],ms=[],sl=[],pr=[];for(let k=0;k<(hi?60:30);k++){const p=rp(760,1900,700);if(!p)continue;const r=rnd(0,TAU),l=rnd(28,60);bt.push({x:p.x,y:gy+2,z:p.z,sx:l,sy:5,sz:l*.26,r,c:[0xffffff,0xf2f2f2,0x1d2a4a,0xfaf0dc][Math.random()*4|0]});ms.push({x:p.x,y:gy+22,z:p.z});if(k%3===0)sl.push({x:p.x,y:gy+30,z:p.z,r,c:0xffffff})}
    for(let k=0;k<5;k++){const p=rp(900,1600,760);if(p)pr.push({x:p.x,y:gy+3,z:p.z,sx:300,sy:6,sz:18,r:rnd(0,TAU),c:0xb8b2a4})}
    inst(B1,matW,bt);inst(B1,matW,pr);inst(new THREE.CylinderGeometry(.5,.5,40,5),mat(0xdddddd),ms);inst(new THREE.BoxGeometry(.5,34,15),matW,sl)}
  }
  {/* ---- pit complex: wall, gantries, team garages, crews, markings ---- */
   const pe=T.pe,px=T.px,pu=u=>(u+N)%N,dep=Math.min(36,bw-105-S),cy=100+S+dep/2,pa=(b,o,d)=>{const p=T.at(b,o);return{x:p.x+T.tx[b]*d,y:p.y,z:p.z+T.ty[b]*d}},gw=[],gr=[],gg=[],cB=[],cH=[],ty=[],ct=[],mo=[],mp=[],i0=pu(-pe+22),cnt=pe+px-44;
   L(T.strip(54+S,0,54+S,4.2,0xbfc3cb,i0,cnt),lam,0);L(T.strip(54+S,4.2,58+S,4.2,0x8d9199,i0,cnt),lam,0);L(T.strip(54.3+S,3.6,54.3+S,4.3,i=>sa(i)?0xd4141c:0xffffff,i0,cnt),mK,0);
   // Proper pit entry & exit guide lines + green/white chevron merge apron + PIT IN bollard
   L(T.strip(i=>T.pitOff(i)-21,.16,i=>T.pitOff(i)-19.2,.16,0xffffff,N-pe,pe+px),lam,0);L(T.strip(i=>T.pitOff(i)+19.2,.16,i=>T.pitOff(i)+21,.16,0xffffff,N-pe,pe+px),lam,0);
   L(T.strip(hw-1.5,.15,i=>T.pitOff(i)-21,.15,i=>((i>>1)&1)?0x2a7d44:0xf4f4f4,N-pe+6,16),lam,0);
   L(T.strip(hw-1.5,.15,i=>T.pitOff(i)-21,.15,0xf4f4f4,pu(px-22),18),lam,0);
   L(T.strip(57+S,.18,101+S,.18,0xffd400,pu(-pe+24),1),lam,0);L(T.strip(57+S,.18,101+S,.18,0x38e07b,pu(px-24),1),lam,0);
   {const pb=pu(-pe+21),pp=T.at(pb,55+S),bol=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.8,6.5,10),mat(0xff6a00));bol.position.set(pp.x,pp.y+3.25,pp.z);R.add(bol);
    const pSign=new THREE.Mesh(new THREE.PlaneGeometry(14,7),new THREE.MeshBasicMaterial({map:tex2(160,80,2,(x,w,h)=>{x.fillStyle='#0a2a6a';x.fillRect(0,0,w,h);x.strokeStyle='#fff';x.lineWidth=4;x.strokeRect(3,3,w-6,h-6);x.fillStyle='#fff';x.font='900 32px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('PIT IN ›',w/2,h/2)}),side:THREE.DoubleSide}));
    pSign.position.set(pp.x,pp.y+10,pp.z);pSign.rotation.y=-T.h[pb]-Math.PI/2;R.add(pSign)}
   const lt=tex2(128,128,2,(x,w,h)=>{x.clearRect(0,0,w,h);x.lineWidth=14;x.strokeStyle='#e31b23';x.beginPath();x.arc(64,64,54,0,TAU);x.stroke();x.fillStyle='#fff';x.font='bold 56px Arial';x.textAlign='center';x.fillText('80',64,84)}),lm=new THREE.MeshBasicMaterial({map:lt,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
   for(const u of[-pe+32,-4]){const b=pu(u),p=T.at(b,70+S),m=new THREE.Mesh(new THREE.PlaneGeometry(26,26),lm);m.rotation.order='YXZ';m.rotation.x=-Math.PI/2;m.rotation.y=-T.h[b]-Math.PI/2;m.position.set(p.x,p.y+.22,p.z);R.add(m)}
   const gt2=tex2(256,64,2,(x,w,h)=>{x.fillStyle='#05080f';x.fillRect(0,0,w,h);x.fillStyle='#ff3b30';x.font='bold 30px Arial';x.textAlign='center';x.fillText('PIT LANE  80',w/2,30);x.fillStyle='#39ff88';x.font='bold 22px Arial';x.fillText('SPEED LIMIT',w/2,56)}),gm=new THREE.MeshBasicMaterial({map:gt2});
   for(const u of[-pe+36,30]){const b=pu(u),g=new THREE.Group(),p=T.at(b,0);g.position.set(p.x,p.y,p.z);g.rotation.y=-T.h[b];
    const bm=new THREE.Mesh(new THREE.BoxGeometry(3,3,54),mat(0x2b2e36));bm.position.set(0,31,79+S);g.add(bm);
    for(const o of[53+S,105+S]){const pl=new THREE.Mesh(new THREE.BoxGeometry(3,31,3),mat(0x3a3d46));pl.position.set(0,15.5,o);g.add(pl)}
    const s1=new THREE.Mesh(new THREE.PlaneGeometry(30,8),gm);s1.position.set(-1.8,31,79+S);s1.rotation.y=-Math.PI/2;g.add(s1);const s2=new THREE.Mesh(new THREE.PlaneGeometry(30,8),gm);s2.position.set(1.8,31,79+S);s2.rotation.y=Math.PI/2;g.add(s2);
    const lb=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,52),new THREE.MeshBasicMaterial({color:0xfff2c0}));lb.position.set(0,29.2,79+S);g.add(lb);R.add(g)}
   const mon=tex2(128,72,2,(x,w,h)=>{x.fillStyle='#07101e';x.fillRect(0,0,w,h);for(let r=0;r<6;r++){x.fillStyle=r%2?'#39a0ff':'#9ad0ff';x.fillRect(6,8+r*11,22,6);x.fillStyle='#39ff88';x.fillRect(36,8+r*11,60+(r*13)%30,6)}}),mm2=new THREE.MeshBasicMaterial({map:mon});
   for(let t=0;t<TEAMS.length;t++){const b=pu(pitBox(t)),c=TEAMS[t].c,g=T.at(b,cy),r=-T.h[b];
    gw.push({x:g.x,y:g.y+7,z:g.z,sx:66,sy:14,sz:dep,r,c:0x2b2f38});gr.push({x:g.x,y:g.y+14.7,z:g.z,sx:70,sy:1.4,sz:dep+4,r,c:0x434956});
    const f1=T.at(b,100.3+S);gg.push({x:f1.x,y:f1.y+5.2,z:f1.z,sx:58,sy:8,sz:.5,r,c:0xfff1cf});
    const lum=((c>>16&255)*.3+(c>>8&255)*.6+(c&255)*.1)>150,sg2=new THREE.Mesh(new THREE.PlaneGeometry(58,5.4),new THREE.MeshBasicMaterial({map:tex2(256,24,2,(x,w,h)=>{x.fillStyle=hex(c);x.fillRect(0,0,w,h);x.fillStyle=lum?'#111':'#fff';x.font='bold 20px Arial';x.textAlign='center';x.fillText(TEAMS[t].n.toUpperCase()+'  #'+(t+1),w/2,19)}),side:THREE.DoubleSide})),sp=T.at(b,100.8+S);sg2.position.set(sp.x,sp.y+12,sp.z);sg2.rotation.y=-T.h[b]+Math.PI;R.add(sg2);
    const bi=pu(pitBox(t)-2);L(T.strip(72+S,.16,86+S,.16,c,bi,4),lam,0);L(T.strip(72+S,.17,73+S,.17,0xffffff,bi,4),lam,0);L(T.strip(85+S,.17,86+S,.17,0xffffff,bi,4),lam,0);L(T.strip(72+S,.17,86+S,.17,0xffffff,pu(pitBox(t)-2),1),lam,0);L(T.strip(72+S,.17,86+S,.17,0xffffff,pu(pitBox(t)+1),1),lam,0);
    [-24,-15,-6,3,12,21].forEach((d,k)=>{const q=pa(b,97+S,d);cB.push({x:q.x,y:q.y+3.2,z:q.z,c:k%3?c:0xffffff});cH.push({x:q.x,y:q.y+7.2,z:q.z,c:0xf2f2f2})});
    for(const d of[-31,31]){const q=pa(b,97+S,d);for(let y=0;y<3;y++)ty.push({x:q.x,y:q.y+1.2+y*2.4,z:q.z,c:0x141416});ty.push({x:q.x,y:q.y+7.5,z:q.z,sx:.9,sy:.3,sz:.9,c:[0xff2a2a,0xffd400,0xf2f2f2][t%3]})}
    [-10,10].forEach(d=>{const q=pa(b,98+S,d);ct.push({x:q.x,y:q.y+2.4,z:q.z,sx:6,sy:4.8,sz:3.4,r,c:0x9aa0aa})});
    const w2=T.at(b,55.2+S);mo.push({x:w2.x,y:w2.y+8.5,z:w2.z,sx:12,sy:6.5,sz:.8,r,c:0xffffff});mp.push({x:w2.x,y:w2.y+3.5,z:w2.z})}
   inst(B1,matW,gw);inst(B1,matW,gr);inst(B1,new THREE.MeshBasicMaterial({color:0xffffff}),gg);inst(new THREE.CylinderGeometry(1.1,1.3,6.4,8),matW,cB);inst(new THREE.SphereGeometry(1.25,8,6),matW,cH);inst(new THREE.CylinderGeometry(3.6,3.6,2.4,10),matW,ty);inst(B1,matW,ct);inst(B1,mm2,mo);inst(new THREE.CylinderGeometry(.5,.5,7,5),mat(0x444444),mp)}

 }
 spawnBG(){this.clearCars();const T=this.T;this.state='menu';this.cars=[];for(let k=0;k<8;k++){const c=new Car(k%TEAMS.length,'SMH'[k%3],false,.94+Math.random()*.04,rnd(-18,18)),i=(k*Math.floor(T.N/8)+10)%T.N,p=T.at(i,c.line);Object.assign(c,{x:p.x,y:p.z,a:T.h[i],px:p.x,py:p.z,pa:T.h[i],pey:p.y,idx:i,pidx:i,ey:p.y,vx:Math.cos(T.h[i])*200,vy:Math.sin(T.h[i])*200});this.addCar(c)}this.mt=0}
 clearCars(){for(const c of this.cars)this.scene.remove(c.o.g);this.cars=[]}
 carName(c){if(c.pname)return c.pname;const d=(DR[c.team]||[])[c.drv||0];return d?d[0]:TEAMS[c.team].n}
 shortName(c){if(c.pname)return c.pname.toUpperCase().slice(0,11);const d=(DR[c.team]||[])[c.drv||0];if(!d)return TEAMS[c.team].a;const parts=d[0].replace(/\sJr\.$/,'').split(' ');return parts[parts.length-1].toUpperCase().slice(0,11)}
 addCar(c){if(!c.isP){const lbl=mkLabel(this.shortName(c),hex(TEAMS[c.team].c));c.o.g.add(lbl);c.o.lbl=lbl}this.scene.add(c.o.g);this.cars.push(c)}

 /* ---------- race flow ---------- */
 skid(ax,az,bx,bz,y){const dx=bx-ax,dz=bz-az,l=Math.hypot(dx,dz)||1,nx=-dz/l*.7,nz=dx/l*.7;this.skP.set([ax+nx,y+.25,az+nz,ax-nx,y+.25,az-nz,bx-nx,y+.25,bz-nz,bx+nx,y+.25,bz+nz],(this.skI++%1400)*12);this.skD=true}
 hit(c,h){if(c.isP)this.yel=6;c.dmg=Math.min(1,c.dmg+h);for(let i=0;i<14;i++)this.sparks.emit(c.x,c.ey+3,c.y,rnd(-120,120),rnd(20,120),rnd(-120,120),.6);if(c.isP&&c.dmg>.2)this.msg('FRONT WING DAMAGE '+Math.round(c.dmg*100)+'%')}
startSeries(){this.cleanRun();this.sfx.init();const q=this.flow.mode==='gp'?[this.sel.track]:this.flow.queue;this.ser={q,i:0,pts:{},sess:this.sel.sess,base:this.sel.sess,laps:this.sel.laps};this.gridPos=7;this.runNext()}
 runNext(){this.fade(()=>this.runNow())}
 runNow(){this.cleanRun();const s=this.ser,ix=s.q[s.i];this.sel.track=ix;if(this.curTrack!==ix)this.loadTrack(ix);this.clearCars();$('res').style.display='none';this.mp=false;s.sess==='race'?this.raceSP():this.soloSP()}
 diffMul(df){return({easy:.86,normal:.97,hard:1.04}[df||this.sel.diff])||.97}
 raceSP(){const sel=this.sel,dm=this.diffMul(),ai=TEAMS.map((t,i)=>i).filter(i=>i!=sel.team).sort((a,b)=>TEAMS[b].s-TEAMS[a].s);ai.splice(Math.min(this.gridPos,TEAMS.length-1),0,sel.team);
  ai.forEach((ti,k)=>{const p=ti==sel.team,c=new Car(ti,p?sel.tire:'SMMHM'[Math.random()*5|0],p,(TEAMS[ti].s+(Math.random()-.5)*.015)*dm,rnd(-15,15),p?sel.drv:0);this.grid(c,k);if(p)this.P=c;this.addCar(c)});this.begin(this.ser.laps,.8+Math.random()*1.6)}
 soloSP(){const sel=this.sel,c=new Car(sel.team,sel.tire,true,1,0,sel.drv);this.grid(c,0);this.P=c;this.addCar(c);this.begin(this.ser.laps,0,true)}
 grid(c,k){const T=this.T,si=(T.N-4-k*6+T.N)%T.N,lat=k%2?T.hw*.4:-T.hw*.4,p=T.at(si,lat);Object.assign(c,{x:p.x,y:p.z,a:T.h[si],px:p.x,py:p.z,pa:T.h[si],pey:p.y,idx:si,pidx:si,ey:p.y,vx:0,vy:0})}
begin(laps,h,solo){this.laps=laps;this._hs={};this._hudT=1;this.lastGear=null;this.acc=0;this.clearFade();if(this.camera){this.camera.clearViewOffset();this.camera.fov=this.set.fov}this.resize();if(this.P)this.cam.a=this.P.a;if(this.plat&&this.plat.onRaceStart)this.plat.onRaceStart();else if(this.isMob&&screen.orientation&&screen.orientation.lock){screen.orientation.lock('landscape').catch(()=>{})}this.sfx.silenceRace();this.sfx.playTheme('off');this.sfx.mode=this.sel.eng||'v8';Object.assign(this,{state:solo?'race':'lights',lt:0,lit:0,hold:h,raceT:0,pen:0,jump:false,pit:null,nextTire:this.P.tire,doneT:-1,outro:null,tip:8,order:null,wn:0});
  this.go(null);$('hud').style.display='block';$('lights').style.display=solo?'none':'flex';this.tw=0;
  $('tower').innerHTML=this.cars.map(()=>'<div class="tr"><b></b><img class="lg" alt=""><span></span><i class="ty"></i><em></em></div>').join('');this.msg(solo?'Cross the line to start timing':'FORMATION COMPLETE');$('hint').style.opacity=1;this.hintT=9;this.qbar();this.frame(0)}
  cross(c){if(this.state==='menu')return;if(c.lap===0){c.lapStart=this.raceT;return}
  if(c.lap>=1){const lt=this.raceT-c.lapStart;c.lapStart=this.raceT;c.laps.push(lt);if(lt<c.best){c.best=lt;if(c.isP)this.msg('PERSONAL BEST '+fmt(lt))}}
  if(c.lap>=this.laps&&c.fin==null){c.fin=this.raceT+(c.isP?this.pen:0);if(c.isP){this.msg('CHEQUERED FLAG!');this.doneT=0}}}
 ctrlP(c,dt){
  // Easy Pit Autopilot: auto-steers at 80 km/h into team pit box, stops for service, then exits pit cleanly!
  if(this.pitAuto&&this.state==='race'){
   const T=this.T,N=T.N,u=c.idx>N/2?c.idx-N:c.idx,bx=pitBox(c.team),la=Math.floor(4+c.spd/35),ti=(c.idx+la)%N,tu=ti>N/2?ti-N:ti;
   const po=T.pitOff(ti);let off=po!=null?po-12:70+T.S;
   if(this.pitAuto===1&&Math.abs(tu-bx)<=12)off=79+T.S;
   if(this.pitAuto===3)off=po!=null?po-10:T.hw*.5;
   const tx=T.x[ti]-T.ty[ti]*off,ty=T.y[ti]+T.tx[ti]*off,err=angd(Math.atan2(ty-c.y,tx-c.x),c.a);
   c.steer+=(clamp(err*2.4,-1,1)-c.steer)*Math.min(1,dt*10);c.sAdd=0;c.bAs=0;c.ersOn=false;c.eAs=false;
   let vt=105;if(this.pitAuto===1){const dd=Math.max(0,(bx-u)*18);vt=Math.min(105,10+Math.sqrt(210*dd))}
   if(c.spd<vt-2){c.thr=.85;c.brk=0}else if(c.spd>vt+4){c.thr=0;c.brk=clamp((c.spd-vt)/22,0,1)}else{c.thr=.25;c.brk=0}
   return;
  }
  const k=this.keys,st=(k.right?1:0)-(k.left?1:0);c.steer+=(st-c.steer)*Math.min(1,dt*(st?6:10)*this.set.steer);c.thr+=((k.up?1:0)-c.thr)*Math.min(1,dt*9);c.brk=k.down?1:0;if(c.brk)c.thr=0;c.ersOn=!!k.ers;
  c.sAdd=0;c.bAs=0;c.eAs=false;if(this.sel.ea==='on'&&!c.ersOn&&this.state==='race'&&!c.inPit&&c.ers>30&&c.thr>.9&&!c.brk&&Math.abs(c.steer)<.25&&this.T.vl[(c.idx+14)%this.T.N]>380){c.ersOn=true;c.eAs=true}const AL={off:0,low:1,high:2},sa=AL[this.sel.sa]||0,ba=AL[this.sel.ba]||0;
  if((sa||ba)&&this.state==='race'&&!c.inPit&&!this.pit){const T=this.T,N=T.N,vf=c.vx*Math.cos(c.a)+c.vy*Math.sin(c.a);
   if(vf>35){
    if(sa){const kk=[0,.45,.9][sa],vl=-c.vx*Math.sin(c.a)+c.vy*Math.cos(c.a);let add=clamp(vl/Math.max(vf,60)*2.6,-.7,.7)*kk*1.3;
     if(Math.abs(c.d)<T.bw){const ti=(c.idx+Math.floor(6+c.spd/24))%N,off=T.lo[ti],tx=T.x[ti]-T.ty[ti]*off,ty=T.y[ti]+T.tx[ti]*off,err=angd(Math.atan2(ty-c.y,tx-c.x),c.a);add+=clamp(err*1.5,-.6,.6)*kk*.55*(1-clamp(Math.abs(st)*2.5,0,1))}
     c.sAdd=clamp(add,-.6,.6)}
    if(ba){const v=c.spd,n=Math.ceil(v*1.7/18)+3;let need=0,dist=0;for(let q=1;q<=n;q++){const j=(c.idx+q)%N;dist+=T.ds[(c.idx+q-1)%N];const vt=T.vl[j]*(ba===1?1.04:.95);if(vt<340&&v>vt){const a=(v*v-vt*vt)/(2*Math.max(dist,24));if(a>need)need=a}}
     const b=clamp((need-115)/165,0,1)*(ba===1?.45:.85);if(b>c.brk){c.brk=b;c.thr*=1-b*.85;c.bAs=b}}}}}
 ctrlAI(c,dt){const T=this.T,N=T.N,spd=c.spd,la=Math.floor(6+spd/22),ti=(c.idx+la)%N,u=c.idx>N/2?c.idx-N:c.idx,tu=ti>N/2?ti-N:ti;
  if(this.state==='race'&&!c.remote)this.aiPit(c,dt,u);
  if(c.pitS===3){c.thr=0;c.brk=0;c.vx=c.vy=0;c.ersOn=false;return}
  const ps=c.pitS;let baseOff=clamp(T.lo[ti]+c.line*.35,-T.hw*.8,T.hw*.8),targetEvade=0,yieldSpd=1e9;
  if(!ps){
   // Predictive collision lookahead (0.35s, 0.75s, 1.25s) using position, velocity & car width
   let threat=null,bestT=99,leftBlk=false,rightBlk=false;
   for(const o of this.cars){if(o===c)continue;
    const dp=o.prog-c.prog;if(dp<-30||dp>260)continue;
    if(Math.abs(dp)<34){if(o.d<c.d-6)leftBlk=true;if(o.d>c.d+6)rightBlk=true}
    for(const t of[.35,.75,1.25]){
     const dx=(o.x+o.vx*t)-(c.x+c.vx*t),dy=(o.y+o.vy*t)-(c.y+c.vy*t),dist=Math.hypot(dx,dy);
     if(dist<28&&t<bestT){bestT=t;threat={o,dp,t,dist}}
    }
   }
   if(threat){
    const o=threat.o,lim=T.hw-12,roomL=Math.abs(-lim-o.d),roomR=Math.abs(lim-o.d);
    const pref=(!leftBlk&&(rightBlk||roomL>roomR))?-1:(!rightBlk?1:0);
    if(pref)targetEvade=clamp(o.d+pref*28,-lim,lim)-baseOff;
    const tight=T.vl[ti]<260;
    if(!pref||(tight&&threat.dp>0&&threat.dp<70)||threat.dist<20)yieldSpd=Math.min(yieldSpd,o.spd*(tight?.88:.94));
   }
   const rate=Math.abs(targetEvade)>.5?3.8:1.8;
   c.evadeOff+=(targetEvade-c.evadeOff)*Math.min(1,dt*rate);
  }else c.evadeOff=0;
  let off=ps?(T.pitOff(ti)!=null?T.pitOff(ti)-14:34+T.S):clamp(baseOff+c.evadeOff,-T.hw+10,T.hw-10);
  if(ps===2&&Math.abs(tu-pitBox(c.team))<=7)off=79+T.S;
  const tx=T.x[ti]-T.ty[ti]*off,ty=T.y[ti]+T.tx[ti]*off,err=angd(Math.atan2(ty-c.y,tx-c.x),c.a);c.steer+=(clamp(err*2.2,-1,1)-c.steer)*Math.min(1,dt*8);
  const w=c.wear,wMul=w<.6?1-.08*(w/.6):w<.8?.92-.16*((w-.6)/.2):.76-.34*((w-.8)/.2),gripK=Math.sqrt(clamp(wMul*TIRES[c.tire].g,.45,1.05));
  let vt=Math.min(T.vl[(c.idx+Math.floor(4+spd/45))%N]*c.skill*gripK,yieldSpd);
  if(ps){vt=Math.min(vt,105);if(ps===1){const dd=Math.max(0,(-T.pe+6-u)*18);vt=Math.min(vt,Math.sqrt(105*105+300*dd))}if(ps===2){const dd=Math.max(0,(pitBox(c.team)-u)*18);vt=Math.min(vt,12+Math.sqrt(240*dd))}}
  if(spd<vt){c.thr=1;c.brk=0}else if(spd>vt*1.03){c.thr=0;c.brk=clamp((spd-vt)/25,0,1)}else{c.thr=.35;c.brk=0}c.ersOn=!ps&&c.ers>35&&c.thr==1&&T.vl[ti]>400}
 update(dt){
  const S=this.state,T=this.T;if(this.msgT>0&&(this.msgT-=dt)<=0)$('msg').textContent='';if(this.hintT>0&&(this.hintT-=dt)<=0)$('hint').style.opacity=0;if(this.flagM){this.yel=Math.max(0,(this.yel||0)-dt);this.flagM.color.setHex(this.yel>0?((performance.now()/300|0)%2?0xffe030:0xffa800):0x39d353)}
  if(S==='menu'){for(const c of this.cars){c.prog=c.lap*T.L+T.s[c.idx];c.update(dt,this)}for(const c of this.cars)c.sync(this,dt);return}
  if(S==='paused')return;
  if(this.mp&&(S==='lights'||S==='race'))this.sendS(dt);
  if(S==='lights'){this.lt+=dt;const lit=Math.min(5,Math.floor(this.lt/.9));if(lit>this.lit){this.lit=lit;this.sfx.beep(660,.15,.7)}
   [...$('lights').children].forEach((e,i)=>e.classList.toggle('o',i<lit));
   if(this.gantryBulbs)this.gantryBulbs.forEach((m,i)=>m.color.setHex(i<lit?0xff1a1a:0x2a0808));
   if(this.keys.up&&!this.jump&&this.lit>0){this.jump=true;this.pen=5;this.msg('JUMP START: +5s PENALTY')}
   if(this.lt>4.5+this.hold){this.state='race';$('lights').style.display='none';if(this.gantryBulbs)this.gantryBulbs.forEach(m=>m.color.setHex(0x2a0808));this.sfx.beep(1200,.5,.9);this.msg('LIGHTS OUT: GO GO GO!')}
   this.cars.forEach(c=>{c.prog=c.lap*T.L+T.s[c.idx];c.sync(this,dt)});this.sfx.engine(.3+(this.keys.up?.3:0),this.keys.up?1:0,.6);return}
  if(S==='done2'){
   // Live celebratory cooldown outlap + rotating 3D golden trophy alongside split-screen results panel
   for(const c of this.cars){if(c.dnf||c.remote)continue;c.wear=Math.min(c.wear,.4);c.pitS=0;c.update(dt,this)}
   for(const c of this.cars)c.sync(this,dt);
   if(this.outro){this.outro.t+=dt;const w=this.outro.win;
    if(w&&this.trophy){this.trophy.position.set(w.x,w.ey+16+Math.sin(this.outro.t*3)*1.2,w.y);this.trophy.rotation.y+=dt*2.4}
    if(w&&Math.random()<.45)this.sparks.emit(w.x+rnd(-9,9),w.ey+rnd(8,18),w.y+rnd(-9,9),rnd(-35,35),rnd(35,95),rnd(-35,35),.75)}
   return;
  }
  if(S!=='race'&&S!=='done')return;
  this.raceT+=dt;const P=this.P;
  const pu=P.idx>T.N/2?P.idx-T.N:P.idx,bx=pitBox(P.team);
  if(P.inPit&&!P.pitDone&&!this.pitAuto&&!this.pit){this.pitAuto=1;this.msg('PIT AUTOPILOT: 80 KM/H TO '+TEAMS[P.team].n.toUpperCase()+' BOX')}
  if(this.pitAuto===1&&P.inPit&&((Math.abs(pu-bx)<=4&&P.spd<34)||pu>=bx+1)){this.pit={t:0};this.pitAuto=2;P.vx=P.vy=0;this.msg('PIT STOP: SERVICING CAR')}
  this.pitAid(P,pu,dt);
  if(!P.inPit){if(this.pitAuto===3){this.pitAuto=0;this.msg('PIT EXIT CLEAR — FULL CONTROL!')}P.pitDone=false}
  if(this.pit){const q=this.pit;q.t+=dt;
   if(!q.g1&&q.t>=.45){q.g1=1;this.sfx.gun()}if(!q.g2&&q.t>=1.1){q.g2=1;this.sfx.gun()}
   if(!q.sw&&q.t>=1.5){q.sw=1;this.sfx.gun();Object.assign(P,{wear:0,tire:this.nextTire,warm:.3});this.msg(TIRES[P.tire].n+' TYRES FITTED')}
   if(!q.wf&&q.t>=1.95){q.wf=1;if(P.dmg>0){P.dmg=0;this.flash(P);this.msg('FRONT WING REPAIRED')}}
   if(q.t>=3){P.dmg=0;P.pitDone=true;P.pits++;this.pit=null;this.pitAuto=3;this.rel(P);this.msg('RELEASE! AUTO EXITING PIT LANE')}}
  P.hold=!!this.pit;this.wasPit=P.inPit;P.box=P.wear>.75;if(P.wear>.8&&this.wn<2){this.wn=2;this.msg('TYRES CRITICAL (>80%): SHARP GRIP DROP — BOX THIS LAP!')}else if(P.wear>.6&&!this.wn){this.wn=1;this.msg('TYRE WEAR >60%: PROGRESSIVE GRIP LOSS')}if(P.wear<.1)this.wn=0;
  // Off-track / stuck auto-recovery (5s) unless severe crash (dmg>=0.95) or tyre puncture (wear>=0.99)
  if(!P.inPit&&!this.pitAuto&&!this.pit&&this.doneT<0){
   const stuck=Math.abs(P.d)>T.hw+8&&P.spd<65;
   if(stuck){
    P.offT=(P.offT||0)+dt;
    if(P.dmg>=.95||P.wear>=.99){
     if(!P.dnf){P.dnf=true;P.vx=P.vy=P.spd=0;this.msg(P.wear>=.99?'DNF: TYRE PUNCTURE — RETIRED':'DNF: SEVERE CRASH DAMAGE — RETIRED');this.doneT=0.5}
    }else if(P.offT>=5){
     const i=P.idx;P.x=T.x[i];P.y=T.y[i];P.a=T.h[i];P.vx=Math.cos(P.a)*55;P.vy=Math.sin(P.a)*55;P.offT=0;P.offW=0;this.msg('RECOVERED TO TRACK — GO!')
    }else if(P.offT>=1.8){
     const rem=Math.ceil(5-P.offT);if(P.offW!==rem){P.offW=rem;this.msg('OFF TRACK — AUTO RECOVERY IN '+rem+'s')}
    }
   }else{P.offT=0;P.offW=0}
  }
  for(const c of this.cars){if(c.remote){this.rem(c,dt);continue}if(c===P&&(this.pit||P.dnf)){P.vx=P.vy=P.spd=P.slip=0;P.thr=0;P.rpm=.28;if(this.pit)this.snapBox(P,dt);continue}if(c.pitS===3&&c.hold)this.snapBox(c,dt);
   if(!c.isP&&!c.inPit&&Math.abs(c.d)>T.hw+10&&c.spd<40){c.offT=(c.offT||0)+dt;if(c.offT>=6){const i=c.idx;c.x=T.x[i];c.y=T.y[i];c.a=T.h[i];c.vx=Math.cos(c.a)*60;c.vy=Math.sin(c.a)*60;c.offT=0}}else if(!c.isP)c.offT=0;
   c.update(dt,this)}
  const nc=this.cars.length;for(let i=0;i<nc;i++)for(let j=i+1;j<nc;j++){const a=this.cars[i],b=this.cars[j],dx=b.x-a.x,dy=b.y-a.y,dd=Math.hypot(dx,dy);
   if(dd<24&&dd>.01){const nx=dx/dd,ny=dy/dd,ov=(24-dd)/2;a.x-=nx*ov;a.y-=ny*ov;b.x+=nx*ov;b.y+=ny*ov;const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
    if(rv<0){const q=-rv*.6;a.vx-=nx*q;a.vy-=ny*q;b.vx+=nx*q;b.vy+=ny*q;if(-rv>50){const h=.04+(-rv-50)/600;this.hit(a,h);this.hit(b,h);if(a.isP||b.isP)this.sfx.crash(.6)}}}}
  this.cars.forEach(c=>c.prog=c.lap*T.L+T.s[c.idx]);
  const key=c=>c.fin!=null?1e9-c.fin:c.prog,o=this.order=[...this.cars].sort((a,b)=>key(b)-key(a));
  o.forEach((c,i)=>{c.pos=i+1;const a=o[i-1];c.gap=a?(a.prog-c.prog)/Math.max(c.spd,100):0;c.drsAv=T.inDrs(c.idx)&&c.lap>=1&&!!a&&c.gap<1&&a.prog-c.prog<T.L/2;
   if(c.remote)return;if(!T.inDrs(c.idx)||c.brk>.3)c.drs=false;else if(c.drsAv)c.drs=true});
  for(const c of this.cars)c.sync(this,dt);this.crewUpd(dt);
  if(this.doneT<0){
   this.sfx.engine(P.rpm,P.thr,1,P.ersOn&&P.ers>0);
   if(this.lastGear!=null&&P.gear!==this.lastGear&&P.spd>35){
    const up=P.gear>this.lastGear;this.sfx.shift(up);
    if(!up&&P.spd>100){const f=[Math.cos(P.a),Math.sin(P.a)];for(let q=0;q<5;q++)this.sparks.emit(P.x-f[0]*19,P.ey+3.9,P.y-f[1]*19,-f[0]*80+rnd(-18,18),rnd(-4,12),-f[1]*80+rnd(-18,18),.22)}
   }this.lastGear=P.gear;
   this.sfx.brake(P.brk>.25&&P.spd>60?P.brk*Math.min(1,P.spd/240):0);
   this.sfx.screech(clamp((P.slip-38)/90,0,1));
  }
  if(this.doneT>=0){
   if(!this.outro){const win=(this.order&&this.order[0])||this.P;this.outro={t:0,win,fan:1};this.sfx.silenceRace();this.sfx.fanfare();this.sfx.playTheme('outro');this.msg('CHEQUERED FLAG! WINNER: '+this.shortName(win));
    if(!this.trophy){const tg=new THREE.Group(),gold=sm(0xffcc22,.16,.95,.9),base=sm(0x181c26,.4,.3);
     const pd=new THREE.Mesh(new THREE.CylinderGeometry(2.6,3.2,1.6,14),base);pd.position.y=.8;tg.add(pd);
     const stem=new THREE.Mesh(new THREE.CylinderGeometry(.6,1.2,3.2,12),gold);stem.position.y=3.2;tg.add(stem);
     const cup=new THREE.Mesh(new THREE.CylinderGeometry(2.4,1.0,3.4,14),gold);cup.position.y=6.2;tg.add(cup);
     this.trophy=tg;this.scene.add(tg)}}
   this.outro.t+=dt;
   const w=this.outro.win;
   if(w&&this.trophy){this.trophy.position.set(w.x,w.ey+16+Math.sin(this.outro.t*3)*1.2,w.y);this.trophy.rotation.y+=dt*2.4}
   if(w&&Math.random()<.45)this.sparks.emit(w.x+rnd(-9,9),w.ey+rnd(8,18),w.y+rnd(-9,9),rnd(-35,35),rnd(35,95),rnd(-35,35),.75);
   if(this.outro.t>=1.2){this.results()}
  }
 }
 results(){this.state='done2';this.sfx.silenceRace();this.sfx.playTheme('outro');$('hud').style.display='none';const P=this.P,s=this.ser||{q:[],i:0,pts:{},sess:'race'},T=this.T,tn=TRACKS[this.sel.track].n,PTS=[25,18,15,12,10,8,6,4,2,1];
  const tr=(a,b,c,d,me)=>`<tr${me?' style="font-weight:700;background:rgba(255,59,48,.22)"':''}><td>${a}</td><td>${b}</td><td>${c}</td><td>${d}</td></tr>`,sw=c=>`<img class="lg" src="${logo(c.team)}"> ${TEAMS[c.team].n}${c.pname?' · '+c.pname:c.drv!=null?' · '+DR[c.team][c.drv][0]:''}`;
  let h,nxt='',winCar=this.P;const solo=this.cars.length===1&&!this.mp,rd=s.q.length>1?`Round ${s.i+1}/${s.q.length} · `:'';
  if(!solo){const o=[...this.cars].sort((a,b)=>(a.fin!=null?a.fin:1e8-a.prog)-(b.fin!=null?b.fin:1e8-b.prog));winCar=o[0]||this.P;if(!this.mp)o.forEach((c,i)=>{s.pts[c.team]=(s.pts[c.team]||0)+(PTS[i]||0)});
   h=`<h2>${rd}${tn} · Race</h2><p>You finished <b>P${o.indexOf(P)+1}</b>${this.pen?' (+5s jump start)':''} · best ${fmt(P.best)} · top ${Math.round(P.topV)} km/h · pits ${P.pits}</p><table><tr><th>Pos</th><th>Driver / Team</th><th>Time</th><th>Pts</th></tr>${o.map((c,i)=>tr(i+1,sw(c),c.fin!=null?(i?'+'+(c.fin-o[0].fin).toFixed(3):fmt(c.fin)):'—',this.mp?'':PTS[i]||0,c.isP)).join('')}</table>`}
  else{const dm=this.diffMul(),L=TEAMS.map((m,i)=>({i,t:i==this.sel.team?P.best:T.R*(.975/(m.s*dm))+Math.random()*.5})).sort((a,b)=>a.t-b.t),pos=L.findIndex(q=>q.i==this.sel.team)+1;this.gridPos=pos-1;
   h=`<h2>${rd}${tn} · ${s.sess==='quali'?'Qualifying':'Practice'}</h2><p>Best lap <b>${fmt(P.best)}</b> · top ${Math.round(P.topV)} km/h${s.sess==='quali'?` · grid slot <b>P${pos}</b>`:''}</p><table><tr><th>#</th><th>Team</th><th>Best</th><th>Gap</th></tr>${L.map((q,k)=>tr(k+1,sw({team:q.i,drv:q.i==this.sel.team?this.sel.drv:null}),fmt(q.t),k?'+'+(q.t-L[0].t).toFixed(3):'',q.i==this.sel.team)).join('')}</table><p>Laps: ${P.laps.map(fmt).join(' | ')}</p>`;
   if(s.sess!=='quali')nxt='<button class="btn big go" id="rQ">Qualifying</button><button class="btn big" id="rR2">Skip to Race</button>';else nxt=`<button class="btn big go" id="rR">Start Race (P${pos})</button>`}
  if(!this.outro)this.outro={t:0,win:winCar,fan:1};else this.outro.win=winCar;
  const more=!this.mp&&s.i<s.q.length-1;
  if(!this.mp&&s.q.length>1&&s.sess==='race'){const e=Object.entries(s.pts).sort((a,b)=>b[1]-a[1]);h+=`<h3>Championship${more?' (R'+(s.i+1)+')':''}</h3><table>${e.map((x,k)=>tr(k+1,sw({team:+x[0]}),x[1]+' pts','',+x[0]==this.sel.team)).join('')}</table>`}
  const again=!this.mp?'<button class="btn big" id="rAg">Race Again</button>':'';
  $('resin').innerHTML=h+'<div class="rbtns">'+nxt+(more?`<button class="btn big${s.sess==='race'?' go':''}" id="rn2">${s.sess==='race'?'Next Circuit ›':'Skip Circuit ›'}</button>`:'')+again+'<button class="btn big" id="rm">Main Menu</button></div>';
  $('res').classList.add('split');$('res').style.display='flex';
  if($('winBadge')){$('wbName').textContent='🏆 WINNER · '+this.shortName(winCar)+' ('+TEAMS[winCar.team].n+')';$('wbSub').textContent='CELEBRATION OUTLAP · LIVE BROADCAST';$('winBadge').style.display='flex'}
  $('rm').onclick=()=>this.quit();if($('rAg'))$('rAg').onclick=()=>{if(this.fading)return;this.runNext()};if($('rn2'))$('rn2').onclick=()=>{if(this.fading)return;s.i++;s.sess=s.base||'race';this.runNext()};if($('rR'))$('rR').onclick=()=>{if(this.fading)return;s.sess='race';this.runNext()};if($('rQ'))$('rQ').onclick=()=>{if(this.fading)return;s.sess='quali';this.runNext()};if($('rR2'))$('rR2').onclick=()=>{if(this.fading)return;s.sess='race';this.runNext()}}

 nextCam(){this.view=(this.view+1)%5;const nm=['WIDE CHASE','CLOSE 3RD-PERSON','T-CAM ONBOARD','HALO COCKPIT','EAGLE EYE'][this.view];this.msg('CAMERA: '+nm);const cb=$('camb');if(cb)cb.textContent='Cam: '+['Chase','Close 3P','T-Cam','Halo','Eagle'][this.view]+' (C)'}
  /* ---------- camera + HUD ---------- */
 frame(dt,alpha){
  const a=alpha!=null?clamp(alpha,0,1):1;
  // Sub-frame visual interpolation: eliminates 60Hz fixed-step micro-stutter on 60/90/120/144/240Hz+ screens
  for(const c of this.cars){
   if(c.px==null){c.px=c.x;c.py=c.y;c.pa=c.a;c.pey=c.ey}
   const rx=c.px+(c.x-c.px)*a,ry=c.py+(c.y-c.py)*a,ra=c.pa+angd(c.a,c.pa)*a,rey=c.pey+(c.ey-c.pey)*a;
   c.rx=rx;c.ry=ry;c.ra=ra;c.rey=rey;
   if(c.o&&c.o.g){c.o.g.position.set(rx,rey+c.pitL,ry);c.o.g.rotation.y=-ra}
  }
  const cam=this.camera,T=this.T,P=this.P,race=P&&this.state!=='menu';let fx,fy,fz;
  if(!race){this.mc(dt);fx=cam.position.x;fy=cam.position.y;fz=cam.position.z}
  else if(this.outro){
   const w=this.outro.win,ot=this.outro.t,shot=Math.floor(ot/4.5)%3,wx=w.rx!=null?w.rx:w.x,wy=w.ry!=null?w.ry:w.y,wey=w.rey!=null?w.rey:w.ey,wa=w.ra!=null?w.ra:w.a,ca=Math.cos(wa),sa=Math.sin(wa);
   const vw=Math.max(1,(window.visualViewport&&window.visualViewport.width)||innerWidth),vh=Math.max(1,(window.visualViewport&&window.visualViewport.height)||innerHeight);
   if(this.state==='done2')cam.setViewOffset(vw,vh,-vw*.22,0,vw,vh);else cam.clearViewOffset();
   if(shot===0){
    // Heroic low front-3/4 broadcast tracking shot during winning outlap
    const side=Math.sin(ot*.35)>=0?1:-1;
    cam.position.set(wx+ca*54-sa*side*26,wey+12,wy+sa*54+ca*side*26);
    cam.lookAt(wx,wey+4,wy);
   }else if(shot===1){
    // Sweeping low side-profile chase highlighting livery & spinning wheels
    const ang=wa+Math.PI*.72+Math.sin(ot*.6)*.22;
    cam.position.set(wx+Math.cos(ang)*52,wey+14,wy+Math.sin(ang)*52);
    cam.lookAt(wx+ca*10,wey+4,wy+sa*10);
   }else{
    // Elevated helicopter celebration orbit
    const ang=wa+Math.PI+ot*.55;
    cam.position.set(wx+Math.cos(ang)*78,wey+34,wy+Math.sin(ang)*78);
    cam.lookAt(wx,wey+5,wy);
   }
   cam.fov+=(56-cam.fov)*Math.min(1,dt*4);cam.updateProjectionMatrix();
   P.o.helm.visible=true;fx=wx;fy=wey;fz=wy;
  }
  else{const px=P.rx!=null?P.rx:P.x,py=P.ry!=null?P.ry:P.y,pey=P.rey!=null?P.rey:P.ey,pa=P.ra!=null?P.ra:P.a;
   const f=Math.min(1,P.spd/470),o=P.o.g;this.cam.a+=angd(pa,this.cam.a)*(1-Math.exp(-dt*7.5));let fov=this.set.fov;
   if(this.view===0){const ca=Math.cos(this.cam.a),sa=Math.sin(this.cam.a),sh=f*f*.45+(P.ersOn&&P.ers>0?.28:0);fov+=20*f+(P.ersOn?4:0);
    cam.position.set(px-ca*68+rnd(-sh,sh),pey+21+rnd(-sh,sh),py-sa*68+rnd(-sh,sh));cam.lookAt(px+ca*36,pey+5,py+sa*36)}
   else if(this.view===1){const ca=Math.cos(this.cam.a),sa=Math.sin(this.cam.a),sh=f*f*.32+(P.ersOn&&P.ers>0?.22:0);fov+=16*f+(P.ersOn?4:0);
    // Close Third-Person Cam: tight behind rear wing for visceral F1 speed feel
    cam.position.set(px-ca*40+rnd(-sh,sh),pey+13.2+rnd(-sh,sh),py-sa*40+rnd(-sh,sh));cam.lookAt(px+ca*48,pey+4.5,py+sa*48)}
   else if(this.view===2){fov=this.set.fov+10+12*f+(P.ersOn?3:0);o.updateMatrixWorld(true);const lat=clamp(P.steer*-.45,-.45,.45),sh=f*.09;
    const e=o.localToWorld(this._v1.set(-2.6,7.65,-.75+lat)),t=o.localToWorld(this._v2.set(92,4.4,lat*2));cam.position.set(e.x+rnd(-sh,sh),e.y+rnd(-sh,sh),e.z);cam.lookAt(t)}
   else if(this.view===3){fov=this.set.fov+14+10*f;o.updateMatrixWorld(true);const sh=f*.11;
    const e=o.localToWorld(this._v1.set(-.6,5.35,0)),t=o.localToWorld(this._v2.set(92,4.6,0));cam.position.set(e.x+rnd(-sh,sh),e.y+rnd(-sh,sh),e.z);cam.lookAt(t)}
   else{const ca=Math.cos(this.cam.a),sa=Math.sin(this.cam.a);cam.position.set(px-ca*145,pey+290,py-sa*145);cam.lookAt(px+ca*48,pey,py+sa*48);fov=this.set.fov-10}
   cam.fov+=(fov-cam.fov)*Math.min(1,dt*6);cam.updateProjectionMatrix();P.o.helm.visible=this.view!==3;fx=px;fy=pey;fz=py}
  // Dynamic tunnel darkening & interior lighting when inside enclosed tunnel (e.g. Monaco)
  {const inTun=!!(race&&T.tun&&((P.idx-T.tun[0]+T.N)%T.N)<T.tun[1]);
   this.tunK+=((inTun?1:0)-this.tunK)*Math.min(1,dt*5);
   if(this.baseSun!=null){this.sun.intensity=this.baseSun*(1-.82*this.tunK);this.hemi.intensity=this.baseHemi*(1-.62*this.tunK);this.pl.intensity=this.basePl+1.65*this.tunK}}
  this.dome.position.copy(cam.position);
  // Snap shadow frustum to 4-unit grid to eliminate shadow shimmer & stabilize shadow map texels
  const sfx=Math.round(fx*.25)*4,sfz=Math.round(fz*.25)*4;
  this.sun.target.position.set(sfx,fy,sfz);this.sun.position.set(sfx+300,fy+520,sfz+200);this.pl.position.set(fx,fy+150,fz);
  // Dynamic speed-reactive racing line: starts ahead of car (disappears immediately behind) & colors live by P.spd vs corner limit
  {const rl=this.rl;if(rl){const m=this.sel.ln,on=!!(race&&this.state!=='done2'&&m!=='off'),f=on&&m==='full',c=on&&m==='corner';rl.core.visible=rl.halo.visible=f;rl.coreC.visible=rl.haloC.visible=c;
   if(on){const N=T.N,s0=(P.idx+1)%N,cnt=rl.n,v=P.spd,gm=f?rl.core:rl.coreC,hm=f?rl.halo:rl.haloC,ca=gm.geometry.attributes.color,ha=hm.geometry.attributes.color;
    let dist=0;
    for(let q=0;q<cnt;q++){const k=s0+q,j=k%N;dist+=T.ds[(j+N-1)%N];
     const vt=T.vl[j];let h=0;
     if(v>vt*.95){const req=(v*v-vt*vt)/(2*Math.max(dist,22));h=clamp(req/145,0,1);if(v>vt*1.12&&q<14)h=Math.max(h,clamp((v-vt)/(vt*.35),0,1))}
     let r,g,b;
     if(h<.5){const u=h*2;r=.18+u*.82;g=1.0-u*.24;b=.48*(1-u)+.12*u}
     else{const u=(h-.5)*2;r=1.0;g=.76*(1-u)+.17*u;b=.12*(1-u)+.17*u}
     const base=k*12;
     for(let vv=0;vv<4;vv++){const o=base+vv*3;ca.array[o]=r;ca.array[o+1]=g;ca.array[o+2]=b;ha.array[o]=r*.5;ha.array[o+1]=g*.5;ha.array[o+2]=b*.5}}
    ca.needsUpdate=true;ha.needsUpdate=true;
    gm.geometry.setDrawRange(s0*6,cnt*6);hm.geometry.setDrawRange(s0*6,cnt*6)}}}
  this.sparks.step(dt,300);this.ersP.step(dt,-20);if(this.skD){this.skM.geometry.attributes.position.needsUpdate=true;this.skD=false}
  if(this.prof.crowdWave&&this.crowdWaves&&this.crowdWaves.length){const tt=performance.now()*.0065;for(const w of this.crowdWaves){w.g.position.y=Math.abs(Math.sin(tt+w.ph))*(w.flag?1.6:1.25)}}
 }
 mc(dt){const T=this.T,cam=this.camera;if(!this.cars.length)return;let L=this.cars[0];for(const c of this.cars)if(c.prog>L.prog)L=c;
  this.mt-=dt;if(this.mt<=0){this.mt=rnd(5,8);this.mCam=Math.random()*3|0;const i=(L.idx+50+(Math.random()*40|0))%T.N;this.mCamPos=T.at(i,(Math.random()<.5?-1:1)*rnd(100,150));this.ang=rnd(0,TAU)}
  const ca=Math.cos(L.a),sa=Math.sin(L.a);let fov=60;
  if(this.mCam===0&&this.mCamPos){cam.position.set(this.mCamPos.x,this.mCamPos.y+9,this.mCamPos.z);cam.lookAt(L.x,L.ey+5,L.y);fov=34}
  else if(this.mCam===1){const p=this._v1.set(L.x-ca*90-sa*35,L.ey+16,L.y-sa*90+ca*35);cam.position.lerp(p,Math.min(1,dt*5));cam.lookAt(L.x+ca*40,L.ey+5,L.y+sa*40);fov=70}
  else{this.ang+=dt*.35;cam.position.set(L.x+Math.cos(this.ang)*240,L.ey+95,L.y+Math.sin(this.ang)*240);cam.lookAt(L.x,L.ey,L.y);fov=55}
  cam.fov+=(fov-cam.fov)*Math.min(1,dt*3);cam.updateProjectionMatrix()}
 hud(dt){
  const P=this.P;if(!P||this.state==='menu'||this.state==='done2')return;
  const H=this._h||(this._h={spd:$('spd'),gear:$('gear'),rev:[...$('rev').children],ers:$('ers'),drs:$('drs'),thrb:$('thrb'),brkb:$('brkb'),tyb:$('tyb'),tinfo:$('tinfo'),lapi:$('lapi'),fx:$('fx'),svc:$('svc'),svb:$('svb'),svt:$('svt'),svd:[0,1,2,3].map(j=>$('sv'+j)),tower:$('tower')});
  const hs=this._hs,mob=this.isMob||document.body.classList.contains('touch');
  this.tw+=dt;if(this.lnS!==this.sel.ln){this.lnS=this.sel.ln;this.lnTxt()}
  this.mmT=(this.mmT||0)+dt;if(this.mmT>=this.prof.mmMs/1000){this.mmT=0;this.mmDraw()}
  // Throttle non-critical HUD DOM writes to avoid layout thrashing (12.5Hz mobile / 30Hz desktop)
  this._hudT+=dt;if(this._hudT<this.prof.hudMs/1000)return;this._hudT=0;
  const spd=Math.round(P.spd*.72);if(hs.spd!==spd){hs.spd=spd;H.spd.textContent=spd}
  const gr=(P.vx*Math.cos(P.a)+P.vy*Math.sin(P.a))<-3?'R':P.spd<3?'N':P.gear;if(hs.gr!==gr){hs.gr=gr;H.gear.textContent=gr}
  const revN=Math.max(0,Math.min(15,Math.floor((P.rpm+.02)*15)));
  if(hs.revN!==revN){hs.revN=revN;for(let i=0;i<15;i++)H.rev[i].style.background=i<revN?(i<5?'#2de05a':i<10?'#ff2a2a':'#3aa0ff'):'rgba(255,255,255,.18)'}
  const ersW=Math.round(P.ers);if(hs.ersW!==ersW){hs.ersW=ersW;H.ers.style.width=ersW+'%'}
  const drsS=P.drs?2:P.drsAv?1:0;if(hs.drsS!==drsS){hs.drsS=drsS;H.drs.className=P.drs?'o':'';H.drs.textContent=P.drs?'DRS OPEN':P.drsAv?'DRS READY':'AUTO-DRS'}
  if(!mob){
   const tw=Math.round(P.thr*100),bw=Math.round(P.brk*100);
   if(H.thrb&&hs.tw!==tw){hs.tw=tw;H.thrb.style.width=tw+'%'}
   if(H.brkb&&hs.bw!==bw){hs.bw=bw;H.brkb.style.width=bw+'%'}
  }
  if(hs.tire!==P.tire){hs.tire=P.tire;H.tyb.textContent=P.tire;H.tyb.style.background=hex(TIRES[P.tire].c)}
  if(this.pit){const p=this.pit.t/3,nc=hex(TIRES[P.tire].c);H.svc.style.display='block';H.svd.forEach((e,i)=>{const on=p>=.5+i*.05;e.style.background=on?nc:p>.12?'#e8a317':'#555'});H.svt.textContent=p<.12?'JACKS UP':p<.5?'TYRES OFF':p<.65?'NEW TYRES ON':p<.9?(this.pit.wf?'WING CHECKED':'WING'):'RELEASE';H.svb.style.width=Math.min(100,p*100)+'%'}else if(H.svc.style.display!=='none')H.svc.style.display='none';
  if(!mob){
   const ti=`${TIRES[P.tire].n} · wear ${Math.round(P.wear*100)}% · wing ${Math.round((1-P.dmg)*100)}%${P.inPit?' · PIT LIMITER 80':''}${this.pit?' · PIT '+(3-this.pit.t).toFixed(1)+'s':''}${P.bAs>.05?' · AUTO-BRAKE':''}${P.eAs?' · ERS AUTO':''} · ${Math.round(this.fps||0)} fps`;
   if(hs.ti!==ti){hs.ti=ti;H.tinfo.textContent=ti}
  }
  const lapTxt=`LAP ${Math.min(Math.max(P.lap+1,1),this.laps)}/${this.laps} · P${P.pos||1} · ${this.state==='race'?fmt(this.raceT-P.lapStart):'0:00.000'}${!mob&&P.best<1e8?' · BEST '+fmt(P.best):''}`;
  if(hs.lapTxt!==lapTxt){hs.lapTxt=lapTxt;H.lapi.textContent=lapTxt}
  if(this.prof.fxVignette&&H.fx){H.fx.classList.toggle('ers',!!(P.ersOn&&P.ers>0&&P.spd>100));H.fx.classList.toggle('fast',!(P.ersOn&&P.ers>0)&&P.spd*0.72>270)}
  if(this.pylon&&this.order){this.pylon.t+=dt;if(this.pylon.t>.35){this.pylon.t=0;const x=this.pylon.cv.getContext('2d');x.fillStyle='#0b0f18';x.fillRect(0,0,128,256);x.fillStyle='#ff2d3d';x.fillRect(0,0,128,32);x.fillStyle='#fff';x.font='900 18px Arial';x.textAlign='center';x.fillText('APEX GP',64,22);
   this.order.slice(0,5).forEach((c,i)=>{const y=42+i*42;x.fillStyle=hex(TEAMS[c.team].c);x.fillRect(6,y,8,30);x.fillStyle='#fff';x.font='800 20px Arial';x.textAlign='left';x.fillText((i+1)+' '+TEAMS[c.team].a,20,y+22)});this.pylon.tx.needsUpdate=true}}
  if(this.tw>(mob?.25:.12)&&this.order){this.tw=0;const rows=H.tower.children,o=this.order;o.forEach((c,i)=>{const r=rows[i];if(!r)return;r.className='tr'+(c.isP?' me':'')+(mob&&i>=5&&!c.isP?' mhid':'');r.children[0].textContent=i+1;const lg=r.children[1];if(lg.dataset.t!=c.team){lg.dataset.t=c.team;lg.src=logo(c.team)}r.children[2].textContent=this.shortName(c);const ty=r.children[3];if(ty.dataset.ty!==c.tire){ty.dataset.ty=c.tire;ty.textContent=c.tire;ty.className='ty '+c.tire}r.children[4].textContent=c.fin!=null?'FIN':(c.pitS>0||(c.isP&&c.inPit))?'PIT':i?'+'+((o[0].prog-c.prog)/330).toFixed(1):'LEADER'})}
 }
 loop(t){requestAnimationFrame(t=>this.loop(t));const raw=(t-this.last)/1000||.016;this.last=t;this.fps=(this.fps||60)*.92+Math.min(360,1/Math.max(raw,.001))*.08;
  // Fixed-timestep physics (60Hz) + sub-frame render interpolation (smooth at 60/90/120/144/240Hz+ native refresh)
  const dt=Math.min(.1,raw);this.acc=Math.min(this.acc+dt,NET_CFG.fixedDt*NET_CFG.maxSubSteps);
  const run=(f)=>{try{f()}catch(e){this.err(e)}};
  run(()=>{while(this.acc>=NET_CFG.fixedDt){for(const c of this.cars){c.px=c.x;c.py=c.y;c.pa=c.a;c.pey=c.ey}this.update(NET_CFG.fixedDt);this.acc-=NET_CFG.fixedDt}});
  const alpha=this.state==='paused'?1:clamp(this.acc/NET_CFG.fixedDt,0,1);
  run(()=>this.frame(dt,alpha));run(()=>this.hud(dt));
  if(this.set.dbg&&$('netDbg')){this._dbgT=(this._dbgT||0)+dt;if(this._dbgT>=.25){this._dbgT=0;$('netDbg').textContent=`${(this.isMob?'MOB':'PC')} · ${Math.round(this.fps)} FPS (${(this.set.gfx||'balanced').toUpperCase()})${this.mp?` · ${this.netHz} Hz · ${Math.round(this.rtt)} ms`:' · OFFLINE'}`}}
  run(()=>{if(this.ctxLost)return;if(this.showMode&&this.show){this.showStep(dt);this.r.render(this.show.sc,this.show.cam)}else this.r.render(this.scene,this.camera)});run(()=>this.perf(raw))}
 err(e){console.error(e);const m=String(e&&e.message||e),n=(this.errN=(this.errN||0)+1);if(n<=3||m!==this.errM){this.errM=m;try{const b=$('err');b.textContent='ERROR: '+m;b.style.display='block'}catch(x){}}}
 perf(raw){if(this.state!=='race'&&this.state!=='lights'){this.slowT=0;return}this.slowT=raw>.045?(this.slowT||0)+raw:Math.max(0,(this.slowT||0)-raw*2);
  if(this.slowT>2.5&&(this.pfl||0)<4){this.slowT=0;const L=this.pfl=(this.pfl||0)+1,R=this.r;
   if(L===1&&this.useBloom){this.useBloom=false;this.msg('LOW FPS: BLOOM OFF')}
   else if(L<=2){this.set.shadows=false;R.shadowMap.enabled=false;this.sun.castShadow=false;$('s_sh').checked=false;this.scene.traverse(o=>{if(o.material)o.material.needsUpdate=true});this.msg('LOW FPS: SHADOWS OFF')}
   else if(L===3){R.setPixelRatio(.7);R.setSize(innerWidth,innerHeight,false);this.msg('LOW FPS: RESOLUTION LOWERED')}
   else{this.camera.far=2600;this.camera.updateProjectionMatrix();this.scene.fog.far=2000;this.msg('LOW FPS: VIEW DISTANCE REDUCED')}}}

 /* ---------- online (PeerJS · STUN + TURN Relay) ---------- */
 netOk(){if(typeof Peer==='undefined'){$('mps').textContent='PeerJS did not load. Check internet connection and reload.';return false}return true}
 netClose(){if(this._mpT){clearTimeout(this._mpT);this._mpT=null}try{this.peer&&this.peer.destroy()}catch(e){}this.peer=this.hc=null;this.conns=[];this.mp=false;this.roster=null}
 host(){if(!this.netOk())return;this.netClose();const ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code='';for(let i=0;i<4;i++)code+=ch[Math.random()*ch.length|0];
  $('mps').textContent='Connecting to signaling server...';const p=this.peer=new Peer('apexgp-'+code,NET_CFG.peerOpts);this.isHost=true;this.myId=0;this.nid=0;this.code=code;
  this._mpT=setTimeout(()=>{if(this.peer===p&&!p.open){$('mps').textContent='Signaling server timed out. Check internet or try again.';this.netClose()}},12000);
  p.on('open',()=>{if(this._mpT){clearTimeout(this._mpT);this._mpT=null}$('mps').textContent='';this.roster=[];this.mpf='host';this.go('team')});
  p.on('disconnected',()=>{if(this.peer===p&&!p.destroyed)try{p.reconnect()}catch(e){}});
  p.on('error',e=>{if(this._mpT){clearTimeout(this._mpT);this._mpT=null}$('mps').textContent=e.type==='unavailable-id'?'Code taken — press Host room again':e.type==='network'||e.type==='server-error'?'Signaling server unreachable — retry in a moment':'Network error: '+e.type});
  p.on('connection',c=>{if(this.conns.length>=7||this.state!=='menu'){const sendFull=()=>{try{c.send({t:'full'})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},300)};if(c.open)sendFull();else c.on('open',sendFull);return}
   c.pid=++this.nid;this.conns.push(c);
   const drop=()=>{this.conns=this.conns.filter(x=>x!==c);if(this.roster){this.roster=this.roster.filter(r=>r.id!==c.pid);this.lobby(true)}};
   c.on('data',d=>this.rx(c,d));c.on('close',drop);c.on('error',drop);
   const hi=()=>{try{c.send({t:'welcome',id:c.pid})}catch(e){}};if(c.open)hi();else c.on('open',hi)})}
 join(code){if(!this.netOk())return;code=(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').trim();if(code.length!=4){$('mps').textContent='Enter the 4-character room code';return}
  this.netClose();this.isHost=false;this.code=code;$('mps').textContent='Connecting to signaling server...';const p=this.peer=new Peer(NET_CFG.peerOpts);
  let done=false;const fail=(msg)=>{if(done)return;done=true;if(this._mpT){clearTimeout(this._mpT);this._mpT=null}$('mps').textContent=msg;this.netClose()};
  this._mpT=setTimeout(()=>fail('Connection timed out (NAT/firewall). Ask host to re-open or try same Wi-Fi/4G.'),15000);
  p.on('disconnected',()=>{if(this.peer===p&&!p.destroyed&&!done)try{p.reconnect()}catch(e){}});
  p.on('error',e=>fail(e.type==='peer-unavailable'?'Room '+code+' not found — check code or host lobby':e.type==='network'||e.type==='server-error'?'Signaling server unreachable — retry':'Network error: '+e.type));
  p.on('open',()=>{if(done)return;$('mps').textContent='Room '+code+' found — handshaking P2P / Relay...';
   const c=this.hc=p.connect('apexgp-'+code,{serialization:'json',reliable:true});
   const onOpen=()=>{if(done)return;done=true;if(this._mpT){clearTimeout(this._mpT);this._mpT=null}$('mps').textContent='';this.mpf='guest';this.go('team')};
   if(c.open)onOpen();else c.on('open',onOpen);
   c.on('data',d=>this.rx(c,d));
   c.on('error',e=>fail('P2P connection error: '+(e&&e.message||e&&e.type||'blocked')));
   c.on('close',()=>{if(!done)fail('Host closed connection');else if(this.state==='menu'&&this.scr==='lobby')$('linfo').textContent='Disconnected from host'});
   try{if(c.peerConnection)c.peerConnection.oniceconnectionstatechange=()=>{const st=c.peerConnection&&c.peerConnection.iceConnectionState;if(!done&&st==='checking')$('mps').textContent='Negotiating NAT / TURN relay...';else if(!done&&st==='failed')fail('ICE/NAT blocked — try switching Wi-Fi or mobile data')}}catch(e){}})}
 sendHello(){const nm=(this.sel.pname||'').trim()||DR[this.sel.team][this.sel.drv][0];if(this.hc&&this.hc.open)this.hc.send({t:'hello',team:this.sel.team,tire:this.sel.tire,drv:this.sel.drv,name:nm})}
 rx(c,d){switch(d.t){
  case'welcome':this.myId=d.id;break;
  case'hello':if(this.roster){this.roster.push({id:c.pid,team:d.team,tire:d.tire,drv:d.drv,name:(d.name||'').slice(0,14)});this.lobby(true)}break;
  case'lobby':this.roster=d.r;this.lobby();break;
  case'full':$('mps').textContent='Room is full (max 8 players) or already racing';break;
  case'start':this.startMP(d.r,d.h,d.tr,d.l,d.df);break;
  case'p':if(c&&c.open)c.send({t:'q',ts:d.ts});break;
  case'q':this.rtt=this.rtt?this.rtt*.75+(performance.now()-d.ts)*.25:(performance.now()-d.ts);break;
  case'b':{const now=performance.now();this._netCnt++;
   for(const q of d.a){const k=this.cars.find(x=>x.id===q[0]);if(!k||k===this.P)continue;
    const snap={ts:now,x:q[1],y:q[2],a:q[3],vx:q[4],vy:q[5],lap:q[6],flg:q[7],st:q[8],dm:q[9],ti:q[10],fin:q[11]};
    if(!k.snaps)k.snaps=[];k.snaps.push(snap);if(k.snaps.length>4)k.snaps.shift();k.net=snap}
   if(this.isHost){for(const x of this.conns)if(x!==c&&x.open)x.send(d)}break}
  case's':{const now=performance.now(),k=this.cars.find(x=>x.id===d.id);if(k&&k!==this.P){d.s.ts=now;if(!k.snaps)k.snaps=[];k.snaps.push(d.s);if(k.snaps.length>4)k.snaps.shift();k.net=d.s}if(this.isHost)for(const x of this.conns)if(x!==c&&x.open)x.send(d)}}}
 lobby(bc){const r=this.roster||[],aiOn=this.sel.mpai==='on';$('lcode').textContent=this.isHost?'Room code: '+this.code+' · up to 8 players ('+r.length+'/8 joined)':'Joined room '+this.code;
  if($('cpLink'))$('cpLink').style.display=this.isHost?'':'none';
  $('lob').innerHTML=r.map((q,i)=>`<div style="border-left:8px solid ${hex(TEAMS[q.team].c)};padding:4px 10px;margin:4px 0;background:rgba(0,0,0,.25);border-radius:10px">${q.id===0?'Host':'Player '+(i+1)}: <b>${(q.name||(DR[q.team][q.drv||0]||[])[0]||'Driver').replace(/</g,'&lt;')}</b> · ${TEAMS[q.team].n}${q.id===this.myId?' (you)':''}</div>`).join('');
  const canStart=this.isHost&&(r.length>1||aiOn);$('gomp').style.display=canStart?'':'none';
  const aiTxt=aiOn?` · AI Fill: ON (${Math.max(0,TEAMS.length-r.length)} AI, ${(this.sel.diff||'normal').toUpperCase()})`:' · AI Fill: OFF';
  $('linfo').textContent=this.isHost?(canStart?'Ready to start'+aiTxt:'Waiting for friends to join...'+aiTxt):'Waiting for the host to start...';if(bc&&this.isHost)this.conns.forEach(c=>c.open&&c.send({t:'lobby',r}))}
 hostStart(){const h=.8+Math.random()*1.6,df=this.sel.diff||'normal',full=[...this.roster];
  if(this.sel.mpai==='on'&&full.length<TEAMS.length){const used=new Set(full.map(p=>p.team)),pool=TEAMS.map((_,i)=>i).filter(i=>!used.has(i));let aiId=100;
   while(full.length<TEAMS.length){const ti=pool.length?pool.shift():(aiId%TEAMS.length),dv=used.has(ti)?1:0;full.push({id:aiId++,team:ti,tire:'SMMHM'[Math.random()*5|0],drv:dv,name:(DR[ti][dv]||[])[0]||TEAMS[ti].n,ai:1})}}
  this.conns.forEach(c=>c.open&&c.send({t:'start',r:full,h,tr:this.sel.track,l:this.sel.laps,df}));this.startMP(full,h,this.sel.track,this.sel.laps,df)}
 sendS(dt){
  // Track live network tick rate & send lightweight RTT ping every 1.5s
  this._netSec+=dt;if(this._netSec>=1){this.netHz=this._netCnt;this._netCnt=0;this._netSec=0}
  this._pingT+=dt;if(this._pingT>=NET_CFG.pingMs/1000){this._pingT=0;const pm={t:'p',ts:performance.now()};if(this.isHost)this.conns.forEach(x=>x.open&&x.send(pm));else if(this.hc&&this.hc.open)this.hc.send(pm)}
  this.nt=(this.nt||0)+dt;if(this.nt<1/NET_CFG.sendHz||!this.P)return;this.nt=0;
  // Compact quantized array per car: [id, x, y, a, vx, vy, lap, bitflags, steer, dmg, tyreIdx, fin]
  const r1=v=>Math.round(v*10)/10,r2=v=>Math.round(v*100)/100,tIdx=t=>t==='S'?0:t==='H'?2:1;
  const pack=c=>[c.id,r1(c.x),r1(c.y),r2(c.a),r1(c.vx),r1(c.vy),c.lap,(c.drs?1:0)|(c.ersOn&&c.ers>0?2:0)|(c.thr>.1?4:0)|(c.brk>.1?8:0),r2(c.steer),r2(c.dmg),tIdx(c.tire),c.fin!=null?r2(c.fin):null];
  if(this.isHost){
   // Batch all host + AI cars into ONE single packet per tick (11x fewer WebRTC frames!)
   const a=[];for(const c of this.cars)if(c===this.P||c.isAI)a.push(pack(c));
   if(a.length){const msg={t:'b',a};for(const x of this.conns)if(x.open)x.send(msg);this._netCnt++}
  }else if(this.hc&&this.hc.open){this.hc.send({t:'b',a:[pack(this.P)]});this._netCnt++}
 }
 startMP(r,h,tr,laps,df){if(!r||!r.some(p=>p.id===this.myId))return;this.fade(()=>this.startMPNow(r,h,tr,laps,df))}
 startMPNow(r,h,tr,laps,df){this.cleanRun();this.sfx.init();this.sel.track=tr;this.loadTrack(tr);this.clearCars();this.mp=true;this.ser=null;const dm=this.diffMul(df);
  r.forEach((p,k)=>{const me=p.id===this.myId&&!p.ai,localAI=!!p.ai&&this.isHost,sk=localAI?(TEAMS[p.team].s+(Math.random()-.5)*.015)*dm:1;
   const c=new Car(p.team,p.tire,me,sk,localAI?rnd(-15,15):0,p.drv||0);this.grid(c,k);c.id=p.id;c.pname=p.name||'';c.isAI=localAI;c.remote=!me&&!localAI;if(me)this.P=c;this.addCar(c)});
  const hc=r.filter(p=>!p.ai).length,ac=r.length-hc;this.begin(laps,h);this.msg('ONLINE RACE: '+hc+' PLAYERS'+(ac?' + '+ac+' AI ('+(df||'normal').toUpperCase()+')':''))}
 rem(c,dt){
  // Phase 3: Snapshot buffer interpolation + bounded velocity extrapolation (smooth PC <-> Mobile cross-play)
  const snaps=c.snaps;if(!snaps||!snaps.length){c.sync(this,dt);return}
  const T=this.T,now=performance.now(),delay=clamp(NET_CFG.interpMs+(this.rtt||0)*.35,80,160),rt=now-delay;
  let tx,ty,ta,vx,vy,src=snaps[snaps.length-1];
  if(snaps.length>=2&&rt<=src.ts){
   let a=snaps[0],b=snaps[1];
   for(let i=snaps.length-1;i>0;i--)if(snaps[i-1].ts<=rt){a=snaps[i-1];b=snaps[i];break}
   const span=Math.max(1,b.ts-a.ts),u=clamp((rt-a.ts)/span,0,1);
   tx=a.x+(b.x-a.x)*u;ty=a.y+(b.y-a.y)*u;ta=a.a+angd(b.a,a.a)*u;vx=a.vx+(b.vx-a.vx)*u;vy=a.vy+(b.vy-a.vy)*u;src=b;
  }else{
   const ex=clamp((now-src.ts)/1000,0,NET_CFG.maxExtrapMs/1000);
   tx=src.x+src.vx*ex;ty=src.y+src.vy*ex;ta=src.a;vx=src.vx;vy=src.vy;
  }
  const err=Math.hypot(tx-c.x,ty-c.y);
  if(err>NET_CFG.snapDist){c.x=tx;c.y=ty;c.a=ta}else{const k=1-Math.exp(-dt*16);c.x+=(tx-c.x)*k;c.y+=(ty-c.y)*k;c.a+=angd(ta,c.a)*k}
  c.vx=vx;c.vy=vy;c.spd=Math.hypot(vx,vy);c.idx=T.near(c.x,c.y,c.idx);c.d=T.side(c.x,c.y,c.idx);
  c.lap=src.lap;const f=src.flg!=null?src.flg:0;
  c.drs=src.flg!=null?!!(f&1):!!src.drs;c.ersOn=src.flg!=null?!!(f&2):!!src.ers;c.thr=src.flg!=null?(f&4?1:0):src.thr;c.brk=src.flg!=null?(f&8?1:0):src.brk;
  c.fin=src.fin;c.steer=src.st;c.dmg=src.dm;if(src.ti!=null)c.tire=['S','M','H'][src.ti]||c.tire;
  c.rpm=.3+.7*Math.min(1,c.spd/450);c.drsOpen+=((c.drs?1:0)-c.drsOpen)*Math.min(1,dt*10);
  if(c.ersOn)this.ersP.emit(c.x-Math.cos(c.a)*18,c.ey+4,c.y-Math.sin(c.a)*18,-Math.cos(c.a)*100,rnd(0,10),-Math.sin(c.a)*100,.5)}
}
window.G=new Game();
addEventListener('error',e=>{try{G.err(e.error||e.message)}catch(x){}});
// Shared PC & Mobile first-gesture audio unlock (intro theme on menu, outro theme on results)
{const unlock=()=>{try{G.sfx.init();if(G.state==='menu')G.sfx.playTheme('intro');else if(G.state==='done2')G.sfx.playTheme('outro')}catch(e){}};
 addEventListener('pointerdown',()=>{try{window.focus();document.body.focus()}catch(e){}unlock()});
 addEventListener('touchstart',unlock,{passive:true});
 addEventListener('keydown',unlock)}
// Unified unmistakable button/option press highlight (PC mouse/keyboard & Mobile touch, 90ms min tap flash)
{const SEL='.btn,.mi,.qbtn,.mcard,.tcard,.dcard,.tb';
 document.addEventListener('pointerdown',e=>{const b=e.target&&e.target.closest&&e.target.closest(SEL);if(!b||b.disabled)return;b.classList.add('is-pressed');b._pt=performance.now()},true);
 const clr=e=>{document.querySelectorAll('.is-pressed').forEach(b=>{const rem=Math.max(0,90-(performance.now()-(b._pt||0)));setTimeout(()=>b.classList.remove('is-pressed'),rem)})};
 document.addEventListener('pointerup',clr,true);document.addEventListener('pointercancel',clr,true);addEventListener('blur',clr)}
{const st=document.body.style,cv=$('gl');st.userSelect=st.webkitUserSelect='none';st.webkitTouchCallout='none';st.touchAction='none';st.webkitTapHighlightColor='transparent';if(cv)cv.style.touchAction='none';
 for(const t of['contextmenu','selectstart','dragstart'])document.addEventListener(t,e=>{if(e.target.tagName!=='INPUT')e.preventDefault()});
 for(const t of['gesturestart','gesturechange','gestureend'])document.addEventListener(t,e=>e.preventDefault());
 document.addEventListener('touchmove',e=>{if(e.target.closest&&!e.target.closest('.scr,.modal,#set,#lob,.pg'))e.preventDefault()},{passive:false});
 addEventListener('pagehide',()=>{try{G.saveP();G.sfx.silenceRace();G.sfx.playTheme('off')}catch(e){}});document.addEventListener('visibilitychange',()=>{if(document.hidden){try{G.saveP();G.sfx.silenceRace();if(G.sfx.bgm)G.sfx.bgm.pause();for(const k in G.keys)G.keys[k]=false}catch(e){}}else{try{if(G.state==='menu')G.sfx.playTheme('intro');else if(G.state==='done2')G.sfx.playTheme('outro')}catch(e){}}});
 ['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>{try{const on=!!(document.fullscreenElement||document.webkitFullscreenElement);if($('qF'))$('qF').textContent=on?'⤢':'⛶';G.resize()}catch(e){}}))}
document.body.tabIndex=0;try{document.body.focus()}catch(e){}
addEventListener('blur',()=>{for(const k in G.keys)G.keys[k]=false});
// Delegate platform-specific controls & viewport listeners to src/pc/pc.js or src/mobile/mobile.js
if(window.APEX_PLATFORM&&window.APEX_PLATFORM.bind)window.APEX_PLATFORM.bind(G);

