import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Soundhous — Book a Private Listening Session",
  description:
    "Book a free, private demo at the Soundhous Experience Centre, 17 Adeyemo Alakija Street, Victoria Island, Lagos. Sonos, multi-room audio, home theatre, private cinema, lighting, whole-home, and AV enterprise solutions — by appointment.",
  keywords: [
    "Soundhous",
    "Sonos Lagos",
    "home theatre Lagos",
    "AV demo Nigeria",
    "whole home audio",
    "private cinema Lagos",
  ],
  openGraph: {
    title: "Soundhous — Book a Private Listening Session",
    description:
      "A free, private demo at the Experience Centre. 17 Adeyemo Alakija Street, Victoria Island, Lagos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
