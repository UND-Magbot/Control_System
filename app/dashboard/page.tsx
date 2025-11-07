'use client';

import './style.css';
import React from 'react';
import { useState, useEffect } from 'react';
import CameraModal from './CameraModal';
import RemoteModal from '../robot/RemoteModal';

export default function DashboardPage() {

    const [cameraIsModalOpen, setCameraIsModalOpen] = useState(false);
    const [mapIsModalOpen, setMapIsModalOpen] = useState(false);
    const [scale, setScale] = useState(1);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [cameraTabActiveIndex, setCameraTabActiveIndex] = useState<number>(0);
    const [mapTabActiveIndex, setMapTabActiveIndex] = useState<number | null>(0);
    const [robotActiveIndex, setRobotActiveIndex] = useState<number>(0);
    const [floorActiveIndex, setFloorActiveIndex] = useState<number>(0);
    const [robotCurrentImage, setRobotCurrentImage] = useState<string>("0");

    const viewItems = [
      { label: "Main Camera" },
      { label: "Sub Camera" },
    ];

   
    const optionItems = [
      { icon: "zoom_in", label: "Zoom In", action: "in" },
      { icon: "zoom_out", label: "Zoom Out", action: "out" }
    ];

    const handleZoom = (action: string) => {
      setMapTabActiveIndex(optionItems.findIndex(item => item.action === action));
    
      // 확대/축소 단계 (최대 3배, 최소 1배 이하 불가)
      setScale(prev => {
        let newScale = prev;
    
        if (action === 'in') {
          newScale = Math.min(prev + 0.2, 3); // 최대 3배까지
        } else if (action === 'out') {
          newScale = Math.max(prev - 0.2, 1); // 원본 크기 이하로 축소 불가
        } else if (action === 'reset') {
          newScale = 1; // 원래 크기로 복원
        }
    
        return newScale;
      });
    };

  // 🔹 탭이 변경될 때 확대/축소 초기화
  // ✅ 층 탭(mapTabActiveIndex) 변경 시 확대 상태 초기화
  useEffect(() => {
    setScale(1);
    setMapTabActiveIndex(null);
  }, [floorActiveIndex]);

    const robotTabs = [
      { label: "Robot 1" },
      { label: "Robot 2" },
      { label: "Robot 3" }
    ];


    // 로봇별 카메라 이미지 데이터
    const robotImages = [
      {
        name: 'Robot A',
        cameras: [
          "/images/camera_sample.png",
          '/images/robotA_main.png',
          '/images/robotA_sub.png',
        ],
      },
      {
        name: 'Robot B',
        cameras: [
          "/images/camera_sample.png",
          '/images/robotB_main.png',
          '/images/robotB_sub.png',
        ],
      },
      {
        name: 'Robot C',
        cameras: [
          "/images/camera_sample.png",
          '/images/robotC_main.png',
          '/images/robotC_sub.png',
        ],
      },
    ];

    // 로봇 변경 시 이미지 업데이트
    useEffect(() => {
      setRobotCurrentImage(robotImages[robotActiveIndex].cameras[cameraTabActiveIndex]);
    }, [robotActiveIndex, cameraTabActiveIndex]);

    // 카메라 탭 클릭 핸들러
    const handleCameraTab = (idx: number) => {
      setCameraTabActiveIndex(idx);
      setRobotCurrentImage(robotImages[robotActiveIndex].cameras[idx]);
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
    const mapCurrentImage = floorImages[floorActiveIndex];

    // 아이콘 매핑 객체
    const icons = {
      robot: (status: string) => {
        switch (status) {
          case "robot1":
            return "/icon/robot_icon(1).png";
          case "이동":
            return "/icon/robot_icon(2).png";
          case "작업중":
            return "/icon/robot_icon(3).png";
          default:
            return "/icon/robot_default.png";
        }
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
        if (status === "Charging") return "/icon/status(2).png";
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
      status: 'Online' | 'Offline' | 'Charging';
      locate: 'Yes' | 'No';
      power: 'On' | 'Off';
    };

    const robotRows: RobotRow[] = [
      { no: 'Robot 1', battery: 100, isCharging: false, status: 'Online',  locate: 'Yes', power: 'On' },
      { no: 'Robot 2', battery: 30, isCharging: false,    status: 'Online',  locate: 'Yes', power: 'On' },
      { no: 'Robot 3', battery: 15, isCharging: true, status: 'Offline', locate: 'No',  power: 'Off' },
    ];

  
    // 상단 타입 선언
    type NoticeType = 'Notice' | 'Schedule' | 'Emergency' | 'Emerg' | 'Robot';
    type TabKey = 'total' | 'schedule' | 'emergency' | 'robot';

    interface Notice {
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
        { type: 'Notice', content: '병원 경영시스템에서 받아는 시스템결함 전파 공지입니다.' },
        { type: 'Schedule', content: '병원 방역 일정 공지 - 11,27일 병원 1동, 2동 전체 방역 예정입니다.' },
        { type: 'Emerg', content: '병원 2022 병원 A23 환자(홍길동) 환자에 투약 긴급 차량' },
        { type: 'Robot', content: 'Robot 1 로봇에서 이상 점검, Robot 2 2F 병원 환자에게 분실 중' }
      ],
      schedule: [{ type: 'Schedule', content: '병원 방역 일정 공지 - 11,27일 병원 1동, 2동 전체 방역 예정입니다.' }],
      emergency: [{ type: 'Emerg', content: '병원 2022 병원 A23 환자(홍길동) 환자에 투약 긴급 차량' }],
      robot: [{ type: 'Robot', content: 'Robot 1 로봇에서 이상 점검, Robot 2 2F 병원 환자에게 분실 중' }],
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
                <img src={robotCurrentImage} alt="sample" />  
              </div>
              <div className='view-button'>
                {viewItems.map((item, idx) => (
                  <button type='button' key={idx} className={`${cameraTabActiveIndex === idx ? "active" : ""}`}  onClick={() => handleCameraTab(idx)} aria-pressed={cameraTabActiveIndex === idx}>{item.label}</button>
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
        <CameraModal isOpen={cameraIsModalOpen} onClose={() => setCameraIsModalOpen(false)}/>

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
              <div className='view-box'>
                <img src={mapCurrentImage} alt="sample" style={{ transform: `scale(${scale})`, transformOrigin: "center center", transition: "transform 0.3s ease", }} /> 
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
        <RemoteModal isOpen={mapIsModalOpen} onClose={() => setMapIsModalOpen(false)}/>

        {/* Robot Status */}
        <div className='bottom-common-div status'>
          <div className='top-div'>
              <div className='title-div'>
                <div>
                    <img src="/icon/robot_status_w.png" alt="robot_status" />
                </div>
                <p>Robot Status</p>
              </div>
              <button type='button'>+</button>
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
                  <tr key={r.no}>
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
              <button type='button'>+</button>
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
              <div key={index} className="notice-item">
                <span className={`badge badge--${slug}`}>{notice.type}</span>
                <p className="content">{notice.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
   );
}