import './globals.css';

export const metadata = {
  title: 'Gataria | Rock, Geek & Streetwear',
  description: 'Camisetas com atitude para quem vive música, cultura pop e streetwear.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
