import SwapPiP from "./SwapPiP";
import './style.css';

const MainView = () => (
  <img
    src="/image/camera_A.jpg"
    alt="Camera A"
    className="h-full w-full object-cover"
    draggable={false}
  />
);

const PipView = () => (
  <img
    src="/image/camera_B.jpg"
    alt="Camera B"
    className="h-full w-full object-cover"
    draggable={false}
  />
);

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <section className="mx-auto max-w-6xl p-6 space-y-6">
        <h1 className="text-2xl font-bold">병원 로봇 관제 – 화면 스왑</h1>
        <p className="text-sm text-neutral-600">
          메인 화면을 클릭하거나, 우하단 썸네일을 클릭하면 서로 자리를 바꿉니다.
        </p>

        <SwapPiP
          main={<MainView />}
          pip={<PipView />}
          pipWidth={260}
          pipHeight={160}
          offset={24}
        />
      </section>
    </main>
  );
}