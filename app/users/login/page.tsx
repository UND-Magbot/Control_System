"use client";

import './style.css';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Login() {
    const router = useRouter();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userId || !password) return;
        document.cookie = `auth=1; path=/; max-age=${60 * 60 * 24}`;
        router.push('/dashboard');
    };

    return(
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={onSubmit}>
                <input type="text" placeholder="ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
                <br />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <br />
                <button type="submit" className="login-button">Login</button>
            </form>
            <div className='add_event'>
                <span>비밀번호 찾기</span>
                <span>|</span>
                <span>회원가입</span>
            </div>
        </div>
    )
}