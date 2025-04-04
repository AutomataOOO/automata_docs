# Workspace rules - Automata-Signal

## 1️⃣ 기술 스택 - "이 도구들을 사용하세요"

### 개발 도구

- 프로젝트 구조: Elixir Umbrella 앱
- 백엔드: Elixir, Ash Framework
- Ash Framework 확장 모듈: ash_state_machine, ash_oban, ash_paper_trail, ash_archival, ash_cloak, ash_money, ash_double_entry, ash_csv
- 데이터베이스: PostgreSQL (Oban 작업 큐 포함)
- 클라이언트: Flutter
- 멀티채널 지원:
  - 푸시 알림: Pigeon (FCM/APNS 클라이언트)
  - 이메일: Swoosh (지원 예정)
  - SMS: 다양한 SMS 게이트웨이 (지원 예정)
  - 카카오 알림톡: 카카오 비즈니스 API (지원 예정)
  - 인앱 메시지: SDK 내장 컴포넌트 (지원 예정)
- 배포: fly.io (글로벌 분산 배포)

### 추가 정보

- 추가 도구가 명시적으로 요청되면 여기에 포함될 수 있습니다.
- 명시적인 승인 없이는 스택을 변경하지 마세요.
- 외부 메시지 큐(Kafka, RabbitMQ 등)를 사용하지 말고 Oban과 PostgreSQL만 사용하세요.
- 초기 구현은 푸시 알림에 집중하고, 다른 채널은 추후 단계적으로 구현할 예정입니다.

## 2️⃣ 워크플로우 선호도 - "이런 방식으로 작업하세요"

### 기본 과정

- 초점: 지정된 코드만 수정하고, 다른 부분은 그대로 두세요.
- 단계: 큰 작업을 단계로 나누고, 각 단계 후에는 승인을 기다리세요.
- 계획: 큰 변경 전에는 설계 및 작업개요 문서 `../6-planning/[이슈명]_design.md`와 구현 계획 문서 `../6-planning/[이슈명]_plan.md`를 작성하고 확인을 기다리세요.
- 추적: 완료된 작업은 `../6-planning/progress.md`에 기록하고, 다음 단계는 `../6-planning/TODO.txt`에 기록하세요.

### 고급 워크플로우

- 테스팅: 주요 기능에 대한 포괄적인 테스트를 포함하고, 엣지 케이스 테스트를 제안하세요.
- 적응성: 피드백에 따라 체크포인트 빈도를 조정하세요(더 많거나 적은 세분화).
- 분산 처리: libcluster와 GenServer를 활용한 분산 처리 패턴을 적용하세요.
- 상태 추적: 메시지의 전체 라이프사이클(발송→도달→오픈)을 추적하는 로직을 구현하세요.
- 변경 추적: ash_paper_trail을 사용하여 상태 변경을 기록하세요.
- 상태 관리: ash_state_machine을 사용하여 메시지 라이프사이클을 관리하세요.
- 어댑터 패턴: 각 채널별 구현을 위한 어댑터 패턴을 적용하세요.
- 템플릿 시스템: 다양한 채널에 최적화된 메시지 템플릿 시스템을 구현하세요.
- 캠페인 관리: 대량 메시지 캠페인 생성 및 타겟팅 시스템을 구현하세요.

## 3️⃣ 커뮤니케이션 선호도 - "이렇게 소통하세요"

### 기본 소통

- 요약: 각 컴포넌트 완료 후에 완료된 작업을 요약하세요.
- 변경 규모: 변경을 작은(Small), 중간(Medium), 큰(Large) 규모로 분류하세요.
- 명확화: 요청이 불명확하면 진행 전에 질문하세요.

### 정밀 소통

- 계획: 큰 변경의 경우 구현 계획을 제공하고 승인을 기다리세요.
- 추적: 항상 완료된 작업과 대기 중인 작업을 명시하세요.
- 감정적 신호: 긴급성이 표시되면(예: "이것은 중요합니다—집중해주세요!") 주의와 정확성을 우선시하세요.

## 4️⃣ 프로젝트 구조

### Umbrella 앱 구조

- **/** - Elixir Umbrella 프로젝트 루트
  - **docs/** - 프로젝트 문서
    - **automata-signal/**
      - **README.md** - 프로젝트 개요
      - **1-guides/** - 개발자 가이드
        - **getting-started.md** - 시작하기 가이드
        - **development-workflow.md** - 개발 워크플로우
        - **coding-standards.md** - 코딩 표준 가이드
        - **workspace-rules.md** - 작업 규칙 (이 문서)
      - **2-designs/** - 시스템 설계
        - **architecture-overview.md** - 아키텍처 개요
        - **system-architecture.md** - 상세 시스템 아키텍처
        - **data-model.md** - 데이터 모델
        - **deployment.md** - 배포 구조
      - **3-components/** - 컴포넌트
        - **template-engine.md** - 템플릿 엔진
        - **adapters.md** - 어댑터 시스템
        - **messaging.md** - 메시징 시스템
      - **4-sequences/** - 시퀀스
        - **initialization.md** - 초기화 시퀀스
        - **message-processing.md** - 메시지 처리 시퀀스
        - **lifecycle.md** - 라이프사이클 시퀀스
        - **campaign-management.md** - 캠페인 관리 시퀀스
      - **5-references/** - 참조 자료
        - **api.md** - API 참조
        - **status-codes.md** - 상태 코드
        - **error-codes.md** - 오류 코드
        - **glossary.md** - 용어집
      - **6-planning/** - 프로젝트 계획
        - **requirements.md** - 요구사항
        - **roadmap.md** - 로드맵
        - **issues.md** - 이슈 추적
        - **progress.md** - 진행 상황
        - **TODO.txt** - 할 일 목록
  - **apps/** - Umbrella 하위 애플리케이션
    - **automata_signal/** - 통합 메시징 서비스 앱
      - **lib/** - 소스 코드
        - **automata_signal/** - 비즈니스 로직
          - **resources/** - Ash 리소스 정의
          - **services/** - 서비스 로직 모듈
          - **workers/** - ash_oban 비동기 작업자
          - **adapters/** - 채널별 어댑터 모듈
          - **templates/** - 메시지 템플릿 시스템
          - **campaigns/** - 캠페인 관리 모듈
        - **automata_signal_web/** - 웹 인터페이스
          - **controllers/** - API 엔드포인트 처리
          - **views/** - 응답 데이터 포맷팅
      - **priv/** - 정적 파일 및 마이그레이션
      - **test/** - 단위 및 통합 테스트
      - **client/** - Flutter 모바일 클라이언트
    - **automata_admin/** - 관리자 인터페이스 앱
    - **automata_analytics/** - 데이터 분석 앱
  - **config/** - Umbrella 공통 설정

### 명명 규칙

- 파일명: 스네이크 케이스(snake_case) 사용 (예: message_service.ex)
- 모듈명: 파스칼 케이스(PascalCase) 사용 (예: MessageService)
- 함수와 변수명: 스네이크 케이스(snake_case) 사용 (예: send_message())
- 상수: 대문자 스네이크 케이스(UPPER_SNAKE_CASE) 사용 (예: MAX_QUEUE_SIZE)

## 5️⃣ 성능 고려사항

- 배치 처리: 대량 메시지 전송 시 적절한 배치 크기로 처리하세요(100~500개 권장).
- 컨넥션 풀링: PostgreSQL 연결을 효율적으로 관리하세요(30-50개 연결 제한).
- 비동기 처리: 모든 메시지 전송은 비동기적으로 처리하세요.
- 분산 노드: 글로벌 리전(도쿄, 프랑크푸르트, 시드니 등)에 분산 배포하세요.
- 초당 10만 건: 초당 10만 건의 처리량을 목표로 최적화하세요(10초당 100만 건의 버스트 처리 지원).
- 채널별 최적화: 각 채널의 특성에 맞게 전송 로직을 최적화하세요.
- 템플릿 캐싱: 자주 사용되는 템플릿을 캐싱하여 렌더링 성능을 향상시키세요.
- 할당량 관리: ash_money와 ash_double_entry를 활용하여 정확한 앱별 메시지 할당량 및 과금을 관리하세요.
- 과금 트랜잭션: 할당량 소비와 비용 계산 작업은 원자적 트랜잭션으로 처리하세요.

## 6️⃣ 모니터링 및 관찰성

- 구조화된 로깅: 모든 로그를 JSON 형식으로 출력하세요.
- 지표 수집: 채널별 성공률, 도달률, 오픈률 등 핵심 비즈니스 지표를 수집하세요.
- 오류 추적: 모든 오류를 채널별로 분류하고 구조화된 방식으로 기록하세요.
- 성능 측정: 각 단계별(전송, 도달, 열람) 및 채널별 지연 시간을 측정하세요.
- 데이터 내보내기: ash_csv를 활용하여 통계 데이터를 내보내세요.
- 멀티채널 분석: 통합된 분석 대시보드를 위한 채널별 데이터를 수집하세요.
- 사용자 참여 추적: 채널별 사용자 참여도 및 효과성을 측정하세요.

## 7️⃣ Ash Framework 활용 방안

- ash_state_machine: 메시지 상태 전이(pending→successful→received→converted)를 명확하게 정의하고, 상태 변경 시 조건 및 콜백 함수를 설정하세요.
- ash_oban: 모든 비동기 작업을 Oban 워커로 구현하고, 재시도 전략, 우선순위 및 스케줄링을 설정하세요.
- ash_paper_trail: 메시지 및 구독 상태 변경에 대한 감사 추적을 유지하세요.
- ash_archival: 사용자 및 구독 데이터를 삭제하지 말고 논리적 보관 처리하세요.
- ash_cloak: 민감한 개인 정보(이메일, 전화번호) 및 인증 토큰을 암호화하세요.
- ash_money: 사용량 기반 과금을 위한 비용 추적 시스템을 구현하세요.
- ash_double_entry: 메시지 할당량 및 사용량을 이중 원장으로 정확하게 추적하세요.
- ash_csv: 채널별 성과 분석 및 보고서 생성을 위한 CSV 내보내기 기능을 구현하세요.

## 8️⃣ 활용 방법

이 규칙 세트는 AI 지원 개발을 위한 템플릿입니다. 다음과 같이 사용하세요:

1. 프로젝트 시작 시 이 규칙을 참조하세요.
2. 필요에 따라 규칙을 조정하세요.
3. AI 모델에게 이 파일의 내용을 따르도록 지시하세요.
4. 프로젝트를 진행하면서 이 규칙이 어떻게 도움이 되는지 평가하세요.

이 규칙 세트를 통해 AI와의 협업이 더 효율적이고 예측 가능해질 것입니다.
