export const QR_DESTINATIONS = {
  library: {
    label: "LUKE'S WORLD LIBRARY",
    filename: "lukes-world-library-qr.svg",
    url:
      process.env.LIBRARY_PUBLIC_URL ||
      "https://lukes-world-library-git-foundation-next-fieldvision.vercel.app",
  },
  github: {
    label: "LUKE'S WORLD LIBRARY — GITHUB",
    filename: "lukes-world-library-github-qr.svg",
    url:
      process.env.GITHUB_REPOSITORY_URL ||
      "https://github.com/Qwerkees/Luke-s-World-Library",
  },
} as const;

export type QrTarget = keyof typeof QR_DESTINATIONS;
