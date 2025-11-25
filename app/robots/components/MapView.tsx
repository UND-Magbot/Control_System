"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { RobotRowData, BatteryItem, Camera, Floor, Video } from '@/app/type';
import styles from './RobotList.module.css';

type CombinedProps = {
    selectedRobotId: number | null;
    selectedRobot:  RobotRowData | null;
    cameras: Camera[];
    robots: RobotRowData[];
    video: Video[];
    floors: Floor[];
  }

export default function CameraView({
    selectedRobotId,
    selectedRobot,
    cameras,
    robots,
    video,
    floors
}: CombinedProps) {


    const optionItems = [
        { icon: "zoom-in", label: "Zoom In", action: "in" },
        { icon: "zoom-out", label: "Zoom Out", action: "out" },
    ];

    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [floorActiveIndex, setFloorActiveIndex] = useState<number>(2);

    const panStartRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);


    // 래퍼 크기와 이미지(비변환) 크기를 이용해 허용 범위 계산
    const clampTranslate = (nx: number, ny: number) => {
      const wrap = wrapperRef.current;
      const img = imgRef.current;
      if (!wrap || !img) return { x: nx, y: ny };

      const wrapW = wrap.clientWidth;
      const wrapH = wrap.clientHeight;

      // transform 적용 전의 레이아웃 크기(이미지 스타일 width:100% 가정)
      const baseW = img.clientWidth;
      const baseH = img.clientHeight;

      // 실제 화면에 보이는 크기(스케일 반영)
      const scaledW = baseW * scale;
      const scaledH = baseH * scale;

      // 중앙 기준(transformOrigin: center)에서 허용 가능한 최대 오프셋
      const maxOffsetX = Math.max(0, (scaledW - wrapW) / 2);
      const maxOffsetY = Math.max(0, (scaledH - wrapH) / 2);

      const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

      return {
        x: clamp(nx, -maxOffsetX, maxOffsetX),
        y: clamp(ny, -maxOffsetY, maxOffsetY),
      };
    };

    // 🔴 확대 상태이며, 클릭 지점이 "이미지 표시 영역" 안일 때만 팬 시작
    const onMouseDown = (e: React.MouseEvent) => {
      if (scale <= 1) return;

      const img = imgRef.current;
      if (!img) return;

      // 현재 화면에 보이는 이미지 경계(스케일 포함)
      const rect = img.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top  && e.clientY <= rect.bottom;

      if (!inside) return; // 이미지 밖이면 드래그 시작 금지

      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        tx: translate.x,
        ty: translate.y,
      };
    };

    const handleZoomFromChild = (action: string) => {
      setScale(prev => {
        if (action === "in") return Math.min(prev + 0.2, 3);
        if (action === "out") return Math.max(prev - 0.2, 1);
        return 1;
      });
    };

    const onMouseMove = (e: React.MouseEvent) => {
      if (!isPanning || !panStartRef.current) return;
      const { x, y, tx, ty } = panStartRef.current;
      const dx = e.clientX - x;
      const dy = e.clientY - y;

      const next = clampTranslate(tx + dx, ty + dy);
      setTranslate(next);
    };

    const endPan = () => {
      setIsPanning(false);
      panStartRef.current = null;
    };

    // 스케일이 변할 때 현재 translate가 허용 범위를 벗어나지 않도록 보정
    useEffect(() => {
      setTranslate(prev => clampTranslate(prev.x, prev.y));
    }, [scale]);
    
    // 로봇별로 연결된 이미지 리스트
    const floorImages = [
        "/images/map_sample.png",
        "/images/map_view_1.png",
        "/images/map_view_2.png"
    ];
    
    const mapCurrentImage = floorImages[floorActiveIndex];


    return (
        <div className={styles.commonBox}>
            <div className={styles.floorBox}>2F</div>
            <div ref={wrapperRef} style={{ overflow: "hidden", userSelect: "none", touchAction: "none", cursor: scale > 1 ? (isPanning ? "grabbing" : "grab") : "default",}} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={endPan} onMouseLeave={endPan} >
                <img ref={imgRef} src={mapCurrentImage} alt="map" draggable={false} style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`, transformOrigin: "center center", transition: isPanning ? "none" : "transform 120ms ease"}}/>
            </div>
            <div className={styles.zoomPosition}>
                <div className={styles.zoomFlex}>
                    {optionItems.map((item, idx) => (
                        <div key={idx} className={styles.zoomBox} onClick={ () => {handleZoomFromChild(item.action)}}>
                            <img src={`/icon/${item.icon}-w.png`} alt={item.label} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}