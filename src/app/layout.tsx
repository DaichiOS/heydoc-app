import type { Metadata, Viewport } from "next";
import { Karla } from "next/font/google";
import "./globals.css";

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "heydoc - Access quality healthcare from the comfort of your home",
  description: "Access quality healthcare from the comfort of your home. Connect with licensed doctors through our secure telehealth platform for consultations, medical certificates, and mental health support.",
  keywords: "telehealth, online doctor, medical consultation, healthcare, telemedicine",
  authors: [{ name: "heydoc" }],
  robots: "index, follow",
  openGraph: {
    title: "heydoc - Access quality healthcare from the comfort of your home",
    description: "Access quality healthcare from the comfort of your home. Connect with licensed doctors through our secure telehealth platform.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logos/heydoc-socials2.png",
        width: 1200,
        height: 800,
        alt: "HeyDoc - Quality Healthcare, Anywhere in Australia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "heydoc - Access quality healthcare from the comfort of your home",
    description: "Access quality healthcare from the comfort of your home. Connect with licensed doctors through our secure telehealth platform.",
    images: ["/logos/heydoc-socials2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${karla.variable} font-karla antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
