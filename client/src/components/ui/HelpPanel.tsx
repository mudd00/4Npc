interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] mx-4 rounded-2xl overflow-hidden shadow-2xl bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">4 NPC Demo</h2>
              <p className="text-white/80 mt-1">AI NPC 기술 포트폴리오</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8 flex flex-col gap-10" style={{ maxHeight: 'calc(90vh - 140px)' }}>

          {/* 프로젝트 소개 */}
          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-xl">
                🎮
              </span>
              프로젝트 소개
            </h3>
            <p className="text-slate-200 text-base leading-relaxed">
              <strong className="text-indigo-400">4 NPC Demo</strong>는 Claude API를 활용한
              <strong className="text-indigo-400"> 4단계 AI NPC 시스템</strong>입니다.
              각 NPC는 서로 다른 AI 기술을 보여주며, 레벨이 높아질수록 더 발전된 기능을 체험할 수 있습니다.
            </p>
          </section>

          {/* NPC 레벨 설명 */}
          <section>
            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
              <span className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-xl">
                👥
              </span>
              NPC 레벨 시스템
            </h3>
            <div className="space-y-3">
              {[
                {
                  level: 1,
                  name: '밤이',
                  role: '졸린 경비원',
                  tech: 'Basic API',
                  desc: '기본 Claude API 연동. 대화를 기억하지 않습니다.',
                  color: 'from-slate-500 to-slate-600',
                  badge: 'bg-slate-400',
                },
                {
                  level: 2,
                  name: '루나',
                  role: '마을 안내원',
                  tech: 'RAG (검색 증강 생성)',
                  desc: '세계관 지식을 검색하여 마을 정보를 알려줍니다.',
                  color: 'from-blue-500 to-blue-600',
                  badge: 'bg-blue-400',
                },
                {
                  level: 3,
                  name: '해나',
                  role: '친근한 상인',
                  tech: 'Memory (대화 기억)',
                  desc: '이전 대화 내용을 기억하고 맥락을 유지합니다.',
                  color: 'from-emerald-500 to-emerald-600',
                  badge: 'bg-emerald-400',
                },
                {
                  level: 4,
                  name: '별이',
                  role: '신비로운 점술가',
                  tech: 'Personality (호감도)',
                  desc: '호감도에 따라 태도와 말투가 변화합니다.',
                  color: 'from-purple-500 to-purple-600',
                  badge: 'bg-purple-400',
                },
              ].map((npc) => (
                <div
                  key={npc.level}
                  className={`bg-gradient-to-r ${npc.color} rounded-xl p-5 flex items-center gap-5`}
                >
                  <div className={`${npc.badge} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-xl">Lv.{npc.level}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-bold text-lg">{npc.name}</span>
                      <span className="text-white/70">- {npc.role}</span>
                    </div>
                    <p className="text-white/60 text-sm mb-1">{npc.tech}</p>
                    <p className="text-white/90">{npc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>


          {/* 조작법 */}
          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-xl">
                🎹
              </span>
              조작법
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'WASD', desc: '이동', icon: '🚶' },
                { key: '마우스', desc: '시점 회전', icon: '🖱️' },
                { key: 'F', desc: 'NPC 대화', icon: '💬' },
                { key: 'ESC', desc: '닫기', icon: '✖️' },
                { key: 'Tab', desc: '도움말', icon: '❓' },
                { key: 'Enter', desc: '전송', icon: '📤' },
              ].map((item) => (
                <div key={item.key} className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <span className="text-2xl block mb-2">{item.icon}</span>
                  <kbd className="bg-slate-600 text-white px-3 py-1 rounded-lg font-mono font-bold text-sm">
                    {item.key}
                  </kbd>
                  <p className="text-slate-300 text-sm mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>


          {/* 채팅창 기능 */}
          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
              <span className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-xl">
                💬
              </span>
              채팅창 기능
            </h3>

            <div className="space-y-4">
              {/* 관계 초기화 */}
              <div className="flex items-start gap-4 bg-slate-700/30 rounded-xl p-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold text-base">관계 초기화</p>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Lv.3, 4</span>
                  </div>
                  <p className="text-slate-300">대화 기록과 호감도를 초기화합니다. 처음부터 다시 시작할 수 있습니다.</p>
                </div>
              </div>

              {/* 디버그 모드 */}
              <div className="flex items-start gap-4 bg-slate-700/30 rounded-xl p-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold text-base">디버그 모드</p>
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">Lv.4 전용</span>
                  </div>
                  <p className="text-slate-300">AI가 호감도를 어떻게 분석했는지 실시간으로 확인할 수 있습니다.</p>
                </div>
              </div>

              {/* 호감도 바 */}
              <div className="flex items-start gap-4 bg-slate-700/30 rounded-xl p-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💜</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold text-base">호감도 바</p>
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">Lv.4 전용</span>
                  </div>
                  <p className="text-slate-300">상단에 호감도 게이지가 표시됩니다. 대화에 따라 증가/감소하며, 단계가 변하면 NPC의 태도가 바뀝니다.</p>
                </div>
              </div>
            </div>
          </section>


          {/* 기술 스택 */}
          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
              <span className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-xl">
                🛠
              </span>
              기술 스택
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'React', category: 'Frontend', icon: '⚛️' },
                { name: 'TypeScript', category: 'Language', icon: '📘' },
                { name: 'Three.js', category: '3D Engine', icon: '🎮' },
                { name: 'Claude API', category: 'AI', icon: '🤖' },
                { name: 'Supabase', category: 'Database', icon: '🗄️' },
                { name: 'Express.js', category: 'Backend', icon: '⚡' },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="bg-slate-700/50 rounded-xl p-4 text-center"
                >
                  <span className="text-2xl block mb-2">{tech.icon}</span>
                  <p className="text-white font-bold">{tech.name}</p>
                  <p className="text-slate-400 text-xs">{tech.category}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-slate-800 px-8 py-4 border-t border-slate-700">
          <p className="text-center text-slate-400">
            <kbd className="bg-slate-700 text-slate-300 px-2 py-1 rounded font-mono text-sm mx-1">Tab</kbd>
            또는
            <kbd className="bg-slate-700 text-slate-300 px-2 py-1 rounded font-mono text-sm mx-1">ESC</kbd>
            키를 눌러 닫기
          </p>
        </div>
      </div>
    </div>
  );
}
