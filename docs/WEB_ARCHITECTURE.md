# Nyctostack web architecture

## Target

An independent TypeScript web application for iPhone Safari, iPhone Chrome, Android Chrome, and desktop browsers. It is static-hosting friendly and does not depend on the Android project at runtime.

## Proposed stack

- Vite + TypeScript + React for a small, deployable client application.
- CSS with responsive layout, safe-area insets, and the Android reference palette.
- Browser file inputs with `multiple` and `accept` for Photos/Files integration.
- `createImageBitmap` / canvas decoding for browser-supported raster inputs.
- Web Worker processing for image decode, calibration, registration, and stacking so the UI remains responsive.
- Typed Array RGB buffers for floating-point accumulation; memory checks and an explicit working-size choice for large inputs.
- Canvas preview with fit-to-screen behavior and touch-safe controls.
- Blob/object-URL downloads for output. TIFF writing will be an actual encoder, not a renamed PNG/JPEG.

## Processing stages

1. Read selected files and preserve their names/order.
2. Decode supported raster formats while retaining dimensions and EXIF orientation where browser APIs expose it.
3. Build optional Dark/Flat calibration masters.
4. Detect stars and register candidate frames to the reference.
5. Accumulate accepted frames in float RGB buffers.
6. Encode a real output image and show a result preview with counts/diagnostics.

Nightscape adds a canvas mask editor and refuses to start until Freeze Ground has been configured with a non-empty sky mask. The browser compositing stage mirrors the Android reference: aligned sky from the stack plus stationary reference ground with feathered mask blending.

Star Trails uses the same decode path and produces real Normal or progressively weighted Comet composites.

## Browser differences and staged support

- Browser-native RAW/DNG decoding is not consistently available, especially on iOS. The first implementation supports browser-decodable raster inputs and clearly reports unsupported DNG/TIFF inputs. A WASM decoder can be added later without changing the UI contracts.
- Full-resolution processing is opt-in and guarded by memory estimates. The app will not silently downsample a request; it will ask the user to choose a safer working size or stop with an actionable error.
- Static hosting cannot provide a server-side processing queue. Processing is local in a Worker and stops if the page is suspended or closed.
- iOS Safari downloads are initiated as Blob downloads and may require the standard share/save flow depending on the installed Safari version.
- Timelapse MP4 generation is later scope; the requested Star Trails Comet mode is an image composite, not a video placeholder.

## Incremental delivery

1. Reference documentation and app shell.
2. Responsive landing/mode navigation and file selection.
3. Genuine raster decode and Normal/Comet Star Trails compositing.
4. DSO calibration, star registration, accumulation, preview, and TIFF export.
5. Nightscape Freeze Ground editor and compositing.
6. Mobile QA, memory guardrails, PWA metadata, and static deployment configuration.

