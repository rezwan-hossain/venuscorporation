// app/events/[slug]/opengraph-image.tsx
//
// The picture shown when an event link is shared (Facebook, WhatsApp,
// LinkedIn, X, Messenger …). Next.js adds the <meta og:image> tag for it.
//
//   ┌──────────────────────────────────────────────┐
//   │ [CONFERENCE / SUMMIT]            event photo │
//   │ Narsingdi Business Summit 2026               │
//   │ 📅 Sun, 13 Dec 2026   📍 Narsingdi Sadar      │
//   │ Tickets from Tk 3,000                        │
//   │ [logo] venuscorporation.org                  │
//   └──────────────────────────────────────────────┘
//
// Drawn as PNG, then saved as JPEG with sharp: a photo as PNG is ~800 KB,
// and WhatsApp skips preview images that big. As JPEG it's ~60 KB.
// Prices say "Tk": the font has no ৳ sign (it would show as a box).

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { loadGoogleFont } from "@/lib/og-fonts";
import { prisma } from "@/lib/prisma";
import { getEventCategory } from "@/lib/event-checkout-form";

export const alt = "Venus Corporation event";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

const NAVY = "#14245a";
const GOLD = "#dcb45c";

export default async function EventOGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [event, regular, bold, logo] = await Promise.all([
    prisma.event.findUnique({
      where: { slug },
      select: {
        name: true,
        bannerImage: true,
        thumbImage: true,
        date: true,
        address: true,
        category: true,
        minPackagePrice: true,
      },
    }),
    loadGoogleFont("Inter", 400),
    loadGoogleFont("Inter", 700),
    readFile(join(process.cwd(), "public/venuscorporation-logo.png")),
  ]);

  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  // The banner is the big photo; the thumbnail is only 600px wide.
  const photo = event ? event.bannerImage || event.thumbImage : null;

  const date = event
    ? new Date(event.date).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Dhaka",
      })
    : "";
  const place = event?.address?.split(",")[0]?.trim() ?? "";
  const price =
    event?.minPackagePrice != null && event.minPackagePrice > 0
      ? `Tickets from Tk ${Math.round(event.minPackagePrice).toLocaleString("en-IN")}`
      : null;

  const png = new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        position: "relative",
        background: NAVY,
        fontFamily: "Inter",
      }}
    >
      {/* Photo on the right, fading into navy on the left */}
      {photo && (
        <img
          src={photo}
          width={1200}
          height={630}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            objectFit: "cover",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          display: "flex",
          background: `linear-gradient(90deg, ${NAVY} 0%, rgba(20,36,90,0.92) 45%, rgba(20,36,90,0.35) 100%)`,
        }}
      />

      {/* Gold strip down the left edge */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 12,
          height: 630,
          display: "flex",
          background: GOLD,
        }}
      />

      {/* Text */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 1200,
          height: 630,
          padding: "64px 72px 56px 84px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {event && (
            <div style={{ display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: "rgba(220,180,92,0.18)",
                  border: "1px solid rgba(220,180,92,0.5)",
                  color: GOLD,
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                {getEventCategory(event.category).label}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              marginTop: 28,
              maxWidth: 820,
              color: "#ffffff",
              fontSize: event && event.name.length > 40 ? 58 : 70,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {event?.name ?? "Event not found"}
          </div>

          {event && (
            <div
              style={{
                display: "flex",
                gap: 36,
                marginTop: 30,
                color: "rgba(255,255,255,0.88)",
                fontSize: 28,
              }}
            >
              <Fact icon="calendar" text={date} />
              {place && <Fact icon="pin" text={place} />}
            </div>
          )}

          {price && (
            <div
              style={{
                display: "flex",
                marginTop: 22,
                color: GOLD,
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {price}
            </div>
          )}
        </div>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              padding: "8px 14px",
              borderRadius: 14,
              background: "#ffffff",
            }}
          >
            <img src={logoSrc} width={116} height={56} alt="" />
          </div>
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.75)",
              fontSize: 22,
              letterSpacing: 2,
            }}
          >
            venuscorporation.org
          </div>
        </div>
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

  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg" },
  });
}

/** A gold icon + text, e.g. 📅 Sun, 13 Dec 2026 */
function Fact({ icon, text }: { icon: "calendar" | "pin"; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        {icon === "calendar" ? (
          <>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke={GOLD} strokeWidth="2" />
            <path d="M3 10H21M8 2V6M16 2V6" stroke={GOLD} strokeWidth="2" />
          </>
        ) : (
          <>
            <path
              d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
              stroke={GOLD}
              strokeWidth="2"
            />
            <circle cx="12" cy="9" r="2.5" fill={GOLD} />
          </>
        )}
      </svg>
      <div style={{ display: "flex" }}>{text}</div>
    </div>
  );
}
