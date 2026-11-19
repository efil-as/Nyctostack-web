# Nyctostack

Astrophotography stacking engine — browser edition.

This repository is an independent web project. The Android reference project is kept outside this repository at `C:\Users\ASUS\Documents\astrostack` and is treated as read-only.

Reference study: [docs/ANDROID_REFERENCE.md](docs/ANDROID_REFERENCE.md)

Web design and staged implementation plan: [docs/WEB_ARCHITECTURE.md](docs/WEB_ARCHITECTURE.md)

The web app will only advertise processing that is genuinely implemented in the browser. Browser limitations, especially RAW/DNG decoding, iOS memory pressure, and output/download behavior, will be documented alongside each stage.

## Current implementation slice

The static app shell is available directly from `index.html` and includes responsive Landing -> mode navigation, raster image selection, DSO averaging, Dark/Flat arithmetic calibration, Star Trails Normal and Comet composites, and a touch-friendly Nightscape Freeze Ground mask editor/compositor. Processing runs locally in a Web Worker when supported.

The app also supports opening `index.html` directly from a local folder. For the best browser compatibility and Web Worker performance, run it with any static server, for example:

```text
python -m http.server 4173
```

Then open `http://localhost:4173`. No package install is required for this first static slice.

Not yet claimed: browser RAW/DNG decoding, TIFF decoding/16-bit TIFF export, star registration/alignment, Android-equivalent rejected-frame confidence diagnostics, and Timelapse MP4 export. These are staged explicitly in [docs/WEB_ARCHITECTURE.md](docs/WEB_ARCHITECTURE.md).
