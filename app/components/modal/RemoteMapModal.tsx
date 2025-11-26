'use client';

import styles from './Modal.module.css';
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const mapRef = useRef<HTMLImageElement | null>(null);

  const mapImage = "/map/occ_grid.png";

// swap 전환 시 mainView 타입에 다르게 적용하기 위해 분기 처리
  const mainView: "camera" | "map" = isSwapped ? (primaryView === "camera" ? "map" : "camera") : primaryView;
  const pipView: "camera" | "map" = mainView === "camera" ? "map" : "camera";

  const isMainMap = mainView === "map";
  const isMainCamera = mainView === "camera";

  const defaultRobotName = selectedRobot?.no || "Robot 1";
  type BatteryStatus = {
  VoltageLeft?: number;
  VoltageRight?: number;
  BatteryLevelLeft?: number;
  BatteryLevelRight?: number;
  battery_temperatureLeft?: number;
  battery_temperatureRight?: number;
  chargeLeft?: boolean;
  chargeRight?: boolean;
  serialLeft?: string;
  serialRight?: string;
};

type RobotStatus = {
  battery: BatteryStatus;
};

  /* --- FastAPI robot position --- */
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0, yaw: 0 });
  const [robotStatus, setRobotStatus] = useState<RobotStatus>({
    battery: {}
  });

  useEffect(() => {
    const fetchRobotPos = () => {
      fetch("http://localhost:8000/robot/position")
        .then(res => res.json())
        .then(data => setRobotPos(data))
        .catch(() => {});
    };

    fetchRobotPos();
    const interval = setInterval(fetchRobotPos, 1000);
    return () => clearInterval(interval);
  }, []);

  /* --- map.yaml load --- */
  type MapInfo = {
    resolution: number;
    origin: number[];
    width: number;
    height: number;
  };

  const [mapInfo, setMapInfo] = useState<MapInfo | null>(null);

  useEffect(() => {
    fetch("/map/occ_grid.yaml")
      .then(res => res.text())
      .then(text => {
        const obj: Record<string, string> = {};
        text.split("\n").forEach(line => {
          const [key, value] = line.split(":");
          if (!key || !value) return;
          obj[key.trim()] = value.trim();
        });

        const origin = obj["origin"]
          .replace("[", "")
          .replace("]", "")
          .split(",")
          .map(Number);

        setMapInfo({
          resolution: parseFloat(obj["resolution"]),
          origin,
          width: parseInt(obj["width"]),
          height: parseInt(obj["height"])
        });
      });
  }, []);


  /* --- map render size --- */
  const [mapSize, setMapSize] = useState({ w: 0, h: 0 });

  // 최초 렌더 + 리사이즈
  useEffect(() => {
    if (!mapRef.current) return;

    const updateSize = () => {
      setMapSize({
        w: mapRef.current!.clientWidth,
        h: mapRef.current!.clientHeight
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // ⭐ PIP → Main 전환 시 mapSize 재계산 (중요)
  useEffect(() => {
    if (!mapRef.current) return;

    const timer = setTimeout(() => {
      setMapSize({
        w: mapRef.current!.clientWidth,
        h: mapRef.current!.clientHeight
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [isSwapped, primaryView]);


  /* --- world → pixel --- */
  const mapResolution = 0.1;
  const mapOriginX = -19.9;
  const mapOriginY = -14.9;
  const mapPixelWidth = 427;
  const mapPixelHeight = 240;

  const offsetX = 0;
  const offsetY = 0;

  const worldToPixel = (x: number, y: number) => {
    const pixelX = (x - mapOriginX) / mapResolution;
    const pixelY = (y - mapOriginY) / mapResolution;

    const screenX = pixelX * (mapSize.w / mapPixelWidth);
    const screenY = mapSize.h - (pixelY * (mapSize.h / mapPixelHeight));

    return {
      x: screenX + offsetX,
      y: screenY + offsetY
    };
  };

  const robotScreenPos = useMemo(() => {
    if (mapSize.w === 0 || mapSize.h === 0) {
      return { x: -9999, y: -9999 };
    }
    return worldToPixel(robotPos.x, robotPos.y);
  }, [robotPos, mapSize]);

  const pipMapRef = useRef<HTMLDivElement | null>(null);
  const [pipSize, setPipSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!pipMapRef.current) return;

    const update = () => {
      setPipSize({
        w: pipMapRef.current!.clientWidth,
        h: pipMapRef.current!.clientHeight
      });
    };
    
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!pipMapRef.current) return;

    // PIP가 나타난 뒤 DOM이 안정되면 계산
    const timer = setTimeout(() => {
      setPipSize({
        w: pipMapRef.current!.clientWidth,
        h: pipMapRef.current!.clientHeight
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [isSwapped]);

  const pipRobotPos = useMemo(() => {
    if (pipSize.w === 0 || pipSize.h === 0) return { x: -9999, y: -9999 };

    const pixelX = (robotPos.x - mapOriginX) / mapResolution;
    const pixelY = (robotPos.y - mapOriginY) / mapResolution;

    const screenX = pixelX * (pipSize.w / mapPixelWidth);
    const screenY = pipSize.h - (pixelY * (pipSize.h / mapPixelHeight));

    return { x: screenX, y: screenY };
  }, [robotPos, pipSize]);

  useEffect(() => {
  if (!isOpen) return;
  if (!pipMapRef.current) return;

  const timer = setTimeout(() => {
    setPipSize({
      w: pipMapRef.current!.clientWidth,
      h: pipMapRef.current!.clientHeight
    });
  }, 100);

  return () => clearTimeout(timer);
}, [isOpen]);

useEffect(() => {
  const fetchStatus = () => {
    fetch("http://localhost:8000/robot/status")
      .then(res => res.json())
      .then(data => setRobotStatus(data))
      .catch(() => {});
  };

  fetchStatus();
  const timer = setInterval(fetchStatus, 1000);
  return () => clearInterval(timer);
}, []);
  
const batteryPercentage =
  robotStatus.battery?.BatteryLevelRight ??
  robotStatus.battery?.BatteryLevelLeft ??
  0;
  /* --- robot selector --- */
 useEffect(() => {
    setSelectedRobot(selectedRobots);
    if (selectedRobots) {
      const idx = robots.findIndex(r => r.id === selectedRobots.id);
      if (idx !== -1) setRobotActiveIndex(idx);
    }
  }, [selectedRobots, robots]);

const handleWorkStart = () => {
    console.log("작업 시작");
  }

  // ---------------------------
  // Drag & Zoom Control
  // ---------------------------

  // camera/map zoom in/out 기능 분기 처리
  const cameraImgRef = useRef<HTMLImageElement | null>(null);
  const mapImgRef = useRef<HTMLImageElement | null>(null);

  const getActiveImg = () => (isMainMap ? mapImgRef.current : cameraImgRef.current);
  const clampTranslate = (nx: number, ny: number) => {
    const wrap = wrapperRef.current;
    const img = getActiveImg(); 
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

    const img = getActiveImg();
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

  /* --- close modal --- */
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


  /* --- robot control API --- */
  const standHandle = () => fetch("http://localhost:8000/robot/stand", { method: "POST" });
  const sitHandle = () => fetch("http://localhost:8000/robot/sit", { method: "POST" });
  const slowHandle = () => fetch("http://localhost:8000/robot/slow", { method: "POST" });
  const normalHandle = () => fetch("http://localhost:8000/robot/normal", { method: "POST" });
  const fastHandle = () => fetch("http://localhost:8000/robot/fast", { method: "POST" });


  /* --- camera tab --- */
  const handleCameraTab = (idx: number, camId: number) => {
    setCameraTabActiveIndex(idx);
    setActiveCam(camId);

    const newUrl = `http://localhost:8000/Video/${camId}`;
    setCameraStream(newUrl);
  };

  // ---------------------------
  // UI
  // ---------------------------

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

        {/* TOP */}
        <div className={styles.modalTopDiv}>
          <div className={styles.modalTitle}>
            <img src="/icon/robot_control_w.png" alt="robot_control" />
            <span>Remote Control (Real-time Camera & Location Map)</span>
          </div>
          <div>
            <button type='button' className={styles.workStart} onClick={handleWorkStart}>작업 시작</button>
            <button type='button' className={styles.closeBtn} onClick={handleClose}>✕</button>
          </div>
        </div>

        {/* MAIN CAMERA / MAP AREA */}
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
              primaryView={isMainMap ? "map" : "camera"}
            />

            <div className={styles.topRightPostion}>
              <div className={styles.topRightIcon}>
                <VideoStatus className={styles.videoStatusCustom} video={video} primaryView={isMainMap ? "map" : "camera"} />

                <div className={` ${styles.robotStatus} ${ isMainMap ? styles.mapRobotStatus : "" }`.trim()}>
                  <img src={ isMainMap ? "/icon/online_d.png" : "/icon/online_w.png"} alt="net" />
                  <div>Online</div>
                </div>

                <div className={` ${styles.robotStatus} ${ isMainMap ? styles.mapRobotStatus : "" }`.trim()}>
                  <img src={ isMainMap ? "/icon/battery_full_d.png" : "/icon/battery_full_w.png"} alt="battery" />
                  <div>{batteryPercentage}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Swappable Camera/Map View */}
          <div className={styles["video-box"]} style={{ width: "100%", aspectRatio: "16/9", position: "relative" }}>
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
                ref={cameraImgRef}
                src={cameraStream}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  // display: (!isSwapped && primaryView === "camera") ? "block" : "none",
                  display: mainView === "camera" ? "block" : "none",
                  transform: mainView === "camera" ? `translate(${translate.x}px, ${translate.y}px) scale(${scale})` : "none",
                  transformOrigin: "center center",
                  transition: isPanning ? "none" : "transform 120ms ease",
                }}
              />

              {/* MAIN MAP */}
              <img
                ref={mapImgRef}
                src={mapImage}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  // display: (primaryView === "map" || isSwapped) ? "block" : "none",
                  display: mainView === "map" ? "block" : "none",
                  transform: mainView === "map" ? `translate(${translate.x}px, ${translate.y}px) scale(${scale})` : "none",
                  transformOrigin: "center center",
                  transition: isPanning ? "none" : "transform 120ms ease",
                  visibility: (primaryView === "map" || isSwapped) ? "visible" : "hidden",
                  pointerEvents: "none",
                  zIndex: 0
                }}
              />

              {/* ROBOT MARKER */}
              <img
                src="/icon/robot_location(1).png"
                style={{
                  position: "absolute",
                  left: `${robotScreenPos.x}px`,
                  top: `${robotScreenPos.y}px`,
                  // width: "35px",
                  height: "45px",
                  transform: `translate(-50%, -50%)`,
                  zIndex: 20,
                  display: (primaryView === "map" || isSwapped) ? "block" : "none",
                  pointerEvents: "none"
                }}
              />

            </div>
          </div>

          {/* Floors */}
          <div className={styles.middlePosition}>
            <div className={`${styles.floorFlex} ${ isMainMap ? styles.mapFloorLine : styles.floorLine }`.trim()}>
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

          {/* Bottom Control */}
          <div className={styles.bottomPosition}>
            <div className={styles.bottomFlex}>

              <RemotePad primaryView={isMainMap ? "map" : "camera"}/>

              {/* MODE */}
              <div className={`${styles.modeBox} ${styles.mt50}`}>
                <div className={`${styles.mb10} ${ isMainMap ? styles.mapCategoryTitle : styles.categoryTitle }`.trim()}>MODE</div>

                <div className={`${styles.standSitBtn} ${styles.mb20} ${ isMainMap ? styles.mapStandSitBtn : styles.standSitBtn }`.trim()}>
                  <div onClick={standHandle}>Stand</div>
                  <div onClick={sitHandle}>Sit</div>
                </div>

                <div className={`${styles.speedBtn} ${ isMainMap ? styles.mapSpeedBtn : styles.speedBtn }`.trim()}>
                  <div onClick={slowHandle}>Slow</div>
                  <div onClick={normalHandle}>Normal</div>
                  <div onClick={fastHandle}>Fast</div>
                </div>
              </div>

              {/* POWER */}
              <div className={`${styles.powerBtn} ${styles.mt50}`}>
                <div className={`${styles.mb10} ${styles.textCenter} ${ isMainMap ? styles.mapCategoryTitle : styles.categoryTitle }`.trim()}>POWER</div>
                <div className={`${styles.powerImg} ${ isMainMap ? styles.mapPowerImg : styles.powerImg }`.trim()}>
                  <img src="/icon/power-w.png" alt="power" />
                </div>
              </div>

              {/* CAMERA TABS */}
              <div className={`${styles.viewBtn} ${styles.mt50}`}>
                <div className={`${styles.mb10} ${ isMainMap ? styles.mapCategoryTitle : styles.categoryTitle }`.trim()}>CAMERA</div>

                <div className={`${styles.camBtn} ${styles.mb20} ${ isMainMap ? styles.mapCamBtn : styles.camBtn }`.trim()}>
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
                <div className={`${styles.zoomBtn} ${ isMainMap ? styles.mapZoomBtn : styles.zoomBtn }`.trim()}>
                  <div onClick={() => setScale(s => Math.min(s + 0.2, 3))}>Zoom In</div>
                  <div onClick={() => setScale(s => Math.max(s - 0.2, 1))}>Zoom Out</div>
                </div>
              </div>

              {/* PIP VIEW */}
              <div className={styles.viewBox} style={{ overflow: "hidden", position: "relative" }}>
                <img
                  src={cameraStream}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: pipView === "camera" ? "block" : "none",
                    position: "absolute",
                    top: 0,
                    left: 0
                  }}
                />
              {/* PIP MAP (지도 + 마커 세트) */}
                <div
                  ref={pipMapRef}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: pipView === "map" ? "block" : "none",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                >
                  {/* 지도 */}
                  <img
                    src={mapImage}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      top: 0,
                      left: 0
                    }}
                  />

                  {/* 로봇 마커 */}
                  <img
                    src="/icon/robot_location(1).png"
                    style={{
                      position: "absolute",
                      left: `${pipRobotPos.x}px`,
                      top: `${pipRobotPos.y}px`,
                      // width: "20px",
                      height: "25px",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                      zIndex: 10
                    }}
                  />
                </div>

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
