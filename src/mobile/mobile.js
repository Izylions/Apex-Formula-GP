/* Apex Formula GP · src/mobile/mobile.js — Mobile Web platform adapter, touch controls & lightweight profile */
window.APEX_PLATFORM = {
 mode: 'mobile',
 isMobile: true,
 // Mobile lightweight 60 FPS rendering & HUD tuning (edit here without affecting PC)
 perf: {
  dprCap: 1.25,
  shadowSize: 512,
  aniso: 4,
  sparks: 120,
  ersP: 90,
  hudMs: 66,       // ~15 Hz HUD refresh (lightweight at 60–120 FPS)
  mmMs: 85,        // ~12 Hz minimap refresh
  defaultFpsCap: 120,
  crowdWave: false,
  fxVignette: false
 },
 defaultCam: 1,    // 1 = Close 3rd-Person Chase (0 = Wide Chase, 2 = T-Cam, 3 = Halo, 4 = Eagle Eye)
 bind(G) {
  document.body.classList.add('touch', 'mobile');
  const tgl = $('tgl');
  if (tgl) tgl.onclick = () => document.body.classList.toggle('touch');
  // Multi-touch pointer capture so slight thumb drift never drops gas/brake/steering
  [['tL','left'],['tR','right'],['tG','up'],['tB','down'],['tE','ers']].forEach(([id,k])=>{
   const e=$(id);if(!e)return;
   const on=ev=>{ev.preventDefault();try{e.setPointerCapture(ev.pointerId)}catch(x){}G.keys[k]=true;e.classList.add('p')};
   const off=ev=>{ev.preventDefault();G.keys[k]=false;e.classList.remove('p')};
   e.addEventListener('pointerdown',on);
   ['pointerup','pointercancel','lostpointercapture'].forEach(t=>e.addEventListener(t,off));
   e.addEventListener('contextmenu',ev=>ev.preventDefault());
  });
  if ($('tCam')) $('tCam').addEventListener('pointerdown', ev => { ev.preventDefault(); G.nextCam(); });
  if ($('tPit')) $('tPit').addEventListener('pointerdown', ev => {
   ev.preventDefault();
   if (G.P && G.state === 'race') { const o=['S','M','H']; G.nextTire=o[(o.indexOf(G.nextTire||'M')+1)%3]; G.msg('NEXT PIT TYRE: '+TIRES[G.nextTire].n); }
  });
  // Orientation & visualViewport resize safety to prevent black-screen viewport mismatches
  addEventListener('orientationchange', () => { setTimeout(() => G.resize(), 120); setTimeout(() => G.resize(), 360); });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => G.resize());
 },
 onRaceStart() {
  try {
   const d = document, el = d.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen;
   if (req && !d.fullscreenElement && !d.webkitFullscreenElement) req.call(el).catch(() => {});
  } catch (e) {}
  if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
 }
};
