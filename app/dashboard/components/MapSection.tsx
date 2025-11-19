"use client"

import styles from './MapSection.module.css';
import { ZoomControl, FloorSelectBox, RobotPathBtn, PlusBtn } from "@/app/components/button";
import { useState, useEffect, useRef } from 'react';
import type { Floor, RobotRowData, Video } from '@/app/type'

import React from 'react';

type FloorSelectBoxProps = {
  floors: Floor[];
  robots: RobotRowData[];
  video: Video[];
};


export default function MapSection({ floors, robots, video }:FloorSelectBoxProps) {

    const [mapTabActiveIndex, setMapTabActiveIndex] = useState<number | null>(0);
    const [floorActiveIndex, setFloorActiveIndex] = useState<number>(2);
    const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
    const [selectedRobot, setSelectedRobot] = useState<RobotRowData | null>(null);

    
    const handleFloorSelect = (idx: number, floors: Floor) => {
      setFloorActiveIndex(idx);
      setSelectedFloor(floors);
      // setRobotCurrentImage( ... ); // 나중에 로봇별 카메라 이미지 연동 시 여기서 처리
      console.log("선택된 층:", floors.id, floors.label);
    };

    // ✅ 로봇 선택 핸들러
    const handleRobotSelect = (idx: number, robots: RobotRowData) => {
      setSelectedRobot(robots);
      // setRobotCurrentImage( ... ); // 나중에 로봇별 카메라 이미지 연동 시 여기서 처리
      console.log("선택된 로봇:", robots.id, robots.no);
    };

    const defaultFloorName = selectedFloor?.label || "1F";

    // 로봇별로 연결된 이미지 리스트
    const floorImages = [
      "/images/map_sample.png",
      "/images/map_view_1.png",
      "/images/map_view_2.png"
    ];
    
    const mapCurrentImage = floorImages[floorActiveIndex];


    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

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

    // 층 선택 탭이 변경될 때 확대/축소 초기화
    useEffect(() => {
      setScale(1);
      setMapTabActiveIndex(null);
    }, [floorActiveIndex]);
    

   return (
    <>
      <div className={styles["top-div"]}>
          <div className={styles["title-div"]}>
          <div>
              <img src="/icon/map_w.png" alt="map" />
          </div>
            <p>Robot Location</p>
          </div>
          <PlusBtn type="map" selectedRobots={selectedRobot} robots={robots} video={video} />
      </div>
      <div className={styles["middle-div"]}>
        <div className={styles["view-div"]}>
          <div className={styles.FloorName}>{defaultFloorName}</div>
          <div ref={wrapperRef} className={styles["view-box"]} style={{ overflow: "hidden", userSelect: "none", touchAction: "none", cursor: scale > 1 ? (isPanning ? "grabbing" : "grab") : "default",}} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={endPan} onMouseLeave={endPan} >
            <img ref={imgRef} className={styles["path-icon-img"]} src={mapCurrentImage} alt="map" draggable={false} style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`, transformOrigin: "center center", transition: isPanning ? "none" : "transform 120ms ease"}}/>
          </div>
          <ZoomControl onClick={handleZoomFromChild} />
        </div>
      </div>
      <div className={styles["bottom-div"]}>
        <FloorSelectBox floors={floors} activeIndex={floorActiveIndex} onSelect={handleFloorSelect} className={styles.customSelectBox} />
        <RobotPathBtn selectedRobots={selectedRobot} robots={robots} video={video} />
      </div>
    </>
   );
}

