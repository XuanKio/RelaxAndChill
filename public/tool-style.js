export const DEFAULT_TOOL_STYLE = Object.freeze({ rotation: 0, hue: 0, saturation: 100, brightness: 100 });

export function validateToolStyle(value = DEFAULT_TOOL_STYLE) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Chỉnh dụng cụ không hợp lệ.');
  const limits = { rotation: [-180, 180], hue: [-30, 30], saturation: [60, 140], brightness: [80, 120] };
  return Object.fromEntries(Object.entries(limits).map(([key, [min, max]]) => {
    const number = value[key] ?? DEFAULT_TOOL_STYLE[key];
    if (!Number.isFinite(number) || number < min || number > max) throw new Error('Chỉnh dụng cụ vượt giới hạn.');
    return [key, number];
  }));
}

// Adjust RGB once when a slider changes, preserving every transparent edge.
export function tintPixels(data, style) {
  const settings = validateToolStyle(style), output = new Uint8ClampedArray(data);
  const angle = settings.hue * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
  const saturation = settings.saturation / 100, light = settings.brightness / 100;
  for (let i = 0; i < output.length; i += 4) {
    if (!output[i + 3]) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const rgb = [
      (.213 + c * .787 - s * .213) * r + (.715 - c * .715 - s * .715) * g + (.072 - c * .072 + s * .928) * b,
      (.213 - c * .213 + s * .143) * r + (.715 + c * .285 + s * .140) * g + (.072 - c * .072 - s * .283) * b,
      (.213 - c * .213 - s * .787) * r + (.715 - c * .715 + s * .715) * g + (.072 + c * .928 + s * .072) * b
    ];
    const gray = rgb[0] * .213 + rgb[1] * .715 + rgb[2] * .072;
    for (let channel = 0; channel < 3; channel++) output[i + channel] = (gray + (rgb[channel] - gray) * saturation) * light;
  }
  return output;
}
