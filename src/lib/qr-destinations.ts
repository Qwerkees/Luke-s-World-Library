export const QR_DESTINATIONS = {
  library: {
    label: "LUKE'S WORLD LIBRARY",
    filename: "lukes-world-library-qr.svg",
    url: "https://lukes-world-library-fieldvision.vercel.app",
  },
  github: {
    label: "LUKE'S WORLD LIBRARY — GITHUB",
    filename: "lukes-world-library-github-qr.svg",
    url: "https://github.com/Qwerkees/Luke-s-World-Library",
  },
} as const;

export type QrTarget = keyof typeof QR_DESTINATIONS;
