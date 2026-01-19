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
    icon: '/assets/favicon.svg',
  },
  openGraph: {
    title: "Milky Way Miner",
    description: "Mine resources, earn $VDR, and compete on the leaderboard!",
    images: [
      {
        url: '/assets/share-preview.svg',
        width: 1200,
        height: 630,
        alt: 'Milky Way Miner Preview',
      },
    ],
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
