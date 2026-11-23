/* Apex Formula GP · src/pc/pc.js — Desktop PC platform adapter & rendering profile */
window.APEX_PLATFORM = {
 mode: 'pc',
 isMobile: false,
 // Desktop PC high-quality rendering & HUD tuning (edit here without affecting Mobile)
 perf: {
  dprCap: 1.25,
  shadowSize: 1024,
  aniso: 16,
  sparks: 400,
  ersP: 300,
  hudMs: 33,       // ~30 Hz HUD refresh
  mmMs: 50,        // ~20 Hz minimap refresh
  crowdWave: true,
  fxVignette: true
 },
 defaultCam: 1,    // 1 = Close 3rd-Person Chase (0 = Wide Chase, 2 = T-Cam, 3 = Halo, 4 = Eagle Eye)
 bind(G) {
  document.body.classList.remove('touch');
  document.body.classList.add('pc');
  const tgl = $('tgl');
  if (tgl) tgl.onclick = () => document.body.classList.toggle('touch');
  // Also wire touch pad buttons in case a PC user clicks "Touch pad" to preview
  [['tL','left'],['tR','right'],['tG','up'],['tB','down'],['tE','ers']].forEach(([id,k])=>{
   const e=$(id);if(!e)return;
   const on=ev=>{ev.preventDefault();try{e.setPointerCapture(ev.pointerId)}catch(x){}G.keys[k]=true;e.classList.add('p')};
   const off=ev=>{ev.preventDefault();G.keys[k]=false;e.classList.remove('p')};
   e.addEventListener('pointerdown',on);['pointerup','pointercancel','lostpointercapture'].forEach(t=>e.addEventListener(t,off));
  });
  if ($('tCam')) $('tCam').addEventListener('pointerdown', ev => { ev.preventDefault(); G.nextCam(); });
  if ($('tPit')) $('tPit').addEventListener('pointerdown', ev => {
   ev.preventDefault();
   if (G.P && G.state === 'race') { const o=['S','M','H']; G.nextTire=o[(o.indexOf(G.nextTire||'M')+1)%3]; G.msg('NEXT PIT TYRE: '+TIRES[G.nextTire].n); }
  });
 },
 onRaceStart() {}
};
