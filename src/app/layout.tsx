import type { Metadata } from "next";
import { Inter, Shadows_Into_Light } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const shadowsIntoLight = Shadows_Into_Light({
  weight: "400",
  variable: "--font-shadows-into-light",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibe Class",
  description: "Vibe Coding Class Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${shadowsIntoLight.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
