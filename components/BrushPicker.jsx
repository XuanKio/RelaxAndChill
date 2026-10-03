'use client';
import { useState } from 'react';
const brushes = [{ value: 'round', label: 'Bút tròn', width: 5 }, { value: 'soft', label: 'Cọ mềm', width: 9 }, { value: 'marker', label: 'Bút dạ', width: 7 }];
export default function BrushPicker() {
  const [value, setValue] = useState('round');
  return <>
    <select id="paint-shape" value={value} onChange={e => setValue(e.target.value)} hidden aria-hidden="true" tabIndex={-1}>
      {brushes.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
    </select>
    <div className="brush-picker" role="group" aria-label="Kiểu cọ">
      {brushes.map(b => <button key={b.value} type="button" aria-pressed={value === b.value} aria-label={b.label} title={b.label} onClick={() => setValue(b.value)}>
        <svg viewBox="0 0 48 24" aria-hidden="true"><path d="M7 17C14 2 24 25 41 7" fill="none" stroke="currentColor" strokeWidth={b.width} strokeLinecap={b.value === 'marker' ? 'square' : 'round'} style={b.value === 'soft' ? { filter: 'blur(1.8px)', opacity: .6 } : undefined} /></svg>
        <span>{b.label}</span>
      </button>)}
    </div>
  </>;
}
