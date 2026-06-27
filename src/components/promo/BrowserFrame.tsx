import { Img, staticFile } from "remotion";
import { C, FONT } from "./theme";
import type { Rect } from "./PhoneFrame";

export const BROWSER_ASPECT = 1920 / 1080;

/** Marco de ventana de navegador. `rect` = área de la captura (la barra va encima). */
export const BrowserFrame: React.FC<{ src: string; rect: Rect; url?: string }> = ({
  src,
  rect,
  url = "tu-dominio.com",
}) => {
  const barH = Math.round(rect.w * 0.03);
  const radius = Math.round(rect.w * 0.013);
  const dot = Math.round(barH * 0.22);
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y - barH,
        width: rect.w,
        height: rect.h + barH,
        borderRadius: radius,
        overflow: "hidden",
        background: "#e8dfd4",
        boxShadow: "0 50px 110px rgba(28,19,13,0.38), 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          height: barH,
          background: "#ece4d8",
          display: "flex",
          alignItems: "center",
          gap: dot,
          paddingLeft: Math.round(barH * 0.5),
        }}
      >
        {["#ef6a5e", "#f5bd4f", "#61c554"].map((c) => (
          <div key={c} style={{ width: dot, height: dot, borderRadius: 999, background: c }} />
        ))}
        <div
          style={{
            marginLeft: Math.round(barH * 0.6),
            height: Math.round(barH * 0.56),
            flex: 1,
            marginRight: Math.round(barH * 0.5),
            background: C.cream,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            paddingLeft: Math.round(barH * 0.5),
            color: "#8a7868",
            fontFamily: FONT,
            fontSize: Math.round(barH * 0.32),
          }}
        >
          {url}
        </div>
      </div>
      <Img
        src={staticFile(src)}
        style={{ width: rect.w, height: rect.h, objectFit: "cover", objectPosition: "top", display: "block" }}
      />
    </div>
  );
};
