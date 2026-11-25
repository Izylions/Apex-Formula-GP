/* Apex GP 3D · data.js — utilities, TEAMS, TIRES, DR, TRACKS (+corner/elevation features), drawTrk, drawDrv, pit/logo helpers */
const $=id=>document.getElementById(id),clamp=(v,a,b)=>v<a?a:v>b?b:v,TAU=Math.PI*2,rnd=(a,b)=>a+Math.random()*(b-a),hex=c=>'#'+c.toString(16).padStart(6,'0');
const angd=(a,b)=>{let d=a-b;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d};
const fmt=t=>{if(!isFinite(t)||t>1e8)return'--';const m=Math.floor(t/60);return m+':'+(t-m*60).toFixed(3).padStart(6,'0')};
const TEAMS=[
 {n:'Ferrari',a:'FER',b:'SCUDERIA',c:0xb80818,d:0xf4f5f7,c3:0xffd200,wc:0x22252c,rw:0xf4f5f7,s:.96},
 {n:'Red Bull Racing',a:'RBR',b:'RED BULL',c:0x131a36,d:0xffcc00,c3:0xe10600,wc:0x1b1e26,rw:0x131a36,s:.965},
 {n:'McLaren',a:'MCL',b:'MCLAREN',c:0xff7a00,d:0x16181e,c3:0x00b4ff,wc:0x181b22,rw:0xff7a00,mcl:1,s:.968},
 {n:'Mercedes',a:'MER',b:'PETRONAS',c:0x14171d,d:0x00d2be,c3:0xd41424,n2:0xc6ccd4,wc:0x1b1e26,rw:0x14171d,s:.958},
 {n:'Aston Martin',a:'AMR',b:'ARAMCO',c:0x006652,d:0xc8e600,c3:0x004a3b,wc:0x1a1f22,rw:0x006652,s:.932},
 {n:'Alpine',a:'ALP',b:'ALPINE',c:0x121824,d:0xff6eb4,c3:0x0090ff,wc:0x1a1e28,rw:0xff6eb4,s:.922},
 {n:'Williams',a:'WIL',b:'WILLIAMS',c:0x0046c8,d:0x00a8e8,c3:0x0a1c44,wc:0x182034,rw:0x0046c8,s:.925},
 {n:'Racing Bulls',a:'RBS',b:'VISA RB',c:0xf0f2f6,d:0x1e40ff,c3:0xe10600,wc:0x1c2028,rw:0x1e40ff,s:.92},
 {n:'Haas',a:'HAA',b:'HAAS F1',c:0xf0f2f5,d:0xe10600,c3:0x181a20,wc:0x1c1e24,rw:0x181a20,s:.912},
 {n:'Audi',a:'AUD',b:'AUDI F1',c:0xc4c8ce,d:0xf50537,c3:0x16181e,wc:0x1a1c22,rw:0xf50537,s:.91},
 {n:'Cadillac',a:'CAD',b:'CADILLAC',c:0x181c24,d:0xf0b818,c3:0xd81b28,n2:0x2b303b,wc:0x1c2028,rw:0x181c24,s:.905}
];
// Recalibrated F1 tyre endurance: Soft ~5-10 laps, Medium ~10-15 laps, Hard ~15-20 laps
const TIRES={
 S:{n:'SOFT',g:1.05,w:.115,t:5,c:0xff2a2a,meta:'Max Grip · 5–10 Laps'},
 M:{n:'MEDIUM',g:1.0,w:.068,t:8,c:0xffd400,meta:'Balanced · 10–15 Laps'},
 H:{n:'HARD',g:.94,w:.048,t:13,c:0xf2f2f2,meta:'Endurance · 15–20 Laps'}
};
const RACE_LENGTHS=[
 {v:3,n:'Very Short',sub:'3 laps · ~5m prac',pracSec:300},
 {v:5,n:'Short',sub:'5 laps · ~5m prac',pracSec:300},
 {v:15,n:'Half Full',sub:'15 laps · ~10m prac',pracSec:600},
 {v:30,n:'Full',sub:'30 laps · ~10m prac',pracSec:600}
];
const APP_VER='1.4.0';
const PATCH_HISTORY=[
 {ver:'1.4.0',label:'Current · v1.4.0',sub:'120 FPS Pacing, Deep V8 Engine, Zero-Scroll Step Menu, F1 Grip & Driver Showcase',items:[
  {tag:'PERF',t:'Up to 120 FPS Support & Zero-Alloc Frame Pacing',d:'Uncapped native rendering up to 120+ FPS on capable PC & mobile displays with selectable Frame Rate Target (Auto/120, 90, 60 FPS), decoupled 60Hz fixed-step physics + smooth sub-frame interpolation, and zero per-frame GC allocations in loop/camera/physics.'},
  {tag:'AUDIO',t:'New Realistic Deep "V8" Engine Synth (Replaced V10/V6)',d:'Removed high-pitched V10 and V6 mosquito whines; built a single authentic deep, throaty F1 V8 engine synth (default "V8") featuring sub-bass cylinder rumble, twin-bank firing harmonics, soft-clip exhaust grit, off-throttle burble, and zero post-race static.'},
  {tag:'UI',t:'Fixed-Box Zero-Scroll Step Menu Flow & Full Event Mode',d:'Refactored pre-race flow on PC & mobile landscape into zero-scroll fixed boxes: Main Menu → Circuit → Team & Driver → Race Setting → Race Briefing. Separated Practice, Qualifying, and Race (no forced Practice in Race), plus added Full Event (Practice + Qualifying + Race).'},
  {tag:'VISUALS',t:'Broadcast Driver Portraits & Animated 3D Beside-Car Showcase',d:'Replaced stick-figure driver icons with rim-lit F1 broadcast driver cards and added a Blender-proportioned articulated 3D driver posing beside the selected team car with unique animations per driver.'},
  {tag:'PHYSICS',t:'Planted F1 Grip Physics & Active Pit Lane Entry Gate',d:'Reduced excessive cornering/braking drift via stronger ground-effect lateral grip, grip-bounded yaw authority, and braking yaw-stability. Added solid concrete pit wall collision (no mid-straight cut-ins) plus an active FIA race-start pit entry gate.'},
  {tag:'CAMERA',t:'Dynamic Multi-Car Menu Highlight Director & Clean Sightlines',d:'Menu highlight camera now hunts live wheel-to-wheel overtake battles and cycles dynamically across random cars instead of locking onto one driver. In-race 3D driver name tags hide on cars behind you, and side scoreboard displays crisp 3-letter codes (VER, NOR, HAM, LEC).'},
  {tag:'UI',t:'Tabbed & Collapsible What\'s New Patch History',d:'Upgraded What\'s New modal with Current (v1.4.0) vs Previous (v1.3.0 & earlier) tabs and collapsible dropdown items per fix/feature.'}
 ]},
 {ver:'1.3.0',label:'Previous · v1.3.0',sub:'All-9-Circuit Realism & Cleanup, Race Lengths, Timed Practice, AI Pits & Fireworks',items:[
  {tag:'FIX',t:'All-9-Circuit Geometry, Corner, Barrier & Sand Cleanup',d:'Audited and fixed every circuit (Monaco Fairmont/Mirabeau/Tunnel, Silverstone Loop, Spa Bus Stop & La Source, Bahrain T1/T10, Monza Lesmo, Marina Bay T10, Imola chicane, Sepang & Jeddah): smoothed sharp corner kinks, added per-side dynamic safe barriers & catch-fences, and cleared all encroaching sand/gravel traps, embankments, and trackside props off the racing surface.'},
  {tag:'NEW',t:'Race Length Modes & Instant Skip to Race',d:'Choose Very Short (3), Short (5), Half Full (15), or Full (30 laps). Practice is lap-free with a live session timer (~5m Short / ~10m Full) and a 1-click Skip to Race button anytime.'},
  {tag:'PHYSICS',t:'Recalibrated Tyres & AI Pit Stop Strategy',d:'Soft lasts ~5–10 laps, Medium ~10–15 laps, Hard ~15–20 laps. AI teams execute multi-stop strategies, pit for worn tyres or wing damage, and fit compounds for remaining laps.'},
  {tag:'FIX',t:'Precision Steering & Larger Controls / Minimap',d:'Removed worn-tyre steering wobble and assist sign-flip—Left always steers left and Right always steers right. Enlarged minimap on PC & Mobile and oversized mobile touch pads.'},
  {tag:'PIT',t:'80 km/h Pit Compound Popup & Warning Banners',d:'Entering pit autopilot opens a 4-second tyre compound selector with team recommendation auto-fallback, paired with a bold 80 km/h Pit Limiter badge and amber hazard banners.'},
  {tag:'VISUALS',t:'Authentic Real-World 3D Circuits, Fireworks & Graphics',d:'Rebuilt all 9 F1 circuits with authentic landmarks: pitch-dark floodlit Marina Bay skyscraper canyon + Sands/Flyer, Monaco Riviera + harbour yachts, Monza banked oval, Silverstone Wing, Bahrain Sakhir Tower, Victory Outro fireworks & scalable Graphics presets.'}
 ]},
 {ver:'1.2.x',label:'Earlier · v1.2.x',sub:'Cross-Network Multiplayer, Rock Soundtrack & Standardized Defaults',items:[
  {tag:'FIX',t:'Multiplayer STUN/TURN Relay & Invite Links (v1.2.3)',d:'Added STUN + public TURN relay servers, PeerJS JSON DataChannel reliability, and 1-click ?join=CODE invite links for PC ↔ Mobile cross-play.'},
  {tag:'AUDIO',t:'Custom Rock Soundtrack & Pro Tyre Selection Cards (v1.2.2)',d:'Integrated uploaded rock intro/selection/outro soundtrack with zero post-race static and color-coded tyre compound cards.'}
 ]}
];
const PATCH_NOTES=PATCH_HISTORY[0].items;
['Italy','United Kingdom','United Kingdom','Germany / UK','United Kingdom','France','United Kingdom','Italy','USA','Germany','USA'].forEach((c,i)=>TEAMS[i].co=c);
const ROSTERS={
 2026:[
  [['Charles Leclerc',16,'MON','LEC',0],['Lewis Hamilton',44,'GBR','HAM',1]],
  [['Max Verstappen',3,'NED','VER',2],['Isack Hadjar',6,'FRA','HAD',3]],
  [['Lando Norris',1,'GBR','NOR',1],['Oscar Piastri',81,'AUS','PIA',0]],
  [['George Russell',63,'GBR','RUS',0],['Kimi Antonelli',12,'ITA','ANT',2]],
  [['Fernando Alonso',14,'ESP','ALO',1],['Lance Stroll',18,'CAN','STR',3]],
  [['Pierre Gasly',10,'FRA','GAS',0],['Franco Colapinto',43,'ARG','COL',2]],
  [['Alexander Albon',23,'THA','ALB',1],['Carlos Sainz Jr.',55,'ESP','SAI',0]],
  [['Liam Lawson',30,'NZL','LAW',2],['Arvid Lindblad',41,'GBR','LIN',3]],
  [['Esteban Ocon',31,'FRA','OCO',0],['Oliver Bearman',87,'GBR','BEA',1]],
  [['Nico Hülkenberg',27,'GER','HUL',2],['Gabriel Bortoleto',5,'BRA','BOR',3]],
  [['Sergio Pérez',11,'MEX','PER',0],['Valtteri Bottas',77,'FIN','BOT',1]]
 ],
 2027:[
  [['Charles Leclerc',16,'MON','LEC',0],['Lewis Hamilton',44,'GBR','HAM',1]],
  [['Max Verstappen',3,'NED','VER',2],['Isack Hadjar',6,'FRA','HAD',3]],
  [['Lando Norris',1,'GBR','NOR',1],['Oscar Piastri',81,'AUS','PIA',0]],
  [['George Russell',63,'GBR','RUS',0],['Kimi Antonelli',12,'ITA','ANT',2]],
  [['Fernando Alonso',14,'ESP','ALO',1],['Lance Stroll',18,'CAN','STR',3]],
  [['Pierre Gasly',10,'FRA','GAS',0],['Franco Colapinto',43,'ARG','COL',2]],
  [['Alexander Albon',23,'THA','ALB',1],['Carlos Sainz Jr.',55,'ESP','SAI',0]],
  [['Liam Lawson',30,'NZL','LAW',2],['Arvid Lindblad',41,'GBR','LIN',3]],
  [['Rafael Câmara',51,'BRA','CAM',0],['Oliver Bearman',87,'GBR','BEA',1]],
  [['Nico Hülkenberg',27,'GER','HUL',2],['Gabriel Bortoleto',5,'BRA','BOR',3]],
  [['Sergio Pérez',11,'MEX','PER',0],['Valtteri Bottas',77,'FIN','BOT',1]]
 ]
};
let DR=ROSTERS[2027];
function setSeason(yr){DR=ROSTERS[yr]||ROSTERS[2027]}
/* Shared circuit baseline defaults + per-track atmosphere themes (eliminates hardcoded Sepang-only branches) */
const TRACK_BASELINE={
 grade:'contrast(1.09) saturate(0.95) brightness(1.02)',
 kerbBorder:0x1b66c9,
 tecPro:[0x2a5bd7,0xf0f0f0],
 rcAccent:0xff2d3d,
 paddock:true,
 billboards:true,
 catchFence:true
};
const TRACK_THEMES={
 sepang:{sky:['#1b5ec4','#4f9be8','#b7dcf6','#f4e5cd','#5e8a5c',40,.62,280],fog:0xcfdbe4,grade:'contrast(1.10) saturate(0.94) brightness(1.02)',turf:0x3c5234,kerbBorder:0x1b66c9,tecPro:[0xff6a00,0xf4f4f4],rcAccent:0x00d2be,wallSp:true},
 spa:{sky:['#3b536b','#70889e','#b4c2ce','#d6dde2','#2c4a32',56,.78,360],grade:'contrast(1.10) saturate(0.92) brightness(1.02)',turf:0x2c462e,kerbBorder:0xd4141c,tecPro:[0xe02424,0xf4f4f4],rcAccent:0xffd200},
 silver:{sky:['#2469bd','#5d9ee0','#bad8f2','#e5ecf2','#365c34',46,.68,310],grade:'contrast(1.09) saturate(0.95) brightness(1.02)',turf:0x3b5736,kerbBorder:0x1e4ea8,tecPro:[0x2a5bd7,0xf4f4f4],rcAccent:0xff2d3d},
 monaco:{sky:['#1256c4','#3e8ef0','#9fd3fa','#f0eadb','#1d5a8a',24,.48,250],grade:'contrast(1.09) saturate(0.98) brightness(1.02)',kerbBorder:0xd4141c,tecPro:[0xd4141c,0xf4f4f4],rcAccent:0xff2d3d,paddock:false},
 imola:{sky:['#2266c8','#589de6','#bcdcf5','#f5e6cc','#385e34',34,.58,290],grade:'contrast(1.09) saturate(0.96) brightness(1.02)',turf:0x3d5735,kerbBorder:0x15803d,tecPro:[0x15803d,0xf4f4f4],rcAccent:0xff2d3d},
 monza:{sky:['#2468c6','#5b9ee4','#bdddf4','#f3e5cc','#345a32',32,.56,300],grade:'contrast(1.09) saturate(0.96) brightness(1.02)',turf:0x385233,kerbBorder:0x15803d,tecPro:[0xd4141c,0xf4f4f4],rcAccent:0xff2d3d},
 marina:{sky:['#010207','#030714','#070f22','#0c1328','#04070e',8,.07,0],fog:0x050a16,grade:'contrast(1.16) saturate(1.18)',kerbBorder:0x00d2be,tecPro:[0x2a5bd7,0xf4f4f4],rcAccent:0x38e8ff,paddock:false},
 bahrain:{sky:['#020309','#080a16','#161224','#241a24','#100c09',6,.08,0],fog:0x100e18,grade:'contrast(1.14) saturate(1.12)',kerbBorder:0xd4141c,tecPro:[0xd4141c,0xf4f4f4],rcAccent:0xffa63a},
 jeddah:{sky:['#010208','#030918','#08152b','#0d1d34','#040d16',8,.08,0],fog:0x061020,grade:'contrast(1.16) saturate(1.15)',kerbBorder:0x00d2be,tecPro:[0x1b7a5a,0xf4f4f4],rcAccent:0x6fd8ff,paddock:false}
};
function trackCfg(id){return Object.assign({},TRACK_BASELINE,TRACK_THEMES[id]||{})}
/* Sepang trackside sponsors (fictional brands): [name, background, text colour] */
const SP=[['SKYLINE AIR','#0a7d7a','#ffffff'],['PARCELIA','#ffcc00','#d40511'],['LUMIERE PARIS','#4a2e17','#f3d58a'],['MARITIMA','#0b2a5b','#ffffff'],['NEXTBYTE','#d01030','#ffffff'],['AETHER TYRES','#ffcc00','#111111'],['CLOUDWORKS','#1b8ae0','#ffffff'],['HOPSTAR','#0a7a3c','#ffffff'],['PETRA OIL','#00875a','#ffffff']];
const TRACKS=[
{id:'sepang',cg:110,csand:1,k2:[0x00a99d,0xffffff],hw:64,n:'Sepang International Circuit',cc:'Malaysia · tropical day',len:5.543,bw:168,gv:132,sky:[0x2f78d0,0xcfe6f7],gnd:0x2f7a3a,k:[0x00a99d,0xffffff],
 pts:[[388,321],[300,319],[210,317],[140.6,313.2],[91.4,305.4],[62.0,291.4],[52.8,274.8],[65.2,262.0],[91.6,255.6],[114.4,246.8],[116.0,226.8],[101.8,199.6],[93.6,170.0],[104.4,141.2],[132.2,116.0],[172.0,94.4],[225.6,82.8],[291.8,79.2],[341.6,70.8],[372.0,67.2],[386.2,84.8],[388.4,123.6],[397.2,170.0],[420.0,208.0],[453.2,229.2],[491.0,234.4],[526.2,227.2],[557.4,225.2],[586.2,245.0],[616.2,286.0],[645.8,331.6],[662.0,367.4],[663.2,397.6],[642.4,422.6],[593.6,434.8],[523.0,436.6],[460.0,436.4],[417.6,443.0],[397.4,461.6],[408.0,487.8],[419.4,515.2],[401.6,539.2],[367.0,547.4],[337.6,535.2],[317.4,510.0],[295.6,482.4],[266.4,458.0],[237.2,445.6],[208.4,450.6],[170.4,455.0],[132.4,449.0],[106.8,430.0],[104.2,404.4],[132.6,386.8],[190,380],[300,378],[420,377],[520,374],[562.0,364.6],[587.2,348.2],[588.8,331.6],[570,320],[520,320],[460,320]]},
{id:'marina',cg:100,px:80,pe:28,hw:48,n:'Marina Bay Street Circuit',cc:'Singapore · night',len:4.94,bw:140,gv:1e9,night:1,sky:[0x02040c,0x1b2a4a],gnd:0x23262c,k:[0xd4141c,0xffffff],
 pts:[[582,285],[568,235],[556,190],[547,150],[540,122],[528,100],[505,88],[478,86],[462,100],[468,130],[480,170],[486,205],[472,232],[440,232],[380,230],[300,224],[240,218],[208,214],[190,232],[178,256],[150,260],[115,257],[85,268],[65,300],[58,340],[68,385],[95,420],[126,456],[154,494],[175,506],[192,480],[184,430],[178,380],[176,330],[185,303],[220,298],[270,300],[320,322],[365,335],[420,330],[455,322],[480,340],[520,352],[560,350],[585,335],[586,315]]},
{id:'bahrain',cg:105,hw:58,n:'Bahrain International Circuit',cc:'Sakhir · desert night',len:5.412,bw:190,gv:110,night:1,dzn:3,sky:[0x030610,0x3a3050],gnd:0xc9a066,k:[0xd4141c,0xffffff],
 pts:[[1095,1022],[1000,1022],[900,1022],[800,1022],[700,1022],[600,1022],[500,1022],[400,1022],[300,1023],[240,1022],[208,1006],[200,980],[226,956],[272,930],[310,906],[330,878],[330,845],[310,780],[292,720],[292,670],[300,610],[312,520],[325,430],[340,350],[355,270],[368,180],[382,90],[395,55],[418,42],[445,55],[500,95],[560,155],[620,215],[690,270],[730,305],[748,340],[740,385],[722,430],[714,470],[726,500],[750,525],[800,560],[870,608],[936,644],[966,668],[956,696],[926,708],[860,712],[740,696],[640,684],[580,674],[520,686],[480,714],[462,754],[472,789],[500,804],[600,806],[760,809],[900,809],[1000,809],[1120,809],[1250,812],[1330,780],[1375,745],[1392,700],[1385,650],[1350,595],[1290,550],[1200,510],[1110,480],[1060,450],[1040,410],[1042,375],[1060,320],[1085,250],[1115,185],[1145,135],[1180,115],[1215,135],[1260,185],[1320,265],[1370,350],[1430,470],[1490,590],[1545,700],[1600,810],[1640,890],[1655,940],[1640,985],[1600,1015],[1550,1025],[1480,1025],[1400,1024],[1300,1023],[1200,1022]]},
{id:'spa',cg:105,px:75,pe:45,hw:54,n:'Circuit de Spa-Francorchamps',cc:'Belgium · Ardennes',len:7.004,bw:190,gv:110,sky:[0x5d7690,0xbfcad4],gnd:0x2a5a2a,k:[0xd4141c,0xffd200],
 
 pts:[[560,470],[500,470],[430,469],[360,468],[312,468],[276,462],[264,442],[286,416],[340,390],[420,355],[510,320],[590,296],[680,282],[760,272],[815,258],[850,235],[890,212],[925,210],[965,225],[1013,248],[1080,243],[1200,232],[1350,238],[1500,270],[1650,310],[1750,340],[1850,370],[1950,398],[1985,410],[2010,440],[2005,475],[2030,495],[2090,515],[2125,530],[2140,600],[2150,700],[2165,790],[2150,850],[2120,880],[2080,865],[2055,820],[2055,740],[2045,690],[2000,665],[1900,640],[1800,615],[1700,580],[1620,565],[1560,590],[1515,650],[1510,720],[1540,780],[1600,850],[1660,920],[1715,985],[1745,1040],[1735,1085],[1690,1105],[1650,1130],[1635,1170],[1670,1250],[1710,1330],[1745,1390],[1730,1440],[1680,1460],[1590,1450],[1520,1410],[1470,1340],[1430,1260],[1405,1190],[1390,1100],[1385,1000],[1380,900],[1355,820],[1320,760],[1270,700],[1225,660],[1160,640],[1070,625],[980,610],[900,580],[835,546],[796,518],[788,484],[772,462],[735,465],[685,468],[625,469]]},
{id:'silver',cg:115,px:90,pe:34,hw:56,n:'Silverstone Circuit',cc:'United Kingdom · wide runoffs',len:5.891,bw:190,gv:110,pw:92,sky:[0x5aa0e6,0xd7eaf8],gnd:0x3f8f3f,k:[0xd4141c,0xffffff],
 pts:[[1100,568],[1040,569],[980,570],[920,568],[880,562],[857,550],[840,520],[815,490],[790,462],[760,448],[720,440],[680,432],[648,412],[646,382],[668,354],[676,326],[640,312],[596,324],[562,354],[548,385],[545,440],[540,520],[535,610],[530,700],[528,770],[540,805],[560,815],[590,800],[630,770],[668,780],[682,812],[665,840],[610,858],[540,872],[505,855],[470,838],[420,800],[360,740],[300,680],[262,622],[258,585],[275,540],[320,490],[380,440],[425,370],[470,332],[524,300],[580,268],[595,236],[625,225],[665,212],[714,222],[800,215],[900,200],[1000,188],[1100,175],[1215,165],[1240,190],[1245,225],[1225,275],[1210,320],[1195,380],[1185,428],[1184,458],[1218,468],[1232,496],[1222,532],[1200,556],[1165,566]]},
{id:'monaco',tun:[1400,718,64],cg:95,px:70,pe:30,hw:46,n:'Circuit de Monaco',cc:'Monte Carlo · harbour street',len:3.337,bw:130,gv:1e9,sky:[0x2f78d0,0xcfe6f7],gnd:0x8d8a82,bg:0x1c6fb0,k:[0xd4141c,0xffffff],
 
 pts:[[268,610],[318,520],[385,455],[440,400],[500,350],[560,300],[620,262],[655,268],[720,310],[800,375],[900,435],[1000,490],[1100,545],[1180,600],[1230,618],[1285,600],[1318,555],[1330,490],[1370,430],[1440,405],[1540,388],[1622,374],[1662,402],[1628,448],[1562,486],[1535,545],[1568,592],[1620,576],[1670,535],[1722,535],[1748,572],[1718,615],[1645,650],[1560,678],[1470,710],[1350,735],[1220,715],[1110,670],[1030,620],[960,572],[925,585],[880,585],[853,550],[840,515],[790,470],[700,402],[660,372],[620,376],[560,398],[545,430],[535,490],[520,545],[480,598],[422,636],[386,634],[335,650],[322,720],[330,800],[356,875],[342,914],[298,912],[228,876],[182,824],[180,780],[202,740],[232,680]]},
{id:'imola',hw:52,n:'Autodromo Enzo e Dino Ferrari',cc:'Imola · Italy',len:4.909,bw:190,gv:110,sky:[0x4f95dd,0xd2e6f6],gnd:0x3f8a3a,k:[0xd4141c,0xffffff],el:[[0,0],[.35,-3],[.5,-14],[.6,6],[.7,10],[.85,4],[1,0]],
 pts:[[0,0],[300,0],[600,0],[850,0],[920,-12],[970,-38],[1030,-34],[1090,-52],[1160,-58],[1205,-32],[1255,-48],[1310,-85],[1380,-130],[1425,-200],[1425,-265],[1385,-325],[1320,-345],[1255,-320],[1180,-305],[1100,-330],[1020,-320],[940,-345],[860,-385],[790,-420],[740,-470],[690,-480],[640,-440],[600,-410],[540,-420],[470,-380],[400,-380],[330,-410],[240,-390],[150,-350],[60,-320],[-20,-300],[-90,-270],[-130,-210],[-135,-150],[-130,-90],[-100,-45],[-55,-15]]},
{id:'monza',cg:105,hw:58,n:'Autodromo Nazionale Monza',cc:'Italy · Temple of Speed',len:5.793,bw:190,gv:110,sky:[0x5aa0e6,0xd7eaf8],gnd:0x3d8a3d,k:[0xd4141c,0xffffff],
 pts:[[1065,800],[1000,800],[900,800],[800,800],[735,800],[680,800],[650,800],[622,797],[606,780],[590,768],[560,775],[520,790],[460,805],[400,812],[340,812],[290,805],[250,780],[225,745],[205,690],[195,630],[190,560],[185,520],[168,470],[162,400],[150,340],[120,260],[95,190],[75,140],[85,115],[145,98],[228,84],[274,104],[330,170],[400,260],[480,340],[520,380],[600,450],[680,540],[720,575],[760,578],[800,598],[830,622],[900,625],[1000,628],[1100,630],[1200,630],[1300,628],[1400,630],[1460,640],[1510,670],[1525,710],[1510,760],[1470,790],[1400,800],[1300,800],[1200,800]]},
{id:'jeddah',cg:105,hw:48,n:'Jeddah Corniche Circuit',cc:'Saudi Arabia · Red Sea night',len:6.174,bw:140,gv:1e9,night:1,dzn:3,sky:[0x02040b,0x16264a],gnd:0x30333a,bg:0x083d5c,k:[0xd4141c,0xffffff],
 pts:[[1190,150],[1120,200],[1040,238],[975,285],[940,330],[935,358],[925,392],[890,405],[835,408],[790,418],[745,430],[712,452],[690,480],[688,512],[665,538],[630,550],[590,545],[550,555],[525,575],[490,583],[450,595],[420,610],[395,620],[370,610],[335,620],[300,628],[260,640],[200,650],[160,670],[120,700],[80,730],[50,750],[38,775],[55,795],[85,790],[130,770],[165,745],[215,720],[260,712],[310,722],[350,720],[385,716],[420,730],[450,735],[500,722],[560,690],[620,650],[680,615],[730,590],[790,545],[830,500],[880,465],[940,440],[985,420],[1010,388],[1050,360],[1110,345],[1200,342],[1265,335],[1330,290],[1390,230],[1425,170],[1440,100],[1445,50],[1430,18],[1400,8],[1340,40],[1280,80],[1235,115]]}];

/* ---- corner variety + elevation (applied to track data so previews/minimap match) ---- */
const FEAT={
 sepang:{f:[],el:[[0,0],[.08,1.8],[.15,-.8],[.24,-2.2],[.36,1.2],[.48,3.6],[.62,4.4],[.74,1.2],[.84,.4],[.93,1.6],[1,0]],k:2.6},
 marina:{f:[],el:[[0,0],[.5,1],[1,0]],k:3},
 bahrain:{f:[],el:[[0,0],[.1,2],[.3,5],[.5,2],[.7,6],[.9,2],[1,0]],k:3},
 spa:{f:[],el:[[0,0],[.1,-3],[.14,6],[.2,10],[.3,5],[.5,2],[.7,6],[.8,0],[.9,-3],[1,0]],k:1.5},
 silver:{f:[],el:[[0,0],[.2,2],[.4,-1],[.6,3],[.8,0],[1,0]],k:3},
 monaco:{f:[],el:[[0,0],[.1,3],[.2,10],[.3,6],[.5,-2],[.7,-4],[.9,-8],[1,0]],k:1.6},
 imola:{f:[{at:[600,0],t:.14,L:.72,a:18}]},
 monza:{f:[],el:[[0,0],[.3,1],[.5,-1],[.75,2],[1,0]],k:3},
 jeddah:{f:[],el:[[0,0],[.3,1],[.6,-1],[1,0]],k:3}};
function applyFeat(d){const F=FEAT[d.id];if(!F)return;if(F.el)d.el=F.el.map(q=>[q[0],q[1]*(F.k||3)]);const P=d.pts;(F.f||[]).map(f=>({f,k:P.findIndex(p=>p[0]===f.at[0]&&p[1]===f.at[1])})).filter(o=>o.k>=0).sort((a,b)=>b.k-a.k).forEach(({f,k})=>{
 const A=P[k],B=P[(k+1)%P.length],dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,ins=[[.2,1],[.5,-1],[.8,0]].map(q=>{const t=f.t+f.L*q[0];return[A[0]+dx*t+nx*f.a*q[1],A[1]+dy*t+ny*f.a*q[1]]});P.splice(k+1,0,...ins)})}
TRACKS.forEach(applyFeat);

function drawTrk(c,d){const x=c.getContext('2d'),w=c.width,h=c.height;x.clearRect(0,0,w,h);const xs=d.pts.map(p=>p[0]),ys=d.pts.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),k=Math.min((w-20)/(Math.max(...xs)-x0),(h-20)/(Math.max(...ys)-y0));x.strokeStyle='#fff';x.lineWidth=1.2+(d.hw||54)/22;x.lineJoin='round';x.beginPath();d.pts.forEach((p,i)=>{const X=10+(p[0]-x0)*k,Y=10+(p[1]-y0)*k;i?x.lineTo(X,Y):x.moveTo(X,Y)});x.closePath();x.stroke();x.fillStyle='#ff3b30';x.fillRect(10+(d.pts[0][0]-x0)*k-3,10+(d.pts[0][1]-y0)*k-3,6,6)}
function drawDrv(c,tm,d,i){
 const x=c.getContext('2d'),w=c.width,h=c.height,cl=hex(tm.c),ac=hex(tm.d),c3=hex(tm.c3!=null?tm.c3:tm.d),code=d[3]||d[0].slice(0,3).toUpperCase();
 x.clearRect(0,0,w,h);
 // Dark carbon studio backdrop with dramatic dual rim-light glow (F1 broadcast editorial aesthetic)
 const bg=x.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#090d16');bg.addColorStop(.55,'#111827');bg.addColorStop(1,'#070a11');x.fillStyle=bg;x.fillRect(0,0,w,h);
 const rimL=x.createRadialGradient(w*.12,h*.36,4,w*.12,h*.36,w*.88);rimL.addColorStop(0,ac);rimL.addColorStop(.45,'rgba(0,0,0,0)');x.globalAlpha=.36;x.fillStyle=rimL;x.fillRect(0,0,w,h);
 const rimR=x.createRadialGradient(w*.92,h*.28,4,w*.92,h*.28,w*.85);rimR.addColorStop(0,cl);rimR.addColorStop(.55,'rgba(0,0,0,0)');x.globalAlpha=.52;x.fillStyle=rimR;x.fillRect(0,0,w,h);x.globalAlpha=1;
 // Subtle broadcast telemetry grid & diagonal speed slashes
 x.strokeStyle='rgba(255,255,255,.045)';x.lineWidth=1;for(let gy=18;gy<h;gy+=18){x.beginPath();x.moveTo(0,gy);x.lineTo(w,gy);x.stroke()}
 x.fillStyle=ac;x.globalAlpha=.14;x.beginPath();x.moveTo(0,h*.64);x.lineTo(w,h*.28);x.lineTo(w,h*.38);x.lineTo(0,h*.74);x.fill();x.globalAlpha=1;
 // Bold broadcast driver number watermark
 x.save();x.fillStyle='rgba(255,255,255,.075)';x.font='italic 900 '+Math.round(h*.44)+'px "Segoe UI",Arial,sans-serif';x.textAlign='right';x.fillText(String(d[1]),w-4,h*.44);x.restore();
 // Sculpted athletic F1 Nomex race suit torso & contoured shoulders (3/4 studio framing)
 const cx=w*.5+(i?4:-4);
 const suitG=x.createLinearGradient(cx-w*.46,h*.52,cx+w*.46,h);suitG.addColorStop(0,cl);suitG.addColorStop(.52,cl);suitG.addColorStop(1,'#0b0e15');
 x.fillStyle=suitG;x.beginPath();
 x.moveTo(cx-w*.48,h+6);x.quadraticCurveTo(cx-w*.46,h*.64,cx-w*.22,h*.57);x.lineTo(cx+w*.22,h*.57);x.quadraticCurveTo(cx+w*.46,h*.64,cx+w*.48,h+6);x.closePath();x.fill();
 // Studio rim edge highlights along shoulders
 x.strokeStyle=ac;x.lineWidth=2.4;x.globalAlpha=.75;x.beginPath();x.moveTo(cx-w*.44,h*.88);x.quadraticCurveTo(cx-w*.42,h*.64,cx-w*.18,h*.575);x.stroke();x.globalAlpha=1;
 // Carbon shoulder pads + sculpted chest yoke & team sponsor racing stripes
 x.fillStyle='rgba(10,14,22,.62)';x.beginPath();x.ellipse(cx-w*.31,h*.69,w*.12,h*.07,-.35,0,TAU);x.fill();x.beginPath();x.ellipse(cx+w*.31,h*.69,w*.12,h*.07,.35,0,TAU);x.fill();
 x.fillStyle=ac;x.beginPath();x.moveTo(cx-w*.30,h*.73);x.lineTo(cx+w*.30,h*.73);x.lineTo(cx+w*.26,h*.81);x.lineTo(cx-w*.26,h*.81);x.closePath();x.fill();
 x.fillStyle='rgba(255,255,255,.22)';x.fillRect(cx-w*.26,h*.73,w*.52,2.5);
 x.fillStyle=c3;x.fillRect(cx-w*.22,h*.83,w*.44,4);
 // Center FIA race suit zipper & high Nomex fireproof collar + HANS pads
 x.fillStyle='rgba(0,0,0,.45)';x.fillRect(cx-2.2,h*.58,4.4,h*.42);x.fillStyle='rgba(255,255,255,.35)';x.fillRect(cx-.7,h*.58,1.4,h*.42);
 x.fillStyle='#141822';x.beginPath();x.roundRect(cx-w*.14,h*.50,w*.28,h*.10,6);x.fill();
 x.strokeStyle=ac;x.lineWidth=1.5;x.strokeRect(cx-w*.12,h*.52,w*.24,h*.055);
 // Team sponsor wordmark on chest
 x.fillStyle='#0a0d14';x.font='900 '+Math.max(8,Math.round(w*.075))+'px "Segoe UI",Arial,sans-serif';x.textAlign='center';x.fillText((tm.b||tm.a).slice(0,9),cx,h*.785);
 // Sculpted 3/4 Aerodynamic F1 Helmet (shaded multi-stop metallic shell + reflective tinted visor)
 const hx=cx,hy=h*.34,hr=h*.205,dir=i?1:-1;
 // Soft ambient shadow under helmet chin
 x.fillStyle='rgba(0,0,0,.55)';x.beginPath();x.ellipse(hx,hy+hr*.92,hr*.82,hr*.26,0,0,TAU);x.fill();
 const hBase=i?ac:'#eef2f8';
 const hG=x.createRadialGradient(hx-dir*hr*.32,hy-hr*.36,hr*.12,hx,hy,hr*1.12);
 hG.addColorStop(0,'#ffffff');hG.addColorStop(.32,hBase);hG.addColorStop(.78,cl);hG.addColorStop(1,'#0b0e16');
 x.fillStyle=hG;x.beginPath();x.ellipse(hx,hy,hr*.95,hr*1.02,0,0,TAU);x.fill();
 // Sculpted lower chin guard contour
 x.fillStyle=hG;x.beginPath();x.moveTo(hx-hr*.82,hy+hr*.16);x.quadraticCurveTo(hx+dir*hr*.12,hy+hr*1.12,hx+hr*.84,hy+hr*.24);x.quadraticCurveTo(hx+dir*hr*.2,hy+hr*.78,hx-hr*.82,hy+hr*.16);x.fill();
 // Crown racing livery stripe + geometric wing graphic
 x.save();x.beginPath();x.ellipse(hx,hy,hr*.94,hr*1.01,0,0,TAU);x.clip();
 x.fillStyle=i?cl:ac;x.beginPath();x.moveTo(hx-hr,hy-hr*.55);x.quadraticCurveTo(hx,hy-hr*.95,hx+hr,hy-hr*.22);x.lineTo(hx+hr,hy-hr*.02);x.quadraticCurveTo(hx,hy-hr*.55,hx-hr,hy-hr*.25);x.closePath();x.fill();
 x.fillStyle=c3;x.fillRect(hx-hr,hy-hr*.18,hr*2,4);
 // Curved glossy dark-mirror F1 visor with dynamic studio reflection sheen
 const vx=hx+dir*hr*.16,vy=hy+hr*.08,vw=hr*1.48,vh=hr*.52;
 const vG=x.createLinearGradient(vx-vw*.5,vy-vh*.5,vx+vw*.5,vy+vh*.5);
 vG.addColorStop(0,'#060910');vG.addColorStop(.35,'#152842');vG.addColorStop(.55,ac);vG.addColorStop(.72,'#0d1422');vG.addColorStop(1,'#05070c');
 x.fillStyle=vG;x.beginPath();x.ellipse(vx,vy,vw*.5,vh*.5,dir*.06,0,TAU);x.fill();
 x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=1.4;x.stroke();
 // Crisp top visor strip & specular reflection highlight
 x.fillStyle=cl;x.fillRect(vx-vw*.48,vy-vh*.52,vw*.96,vh*.22);
 x.fillStyle='rgba(255,255,255,.42)';x.beginPath();x.ellipse(vx-dir*vw*.14,vy-vh*.06,vw*.24,vh*.10,-.14,0,TAU);x.fill();
 x.restore();
 // Rim highlight halo on helmet edge
 x.strokeStyle=ac;x.lineWidth=1.8;x.globalAlpha=.8;x.beginPath();x.arc(hx,hy,hr*.97,-Math.PI*.85,-Math.PI*.15);x.stroke();x.globalAlpha=1;
 // Broadcast top-right Driver Number & 3-Letter Code pill
 x.fillStyle='#ffffff';x.font='italic 900 '+Math.max(18,Math.round(h*.145))+'px "Segoe UI",Arial,sans-serif';x.textAlign='right';x.fillText(String(d[1]),w-8,Math.round(h*.155));
 x.fillStyle=ac;x.fillRect(8,h-22,4,14);
 x.fillStyle='rgba(255,255,255,.92)';x.font='800 '+Math.max(10,Math.round(w*.08))+'px "Segoe UI",Arial,sans-serif';x.textAlign='left';x.fillText(code,15,h-11);
}

const pitBox=t=>10+t*4;
const LOGO={},logo=t=>LOGO[t]||(LOGO[t]=(()=>{const c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d'),m=TEAMS[t];x.fillStyle='#0b0f18';x.beginPath();x.arc(24,24,23,0,TAU);x.fill();x.save();x.beginPath();x.arc(24,24,20,0,TAU);x.clip();x.fillStyle=hex(m.c);x.fillRect(0,0,48,48);x.fillStyle=hex(m.d);x.beginPath();x.moveTo(0,34);x.lineTo(48,12);x.lineTo(48,22);x.lineTo(0,44);x.fill();x.restore();
 x.font='800 15px Arial';x.textAlign='center';x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.7)';x.strokeText(m.a,24,29);x.fillStyle='#fff';x.fillText(m.a,24,29);return c.toDataURL()})());
