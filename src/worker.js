importScripts("./processing.js");
self.onmessage = ({ data }) => {
  try {
    const result = data.kind === "freeze" ? freezeGroundStack(data.frames, data.reference, data.mask, data.darkFrames, data.flatFrames) : averageStack(data.frames, data.mode, data.darkFrames, data.flatFrames);
    self.postMessage({ ok: true, result }, [result.data.buffer]);
  } catch (error) { self.postMessage({ ok: false, error: error.message || "Processing failed" }); }
};
