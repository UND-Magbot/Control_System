"use client"

import './style.css'
import React from 'react';
import { useRouter } from 'next/navigation'


export default function Header() {
    const router = useRouter()

    return(
        <header className="header">
            <div className="container-flex">
                <div className="lr-div-flex">
                    <div className='logo-img'>
                        <img src="/icon/logo.png" alt="로고" />
                    </div>
                    <h2>HOSPOTAL CONTROL SYSTEM</h2>
                </div>
                <div className="lr-div-flex">
                    <div className='alarm-icon'>
                        <div className='alarm'>
                            <img src="/icon/bell_c.png" alt="알림" />
                            <span>3</span>
                        </div>
                        <div className='schedule'>
                            <img src="/icon/calendar_c.png" alt="스케줄" />
                            <span>3</span>
                        </div>
                        <div className='lacation'>
                            <img src="/icon/map.png" alt="로봇위치" />
                        </div>
                    </div>
                    <div className='new-time'>
                        <span>2025-10-31</span>
                        <span>PM 01:36</span>
                    </div>
                    <div className='admin'>
                        <div className='admin-img'>
                            <img src="/icon/user.png" alt="사용자" />
                        </div>
                        <span>Administrator</span>
                    </div>
                </div>
            </div>
        </header>
    )
}