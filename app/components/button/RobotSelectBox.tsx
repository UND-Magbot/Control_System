// RobotSelector.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import type { RobotRowData } from '@/app/type';
import styles from './Button.module.css';

type RobotSelectBoxProps = {
  robots: RobotRowData[];
  activeIndex: number;                         // 부모에서 내려주는 현재 선택된 로봇 index
  onSelect: (index: number, robot: RobotRowData) => void; // 클릭 시 부모로 올려줄 콜백
  className?: string;
};

export default function RobotSelectBox({
  robots,
  activeIndex,
  onSelect,
  className
}: RobotSelectBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false); // 외부 클릭 → 닫기
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const selectedRobot = robots?.[activeIndex]; // 안전한 참조

  return (

    <div ref={wrapperRef} className={`${styles.seletWrapper} ${className ?? ""}`}>
      <div className={styles.selete} 
        onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedRobot?.no ?? "로봇을 선택하세요"}</span>
        {isOpen ? (
          <img src="/icon/arrow_up.png" alt="arrow_up" />
        ) : (
          <img src="/icon/arrow_down.png" alt="arrow_down" />
        )}
      </div> 
      {isOpen && (
        <div className={styles.seletbox}>
          {robots.map((robot, idx) => (
            <div key={robot.id} className={`${ activeIndex === idx ? styles["active"] : "" }`.trim()}
            onClick={() => { onSelect(idx, robot); setIsOpen(false); }}>{robot.no}</div>
          ))}
        </div>
      )}
    </div>
  );
}