import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulsePipe",
  description: "High-volume event ingestion and webhook delivery platform"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
