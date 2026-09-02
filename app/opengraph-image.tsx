import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const logoData = await readFile(
  join(process.cwd(), "public", "reva-logo-full.png"),
  "base64",
);
const logoSrc = `data:image/png;base64,${logoData}`;

export const alt = "Reva AI — Never Miss a Patient";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: "linear-gradient(135deg, #ffffff 0%, #eefbf8 100%)",
        color: "#10192d",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 680 }}>
        <img
          src={logoSrc}
          width={260}
          height={95}
          alt="Reva AI"
          style={{ objectFit: "contain", objectPosition: "left center" }}
        />
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 67,
            lineHeight: 1.04,
            fontWeight: 800,
            letterSpacing: "-3px",
          }}
        >
          Never Miss a Patient.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 30,
            lineHeight: 1.35,
            color: "#43506a",
          }}
        >
          AI patient operations for UAE clinics, native on WhatsApp.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            padding: "13px 22px",
            border: "1px solid #bfe9df",
            borderRadius: 999,
            background: "#ffffff",
            color: "#087f78",
            fontSize: 21,
            fontWeight: 700,
            alignSelf: "flex-start",
          }}
        >
          Missed-call recovery · No-show prevention
        </div>
      </div>

      <div
        style={{
          width: 360,
          display: "flex",
          flexDirection: "column",
          gap: 22,
          padding: "28px",
          border: "1px solid #dce8e5",
          borderRadius: 32,
          background: "rgba(255,255,255,0.88)",
          boxShadow: "0 24px 60px rgba(10, 95, 87, 0.14)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "20px 22px",
            borderRadius: 22,
            background: "#f1f4f8",
            fontSize: 22,
            lineHeight: 1.35,
          }}
        >
          I’d like to book a consultation.
          <span style={{ marginTop: 8, color: "#697386", fontSize: 16 }}>
            Patient · 2:41 PM
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "20px 22px",
            borderRadius: 22,
            background: "#0b8f87",
            color: "#ffffff",
            fontSize: 22,
            lineHeight: 1.35,
          }}
        >
          I found an opening tomorrow at 4:00 PM. Shall I confirm it?
          <span style={{ marginTop: 8, color: "#baf3e9", fontSize: 16 }}>
            Reva AI · replies instantly
          </span>
        </div>
      </div>
    </div>,
    size,
  );
}
