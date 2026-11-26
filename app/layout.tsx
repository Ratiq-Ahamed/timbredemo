import type { Metadata } from "next";
import { Suspense } from "react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "./globals.css";
import { Providers } from "@/components/ui";
export const metadata: Metadata = {
  title: { default: "Timbrel Studio OS", template: "%s · Timbrel Studio" },
  description:
    "A connected workspace for the art and business of photography. Interactive demonstration by Myurrix.",
  robots: { index: false, follow: false },
  icons: { icon: "/brand/timbrel-logo.png", apple: "/brand/timbrel-logo.png" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense
          fallback={<div className="loading-screen">Opening your studio…</div>}
        >
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
