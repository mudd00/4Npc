# NPC 프로젝트 진행 상황

> 이 파일은 Claude AI가 작업을 이어서 진행할 수 있도록 현재 상태와 다음 단계를 기록합니다.
> 새 세션에서 이 파일을 먼저 읽어주세요.

---

## ⚡ 빠른 상태 요약 (새 세션용)

**마지막 업데이트**: 2026-01-16

**현재 상태**: ✅ **개발 완료** - 배포 준비 단계

**완료된 핵심 기능**:
- Level 1~4 NPC 시스템 전체 구현 완료
- 호감도 시스템, 메모리 시스템, RAG 시스템 모두 동작
- UI/UX 개선 (호감도 피드백, 리셋 버튼, 관계 표시, 디버그 모드 등) 완료
- 데모 가이드, 기술 설명 패널, 대화 기록 저장 등 추가 기능 완료
- 서버 연결 상태 표시 기능 추가 (ConnectionStatus)
- Tab키 도움말 패널 추가 및 UI 개선 (HelpPanel)
  - 프로젝트 소개, NPC 레벨 설명, 조작법, 채팅창 기능, 기술 스택
  - 카드 그리드 형태의 조작법/기술 스택 UI

**다음 할 일**:
1. 배포 (Railway + Vercel)
2. (선택) 추가 개선 사항

**실행 방법**:
```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev

# 접속: http://localhost:5173
```

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
- [x] /api/chat/level4 - Personality + 호감도 (별이) ✅ 완성
- [x] /api/chat/level4/start/stream - Level 4 대화 시작 ✅
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

### Level 4: Personality NPC ✅ 완료

#### 호감도 시스템 설계
- **시작 호감도**: 0점 (경계 상태에서 시작)
- **최대 호감도**: 100점
- **호감도 단계**:
  - 0~25: 경계 (stranger) - 신비롭고 거리감 있는 태도
  - 26~50: 보통 (acquaintance) - 정중하지만 거리감
  - 51~75: 친밀 (friend) - 부드럽고 친근한 태도
  - 76~100: 절친 (close_friend) - 편한 말투, 비밀 공유

#### Supabase 테이블 ✅
- [x] `user_affinity` 테이블 - 호감도 저장
  - user_id, npc_id, affinity_score, total_conversations, last_interaction
- [x] `get_user_affinity` 함수 - 호감도 조회
- [x] `update_user_affinity` 함수 - 호감도 업데이트 (upsert)
- [x] SQL 파일: `server/src/sql/affinity.sql`

#### Server 구현 ✅
- [x] affinityService.ts - 호감도 조회/업데이트, 레벨별 프롬프트 생성
  - `getAffinity()` - 호감도 조회
  - `updateAffinity()` - 호감도 업데이트
  - `getPersonalityPrompt()` - 호감도 기반 시스템 프롬프트 생성
  - `AFFINITY_ANALYSIS_PROMPT` - 대화 분석용 프롬프트
- [x] chat.ts Level 4 엔드포인트 업데이트
  - `/chat/level4/stream` - 스트리밍 + 호감도
  - `/chat/level4` - 일반 + 호감도
  - `/chat/level4/start/stream` - 대화 시작 (NPC 먼저 인사)
  - `analyzeAndUpdateAffinity()` - 대화 분석 후 호감도 변화

#### Client 구현 ✅
- [x] api.ts - `startLevel4ConversationStream()` 함수 추가
- [x] useChat.ts - Level 4 시작 대화 지원, affinityInfo 상태 추가
- [x] Game.tsx - Level 4 자동 대화 시작, affinityInfo 전달
- [x] ChatDialog.tsx - 호감도 바 UI 표시 (Level 4 전용)

#### 호감도 변화 로직
- **증가 요인**: 예의 바른 인사(+2), 관심 있는 질문(+1), 칭찬/감사(+3)
- **감소 요인**: 무례한 말(-3), 짜증내는 말투(-2), 무시하는 태도(-2)
- Claude가 대화 분석 후 JSON으로 호감도 변화량 반환

---

### UI/UX 개선 (추가 기능) ✅ 완료

#### 1. 호감도 시각적 피드백
- [x] 호감도 변화 시 바 색상 플래시 (초록/빨강)
- [x] "+3" / "-2" 같은 변화량 표시 (애니메이션)
- [x] 레벨 변화 시 토스트 알림 ("관계가 '친밀'로 발전했습니다!")

#### 2. 리셋 버튼 (데모용)
- [x] Level 3, 4 채팅창 헤더에 리셋 버튼 추가
- [x] 클릭 시 확인 다이얼로그
- [x] 메모리 + 호감도 초기화
- [x] `/api/reset` 엔드포인트 추가

#### 3. NPC 위 관계 표시
- [x] Level 3 (해나): "기억함 ✓" 표시 (재방문 시)
- [x] Level 4 (별이): 호감도 아이콘 표시 (😐→🙂→😊→💜)
- [x] `/api/relationship-status` 엔드포인트 추가

---

## 현재 상태 (2026-01-16 최신)

**🎉 Level 1~4 + 모든 추가 기능 완료**

```
Core Features ✅
├── Level 1 ✅ 밤이 (기본 API) - Claude API 기본 연동
├── Level 2 ✅ 루나 (RAG) - 세계관 지식 검색
├── Level 3 ✅ 해나 (Memory) - 대화 기록 + 유저 정보 요약
└── Level 4 ✅ 별이 (Personality) - 호감도 시스템 + 태도 변화

4 NPC 배치 ✅ 일렬 배치
├── (-9, 0, -2): 밤이 (Lv.1)
├── (-3, 0, -2): 루나 (Lv.2)
├── (3, 0, -2): 해나 (Lv.3)
└── (9, 0, -2): 별이 (Lv.4)

추가 기능 ✅
├── 호감도 시각적 피드백 (바 플래시, 변화량 표시, 레벨업 토스트)
├── 리셋 버튼 (Level 3, 4 - 메모리/호감도 초기화)
├── NPC 위 관계 표시 (기억함 ✓, 호감도 아이콘)
├── 레벨별 기술 설명 패널 (TechInfoPanel)
├── NPC 바라보기 애니메이션 (플레이어 방향으로 회전)
├── 대화 기록 세션 유지 (레벨별 저장)
├── 첫 방문자 데모 가이드 (DemoGuide)
├── 디버그 모드 (호감도 변화 이유 실시간 표시)
├── 서버 연결 상태 표시 (ConnectionStatus)
└── Tab 도움말 패널 (HelpPanel)
    ├── 프로젝트 소개
    ├── NPC 레벨 시스템 (그라데이션 카드)
    ├── 조작법 (아이콘 카드 그리드)
    ├── 채팅창 기능 설명
    └── 기술 스택 (아이콘 카드 그리드)
```

**상태**: 개발 완료, 테스트 및 배포 준비 단계

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

### 🚀 남은 작업

#### 1. 테스트 확인
- [x] Level 1 Basic API NPC (밤이) 테스트 완료
- [x] Level 2 RAG NPC (루나) 테스트 완료
- [x] Level 3 Memory NPC (해나) 테스트 완료
- [x] Level 4 Personality NPC (별이) 테스트 완료
- [x] 호감도 시스템 동작 확인 완료

#### 2. 배포 (예정)
- [ ] Server → Railway 배포
- [ ] Client → Vercel 배포
- [ ] 환경변수 설정

#### 3. 선택적 개선 (필요 시)
- [x] 연결 상태 표시 ✅ 완료
- [ ] NPC idle 애니메이션 다양화
- [ ] 모바일 반응형 UI
- [ ] 다국어 지원

---

### ✅ 최근 완료 작업 (2026-01-16)

#### HelpPanel UI 개선

| # | 작업 | 설명 |
|---|------|------|
| 1 | 서버 연결 상태 표시 | HUD에 ConnectionStatus 통합, 실시간 서버 상태 확인 |
| 2 | Tab 도움말 패널 | 프로젝트 전체 설명, NPC 레벨, 조작법, 채팅창 기능, 기술 스택 |
| 3 | HelpPanel UI 개선 | 섹션 간격 개선 (flex flex-col gap-10) |
| 4 | 조작법 카드 UI | 아이콘 + 키보드 키 + 설명 형태의 카드 그리드 |
| 5 | 기술 스택 카드 UI | 아이콘 + 기술명 + 카테고리 형태의 카드 그리드 |

**새로 추가된 컴포넌트:**
- `client/src/components/ui/ConnectionStatus.tsx` - 서버 연결 상태 표시
- `client/src/components/ui/HelpPanel.tsx` - Tab 도움말 패널

---

### ✅ 이전 완료 작업 (2025-01-15)

#### 추가 개선 작업 5개 완료

| # | 작업 | 설명 |
|---|------|------|
| 1 | 레벨별 기술 설명 패널 | NPC 근처에서 좌측 하단에 기술 스택 설명 표시 |
| 2 | NPC 바라보기 애니메이션 | 플레이어 접근 시 NPC가 부드럽게 바라봄 |
| 3 | 대화 기록 저장 | 세션 동안 레벨별 대화 내용 유지 |
| 4 | 데모 가이드 | 첫 접속 시 4단계 온보딩 가이드 표시 |
| 5 | 디버그 모드 | Level 4에서 호감도 변화 이유 실시간 표시 |

**새로 추가된 컴포넌트:**
- `client/src/components/ui/TechInfoPanel.tsx` - 레벨별 기술 스택/기능 설명 패널
- `client/src/components/ui/DemoGuide.tsx` - 첫 방문자용 온보딩 가이드

**변경된 파일:**
- `NPC.tsx` - useFrame으로 플레이어 바라보기 애니메이션 추가
- `Scene.tsx` - playerPosition 상태 추가 및 NPC에 전달
- `useChat.ts` - 레벨별 메시지 저장소 (messagesByLevel, affinityByLevel)
- `Game.tsx` - DemoGuide 추가, 채팅창 닫을 때 메시지 유지
- `ChatDialog.tsx` - 디버그 모드 토글 및 패널 추가 (Level 4 전용)
- `chat.ts` (Server) - affinityReason을 SSE 이벤트에 포함
- `api.ts` - affinityReason 파싱 추가

#### 호감도 시스템 조정
- 존댓말 점수: 경계 단계(0~25)에서만 +1, 보통 단계(26~50)에서는 0으로 변경
- 변경 파일: `affinityService.ts`

### Level 3 구조 개선 ✅ 완료

**레벨별 차별점 정리:**
| Level | 핵심 기능 | 차별점 |
|-------|----------|--------|
| 1 | 기본 API | 기억 없음 |
| 2 | RAG | 세계관 지식 |
| 3 | Memory | 대화 기억 (누구인지, 뭘 말했는지) |
| 4 | Personality | 호감도 + 감정 (태도 변화, 감정 상태) |

**구현 완료:**
- [x] 첫 방문 감지 로직 (previousConversations.length === 0)
- [x] 첫 방문 시 "처음 온 손님입니다. 반갑게 인사하고 이름을 물어보세요." 컨텍스트 추가
- [x] 재방문 시 기존 로직 유지 (대화 기록 + 유저 요약 활용)
- [x] **NPC가 먼저 인사하는 자연스러운 UX 구현**
  - Server: `/api/chat/level3/start` 엔드포인트 추가
  - Client: `startLevel3Conversation()` 함수 추가 (api.ts)
  - Client: `startConversation` 훅 함수 추가 (useChat.ts)
  - Client: 채팅창 열릴 때 자동 호출 (Game.tsx)

**변경 파일:**
- `server/src/routes/chat.ts` (Level 3 start 엔드포인트)
- `client/src/lib/api.ts` (startLevel3Conversation 함수)
- `client/src/hooks/useChat.ts` (startConversation 함수)
- `client/src/components/Game.tsx` (채팅창 열릴 때 자동 호출)

### 스트리밍 응답 구현 ✅ 완료

모든 레벨(1~4)에 스트리밍 적용 완료. 응답이 실시간으로 타이핑되듯 표시됨.

**Server 변경:**
- `chat.ts`: 각 레벨별 `/stream` 엔드포인트 추가
  - `/chat/level1/stream`
  - `/chat/level2/stream`
  - `/chat/level3/stream`
  - `/chat/level3/start/stream`
  - `/chat/level4/stream`
- Claude API `stream()` 메서드 사용
- SSE(Server-Sent Events) 형식으로 응답

**Client 변경:**
- `api.ts`: 스트리밍 함수 추가
  - `sendMessageByLevelStream()` - 콜백 기반 스트리밍
  - `startLevel3ConversationStream()` - Level 3 시작 스트리밍
- `useChat.ts`: 스트리밍 응답 실시간 업데이트
  - 빈 메시지 먼저 추가 → 청크마다 내용 추가

**장점:**
- 첫 글자가 바로 표시되어 체감 응답 속도 향상
- API 비용 동일 (토큰 수 기반 과금)
- ChatGPT 스타일 UX

### UI/UX 개선 ✅ 완료

**채팅 UI 개선:**
- [x] 타이핑 인디케이터 - 첫 청크 대기 중일 때만 "..." 애니메이션 표시
- [x] 채팅창 자동 스크롤 - 새 메시지 시 하단으로 스크롤
- [x] NPC 프로필 이미지 - NPC 색상 테마 기반 아이콘 (첫 글자)
- [x] 메시지 시간 표시 - 각 메시지에 HH:MM 형식 타임스탬프
- [x] 입력창 개선 - textarea로 변경, Enter 전송, Shift+Enter 줄바꿈, 자동 높이 조절

**추가 기능:**
- [x] 복사 버튼 - NPC 메시지 호버 시 📋 버튼, 클릭 시 클립보드 복사
- [x] 피드백 버튼 (👍👎) - NPC 메시지 호버 시 좋아요/싫어요 버튼
- [x] 퀵 리플라이 버튼 - NPC 레벨별 추천 질문 버튼 (대화 초반에만 표시)

**모던 UI 디자인 개선:**
- [x] 글래스모피즘 효과 - 채팅창 배경 블러 + 반투명 효과
- [x] 그라데이션 배경 - NPC 색상 테마 기반 동적 배경
- [x] 모던 메시지 버블 - 흰색 배경 + 섀도우 + 둥근 모서리
- [x] 개선된 입력창 - 아이콘 전송 버튼 + 호버 애니메이션
- [x] 세련된 헤더 - NPC 아바타 + 온라인 상태 표시
- [x] 부드러운 트랜지션 - 버튼 호버/클릭 애니메이션

**변경 파일:**
- `client/src/components/ui/ChatMessage.tsx` - 모던 메시지 버블, 복사/피드백 버튼
- `client/src/components/ui/ChatDialog.tsx` - 글래스모피즘, 모던 레이아웃, 퀵 리플라이

**게임 경험 개선 (선택 사항):**
- [x] NPC 바라보기 - 플레이어 접근 시 NPC가 바라봄 ✅ 완료
- [ ] 사운드 효과 - 메시지 도착음, 대화 시작음 (제외됨 - 데모 목적상 불필요)
- [ ] NPC idle 모션 다양화 - 대기 중 자연스러운 움직임

**기능 개선:**
- [x] 대화 기록 저장 - 세션 동안 레벨별 유지 ✅ 완료
- [x] 연결 상태 표시 - 서버 연결 상태 실시간 표시 ✅ 완료 (2025-01-16)

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
│   │   │   │   ├── Scene.tsx       # R3F Canvas + Physics + playerPosition
│   │   │   │   ├── Map.tsx         # 맵 + 물리 충돌
│   │   │   │   ├── Player.tsx      # Rapier 기반 플레이어
│   │   │   │   ├── NPC.tsx         # NPC + 이름표 + 바라보기 애니메이션
│   │   │   │   ├── CharacterModel.tsx  # GLTF 모델 + 애니메이션
│   │   │   │   ├── SpeechBubble.tsx    # [L2] RAG 말풍선
│   │   │   │   └── ThirdPersonCamera.tsx  # 마우스 회전 카메라
│   │   │   ├── ui/
│   │   │   │   ├── ChatDialog.tsx      # 대화창 + 호감도 UI + 디버그 모드
│   │   │   │   ├── ChatMessage.tsx     # 메시지 버블
│   │   │   │   ├── InteractionPrompt.tsx  # F키 안내
│   │   │   │   ├── InteractionMenu.tsx    # [L2] 상호작용 메뉴
│   │   │   │   ├── TechInfoPanel.tsx   # 레벨별 기술 설명 패널
│   │   │   │   ├── DemoGuide.tsx       # 첫 방문자 온보딩 가이드
│   │   │   │   ├── ConnectionStatus.tsx # 서버 연결 상태 표시
│   │   │   │   └── HelpPanel.tsx       # [NEW] Tab 도움말 패널
│   │   │   └── Game.tsx            # 게임 로직 통합 + 관계 상태 관리
│   │   ├── hooks/
│   │   │   ├── useKeyboardControls.ts
│   │   │   ├── useChat.ts          # 레벨별 메시지 저장소
│   │   │   └── useInteraction.ts
│   │   ├── lib/
│   │   │   └── api.ts              # API 호출 (+ affinityReason)
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
│   │   │   └── chat.ts             # 모든 레벨 API + 스트리밍 + 리셋
│   │   ├── services/
│   │   │   ├── embeddingService.ts # [L2] OpenAI 임베딩
│   │   │   ├── vectorStore.ts      # [L2] Supabase 벡터 검색
│   │   │   ├── memoryService.ts    # [L3] 대화 기록 관리
│   │   │   └── affinityService.ts  # [L4] 호감도 시스템
│   │   ├── data/
│   │   │   └── knowledge.json      # [L2] 세계관 지식 데이터
│   │   ├── sql/
│   │   │   ├── conversations.sql   # [L3] 메모리 테이블 SQL
│   │   │   └── affinity.sql        # [L4] 호감도 테이블 SQL
│   │   ├── scripts/
│   │   │   ├── supabase-setup.sql  # [L2] DB 설정 SQL
│   │   │   └── seedKnowledge.ts    # [L2] 지식 시드 스크립트
│   │   └── index.ts                # Express 서버
│   ├── .env.example
│   └── package.json
│
├── CLAUDE.md                       # Claude AI 작업 지침
├── progress.md                     # 이 파일 (작업 진행 상황)
└── README.md
```

---

## NPC 성격/호감도 설계 철학

> **핵심 원칙**: NPC는 진짜 감정이 있는 존재처럼 느껴져야 한다.

### 1. NPC별 고유 성격 설계

각 NPC는 **고유한 말투 선호도**를 가져야 합니다. 호감도 시스템을 구현할 때, 단순히 "친절하면 +, 무례하면 -" 가 아니라 **해당 NPC의 성격에 맞게** 세부 규칙을 설계해야 합니다.

**예시 - 별이 (점술가)**:
- 경계 단계(0~25): 존댓말 +1, 반말 -2 (처음엔 예의를 중시)
- 보통 단계(26~50): 존댓말 0, 반말 -1
- 친밀/절친 단계(51~100): 존댓말 0, 반말 0 (친해지면 말투 자유)

다른 NPC는 다른 규칙을 가질 수 있습니다:
- **활발한 NPC**: 처음부터 반말에 관대할 수 있음
- **귀족 NPC**: 높은 호감도에서도 존댓말 선호
- **어린 NPC**: 반말을 쓰면 오히려 친근하게 느낄 수 있음

### 2. 호감도 변화 = 내용 점수 + 말투 점수

호감도 변화량은 **두 가지 요소**를 합산하여 계산합니다:

```
최종 호감도 변화 = 내용 점수 + 말투 점수
```

**내용 점수** (모든 NPC 공통):
- 인사: +1
- 관심 있는 질문: +1
- 칭찬/감사: +3
- 공감 표현: +2
- 호감 표현: +3
- 짜증/화: -2
- 무시하는 태도: -2
- 욕설/모욕: -3

**말투 점수** (NPC별, 호감도 단계별 다름):
- 현재 호감도 단계에 따라 동적으로 적용
- NPC의 성격에 맞게 커스터마이징

### 3. 관계 진행 마일스톤

높은 호감도에 도달하면 **특별한 이벤트**를 제안할 수 있습니다:
- 친밀(51~75): "이제 편하게 말 놓으셔도 돼요" 같은 제안
- 절친(76~100): 비밀 이야기 공유, 반말 사용

이러한 마일스톤은 관계 발전을 실감나게 합니다.

### 4. 구현 시 체크리스트

새 NPC를 만들 때 반드시 정의해야 할 것들:
- [ ] 기본 성격 및 말투
- [ ] 호감도 단계별 태도 변화 (4단계)
- [ ] 말투 점수 규칙 (호감도 단계별)
- [ ] 관계 마일스톤 이벤트
- [ ] 고유한 대화 스타일 (신비로운, 활발한, 차분한 등)

### 5. 현재 구현 상태 (별이)

`affinityService.ts`에 구현된 함수들:
- `getAffinityLevel(score)`: 점수 → 레벨 변환
- `getPersonalityPrompt(affinityData)`: 호감도 기반 시스템 프롬프트
- `getSpeechStyleScore(affinityScore, isFormal)`: 말투 점수 계산
- `getAffinityAnalysisPrompt(affinityScore)`: 호감도 단계별 분석 프롬프트

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
