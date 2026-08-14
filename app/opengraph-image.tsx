import { ImageResponse } from "next/og";

export const alt = "Recto — Open-source forms that sync to Google Sheets";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(145deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#2b6ecb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            R
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Recto
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Open-source forms that sync to Google Sheets
          </div>
          <div style={{ fontSize: 28, color: "#94a3b8", lineHeight: 1.4 }}>
            Host it yourself. No CSV export.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 22, color: "#cbd5e1" }}>
          <span>github.com/hddananjaya/recto</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
