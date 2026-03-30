import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #1e3a5f, #0f172a)",
          borderRadius: 36,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 20,
          position: "relative",
        }}
      >
        {/* Left building */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 48,
            height: 80,
            background: "#3b82f6",
            borderRadius: 6,
            marginRight: 8,
            padding: 6,
            gap: 5,
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 8,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.5,
              }}
            />
            <div
              style={{
                width: 10,
                height: 8,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.5,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 8,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.5,
              }}
            />
            <div
              style={{
                width: 10,
                height: 8,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.5,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 8,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.5,
              }}
            />
            <div
              style={{
                width: 10,
                height: 8,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.5,
              }}
            />
          </div>
          <div
            style={{
              width: 18,
              height: 20,
              background: "#0f172a",
              borderRadius: 3,
              opacity: 0.5,
              marginTop: "auto",
            }}
          />
        </div>

        {/* Right building (taller) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 52,
            height: 108,
            background: "#60a5fa",
            borderRadius: 6,
            padding: 6,
            gap: 5,
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 9,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.45,
              }}
            />
            <div
              style={{
                width: 12,
                height: 9,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.45,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 9,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.45,
              }}
            />
            <div
              style={{
                width: 12,
                height: 9,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.45,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 9,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.45,
              }}
            />
            <div
              style={{
                width: 12,
                height: 9,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.45,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 9,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.45,
              }}
            />
            <div
              style={{
                width: 12,
                height: 9,
                background: "#0f172a",
                borderRadius: 2,
                opacity: 0.45,
              }}
            />
          </div>
          <div
            style={{
              width: 20,
              height: 22,
              background: "#0f172a",
              borderRadius: 3,
              opacity: 0.45,
              marginTop: "auto",
            }}
          />
        </div>

        {/* Green check badge */}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 44,
            height: 44,
            borderRadius: 22,
            background: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 20,
              height: 12,
              borderBottom: "4px solid white",
              borderLeft: "4px solid white",
              transform: "rotate(-45deg)",
              marginTop: -4,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  )
}
