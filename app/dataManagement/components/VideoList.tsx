"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './VideoList.module.css';
import Pagination from "@/app/components/pagination";
import Calendar from "@/app/components/Calendar";
import type { RobotRowData, Camera, Video, VideoItem, DtItem, Period } from '@/app/type';

const PAGE_SIZE = 8;

interface VideoListProps {
  cameras: Camera[];
  robots: RobotRowData[];
  video: Video[];
  videoData: VideoItem[];
}

export default function VideoList({ videoData, robots, video }:VideoListProps) {


    const [videoActiveIndex, setVideoActiveIndex] = useState<number | null>(null);
    const [robotActiveIndex, setRobotActiveIndex] = useState<number | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [selectedRobot, setSelectedRobot] = useState<RobotRowData | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

    const [searchFilterData, setSearchFilterData] = useState<VideoItem[]>(videoData);

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"video" | "dt">("video");

    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [isRobotOpen, setIsRobotOpen] = useState(false);
    const videoWrapperRef = useRef<HTMLDivElement>(null);
    const robotWrapperRef = useRef<HTMLDivElement>(null);

    
    // 탭별 페이지 상태
    const [videoPage, setVideoPage] = useState(1);
    const [dtPage, setDtPage] = useState(1);

    const dtData:DtItem[] = [];

    // 현재 탭에 따라 참조할 데이터/페이지 선택
    const currentPage = activeTab === "video" ? videoPage : dtPage;
    const currentData = activeTab === "video" ? searchFilterData   : dtData;

    // 현재 탭 기준으로 totalItems 계산
    const totalItems = currentData.length;
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const currentItems = currentData.slice(startIndex, startIndex + PAGE_SIZE);

    const handleTabClick = (tab: "video" | "dt") => {
        setActiveTab(tab);
    
        if (tab === "video") {
        setVideoPage(1);
        } else {
        setDtPage(1);
        }
    };

    const handlePeriodClick = (period: Period) => {
    setSelectedPeriod(period);
    };

    // 그 위쪽 state 선언은 그대로 두고, 핸들러만 수정
    const videoStatusClick = (idx: number, option: Video) => {
        setVideoActiveIndex(idx);
        setSelectedVideo(option);        // ✅ 선택된 비디오 타입 저장
        setIsVideoOpen(false);
    };

    const robotStatusClick = (idx: number) => {
        setRobotActiveIndex(idx);
        const robot = robots[idx] ?? null;
        setSelectedRobot(robot);         // ✅ 선택된 로봇 저장
        setIsRobotOpen(false);
    };
  
    const formatVideoTime = (time: string) => {
        const [hh, mm, ss] = time.split(":").map(Number);
    
        let result = "";
    
        if (hh > 0) result += `${hh}h `;
        if (mm > 0 || hh > 0) result += `${mm}m `;
        result += `${ss}s`;
    
        return result.trim();
    };

    const formatDate = (datetime: string) => {
        const date = new Date(datetime);
    
        const yyyy = date.getFullYear();
        const MM = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
    
        const hh = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");
        const ss = String(date.getSeconds()).padStart(2, "0");
    
        return `${yyyy}.${MM}.${dd} ${hh}:${mm}.${ss}`;
    };

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
          const target = e.target as Node;
      
          // 비디오 셀렉트 외부 클릭 → 닫기
          if (
            isVideoOpen &&
            videoWrapperRef.current &&
            !videoWrapperRef.current.contains(target)
          ) {
            setIsVideoOpen(false);
          }
      
          // 로봇 셀렉트 외부 클릭 → 닫기
          if (
            isRobotOpen &&
            robotWrapperRef.current &&
            !robotWrapperRef.current.contains(target)
          ) {
            setIsRobotOpen(false);
          }
        };
      
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [isVideoOpen, isRobotOpen]);

    // videoData가 새로 들어오면 초기화
    useEffect(() => {
    setSearchFilterData(videoData);
    }, [videoData]);

    useEffect(() => {
        // 비디오 타입/로봇 선택이 바뀔 때마다 1페이지로 이동
        setVideoPage(1);
    }, [selectedVideo, selectedRobot]);


  return (
    <>
    <div className={styles.videoListTab}>
        <div className={`${activeTab === "video" ? styles.active : ""}`} onClick={() => handleTabClick("video")}>Camera Recording Video</div>
        <div className={`${activeTab === "dt" ? styles.active : ""}`} onClick={() => handleTabClick("dt")}>Statistical Information</div>
    </div>

    {/* Camera Recording Video 화면 */}
    {activeTab === "video" && (
        <div className={styles.videoList}>
            <div>    
                <div className={styles.videoListTopPosition}>
                    <h2>Video List</h2>
                    <div className={styles.videoSearch}>
                        <div className={styles.videoSelect}>
                            <div ref={videoWrapperRef}>
                                <div className={styles.selete} 
                                    onClick={() => setIsVideoOpen(!isVideoOpen)}>
                                    <span>{selectedVideo?.label ?? "녹화 선택"}</span>
                                    {isVideoOpen ? (
                                    <img src="/icon/arrow_up.png" alt="arrow_up" />
                                    ) : (
                                    <img src="/icon/arrow_down.png" alt="arrow_down" />
                                    )}
                                </div> 
                                {isVideoOpen && (
                                    <div className={`${styles.seletboxCommon} ${styles.videoSeletbox}`}>
                                    {video.map((video, idx) => (
                                        <div key={video.id} className={`${ videoActiveIndex === idx ? styles["active"] : "" }`.trim()}
                                            onClick={() => videoStatusClick(idx, video)}>{video.label}
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </div>
                            <div ref={robotWrapperRef} >
                                <div className={styles.selete} 
                                    onClick={() => setIsRobotOpen(!isRobotOpen)}>
                                    <span>{selectedRobot?.no ?? "로봇 선택"}</span>
                                    {isRobotOpen ? (
                                    <img src="/icon/arrow_up.png" alt="arrow_up" />
                                    ) : (
                                    <img src="/icon/arrow_down.png" alt="arrow_down" />
                                    )}
                                </div> 
                                {isRobotOpen && (
                                    <div className={`${styles.seletboxCommon} ${styles.robotSeletbox}`}>
                                    {robots.map((robot, idx) => (
                                        <div key={robot.id} className={`${ robotActiveIndex === idx ? styles["active"] : "" }`.trim()}
                                        onClick={() => { robotStatusClick(idx) }}>{robot.no}</div>
                                    ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.videoPeriod}>
                            <div className={`${styles.PeriodItemL} ${selectedPeriod === '1week' ? styles.active : ''}`}
                                onClick={() => handlePeriodClick('1week')}>
                                1주
                            </div>
                            <div className={`${styles.PeriodItemM} ${selectedPeriod === '1month' ? styles.active : ''}`}
                                onClick={() => handlePeriodClick('1month')}>
                                1달
                            </div>
                            <div className={`${styles.PeriodItemR} ${selectedPeriod === '1year' ? styles.active : ''}`}
                                onClick={() => handlePeriodClick('1year')}>
                                1년
                            </div>
                        </div>
                        <Calendar videoData={videoData} selectedVideo={selectedVideo} selectedRobot={selectedRobot} onFilteredChange={setSearchFilterData} selectedPeriod={selectedPeriod} />
                        <div className={styles.videoExport}>내보내기</div>
                    </div>
                </div>
                <div className={styles.videoViewContainer}>
                    {currentItems.map((r, idx) => (
                        <div key={r.id} className={styles.videoViewItem}>
                            <div className={styles.videoViewBox}>
                                <div className={styles.videoView}>
                                    <img src="/images/camera_sample.png" alt="video" />
                                </div>
                                <div className={styles.videoViewIcon} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
                                    <img src={ hoveredIndex === idx ? `/icon/video_hover_icon.png` : `/icon/video_icon.png`} alt="play" />
                                </div>
                            </div>
                            <div className={styles.videoViewText}>
                                <div className={styles.videoViewTextL}>
                                    <div className={`${styles.nameBox} ${styles.RobotCamNameBox}`}>{r.robotNo}</div>
                                    <div className={`${styles.nameBox} ${styles.RobotCamNameBox}`}>{r.cameraNo}</div>
                                    <div className={`${styles.nameBox} ${styles.videoNameBox}`}>
                                        <div className={styles.cameratypeIcon}></div>
                                        <div>{r.cameraType}</div>
                                    </div>
                                </div>
                                <div className={styles.videoViewTextR}>
                                    <div className={styles.videoTextColor}>{formatVideoTime(r.videoTime)}</div>
                                    <div>{formatDate(r.date)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>      
            <div className={styles.pagenationPosition}>
                <Pagination   totalItems={totalItems}
  currentPage={currentPage}
  onPageChange={activeTab === "video" ? setVideoPage : setDtPage}
  pageSize={PAGE_SIZE}
  blockSize={5} />
            </div>
        </div>
    )}

    {/* Statistical Information 화면 */}
    {activeTab === "dt" && (
        <div className={styles.DT}>
            <div>

            </div>
            <div className={styles.pagenationPosition}>
                {/* <Pagination totalItems={totalItems} currentPage={currentPage} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} blockSize={5} /> */}
            </div>
        </div>
    )}
    </>
  );
}