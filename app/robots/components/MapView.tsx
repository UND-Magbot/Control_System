"use client";

import React, { useState } from 'react';
import usePageRouter from "@/app/hooks/CommonRouter";
import styles from './view.module.css';

export default function CameraView() {
    return (
        <div className={styles.commonBox}>
            <div className={styles.floorBox}>2F</div>
            {/* <iframe src="" frameborder="0"></iframe> */}
            <div className={styles.zoomPosition}>
                <div className={styles.zoomFlex}>
                    <div className={styles.zoomBox}>
                        <img src="/icon/zoom-in-w.png" alt="zoom-in" />
                    </div>
                    <div className={styles.zoomBox}>
                        <img src="/icon/zoom-out-w.png" alt="zoom-out" />
                    </div>
                </div>
            </div>
        </div>
    );
}