"use client";

import React from 'react';
import styles from './Button.module.css';

type TabKey = string;

export type Tab = { 
  id: TabKey;
  label: string;
};

type TabMenuProps = {
  tabs: Tab[];
  activeTab: TabKey;                 // 부모가 내려주는 현재 활성 탭
  onChange: (tabId: TabKey) => void; // 부모에게 탭 변경 알림
};

export default function TabMenu({ tabs, activeTab, onChange }: TabMenuProps) {
  return (
    <div className={styles["tab-buttons"]}>
      {tabs.map(tab => (
        <button
          type="button"
          key={tab.id}
          className={`${styles["tab-btn"]} ${activeTab === tab.id ? styles["active"] : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}