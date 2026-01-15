import type { NPCConfig } from '../../types';

interface TechInfoPanelProps {
  npcConfig: NPCConfig | null;
  show: boolean;
}

// 레벨별 기술 스택 정보
const TECH_INFO: Record<number, {
  title: string;
  subtitle: string;
  features: string[];
  techStack: string[];
}> = {
  1: {
    title: 'Basic API',
    subtitle: '기본 Claude API 연동',
    features: [
      '단일 턴 대화',
      '시스템 프롬프트 기반 성격',
      '대화 기억 없음',
    ],
    techStack: ['Claude API', 'Streaming SSE'],
  },
  2: {
    title: 'RAG (검색 증강 생성)',
    subtitle: '벡터 DB 기반 지식 검색',
    features: [
      '세계관 지식 검색',
      '유사도 기반 문서 매칭',
      '컨텍스트 주입',
    ],
    techStack: ['OpenAI Embeddings', 'Supabase pgvector', 'Cosine Similarity'],
  },
  3: {
    title: 'Memory System',
    subtitle: '대화 기록 + 유저 정보 기억',
    features: [
      '대화 히스토리 저장',
      '유저 정보 요약 생성',
      '재방문 감지',
    ],
    techStack: ['Supabase DB', 'Context Window', 'Auto Summary'],
  },
  4: {
    title: 'Personality + Affinity',
    subtitle: '호감도 기반 동적 성격',
    features: [
      '호감도 시스템 (0~100)',
      '단계별 말투 변화',
      '대화 내용 AI 분석',
      '메모리 시스템 통합',
    ],
    techStack: ['Dynamic Prompts', 'Sentiment Analysis', 'State Machine'],
  },
};

export default function TechInfoPanel({ npcConfig, show }: TechInfoPanelProps) {
  if (!show || !npcConfig) return null;

  const info = TECH_INFO[npcConfig.level];
  if (!info) return null;

  return (
    <div
      className="absolute bottom-24 left-4 w-72 rounded-xl overflow-hidden shadow-2xl"
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* 헤더 */}
      <div
        className="px-4 py-3"
        style={{
          background: `linear-gradient(135deg, ${npcConfig.colorTheme.primary}, ${npcConfig.colorTheme.secondary})`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold text-white">
            Lv.{npcConfig.level}
          </span>
          <span className="text-white font-bold">{info.title}</span>
        </div>
        <p className="text-white/80 text-xs mt-1">{info.subtitle}</p>
      </div>

      {/* 기능 목록 */}
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-gray-400 text-xs font-semibold mb-2">주요 기능</p>
        <ul className="space-y-1">
          {info.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 기술 스택 */}
      <div className="px-4 py-3">
        <p className="text-gray-400 text-xs font-semibold mb-2">기술 스택</p>
        <div className="flex flex-wrap gap-1.5">
          {info.techStack.map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                background: `${npcConfig.colorTheme.primary}30`,
                color: npcConfig.colorTheme.accent,
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
