// /app/mock/place_data.ts
export type PlaceRow = {
  id: number;
  robotNo: string;   // "Robot 1"
  floor: string;     // "1F", "2F", "B1" ...
  placeName: string; // "장소명 345"
  x: number;
  y: number;
  updatedAt: string; // "2025.12.12 오전 10:35:47"
};

export const mockPlaceRows: PlaceRow[] = [
  { id: 1,  robotNo: "Robot 2", floor: "3F", placeName: "장소명 234",   x: 26.21, y: 50.37, updatedAt: "2025.12.12 오전 10:35:47" },
  { id: 2,  robotNo: "Robot 3", floor: "2F", placeName: "장소명 12345", x: 51.35, y: 48.22, updatedAt: "2025.12.12 오전 11:12:03" },
  { id: 3,  robotNo: "Robot 1", floor: "1F", placeName: "장소명 345",   x: 66.08, y: 30.12, updatedAt: "2025.12.12 오후 01:05:19" },
  { id: 4,  robotNo: "Robot 1", floor: "1F", placeName: "장소명 0123",  x: 50.34, y: 55.46, updatedAt: "2025.12.12 오후 02:44:51" },
  { id: 5,  robotNo: "Robot 6", floor: "3F", placeName: "장소명 65432", x: 63.28, y: 58.25, updatedAt: "2025.12.12 오후 03:18:09" },
  { id: 6,  robotNo: "Robot 2", floor: "B1", placeName: "장소명 22",    x: 61.82, y: 63.94, updatedAt: "2025.12.12 오후 04:02:36" },
  { id: 7,  robotNo: "Robot 1", floor: "3F", placeName: "장소명 1112",  x: 72.53, y: 56.08, updatedAt: "2025.12.13 오전 09:14:22" },
  { id: 8,  robotNo: "Robot 1", floor: "B1", placeName: "장소명 10123", x: 53.69, y: 55.15, updatedAt: "2025.12.13 오전 10:01:08" },
  { id: 9,  robotNo: "Robot 2", floor: "2F", placeName: "장소명 234",   x: 64.31, y: 58.04, updatedAt: "2025.12.13 오전 11:47:55" },
  { id: 10, robotNo: "Robot 3", floor: "1F", placeName: "장소명 1359",  x: 54.82, y: 57.64, updatedAt: "2025.12.13 오후 12:32:41" },
  { id: 11, robotNo: "Robot 4", floor: "1F", placeName: "접수처",       x: 41.12, y: 46.80, updatedAt: "2025.12.13 오후 01:20:10" },
  { id: 12, robotNo: "Robot 5", floor: "2F", placeName: "진료실 A",     x: 58.44, y: 32.19, updatedAt: "2025.12.13 오후 02:05:33" },
  { id: 13, robotNo: "Robot 3", floor: "B1", placeName: "기계실 입구",  x: 34.27, y: 61.73, updatedAt: "2025.12.13 오후 03:41:58" },
  { id: 14, robotNo: "Robot 2", floor: "1F", placeName: "약국 앞",      x: 47.95, y: 49.02, updatedAt: "2025.12.13 오후 04:26:07" },
  { id: 15, robotNo: "Robot 6", floor: "4F", placeName: "병동 휴게실",  x: 69.88, y: 28.56, updatedAt: "2025.12.14 오전 09:08:49" },
  { id: 16, robotNo: "Robot 4", floor: "3F", placeName: "검사실 B",     x: 55.61, y: 41.33, updatedAt: "2025.12.14 오전 10:22:16" },
  { id: 17, robotNo: "Robot 5", floor: "B1", placeName: "창고",         x: 38.74, y: 66.21, updatedAt: "2025.12.14 오전 11:36:02" },
  { id: 18, robotNo: "Robot 1", floor: "2F", placeName: "수술실 대기",  x: 62.05, y: 44.18, updatedAt: "2025.12.14 오후 01:11:45" },
  { id: 19, robotNo: "Robot 3", floor: "4F", placeName: "회의실",       x: 48.39, y: 35.92, updatedAt: "2025.12.14 오후 02:54:30" },
  { id: 20, robotNo: "Robot 2", floor: "3F", placeName: "간호 스테이션",x: 59.14, y: 52.77, updatedAt: "2025.12.14 오후 04:09:18" },
];