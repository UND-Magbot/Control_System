"use client";

import React from 'react';
import styles from './Button.module.css';

type ClassType = { 
    className?: string;
  };

export default function RemotePad({
    className
}: ClassType
){

    return (
        <div className={`${styles.remotePad}`}>
            <img className={styles.padImg} src="/images/remote_control_pad.png" alt="control_pad" />
            <div className={styles.PadControlKey}>
                <div className={styles.padIconGrid}>
                    <div className={styles.topIcon}>
                        <div></div>
                        <div className={styles.upBtn}><img src="/icon/arrow_up.png" alt="up" /></div>
                        <div></div>
                    </div>
                    <div className={styles.middleIcon}>
                        <div className={styles.leftBtn}><img src="/icon/arrow-left.png" alt="left" /></div>
                        <div className={styles.stopBox}>
                            <div className={styles.stopInerBox}>
                                <img src="/icon/robot-stop.png" alt="stop" />
                                <p className={styles.stopText}>Stop</p>
                            </div>
                        </div>
                        <div className={styles.rightBtn}><img src="/icon/arrow-right.png" alt="right" /></div>
                    </div>
                    <div className={styles.bottomIcon}>
                        <div></div>
                        <div className={styles.bottomBtn}><img src="/icon/arrow_down.png" alt="down" /></div>
                        <div></div>
                    </div>
                </div>
                <div className={`${styles.returnIcon} ${styles.leftre}`}>
                    <img src="/icon/left-return.png" alt="left_return" />
                </div>
                <div className={`${styles.returnIcon} ${styles.rightre}`}>
                    <img src="/icon/right-return.png" alt="right_return" />
                </div>
            </div>
        </div>
    );
}