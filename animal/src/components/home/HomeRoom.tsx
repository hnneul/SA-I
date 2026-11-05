"use client";

// 홈 화면 캐릭터 방: 방 배경 + 떠다니는 에셋 + 탈것에 탄 캐릭터
// 354×353 카드 기준으로 배치하고, 부모 너비에 맞춰 통째로 확대/축소함
// children은 말풍선, 날씨 등 방 위에 올라가는 UI (354×353 좌표 기준으로 배치)
import { useEffect, useRef, useState, type ReactNode } from "react";
import CharacterRive from "@/components/CharacterRive";
import FloatingParticles from "@/components/home/FloatingParticles";
import type { Zodiac } from "@/lib/characters";
import { homeRoomImages, RIDE_IN_BOX, type Element } from "@/lib/characterAssets";

const ROOM_W = 354;
const ROOM_H = 353;

type HomeRoomProps = {
  zodiac: Zodiac;
  element: Element;
  greetDelay?: number | null;
  onGreetEnd?: () => void;
  children?: ReactNode;
  className?: string;
};

export default function HomeRoom({ zodiac, element, greetDelay = 400, onGreetEnd, children, className = "" }: HomeRoomProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [replayKey, setReplayKey] = useState(0);
  const images = homeRoomImages(element);
  const ride = RIDE_IN_BOX[element];
  const clipId = `ride-front-${element}`;

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / ROOM_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 탈것 그림 (뒤: 전체, 앞: 상자 y 30 아래만 → 캐릭터 발을 덮음)
  const rideImage = <image href={images.ride} x={ride.x} y={ride.y} width={ride.width} height={ride.height} />;

  return (
    <div ref={frameRef} className={`relative w-full overflow-hidden rounded-[22px] ${className}`} style={{ aspectRatio: `${ROOM_W} / ${ROOM_H}` }}>
      <style>{"@keyframes ride-bob { from { translate: 0 0; } to { translate: 0 -6px; } }"}</style>
      <div className="absolute top-0 left-0" style={{ width: ROOM_W, height: ROOM_H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        {/* 1. 방 배경 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images.room} alt="" className="absolute inset-0 h-full w-full object-cover" />
        {/* 2. 바닥 그림자 */}
        <div
          className="absolute rounded-full"
          style={{ left: 59, top: 340, width: 152, height: 12, background: "radial-gradient(closest-side, rgba(30,58,51,.32), rgba(30,58,51,0))" }}
        />
        {/* 3. 떠다니는 에셋 */}
        <FloatingParticles element={element} />
        {/* 4. 캐릭터 + 탈것 (살짝 올라가 작아진 묶음이 둥실거림) */}
        <div className="pointer-events-none absolute inset-0" style={{ transformOrigin: "135px 327px", transform: "translateY(-18px) scale(0.9)" }}>
          <div className="absolute inset-0 motion-safe:animate-[ride-bob_2.8s_ease-in-out_infinite_alternate]">
            <svg className="absolute overflow-visible" style={{ left: 35, top: 297, width: 200, height: 72 }} viewBox="0 0 200 72" aria-hidden="true">
              {rideImage}
            </svg>
            <button
              type="button"
              aria-label="캐릭터 인사 다시 보기"
              onClick={() => setReplayKey((k) => k + 1)}
              className="pointer-events-auto absolute"
              style={{ left: 19, top: 54, width: 232, height: 290 }}
            >
              <CharacterRive zodiac={zodiac} element={element} greetDelay={greetDelay} replayKey={replayKey} onGreetEnd={onGreetEnd} className="h-full w-full" />
            </button>
            <svg className="absolute overflow-visible" style={{ left: 35, top: 297, width: 200, height: 72 }} viewBox="0 0 200 72" aria-hidden="true">
              <defs>
                <clipPath id={clipId}>
                  <rect x="-10" y="30" width="220" height="60" />
                </clipPath>
              </defs>
              <g clipPath={`url(#${clipId})`}>{rideImage}</g>
            </svg>
          </div>
        </div>
        {/* 5. 말풍선 등 */}
        {children}
      </div>
    </div>
  );
}
