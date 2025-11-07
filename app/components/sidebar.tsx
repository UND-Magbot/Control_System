"use client"

import { useRouter } from 'next/navigation'
import { useState } from "react";
import React from 'react';

export default function Sidebar() {
    const router = useRouter();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const menuItems = [
      { path: "/dashboard", icon: "main", label: "Main Home" },
      { path: "/robots", icon: "robot", label: "Robot Mgmt" },
      { path: "/data-management", icon: "data", label: "Data Mgmt" },
      { path: "/schedules", icon: "schedule", label: "Schedule Mgmt" },
    ];
  
    const bottomItems = [
      { path: "/settings", icon: "setting", label: "Setting" },
      { path: "/", icon: "log_out", label: "Log out" },
    ];


    return(
        <aside className="sidebar">
            <ol>
                {menuItems.map((item, idx) => (
                    <li key={idx} onClick={() => router.push(item.path)} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
                        <div className={`${item.icon}-icon`}>
                            <img src={ hoveredIndex === idx ? `/icon/${item.icon}_d.png` : `/icon/${item.icon}_w.png`} alt={item.label}/>
                        </div>
                        {item.label}
                    </li>
                ))}
            </ol>

            <ol>
                {bottomItems.map((item, idx) => (
                <li key={idx} onClick={() => router.push(item.path)} onMouseEnter={() => setHoveredIndex(idx + 100)} onMouseLeave={() => setHoveredIndex(null)}>
                    <div className={`${item.icon}-icon`}>
                        <img src={ hoveredIndex === idx + 100 ? `/icon/${item.icon}_d.png` : `/icon/${item.icon}_w.png`} alt={item.label}/>
                    </div>
                    {item.label}
                </li>
                ))}
            </ol>
        </aside>
    )
}