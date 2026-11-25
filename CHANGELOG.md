# Apex GP 3D — Changelog (Patch-by-Patch)

All notable changes, bug fixes, visual upgrades, and feature patches for **Apex GP 3D** are documented here for release tracking.

---

## [v1.3.0] — Race Length Modes, Lap-Free Practice, Tyre & AI Pit Overhaul, Steering Fix, 80 km/h Pit Popup, Richer 3D Scenery, Outro Fireworks & News Modal
### Added
- **Race Length Modes, Lap-Free Timed Practice & Instant Skip to Race (`src/core/data.js`, `src/core/engine.js`, `index.html`, `mobile.html`)**:
  - Updated race lengths to **Very Short** (`3 laps`), **Short** (`5 laps`), **Half Full** (`15 laps`), and **Full** (`30 laps`) with practice duration sub-labels (`~5m` Short / `~10m` Full).
  - Practice is lap-free with a live session countdown HUD (`PRACTICE · LAP N · MM:SS LEFT`), automatic finish at `0:00`, a 1-click **`⏭ Skip to Race`** button on the Practice HUD, Pause menu & Race Briefing, and an **End Practice & View Results** option.
- **80 km/h Pit Compound Selection Popup & Pit Limiter HUD (`src/core/engine.js`, `src/core/base.css`, `index.html`, `mobile.html`)**:
  - Entering pit lane autopilot displays a bold **`PIT LIMITER ACTIVE · 80 KM/H`** badge and opens a **`4.0s` Tyre Compound Selector** (`SOFT`/`MEDIUM`/`HARD`) with `TEAM REC` pill; if countdown expires without confirmation, the team's recommended compound is automatically fitted.
- **Victory Outro Fireworks (`src/core/world.js`, `src/core/engine.js`)**: Pooled multi-color 3D radial sky firework bursts + subtle firework pop SFX during victory/podium outlap celebration (cleanly cleared on restart/quit with zero static).
- **Main Menu "What's New?" First-Visit Auto-Popup (`index.html`, `mobile.html`, `src/core/engine.js`, `src/core/base.css`)**: Added top-right **`✨ What's New?`** button with glowing pulsing red unread badge and automatic first-visit popup for `v1.3.0` (`localStorage` persisted once dismissed), plus `?v=1.3.0` asset cache-busting on PC & Mobile.
- **Expanded Graphics & Performance Settings (`index.html`, `mobile.html`, `src/core/engine.js`)**: Added Presets (`Max FPS` / `Balanced` / `Ultra`), **Shadows Quality** (`Off` / `Low` / `High`), **Ray-Traced Reflections & Advanced Lighting** toggle (`#s_rt`), **HD Resolution Scale** (`0.6x–1.5x`), **Scenery & Track Detail**, and **Camera FOV**.
### Fixed & Improved
- **Precision Steering Fix (`src/core/engine.js`)**: Removed worn-tyre `cliffWobble` and sign-guarded Steering Assist (`c.sAdd`) so Left always steers left and Right always steers right across all tyre wear states (verified `72/72` exact sign tests).
- **Recalibrated Tyre Endurance & AI Pit Stop Strategy (`src/core/data.js`, `src/core/engine.js`)**: Rebalanced compound wear (**Soft** `~5–10 laps`, **Medium** `~10–15 laps`, **Hard** `~15–20 laps`) and upgraded AI multi-stop pit strategy for worn tyres, front-wing damage (`>35%`), and mid-race strategy calls (`11/11` finished & pitted cleanly on 15-lap stress test).
- **Larger Minimap, Oversized Mobile Touch Controls & Amber Warnings (`src/core/base.css`, `src/mobile/mobile.css`)**: Enlarged PC minimap (`176×176px`), mobile minimap (`clamp(104px, 28dvh, 124px)`), enlarged mobile touch controls (`72px` base / `~83px` at `1.15x` with `◀ LEFT` / `RIGHT ▶`), and styled collision/penalty/off-track alerts as high-visibility amber hazard banners (`⚠`).
- **Authentic Real-World 3D Scenery Across All 9 Circuits (`src/core/data.js`, `src/core/world.js`, `src/core/engine.js`)**: Rebuilt all 9 F1 circuits with deterministic corridor-hugging city/forest walls, FIA steel street catch-fences, true pitch-dark floodlit night skies, and real landmarks — **Marina Bay** (dense lit Singapore CBD canyon, Marina Bay Sands, rotating Singapore Flyer, Esplanade domes, Benjamin Sheares highway viaducts), **Monaco** (Riviera balcony apartments, Casino de Monte-Carlo, Port Hercule superyachts, Fairmont tunnel), **Jeddah** (neon LED steel canyon, Corniche towers & twisted spire), **Bahrain** (Sakhir Control Tower, Arabian hospitality domes, starry desert dunes), **Sepang** (Twin Hibiscus grandstand, control tower, palm avenues), **Spa** (Ardennes pine canyon & chalets), **Silverstone** (Silverstone Wing paddock, wartime arched hangars, British fan tents), **Imola** (Emilia-Romagna villas, Tuscan cypresses, Senna tribute monument), and **Monza** (historic concrete banked oval & Parco di Monza oak walls).

---

## [v1.2.3] — Multiplayer NAT/TURN Connectivity Fix, Invite Links, Sub-Frame Interpolation & Max FPS Mode
### Fixed
- **Multiplayer Cross-Network / Mobile Connectivity (`src/core/engine.js`, `index.html`, `mobile.html`)**:
  - Added multi-provider **STUN + public TURN relay** `iceServers` (Google STUN, Cloudflare STUN, OpenRelay/Metered TURN on ports `80`/`443`/`443 TCP`) so PC ↔ Mobile and 4G/5G CGNAT connections succeed instead of hanging on `"Connecting..."`.
  - Switched PeerJS DataChannel to `{ serialization: 'json', reliable: true }` (fixes PeerJS 1.5.4 BinaryPack stalls on mobile browsers).
  - Added `peer.on('disconnected')` auto-reconnect, `conn.on('error')`, live ICE state progression, `15s` connection timeout with actionable error messages, and `cdn.jsdelivr.net` fallback if `unpkg.com` PeerJS fails to load.
- **60Hz Fixed-Step Micro-Stutter (`src/core/engine.js`)**: Added **sub-frame visual interpolation** (`px/py/pa/pey` → `x/y/a/ey` blended by `alpha = acc / fixedDt`) across all cars & camera so 60 / 90 / 120 / 144 / 240+ Hz displays render smoothly on every native refresh frame.
### Added & Optimized
- **One-Click Invite Link (`index.html`, `mobile.html`, `src/core/engine.js`)**: Added `📋 Copy Invite Link` (`?join=CODE`) in Host Lobby; opening an invite URL auto-opens Multiplayer with the 4-letter code pre-filled.
- **Max FPS / Balanced / Ultra Graphics Presets (`index.html`, `mobile.html`, `src/core/engine.js`, `src/pc/pc.js`, `src/core/base.css`)**: Added `Performance / FPS Mode` toggle in Settings → Graphics (`Max FPS` disables shadows & caps DPR to `1.0`, `Balanced` uses fast `PCFShadowMap` + `1024` shadow map on PC, `Ultra` enables `2048` `PCFSoftShadowMap`), quantized sun shadow frustum snapping, uncapped FPS readout to `360`, removed unused `EffectComposer`/`Bloom` CDN scripts, and removed `#gl` CSS filter transition overhead.

---

## [v1.2.2] — Uploaded Rock Soundtrack, Pro Mobile Selection UI, Tyre Lifespan Cards & Larger Mobile Minimap
### Added & Improved
- **Custom Rock Soundtrack (`assets/music/theme.mp3`, `src/core/engine.js`)**: Integrated uploaded rock theme across **PC & Mobile** for Intro/Home & all Selection pages (continuous across Home → Team → Driver → Briefing), smooth `0.45s` fade-out at race start, and climactic anthem chorus (`1:36`) fade-in at chequered flag across the winning outlap & results (with automatic WebAudio synth fallback if offline).
- **Pro Selection UI & Fixed Mobile Highlights (`src/core/base.css`, `src/core/engine.js`, `index.html`, `mobile.html`)**:
  - Fixed CSS specificity bug where `body.touch .btn` hid active `.on`/`.go` red highlights on mobile chips and CTAs.
  - Upgraded `#tires` into rich color-coded compound cards displaying grip & lifespan (**SOFT** `Max Grip · 1–2 Laps`, **MEDIUM** `Balanced · 3–5 Laps`, **HARD** `Endurance · 6–10 Laps`) that **live-update the rotating 3D car's tyre sidewall color** on click/tap!
  - Added compact single-row Driver header (`Choose driver` + `2026 | 2027`), `✓ SELECTED` badge on active driver card, and left-docked split layout (`min(385px, 50vw)`) with right-shifted 3D showcase turntable so mobile landscape never clips or overlaps the car.
- **Larger Mobile Minimap (`src/core/base.css`)**: Enlarged mobile `#mm` from `58×58px` → **`92×92px`** (`opacity: .94`) for clear upcoming-corner readability.

---

## [v1.2.1] — Fix Post-Race Audio Static, Fix Re-Race Camera Alignment, AI Worn-Tyre Pacing & Mobile Fullscreen
### Fixed
- **Off-Center Camera on Re-Race (`src/core/engine.js`)**: `runNow()` now calls `cleanRun()` and `begin()` explicitly clears split-screen `camera.clearViewOffset()`, snaps `this.cam.a = this.P.a`, resets FOV, clears old skidmarks/particles, and snaps `frame(0)` on the grid so every Race Again / Next Circuit starts dead-center on the car.
- **Post-Race Static / Noise Audio (`src/core/engine.js`)**: Added `Sfx.silenceRace()` (`cancelScheduledValues` + smooth `35ms` zero ramp on engine, turbo, tyre screech, and brake hiss gains), gated race audio strictly off at chequered flag (`doneT >= 0`), and added smooth `18ms` attack ramps + `document.hidden`/`sv > 0` guards to `playTheme()` arpeggios.
- **AI Worn-Tyre Corner Pacing (`src/core/engine.js`)**: Scaled `ctrlAI()` corner speed limit by `Math.sqrt(wMul * compoundGrip)` so Soft-tyre AI slows cleanly in chicanes/corners on Lap 2 without sliding into gravel.
### Added
- **Mobile Fullscreen Support (`index.html`, `mobile.html`, `src/mobile/mobile.js`, `src/core/engine.js`)**: Added PWA fullscreen meta tags, dedicated `#qF` (`⛶` / `⤢`) fullscreen toggle button in `#qb`, safe auto-fullscreen attempt on mobile race start, and `fullscreenchange` canvas resize sync.

---

## [v1.2.0] — Exact Defaults (V8/2027/Close 3P), Unmistakable Button Highlights, Shared Intro/Outro Music & Universal All-Track Factory
### Added & Improved
- **Standardized Default Settings (PC & Mobile)**: Engine Sound **`V8`**, Season Roster **`2027`**, Steering Assist **`LOW`**, Brake Assist **`LOW`**, Racing Line **`CORNER`**, ERS **`AUTO`**, and Camera **`Close 3rd-Person Chase`** (`defaultCam: 1`) across both PC and Mobile (`localStorage` bumped to `apexgp3d.v3` for clean migration without stale overrides).
- **Unmistakable Button Press & Selection Highlights (`src/core/base.css`, `src/mobile/mobile.css`, `src/core/engine.js`)**: Unified `:active`, `:focus-visible`, `.is-pressed` (`90ms` min tap flash), and `.is-selected`/`.on` glow ring + scale feedback across all menus, option selectors, and race touch controls, with `touch-action: manipulation` on UI buttons and zero sticky hover on touch devices.
- **Shared Intro & Outro Music Across PC & Mobile (`src/core/engine.js`)**: Upgraded `Sfx.playTheme('intro' | 'outro' | 'off')` with safe `AudioContext.resume()` unlock on first click/touch/key — smooth menu intro fade-out on race start and uplifting celebratory outro theme + rotating 3D golden trophy from chequered flag through live outlap & split-screen results.
- **Universal Sepang Baseline Circuit Factory (`src/core/data.js`, `src/core/engine.js`)**: Extracted shared `TRACK_BASELINE` + `TRACK_THEMES` so all 9 tracks inherit Sepang's paddock garages/tents, corner sponsor billboards, catch-fencing, kerb outer borders, `150/100/50` braking boards, Race Control Tower, LED Timing Pylon, PBR materials, and leak-free track-switching disposal.

---

## [v1.1.0] — Modular PC/Mobile Architecture, Phase 3 Cross-Play MP Sync & Close 3rd-Person Cam
### Added & Refactored
- **Shared Core + Platform-Separated Architecture**: Split codebase into `src/core/` (`data.js`, `world.js`, `engine.js`, `base.css`), `src/pc/` (`pc.js`, `pc.css`), and `src/mobile/` (`mobile.js`, `mobile.css`) with automatic platform routing in `index.html` (`?mode=pc` / `?mode=mobile` override), direct `mobile.html` entry, and architecture docs in `README.md`.
- **Phase 3 Cross-Play Multiplayer Sync (PC ↔ Mobile)**:
  - Fixed-timestep physics accumulator (`1/60s`, max 4 substeps) so 30–60 FPS mobile and 60–144+ FPS PC clients simulate identically.
  - Batched quantized network snapshots (`20 Hz`, single WebRTC packet per tick instead of 11 separate car messages — 11× fewer packets, ~70% smaller payload, including live tyre compound sync).
  - 4-snapshot interpolation buffer with adaptive RTT delay + bounded velocity extrapolation (`<= 120ms`) and soft correction (hard snap only > `130` units) to eliminate rubber-banding.
  - Added live RTT ping/pong (`1.5s`) and toggleable `#netDbg` HUD (`F3` or Settings → Controls) showing Platform, FPS, Net Hz, and Ping ms.
- **New 5th Camera View — Close 3rd-Person (`Close 3P`)**: Added tight rear-wing chase camera (`this.view = 1`, cycle: Wide Chase → Close 3rd-Person → T-Cam → Halo → Eagle Eye).

---

## [v1.0.6] — Live Scoreboard With Tyre Compound (PC & Mobile), Adjustable Touch Buttons & Mobile Bird's-Eye Camera
### Added & Improved
- **Live Scoreboard Tyre Badges (`game.js`, `style.css`)**: Added color-coded active tyre compound pills (`S` red, `M` yellow, `H` white) next to every driver in `#tower` on **both PC and Mobile** (live-updates after pit stops).
- **Compact Mobile Scoreboard (`style.css`, `game.js`)**: Restored `#tower` on mobile top-left below `#lapi` (showing Top 5 + player row cleanly at `10px`), and moved compact `58×58px` `#mm` minimap to top-right below `#qb`.
- **Adjustable Touch Button Size (`index.html`, `style.css`, `game.js`)**: Added **Touch button size** slider (`0.8x`–`1.4x`, default `1.15x` → `~69px` comfortable side pads for easy Gas/Brake/Turn pressing) in Settings → Controls, persisted in `localStorage`.
- **Mobile Default Bird's-Eye Camera (`game.js`)**: Automatically defaults mobile players to **Eagle Eye / Bird's-Eye** view (`this.view = 3`) while keeping Desktop PC at **Wide Chase** (`this.view = 0`).
- **Small / Landscape Mobile Menu UI (`style.css`)**: Optimized menus, team/driver cards, and modals under `@media (max-height:500px),(max-width:700px)` so all screens fit cleanly without clipping.

---

## [v1.0.5] — Split-Screen Post-Race Results + Live Winning Driver Outlap Celebration
### Added & Improved
- **Left-Side Broadcast Results Panel (`style.css`, `game.js`)**: Docked `#res.split` cleanly on the left (`min(450px, 46vw)`, compact on mobile landscape) with a directional gradient instead of a dark blocking modal, plus a **Race Again** button alongside **Next Circuit** and **Main Menu**.
- **Live Winning Driver Celebration Outlap (`game.js`)**: Cars keep driving smoothly via AI cooldown outlap in `done2` (no static freeze!) with golden celebratory sparks streaming around the winning car and a floating bottom-right `#winBadge` (`🏆 WINNER · DRIVER · CELEBRATION OUTLAP`).
- **Right-Side F1 TV Highlight Camera (`game.js`)**: Uses `camera.setViewOffset` to frame the celebrating winning car dead-center in the open right side of the screen, cycling 3 broadcast highlight angles (low front-3/4 tracking, sweeping side-profile chase, elevated helicopter orbit) every `4.5s`.

---

## [v1.0.4] — Mobile Black-Screen Fix, Landscape Touch UI & 60 FPS Mobile Optimization
### Fixed
- **Black Screen on Race Entry (`game.js`, `style.css`)**: Added bulletproof `clearFade()` + `900ms` failsafe in `fade(fn)` and forced fade clear + `resize()` on `begin()`, preventing `#fade` (`z-index: 60`) from ever stalling opaque during track load.
- **WebGL Context Loss & Orientation Resize (`game.js`, `index.html`, `style.css`)**: Added `webglcontextlost` / `webglcontextrestored` handlers, locked canvas/body to `100vw × 100dvh` with `viewport-fit=cover` + `env(safe-area-inset-*)`, and wired `orientationchange` + `visualViewport.resize`.
- **Roster Cleanup (`data.js`)**: Removed unrequested Vortex team, restoring the exact 11 official F1 teams while keeping the `v1.0.3` sleek car model, upright sidepod/shark-fin decals, and rotating wheel rings.
### Improved
- **Mobile Landscape & Touch Controls (`index.html`, `style.css`, `game.js`)**: Added non-blocking portrait-to-landscape banner (`#rot`), compact non-overlapping mobile landscape HUD, `setPointerCapture` multi-touch steering/gas/brake/ERS buttons (`>= 48px–76px` targets) plus quick `CAM` and `TYRE` buttons.
- **Mobile 60 FPS Budget (`game.js`)**: Auto-caps mobile DPR (`1.25`), shadow map (`1024×1024`), anisotropy (`8`), and particle pool sizes (`160`/`120`).

---

## [v1.0.3] — Sleek Formula Car 3D Model, Vortex Livery Decals & Wheel/Tyre Redesign
### Added & Improved
- **Apex GP Vortex Factory Livery (`data.js`)**: Added **Apex GP Vortex** (`APX`, `#1`) as the lead showcase team with deep navy/indigo bodywork (`#242b52`), crisp teal/cyan accents (`#22d1be`), white shark-fin panel (`#f2f4f8`), dark gunmetal rims, and **`VORTEX`** sidepod branding while keeping all 11 official F1 teams intact.
- **Sleek Modern Open-Wheel Chassis (`world.js`)**: Sculpted low-slung tapered nosecone with teal/accent tip, 4-element swept front wing (off-white mainplanes + teal pinstripes + bold two-tone navy/teal sculpted endplates + dual nose pylons), dark matte carbon Halo + teal/yellow visor helmet, rounded teardrop sidepods with deep undercut & recessed dark intakes, tall crisp white shark-fin number panel, and dual-plane rear wing with tall dark navy endplates.
- **Upright Sidepod & Shark-Fin `CanvasTexture` Decals (`world.js`, `game.js`)**: Added cached `sidepodTex()` and `finTex()` mounted on separate outward-facing left/right plates so **`VORTEX` / team badges** and live **driver numbers** (`1`, `16`, `44`, etc.) render crisply with zero mirroring on both sides.
- **Wheels & Rotating Compound Sidewall Rings (`world.js`)**: Redesigned dark matte concave aero wheel covers (`wheelCoverTex`) with thin silver inner-rim ring & hub nut, slick tyres, and vivid outer sidewall compound ring (Yellow Medium, Red Soft, White Hard) rotating smoothly with `o.sp` spin and `o.fwL` steering.

---

## [v1.0.2] — Photorealistic Ray-Traced-Style PBR, Contact AO & Filmic Lighting Pass
### Improved
- **Tight Contact AO & 4-Wheel Grounding (`world.js`)**: Deepened under-chassis AO core (`rgba(0,0,0,.86)`) and added 4 tight oval tire contact-patch shadows under each wheel (`y = 0.14`) so every F1 car sits firmly planted on the tarmac.
- **Dark Charcoal Specular Asphalt & Glossy Rubber Groove (`world.js`, `game.js`)**: Shifted asphalt texture (`TX.a`) to cool dark charcoal (`#2f343c`) with fine aggregate micro-grain, enabled grazing Fresnel sky reflections (`metalness: 0.14, roughness: 0.62, envMapIntensity: 1.35`), and added a dedicated glossier rubbered-in racing groove (`mGrr`, `roughness: 0.44, metalness: 0.18`) contrasting against crisp white boundary lines.
- **High-Contrast F1 Car PBR & Multi-Band Sky IBL (`world.js`, `game.js`)**: Mirror-like clearcoat bodywork (`clearcoat: 1.0, clearcoatRoughness: 0.06, envMapIntensity: 1.85`) contrasted against satin-matte carbon (`roughness: 0.54`) and satin tyre shoulder sheen (`0x121419, roughness: 0.64`), lit by an upgraded multi-band horizon + zenith `PMREMGenerator` environment map.
- **Filmic Neutral-Cool Broadcast Grading (`game.js`)**: Tuned per-circuit `#gl` grading (`contrast(1.10) saturate(0.94)`), muted natural Malaysian olive turf (`0x3c5234`), and smooth horizon aerial haze (`#cfdbe4`) while keeping native hardware MSAA + `ACESFilmicToneMapping` + 60 FPS.

---

## [v1.0.1] — Hotfix: Restore Native MSAA + ACESFilmicToneMapping & Fix Tunnel Lighting Math
### Fixed
- **Dull/Washed-Out Graphics (`EffectComposer` r128 Bug)**: Disabled Three.js r128 `EffectComposer` offscreen pass that bypassed `ACESFilmicToneMapping` and hardware MSAA anti-aliasing, immediately restoring crisp razor-sharp edges, vivid colors, and rich PBR reflections.
- **Tunnel Lighting Precedence Bug**: Fixed `this.tunK` lerp parenthesis so tunnel darkening stays strictly clamped in `[0, 1]`.
- **Lighting & Color Vibrancy**: Tuned `toneMappingExposure` (`1.24`), directional sun (`1.68`), hemisphere bounce (`1.12`), and per-circuit vivid broadcast grading.

---

## [v1.0.0] — Smarter Predictive AI, Tunnel Lighting, Subtle Bloom, V10/V8 Audio & Post-Win Trophy Montage
### Added
- **Predictive Collision-Aware AI (`ctrlAI`)**: Multi-step lookahead (`0.35s / 0.75s / 1.25s`) using position, velocity, and car width to detect rear-end or side-by-side threats, smoothly evade left/right within track width (`c.evadeOff`, zero oscillation), and yield/brake early in tight corners or boxed-in traffic.
- **Dynamic Tunnel Lighting & `EffectComposer` Subtle Bloom**: Enclosed tunnels (`T.tun`) dynamically darken exterior sun/hemi light and brighten interior lighting; added Three.js `EffectComposer` + `RenderPass` + subtle `UnrealBloomPass` with automatic low-FPS safeguard (`perf()`).
- **Menu Music + Selectable V10 / V8 / V6 Engine Audio**: Ambient WebAudio F1 broadcast menu synth that fades out smoothly on race start, plus selectable **V10 Scream**, **V8 Growl**, and **V6 Hybrid** engine profiles in Settings → Audio.
- **Post-Win Outro Montage & 3D Trophy-Lift Celebration**: 6.5s cinematic outro orbiting the winning car followed by a rising 3D golden trophy/podium with confetti sparks and fanfare before showing the race results table (`Space`/`Enter` skips).
- **Centered Driver Names**: Horizontally and vertically centered driver names inside `#tower` leaderboard rows and 3D floating car name tags.

---

## [v0.9.7] — Realistic Tyre Wear & Tear Balance (Soft / Medium / Hard)
### Changed
- **Distance-Normalized Tyre Wear (`data.js` & `game.js`)**: Replaced time-based wear with lap-distance-normalized wear (`0%` fresh at start / stationary) matching realistic stint lifespans across all circuits:
  - **SOFT** (`g: 1.05`, `w: 0.50`): ~45–55% wear per lap (**1–2 laps**).
  - **MEDIUM** (`g: 1.00`, `w: 0.24`): ~20–28% wear per lap (**3–5 laps**).
  - **HARD** (`g: 0.94`, `w: 0.125`): ~10–15% wear per lap (**6–10 laps**).
- **3-Stage Grip Degradation Cliff**: Gentle loss `0–60%`, progressive drop `60–80%`, sharp handling cliff & instability warning past `80%`.
- **AI Pit Strategy & 6-Lap Option**: Raised AI `pitAt` threshold (`74–82%`), added `lastPitLap` guard against consecutive-lap pitting, smart remaining-lap compound choice (`rem >= 5 -> H`, `rem >= 3 -> M`, else `S`), and added `6 laps` chip option.

---

## [v0.9.6] — Smooth Track Splines, Realistic F1 Cornering Grip & Driver Freedom
### Fixed
- **Track & S-Bend Kinks**: Added 5-pass arc-length spline smoothing (`world.js`) + 5-point curvature smoothing so all 9 tracks have silky-smooth straights, sweeping S-bends, and clean hairpins with zero wobbly kinks.
- **Phantom Auto-Braking on Straights/Sweepers**: Raised F1 downforce corner speed limits (`cg × 1.48`, mild sweepers `|ks| < 0.00105` now flat-out `480`), defaulted Braking Assist to `Off` for full player throttle freedom, and restricted optional `Low/High` Braking Assist strictly to genuine heavy braking zones (`vt < 340`).
### Improved
- **F1 Turn-In & Downforce Grip**: Boosted lateral downforce grip and steering yaw response (`Car.update`) for crisp apex clipping through sharp hairpins and flowing S-bends.

---

## [v0.9.5] — Full Visual Realism Overhaul (Carbon Weave, Humanoid Crew, Live Timing Pylon & Broadcast FX)
### Added
- **Broadcast Color Grading & Motion FX**: Filmic vignette + dynamic high-speed/ERS screen-edge glow (`#fx`) and per-circuit broadcast color grading (`contrast`/`saturate`).
- **Studio-Grade F1 Car Details**: Real diagonal twill carbon-fiber weave texture (`TX.cf`) on floor/wings/diffuser, cockpit F1 steering wheel with LED display that turns with steering, glossy dark helmet visor, hot-orange glowing carbon brake discs under heavy braking, and amber downshift exhaust backfire sparks.
- **Humanoid Pit Crew & Cheering Crowd**: Proportioned 3D pit mechanics (legs, torso, chest stripe, arms holding wheel gun/tyre, dark-visor helmet) and grandstand spectators with raised cheering arms.
- **Architectural Glass & Live Top-5 LED Timing Pylon**: Reflective glass/louver building textures (`TX.b`) on paddock & Race Control Tower, plus a live trackside LED Timing Pylon displaying Top-5 teams in real time.
- **Organic Nature Textures**: Mowed turf grass (`TX.g`), grainy pebble gravel traps (`TX.gr`), and textured rock/forest mountain ridges (`TX.mt`).
- **Dynamic Speed-Reactive Racing Line**: Racing line now updates colors in real time based on live car speed vs upcoming corner speed (turns green when slow enough, stays amber/red when too fast) and disappears immediately behind the car as it passes each segment.

---

## [v0.9.0] — All 9 Circuits Polish Pass (Skies, Gantries, Braking Boards & Safe Horizons)
### Added
- **Universal Seamless Sky Domes**: Wrapped procedural sky domes with zero UV seams tailored for every circuit (Spa Ardennes overcast, Silverstone British daylight, Monaco Riviera azure, Imola/Monza warm Italian sun, Marina Bay/Bahrain/Jeddah night city/desert glow).
- **Universal 5-Pod F1 Start Light Gantry & Race Control Tower**: All 9 circuits now feature synced 3D start gantry lights and a Race Control Tower near start/finish.
- **Universal White/Black Braking Boards (`150 / 100 / 50`)**: Added authentic F1 distance boards at all major braking zones across all 9 circuits.
- **Safe 360° Outer Horizon Ridges (`outerRidge`)**: Replaced inner-placed hills with bounding-radius-checked distant mountains/cliffs/dunes on Spa, Imola, Monza, Silverstone, Monaco, Bahrain, and Sepang (zero road clipping).
### Changed
- **Natural Turf Color Grading**: Desaturated bright green grass on Spa, Silverstone, Imola, and Monza to match broadcast-realistic turf alongside Sepang.

---

## [v0.8.0] — Off-Track Auto-Recovery, Realistic Racing Line & Driver Name Tags
### Added
- **Off-Track Auto-Recovery (5s Timer)**: Cars stuck off-track (`|d| > hw + 8` and low speed) count down and automatically recover back onto the racing surface aligned with track heading.
- **Terminal Crash / Tyre Puncture DNF**: If damage reaches critical (`dmg >= 95%`) or tyres blow out (`wear >= 99%`) while stranded off-track, auto-recovery is skipped and the car retires (`DNF`).
- **AI Stuck Recovery**: AI cars wedged off-track for 6s auto-recover cleanly.
- **3D Floating Driver Name Tags**: Team-colored name sprites above every opponent/AI/multiplayer car (hidden on player car to preserve onboard visibility).
- **Multiplayer Custom Player Name**: Added `Your Player Name` input (`#mpName`, saved in `localStorage`) shown in lobby, 3D car tags, timing tower, and post-race results.
- **Version Badge**: Added `v0.8.0` indicator on the main menu logo.
### Changed
- **Physically Optimal F1 Racing Line**: Replaced center-hugging line with true `Outside (entry) -> Inside Apex -> Outside (exit)` trajectory (`world.js`); synced AI racing line and Steering Assist to follow it.

---

## [v0.7.0] — 2026 & 2027 F1 Rosters (11 Teams + Cadillac), AI Difficulty & 8-Player Multiplayer
### Added
- **11th F1 Team — Cadillac**: Added Cadillac livery, pit garage #11, and start grid slot #11 with **Sergio Pérez (#11)** and **Valtteri Bottas (#77)**.
- **Official 2026 & 2027 Driver Lineups + Season Switcher**: Toggle `2026` (Esteban Ocon `#31` at Haas) and `2027` (Rafael Câmara `#51` at Haas) in Driver Select and Settings.
- **AI Difficulty (`Easy / Normal / Hard`)**: Configurable in Race Briefing, Host Setup, and Settings; scales AI race pace (`×0.86 / ×0.97 / ×1.04`) and qualifying benchmarks.
- **8-Player Multiplayer + AI Grid Fill**: Raised PeerJS room cap to **8 human players** (1 host + 7 guests) with optional host-authoritative **AI Grid Fill** up to 11 cars synced cleanly to all guests.

---

## [v0.6.0] — Living Sepang Grandstands, Pit Autopilot & Mountain-Clip Bug Fix
### Fixed
- **Mountain-on-Track Clipping Bug**: Computed true track bounding radius (`maxR`) + `free()` collision check so distant horizon mountains never clip into the road; extended `camera.far` (`18000`) and sky dome (`12000`).
### Added
- **Living Cheering Grandstands**: Instanced 3D spectators and waving flags across grandstand tiers with zero-FPS-drop wave animation.
- **Proper Pit Lane Visuals**: White pit entry/exit guides, green-white chevron merge zone, yellow/green speed-limit lines, orange bollard, and `PIT IN ›` sign.
- **Easy Pit Autopilot + Animated Pit Crew**: Entering pit lane engages 80 km/h autopilot into the player's own team pit box, triggers animated pit crew rush-in with wheel-gun audio & sparks, fits new tyres/repairs wing, and auto-exits pit lane before handing back manual control.

---

## [v0.5.0] — Sepang Onboard Accuracy, 4 F1 Cameras, Broadcast HUD & V6 Hybrid Audio
### Added
- **4 F1 Camera Views (`C` key / `#camb` button)**: `Wide Chase`, `T-Cam Onboard` (offset over Halo), `Halo Cockpit` (helmet hidden), and `Eagle Eye`.
- **F1 Broadcast HUD**: Live green Throttle & red Brake pedal bars inside `#tele`, clickable camera pill, and live `BEST` lap time on `#lapi`.
- **F1 V6 Turbo-Hybrid Audio**: Dual-sawtooth V6 bark + MGU-H turbo whine, automatic upshift ignition-cut pop / downshift exhaust crackle, and carbon-brake hiss.
- **Sepang Onboard Circuit Upgrades**: Widened Sepang Grade-1 track (`hw: 64`, `bw: 168`), authentic rolling elevation, turquoise/white kerbs + blue outer border strips, wide grey asphalt runoffs, tan gravel traps, orange/white TecPro blocks, white/black `150/100/50` braking boards, Race Control Tower, and white conical paddock tents.

---

## [v0.4.0] — 2025 Ground-Effect F1 Cars & Realism Graphics Pass
### Added
- **2025 Ground-Effect F1 Chassis**: Longer drooping nose cone, downwash sidepods, Venturi floor-edge wings, front wheel wake deflectors ("wheel brows"), domed 18-inch aero wheel covers (including Ferrari red & McLaren 4-color covers), painted Halo, T-cam pod, mirrors, rear wing wordmark plate, 5-strake carbon diffuser, exhaust tailpipe, and soft radial AO contact shadow.
- **Asphalt & Environment Realism**: Procedural tarmac roughness map (`TX.r`), bump-mapped dark asphalt with rubbered-in racing groove, seamless wrapped tropical sky dome with clouds, 2048×2048 soft shadows, synced 5-pod physical F1 start gantry lights, hibiscus grandstand canopies, Perdana Welcome Tower, and natural tropical turf.

---

## [v0.3.0] — Restored Glassmorphism Main Menu
### Changed
- Replaced opaque navy broadcast menu theme with clean translucent frosted-glass `#nav.glass-menu` (`backdrop-filter: blur(12px)`) over the live 3D Sepang background, preserving 60 FPS and keyboard focus sync.

---

## [v0.2.0] — Project Migration & Core Bug Audit
### Fixed
- Populated 15 missing `#rev` shift-light LED elements in `index.html`.
- Fixed critical `this.mp` property collision between menu camera and multiplayer state (`this.mCamPos`).
- Fixed `#mm` minimap overlapping top-right `#qb` quickbar and `#tinfo` text truncation.
- Fixed reverse start/finish line lap-cheat (`maxLap`), frozen pit-stop speedometer, Lap 0 DRS activation, and WebGL GPU memory leaks on track reload.

---

## [v0.1.0] — Initial Prototype Backup
- Base 5-file Three.js + PeerJS F1 browser game with 9 circuits, 10 teams, pit stops, Auto-DRS, ERS boost, and basic multiplayer.
