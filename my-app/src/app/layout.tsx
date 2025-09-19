import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Textract OCR | Extract Text from Images Easily",
  description:
    "Textract is an OCR-powered web app built with Next.js and Tesseract.js. Upload images, extract text instantly, and copy or download the results.",
  keywords: [
    "OCR",
    "text extraction",
    "Tesseract.js",
    "Next.js OCR",
    "image to text",
    "extract text from image",
    "Textract project",
  ],
  authors: [{ name: "Your Name", url: "https://textract.samirrain.com.np" }],
  openGraph: {
    title: "Textract OCR | Extract Text from Images Easily",
    description:
      "Upload images and extract text instantly with Textract OCR. Built with Next.js and Tesseract.js.",
    url: "https://textract.samirrain.com.np",
    siteName: "Textract OCR",
    images: [
      {
        url: "https://textract.samirrain.com.np/logo.png", // Replace with actual OG image
        width: 1200,
        height: 630,
        alt: "Textract OCR ",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Textract OCR | Extract Text from Images Easily",
    description:
      "Free online OCR tool to extract text from images using Tesseract.js.",
    images: ["https://textract.samirrain.com.np/og-image.png"],
    creator: "@yourTwitterHandle",
  },
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://textract.samirrain.com.np"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
