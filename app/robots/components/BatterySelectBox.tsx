"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from './SelectBox.module.css';
import type { BatteryItem } from '@/app/type';

  
type BatterySelectBoxProps = {
    battery: BatteryItem[];
    className?: string;
    activeIndex: number;
    selectBattery: BatteryItem | null;
    onSelect: (index: number, battery: BatteryItem) => void;
}

export default function BatterySelectBox({
  battery,
  selectBattery,
  activeIndex,
  className,
  onSelect
}: BatterySelectBoxProps) {

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

    <div className={`${styles.seletWrapper} ${className ?? ""}`}>
      <div ref={wrapperRef} className={styles.selete} 
        onClick={() => setIsOpen(!isOpen)}>
        <span>{selectBattery?.label ?? "배터리 상태"}</span>
        {isOpen ? (
          <img src="/icon/arrow_up.png" alt="arrow_up" />
        ) : (
          <img src="/icon/arrow_down.png" alt="arrow_down" />
        )}
      </div> 
      {isOpen && (
        <div className={styles.seletbox}>
            {battery.map((item, idx) => (
                <div
                    key={item.id}
                    className={activeIndex === idx ? styles["active"] : ""}
                    onClick={() => { onSelect(idx, item); setIsOpen(false); }}
                >
                {item.label}
            </div>
            ))}
        </div>
      )}
    </div>
  );
}