import type { BatteryItem } from "@/app/type";

// const API_BASE = process.env.API_BASE; // 서버 컴포넌트용 환경변수

// 서버에서 카메라 목록 가져오고 → 가공해서 반환
export default async function getBatteryStatus(): Promise<BatteryItem[]> {

//   const res = await fetch(`${API_BASE}/floors`, {
//     cache: "no-store", // 항상 최신 데이터가 필요하면
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch robots");
//   }

//   const raw = await res.json();
  const raw = [
      { id: 1, label: "Total" },
      { id: 2, label: "76% ~ 100%" },
      { id: 3, label: "51% ~ 75%" },
      { id: 4, label: "26% ~ 50%" },
      { id: 5, label: "1% ~ 25%" },
      { id: 6, label: "0%" },
      { id: 7, label: "Charging" }
  ];
  

  const batterys = raw.map((item: any) => ({
    id: item.id,
    label: item.label,
  }));

  return batterys;
}