import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { description, SITE } from "@/lib/site";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./globals.css";
import "./appearance.css";
import "./dockrouter.css";
import "./hero.css";
import "./layout-system.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "DockRouter — Stop Configuring. Start Shipping.",
    template: "%s · DockRouter",
  },
  description,
  openGraph: {
    title: "DockRouter — Stop Configuring. Start Shipping.",
    description,
    url: SITE,
    siteName: "DockRouter",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "DockRouter — Stop Configuring. Start Shipping.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DockRouter — Stop Configuring. Start Shipping.",
    description,
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fd" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1523" },
  ],
};
const themeScript =
  "try{var t=localStorage.getItem('dockrouter-theme');document.documentElement.dataset.theme=t==='light'||t==='dark'?t:'system'}catch{}";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Fixed local theme bootstrap; contains no external input. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
