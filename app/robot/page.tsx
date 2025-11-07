'use client';

import './style.css';
import React from 'react';
import { useState } from 'react';
import RemoteModal from './RemoteModal';

export default function RobotPage() {

    const [isModalOpen, setIsModalOpen] = useState(false);

    type robotStatusRows = {
        name: 'und 1' | 'und 2' |'und 3';
        bar: '|';
        status: 'Online' | 'Offline' | 'Charging';
      };
  
      const StatusRows: robotStatusRows[] = [
        { name: 'und 1', bar: "|", status: 'Online'},
        { name: 'und 2', bar: "|", status: 'Offline'},
        { name: 'und 3', bar: "|", status: 'Charging'}
      ];

    return (
        <>
            <div className='title'>
                <h2>로봇 목록</h2>
                <div></div>
            </div>
            <div className='half-flex'>
                <div className='left-div'>
                    <div className='empty'></div>
                    <div className='line'></div>
                    <div className='left-title'>로봇 <span>3</span>대</div>
                    <div>
                        {StatusRows.map((r) => (
                            <div className='robot-status-box' key={r.name}>
                                <div></div>
                                <span>{r.name}</span>
                                <span>{r.bar}</span>
                                <span>{r.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='right-div robot-status'>
                    <div className='top-div'>
                        <div className='map-img'>
                            <img src="/image/map_sample.png" alt="sample" />
                        </div>
                        <button type='button' onClick={() => setIsModalOpen(true)}>원격제어</button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>배터리</th>
                                <th>3D Camera</th>
                                <th>Micom</th>
                                <th>ToF 센서</th>
                                <th>마그네틱 감지 센서</th>
                                <th>IMU</th>
                                <th>Lidar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                    <table>
                        <thead>
                            <tr>
                                <th>NaviPC</th>
                                <th>Service Camera</th>
                                <th>주행</th>
                                <th>범퍼</th>
                                <th>Fan 모터</th>
                                <th>충전대 연결/분리</th>
                                <th>바퀴</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <RemoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
            </div>
        </>
    )
}