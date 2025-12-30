'use client';

import styles from './ScheduleCrud.module.css';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { RobotRowData } from '@/app/type';
import repeatConfirmModal from './repeatConfirmModal';
import { useCustomScrollbar } from '@/app/hooks/useCustomScrollbar';

type InsertModalProps = {
    isOpen: boolean;
    onClose: () => void;
    robots: RobotRowData[];
}

// 작업유형
export type WorkType = {
  id: number;
  label: string;
};

const WORK_TYPES: WorkType[] = [
  { id: 1, label: "환자 모니터링" },
  { id: 2, label: "순찰 / 보안" },
  { id: 3, label: "물품 / 약품 운반" },
];

// 작업상태
export type WorkStatus = {
  id: number;
  label: string;
};

const WORK_STATUS: WorkStatus[] = [
  { id: 1, label: "대기" },
  { id: 2, label: "진행중" },
  { id: 3, label: "완료" },
  { id: 4, label: "취소" },
];

// 오전 / 오후
const AMPM = ["오전", "오후"];

// 시 / 분
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1~12
const MINUTES = ["00", "10", "20", "30", "40", "50"];

export default function InsertModal({
    isOpen,
    onClose,
    robots
}:InsertModalProps ){
    
    const [showConfirm, setShowConfirm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedAmpm, setSelectedAmpm] = useState<string>("오전");

    // 로봇명 선택
    const [isRobotOpen, setIsRobotOpen] = useState(false);
    const robotWrapperRef = useRef<HTMLDivElement>(null);
    const [selectedRobot, setSelectedRobot] = useState<RobotRowData | null>(null);
    const [activeRobotIndex, setActiveRobotIndex] = useState<number>(0);

    const robotScrollRef = useRef<HTMLDivElement>(null);
    const robotTrackRef = useRef<HTMLDivElement>(null);
    const robotThumbRef = useRef<HTMLDivElement>(null);
    
    // 작업유형 선택
    const [isWorkTypeOpen, setIsWorkTypeOpen] = useState(false);
    const workTypeWrapperRef = useRef<HTMLDivElement>(null);
    const [selectedWorkType, setSelectedWorkType] = useState<WorkType | null>(null);

    const workTypeScrollRef = useRef<HTMLDivElement>(null);
    const workTypeTrackRef = useRef<HTMLDivElement>(null);
    const workTypeThumbRef = useRef<HTMLDivElement>(null);
    
    // 오전/오후 선택
    const [isWorkTimeOpen, setIsWorkTimeOpen] = useState(false);
    const workTimeWrapperRef = useRef<HTMLDivElement>(null);
    const [selectedWorkTime, setSelectedWorkTime] = useState<RobotRowData | null>(null);

    const timeScrollRef = useRef<HTMLDivElement>(null);
    const timeTrackRef = useRef<HTMLDivElement>(null);
    const timeThumbRef = useRef<HTMLDivElement>(null);
    
    // 시 선택
    const [isWorkHourOpen, setIsWorkHourOpen] = useState(false);
    const workHourWrapperRef = useRef<HTMLDivElement>(null);
    const [selectedWorkHour, setSelectedWorkHour] = useState<RobotRowData | null>(null);

    const hourScrollRef = useRef<HTMLDivElement>(null);
    const hourTrackRef = useRef<HTMLDivElement>(null);
    const hourThumbRef = useRef<HTMLDivElement>(null);
    
    // 분 선택
    const [isWorkMinOpen, setIsWorkMinOpen] = useState(false);
    const workMinWrapperRef = useRef<HTMLDivElement>(null);
    const [selectedWorkMin, setSelectedWorkMin] = useState<RobotRowData | null>(null);

    const minScrollRef = useRef<HTMLDivElement>(null);
    const minTrackRef = useRef<HTMLDivElement>(null);
    const minThumbRef = useRef<HTMLDivElement>(null);

    // 작업상태 선택
    const [isWorkStatusOpen, setIsWorkStatusOpen] = useState(false);
    const workStatusWrapperRef = useRef<HTMLDivElement>(null);
    const [selectedWorkStatus, setSelectedWorkStatus] = useState<RobotRowData | null>(null);

    const statusScrollRef = useRef<HTMLDivElement>(null);
    const statusTrackRef = useRef<HTMLDivElement>(null);
    const statusThumbRef = useRef<HTMLDivElement>(null);
    
    // 작업경로 선택
    const [isWorkPathOpen , setIsWorkPathOpen] = useState(false);
    const workPathWrapperRef = useRef<HTMLDivElement>(null);
    const [selectedWorkPath, setSelectedWorkPath] = useState<RobotRowData | null>(null);

    const pathScrollRef = useRef<HTMLDivElement>(null);
    const pathTrackRef = useRef<HTMLDivElement>(null);
    const pathThumbRef = useRef<HTMLDivElement>(null);

    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // 스크롤 방지
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);


    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (
                robotWrapperRef.current &&
                !robotWrapperRef.current.contains(e.target as Node)
            ) {
                setIsRobotOpen(false);
            }

            if (
                workTypeWrapperRef.current &&
                !workTypeWrapperRef.current.contains(e.target as Node)
            ) {
                setIsWorkTypeOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const handleSelectRobot = (robot: RobotRowData) => {
        setSelectedRobot(robot);
        setIsRobotOpen(false);
    };
    
      useCustomScrollbar({
        enabled: isRobotOpen,
        scrollRef: robotScrollRef,
        trackRef: robotTrackRef,
        thumbRef: robotThumbRef,
        minThumbHeight: 50,
        deps: [robots.length],
      });

      useCustomScrollbar({
        enabled: isWorkTypeOpen,
        scrollRef: workTypeScrollRef,
        trackRef: workTypeTrackRef,
        thumbRef: workTypeThumbRef,
        minThumbHeight: 50,
        deps: [WORK_TYPES.length],
      });
        
    if (!isOpen) return null;

    // 삭제 버튼 클릭 핸들러
    const handleDelete = () => {
      setShowConfirm(true);   // 커스텀 confirm 열기
    };
  
    // 삭제 재 확인 창 - confirm 창에서 확인 눌렀을 때
    const handleConfirmOk = () => {
      setShowConfirm(false);
      onClose();
    };
  
     // 삭제 재 확인 창 - confirm 창만 닫기
    const handleConfirmCancel = () => {
      setShowConfirm(false);
    };
 
    const handleUdate = () => {
        setIsEditMode(true);
        console.log("수정되었습니다.");
    };

    
    const handleCancel = () => {
        onClose();
    };
      
    const handleSave = () => {
        onClose();
    };

    return (
        <>
            <div className={styles.scheduleModalOverlay} onClick={onClose}>
                <div className={styles.scheduleModalContainer} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.CloseBtn} onClick={onClose}>✕</button>
                    <div className={styles.Title}>
                        <img src="/icon/robot_schedule_w.png" alt="Robot Registeration" />
                        <h2>작업일정 등록</h2>
                    </div>
                    <div className={styles.itemContainer}>
                        <div className={styles.itemBox}>
                            <div>로봇명</div>
                            <div ref={robotWrapperRef} className={`${styles.seletWrapper}`}>
                                <div className={styles.itemSelectBox} onClick={() => setIsRobotOpen(!isOpen)}>
                                    <span>{selectedRobot?.no ?? "로봇명 선택"}</span>
                                    <img src="/icon/arrow_down.png" alt="arrow_down" />
                                </div> 
                                {isRobotOpen && (
                                    <div className={styles.seletbox}>
                                        <div ref={robotScrollRef} className={styles.inner} role="listbox">
                                        {robots.map((robot, idx) => (
                                            <div key={robot.id} className={`${styles.robotsLabel} ${ activeRobotIndex === idx ? styles["active"] : "" }`.trim()}
                                            onClick={() => handleSelectRobot(robot)}>{robot.no}
                                            </div>
                                        ))}
                                        </div>

                                        <div ref={robotTrackRef} className={styles.scrollTrack}>
                                            <div ref={robotThumbRef} className={styles.scrollThumb} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.itemBox}>
                            <div>작업명</div>
                            <input type="text" placeholder='25자(50byte) 이내로 작성하세요' />
                        </div>
                        
                        <div className={styles.itemBox}>
                            <div>작업유형</div>

                            <div ref={workTypeWrapperRef} className={styles.seletWrapper}>
                                <div
                                className={styles.itemSelectBox}
                                onClick={() => setIsWorkTypeOpen((v) => !v)}
                                >
                                    <span>{selectedWorkType?.label ?? "작업유형 선택"}</span>
                                    <img
                                        src={isWorkTypeOpen ? "/icon/arrow_up.png" : "/icon/arrow_down.png"}
                                        alt=""
                                    />
                                </div>

                                {isWorkTypeOpen && (
                                <div className={styles.seletbox}>
                                    <div ref={workTypeScrollRef} className={styles.inner}>
                                    {WORK_TYPES.map((type) => (
                                        <div
                                        key={type.id}
                                        className={styles.robotsLabel}
                                        onClick={() => {
                                            setSelectedWorkType(type);
                                            setIsWorkTypeOpen(false);
                                        }}
                                        >
                                        {type.label}
                                        </div>
                                    ))}
                                    </div>

                                    <div ref={workTypeTrackRef} className={styles.scrollTrack}>
                                    <div ref={workTypeThumbRef} className={styles.scrollThumb} />
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.itemBox}>
                            <div>작업일시</div>
                            <div className={styles.itemDateBox}>
                                <div>시작</div>
                                <div className={styles.itemDate}>
                                    2025-12-12
                                    <img src="/icon/search_calendar.png" alt="" />
                                </div>
                                <div className={styles.itemAmPm}>
                                    오전
                                    <img src="/icon/arrow_down.png" alt="" />
                                </div>
                                <div className={styles.itemHour}>
                                    09
                                    <img src="/icon/arrow_down.png" alt="" />
                                </div>
                                <div className={styles.itemMinute}>
                                    00
                                    <img src="/icon/arrow_down.png" alt="" />
                                </div>
                            </div>
                        </div>
                        <div className={styles.itemBox}>
                            <div></div>
                            <div className={styles.itemDateBox}>
                                <div>종료</div>
                                <div className={styles.itemDate}>
                                    2025-12-12
                                    <img src="/icon/search_calendar.png" alt="" />
                                </div>
                                <div className={styles.itemAmPm}>
                                    오전
                                    <img src="/icon/arrow_down.png" alt="" />
                                </div>
                                <div className={styles.itemHour}>
                                    09
                                    <img src="/icon/arrow_down.png" alt="" />
                                </div>
                                <div className={styles.itemMinute}>
                                    00
                                    <img src="/icon/arrow_down.png" alt="" />
                                </div>
                            </div>
                        </div>

                        <div className={styles.itemBox}>
                            <div>작업상태</div>
                            <div ref={workPathWrapperRef} className={`${styles.seletWrapper} ${styles.itemLeftMg}`}>
                                <div
                                className={styles.itemSelectBox}
                                onClick={() => setIsWorkTypeOpen((v) => !v)}
                                >
                                    {/* <span>{selectedWorkPath?.label ?? "작업유형 선택"}</span> */}
                                    <span>작업상태를 선택하세요</span>
                                    <img
                                        src={isWorkPathOpen ? "/icon/arrow_up.png" : "/icon/arrow_down.png"}
                                        alt=""
                                    />
                                </div>

                                {isWorkPathOpen && (
                                    <div className={styles.seletbox}>
                                        <div ref={workTypeScrollRef} className={styles.inner}>
                                            {WORK_TYPES.map((type) => (
                                                <div
                                                key={type.id}
                                                className={styles.robotsLabel}
                                                onClick={() => {
                                                    setSelectedWorkType(type);
                                                    setIsWorkTypeOpen(false);
                                                }}
                                                >
                                                {type.label}
                                                </div>
                                            ))}
                                        </div>

                                        <div ref={workTypeTrackRef} className={styles.scrollTrack}>
                                            <div ref={workTypeThumbRef} className={styles.scrollThumb} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.itemRadioBox}>
                            <div>반복설정</div>
                            <div className={`${styles.radioBtnFlex} ${styles.itemLeftMg}`}>
                                <div className={styles.radioBtnBox}>
                                    <img src="/icon/place_chk.png" alt="" />
                                    <span>반복</span>
                                </div>
                                <div className={styles.radioBtnBox}>
                                    <img src="/icon/place_none_chk.png" alt="" />
                                    <span>반복 안함</span>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.itemBox} ${styles.pathBox}`}>
                            <div>작업경로</div>
                            <div ref={workPathWrapperRef} className={styles.seletWrapper}>
                                <div
                                className={styles.itemSelectBox}
                                onClick={() => setIsWorkTypeOpen((v) => !v)}
                                >
                                    {/* <span>{selectedWorkPath?.label ?? "작업유형 선택"}</span> */}
                                    <span>경로명을 선택하세요</span>
                                    <img
                                        src={isWorkPathOpen ? "/icon/arrow_up.png" : "/icon/arrow_down.png"}
                                        alt=""
                                    />
                                </div>

                                {isWorkPathOpen && (
                                <div className={styles.seletbox}>
                                    <div ref={workTypeScrollRef} className={styles.inner}>
                                    {WORK_TYPES.map((type) => (
                                        <div
                                        key={type.id}
                                        className={styles.robotsLabel}
                                        onClick={() => {
                                            setSelectedWorkType(type);
                                            setIsWorkTypeOpen(false);
                                        }}
                                        >
                                        {type.label}
                                        </div>
                                    ))}
                                    </div>

                                    <div ref={workTypeTrackRef} className={styles.scrollTrack}>
                                    <div ref={workTypeThumbRef} className={styles.scrollThumb} />
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.pathBoxFlex}>
                            <div></div>
                            <button className={`${styles.itemBoxBtn} ${styles.itemLeftMg}`}>작업경로 등록 화면  →</button>
                        </div>
                                

                    </div>
                    <div className={styles.insertBtnTotal}>
                        <div className={`${styles.insertConfrimBtn} ${styles.btnBgRed}`} onClick={handleCancel} >
                            <img src="/icon/close_btn.png" alt="cancel"/>
                            <div>취소</div>
                        </div>
                        <div className={`${styles.insertConfrimBtn} ${styles.btnBgBlue}`}  onClick={handleSave}>
                            <img src="/icon/check.png" alt="save" />
                            <div>저장</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
    
}