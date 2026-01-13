import type { NPCLevel } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export type InfoCategory = 'history' | 'location' | 'npc' | 'rumor';

// 레벨별 API 엔드포인트 매핑
const LEVEL_ENDPOINTS: Record<NPCLevel, string> = {
  1: '/chat/level1',
  2: '/chat/level2',
  3: '/chat/level3',
  4: '/chat/level4',
};

// userId 생성 및 저장 (localStorage 사용)
export function getUserId(): string {
  const storageKey = 'npc-demo-user-id';
  let userId = localStorage.getItem(storageKey);

  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(storageKey, userId);
  }

  return userId;
}

export async function sendMessage(message: string): Promise<string> {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  const data = await response.json();
  return data.response;
}

// 레벨별 메시지 전송
export async function sendMessageByLevel(message: string, level: NPCLevel): Promise<string> {
  const endpoint = LEVEL_ENDPOINTS[level];

  // Level 3, 4는 userId 필요 (메모리/호감도 시스템)
  const body: { message: string; userId?: string } = { message };
  if (level >= 3) {
    body.userId = getUserId();
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  const data = await response.json();
  return data.response;
}

export async function getQuickInfo(category: InfoCategory): Promise<string> {
  const response = await fetch(`${API_URL}/quick-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ category }),
  });

  if (!response.ok) {
    throw new Error('Failed to get info');
  }

  const data = await response.json();
  return data.response;
}
