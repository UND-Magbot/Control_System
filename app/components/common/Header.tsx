"use client"

import React from 'react';
import styles from './common.module.css';
import Link from "next/link";

export default function Header() {

  
    return(
        <header className={styles.header}>
            <div className={styles["container-flex"]}>
                <div className={styles["lr-div-flex"]}>
                    <div className={styles["logo-img"]}>
                        <img src="/icon/logo.png" alt="로고" />
                    </div>
                    <h2>HOSPITAL CONTROL SYSTEM</h2>
                </div>
                <div className={styles["lr-div-flex"]}>
                    <div className={styles["alarm-icon"]}>
                        <div className={styles.alarm}>
                            <img src="/icon/bell_c.png" alt="알림" />
                            <span>3</span>
                        </div>
                        <Link className={styles.schedule} href="/schedules">
                            <img src="/icon/calendar_c.png" alt="스케줄" />
                            <span>3</span>
                        </Link>
                        <Link className={styles.lacation} href="/robots">
                            <img src="/icon/map.png" alt="로봇위치" />
                        </Link>
                    </div>
                    <div className={styles["new-time"]}>
                        <span>2025-10-31</span>
                        <span>PM 01:36</span>
                    </div>
                    <Link className={styles.admin} href="#">
                        <div className={styles["admin-img"]}>
                            <img src="/icon/user.png" alt="사용자" />
                        </div>
                        <span>Administrator</span>
                    </Link>
                </div>
            </div>
        </header>
    )
}