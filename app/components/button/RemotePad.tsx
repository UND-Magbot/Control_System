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

    const upHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("upHandle 클릭됨!", event);
    };
    
    const leftHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("leftHandle 클릭됨!", event);
    };

    const stopHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("stopHandle 클릭됨!", event);
    };
    
    const rightHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("rightHandle 클릭됨!", event);
    };
    
    const downHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("downHandle 클릭됨!", event);
    };

    const leftTurnHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("leftTurnHandle 클릭됨!", event);
    };

    const rightTurnHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("rightTurnHandle 클릭됨!", event);
    };



    return (
        <div className={`${styles.remotePad}`}>
            <img className={styles.padImg} src="/images/remote_control_pad.png" alt="control_pad" />
            <div className={styles.PadControlKey}>
                <div className={styles.padIconGrid}>
                    <div className={styles.topIcon}>
                        <div></div>
                        <div className={styles.upBtn} onClick={upHandle}><img src="/icon/arrow_up.png" alt="up" /></div>
                        <div></div>
                    </div>
                    <div className={styles.middleIcon}>
                        <div className={styles.leftBtn} onClick={leftHandle}><img src="/icon/arrow-left.png" alt="left" /></div>
                        <div className={styles.stopBox} onClick={stopHandle}>
                            <div className={styles.stopInerBox}>
                                <img src="/icon/robot-stop.png" alt="stop" />
                                <p className={styles.stopText}>Stop</p>
                            </div>
                        </div>
                        <div className={styles.rightBtn} onClick={rightHandle}><img src="/icon/arrow-right.png" alt="right" /></div>
                    </div>
                    <div className={styles.bottomIcon}>
                        <div></div>
                        <div className={styles.bottomBtn} onClick={downHandle}><img src="/icon/arrow_down.png" alt="down" /></div>
                        <div></div>
                    </div>
                </div>
                <div className={`${styles.returnIcon} ${styles.leftre}`} onClick={leftTurnHandle}>
                    <img src="/icon/left-return.png" alt="left_return" />
                </div>
                <div className={`${styles.returnIcon} ${styles.rightre}`} onClick={rightTurnHandle}>
                    <img src="/icon/right-return.png" alt="right_return" />
                </div>
            </div>
        </div>
    );
}