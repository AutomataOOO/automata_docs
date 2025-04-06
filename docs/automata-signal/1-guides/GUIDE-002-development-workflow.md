# [GUIDE-002] 개발 워크플로우

| 버전 | 날짜       | 변경 내용      |
| ---- | ---------- | -------------- |
| 1.0  | 2025-04-02 | 최초 문서 작성 |

## 관련 문서

- [GUIDE-001] 시작하기 가이드
- [GUIDE-003] 코딩 표준 가이드
- [APP-000] Global rules
- [APP-001] Workspace rules

## 요약

본 문서는 Automata-Signal 프로젝트의 개발 워크플로우를 설명합니다. 개발 환경 설정부터 코드 작성, 테스트, 리뷰, 배포까지의 전체 개발 과정과 권장 프랙티스를 다룹니다.

## 대상 독자

- 신규 개발자
- 기존 개발팀
- 프로젝트 기여자

## 1. 개발 환경 설정

### 1.1 필수 도구 설치

개발을 시작하기 전에 다음 도구들이 설치되어 있어야 합니다:

```bash
# Elixir 및 Erlang 설치 (asdf 사용)
asdf plugin-add erlang
asdf plugin-add elixir
asdf install erlang 27.0
asdf install elixir 1.18.0-otp-27
asdf local erlang 27.0
asdf local elixir 1.18.0-otp-27

# PostgreSQL 설치 (OS에 따라 다름)
# Ubuntu의 경우:
sudo apt-get install postgresql-17

# Flutter 설치
git clone https://github.com/flutter/flutter.git
export PATH="$PATH:`pwd`/flutter/bin"
flutter doctor
```

### 1.2 프로젝트 클론 및 의존성 설치

```bash
# 저장소 클론
git clone git@github.com:your-org/automata.git
cd automata

# Elixir 의존성 설치
mix deps.get
mix deps.compile

# 데이터베이스 설정
mix ecto.setup

# Flutter 의존성 설치 (SDK 개발 시)
cd apps/automata_signal/client
flutter pub get
```

## 2. 개발 워크플로우

### 2.1 기본 워크플로우

Automata-Signal은 다음과 같은 기본 워크플로우를 따릅니다:

1. **이슈 생성**: 모든 작업은 이슈 트래커에 등록된 이슈로 시작합니다.
2. **브랜치 생성**: 작업할 이슈에 대한 새 브랜치를 생성합니다 (`feature/ASG-123-기능명` 형식 사용).
3. **개발**: TDD 방식으로 개발을 진행합니다.
4. **코드 리뷰**: 풀 리퀘스트를 생성하고 코드 리뷰를 받습니다.
5. **병합**: 승인된 풀 리퀘스트를 메인 브랜치에 병합합니다.
6. **배포**: CI/CD 파이프라인을 통해 자동 배포됩니다.

### 2.2 이슈 관리

- 모든 작업은 이슈 트래커에 등록되어야 합니다.
- 이슈는 다음 정보를 포함해야 합니다:
  - 제목: 간결하고 명확한 설명
  - 설명: 상세한 요구사항 또는 버그 재현 방법
  - 유형: 기능(Feature), 버그(Bug), 기술적 부채(Tech Debt) 등
  - 우선순위: 높음, 중간, 낮음
  - 담당자: 작업을 맡은 개발자
  - 마일스톤: 관련 릴리스 또는 스프린트

### 2.3 브랜치 전략

Automata-Signal은 Git Flow 기반의 브랜치 전략을 사용합니다:

- `main`: 프로덕션 환경에 배포된 안정적인 코드
- `develop`: 개발 중인 코드가 통합되는 메인 개발 브랜치
- `feature/*`: 새로운 기능 개발 (develop에서 분기)
- `bugfix/*`: 버그 수정 (develop에서 분기)
- `release/*`: 릴리스 준비 (develop에서 분기)
- `hotfix/*`: 프로덕션 긴급 수정 (main에서 분기)

모든 브랜치는 작업 완료 후 풀 리퀘스트를 통해 병합되어야 합니다.

### 2.4 커밋 규칙

커밋 메시지는 다음 형식을 따릅니다:

```
[ASG-123] 카테고리: 간결한 변경 내용 설명

- 변경 내용에 대한 상세 설명 (필요시)
- 추가 설명 라인 (필요시)
```

카테고리의 예:

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스 변경

### 2.5 큰 작업 계획

큰 작업을 진행할 때는 먼저 설계 및 구현 계획 문서를 작성해야 합니다:

1. 작업에 대한 설계 문서 작성: `../7-progress/[이슈명]_design.md`
2. 구현 계획 문서 작성: `../7-progress/[이슈명]_plan.md`
3. 문서 검토 및 승인 후 작업 시작
4. 작업 진행 상황 추적: `../7-progress/status.md`

## 3. 테스트 전략

### 3.1 테스트 종류

Automata-Signal은 다음과 같은 테스트를 작성합니다:

- **단위 테스트**: 개별 함수 및 모듈 테스트
- **통합 테스트**: 여러 컴포넌트 간 상호작용 테스트
- **시스템 테스트**: 전체 시스템 기능 테스트
- **성능 테스트**: 부하 및 성능 테스트

### 3.2 TDD 방식

개발은 다음과 같은 TDD 사이클을 따릅니다:

1. 실패하는 테스트 작성
2. 테스트를 통과하는 최소한의 코드 작성
3. 코드 리팩토링
4. 반복

### 3.3 테스트 실행

```bash
# 모든 테스트 실행
mix test

# 특정 테스트 파일 실행
mix test test/automata_signal/adapters/push_adapter_test.exs

# 태그가 지정된 테스트만 실행
mix test --only integration

# 커버리지 보고서 생성
mix test --cover
```

## 4. 코드 리뷰 과정

### 4.1 풀 리퀘스트 생성

풀 리퀘스트에는 다음 정보가 포함되어야 합니다:

- 제목: `[ASG-123] 간결한 변경 내용 설명`
- 설명: 변경 사항 요약 및 테스트 방법
- 관련 이슈 링크
- 스크린샷 또는 GIF (UI 변경 시)

### 4.2 코드 리뷰 기준

리뷰어는 다음 사항을 중점적으로 확인합니다:

- 코드가 기능 요구사항을 충족하는지
- 코드 품질 및 가독성
- 테스트 코드 작성 여부 및 품질
- 성능 및 보안 이슈
- 코딩 표준 준수 여부

### 4.3 병합 기준

풀 리퀘스트를 병합하기 위한 조건:

- 최소 2명의 리뷰어 승인
- 모든 CI 테스트 통과
- 모든 중요한 피드백 반영

## 5. 배포 프로세스

### 5.1 환경

- **개발(dev)**: 개발자 테스트용 환경
- **스테이징(staging)**: QA 및 UAT를 위한 환경
- **프로덕션(prod)**: 실제 사용자 서비스 환경

### 5.2 배포 흐름

1. **개발 배포**: 개발 브랜치 병합 시 자동 배포
2. **스테이징 배포**: 릴리스 브랜치 생성 시 자동 배포
3. **프로덕션 배포**: 릴리스 승인 후 계획된 일정에 수동 배포

### 5.3 fly.io 배포

fly.io를 사용한 배포 명령:

```bash
# 개발 환경 배포
fly deploy --app automata-signal-dev

# 스테이징 환경 배포
fly deploy --app automata-signal-staging

# 프로덕션 환경 배포
fly deploy --app automata-signal-prod
```

### 5.4 롤백 절차

오류 발생 시 롤백 방법:

```bash
# 특정 버전으로 롤백
fly deploy --app automata-signal-prod --image registry.fly.io/automata-signal-prod:v1.2.3
```

## 6. 릴리스 관리

### 6.1 버전 관리

Automata-Signal은 [Semantic Versioning](https://semver.org/)을 사용합니다:

- **주 버전(MAJOR)**: 이전 버전과 호환되지 않는 API 변경
- **부 버전(MINOR)**: 이전 버전과 호환되는 새로운 기능 추가
- **패치 버전(PATCH)**: 이전 버전과 호환되는 버그 수정

### 6.2 릴리스 노트

릴리스 노트는 다음 정보를 포함해야 합니다:

- 버전 번호 및 릴리스 날짜
- 새로운 기능 목록
- 개선 사항 목록
- 버그 수정 목록
- 알려진 이슈 목록
- 업그레이드 지침 (필요시)

## 7. 추가 개발 가이드라인

### 7.1 로깅 표준

로그 레벨은 다음과 같이 사용합니다:

- **debug**: 개발자용 상세 디버깅 정보
- **info**: 일반적인 애플리케이션 이벤트
- **warn**: 잠재적 문제지만 자동 복구 가능한 상황
- **error**: 처리되지 않은 오류 또는 예외 상황

### 7.2 성능 모니터링

성능 지표 수집 및 모니터링:

- 메시지 처리량
- 응답 시간
- 오류율
- 리소스 사용량 (CPU, 메모리, 네트워크)

### 7.3 보안 고려사항

- 모든 민감한 정보는 환경 변수로 관리
- 토큰 및 개인 정보는 ash_cloak을 사용하여 암호화
- HTTPS/TLS를 통한 모든 통신 암호화
- 정기적인 의존성 보안 취약점 스캔

## 8. 문제 해결 및 지원

### 8.1 일반적인 문제

- 개발 환경 설정 이슈
- 데이터베이스 연결 문제
- fly.io 배포 오류

### 8.2 도움 받는 방법

- 내부 슬랙 채널: #automata-signal-dev
- 온라인 문서: docs.automata-signal.com
- 이슈 트래커: github.com/your-org/automata/issues
