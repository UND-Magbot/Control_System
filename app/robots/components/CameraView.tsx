"use client";

import React, { useState } from 'react';
import usePageRouter from "@/app/hooks/CommonRouter";
import styles from './view.module.css';

export default function CameraView() {
    return (
        <div className={styles.commonBox}>
            <div className={styles.robotBox}>Robot 1</div>
            {/* <iframe src="" frameborder="0"></iframe> */}
            <div className={styles.cameraPosition}>
                <div className={styles.cameraFlex}>
                    <div className={styles.camBox}>CAM1</div>
                    <div className={styles.camBox}>CAM2</div>
                </div>
            </div>
        </div>
    );
}