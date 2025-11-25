import type { RobotRowData, DonutCommonInfo } from '@/app/type';
import { convertMinutesToText } from "@/app/utils/convertMinutesToText";


type DonutCommonProps = {
    robots : RobotRowData[];
}

function makeFixedPercents(counts: number[]): number[] {
  const total = counts.reduce((sum, v) => sum + v, 0);

  if (total === 0 || counts.length === 0) {
    return counts.map(() => 0);
  }

  // 1) 각각 비율 계산 (소수점 한 자리 기준)
  const raw = counts.map((v) => (v / total) * 100);

  // 2) 1 decimal place 로 반올림 (예: 33.333 → 33.3)
  const rounded = raw.map((p) => Math.round(p * 10) / 10);

  // 3) 합계 계산 후 100.0 과의 차이(diff)를 구함
  const sumRounded = rounded.reduce((s, v) => s + v, 0);
  const diff = Math.round((100 - sumRounded) * 10) / 10; // -0.1, 0, 0.1 정도

  if (diff !== 0) {
    // 마지막 항목에 보정값을 더해줌 (원하면 "가장 큰 값" 인덱스로 바꿔도 됨)
    const lastIndex = rounded.length - 1;
    rounded[lastIndex] = Math.round((rounded[lastIndex] + diff) * 10) / 10;
  }

  return rounded;
}


// 로봇 타입별 대수 도넛 데이터
export function buildRobotTypeDonut({ robots }: DonutCommonProps) {
  const typeCount: Record<string, number> = {};

  // ✅ 0개일 때 기본 그래프 유지
  if (robots.length === 0) {
    return [
      { id: 1, label: "QUADRUPED", value: 0, percent: 0, displayValue: "0 units" },
      { id: 2, label: "COBOT",     value: 0, percent: 0, displayValue: "0 units" },
      { id: 3, label: "AMR",       value: 0, percent: 0, displayValue: "0 units" },
      { id: 4, label: "HUMANOID",  value: 0, percent: 0, displayValue: "0 units" },
    ];
  }

  robots.forEach(r => {
    typeCount[r.type] = (typeCount[r.type] || 0) + 1;
  });

  const total = robots.length;

  return Object.entries(typeCount).map(([type, count], idx) => ({
    id: idx + 1,
    label: type,
    value: count,
    percent: Number(((count / total) * 100).toFixed(1)),
    displayValue: `${count}`,
  }));
}

// 작업/충전/대기 시간 도넛 데이터
export function buildTimeDonut({ robots }: DonutCommonProps): DonutCommonInfo[] {
  let operating = 0;
  let standby = 0;
  let charging = 0;

  robots.forEach((r) => {
    // taskTime 을 모두 "운영 시간"으로 가정
    operating += r.tasks.reduce((sum, t) => sum + t.taskTime, 0);
    standby += r.waitingTime ?? 0;
    charging += r.chargingTime ?? 0;
  });

  const items: { label: string; value: number }[] = [
    { label: "Operating", value: operating },
    { label: "Standby", value: standby },
    { label: "Charging", value: charging },
  ].filter((i) => i.value > 0);

  const values = items.map((i) => i.value);
  const percents = makeFixedPercents(values);

  return items.map((item, idx) => ({
    id: idx + 1,
    label: item.label,
    value: item.value,
    percent: percents[idx],
    displayValue: convertMinutesToText(item.value), // 예: "298h 42m"
  }));
}

// 오류 종류별 건수 도넛 데이터
export function buildErrorDonut({ robots }: DonutCommonProps): DonutCommonInfo[] {
  const errorCounts: Record<string, number> = {};

  robots.forEach((r) => {
    r.errors.forEach((e) => {
      errorCounts[e.errorType] = (errorCounts[e.errorType] || 0) + e.count;
    });
  });

  const entries = Object.entries(errorCounts);
  const values = entries.map(([_, count]) => count);
  const percents = makeFixedPercents(values);

  return entries.map(([errorType, count], idx) => ({
    id: idx + 1,
    label: errorType,          // 예: "network", "fail", "etc"
    value: count,
    percent: percents[idx],
    displayValue: `${count}`,
  }));
}


// 작업 상태별 건수 도넛 데이터
export function buildTaskCountDonut({ robots }: DonutCommonProps): DonutCommonInfo[] {
  const counts: Record<string, number> = {};

  robots.forEach((r) => {
    r.tasks.forEach((t) => {
      counts[t.taskType] = (counts[t.taskType] || 0) + 1;
    });
  });

  const entries = Object.entries(counts);
  const values = entries.map(([_, count]) => count);
  const percents = makeFixedPercents(values);

  return entries.map(([taskType, count], idx) => ({
    id: idx + 1,
    label: taskType,              // 예: "delivery"
    value: count,
    percent: percents[idx],       // 1자리 소수, 합계 100.0
    displayValue: `${count}`,
  }));
}