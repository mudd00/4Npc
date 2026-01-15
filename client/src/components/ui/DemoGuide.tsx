import { useState, useEffect } from 'react';

const GUIDE_STORAGE_KEY = '4npc-demo-guide-seen';

interface DemoGuideProps {
  onComplete: () => void;
}

export default function DemoGuide({ onComplete }: DemoGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(GUIDE_STORAGE_KEY);
    if (!seen) {
      setIsVisible(true);
    }
  }, []);

  const steps = [
    {
      title: '4 NPC 데모에 오신 것을 환영합니다!',
      description: '이 데모는 AI NPC의 4가지 기술 레벨을 체험할 수 있는 포트폴리오 프로젝트입니다.',
      icon: '🎮',
    },
    {
      title: 'NPC와 만나기',
      description: 'WASD로 이동하고 마우스로 시점을 회전하세요. 각 NPC에게 다가가면 상호작용할 수 있습니다.',
      icon: '🚶',
    },
    {
      title: 'NPC 레벨 이해하기',
      description: 'Lv.1~4의 NPC가 있으며, 각각 다른 AI 기술을 보여줍니다. 좌측 패널에서 기술 스택을 확인하세요.',
      icon: '📊',
    },
    {
      title: 'F키로 상호작용',
      description: 'NPC 근처에서 F키를 누르면 대화 메뉴가 열립니다. 각 NPC만의 특별한 기능을 체험해보세요!',
      icon: '💬',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(GUIDE_STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #1e1b4b, #312e81)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-purple-900">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-10 text-center">
          <div className="text-5xl mb-4">{step.icon}</div>
          <h2 className="text-xl font-bold text-white mb-3">{step.title}</h2>
          <p className="text-purple-200 text-sm leading-relaxed">{step.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 pb-6">
          <button
            onClick={handleSkip}
            className="text-purple-300 text-sm hover:text-white transition-colors"
          >
            건너뛰기
          </button>

          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-purple-400' : 'bg-purple-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {currentStep === steps.length - 1 ? '시작하기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
}
