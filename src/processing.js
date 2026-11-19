function master(frames, width, height) {
  if (!frames.length) return null;
  if (frames.some((f) => f.width !== width || f.height !== height)) throw new Error("Calibration frames must match the light frame dimensions.");
  const out = new Float32Array(width * height * 4);
  frames.forEach((frame) => frame.data.forEach((value, i) => { out[i] += value; }));
  out.forEach((_, i) => { out[i] /= frames.length; });
  return out;
}

function calibrate(frame, dark, flat) {
  if (!dark && !flat) return frame;
  const data = new Uint8ClampedArray(frame.data.length);
  for (let i = 0; i < data.length; i++) {
    const darkValue = dark?.[i] ?? 0;
    const flatValue = Math.max(flat?.[i] ?? 255, 1);
    data[i] = Math.max(0, Math.min(255, (frame.data[i] - darkValue) * 255 / flatValue));
  }
  return { ...frame, data };
}

function averageStack(frames, mode = "normal", darkFrames = [], flatFrames = []) {
  if (!frames.length) throw new Error("Select at least one frame.");
  const { width, height } = frames[0];
  if (frames.some((f) => f.width !== width || f.height !== height)) throw new Error("All selected frames must have the same dimensions.");
  const dark = master(darkFrames, width, height);
  const flat = master(flatFrames, width, height);
  frames = frames.map((frame) => calibrate(frame, dark, flat));
  const out = new Uint8ClampedArray(width * height * 4);
  const total = frames.length;
  for (let i = 0; i < width * height; i++) {
    let r = 0, g = 0, b = 0, weight = 0;
    frames.forEach((frame, index) => {
      const w = mode === "comet" ? (index + 1) / total : 1;
      r += frame.data[i * 4] * w; g += frame.data[i * 4 + 1] * w; b += frame.data[i * 4 + 2] * w; weight += w;
    });
    out[i * 4] = r / weight; out[i * 4 + 1] = g / weight; out[i * 4 + 2] = b / weight; out[i * 4 + 3] = 255;
  }
  return { width, height, data: out };
}

function freezeGroundStack(frames, reference, mask, darkFrames = [], flatFrames = []) {
  const stacked = averageStack(frames, "normal", darkFrames, flatFrames);
  if (stacked.width !== reference.width || stacked.height !== reference.height) throw new Error("Freeze Ground requires matching frame dimensions.");
  const out = new Uint8ClampedArray(stacked.data.length);
  for (let i = 0; i < stacked.width * stacked.height; i++) {
    const sky = mask[i] > 0;
    const source = sky ? stacked.data : reference.data;
    out[i * 4] = source[i * 4]; out[i * 4 + 1] = source[i * 4 + 1]; out[i * 4 + 2] = source[i * 4 + 2]; out[i * 4 + 3] = 255;
  }
  return { ...stacked, data: out };
}
