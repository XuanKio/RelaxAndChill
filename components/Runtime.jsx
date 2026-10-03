'use client';
import { useEffect } from 'react';

// The canvas and workers keep their own state. Start them only after React's
// controls have hydrated; ordinary anchors give each scene a clean lifecycle.
export default function Runtime({ src }) {
  useEffect(() => {
    if (document.querySelector('script[data-chill-runtime]')) return;
    const script = document.createElement('script');
    script.type = 'module';
    script.src = src;
    script.dataset.chillRuntime = 'true';
    script.onerror = () => {
      const status = document.getElementById('status');
      if (status) status.textContent = 'Chưa tải được công cụ. Thử tải lại trang nhé.';
    };
    document.body.append(script);
  }, [src]);
  return null;
}
