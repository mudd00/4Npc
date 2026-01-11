export interface ChatMessage {
  id: string;
  role: 'user' | 'npc';
  content: string;
  timestamp: Date;
}

export interface PlayerPosition {
  x: number;
  y: number;
  z: number;
}

export interface NPCData {
  id: string;
  name: string;
  position: PlayerPosition;
}
