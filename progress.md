# NPC 프로젝트 진행 상황

> 이 파일은 Claude AI가 작업을 이어서 진행할 수 있도록 현재 상태와 다음 단계를 기록합니다.
> 새 세션에서 이 파일을 먼저 읽어주세요.

---

## 프로젝트 개요

Claude API를 활용한 4단계 AI NPC 시스템.
- **목적**: 단계별 NPC 구현 + 포트폴리오 + 재사용 가능한 모듈
- **핵심**: 3D 환경에서 캐릭터가 NPC에게 접근해 대화
- **레벨 구조**: 각 레벨은 독립된 프로젝트로 분리

### 4단계 NPC 레벨
| Level | 이름 | 핵심 기능 |
|-------|------|----------|
| 1 | Basic API NPC | Claude API 기본 연동, 매 대화 독립적 |
| 2 | RAG NPC | 문서 임베딩으로 NPC 성격/지식 주입 |
| 3 | Memory NPC | Vector DB로 대화 기억, 유저 정보 저장 |
| 4 | Personality NPC | 호감도 시스템, 감정 상태 관리 |

---

## 완료된 작업

### Level 1: Basic API NPC ✅ 완료

#### Phase 1: 프로젝트 셋업 ✅
- [x] client/ 폴더 (React + Vite + TypeScript)
- [x] server/ 폴더 (Express + TypeScript)
- [x] Tailwind CSS 설정
- [x] 폴더 구조 생성

#### Phase 2: Backend 구축 ✅
- [x] Express 서버 (src/index.ts)
- [x] CORS 미들웨어 설정
- [x] /api/chat 라우트 (src/routes/chat.ts)
- [x] Claude API 연동 (Anthropic SDK)
- [x] NPC 시스템 프롬프트 설정 (친절한 안내원)

#### Phase 3: Frontend 3D 환경 ✅
- [x] React Three Fiber Canvas 설정
- [x] Rapier 물리엔진 적용 (@react-three/rapier)
- [x] 맵 컴포넌트 (바닥, 나무, 바위 + 물리 충돌)
- [x] GLTF 캐릭터 모델 로딩 (BaseCharacter.gltf)
- [x] 캐릭터 애니메이션 (Idle, Walk, Run)

#### Phase 4: 캐릭터 컨트롤 ✅
- [x] WASD 키보드 이동 (useKeyboardControls 훅)
- [x] Rapier RigidBody + CapsuleCollider 물리
- [x] 카메라 각도 기반 이동 방향 계산
- [x] 부드러운 캐릭터 회전 (Quaternion slerp)

#### Phase 5: 카메라 시스템 ✅
- [x] 3인칭 팔로우 카메라 (ThirdPersonCamera.tsx)
- [x] 포인터 락 마우스 회전
- [x] 부드러운 카메라 추적 (lerp)
- [x] 수직 각도 제한

#### Phase 6: 상호작용 시스템 ✅
- [x] NPC 근접 감지 (거리 계산)
- [x] "F키로 대화" 프롬프트 표시 (InteractionPrompt)
- [x] F키 입력 시 대화창 열기
- [x] ESC로 대화창 닫기

#### Phase 7: 대화 시스템 ✅
- [x] ChatDialog UI (메시지 버블 형태)
- [x] useChat 훅 (상태 관리)
- [x] Express API 호출 연동
- [x] 로딩 상태 표시 (점 애니메이션)
- [x] 에러 처리

#### 추가: verseUp 프로젝트 코드 적용 ✅
- [x] BaseCharacter.gltf 모델 복사
- [x] Rapier 물리엔진 기반 Player 컴포넌트
- [x] CharacterModel 컴포넌트 (애니메이션 전환)
- [x] ThirdPersonCamera (마우스 회전)
- [x] NPC에 CharacterModel 적용 + 이름표

---

## 현재 상태

**Level 1 완료 (배포만 남음)**

```
client/ 설정 ✅ 완료
server/ 설정 ✅ 완료
TypeScript 타입체크 ✅ 통과
3D 환경 ✅ Rapier 물리엔진 적용
캐릭터 모델 ✅ BaseCharacter.gltf 적용
카메라 ✅ 마우스 회전 3인칭 팔로우
이동 ✅ WASD + 카메라 방향 기준
상호작용 ✅ F키 대화, ESC 닫기
대화 UI ✅ ChatDialog 완성
API 연동 ✅ /api/chat → Claude API
```

---

## 실행 방법

### 1. 환경변수 설정

**Server** (`server/.env`):
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
PORT=3001
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

### 2. 의존성 설치
```bash
cd client && npm install
cd server && npm install
```

### 3. 실행
```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

### 4. 접속
- **Client**: http://localhost:5173
- **Server**: http://localhost:3001

---

## 조작 방법

| 키 | 동작 |
|----|------|
| 클릭 | 카메라 조작 모드 (포인터 락) |
| WASD | 캐릭터 이동 |
| 마우스 | 시점 회전 |
| F | NPC와 대화 (근처에서) |
| ESC | 대화창 닫기 / 커서 해제 |

---

## 다음 작업

### 옵션 1: Level 1 배포
1. Server → Railway 배포
2. Client → Vercel 배포
3. 환경변수 설정
4. CORS 프로덕션 URL 설정

### 옵션 2: Level 2 RAG NPC 개발
1. 새 프로젝트 폴더 생성 (npc-level2-rag)
2. Supabase pgvector 설정
3. NPC 성격/지식 문서 임베딩
4. RAG 파이프라인 구현

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React + Vite + TypeScript |
| 3D Engine | React Three Fiber + Three.js |
| Physics | @react-three/rapier |
| Styling | Tailwind CSS |
| Backend | Express.js + TypeScript |
| AI | Claude API (Anthropic SDK) |
| 배포 | Vercel (Client) + Railway (Server) |

---

## 프로젝트 구조

```
4Npc/
├── client/                         # Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── three/
│   │   │   │   ├── Scene.tsx       # R3F Canvas + Physics
│   │   │   │   ├── Map.tsx         # 맵 + 물리 충돌
│   │   │   │   ├── Player.tsx      # Rapier 기반 플레이어
│   │   │   │   ├── NPC.tsx         # NPC + 이름표
│   │   │   │   ├── CharacterModel.tsx  # GLTF 모델 + 애니메이션
│   │   │   │   └── ThirdPersonCamera.tsx  # 마우스 회전 카메라
│   │   │   ├── ui/
│   │   │   │   ├── ChatDialog.tsx  # 대화창
│   │   │   │   ├── ChatMessage.tsx # 메시지 버블
│   │   │   │   └── InteractionPrompt.tsx  # F키 안내
│   │   │   └── Game.tsx            # 게임 로직 통합
│   │   ├── hooks/
│   │   │   ├── useKeyboardControls.ts
│   │   │   ├── useChat.ts
│   │   │   └── useInteraction.ts
│   │   ├── lib/
│   │   │   └── api.ts              # API 호출
│   │   └── types/
│   │       └── index.ts
│   ├── public/
│   │   └── models/
│   │       └── BaseCharacter.gltf  # 캐릭터 모델
│   └── package.json
│
├── server/                         # Backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── chat.ts             # /api/chat 라우트
│   │   └── index.ts                # Express 서버
│   ├── .env.example
│   └── package.json
│
├── progress.md                     # 이 파일
└── README.md
```

---

## 설계 결정 및 이유

### 1. React Three Fiber + Rapier 선택

| 장점 | 설명 |
|------|------|
| **React 통합** | React 컴포넌트로 3D 씬 관리 |
| **물리 엔진** | Rapier는 WASM 기반으로 빠르고 정확 |
| **verseUp 호환** | 기존 프로젝트 코드 재사용 가능 |

### 2. Express + Vercel Serverless 대신 Railway

| 구분 | Express + Railway | Vercel Serverless |
|------|------------------|-------------------|
| **구조** | 전통적인 서버 | 함수 기반 |
| **확장성** | Level 2+ WebSocket 등 유연 | 제한적 |
| **학습** | 서버 개발 경험 | Serverless 패턴 |

Express를 선택한 이유: Level 2 이상에서 WebSocket, 상태 관리 등이 필요할 수 있어 유연성 확보.

### 3. 캐릭터 물리 설정

```typescript
// Player.tsx
const CAPSULE_HALF_HEIGHT = 0.8;
const CAPSULE_RADIUS = 0.52;
const CAPSULE_Y_OFFSET = 1.28;
```

verseUp 프로젝트에서 검증된 값 사용. 캐릭터 모델 크기에 맞게 조정됨.

### 4. 카메라 시스템

```typescript
// ThirdPersonCamera.tsx
const MOUSE_SENSITIVITY = 0.002;
const ROTATION_SMOOTHING = 10;
```

포인터 락으로 FPS 스타일 마우스 조작. 부드러운 보간으로 멀미 방지.

---

## 참고 프로젝트

- **verseUp** (`C:\Users\Jaewon\Desktop\3차 프로젝트 verseUp!\verseUp`)
  - Player.jsx, CharacterModel.jsx, ThirdPersonCamera.jsx 참고
  - BaseCharacter.gltf 모델 복사

---

## 환경 설정

### 필요한 환경 변수

**Server (.env)**
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
PORT=3001
CLIENT_URL=http://localhost:5173
```

**Client (.env)**
```env
VITE_API_URL=http://localhost:3001/api
```

### 주요 의존성

**Client**
- react, react-dom
- three, @react-three/fiber, @react-three/drei
- @react-three/rapier
- three-stdlib (SkeletonUtils)
- tailwindcss

**Server**
- express
- @anthropic-ai/sdk
- cors, dotenv
- typescript, ts-node, nodemon
