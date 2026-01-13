# Claude AI 작업 지침

이 프로젝트에서 Claude AI가 따라야 할 규칙입니다.

---

## 필수 규칙

### 1. 작업 후 progress.md 최신화

**모든 작업 완료 후 반드시 `progress.md` 파일을 업데이트해야 합니다.**

업데이트 내용:
- 완료된 작업 체크 (`[x]`)
- 현재 진행 상황 갱신
- 다음 작업 목록 갱신
- 발생한 이슈 및 해결 방법

이유: 사용자가 다른 환경(다른 데스크탑)에서 작업을 이어갈 때 대화 세션이 달라지므로, progress.md를 통해 작업 연속성을 유지합니다.

### 2. 새 세션 시작 시

새로운 대화 세션에서는 **항상 progress.md를 먼저 읽고** 현재 상태를 파악합니다.

---

## 프로젝트 정보

- **목적**: 4단계 AI NPC 시스템 (포트폴리오 + NPC 경험 + 테스트)
- **Level 1**: Basic API NPC (완료)
- **Level 2**: RAG NPC (현재 작업 중)
- **Level 3**: Memory NPC (예정)
- **Level 4**: Personality NPC (예정)

---

## 환경 변수 위치

- 루트 `.env` 파일에 모든 API 키 통합 관리
- `ANTHROPIC_API_KEY`: Claude API
- `OPENAI_API_KEY`: 임베딩용
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: Vector DB

---

## 참고 파일

- `progress.md`: 작업 진행 상황
- `C:\Users\Jaewon\.claude\plans\cheerful-puzzling-mango.md`: 상세 설계 문서
