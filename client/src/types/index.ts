export type ChatMessage = {
  id: string;
  role: 'user' | 'npc';
  content: string;
  timestamp: Date;
};

export type PlayerPosition = {
  x: number;
  y: number;
  z: number;
};

export type NPCLevel = 1 | 2 | 3 | 4;

export type NPCConfig = {
  id: string;
  name: string;
  level: NPCLevel;
  position: [number, number, number];
  role: string;
  description: string;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  greeting: string;
};

// 4명의 NPC 설정 (일렬 배치)
export const NPC_CONFIGS: NPCConfig[] = [
  {
    id: 'npc-level1',
    name: '밤이',
    level: 1,
    position: [-9, 0, -2],
    role: '졸린 경비원',
    description: 'Level 1: 기본 API - 매 대화 독립적, 기억 없음',
    colorTheme: {
      primary: '#1e3a5f',
      secondary: '#3b82f6',
      accent: '#60a5fa',
    },
    greeting: '음... 무슨 일이야...? 😴',
  },
  {
    id: 'npc-level2',
    name: '루나',
    level: 2,
    position: [-3, 0, -2],
    role: '마을 안내원',
    description: 'Level 2: RAG - 마을 지식 보유',
    colorTheme: {
      primary: '#4c1d95',
      secondary: '#8b5cf6',
      accent: '#ec4899',
    },
    greeting: '안녕하세요, 여행자님! ✨',
  },
  {
    id: 'npc-level3',
    name: '해나',
    level: 3,
    position: [3, 0, -2],
    role: '친근한 상인',
    description: 'Level 3: Memory - 대화 기억, 유저 정보 저장',
    colorTheme: {
      primary: '#b45309',
      secondary: '#f59e0b',
      accent: '#fbbf24',
    },
    greeting: '어서와요! 오늘도 좋은 물건 있어요! 🛒',
  },
  {
    id: 'npc-level4',
    name: '별이',
    level: 4,
    position: [9, 0, -2],
    role: '신비로운 점술가',
    description: 'Level 4: Personality - 호감도, 감정 상태',
    colorTheme: {
      primary: '#134e4a',
      secondary: '#14b8a6',
      accent: '#5eead4',
    },
    greeting: '운명이 당신을 이끌었군요... 🔮',
  },
];

export type NPCData = {
  id: string;
  name: string;
  position: PlayerPosition;
};
