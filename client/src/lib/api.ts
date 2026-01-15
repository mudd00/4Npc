import type { NPCLevel } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export type InfoCategory = 'history' | 'location' | 'npc' | 'rumor';

// 레벨별 API 엔드포인트 매핑 (스트리밍)
const LEVEL_STREAM_ENDPOINTS: Record<NPCLevel, string> = {
  1: '/chat/level1/stream',
  2: '/chat/level2/stream',
  3: '/chat/level3/stream',
  4: '/chat/level4/stream',
};

// 레벨별 API 엔드포인트 매핑 (일반 - 하위호환)
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

// 레벨별 메시지 전송 (일반 - 하위호환)
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

// 레벨별 메시지 전송 (스트리밍)
export async function sendMessageByLevelStream(
  message: string,
  level: NPCLevel,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> {
  const endpoint = LEVEL_STREAM_ENDPOINTS[level];

  const body: { message: string; userId?: string } = { message };
  if (level >= 3) {
    body.userId = getUserId();
  }

  try {
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

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              onChunk(parsed.text);
            }
            if (parsed.error) {
              onError(new Error(parsed.error));
              return;
            }
          } catch {
            // JSON 파싱 실패 무시
          }
        }
      }
    }

    onDone();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'));
  }
}

// Level 3 대화 시작 (일반 - 하위호환)
export async function startLevel3Conversation(): Promise<{ response: string; isFirstVisit: boolean }> {
  const response = await fetch(`${API_URL}/chat/level3/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: getUserId() }),
  });

  if (!response.ok) {
    throw new Error('Failed to start conversation');
  }

  return response.json();
}

// Level 3 대화 시작 (스트리밍)
export async function startLevel3ConversationStream(
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/chat/level3/start/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: getUserId() }),
    });

    if (!response.ok) {
      throw new Error('Failed to start conversation');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              onChunk(parsed.text);
            }
            if (parsed.error) {
              onError(new Error(parsed.error));
              return;
            }
          } catch {
            // JSON 파싱 실패 무시
          }
        }
      }
    }

    onDone();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'));
  }
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
