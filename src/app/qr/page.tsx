import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Library QR Codes | LUKE'S WORLD LIBRARY",
  description: "Download QR codes for the library and its GitHub source repository.",
};

export default function QrPage() {
  return (
    <main className="qr-page">
      <p className="qr-eyebrow">SHARE THE KNOWLEDGE</p>
      <h1>LUKE'S WORLD <em>LIBRARY</em></h1>
      <p className="qr-intro">Two separate QR codes. One opens the library preview; the other opens the source repository.</p>
      <div className="qr-grid">
        <article>
          <span>01 / APPLICATION</span>
          <h2>World Library</h2>
          <p>Opens the Vercel-hosted library. The current preview requires authorized Vercel team access.</p>
          <a href="/api/qr?target=library">DOWNLOAD LIBRARY QR (SVG) ↗</a>
        </article>
        <article>
          <span>02 / SOURCE CODE</span>
          <h2>GitHub Repository</h2>
          <p>Opens the project repository and its source code.</p>
          <a href="/api/qr?target=github">DOWNLOAD GITHUB QR (SVG) ↗</a>
        </article>
      </div>
      <a className="qr-back" href="/">← BACK TO THE LIBRARY</a>
    </main>
  );
}
