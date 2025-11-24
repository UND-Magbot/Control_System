// src/app/page.tsx
import MapRobot from "./RobotMap";
import type { MapMeta, RobotPose } from "./Location";

const mapMeta: MapMeta = {
  width: 1024,            // 실제 PNG 가로 px
  height: 1024,           // 실제 PNG 세로 px
  resolution: 0.1,        // yaml 값
  origin: [-19.9, -18.4, 0.0], // yaml 값
};

const robotPose: RobotPose = {
  x: 0.0,   // 테스트용 월드 좌표
  y: 0.0,
};


export default function MapPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>맵 + 로봇 위치 테스트</h1>
      <MapRobot map={mapMeta} robot={robotPose} scale={0.8} />
    </main>
  );
}