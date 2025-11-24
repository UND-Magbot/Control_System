// src/utils/Location.ts

export type MapMeta = {
    width: number;          // 맵 이미지 가로(px)
    height: number;         // 맵 이미지 세로(px)
    resolution: number;     // m/pixel (yaml resolution)
    origin: [number, number, number]; // [ox, oy, yaw] (yaml origin)
  };
  
  export type RobotPose = {
    x: number;      // 월드 좌표 (m)
    y: number;      // 월드 좌표 (m)
    theta?: number; // 로봇 회전값 (rad) - 나중에 쓰고 싶으면
  };
  
  // 월드 좌표 → 이미지 픽셀 좌표로 변환
  export function worldToPixel(robot: RobotPose, map: MapMeta) {
    const { x, y } = robot;
    const { height, resolution, origin } = map;
    const [ox, oy] = origin;
  
    // 1. 월드 → 맵 좌표(좌하단 기준, 픽셀 단위)
    const mapX = (x - ox) / resolution;
    const mapY = (y - oy) / resolution;
  
    // 2. 이미지 좌표(좌상단 기준)로 변환 (y 뒤집기)
    const pixelX = mapX;
    const pixelY = height - mapY;
  
    return { pixelX, pixelY };
  }
  