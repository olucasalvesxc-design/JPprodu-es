import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "JP Produções | Áudio Profissional para sua Marca",
  description: "Criamos jingles e spots com qualidade de estúdio, prontos para usar no seu negócio.",
  metadataBase: new URL("https://www.jpproducoes.online"),
  openGraph: {
    title: "JP Produções | Áudio Profissional para sua Marca",
    description: "Criamos jingles e spots com qualidade de estúdio, prontos para usar no seu negócio.",
    url: "https://www.jpproducoes.online",
    siteName: "JP Produções",
    images: [{ url: "/audio/link.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/audio/link.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased bg-[#0a0a0a] text-white font-sans">
        {children}
      </body>
    </html>
  );
}
