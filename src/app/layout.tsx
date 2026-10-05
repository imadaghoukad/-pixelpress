import type { Metadata } from "next";
import { SITE_URL, homeMetadata } from "@/lib/pages";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: homeMetadata.title, template: "%s | Pixelpress" },
  description: homeMetadata.description,
  applicationName: "Pixelpress",
  icons: { icon: "/icon.svg" },
  openGraph: { type: "website", siteName: "Pixelpress", locale: "en_US" },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "production" && (
          <meta
            httpEquiv="Content-Security-Policy"
            content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self'; worker-src 'self' blob:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'"
          />
        )}
        <meta name="referrer" content="no-referrer" />
      </head>
      <body>{children}</body>
    </html>
  );
}
