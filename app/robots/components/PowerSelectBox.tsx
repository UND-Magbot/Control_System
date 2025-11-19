"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from './SelectBox.module.css';

interface PowerItem {
    id: number;
    label: string;
}
    
    
interface PowerSelectBoxProps {
    className?: string;
    activeIndex?: number;
    onSelect?: (index: number, item: PowerItem) => void;
}

export default function PowerSelectBox({ className = "", activeIndex = 0, onSelect }: PowerSelectBoxProps) {


  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const PowerData: PowerItem[] = [
    { id: 1, label: "On" },
    { id: 2, label: "Off" }
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
        <span>전원 온/오프 상태</span>
        {isOpen ? (
          <img src="/icon/arrow_up.png" alt="arrow_up" />
        ) : (
          <img src="/icon/arrow_down.png" alt="arrow_down" />
        )}
      </div> 
      {isOpen && (
        <div className={styles.seletbox}>
            {PowerData.map((item, idx) => (
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