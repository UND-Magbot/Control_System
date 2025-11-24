"use client";

import styles from './Modal.module.css';

type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function CancelConfirmModal({ message, onConfirm, onCancel }: Props) {

  return (
    <>
        <div className={styles.confirmOverlay}>
            <div className={styles.confirmBox}>
                <div>{message}</div>

                <div className={styles.confirmButtons}>
                    <button className={`${styles.btnItemCommon} ${styles.btnBgRed}`} onClick={onCancel} >
                        <img src="/icon/close_btn.png" alt="cancel"/>
                        <div>Cancel</div>
                    </button>
                    <button className={`${styles.btnItemCommon} ${styles.btnBgBlue}`}  onClick={onConfirm}>
                        <img src="/icon/check.png" alt="save" />
                        <div>Confirm</div>
                    </button>
                </div>
            </div>
        </div>
    </>
  );
}