"use client";

// 12지신 캐릭터 애니메이션 (riv)
// - 경로는 띠 + 오행으로 정해짐: /rive/{element}/{zodiac}.riv
// - 화면 비율 4:5 상자를 꽉 채우도록 그려짐 (아트보드 400×500, 발끝 y=470)
// - greetDelay(ms) 뒤에 인사(Timeline 1, 4초)를 한 번 재생. null이면 인사 없이 마지막 자세로 바로 보여줌
// - replayKey 값을 바꾸면 인사를 다시 재생 (예: 캐릭터를 눌렀을 때 +1)
import { useEffect } from "react";
import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";
import type { Zodiac } from "@/lib/characters";
import {
  characterRivPath,
  RIVE_ANIMATION,
  RIVE_ARTBOARD,
  RIVE_GREET_MS,
  type Element,
} from "@/lib/characterAssets";

type CharacterRiveProps = {
  zodiac: Zodiac;
  element: Element;
  greetDelay?: number | null;
  replayKey?: number;
  onGreetEnd?: () => void;
  className?: string;
};

export default function CharacterRive(props: CharacterRiveProps) {
  const src = characterRivPath(props.element, props.zodiac);
  // 파일이 바뀌면(띠나 오행이 바뀌면) 새로 불러오도록 key로 다시 만듦
  return <RivePlayer key={src} src={src} {...props} />;
}

function RivePlayer({
  src,
  greetDelay = 0,
  replayKey = 0,
  onGreetEnd,
  className = "",
}: CharacterRiveProps & { src: string }) {
  const { rive, RiveComponent } = useRive({
    src,
    artboard: RIVE_ARTBOARD,
    autoplay: false,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  useEffect(() => {
    if (!rive) return;
    if (greetDelay === null) {
      // 인사 없이 마지막 자세로
      rive.play(RIVE_ANIMATION);
      rive.scrub(RIVE_ANIMATION, RIVE_GREET_MS / 1000);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(() => {
        rive.stop(RIVE_ANIMATION);
        rive.play(RIVE_ANIMATION);
        if (onGreetEnd) timers.push(setTimeout(onGreetEnd, RIVE_GREET_MS));
      }, replayKey === 0 ? greetDelay : 0),
    );
    return () => timers.forEach(clearTimeout);
    // onGreetEnd는 바뀌어도 다시 재생하지 않음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rive, greetDelay, replayKey]);

  return <RiveComponent className={`aspect-[4/5] ${className}`} />;
}
