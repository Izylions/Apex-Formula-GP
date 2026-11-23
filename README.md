# Apex Formula GP (3D WebGL F1 Racing)

Play live: **https://izylions.github.io/Apex-Formula-GP/**  
Direct mobile link: **https://izylions.github.io/Apex-Formula-GP/mobile.html**

## Folder Architecture (Shared Core + PC / Mobile Separation)

```text
├── index.html          # Main entry: auto-loads PC or Mobile layer (?mode=pc / ?mode=mobile override)
├── mobile.html         # Direct mobile entry: forces src/mobile/* layer
├── CHANGELOG.md        # Release notes
├── .nojekyll           # GitHub Pages static marker
└── src/
    ├── core/           # Single source of truth (shared by PC & Mobile)
    │   ├── base.css    # Shared UI glass, menus, scoreboard tyre pills, split-screen outro
    │   ├── data.js     # 11 F1 teams, 2026/2027 rosters, tyre wear (S/M/H), 9 circuits & elevation
    │   ├── world.js    # Procedural PBR textures, Track spline, sleek 3D F1 car builder, Particles
    │   └── engine.js   # Shared Sfx, fixed 1/60s Car physics, predictive AI, pit stops, Phase 3 MP sync
    ├── pc/             # Desktop PC-only layer
    │   ├── pc.css      # Desktop HUD & debug overlay styling
    │   └── pc.js       # Desktop perf profile (2048 shadows, 1.5 DPR, 30Hz HUD) & input adapter
    └── mobile/         # Mobile Web-only layer
        ├── mobile.css  # Compact Top-5 scoreboard, adjustable --btn-sc touch pads, landscape menus
        └── mobile.js   # Mobile perf profile (512 shadows, 1.25 DPR, 12.5Hz HUD), multi-touch & orientation
```

## Where to Edit
- **Race rules, physics, tyre wear, AI, circuits, 3D cars, multiplayer:** Edit `src/core/` (changes apply automatically to both PC & Mobile).
- **Desktop graphics/HUD:** Edit `src/pc/pc.js` & `src/pc/pc.css`.
- **Mobile touch controls, button sizes, mobile FPS profile:** Edit `src/mobile/mobile.js` & `src/mobile/mobile.css`.
