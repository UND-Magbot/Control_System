"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from './SelectBox.module.css';
import type { BatteryItem } from '@/app/type';

  
export default function BatterySelectBox() {

  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const BatteryData: BatteryItem[] = [
      { id: 1, label: "76% ~ 100%" },
      { id: 2, label: "51% ~ 75%" },
      { id: 3, label: "26% ~ 50%" },
      { id: 4, label: "1% ~ 25%" },
      { id: 5, label: "0%" },
      { id: 6, label: "Charging" }
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

    <div className={`${styles.seletWrapper}`}>
      <div ref={wrapperRef} className={styles.selete} onClick={() => setIsOpen(!isOpen)}>
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
                <div key={item.id} className={activeIndex === idx ? styles["active"] : ""}>
                {item.label}
            </div>
            ))}
        </div>
      )}
    </div>
  );
}