'use client';

import './style.css';

export default function SchedulePage() {

    return (
        <>
        </>
    )
}

// "use client";

// import { useEffect, useState, useRef } from "react";
// import axios from "axios";

// const API = process.env.NEXT_PUBLIC_API_URL;

// export default function Dashboard() {
//   const [selected, setSelected] = useState<string>("");
//   const [x, setX] = useState("");
//   const [y, setY] = useState("");
//   const [theta, setTheta] = useState("");
//   const wsRef = useRef<WebSocket | null>(null); 
//   const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
//   const [logs, setLogs] = useState<string[]>([]);

//   type Robot = { name: string; battery?: number; status?: string };

//   // 로봇 목록 가져오기
//   const loadRobots = async () => {
//     try {
//       const { data } = await axios.get(`${API}/robots`);
//       const arr = Object.entries(data).map(([name, info]) => ({
//         name,       // key 이름: robot1
//         info,    // info 객체를 풀어서 넣음
//       }));


//       setRobots(arr);


//     } catch (e) {
//       console.error(e);
//     }
//   };

//   // WebSocket 연결
//   useEffect(() => {
//     loadRobots();
//     const ws = new WebSocket(`${API?.replace("http", "ws")}/ws`);
//     ws.onmessage = (e) => setLogs((prev) => [e.data, ...prev]);
//     ws.onopen = () => setLogs((prev) => ["[연결됨]", ...prev]);
//     ws.onclose = () => setLogs((prev) => ["[연결 종료]", ...prev]);
//     return () => ws.close();
//   }, []);

//   const connectWebSocket = () => {
//     const ws = new WebSocket(`${API?.replace("http", "ws")}/ws`);
//     wsRef.current = ws;

//     ws.onopen = () => {
//       setLogs((prev) => [`✅ [연결됨] ${new Date().toLocaleTimeString()}`, ...prev]);
//       // 연결되면 재연결 타이머 제거
//       if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
//     };

//     ws.onmessage = (e) => {
//       setLogs((prev) => [`📩 ${e.data}`, ...prev]);
//     };

//     ws.onclose = () => {
//       setLogs((prev) => [`⚠️ [연결 종료] ${new Date().toLocaleTimeString()}`, ...prev]);
//       // 3초 후 재연결
//       reconnectTimer.current = setTimeout(() => {
//         setLogs((prev) => [`🔄 [재연결 시도 중...]`, ...prev]);
//         connectWebSocket();
//       }, 3000);
//     };

//     ws.onerror = (err) => {
//       setLogs((prev) => [`❌ [오류 발생: ${err}]`, ...prev]);
//       ws.close();
//     };
//   };

//   useEffect(() => {
//     loadRobots();
//     connectWebSocket();

//     // cleanup
//     return () => {
//       wsRef.current?.close();
//       if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
//     };
//   }, []);

//   const [robots, setRobots] = useState<Robot[]>([]);


//   const sendMove = async () => {
//     if (!selected) return alert("로봇을 선택하세요!");
//     await axios.post(`${API}/robots/${selected}/move`, {
//       x: parseFloat(x),
//       y: parseFloat(y),
//       theta: parseFloat(theta),
//     });
//     setLogs((prev) => [`명령 전송: ${selected}`, ...prev]);
//   };

//   return (
//     <main style={{ padding: 20 }}>
//       <h1>🚗 로봇 관제 대시보드</h1>
//       <div>{API}</div>
//       <div></div>
//       <div style={{ display: "flex", gap: 20 }}>
//         {/* 좌측 로봇 목록 */}
//         <div>
//           <h3>로봇 목록</h3>
//           {robots.map((arr: any, idx: number) => (
//             <div
//               key={idx}
//               style={{
//                 border: "1px solid #ccc",
//                 borderRadius: "8px",
//                 padding: "10px",
//                 marginBottom: "10px",
//               }}
//             >
//               <strong>{arr.name || `로봇 ${idx + 1}`}</strong>
//               <div>배터리: {arr.battery ?? "N/A"}%</div>
//               <div>상태: {arr.status ?? "확인 중"}</div>
//             </div>
//           ))}
//         </div>

//         {/* 제어 영역 */}
//         <div style={{ flex: 1 }}>
//           <h3>명령 전송</h3>
//           <div>
//             <input
//               placeholder="x"
//               value={x}
//               onChange={(e) => setX(e.target.value)}
//             />
//             <input
//               placeholder="y"
//               value={y}
//               onChange={(e) => setY(e.target.value)}
//             />
//             <input
//               placeholder="theta"
//               value={theta}
//               onChange={(e) => setTheta(e.target.value)}
//             />
//             <button onClick={sendMove}>전송</button>
//           </div>

//           <h3>로그</h3>
//           <div
//             style={{
//               border: "1px solid #ccc",
//               height: 200,
//               overflowY: "scroll",
//               padding: 5,
//             }}
//           >
//             {logs.map((l, i) => (
//               <div key={i}>{l}</div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }

// export default function VideoPlayer() {
//   const API = process.env.NEXT_PUBLIC_API_URL!;
//   const src = `${API}/media/NoWordsCanSay.mp4`; // 파일명만 바꿔주면 됨

//   return (
//     <div style={{ padding: 16 }}>
//       <h3>📹 샘플 영상</h3>
//       <video
//         src={src}
//         controls
//         autoPlay={false}
//         playsInline
//         style={{ width: "100%", maxWidth: 960, background: "#000", borderRadius: 8 }}
//         onError={(e) => console.error("video error", e)}
//       />
//       <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>{src}</div>
//     </div>
//   );
// }