import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUKE'S WORLD LIBRARY",
  description: "Explore the world. Connect ideas. Learn anything.",
  applicationName: "LUKE'S WORLD LIBRARY",
  metadataBase: new URL("https://lukes-world-library-fieldvision.vercel.app"),
  openGraph: {
    title: "LUKE'S WORLD LIBRARY",
    description: "A personal universe of knowledge.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
