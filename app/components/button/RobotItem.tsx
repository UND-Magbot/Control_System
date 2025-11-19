"use client";

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import styles from './Button.module.css';
import RobotCrudModal from "../modal/RobotDetailModal";

export default function RobotCrud() {

  const [robotCrudModalOpen, setRobotCrudModalOpen] = useState(false);

  return (
    <>
      <button type='button' className={styles.robotCrudBox} onClick={() => setRobotCrudModalOpen(true)}>
          <div className={styles.robotCrudBtn}>
              <img src="/icon/check.png" alt="check" />
          </div>
          <div>Robot Registration</div>
      </button>
      <RobotCrudModal isOpen={robotCrudModalOpen} onClose={() => setRobotCrudModalOpen(false)}/>
    </>
  )
} 