"use client"

import React from 'react';
import styles from './common.module.css';
import { useState } from "react";
import Link from "next/link";

export default function Sidebar() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const menuItems = [
      { path: "/dashboard", icon: "main", label: "Home" },
      { path: "/robots", icon: "robot", label: "Robot" },
      { path: "/dataManagement", icon: "data", label: "Data" },
      { path: "/schedules", icon: "schedule", label: "Schedule" },
    ];
  
    const bottomItems = [
      { path: "/settings", icon: "setting", label: "Setting" },
      { path: "#", icon: "log_out", label: "Log out" },
    ];


    return(
        <aside className={styles.sidebar}>
            <div>
                {menuItems.map((item, idx) => (
                    <Link key={idx} className={styles.menuItems} 
                            href={item.path}
                            onClick={(e) => {
                                if (window.location.pathname === item.path) {
                                e.preventDefault();
                                window.location.reload();
                                }
                            }}
                            onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
                        <div className={`${item.icon}-icon`}>
                            <img src={ hoveredIndex === idx ? `/icon/${item.icon}_d.png` : `/icon/${item.icon}_w.png`} alt={item.label}/>
                        </div>
                        {item.label}
                    </Link>
                ))}
            </div>

            <div>
                {bottomItems.map((item, idx) => (
                <Link key={idx} href={item.path}
                        onClick={(e) => {
                            if (window.location.pathname === item.path) {
                            e.preventDefault();
                            window.location.reload();
                            }
                        }}
                        className={styles.menuItems} onMouseEnter={() => setHoveredIndex(idx + 100)} onMouseLeave={() => setHoveredIndex(null)}>
                    <div className={`${item.icon}-icon`}>
                        <img src={ hoveredIndex === idx + 100 ? `/icon/${item.icon}_d.png` : `/icon/${item.icon}_w.png`} alt={item.label}/>
                    </div>
                    {item.label}
                </Link>
                ))}
            </div>
        </aside>
    )
}