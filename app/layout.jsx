export const metadata = {
  title: 'RelaxAndChill — Một chiếc mèo, một chút bình yên',
  description: 'Chải lông, xoa đầu và vẽ một góc thư giãn của riêng bạn.',
};
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#2d5548' };
export default function RootLayout({ children }) {
  return <html lang="vi"><head><link rel="icon" href="favicon.svg" type="image/svg+xml" /></head><body>{children}</body></html>;
}
