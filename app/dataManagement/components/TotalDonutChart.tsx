"use client";

import type { DonutCommonInfo } from "@/app/type";
import { buildConicGradient } from "@/app/utils/buildConicGradient";
import styles from "./TotalDonutChart.module.css";

type DonutChartProps = {
  title: string;
  data: DonutCommonInfo[];

  selectedRobotTypeLabel?: string | null;
  selectedRobotName?: string | null;
  selectedRobotIconIndex?: number | null;
};

export default function DonutChart({ 
  title,
  data,
  selectedRobotTypeLabel,
  selectedRobotName,
  selectedRobotIconIndex,
 }: DonutChartProps) {
  if (!data || data.length === 0) return null;

  const totalUnits = data.reduce((sum, item) => sum + item.value, 0);

    const robotTypeColorMap: Record<string, string> = {
        QUADRUPED: "#fa0203",
        COBOT: "#03abf3",
        AMR: "#97ce4f",
        HUMANOID: "#f79418",
    };

  const singleType = data.length === 1 ? data[0].label : null;

  let backgroundImage: string;

  if (singleType) {
      // 단일 타입 → 해당 색으로 꽉 채운 원
      const color = robotTypeColorMap[singleType] ?? "#5d6174";
      backgroundImage = `conic-gradient(${color} 0deg 360deg)`;
  } else {
      // Total Robots → 기존 멀티 conic-gradient 사용
      backgroundImage = buildConicGradient(data);
  }

  return (
    <div className={styles.totalDonut}>

        <div className={styles.totalDonutBorder}>
            {/* 바깥 컬러 도넛 */}
            <div
                className={styles.totalDonutOuter}
                style={{ backgroundImage }}
            >
                <div className={styles.totalDonutGap}>
                    {/* 안쪽 어두운 링 + 중앙 원 */}
                    <div className={styles.totalDonutInner}>
                      <div className={styles.totalDonutCenter}>
                        {/* 🔽 라벨/아이콘 부분은 이전에 만든 조건 그대로 두고 */}
                        {selectedRobotName ? (
                          <>
                            <div className={styles.centerRobotIcon}>
                              <img
                                src={`/icon/robot_icon(${(selectedRobotIconIndex ?? 1)+ 1}).png`}
                                alt={selectedRobotName}
                              />
                            </div>
                            <div className={styles.centerLabelTop}>{selectedRobotName}</div>
                          </>
                        ) : selectedRobotTypeLabel ? (
                          <>
                            <div className={styles.centerLabelTop}>{selectedRobotTypeLabel}</div>
                          </>
                        ) : (
                          <>
                            <div className={styles.centerLabelTop}>TOTAL</div>
                            <div className={styles.centerLabelTop}>ROBOTS</div>
                          </>
                        )}

                        {/* 🔥 공통: 숫자 + 단위 → 로봇 이름 선택된 경우엔 감춤 */}
                        {!selectedRobotName && (
                          <>
                            <div className={styles.centerNumber}>{totalUnits}</div>
                            <div className={styles.centerUnit}>units</div>
                          </>
                        )}
                      </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
