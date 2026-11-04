import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted variable fonts (no external request at build or runtime).
const fraunces = localFont({
  variable: "--font-fraunces",
  display: "swap",
  src: [
    { path: "./fonts/fraunces-latin.woff2", style: "normal" },
    { path: "./fonts/fraunces-latin-ext.woff2", style: "normal" },
  ],
  weight: "400 700",
});

const nunito = localFont({
  variable: "--font-nunito",
  display: "swap",
  src: [
    { path: "./fonts/nunito-latin.woff2", style: "normal" },
    { path: "./fonts/nunito-latin-ext.woff2", style: "normal" },
  ],
  weight: "400 800",
});

export const metadata: Metadata = {
  title: {
    default: "Naz Académie — Cours de français et de mathématiques",
    template: "%s · Naz Académie",
  },
  description:
    "Apprends le français et les mathématiques à ton rythme. Des cours clairs pour les enfants et les élèves, par niveau.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
