'use client';
import { useEffect, useRef } from 'react';

export default function RangeControl({ id, min, max, defaultValue, ...props }) {
  const ref = useRef(null);
  const fill = value => `${Math.max(0, Math.min(100, (Number(value) - Number(min)) / (Number(max) - Number(min)) * 100))}%`;
  useEffect(() => {
    const input = ref.current;
    const update = () => input.style.setProperty('--range-fill', fill(input.value));
    update();
    // Presets and undo can update the engine's controls without a user event.
    const output = document.getElementById(`${id}-value`);
    const observer = new MutationObserver(update);
    if (output) observer.observe(output, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [id, min, max]);
  return <input {...props} ref={ref} id={id} type="range" className="studio-range" min={min} max={max} defaultValue={defaultValue}
    style={{ '--range-fill': fill(defaultValue) }} onInput={e => e.currentTarget.style.setProperty('--range-fill', fill(e.currentTarget.value))} />;
}
