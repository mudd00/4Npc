interface InteractionPromptProps {
  show: boolean;
  npcName?: string;
}

export default function InteractionPrompt({ show, npcName }: InteractionPromptProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-1/4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-black/80 text-white px-5 py-2 rounded-lg flex items-center gap-3">
        <span className="bg-purple-500 text-white px-2 py-1 rounded font-bold text-xs">F</span>
        <span className="text-sm">{npcName ? `${npcName}와(과) 대화하기` : '대화하기'}</span>
      </div>
    </div>
  );
}
