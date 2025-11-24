'use client';

import styles from './Modal.module.css';
import React from 'react';
import { useState, useEffect  } from 'react';

export default function RobotInsertModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }){
    
    // 기존 state들 아래 쪽에 추가
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

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

    const handleCancel = () => {
        // const confirmed = window.confirm("작업을 취소하시겠습니까?");
        // if (confirmed) {
          onClose();  // 모달 닫기
        // }
      };
      
      const handleSave = () => {
        // 저장 처리 로직 (필요하면) 넣기
        onClose();  // 모달 닫기
      };
    
    return (
        <>
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.insertModalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.insertCloseBtn} onClick={onClose}>✕</button>
                <div className={styles.insertTitle}>
                    <img src="/icon/robot_status_w.png" alt="Robot Registeration" />
                    <h2>Robot Registeration</h2>
                </div>
                <div className={ `${styles.itemBoxContainer} ${styles.insertItemBoxContainerBg}`}>
                    <div className={styles.itemBoxTotal}>
                        <div className={`${styles.insertItemBox} ${styles.mb20}`}>
                            <div>Robot Type (Name)</div>
                            <input type="text" placeholder='20글자 이내로 작성해 주세요.' />
                        </div>
                        <div className={`${styles.insertItemBox} ${styles.mb20}`}>
                            <div>MSM ID</div>
                            <input type="text" placeholder='20글자 이내로 작성해 주세요.' />
                        </div>
                        <div className={styles.insertItemBox}>
                            <div>Serial Number</div>
                            <input type="text" placeholder='20글자 이내로 작성해 주세요.' />
                        </div>
                    </div>
                </div>
                <div className={styles.btnTotal}>
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
        </>
    );
    
}