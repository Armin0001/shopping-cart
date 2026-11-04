import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "drift ✦ a store that moves",
  description: "A preview shopping experience with two scroll directions, filters at your cursor, and absolutely no real purchases.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable} ${geistMono.variable} antialiased`}>
      <body>
        <Providers>{children}</Providers>
        <div className="grain pointer-events-none fixed inset-0 z-[95] opacity-[0.045]" aria-hidden />
      </body>
    </html>
  );
}
