# Android reference study

Source inspected read-only: `C:\Users\ASUS\Documents\astrostack`.

This document records the behavior that the web edition is intended to preserve. It also distinguishes production paths from Android shell/readiness paths so the web app does not overstate parity.

## Architecture and navigation

- `app` owns the Jetpack Compose UI, navigation state, Android Storage Access Framework pickers, camera access, lifecycle, foreground-service orchestration, and library/export integration.
- `core:stars`, `core:registration`, `core:stacking`, `core:calibration`, `core:export`, `core:image`, and `core:raw` hold processing contracts and algorithms.
- The root flow is Landing -> mode selection -> one of Deep Sky, Nightscape, Timelapse, or Star Trails. The side menu exposes Theme, How to Use, About, Contact Us, and the capture album/library.
- Processing is represented by `ProcessingRequest`, `ProcessingState`, and `ProcessingResult`. `AstroStackerProcessingService` runs long jobs and reports progress, cancellation, errors, diagnostics, and output.

## Visual language

The default palette is Dark Blue: deep navy/black gradients (`#0B1022`, `#070A14`), blue-violet primary accents, pale blue secondary text, rounded 16dp controls, compact uppercase labels, and subtle procedural star fields. Alternate dark purple, green, red, and cyan themes exist in `AppTheme.kt`; the web edition will use the default navy identity and avoid a green cast.

The landing screen centers the Nyctostack title and supporting copy slightly above center, with a prominent Start action and restrained astronomical background decoration.

## Modes and workflows

### Deep Sky / DSO

1. Select multiple Light images.
2. Optionally select Dark and Flat calibration frames.
3. Optionally enable Full Resolution Output. The default is a memory-aware sampled working size; full resolution uses disk-backed accumulation/calibration.
4. Start the stack. Frames are decoded, calibrated, star-detected, registered, aligned, and accumulated. Frames that do not meet the confidence rule are rejected.
5. Preview the result, diagnostics, stacked/rejected counts, and save an uncompressed TIFF.

The DSO service limits the registration search to a small selected star set (10 reference / 20 candidate stars) while the underlying registration supports translation, rotation, scale, and validated affine refinement.

### Nightscape

Nightscape accepts at most 50 Light frames, plus optional Dark and Flat frames. It uses the fast nightscape registration implementation and a reference frame. Freeze Ground is mandatory:

1. Select Light frames.
2. Open Configure Freeze Ground, which uses a selected reference preview.
3. Paint the sky region in a mask editor. The editor supports brush size, sky/ground painting, undo/redo, invert, and a soft preview.
4. The mask must contain a real selection; simply opening or saving an empty editor is not sufficient.
5. Stack the aligned sky while compositing the stationary ground from the reference frame. The mask is feathered before compositing to avoid a hard seam.
6. Preview, optionally remove green noise (with undo), and save the TIFF.

The Android engine resamples the mask to the processing canvas, aligns the sky, preserves the reference ground, and reports stacked/rejected counts and registration diagnostics.

### Star Trails

The Star Trails screen accepts at least two image frames, orders them by EXIF timestamp when available, and offers:

- Normal: overlays all frames to create continuous trails.
- Comet: progressively fades older frames while newer frames remain brighter.

The Android result screen supports fit preview, pinch zoom/pan, and saving the generated TIFF to the gallery.

### Timelapse

The Android project also contains a separate Timelapse workflow (image sequence to MP4) with Normal Timelapse and Comet Trail video modes, FPS and quality controls, tail length, chronology reversal, preview, and video export. This web edition's first scope is the requested image-stacking experience; video export is documented as a later browser capability because reliable iOS Safari MP4 encoding is a separate compatibility problem.

## Image input and output

- Android uses `OpenMultipleDocuments` and retains URI references rather than copying all source files.
- DNG is decoded through the Android NDK bridge on Android 11+; it must not silently fall back to an 8-bit rendered image.
- JPEG/PNG/TIFF are decoded through Android bitmap paths, with EXIF orientation applied where required.
- The Android output target is an uncompressed 16-bit RGB TIFF. The current working bitmap path can expand 8-bit values into a 16-bit container; this is not the same as recovering RAW precision.
- Result screens show dimensions and save through a document picker; the library indexes saved outputs.

## Processing details to preserve

- Calibration masters are means of Dark/Flat frames. Dark is subtracted; Flat is normalized per channel and applied with clamping.
- Star detection is local-maximum based with mean/variance thresholding, centroid estimation, and hot-pixel rejection.
- Registration returns confidence, matched stars, transform, residual diagnostics, and overlap. A frame is accepted only when registration succeeds with at least four matches and quality >= 0.12.
- Accumulation is floating-point RGB average accumulation. Full-resolution Android paths use disk-backed accumulators and row-wise calibration to reduce resident memory.
- Freeze Ground uses a blurred/feathered Boolean sky mask and blends aligned stack pixels with the stationary reference according to that mask.

## Known Android reference limitations

The checked-in Android documentation describes the DNG/processing activity shell as a readiness boundary, while the current `StackingEngine` and foreground service contain the active processing paths. The web project will expose only browser implementations that are genuinely available and will label unsupported RAW/TIFF cases instead of showing a fake success state.

