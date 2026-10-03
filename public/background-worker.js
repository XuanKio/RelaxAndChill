import { removeConnectedBackground } from './background.js';
self.onmessage = ({ data: input }) => {
  try {
    const result = removeConnectedBackground({ ...input, data: new Uint8ClampedArray(input.buffer) });
    self.postMessage({ buffer: result.data.buffer, removed: result.removed }, [result.data.buffer]);
  } catch (error) { self.postMessage({ error: error.message }); }
};
