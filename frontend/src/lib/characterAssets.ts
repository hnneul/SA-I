// 캐릭터 riv와 홈 방 이미지 경로
// 백엔드가 주는 zodiac(띠)과 element(오행) 두 값으로 모든 경로가 정해짐
import type { Zodiac } from "@/lib/characters";

export type Element = "wood" | "fire" | "earth" | "metal" | "water";

// 캐릭터 애니메이션: public/rive/{element}/{zodiac}.riv
export function characterRivPath(element: Element, zodiac: Zodiac): string {
  return `/rive/${element}/${zodiac}.riv`;
}

// 캐릭터 정지 이미지: public/images/characters/{element}/{zodiac}.webp
// riv 첫 장면(인사 전 서 있는 자세)을 800×1000(아트보드 2배), 투명 배경으로 뽑은 것
export function characterImagePath(element: Element, zodiac: Zodiac): string {
  return `/images/characters/${element}/${zodiac}.webp`;
}

// riv 안의 이름 (60개 파일 모두 같음)
export const RIVE_ARTBOARD = "character";
export const RIVE_ANIMATION = "Timeline 1"; // 인사 4초, 한 번 재생
export const RIVE_GREET_MS = 4000;

// 홈 방 이미지: public/images/home/{element}/
export function homeRoomImages(element: Element) {
  const base = `/images/home/${element}`;
  return {
    room: `${base}/room.webp`,
    ride: `${base}/ride.webp`,
    particles: Array.from({ length: 8 }, (_, i) => `${base}/particle_${i + 1}.webp`),
  };
}

// 탈것 그림 위치: 200×72 상자 안 좌표 (상자 밖으로 조금 나가도 됨)
export const RIDE_IN_BOX: Record<Element, { x: number; y: number; width: number; height: number }> = {
  wood: { x: -6, y: 2, width: 212, height: 51 },
  fire: { x: -6, y: 0, width: 212, height: 72 },
  earth: { x: -6, y: 4, width: 212, height: 71 },
  metal: { x: -6, y: 10, width: 212, height: 54 },
  water: { x: -6, y: 4, width: 212, height: 60 },
};
