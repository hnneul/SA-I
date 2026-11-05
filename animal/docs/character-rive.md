# 12지신 캐릭터 · 홈 방 구현 가이드 (프론트)

사주를 입력하면 그 사람의 띠(`zodiac`)와 오행(`element`)이 정해지고, 그 두 값으로 캐릭터 애니메이션(`.riv`)과 홈 방 이미지를 고릅니다.
리소스는 레포의 `animal/` 폴더에 모아 두었습니다. 안의 `public/`, `src/`는 Next.js 프로젝트와 같은 구조라서, 프론트 앱의 같은 위치로 옮겨 쓰면 됩니다.

움직이는 참고 화면(웹 시안): https://claude.ai/artifact/P2sEhDJV81eoHUtcBJDQsp

## 1. 폴더 구성

```
public/
  rive/{element}/{zodiac}.riv               캐릭터 애니메이션 60개 (12띠 × 5오행)
  images/characters/{element}/{zodiac}.webp 캐릭터 정지 이미지 60개 (riv와 같은 색, 800×1000 투명 배경)
  images/home/{element}/room.webp           방 배경
  images/home/{element}/ride.webp           캐릭터가 타는 탈것
  images/home/{element}/particle_1~8.webp   방 안에 떠다니는 작은 에셋
src/
  lib/characterAssets.ts                    경로 함수, riv 이름, 탈것 위치값
  components/CharacterRive.tsx              캐릭터 애니메이션 컴포넌트
  components/home/HomeRoom.tsx              홈 방 (배경 + 에셋 + 탈것 + 캐릭터)
  components/home/FloatingParticles.tsx     떠다니는 에셋 (HomeRoom 안에서 사용)
```

- `zodiac`: `src/lib/characters.ts`의 `Zodiac`과 같음 (`rat` `ox` `tiger` `rabbit` `dragon` `snake` `horse` `goat` `monkey` `rooster` `dog` `pig`)
- `element`: `src/mocks/saju.ts`의 오행 키와 같음 (`wood` `fire` `earth` `metal` `water`)

`src/` 코드는 지금 레포(Next.js 15, React 19, Tailwind 4)에 넣고 실행해서 동작을 확인한 예시입니다. 그대로 써도 되고, 구조에 맞게 고쳐 써도 됩니다.

## 2. 적용 방법

1. `animal/public/`의 폴더들을 프론트 앱의 `public/`에 넣습니다.
2. `animal/src/`의 파일 4개를 프론트 앱의 `src/` 같은 위치에 넣습니다.
3. Rive 런타임을 설치합니다. (리소스 PR에는 `package.json`이 없어서, 프론트 코드가 올라간 뒤 한 번 설치해 주세요)

```bash
# 프론트 앱 폴더에서
npm install @rive-app/react-canvas
```

## 3. 데이터 흐름

```
사주 입력 → 백엔드 → 사주 API → 백엔드가 { zodiac, element } 응답 → 프론트가 경로를 만들어 표시
```

riv와 이미지는 `public/`의 정적 파일이라 따로 API가 필요 없습니다. 백엔드 응답(사주 제출, 로그인/내 정보)의 `zodiac`, `element` 두 값만 있으면 됩니다.

```ts
characterRivPath("water", "tiger")   // "/rive/water/tiger.riv"
characterImagePath("water", "tiger") // "/images/characters/water/tiger.webp"
homeRoomImages("water").room         // "/images/home/water/room.webp"
```

## 4. 컴포넌트 사용법

### CharacterRive: 캐릭터만 필요할 때 (캐릭터 소환 화면 등)

```tsx
<CharacterRive zodiac="tiger" element="water" greetDelay={1300} className="w-[240px]" />
```

| prop | 설명 |
|---|---|
| `zodiac`, `element` | 띠, 오행. 바뀌면 해당 파일을 새로 불러옴 |
| `greetDelay` | 불러온 뒤 몇 ms 후 인사할지. 기본 0. `null`이면 인사 없이 마지막 자세로 바로 보여줌 |
| `replayKey` | 값이 바뀔 때마다 인사를 다시 재생 (예: 누를 때마다 +1) |
| `onGreetEnd` | 인사(4초)가 끝나면 호출 |
| `className` | 크기 지정. 비율은 항상 4:5 |

### HomeRoom: 홈 화면 캐릭터 방

```tsx
<HomeRoom zodiac={character.zodiac} element={character.element} onGreetEnd={() => setShowBubble(true)}>
  {showBubble && <SpeechBubble className="absolute top-[58px] left-[40px] w-[262px]">…</SpeechBubble>}
</HomeRoom>
```

- 방 배경, 바닥 그림자, 떠다니는 에셋, 탈것, 캐릭터를 한 번에 그립니다.
- 354×353 카드 기준으로 만들어서, 부모 너비에 맞춰 통째로 늘어나거나 줄어듭니다(비율 354:353).
- `children`(말풍선, 날씨 등)도 354×353 좌표 기준으로 배치하면 같이 늘어납니다.
- 들어오면 0.4초 뒤 인사하고(`greetDelay` 기본 400), 캐릭터를 누르면 다시 인사합니다.
- 인사가 끝나면 `onGreetEnd`가 호출되니 거기서 말풍선을 띄우면 됩니다(웹 시안과 같은 흐름).

### 정지 이미지: 움직임이 필요 없는 곳 (목록, 프로필, riv 로딩 중 등)

```tsx
<Image src={characterImagePath(element, zodiac)} alt="" width={240} height={300} />
```

- riv의 첫 장면(인사 전 서 있는 자세)을 그대로 뽑은 이미지라, riv로 바뀌어도 자세와 크기가 이어집니다.
- 800×1000(아트보드 400×500의 2배), 투명 배경, 비율 4:5. 한 장 평균 30KB입니다.
- 지금 `CharacterImage`가 쓰는 `public/images/characters/mouse.webp` 등과는 폴더가 달라서 겹치지 않습니다.

## 5. 캐릭터 riv 사양

60개 모두 구조가 같아서 경로만 바꾸면 같은 코드로 재생됩니다.

| 항목 | 값 |
|---|---|
| 아트보드 | `character`, 400×500, 배경 투명, 발끝 y=470 |
| 애니메이션 | `Timeline 1`, 4초, 한 번 재생(반복 없음). 점프 2번, 손 인사, 윙크 |
| 맞춤 | `Fit.Contain`, 가운데 정렬, 뷰 비율 4:5 |
| 용량 | 파일당 0.25~1.0 MB (60개 합계 약 33 MB) |

- 자동 재생은 끄고(`autoplay: false`), 원하는 시점에 `Timeline 1`을 재생합니다.
- 파일 안에 Rive 워터마크용 아트보드도 들어 있어서 아트보드는 `character`로 지정합니다(예시 코드에 들어 있음).

## 6. 홈 방 배치 (HomeRoom이 하는 일)

354×353 카드(모서리 22) 기준 좌표입니다.

| 순서 (아래→위) | 요소 | 위치 |
|---|---|---|
| 1 | 방 배경 `room.webp` | 카드 꽉 채움 (`object-fit: cover`) |
| 2 | 바닥 그림자 | x 59, y 340, 152×12 타원 |
| 3 | 떠다니는 에셋 | 카드 전체 캔버스 |
| 4 | 탈것(뒤) | x 35, y 297, 200×72 상자에 탈것 전체 |
| 5 | 캐릭터 | x 19, y 54, 232×290. 발끝이 y 327 |
| 6 | 탈것(앞) | 탈것(뒤)와 같은 상자에서 y 30 아래만. 캐릭터 발을 덮어서 탈것 위에 서 있는 것처럼 보임 |

- 4~6은 한 묶음으로, (135, 327)을 기준으로 `translateY(-18px) scale(0.9)` 한 뒤 위아래로 6px 둥실거립니다(2.8초 왕복).
- 탈것 그림의 상자 안 위치는 오행마다 다릅니다(`RIDE_IN_BOX`).

### 떠다니는 에셋 움직임

| 오행 | 개수 | 움직임 |
|---|---|---|
| wood | 22 | 잎사귀가 위에서 천천히 떨어지며 좌우로 흔들리고 뒤집힘 |
| fire | 16 | 작은 불꽃이 아래에서 올라가며 일렁이고, 위로 갈수록 흐려짐 |
| earth | 12 | 조약돌이 공중에서 옆으로 천천히 흘러가며 둥실, 천천히 회전 |
| metal | 10 | 크리스탈·진주·반짝이가 제자리에서 반짝 나타났다 사라짐 |
| water | 16 | 물방울·거품이 좌우로 흔들리며 떠오름 |

"동작 줄이기"(`prefers-reduced-motion`)를 켠 사용자에게는 에셋과 둥실 애니메이션을 멈춥니다(예시 코드에 들어 있음).

## 7. 캐릭터 소환(결과) 화면 사양

Figma "05 캐릭터 결과" 프레임(402×874) 기준입니다. 빛기둥, 번쩍임, 반짝이, 캐릭터 등장 연출은 `.riv`에 없고 앱에서 구현합니다. `.riv`는 인사 애니메이션만 담당합니다.

| 요소 | 값 |
|---|---|
| 배경 | 세로 그라데이션 `#2E3A38` → `#455D58`(40%) → `#74A092` |
| 제목 | "{닉네임}이가 태어났어요!" 20px Bold, 흰색, 위에서 160 |
| 부제 | "나의 사주 에너지가 이 모습으로 깨어났어요." 12px, 흰색 62% |
| 캐릭터 뷰 | 240×300 (아트보드 0.6배), x 81 / y 263. 발끝이 화면 y 545 |
| 빛기둥 | 190×470, 가운데, 위에서 250. 민트색 radial gradient + blur 14 |
| 버튼 | "홈으로 가기", 좌우 24, 아래 52, 높이 55, 모서리 10, `#161616`, 16px Bold |

| 시간 (화면 진입 기준) | 동작 |
|---|---|
| 0.1s | 제목, 부제가 아래에서 올라오며 나타남 (0.6s, ease-out) |
| 0.2s | 빛기둥이 아래에서 위로 자람 (1.0s, `cubic-bezier(.2,.8,.2,1)`) |
| 0.5s | 캐릭터 등장: scale 0.35→1, y +40→0, 투명→불투명 (0.9s, `cubic-bezier(.3,1.5,.5,1)`). 동시에 빛 번쩍임 (0.8s) |
| 0.9s~1.2s | 반짝이 3개가 차례로 나타난 뒤 계속 반짝임 |
| 1.3s | 인사 시작 → `<CharacterRive greetDelay={1300} />` |
| 1.6s | "홈으로 가기" 버튼 나타남 (0.5s) |

## 8. 확인 체크리스트

- [ ] `/rive/{element}/{zodiac}.riv` 60개 경로가 모두 열림 (양은 `goat`)
- [ ] `/images/characters/{element}/{zodiac}.webp` 60개 경로가 모두 열림
- [ ] 소환 화면: 1.3초 뒤 인사 한 번, 끝나면 마지막 자세로 멈춤
- [ ] 홈: 들어오면 인사 → 끝나면 말풍선, 캐릭터를 누르면 다시 인사
- [ ] 홈: 오행에 맞는 방 배경, 탈것, 떠다니는 에셋이 나옴
- [ ] 캐릭터 발이 탈것 안에 들어가 보임 (탈것 앞쪽이 발을 덮음)
