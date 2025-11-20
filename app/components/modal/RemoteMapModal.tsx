'use client';

import styles from './Modal.module.css';
import React, { useState, useEffect, useRef } from 'react';
import type { RobotRowData, Video, Camera } from '@/app/type';
import { VideoStatus, RemotePad, ModalRobotSelect } from '@/app/components/button';

type PrimaryViewType = 'camera' | 'map';

type RobotViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedRobots: RobotRowData | null;
  robots: RobotRowData[];
  video: Video[];
  camera: Camera[];
  primaryView: PrimaryViewType;
};

export default function RemoteModal({
  isOpen,
  onClose,
  selectedRobots,
  robots,
  video,
  camera,
  primaryView
}: RobotViewModalProps) {

  const [activeCam, setActiveCam] = useState<number>(1);
  const [cameraStream, setCameraStream] = useState("http://localhost:8000/Video/1");

  const [robotActiveIndex, setRobotActiveIndex] = useState<number>(0);
  const [selectedRobot, setSelectedRobot] = useState<RobotRowData | null>(null);

  const [isSwapped, setIsSwapped] = useState(false);
  const [cameraTabActiveIndex, setCameraTabActiveIndex] = useState<number>(0);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const panStartRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const mapImage = "/images/map_sample.png";

  useEffect(() => {
    setSelectedRobot(selectedRobots);
    if (selectedRobots) {
      const idx = robots.findIndex(r => r.id === selectedRobots.id);
      if (idx !== -1) setRobotActiveIndex(idx);
    }
  }, [selectedRobots, robots]);

  // ---------------------------
  // Drag & Zoom Control
  // ---------------------------

  const clampTranslate = (nx: number, ny: number) => {
    const wrap = wrapperRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return { x: nx, y: ny };

    const wrapW = wrap.clientWidth;
    const wrapH = wrap.clientHeight;

    const baseW = img.clientWidth;
    const baseH = img.clientHeight;

    const scaledW = baseW * scale;
    const scaledH = baseH * scale;

    const maxOffsetX = Math.max(0, (scaledW - wrapW) / 2);
    const maxOffsetY = Math.max(0, (scaledH - wrapH) / 2);

    const clamp = (v: number, min: number, max: number) =>
      Math.min(Math.max(v, min), max);

    return {
      x: clamp(nx, -maxOffsetX, maxOffsetX),
      y: clamp(ny, -maxOffsetY, maxOffsetY),
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;

    const img = imgRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!inside) return;

    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      tx: translate.x,
      ty: translate.y,
    };
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

  useEffect(() => {
    setTranslate(prev => clampTranslate(prev.x, prev.y));
  }, [scale]);

  // ---------------------------
  // Close Modal
  // ---------------------------

  const handleClose = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setIsPanning(false);
    setIsSwapped(false);
    setCameraTabActiveIndex(0);

    setSelectedRobot(selectedRobots);
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // ---------------------------
  // Robot control API
  // ---------------------------

  const standHandle = () => fetch("http://localhost:8000/robot/stand", { method: "POST" });
  const sitHandle = () => fetch("http://localhost:8000/robot/sit", { method: "POST" });
  const slowHandle = () => fetch("http://localhost:8000/robot/slow", { method: "POST" });
  const normalHandle = () => fetch("http://localhost:8000/robot/normal", { method: "POST" });
  const fastHandle = () => fetch("http://localhost:8000/robot/fast", { method: "POST" });

  // ---------------------------
  // Camera Change (FIXED)
  // ---------------------------

  const handleCameraTab = (idx: number, camId: number) => {
    setCameraTabActiveIndex(idx);
    setActiveCam(camId);

    const newUrl = `http://localhost:8000/Video/${camId}`;
    console.log("카메라 변경 →", newUrl);

    setCameraStream(newUrl);
  };

  const defaultRobotName = selectedRobot?.no || "Robot 1";

  // ---------------------------
  // UI
  // ---------------------------

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

        {/* -------------------- TOP -------------------- */}
        <div className={styles.modalTopDiv}>
          <div className={styles.modalTitle}>
            <img src="/icon/robot_control_w.png" alt="robot_control" />
            <span>Remote Control (Real-time Camera & Location Map)</span>
          </div>
          <button className={styles.closeBtn} onClick={handleClose}>✕</button>
        </div>

        {/* -------------------- MAIN CAMERA VIEW -------------------- */}
        <div className={styles.cameraView}>

          {/* Robot Select / Status */}
          <div className={styles.topPosition}>
            <ModalRobotSelect
              selectedLabel={defaultRobotName}
              robots={robots}
              activeIndex={robotActiveIndex}
              onSelect={(idx, robot) => {
                setRobotActiveIndex(idx);
                setSelectedRobot(robot);
              }}
            />

            <div className={styles.topRightPostion}>
              <div className={styles.topRightIcon}>
                <VideoStatus className={styles.videoStatusCustom} video={video} />

                <div className={styles.robotStatus}>
                  <img src="/icon/status_w.png" alt="net" />
                  <div>Online</div>
                </div>

                <div className={styles.robotStatus}>
                  <img src="/icon/battery_full_w.png" alt="battery" />
                  <div>89%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Camera + Map Swappable Main View */}
          <div className={styles["video-box"]} style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", position: "relative" }}>
            <div
              ref={wrapperRef}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                userSelect: "none",
                touchAction: "none",
                cursor: scale > 1 ? (isPanning ? "grabbing" : "grab") : "default"
              }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={endPan}
              onMouseLeave={endPan}
            >

              {/* MAIN CAMERA */}
              <img
                ref={imgRef}
                src={cameraStream}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  display: (!isSwapped && primaryView === "camera") ? "block" : "none",
                  transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                  transformOrigin: "center center",
                  transition: isPanning ? "none" : "transform 120ms ease",
                }}
              />

              {/* MAIN MAP */}
              <img
                src={mapImage}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  display: (primaryView === "map" || isSwapped) ? "block" : "none",
                }}
              />

            </div>
          </div>

          {/* Floor List */}
          <div className={styles.middlePosition}>
            <div className={styles.floorFlex}>
              <div>1F</div>
              <div>2F</div>
              <div className={styles.active}>3F</div>
              <div>4F</div>
              <div>5F</div>
              <div>6F</div>
              <div>7F</div>
              <div>8F</div>
            </div>
          </div>

          {/* ---------------------- BOTTOM CONTROL AREA ---------------------- */}
          <div className={styles.bottomPosition}>
            <div className={styles.bottomFlex}>

              <RemotePad />

              {/* MODE */}
              <div className={`${styles.modeBox} ${styles.mt50}`}>
                <div className={styles.mb20}>MODE</div>

                <div className={`${styles.standSitBtn} ${styles.mb20}`}>
                  <div onClick={standHandle}>Stand</div>
                  <div onClick={sitHandle}>Sit</div>
                </div>

                <div className={styles.speedBtn}>
                  <div onClick={slowHandle}>Slow</div>
                  <div onClick={normalHandle}>Normal</div>
                  <div onClick={fastHandle}>Fast</div>
                </div>
              </div>

              {/* POWER */}
              <div className={`${styles.powerBtn} ${styles.mt50}`}>
                <div className={`${styles.mb20} ${styles.textCenter}`}>POWER</div>
                <div className={styles.powerImg}>
                  <img src="/icon/power-w.png" alt="power" />
                </div>
              </div>

              {/* CAMERA TABS */}
              <div className={`${styles.viewBtn} ${styles.mt50}`}>
                <div className={styles.mb20}>CAMERA</div>

                <div className={`${styles.camBtn} ${styles.mb20}`}>
                  {camera.map((cam, idx) => (
                    <div
                      key={cam.id}
                      className={`${styles.camItem} ${cameraTabActiveIndex === idx ? styles.active : ""}`}
                      onClick={() => handleCameraTab(idx, cam.id)}
                    >
                      {cam.label}
                    </div>
                  ))}
                </div>

                {/* ZOOM */}
                <div className={styles.zoomBtn}>
                  <div onClick={() => setScale(s => Math.min(s + 0.2, 3))}>Zoom In</div>
                  <div onClick={() => setScale(s => Math.max(s - 0.2, 1))}>Zoom Out</div>
                </div>
              </div>

              {/* PIP VIEW */}
              <div className={styles.viewBox} style={{ overflow: "hidden", position: "relative" }}>

                {/* PIP Camera */}
                <img
                  src={cameraStream}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: isSwapped ? "block" : "none",
                    position: "absolute",
                    top: 0,
                    left: 0
                  }}
                />

                {/* PIP Map */}
                <img
                  src={mapImage}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: isSwapped ? "none" : "block",
                    position: "absolute",
                    top: 0,
                    left: 0
                  }}
                />

                <div className={styles.viewExchangeBtn} onClick={() => setIsSwapped(prev => !prev)}>
                  <img src="/icon/view-change.png" alt="swap" />
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
