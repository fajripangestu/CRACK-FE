import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = "Manutics";
const SITE_DESCRIPTION =
  "Manutics menyediakan solusi manufaktur presisi: komponen custom, produk manufaktur, dan layanan prototipe dengan kualitas konsisten serta pengiriman tepat waktu.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Manufacturing Solutions`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "manufaktur",
    "komponen presisi",
    "produksi custom",
    "prototipe",
    "OEM",
    "Manutics",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Manufacturing Solutions`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} | Manufacturing Solutions`,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Warna bilah browser di ponsel, disamakan dengan warna primary
  themeColor: "#0f4c81",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-text selection:bg-primary/20">
        {children}

        {/* Satu-satunya Toaster untuk seluruh aplikasi */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "12px",
              border: "1px solid var(--color-border, #e2e8f0)",
              background: "var(--color-surface, #ffffff)",
              color: "var(--color-text, #0f172a)",
              fontSize: "14px",
              boxShadow: "0 10px 30px -12px rgba(15, 76, 129, 0.25)",
            },
            success: {
              iconTheme: {
                primary: "var(--color-primary, #0f4c81)",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}