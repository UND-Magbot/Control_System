'use client';

import './style.css';
import React from 'react';
import axios from "axios";
import { useState, useEffect, useRef } from 'react';
import usePageRouter from "@/app/hooks/CommonRouter";
import CameraModal from '../components/modal/RobotPathModal';
import RemoteModal from '../components/modal/RemoteMapModal';

export default function DashboardPage() {

    const { handleRoute } = usePageRouter();

    const [cameraIsModalOpen, setCameraIsModalOpen] = useState(false);
    const [mapIsModalOpen, setMapIsModalOpen] = useState(false);
    const [scale, setScale] = useState(1);
    
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [cameraTabActiveIndex, setCameraTabActiveIndex] = useState<number>(0);
    const [mapTabActiveIndex, setMapTabActiveIndex] = useState<number | null>(0);
    const [robotActiveIndex, setRobotActiveIndex] = useState<number>(0);
    const [floorActiveIndex, setFloorActiveIndex] = useState<number>(0);
    const [robotCurrentImage, setRobotCurrentImage] = useState<string>("0");

    // 실시간 카메라
    const [webrtcUrl, setWebrtcUrl] = useState<string | undefined>(undefined);
    const [activeCam, setActiveCam] = useState<string>('my_camera01');
    const [retryCount, setRetryCount] = useState<number>(0); // 자동 재시도 카운터
    const [cameraStream, setCameraStream] = useState("http://localhost:8000/Video/1");

   
    const optionItems = [
      { icon: "zoom_in", label: "Zoom In", action: "in" },
      { icon: "zoom_out", label: "Zoom Out", action: "out" }
    ];

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

    // 확대/축소 핸들러 (매개변수가 문자열일 수도 있음)
    const handleZoom = (action: string) => {
      // 1️⃣ 허용된 값인지 검사 (Type Guard)
      if (action !== "in" && action !== "out" && action !== "reset") {
        console.warn(`⚠️ 알 수 없는 zoom action: ${action}`);
        return; // 잘못된 값이면 그냥 무시
      }

      // 2️⃣ 정상 동작 로직
      setScale((prev) => {
        if (action === "in") return Math.min(prev + 0.2, 3);
        if (action === "out") return Math.max(prev - 0.2, 1);
        // action === "reset"
        setTranslate?.({ x: 0, y: 0 }); // 필요하면 팬 위치 초기화
        return 1;
      });
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
    
    const robotTabs = [
      { label: "Robot 1" },
      { label: "Robot 2" },
      { label: "Robot 3" }
    ];

    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    

    // ✅ 카메라 선택 및 연결 함수
    // const selectCamera = async (cam: string) => {
    //   try {
    //       setActiveCam(cam);
        
    //       // axios.get 사용
    //       const res = await axios.get(`${apiBase}/camera/${cam}`);
        
    //       // axios는 200이 아닐 경우 자동으로 catch로 이동함
    //       const data = res.data;
        
    //       setWebrtcUrl(data.webrtc_url);
    //       console.log(`[INFO] ${cam} 연결 성공: ${data.webrtc_url}`);
        
    //       setRetryCount(0); // 성공 시 재시도 카운터 리셋
    //     } catch (error: any) {
    //       console.error(`[ERROR] ${cam} 연결 실패 (${retryCount + 1}회):`, error);
        
    //       // 실패 시 3초 뒤 재시도 (최대 5회)
    //       if (retryCount < 5) {
    //         setRetryCount((prev) => prev + 1);
    //         setTimeout(() => selectCamera(cam), 3000);
    //       } else {
    //         console.warn(`[WARN] ${cam} 연결 재시도 중단`);
    //       }
    //     }
    // };

    const cameras = [
      { id: "my_camera01", label: "Main Camera" },
      { id: "my_camera02", label: "Sub Camera" },
    ];

    // ✅ 페이지 로드시 기본 카메라(my_camera01) 자동 송출
    // useEffect(() => {
    //   selectCamera('my_camera01');
    // }, [cameraTabActiveIndex]);


    // 로봇 변경 시 이미지 업데이트
    // useEffect(() => {
    //   setRobotCurrentImage(robotImages[robotActiveIndex].cameras[cameraTabActiveIndex]);
    // }, [robotActiveIndex, cameraTabActiveIndex]);

    // 카메라 탭 클릭 핸들러
    const handleCameraTab = (idx: number, camId: string) => {
      setCameraTabActiveIndex(idx);
      // selectCamera(camId);
    };

    const floorTabs = [
      { label: "B2" },
      { label: "B1" },
      { label: "1F" },
      { label: "2F" },
      { label: "3F" }
    ];

    // 로봇별로 연결된 이미지 리스트
    const floorImages = [
      "/images/map_sample.png",
      "/images/map_view_1.png",
      "/images/map_view_2.png"
    ];
    
    // 현재 선택된 로봇 이미지
    // const mapCurrentImage = floorImages[floorActiveIndex];
    const mapCurrentImage = "/map/occ_grid.png";

    // 아이콘 매핑 객체
    const icons = {
      robot: (index: number) => {
        const robotIcons = [
          "/icon/robot_icon(1).png",
          "/icon/robot_icon(2).png",
          "/icon/robot_icon(3).png"
        ];
    
        // index가 범위를 초과하면 default 아이콘 반환
        return robotIcons[index];
      },
      battery: (battery: number, isCharging?: boolean) => {
        // ✅ 충전 중일 때 아이콘 최우선
        if (isCharging) return "/icon/battery_charging.png";
      
        // ✅ 잔량별 상태 아이콘
        if (battery >= 100) return "/icon/battery_full.png";
        if (battery > 75) return "/icon/battery_high.png";   // 예: 76~99%
        if (battery > 50) return "/icon/battery_half.png";   // 예: 51~75%
        if (battery > 25) return "/icon/battery_low.png";    // 예: 26~50%
        return "/icon/battery_empty.png";                    // 0~25%
      },
      status: (status: string) => {
        if (status === "Error") return "/icon/status(2).png";
        if (status === "Offline") return "/icon/status(3).png";
        return "/icon/status(1).png";
      },
      locate: (locate: string) => {
        if (locate === "No") return "/icon/locate_n.png";
        return "/icon/locate_y.png";
      },
      power: (power: string) => {
        return power === "On" ? "/icon/power_on.png" : "/icon/power_off.png";
      },
    };

     // app/dashboard/page.tsx (상단 import 아래)
     type RobotRow = {
      no: string;
      battery: number; // 0~100
      isCharging: boolean; // ✅ 충전 중 여부
      status: 'Online' | 'Offline' | 'Error';
      locate: 'Yes' | 'No';
      power: 'On' | 'Off';
    };

    const robotRows: RobotRow[] = [
      { no: 'Robot 1', battery: 100, isCharging: false, status: 'Online',  locate: 'Yes', power: 'On' },
      { no: 'Robot 2', battery: 30, isCharging: false,    status: 'Error',  locate: 'Yes', power: 'On' },
      { no: 'Robot 3', battery: 15, isCharging: true, status: 'Offline', locate: 'No',  power: 'Off' },
    ];

  
    // 상단 타입 선언
    type NoticeType = 'Notice' | 'Schedule' | 'Emergency' | 'Emerg' | 'Robot';
    type TabKey = 'total' | 'schedule' | 'emergency' | 'robot';

    interface Notice {
      no: number;
      type: NoticeType;
      content: string;
    }

    type NoticesMap = Record<TabKey, Notice[]>;

    // tabs, notices 타이핑
    const tabs: { id: TabKey; label: string }[] = [
      { id: 'total', label: 'Total' },
      { id: 'schedule', label: 'Schedule' },
      { id: 'emergency', label: 'Emergency' },
      { id: 'robot', label: 'Robot Status' },
    ];

    const notices: NoticesMap = {
      total: [
        { no: 1, type: 'Notice', content: '병원 경영시스템에서 받아는 시스템결함 전파 공지입니다.' },
        { no: 2, type: 'Schedule', content: '병원 방역 일정 공지 - 11,27일 병원 1동, 2동 전체 방역 예정입니다.' },
        { no: 3, type: 'Emerg', content: '병원 2022 병원 A23 환자(홍길동) 환자에 투약 긴급 차량' },
        { no: 4, type: 'Robot', content: 'Robot 1 로봇에서 이상 점검, Robot 2 2F 병원 환자에게 분실 중' }
      ],
      schedule: [{ no: 2, type: 'Schedule', content: '병원 방역 일정 공지 - 11,27일 병원 1동, 2동 전체 방역 예정입니다.' }],
      emergency: [{ no: 3, type: 'Emerg', content: '병원 2022 병원 A23 환자(홍길동) 환자에 투약 긴급 차량' }],
      robot: [{ no: 4, type: 'Robot', content: 'Robot 1 로봇에서 이상 점검, Robot 2 2F 병원 환자에게 분실 중' }],
    };

    // 상태도 TabKey로
    const [activeTab, setActiveTab] = useState<TabKey>('total');

    // 타입을 CSS 클래스 슬러그로 변환
    const toTypeSlug = (t?: string) => {
      const v = (t ?? '').toLowerCase();
      if (v.startsWith('emerg')) return 'emerg';   // Emergency / Emerg 모두 매칭
      return v; // notice, schedule, robot
    };
  

   return (

      <div className='container-grid'>

        {/* Robot Real-time Camera */}
        <div className='top-common-div'>
          <div className='top-div'>
              <div className='title-div'>
                <div>
                    <img src="/icon/camera_w.png" alt="camera" />
                </div>
                <p>Robot Real-time Camera</p>
              </div>
              <button type='button' className='camera-btn' onClick={() => setCameraIsModalOpen(true)}>+</button>
          </div>
          <div className='middle-div'>
            <div className='view-div'>
              <div className='view-box'>
                {/* <img src={robotCurrentImage} alt="sample" />   */}
                <iframe src={cameraStream} allow="autoplay; fullscreen; " className="video-box"/>
              </div>
              <div className='view-button'>
                {cameras.map((cam, idx) => (
                  <button type='button' key={idx} className={`${cameraTabActiveIndex === idx ? "active" : ""}`}  onClick={() => handleCameraTab(idx, cam.id)} aria-pressed={cameraTabActiveIndex === idx}>{cam.label}</button>
                ))}
              </div>
            </div>
          </div>
          <div className='bottom-div'>
            <div className='robot-chk-btn'>
              {robotTabs.map((item, idx) => (
                  <button type='button' key={idx} className={`${robotActiveIndex === idx ? "active" : ""}`}  onClick={() => setRobotActiveIndex(idx)} aria-pressed={robotActiveIndex === idx}>{item.label}</button>
              ))}
            </div>
            <button type='button' className='remote-div'>
              <div className='remote-icon'>
                <img src="/icon/robot_control_w.png" alt="robot path" />
              </div>
              <div>Remote Control</div>
            </button>
          </div>
        </div>
        {/* <CameraModal isOpen={cameraIsModalOpen} onClose={() => setCameraIsModalOpen(false)}/> */}

        {/* Robot Location */}
        <div className='top-common-div'>
          <div className='top-div'>
              <div className='title-div'>
                <div>
                    <img src="/icon/map_w.png" alt="map" />
                </div>
                <p>Robot Location</p>
              </div>
              <button type='button' onClick={() => setMapIsModalOpen(true)}>+</button>
          </div>
          <div className='middle-div'>
            <div className='view-div'>
              {/* <div className='view-box'> */}
              <div
                ref={wrapperRef}
                className="view-box"
                style={{
                  overflow: "hidden",
                  userSelect: "none",
                  touchAction: "none",
                  cursor: scale > 1 ? (isPanning ? "grabbing" : "grab") : "default",
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={endPan}
                onMouseLeave={endPan}
              >
                {/* <img src={mapCurrentImage} alt="sample" style={{ transform: `scale(${scale})`, transformOrigin: "center center", transition: "transform 0.3s ease", }} />  */}
                <img
                  ref={imgRef}
                  src={mapCurrentImage}
                  alt="map"
                  draggable={false}
                  style={{
                    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                    transformOrigin: "center center",
                    transition: isPanning ? "none" : "transform 120ms ease"
                    // 이미지 자신이 마우스 이벤트를 가로채지 않게 하려면 다음 줄을 켜도 됩니다
                    // pointerEvents: "none",
                  }}
                />
              </div>
              <div className='map-button'>
                {optionItems.map((item, idx) => (
                  <button type='button' key={idx} className="zoom-icon" onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)} onClick={() => handleZoom(item.action)}>
                    <div className={`${item.icon}-icon`}>
                        <img src={ hoveredIndex === idx ? `/icon/${item.icon}_d.png` : `/icon/${item.icon}_w.png`} alt={item.label}/>
                    </div>
                    {item.label}
                  </button>
                ))}
              </div> 
            </div>
          </div>
          <div className='bottom-div'>
            <div className='floor-btn'>
              {floorTabs.map((item, idx) => (
                  <button type='button' key={idx} className={`${floorActiveIndex === idx ? "active" : ""}`}  onClick={() => setFloorActiveIndex(idx)} aria-pressed={floorActiveIndex === idx}>{item.label}</button>
              ))}
            </div>
            <button type='button' className='path-div'>
              <div className='path-icon'>
                <img src="/icon/path_w.png" alt="robot path" />
              </div>
              <div>Robot Path</div>
            </button>
          </div>
        </div>
        {/* <RemoteModal isOpen={mapIsModalOpen} onClose={() => setMapIsModalOpen(false)}/> */}

        {/* Robot Status */}
        <div className='bottom-common-div status'>
          <div className='top-div'>
              <div className='title-div'>
                <div>
                    <img src="/icon/robot_status_w.png" alt="robot_status" />
                </div>
                <p>Robot Status</p>
              </div>
              <button type='button' onClick={() => handleRoute("robot")}>+</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Robot NO</th>
                <th>Battery</th>
                <th>Status</th>
                <th>Locate</th>
                <th>Power</th>
              </tr>
            </thead>
            <tbody>
              {robotRows.map((r, idx) => (
                  <tr key={r.no} onClick={() => handleRoute("robot")}>
                    <td>
                      <div className={`robot_status_icon_div robot-color-${idx + 1}`}>
                        <img src={`/icon/robot_location(${idx + 1}).png`} alt={`robot_location`}/>
                        <img src={`/icon/robot_icon(${idx + 1}).png`} alt={`robot_icon`}/>
                        {r.no}
                      </div>
                    </td>
                    <td>
                      <div className="robot_status_icon_div">
                        <img src={icons.battery(r.battery)} alt="battery" />
                        {r.battery}%
                      </div>
                    </td>
                    <td>
                      <div className="robot_status_icon_div">
                        <img src={icons.status(r.status)} alt="status" />
                        {r.status}
                      </div>
                    </td>
                    <td>
                      <div className="robot_status_icon_div">
                        <img src={icons.locate(r.locate)} alt="locate" />
                        {r.locate}
                      </div>
                    </td>
                    <td>
                      <div className="robot_status_icon_div">
                        <img src={icons.power(r.power)} alt="power" />
                        {r.power}
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* Notice & Alert */}
        <div className='bottom-common-div notice'>
          <div className='top-div'>
              <div className='title-div'>
                <div>
                  <img src="/icon/notice_w.png" alt="notice&Alert" />
                </div>
                <p>Notice & Alert</p>
              </div>
              <button type='button' onClick={() => handleRoute("setting")}>+</button>
          </div>
          <div className="tab-buttons">
            {tabs.map(tab => (
              <button type='button' key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="notice-list">
          {notices[activeTab].map((notice: Notice, index: number) => {
            const slug = toTypeSlug(notice.type); // 'notice' | 'schedule' | 'emerg' | 'robot'
            
            return (
              <div key={index} onClick={() => handleRoute("setting")} className="notice-item">
                <div>
                  <span className={`badge badge--${slug}`}>{notice.type}</span>
                  <span className="new">new</span>
                  <p className="content">{notice.content}</p>
                </div>
                <span>2025-11-11  15:00</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
   );
}