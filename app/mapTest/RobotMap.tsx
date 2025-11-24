"use client";

import { useEffect, useState } from "react";
import { MapMeta, RobotPose, worldToPixel } from "./Location";

const initialMapMeta: MapMeta = {
  width: 0,                      // 이미지 로드 후 채움
  height: 0,                     // 이미지 로드 후 채움
  resolution: 0.1,               // yaml 값
  origin: [-19.9, -18.4, 0.0],   // yaml 값
};

// 로봇이 따라갈 경로 (월드 좌표 예시)
const path: RobotPose[] = [
  { x: -10, y: -10 },
  { x: -5,  y: -10 },
  { x: 0,   y: -10 },
  { x: 5,   y: -10 },
  { x: 10,  y: -10 },
  { x: 10,  y: -5 },
  { x: 10,  y: 0 },
  { x: 10,  y: 5 },
  { x: 10,  y: 10 },
  { x: 5,   y: 10 },
  { x: 0,   y: 10 },
  { x: -5,  y: 10 },
  { x: -10, y: 10 },
  { x: -10, y: 5 },
  { x: -10, y: 0 },
  { x: -10, y: -5 },
];

export default function MapRobot() {
  const [mapMeta, setMapMeta] = useState<MapMeta>(initialMapMeta);
  const [step, setStep] = useState(0);
  const [scale] = useState(0.8); // 맵 축소/확대 배율

  // 로봇이 path를 따라 계속 움직이도록
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % path.length);
    }, 500); // 0.5초마다 한 칸씩 이동

    return () => clearInterval(timer);
  }, []);

  // 이미지 로드시 원래 width/height 가져오기
  const handleMapLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setMapMeta((prev) => ({
      ...prev,
      width: img.naturalWidth,
      height: img.naturalHeight,
    }));
  };

  const currentPose = path[step];

  // 아직 이미지 사이즈 모르면 로봇은 잠깐 숨김
  const hasSize = mapMeta.width > 0 && mapMeta.height > 0;

  const { pixelX, pixelY } = hasSize
    ? worldToPixel(currentPose, mapMeta)
    : { pixelX: 0, pixelY: 0 };

  const scaledWidth = mapMeta.width * scale || 400;
  const scaledHeight = mapMeta.height * scale || 300;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>맵 위에서 로봇 이동 데모</h2>

      <div
        style={{
          position: "relative",
          width: scaledWidth,
          height: scaledHeight,
          borderRadius: 12,
          overflow: "hidden",
          background: "#111827",
        }}
      >
        {/* 맵 이미지 */}
        <img
          src="/images/occ_grid.png"
          alt="map"
          onLoad={handleMapLoad}
          style={{
            width: scaledWidth,
            height: scaledHeight,
            display: "block",
          }}
        />

        {/* 로봇 아이콘 */}
        {hasSize && (
          <div
            style={{
              position: "absolute",
              left: pixelX * scale,
              top: pixelY * scale,
              transform: "translate(-50%, -50%)",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#3b82f6",
              border: "2px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "#fff",
              boxShadow: "0 0 8px rgba(0,0,0,0.6)",
            }}
          >
            🤖
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
        현재 로봇 월드 좌표: x = {currentPose.x.toFixed(2)} m, y ={" "}
        {currentPose.y.toFixed(2)} m
      </div>
    </div>
  );
}