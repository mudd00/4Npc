import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../../lib/api';

type ConnectionState = 'connected' | 'disconnected' | 'checking';

interface ConnectionStatusProps {
  checkInterval?: number; // 체크 간격 (ms)
}

export default function ConnectionStatus({ checkInterval = 10000 }: ConnectionStatusProps) {
  const [status, setStatus] = useState<ConnectionState>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const performHealthCheck = useCallback(async () => {
    const isHealthy = await checkHealth();
    const newStatus: ConnectionState = isHealthy ? 'connected' : 'disconnected';

    // 상태가 변경되면 토스트 표시
    if (status !== 'checking' && status !== newStatus) {
      if (newStatus === 'disconnected') {
        setToastMessage('서버 연결이 끊어졌습니다');
      } else {
        setToastMessage('서버에 다시 연결되었습니다');
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }

    setStatus(newStatus);
    setLastChecked(new Date());
  }, [status]);

  // 초기 체크 및 주기적 체크
  useEffect(() => {
    performHealthCheck();

    const interval = setInterval(performHealthCheck, checkInterval);
    return () => clearInterval(interval);
  }, [checkInterval, performHealthCheck]);

  // 상태별 스타일
  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      text: '연결됨',
      pulse: false,
    },
    disconnected: {
      color: 'bg-red-500',
      text: '연결 끊김',
      pulse: true,
    },
    checking: {
      color: 'bg-yellow-500',
      text: '확인 중...',
      pulse: true,
    },
  };

  const config = statusConfig[status];

  return (
    <>
      {/* 연결 상태 인디케이터 */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
        }}
        title={lastChecked ? `마지막 확인: ${lastChecked.toLocaleTimeString()}` : '확인 중...'}
      >
        <div className="relative">
          <div
            className={`w-2 h-2 rounded-full ${config.color}`}
          />
          {config.pulse && (
            <div
              className={`absolute inset-0 w-2 h-2 rounded-full ${config.color} animate-ping`}
            />
          )}
        </div>
        <span className="text-white/80">{config.text}</span>
      </div>

      {/* 상태 변경 토스트 */}
      {showToast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg transition-all duration-300 ${
            status === 'connected' ? 'bg-green-600' : 'bg-red-600'
          }`}
          style={{
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          {toastMessage}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </>
  );
}
