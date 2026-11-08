import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "LUKE'S WORLD LIBRARY", description: "Explore the world. Connect ideas. Learn anything." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }