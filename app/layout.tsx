import type { Metadata } from "next";
import { Inter, Orbitron, Chakra_Petch } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });
const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: '--font-orbitron',
});
const chakraPetch = Chakra_Petch({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-chakra',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://void-drillers-x.vercel.app'),
  title: "Milky Way Miner",
  description: "A Farcaster Frame Game",
  icons: {
    icon: '/assets/icon.jpg',
  },
  openGraph: {
    title: "Milky Way Miner",
    description: "Mine resources, earn $VDR, and compete on the leaderboard!",
    url: 'https://void-drillers-x.vercel.app',
    siteName: 'Milky Way Miner',
    images: [
      {
        url: 'https://void-drillers-x.vercel.app/assets/og-image.jpg',
        width: 400,
        height: 400,
        alt: 'Milky Way Miner Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Milky Way Miner",
    description: "Mine resources, earn $VDR, and compete on the leaderboard!",
    images: ['https://void-drillers-x.vercel.app/assets/og-image.jpg'],
  },
  other: {
    'base:app_id': '696eec56f22fe462e74c1616',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${orbitron.variable} ${chakraPetch.variable} bg-black overflow-hidden`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
