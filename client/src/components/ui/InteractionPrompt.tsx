interface InteractionPromptProps {
  show: boolean;
}

export default function InteractionPrompt({ show }: InteractionPromptProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-1/3 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-black/80 text-white px-6 py-3 rounded-lg flex items-center gap-3 animate-pulse">
        <span className="bg-white text-black px-2 py-1 rounded font-bold text-sm">F</span>
        <span>대화하기</span>
      </div>
    </div>
  );
}
