import localFont from "next/font/local";

export const spaceGrotesk = localFont({
  src: "../fonts/space-grotesk.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
  fallback: ["sans-serif"],
});

export const jetbrainsMono = localFont({
  src: "../fonts/jetbrains-mono.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
  fallback: ["monospace"],
  preload: false,
});
