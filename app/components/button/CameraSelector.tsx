"use client";

import React, { useState } from 'react';
import type { Camera } from '@/app/type'
import styles from './Button.module.css';

type CameraSelectorProps = {
  cameras: Camera[];
  activeIndex: number;                         // 현재 선택된 카메라 index (부모가 관리)
  onSelect: (index: number, camId: number) => void; // 클릭 시 부모에 알려줄 콜백
};

export default function CameraSelector({
  cameras,
  activeIndex,
  onSelect,
}: CameraSelectorProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={styles.viewBtn}>
      {cameras.map((cam, idx) => (
        <button key={cam.id} type="button"
          className={`${styles.camerabtn} ${activeIndex === idx ? styles["active"] : ""}`}
          onClick={() => onSelect(idx, cam.id)}
          aria-pressed={activeIndex === idx}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <img src={ hoveredIndex === idx || activeIndex === idx ? "/icon/cam_w.png" : "/icon/cam_b.png"} alt="cam" />
          <span>{cam.label}</span>
        </button>
      ))}
    </div>
  );
}
