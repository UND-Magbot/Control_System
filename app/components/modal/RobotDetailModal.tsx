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
}

export default function RobotDetailModal({
 isOpen,
 onClose,
 selectedRobotId,
 selectedRobot

}:DetailModalProps ){

    console.log(selectedRobotId);
    console.log(selectedRobot);
    
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
                    <div className={`${styles.detailRowItemBox} ${styles.btnBline}`}>
                        <div className={styles.detailItemBox}>
                            <div className={`${styles.itemTitleBox} ${styles.borderTl8}`}>Operator</div>
                            <div className={styles.itemContentBox}>Bear Robotics</div>
                        </div>
                        <div className={styles.detailItemBox}>
                            <div className={styles.itemTitleBox}>Group</div>
                            <div className={`${styles.itemContentBox} ${styles.borderTr8}`}>UND</div>
                        </div>
                    </div>
                    <div className={`${styles.detailRowItemBox} ${styles.btnBline}`}>
                        <div className={styles.detailItemBox}>
                            <div className={styles.itemTitleBox}>Site</div>
                            <div className={styles.itemContentBox}>Daegu Metropolitan City</div>
                        </div>
                        <div className={styles.detailItemBox}>
                            <div className={styles.itemTitleBox}>Robot Type</div>
                            <div className={styles.itemContentBox}>Guide Bot</div>
                        </div>
                    </div>
                    <div className={`${styles.detailRowItemBox} ${styles.btnBline}`}>
                        <div className={styles.detailItemBox}>
                            <div className={styles.itemTitleBox}>Model</div>
                            <div className={styles.itemContentBox}>RSCGD20.AGEN</div>
                        </div>
                        <div className={styles.detailItemBox}>
                            <div className={styles.itemTitleBox}>Serial Number</div>
                            <div className={styles.itemContentBox}>rscgd20ac1c5e0a</div>
                        </div>
                    </div>
                    <div className={styles.detailRowItemBox}>
                        <div className={styles.detailItemBox}>
                            <div className={`${styles.itemTitleBox} ${styles.borderBl8}`}>Software Version</div>
                            <div className={styles.itemContentBox}>RSCGD20.AGEN_v1.13.39</div>
                        </div>
                        <div className={styles.detailItemBox}>
                            <div className={`${styles.itemTitleBox} ${styles.lhUnset}`}>
                                <div>Robot Registration</div>
                                <div>Date/Time</div>
                            </div>
                            <div className={`${styles.itemContentBox} ${styles.borderBr8}`}>2025.10.13  16:29:37</div>
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