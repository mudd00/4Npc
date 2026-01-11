# NPC Level 1: Basic API NPC

Claude API를 활용한 기본 대화형 NPC 프로젝트

## 기술 스택

- **Frontend**: React + Vite + TypeScript + React Three Fiber + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **AI**: Claude API (Anthropic)

## 프로젝트 구조

```
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── three/     # 3D 컴포넌트 (Scene, Player, NPC, Map)
│   │   │   └── ui/        # UI 컴포넌트 (ChatDialog, InteractionPrompt)
│   │   ├── hooks/         # React hooks
│   │   ├── lib/           # API 호출 유틸
│   │   └── types/         # TypeScript 타입
│   └── public/models/     # 3D 모델 파일 (GLB)
│
└── server/                 # Backend (Express)
    └── src/
        ├── routes/        # API 라우트
        └── index.ts       # Express 서버
```

## 설치 및 실행

### 1. 환경변수 설정

**Server** (`server/.env`):
```env
ANTHROPIC_API_KEY=your-api-key-here
PORT=3001
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

### 2. 의존성 설치

```bash
# Client
cd client && npm install

# Server
cd server && npm install
```

### 3. 개발 서버 실행

```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

### 4. 접속

브라우저에서 `http://localhost:5173` 접속

## 조작 방법

- **WASD**: 캐릭터 이동
- **F**: NPC와 대화 (NPC 근처에서)
- **ESC**: 대화창 닫기

## 3D 모델 (선택사항)

GLB 형식의 캐릭터 모델이 있다면 `client/public/models/` 폴더에 넣으세요.
- `player.glb`: 플레이어 캐릭터
- `npc.glb`: NPC 캐릭터

현재는 기본 도형으로 캐릭터가 표시됩니다.

## 배포

- **Frontend**: Vercel
- **Backend**: Railway

## 다음 단계 (Level 2+)

- Level 2: RAG로 NPC 성격/지식 주입
- Level 3: Vector DB로 대화 기억
- Level 4: 호감도/감정 시스템
