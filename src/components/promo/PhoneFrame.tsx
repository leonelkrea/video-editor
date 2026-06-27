import { Img, staticFile } from "remotion";
import { C } from "./theme";

export type Rect = { x: number; y: number; w: number; h: number };
export const PHONE_ASPECT = 390 / 844; // ancho / alto del contenido

/** Marco realista de smartphone alrededor del rect de pantalla dado (px de lienzo). */
export const PhoneFrame: React.FC<{ src: string; rect: Rect }> = ({ src, rect }) => {
  const bezel = Math.round(rect.h * 0.017);
  const radius = Math.round(rect.h * 0.07);
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x - bezel,
        top: rect.y - bezel,
        width: rect.w + bezel * 2,
        height: rect.h + bezel * 2,
        background: "#1c130d",
        borderRadius: radius + bezel,
        padding: bezel,
        boxShadow: "0 50px 100px rgba(28,19,13,0.42), 0 0 0 2px rgba(0,0,0,0.22)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: rect.w,
          height: rect.h,
          borderRadius: radius,
          overflow: "hidden",
          background: C.cream,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
        />
        <div
          style={{
            position: "absolute",
            top: Math.round(rect.h * 0.012),
            left: "50%",
            transform: "translateX(-50%)",
            width: Math.round(rect.h * 0.12),
            height: Math.round(rect.h * 0.03),
            background: "#0a0a0a",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
};
