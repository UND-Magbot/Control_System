"use client";

import React, { useState, useRef, useEffect } from "react";
import type { RobotRowData } from '@/app/type';
import styles from './Button.module.css';

type ModalRobotSelectProps = {
  robots: RobotRowData[];
  activeIndex: number;
  selectedLabel: string; // 현재 선택된 로봇 이름
  onSelect: (index: number, robot: RobotRowData) => void;
  className?: string;
};

export default function RobotSelectBox({
  robots,
  activeIndex,
  selectedLabel,
  onSelect,
  className
}: ModalRobotSelectProps) {
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

  return (

    <div ref={wrapperRef} className={`${styles.modalSeletWrapper} ${styles.className}`}>
      <div className={styles.modalSelect} 
        onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedLabel}</span>
        {isOpen ? (
          <img src="/icon/arrow_up.png" alt="arrow_up" />
        ) : (
          <img src="/icon/arrow_down.png" alt="arrow_down" />
        )}
      </div>
      {isOpen && (
        <div className={styles.modalSeletbox}>
          {robots.map((item, idx) => (
            <div key={item.id} className={`${ activeIndex === idx ? styles["active"] : "" }`.trim()}
            onClick={() => { onSelect(idx, item); setIsOpen(false); }}>{item.no}</div>
          ))}
        </div>
      )}
    </div>
  );
}