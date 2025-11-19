import type { RobotRowData } from "@/app/type";
import { robotRows } from "@/app/mock/robot_status";

// const API_BASE = process.env.API_BASE; // 서버 컴포넌트용 환경변수

// 서버에서 카메라 목록 가져오고 → 가공해서 반환
export default async function getRobots(): Promise<RobotRowData[]> {

//   const res = await fetch(`${API_BASE}/robots`, {
//     cache: "no-store", // 항상 최신 데이터가 필요하면
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch robots");
//   }

//   const raw = await res.json();
  const raw = robotRows;
  

  const robots = raw.map((item: any) => ({
    id: item.id,
    no: item.no,
    info: item.info,
    battery: item.battery,
    isCharging: item.isCharging,
    network: item.network,
    power: item.power,
    mark: item.mark
  }));

  return robots;
}