"use client";

import React from 'react';
import { useState } from 'react';
import styles from './Button.module.css'

export default function ZoomControl({ onClick,}: { onClick: (action: string) => void; }) {
    
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
    const optionItems = [
      { icon: "zoom_in", label: "Zoom In", action: "in" },
      { icon: "zoom_out", label: "Zoom Out", action: "out" },
    ];
  
    return (
      <div className={styles["map-button"]}>
        {optionItems.map((item, idx) => (
          <button
            type="button"
            key={idx}
            className={styles["zoom-icon"]}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onClick(item.action)}  // ← 부모 함수 실행
          >
            <div className={`${item.icon}-icon`}>
              <img
                src={
                  hoveredIndex === idx
                    ? `/icon/${item.icon}_w.png`
                    : `/icon/${item.icon}_d.png`
                }
                alt={item.label}
              />
            </div>
            {item.label}
          </button>
        ))}
      </div>
    );
  }
