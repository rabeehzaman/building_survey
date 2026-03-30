import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(135deg, #1e3a5f, #0f172a)",
          borderRadius: 6,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 3,
          position: "relative",
        }}
      >
        {/* Buildings */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 2,
          }}
        >
          <div
            style={{
              width: 10,
              height: 16,
              background: "#3b82f6",
              borderRadius: 2,
            }}
          />
          <div
            style={{
              width: 10,
              height: 21,
              background: "#60a5fa",
              borderRadius: 2,
            }}
          />
        </div>
        {/* Check badge */}
        <div
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 10,
            height: 10,
            borderRadius: 5,
            background: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 5,
              height: 3,
              borderBottom: "1.5px solid white",
              borderLeft: "1.5px solid white",
              transform: "rotate(-45deg)",
              marginTop: -1,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  )
}
