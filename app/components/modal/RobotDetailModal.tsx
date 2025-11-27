'use client';

import styles from './Modal.module.css';
import React from 'react';
import { useState, useEffect  } from 'react';
import type { RobotRowData } from '@/app/type';
import CancelConfirmModal from '@/app/components/modal/CancelConfirmModal';

type DetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    selectedRobotId: number | null;
    selectedRobot: RobotRowData | null;
    robots: RobotRowData[];   
}

export default function RobotDetailModal({
    isOpen,
    onClose,
    selectedRobotId,
    selectedRobot,
    robots
}:DetailModalProps ){
    
    const [showConfirm, setShowConfirm] = useState(false);

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

    const handleDelete = () => {
      setShowConfirm(true);   // 커스텀 confirm 열기
    };
  
    const handleConfirmOk = () => {
      setShowConfirm(false);
      onClose();   // 최종 모달 닫기
    };
  
    const handleConfirmCancel = () => {
      setShowConfirm(false); // confirm 창만 닫기
    };

    

    const handleUdate = () => {
        // const confirmed = window.confirm("작업을 취소하시겠습니까?");
        // if (confirmed) {
            console.log("수정되었습니다.");
        // }
    };

    const handleCancel = () => {
        // const confirmed = window.confirm("작업을 취소하시겠습니까?");
        // if (confirmed) {
            onClose();  // 모달 닫기
        // }
    };
    
    const handleSave = () => {
        // 저장 처리 로직 (필요하면) 넣기
        console.log("저장되었습니다.");
        onClose();  // 모달 닫기
    };
    
    return (
        <>
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.detailModalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.detailCloseBtn} onClick={onClose}>✕</button>
                <div className={styles.detailTitle}>
                    <img src="/icon/robot_status_w.png" alt="Robot Registeration" />
                    <h2>Robot Information</h2>
                </div>
                <div className={`${styles.itemBoxContainer} ${styles.detailBoxFs}`}>

                {/* 1. Robot Type(Name) / Operator */}
                <div className={`${styles.detailRowItemBox} ${styles.btnBline}`}>
                    <div className={styles.detailItemBox}>
                    <div className={`${styles.itemTitleBox} ${styles.borderTl8}`}>
                        Robot Type(Name)
                    </div>
                    <div className={`${styles.itemContentBox} ${styles.lhUnset}`}>
                        {/* 예: Quadruped (Robot 1) */}
                        {selectedRobot
                        ? `${selectedRobot.group} (${selectedRobot.no})`
                        : "-"}
                    </div>
                    </div>

                    <div className={styles.detailItemBox}>
                    <div className={styles.itemTitleBox}>Operator</div>
                    <div className={`${styles.itemContentBox} ${styles.lhUnset} ${styles.borderTr8}`}>
                        {selectedRobot?.operator ?? "-"}
                    </div>
                    </div>
                </div>

                {/* 2. Serial Number / Model */}
                <div className={`${styles.detailRowItemBox} ${styles.btnBline}`}>
                    <div className={styles.detailItemBox}>
                    <div className={styles.itemTitleBox}>Serial Number</div>
                    <div className={`${styles.itemContentBox} ${styles.lhUnset}`}>
                        {selectedRobot?.serialNumber ?? "-"}
                    </div>
                    </div>

                    <div className={styles.detailItemBox}>
                    <div className={styles.itemTitleBox}>Model</div>
                    <div className={`${styles.itemContentBox} ${styles.lhUnset}`}>
                        {selectedRobot?.model ?? "-"}
                    </div>
                    </div>
                </div>

                {/* 3. Group / Software Version */}
                <div className={`${styles.detailRowItemBox} ${styles.btnBline}`}>
                    <div className={styles.detailItemBox}>
                    <div className={styles.itemTitleBox}>Group</div>
                    <div className={`${styles.itemContentBox} ${styles.lhUnset}`}>
                        {selectedRobot?.group ?? "-"}
                    </div>
                    </div>

                    <div className={styles.detailItemBox}>
                    <div className={styles.itemTitleBox}>Software Version</div>
                    <div className={`${styles.itemContentBox} ${styles.lhUnset}`}>
                        {selectedRobot?.softwareVersion ?? "-"}
                    </div>
                    </div>
                </div>

                {/* 4. Site / Robot Registration Date/Time */}
                <div className={styles.detailRowItemBox}>
                    <div className={styles.detailItemBox}>
                    <div className={`${styles.itemTitleBox} ${styles.borderBl8}`}>
                        Site
                    </div>
                    <div className={`${styles.itemContentBox} ${styles.lhUnset}`}>
                        {selectedRobot?.site ?? "-"}
                    </div>
                    </div>

                    <div className={styles.detailItemBox}>
                    <div className={`${styles.itemTitleBox} ${styles.lhUnset}`}>
                        <div>Robot Registration</div>
                        <div>Date/Time</div>
                    </div>
                    <div className={`${styles.itemContentBox} ${styles.lhUnset} ${styles.borderBr8}`}>
                        {selectedRobot?.registrationDateTime ?? "-"}
                    </div>
                    </div>
                </div>

                </div>
                <div className={styles.btnTotal}>
                    <div className={styles.btnLeftBox}>
                        <div className={`${styles.btnItemCommon} ${styles.btnBgGray} ${styles.mr10}`} onClick={handleDelete} >
                            <img src="/icon/delete_icon.png" alt="delete"/>
                            <div>Delete</div>
                        </div>
                        <div className={`${styles.btnItemCommon} ${styles.btnBgGray}`} onClick={handleUdate}>
                            <img src="/icon/edit_icon.png" alt="edit" />
                            <div>Edit</div>
                        </div>
                    </div>
                    <div className={styles.btnRightBox}>
                        <div className={`${styles.btnItemCommon} ${styles.btnBgRed}`} onClick={handleCancel} >
                            <img src="/icon/close_btn.png" alt="cancel"/>
                            <div>Cancel</div>
                        </div>
                        <div className={`${styles.btnItemCommon} ${styles.btnBgBlue}`}  onClick={handleSave}>
                            <img src="/icon/check.png" alt="save" />
                            <div>Save</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {showConfirm && (
            <CancelConfirmModal
            message="해당 로봇을 정말 삭제 하시겠습니까?"
            onConfirm={handleConfirmOk}
            onCancel={handleConfirmCancel}
            />
        )}
        </>
    );
    
}