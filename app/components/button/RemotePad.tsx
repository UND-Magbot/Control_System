"use client";

import React from 'react';
import styles from './Button.module.css';
import type { PrimaryViewType } from '@/app/type';

type ClassType = { 
    className?: string;
    primaryView: PrimaryViewType; 
  };

export default function RemotePad({
    className,
    primaryView
}: ClassType
){
    const isMap = primaryView === "map"; 

    const upHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("upHandle 클릭됨!", event);

        fetch("http://localhost:8000/robot/up", {
            method: "POST",
            }).then(() => {
                console.log("요청 완료");
        });
    };
    
    const leftHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("leftHandle 클릭됨!", event);
        fetch("http://localhost:8000/robot/left", {
            method: "POST",
            }).then(() => {
                console.log("요청 완료");
        });
    };

    const stopHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("stopHandle 클릭됨!", event);
        fetch("http://localhost:8000/robot/stop", {
            method: "POST",
            }).then(() => {
                console.log("요청 완료");
        });
    };
    
    const rightHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("rightHandle 클릭됨!", event);
        fetch("http://localhost:8000/robot/right", {
            method: "POST",
            }).then(() => {
                console.log("요청 완료");
        });
    };
    
    const downHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("downHandle 클릭됨!", event);
        fetch("http://localhost:8000/robot/down", {
            method: "POST",
            }).then(() => {
                console.log("요청 완료");
        });
    };

    const leftTurnHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("leftTurnHandle 클릭됨!", event);
        fetch("http://localhost:8000/robot/leftTurn", {
            method: "POST",
            }).then(() => {
                console.log("요청 완료");
        });
    };

    const rightTurnHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("rightTurnHandle 클릭됨!", event);
        fetch("http://localhost:8000/robot/rightTurn", {
            method: "POST",
            }).then(() => {
                console.log("요청 완료");
        });
    };



    return (
        <div className={`${styles.remotePad}`}>
            <img className={styles.padImg} 
                 src={isMap ? "/images/remote-control-pad-d.png" : "/images/remote_control_pad.png"}
                 alt={isMap ? "control_pad_dark" : "control_pad"} />
            <div className={styles.PadControlKey}>
                <div className={styles.padIconGrid}>
                    <div className={styles.topIcon}>
                        <div></div>
                        <div className={`${styles.upBtn} ${ isMap ? styles.mapUpBtn : ""}`.trim()} onClick={upHandle}>
                            <img src={isMap ? "/icon/arrow-up-d.png" : "/icon/arrow_up.png"} alt="up" />
                            </div>
                        <div></div>
                    </div>
                    <div className={styles.middleIcon}>
                        <div className={`${styles.leftBtn} ${ isMap ? styles.mapLeftBtn : ""}`.trim()} onClick={leftHandle}>
                            <img src={isMap ? "/icon/arrow-left-d.png" : "/icon/arrow-left.png"} alt="left" />
                        </div>
                        <div className={`${styles.stopBox} ${ isMap ? styles.mapStopBox : ""}`.trim()} onClick={stopHandle}>
                            <div className={`${styles.stopInerBox} ${ isMap ? styles.mapStopInerBox : ""}`.trim()}>
                                <img src="/icon/robot-stop.png" alt="stop" />
                                <p className={styles.stopText}>Stop</p>
                            </div>
                        </div>
                        <div className={`${styles.rightBtn} ${ isMap ? styles.mapRightBtn : ""}`.trim()} onClick={rightHandle}>
                            <img src={isMap ? "/icon/arrow-right-d.png" : "/icon/arrow-right.png"} alt="right" />
                        </div>
                    </div>
                    <div className={styles.bottomIcon}>
                        <div></div>
                        <div className={`${styles.bottomBtn} ${ isMap ? styles.mapBottomBtn : ""}`.trim()} onClick={downHandle}>
                            <img src={isMap ? "/icon/arrow-down-d.png" : "/icon/arrow_down.png"} alt="down" />
                        </div>
                        <div></div>
                    </div>
                </div>
                <div className={`${styles.returnIcon} ${styles.leftre} ${ isMap ? styles.mapReturnIcon : ""}`.trim()} onClick={leftTurnHandle}>
                    <img src={isMap ? "/icon/left-return-d.png" : "/icon/left-return.png"} alt="left return" />
                </div>
                <div className={`${styles.returnIcon} ${styles.rightre} ${ isMap ? styles.mapReturnIcon : ""}`.trim()} onClick={rightTurnHandle}>
                    <img src={isMap ? "/icon/right-return-d.png" : "/icon/right-return.png"} alt="right return" />
                </div>
            </div>
        </div>
    );
}