import { SITE_BASE } from '../site-path.mjs';
export const metadata = {
  metadataBase: new URL('https://xuankio.github.io/RelaxAndChill/nlinn/'),
  title: 'RelaxAndChill — Một chiếc mèo, một chút bình yên',
  description: 'Chải lông, xoa đầu và vẽ một góc thư giãn của riêng bạn.',
  icons: { icon: [{url:'/RelaxAndChill/nlinn/favicon.svg',type:'image/svg+xml'},{url:'/RelaxAndChill/nlinn/icon.png',type:'image/png'}], apple:'/RelaxAndChill/nlinn/apple-icon.png' },
  openGraph: {title:'RelaxAndChill 🐾',description:'Một chiếc mèo, một chút bình yên. Chơi cùng mình nhé!',images:[{url:'/RelaxAndChill/nlinn/share-preview.png',width:1200,height:630,alt:'RelaxAndChill — một chút bình yên'}],type:'website'},
  twitter: {card:'summary_large_image',title:'RelaxAndChill 🐾',images:['/RelaxAndChill/nlinn/share-preview.png']},
};
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#2d5548' };
export default function RootLayout({ children }) {
  return <html lang="vi"><head><base href={SITE_BASE + '/'} /></head><body>{children}</body></html>;
}
