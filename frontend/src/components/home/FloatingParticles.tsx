"use client";

// 홈 방 안에 떠다니는 작은 에셋 (오행마다 움직임이 다름)
// 354×353 방 카드 기준 좌표로 그림. 부모가 크기를 늘이면 같이 늘어남
import { useEffect, useRef } from "react";
import { homeRoomImages, type Element } from "@/lib/characterAssets";

const W = 354;
const H = 353;

type Particle = { x: number; y: number; vx: number; vy: number; r: number; a: number; spin: number; speed: number; img: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = () => Math.floor(rand(0, 8));

// 오행별 처음 위치와 속도. r = 긴 변의 절반(px)
const SPAWN: Record<Element, () => Particle> = {
  // 목: 잎사귀가 떨어지며 뒤집힘
  wood: () => ({ x: rand(0, W), y: rand(-20, H), vx: rand(-0.15, 0.15), vy: rand(0.25, 0.5), r: rand(7, 11), a: rand(0, 6), spin: rand(-0.02, 0.02), speed: 0, img: pick() }),
  // 화: 작은 불꽃이 아래에서 올라가며 일렁이다 위에서 흐려짐
  fire: () => ({ x: rand(20, W - 20), y: rand(H * 0.3, H + 20), vx: 0, vy: rand(-0.6, -0.3), r: rand(6, 10), a: rand(0, 6), spin: 0, speed: 0, img: pick() }),
  // 토: 조약돌이 공중에서 천천히 흘러가며 둥실
  earth: () => ({ x: rand(0, W), y: rand(10, H - 20), vx: rand(-0.12, 0.12), vy: 0, r: rand(6, 10), a: rand(0, 6), spin: rand(-0.004, 0.004), speed: 0, img: pick() }),
  // 금: 크리스탈·진주·반짝이가 제자리에서 반짝 나타났다 사라짐
  metal: () => ({ x: rand(16, W - 16), y: rand(16, H - 40), vx: 0, vy: rand(-0.08, -0.03), r: rand(6, 11), a: 0, spin: 0, speed: rand(0.012, 0.022), img: pick() }),
  // 수: 물방울·거품이 좌우로 흔들리며 떠오름
  water: () => ({ x: rand(15, W - 15), y: rand(H * 0.2, H + 20), vx: 0, vy: rand(-0.5, -0.25), r: rand(5, 10), a: rand(0, 6), spin: 0, speed: 0, img: pick() }),
};
const COUNT: Record<Element, number> = { wood: 22, fire: 16, earth: 12, metal: 10, water: 16 };

export default function FloatingParticles({ element, className = "" }: { element: Element; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2) * 1.5;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const images = homeRoomImages(element).particles.map((src) => Object.assign(new Image(), { src }));
    const parts = Array.from({ length: COUNT[element] }, SPAWN[element]);

    // 그림 i를 (x, y) 가운데에 긴 변 2r로 그림
    const draw = (i: number, x: number, y: number, r: number, angle = 0, flip = 1, alpha = 1) => {
      const img = images[i];
      if (!img.complete || !img.naturalWidth || alpha <= 0) return;
      const s = (r * 2) / Math.max(img.naturalWidth, img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(flip, 1);
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    };

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        if (element === "wood") {
          p.a += p.spin;
          p.x += p.vx + Math.sin(p.y / 30) * 0.3;
          p.y += p.vy;
          if (p.y > H + 10) Object.assign(p, SPAWN.wood(), { y: -10 });
          draw(p.img, p.x, p.y, p.r, p.a, Math.cos(p.y / 40), 0.95);
        } else if (element === "fire") {
          p.a += 0.15;
          p.y += p.vy;
          p.x += Math.sin(p.y / 22) * 0.25;
          if (p.y < -10) Object.assign(p, SPAWN.fire(), { y: H + 10 });
          const fade = Math.min(1, p.y / (H * 0.45));
          draw(p.img, p.x, p.y, p.r * (0.92 + Math.sin(p.a) * 0.08), Math.sin(p.a * 0.5) * 0.12, 1, 0.9 * fade);
        } else if (element === "earth") {
          p.a += 0.02;
          p.x += p.vx;
          p.y += Math.sin(p.a) * 0.12;
          if (p.x < -12) p.x = W + 10;
          else if (p.x > W + 12) p.x = -10;
          draw(p.img, p.x, p.y, p.r, p.a * 2 * p.spin * 100, 1, 0.9);
        } else if (element === "metal") {
          p.a += p.speed;
          p.y += p.vy;
          if (p.a > Math.PI) Object.assign(p, SPAWN.metal());
          const glint = Math.sin(p.a);
          draw(p.img, p.x, p.y, p.r * (0.7 + glint * 0.3), (1 - glint) * 0.6, 1, glint);
        } else {
          p.a += 0.04;
          p.y += p.vy;
          p.x += Math.sin(p.a) * 0.35;
          if (p.y < -12) Object.assign(p, SPAWN.water(), { y: H + 12 });
          draw(p.img, p.x, p.y, p.r, Math.sin(p.a) * 0.15, 1, 0.85);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [element]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
