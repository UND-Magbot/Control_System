'use client';

import styles from './ScheduleCrud.module.css';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { RobotRowData } from '@/app/type';
import repeatConfirmModal from './repeatConfirmModal';
import { useCustomScrollbar } from '@/app/hooks/useCustomScrollbar';

type DetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    event: {
      id: string;
      title: string;
    };
};

type ScheduleDetailProps = {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    robotNo: string;
    robotType: string;
    dayIndex: number;
    startMin: number;
    endMin: number;
    color?: "green" | "yellow" | "blue" | "red";
  };
};

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
    event,
}:DetailModalProps ){
    
    const [showConfirm, setShowConfirm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedAmpm, setSelectedAmpm] = useState<string>("오전");


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
    
    return (
        <>
            <div className={styles.scheduleModalOverlay} onClick={onClose}>
                <div className={styles.scheduleModalContainer} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.CloseBtn} onClick={onClose}>✕</button>
                    <div className={styles.Title}>
                        <div className={styles.TitleCircle}></div>
                        <h2>순찰/보안</h2>
                    </div>
                    <div className={styles.itemContainer}>
                        <div className={styles.itemBox}>
                            <div className={styles.itemtitle}>로봇명</div>
                            <div className={styles.itemDetail}>Robot 1</div>
                        </div>

                        <div className={styles.itemBox}>
                            <div className={styles.itemtitle}>작업명</div>
                            <div className={styles.itemDetail}>Robot 1, 5층 순찰 및 보안 작업 실시</div>
                        </div>
                        
                        <div className={styles.itemBox}>
                            <div className={styles.itemtitle}>작업기간</div>
                            <div className={styles.itemDetail}>2025.12.12 - 반복</div>
                        </div>

                        <div className={styles.itemBox}>
                            <div className={styles.itemtitle}>작업요일</div>
                            <div className={styles.itemDetail}>월, 화, 수</div>
                        </div>

                        <div className={styles.itemBox}>
                            <div className={styles.itemtitle}>작업시간</div>
                            <div className={styles.itemDetail}>오전 09:30 ~ 오후 05:30</div>
                        </div>
                        
                        <div className={styles.itemBox}>
                            <div className={styles.itemtitle}>작업경로</div>
                            <div className={styles.itemDetail}>경로명 F1</div>
                        </div>

                        <div className={styles.itemPathBox}>
                            <div className={styles.itemtitle}>경로순서</div>
                            <div className={styles.itemPath}>
                                <div className={styles.itemScroll}>
                                    병원입구 - 데스크 - 1층 복도 - 대합실 - 105동 - 106동 - 데스크 - 1층 복도 - 병원입구
                                </div>
                            </div>
                        </div>

                        <div className={styles.itemBox}>
                            <div className={styles.itemtitle}>수정 일시</div>
                            <div className={styles.itemDetail}>2025.12.11 오전 08:35:40</div>
                        </div>
                    </div>
                    <div className={styles.btnTotal}>
                        <div className={styles.btnLeftBox}>
                        <button
                            type="button"
                            className={`${styles.btnItemCommon} ${styles.btnBgGray} ${styles.mr10}`}
                            onClick={handleDelete}
                        >
                            <img src="/icon/delete_icon.png" alt="delete" />
                            <span>삭제</span>
                        </button>

                        <button
                            type="button"
                            className={`${styles.btnItemCommon} ${styles.btnBgGray}`}
                            onClick={() => {
                            // 기존 handleUdate가 수정모드 진입 역할이라면 그대로 호출
                            // handleUdate 안에서 setIsEditMode(true) 처리 권장
                            handleUdate?.();
                            // 만약 handleUdate가 setIsEditMode(true)를 안 한다면 아래 한 줄 추가
                            // setIsEditMode(true);
                            }}
                        >
                            <img src="/icon/edit_icon.png" alt="edit" />
                            <span>수정</span>
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
    
}