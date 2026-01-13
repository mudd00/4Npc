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

각 레벨은 **독립적인 특성**을 가진 NPC입니다. (기능 누적 X, 개별 특성 O)

| Level | 이름 | 핵심 기능 | 설명 |
|-------|------|----------|------|
| 1 | Basic API NPC | 기본 챗봇 | Claude API 기본 연동, 기억 없음 |
| 2 | RAG NPC | 세계관 지식 | 문서 임베딩으로 NPC가 알고 있는 정보 제공 |
| 3 | Memory NPC | 대화 기억 | 유저와의 대화를 기억하고 맥락 유지 |
| 4 | Personality NPC | 감정 + 호감도 | 관계에 따라 말투/태도가 달라지는 NPC |

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

### Level 2: RAG NPC ✅ 완료

#### 세계관
- **별빛 마을**: 100년 전 별이 떨어진 곳에 세워진 판타지 마을
- **NPC**: 마을 안내원 '루나' (토박이, 마을을 사랑함)

#### Phase 1: RAG 인프라 ✅
- [x] 의존성 설치 (openai, @supabase/supabase-js)
- [x] embeddingService.ts - OpenAI text-embedding-3-small
- [x] vectorStore.ts - Supabase pgvector 검색
- [x] supabase-setup.sql - 테이블/함수 생성 SQL

#### Phase 2: 지식 데이터 ✅
- [x] knowledge.json - 별빛 마을 세계관 (15개 문서)
  - 카테고리: history, location, npc, rumor
- [x] seedKnowledge.ts - 임베딩 생성 및 DB 저장 스크립트

#### Phase 3: API 업데이트 ✅
- [x] chat.ts - RAG 통합 (/api/chat/level2)
- [x] chat.ts - 빠른 정보 엔드포인트 (/api/quick-info)
- [x] api.ts (Client) - getQuickInfo 함수 추가

#### Phase 4: UI 업데이트 ✅
- [x] InteractionMenu.tsx - 게임형 상호작용 메뉴
- [x] Game.tsx - 메뉴 로직 통합
- [x] Scene.tsx - bubbleMessage 전달
- [x] NPC.tsx / SpeechBubble.tsx - RAG 응답 표시

---

### 4 NPC 시스템 ✅ 완료

#### NPC 캐릭터 4명 (일렬 배치)
| Level | 이름 | 역할 | 위치 | 특징 |
|-------|------|------|------|------|
| 1 | 밤이 | 졸린 경비원 | (-9, 0, -2) | 기본 API, 기억 없음 |
| 2 | 루나 | 마을 안내원 | (-3, 0, -2) | RAG 기반 지식 대화 |
| 3 | 해나 | 친근한 상인 | (3, 0, -2) | Memory 시스템 ✅ |
| 4 | 별이 | 신비로운 점술가 | (9, 0, -2) | Personality 시스템 (임시) |

#### 구현 완료 항목 ✅
- [x] types/index.ts - NPCConfig 타입 및 NPC_CONFIGS 정의
- [x] NPC.tsx - 레벨별 스타일링 (색상 테마, 레벨 뱃지)
- [x] SpeechBubble.tsx - 동적 색상 테마 지원
- [x] Scene.tsx - 4개 NPC 렌더링
- [x] Player.tsx - 다중 NPC 근접 감지
- [x] Game.tsx - 다중 NPC 상호작용 로직
- [x] InteractionMenu.tsx - 레벨별 메뉴 옵션
- [x] ChatDialog.tsx - NPC별 헤더 스타일링
- [x] useChat.ts - 레벨별 API 호출
- [x] api.ts - sendMessageByLevel 함수

#### Server API 엔드포인트 ✅
- [x] /api/chat/level1 - 기본 Claude API (밤이)
- [x] /api/chat/level2 - RAG 기반 (루나)
- [x] /api/chat/level3 - Memory (해나) ✅ 완성
- [x] /api/chat/level4 - Personality (별이) - 임시 구현
- [x] /api/quick-info - Level 2 빠른 정보 (말풍선)

---

### Level 3: Memory NPC ✅ 완료

#### Supabase 테이블 ✅
- [x] `conversations` 테이블 - 대화 기록 저장
- [x] `user_summaries` 테이블 - 유저 정보 요약 저장
- [x] `get_recent_conversations` 함수 - 최근 대화 조회
- [x] `upsert_user_summary` 함수 - 유저 요약 업데이트
- [x] SQL 파일: `server/src/sql/conversations.sql`

#### Server 구현 ✅
- [x] memoryService.ts - 대화 저장/조회, 유저 요약 관리
- [x] chat.ts Level 3 엔드포인트 - 메모리 통합
  - 이전 대화 기록 조회 및 컨텍스트 포함
  - 유저 요약 정보 활용
  - 대화 후 자동 저장
  - 10번 대화마다 유저 요약 자동 생성

#### Client 구현 ✅
- [x] api.ts - getUserId() 함수 (localStorage 기반)
- [x] api.ts - Level 3+ API 호출 시 userId 자동 전송

---

## 현재 상태

**Level 1~3 완료, Level 4 진행 예정**

```
Level 1 ✅ 밤이 (기본 API) - 완료
Level 2 ✅ 루나 (RAG) - 완료
Level 3 ✅ 해나 (Memory) - 완료
Level 4 🔄 별이 (Personality) - 임시 구현, TODO: 호감도 DB

4 NPC 배치 ✅ 일렬 배치
├── (-9, 0, -2): 밤이 (Lv.1)
├── (-3, 0, -2): 루나 (Lv.2)
├── (3, 0, -2): 해나 (Lv.3)
└── (9, 0, -2): 별이 (Lv.4)

레벨별 차별화 ✅
├── Level 1: 대화만 가능 (기억 없음)
├── Level 2: 대화 + RAG 메뉴 (마을 정보, 장소, 소문)
├── Level 3: 대화 + 메모리 (이전 대화 기억, 유저 정보 요약)
└── Level 4: 대화만 가능 (TODO: 호감도 시스템)
```

---

## 실행 방법

### 1. 환경변수 설정

**루트 `.env` (통합 관리)**:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx           # Level 2: 임베딩용
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
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

### 3. DB 확인 및 시드 (필요 시)
```bash
cd server
npm run check-db   # DB 데이터 확인
npm run seed       # Level 2 지식 데이터 임베딩 (knowledge 테이블)
```

### 4. 실행
```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

### 5. 접속
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

### 1. 테스트 (현재 진행 중)
- [x] Level 2 RAG 지식 데이터 seed 완료 (knowledge 테이블 15개)
- [x] Level 2 RAG NPC (루나) 테스트 완료
- [ ] Level 3 Memory NPC (해나) 테스트 - **구조 개선 필요**
- [ ] Level 4 Personality NPC (별이) 테스트

### Level 3 구조 개선 필요 ⚠️

**레벨별 차별점 정리:**
| Level | 핵심 기능 | 차별점 |
|-------|----------|--------|
| 1 | 기본 API | 기억 없음 |
| 2 | RAG | 세계관 지식 |
| 3 | Memory | 대화 기억 (누구인지, 뭘 말했는지) |
| 4 | Personality | 호감도 + 감정 (태도 변화, 감정 상태) |

**현재 문제점:**
- 사용자가 먼저 "내 이름은 뭐야" 라고 말해야 정보가 저장됨
- 뜬금없이 자기 정보를 말하는 건 부자연스러운 UX

**개선 방향 (메모리 기반 행동, 성격/감정은 Level 4 영역):**
1. **첫 방문 감지** → "처음 뵙네요, 이름이 어떻게 되세요?"
2. **재방문 감지** → "다시 오셨네요, 저번에 XX 얘기했었죠"
3. **대화 내용 기억** → 이전 대화 맥락 유지

**구현 완료:**
- [x] 첫 방문 감지 로직 (previousConversations.length === 0)
- [x] 첫 방문 시 "처음 온 손님입니다. 반갑게 인사하고 이름을 물어보세요." 컨텍스트 추가
- [x] 재방문 시 기존 로직 유지 (대화 기록 + 유저 요약 활용)

**변경 파일:** `server/src/routes/chat.ts` (Level 3 엔드포인트)

### 2. Level 4 Personality 구현 예정
1. Supabase `user_affinity` 테이블 생성
2. 호감도 조회/업데이트 기능 구현
3. 호감도에 따른 응답 변화 (친밀/보통/경계)
4. 대화 내용에 따른 호감도 증감

### 3. 배포 (최종 단계)
1. Server → Railway
2. Client → Vercel
3. 환경변수 설정

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React + Vite + TypeScript |
| 3D Engine | React Three Fiber + Three.js |
| Physics | @react-three/rapier |
| Styling | Tailwind CSS |
| Backend | Express.js + TypeScript |
| AI (대화) | Claude API (Anthropic SDK) |
| AI (임베딩) | OpenAI text-embedding-3-small [L2] |
| Vector DB | Supabase pgvector [L2] |
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
│   │   │   │   ├── SpeechBubble.tsx    # [L2] RAG 말풍선
│   │   │   │   └── ThirdPersonCamera.tsx  # 마우스 회전 카메라
│   │   │   ├── ui/
│   │   │   │   ├── ChatDialog.tsx      # 대화창
│   │   │   │   ├── ChatMessage.tsx     # 메시지 버블
│   │   │   │   ├── InteractionPrompt.tsx  # F키 안내
│   │   │   │   └── InteractionMenu.tsx    # [L2] 상호작용 메뉴
│   │   │   └── Game.tsx            # 게임 로직 통합
│   │   ├── hooks/
│   │   │   ├── useKeyboardControls.ts
│   │   │   ├── useChat.ts
│   │   │   └── useInteraction.ts
│   │   ├── lib/
│   │   │   └── api.ts              # API 호출 (+ getQuickInfo)
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
│   │   │   └── chat.ts             # /api/chat + /api/quick-info
│   │   ├── services/
│   │   │   ├── embeddingService.ts # [L2] OpenAI 임베딩
│   │   │   ├── vectorStore.ts      # [L2] Supabase 벡터 검색
│   │   │   └── memoryService.ts    # [L3] 대화 기록 관리
│   │   ├── data/
│   │   │   └── knowledge.json      # [L2] 세계관 지식 데이터
│   │   ├── sql/
│   │   │   └── conversations.sql   # [L3] 메모리 테이블 SQL
│   │   ├── scripts/
│   │   │   ├── supabase-setup.sql  # [L2] DB 설정 SQL
│   │   │   └── seedKnowledge.ts    # [L2] 지식 시드 스크립트
│   │   └── index.ts                # Express 서버
│   ├── .env.example
│   └── package.json
│
├── CLAUDE.md                       # Claude AI 작업 지침
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
