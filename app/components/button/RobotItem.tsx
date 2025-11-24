"use client";

import React from 'react';
import { useState } from 'react';
import styles from './Button.module.css';
import RobotInsertModal from "../modal/RobotInsertModal";

export default function RobotCrud() {

  const [robotInsertModalOpen, setRobotInsertModalOpen] = useState(false);

  return (
    <>
      <button type='button' className={styles.robotCrudBox} onClick={() => setRobotInsertModalOpen(true)}>
          <div className={styles.robotCrudBtn}>
              <img src="/icon/check.png" alt="check" />
          </div>
          <div>Robot Registration</div>
      </button>
      <RobotInsertModal isOpen={robotInsertModalOpen} onClose={() => setRobotInsertModalOpen(false)}/>
    </>
  )
} 