"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from './SelectBox.module.css';

interface BatteryItem {
    id: number;
    label: string;
}
    
    
interface BatterySelectBoxProps {
    className?: string;
    activeIndex?: number;
    onSelect?: (index: number, item: BatteryItem) => void;
}

export default function BatterySelectBox({ className = "", activeIndex = 0, onSelect }: BatterySelectBoxProps) {


  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const BatteryData: BatteryItem[] = [
    { id: 1, label: "50% ~ 100%" },
    { id: 2, label: "1% ~ 49%" },
    { id: 3, label: "0%" },
    { id: 4, label: "Charging" }
];


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

    <div className={`${styles.seletWrapper} ${className ?? ""}`}>
      <div ref={wrapperRef} className={styles.selete} 
        onClick={() => setIsOpen(!isOpen)}>
        <span>배터리 상태</span>
        {isOpen ? (
          <img src="/icon/arrow_up.png" alt="arrow_up" />
        ) : (
          <img src="/icon/arrow_down.png" alt="arrow_down" />
        )}
      </div> 
      {isOpen && (
        <div className={styles.seletbox}>
            {BatteryData.map((item, idx) => (
                <div
                    key={item.id}
                    className={activeIndex === idx ? styles["active"] : ""}
                    onClick={() => onSelect && onSelect(idx, item)}
                >
                {item.label}
            </div>
            ))}
        </div>
      )}
    </div>
  );
}