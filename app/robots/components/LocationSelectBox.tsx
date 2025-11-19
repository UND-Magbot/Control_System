"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from './SelectBox.module.css';

interface LocationItem {
    id: number;
    label: string;
}
    
    
interface LocationSelectBoxProps {
    className?: string;
    activeIndex?: number;
    onSelect?: (index: number, item: LocationItem) => void;
}

export default function LocationSelectBox({ className = "", activeIndex = 0, onSelect }: LocationSelectBoxProps) {


  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const LocationData: LocationItem[] = [
    { id: 1, label: "Yes" },
    { id: 2, label: "No" }
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
        <span>위치표시 상태</span>
        {isOpen ? (
          <img src="/icon/arrow_up.png" alt="arrow_up" />
        ) : (
          <img src="/icon/arrow_down.png" alt="arrow_down" />
        )}
      </div> 
      {isOpen && (
        <div className={styles.seletbox}>
            {LocationData.map((item, idx) => (
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