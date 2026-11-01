// app/opengraph-image.tsx
//
// The picture shown when the homepage (or any page without its own image) is
// shared on Facebook, WhatsApp, LinkedIn, X …  Event pages have their own:
// app/events/[slug]/opengraph-image.tsx.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { loadGoogleFont } from "@/lib/og-fonts";

export const alt = "Venus Corporation — Event Management";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#14245a";
const GOLD = "#dcb45c";

export default async function OGImage() {
  const [regular, bold, logo] = await Promise.all([
    loadGoogleFont("Inter", 400),
    loadGoogleFont("Inter", 700),
    readFile(join(process.cwd(), "public/venuscorporation-logo.png")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${NAVY} 0%, #1c3175 100%)`,
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      {/* Gold bars top and bottom */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 10, display: "flex", background: GOLD }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 1200, height: 10, display: "flex", background: GOLD }} />

      <div
        style={{
          display: "flex",
          padding: "20px 32px",
          borderRadius: 24,
          background: "#ffffff",
        }}
      >
        <img src={logoSrc} width={300} height={145} alt="" />
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 44,
          color: "#ffffff",
          fontSize: 54,
          fontWeight: 700,
        }}
      >
        Events that leave a mark
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 16,
          color: "rgba(255,255,255,0.75)",
          fontSize: 26,
        }}
      >
        Corporate · Sports · Conferences · Exhibitions · Celebrations
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 36,
          color: GOLD,
          fontSize: 22,
          letterSpacing: 4,
        }}
      >
        VENUSCORPORATION.ORG
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
