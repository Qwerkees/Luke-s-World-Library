import QRCode from "qrcode";
import { QR_DESTINATIONS, type QrTarget } from "@/lib/qr-destinations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target") as QrTarget | null;

  if (!target || !(target in QR_DESTINATIONS)) {
    return Response.json(
      { error: "Choose target=library or target=github." },
      { status: 400 }
    );
  }

  const destination = QR_DESTINATIONS[target];
  const svg = await QRCode.toString(destination.url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 3,
    color: { dark: "#17231f", light: "#ffffff" },
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${destination.filename}"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
