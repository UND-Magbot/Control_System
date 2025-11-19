// RobotSelector.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from './Button.module.css';
import type { Floor } from "@/app/type";


type FloorSelectBoxProps = {
  floors: Floor[];
  activeIndex: number;
  onSelect: (index: number, floors: Floor) => void; // 클릭 시 부모로 올려줄 콜백
  className?: string;
};

export default function FloorSelectBox({
  floors,
  activeIndex,
  onSelect,
  className
}: FloorSelectBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedFloor = floors?.[activeIndex]; // 안전한 참조

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

    <div ref={wrapperRef} className={`${styles.seletWrapper} ${className ?? ""}`}>
      <div className={styles.selete} 
        onClick={() => setIsOpen(!isOpen)}>
        <span>{ selectedFloor?.label ?? "층을 선택하세요" }</span>
        {isOpen ? (
          <img src="/icon/arrow_up.png" alt="arrow_up" />
        ) : (
          <img src="/icon/arrow_down.png" alt="arrow_down" />
        )}
      </div> 
      {isOpen && (
        <div className={styles.seletbox}>
          {floors.map((item, idx) => (
            <div key={item.id} className={`${ activeIndex === idx ? styles["active"] : "" }`.trim()}
            onClick={() => { onSelect(idx, item); setIsOpen(false); }}>{item.label}</div>
          ))}
        </div>
      )}
    </div>
  );
}