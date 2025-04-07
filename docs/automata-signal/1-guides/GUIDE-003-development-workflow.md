# [GUIDE-003] 개발 워크플로우

| 버전 | 날짜       | 변경 내용      |
| ---- | ---------- | -------------- |
| 1.0  | 2025-04-02 | 최초 문서 작성 |

## 관련 문서

- [[GUIDE-001] 시작하기](../1-guides/GUIDE-001-getting-started.md)
- [[GUIDE-002] 프로젝트 구조](../1-guides/GUIDE-002-project-structure.md)
- [[GUIDE-004] 코딩 표준](../1-guides/GUIDE-004-coding-standards.md)

## 요약

본 문서는 Automata-Signal 프로젝트의 개발 워크플로우를 설명합니다. 코드 작성, 테스트, 리뷰, 그리고 배포까지의 전체 개발 과정과 권장 사례를 다룹니다.

## 대상 독자

- 신규 개발자
- 개발팀

## 1. 개발 워크플로우

### 1.1 기본 워크플로우

Automata-Signal은 다음과 같은 기본 워크플로우를 따릅니다:

1. **이슈 생성**: 모든 작업은 이슈 트래커에 등록된 이슈로 시작합니다.
2. **브랜치 생성**: 작업할 이슈에 대한 새 브랜치를 생성합니다 (`feature/ASG-123-기능명` 형식 사용).
3. **개발**: TDD 방식으로 개발을 진행합니다.
4. **코드 리뷰**: 풀 리퀘스트를 생성하고 코드 리뷰를 받습니다.
5. **병합**: 승인된 풀 리퀘스트를 메인 브랜치에 병합합니다.
6. **배포**: CI/CD 파이프라인을 통해 자동 배포됩니다.

### 1.2 이슈 관리

- 모든 작업은 이슈 트래커에 등록되어야 합니다.
- 이슈는 다음 정보를 포함해야 합니다:
  - 제목: 간결하고 명확한 설명
  - 설명: 상세한 요구사항 또는 버그 재현 방법
  - 유형: 기능(Feature), 버그(Bug), 기술적 부채(Tech Debt) 등
  - 우선순위: 높음, 중간, 낮음
  - 담당자: 작업을 맡은 개발자
  - 마일스톤: 관련 릴리스 또는 스프린트

### 1.3 브랜치 전략

Automata-Signal은 Git Flow 기반의 브랜치 전략을 사용합니다:

- `main`: 프로덕션 환경에 배포된 안정적인 코드
- `develop`: 개발 중인 코드가 통합되는 메인 개발 브랜치
- `feature/*`: 새로운 기능 개발 (develop에서 분기)
- `bugfix/*`: 버그 수정 (develop에서 분기)
- `release/*`: 릴리스 준비 (develop에서 분기)
- `hotfix/*`: 프로덕션 긴급 수정 (main에서 분기)

모든 브랜치는 작업 완료 후 풀 리퀘스트를 통해 병합되어야 합니다.

### 1.4 커밋 규칙

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

### 1.5 큰 작업 계획

큰 작업을 진행할 때는 먼저 설계 및 구현 계획 문서를 작성해야 합니다:

1. 작업에 대한 설계 문서 작성: `../7-progress/[이슈명]_design.md`
2. 구현 계획 문서 작성: `../7-progress/[이슈명]_plan.md`
3. 문서 검토 및 승인 후 작업 시작
4. 작업 진행 상황 추적: `../7-progress/status.md`

## 2. 테스트 전략

### 2.1 테스트 종류

Automata-Signal은 다음과 같은 테스트를 작성합니다:

- **단위 테스트**: 개별 함수 및 모듈 테스트
- **통합 테스트**: 여러 컴포넌트 간 상호작용 테스트
- **시스템 테스트**: 전체 시스템 기능 테스트
- **성능 테스트**: 부하 및 성능 테스트

### 2.2 TDD 방식

개발은 다음과 같은 TDD 사이클을 따릅니다:

1. 실패하는 테스트 작성
2. 테스트를 통과하는 최소한의 코드 작성
3. 코드 리팩토링
4. 반복

### 2.3 테스트 실행

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

## 3. 코드 리뷰 과정

### 3.1 풀 리퀘스트 생성

풀 리퀘스트에는 다음 정보가 포함되어야 합니다:

- 제목: `[ASG-123] 간결한 변경 내용 설명`
- 설명: 변경 사항 요약 및 테스트 방법
- 관련 이슈 링크
- 스크린샷 또는 GIF (UI 변경 시)

### 3.2 코드 리뷰 기준

리뷰어는 다음 사항을 중점적으로 확인합니다:

- 코드가 기능 요구사항을 충족하는지
- 코드 품질 및 가독성
- 테스트 코드 작성 여부 및 품질
- 성능 및 보안 이슈
- 코딩 표준 준수 여부

### 3.3 병합 기준

풀 리퀘스트를 병합하기 위한 조건:

- 최소 2명의 리뷰어 승인
- 모든 CI 테스트 통과
- 모든 중요한 피드백 반영

## 4. CI/CD 파이프라인

### 4.1 GitHub Actions 구성

Automata-Signal은 GitHub Actions를 사용하여 CI/CD 파이프라인을 구현합니다:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: automata_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: erlef/setup-beam@v1
        with:
          otp-version: '27'
          elixir-version: '1.18'

      - name: Cache Dependencies
        uses: actions/cache@v3
        with:
          path: deps
          key: ${{ runner.os }}-mix-${{ hashFiles(format('{0}{1}', github.workspace, '/mix.lock')) }}
          restore-keys: |
            ${{ runner.os }}-mix-

      - name: Install Dependencies
        run: mix deps.get

      - name: Run Credo
        run: mix credo --strict

      - name: Run Tests
        run: mix test
```

### 4.2 자동 배포 워크플로우

develop 브랜치 또는 main 브랜치로의 병합이 완료되면 자동으로 배포가 시작됩니다:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches:
      - develop
      - main

jobs:
  deploy:
    name: Deploy to fly.io
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Fly CLI
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy to Staging
        if: github.ref == 'refs/heads/develop'
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
        run: flyctl deploy --app automata-signal-staging --remote-only

      - name: Deploy to Production
        if: github.ref == 'refs/heads/main'
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
        run: flyctl deploy --app automata-signal-prod --remote-only
```

### 4.3 배포 환경

- **개발(dev)**: 개발자 테스트용 환경, 개발자가 수동으로 배포
- **스테이징(staging)**: develop 브랜치의 변경사항이 자동으로 배포되는 환경
- **프로덕션(prod)**: main 브랜치의 변경사항이 자동으로 배포되는 환경

## 5. fly.io 배포

### 5.1 fly.toml 구성

```toml
# fly.toml - 기본 구성 파일

app = "automata-signal"
primary_region = "nrt"

[env]
  PHX_HOST = "api.automata-signal.com"
  PORT = "8080"
  RELEASE_COOKIE = "release_cookie_value_here"
  NODE_COOKIE = "node_cookie_value_here"
  FLY_REGION = "nrt"
  FLY_APP_NAME = "automata-signal"
  DATABASE_URL = "ecto://postgres:password@top1.nearest.of.automata-signal-db.internal:5432/automata_signal"
  SECRET_KEY_BASE = "secret_key_base_value_here"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 3
  processes = ["app"]

  [http_service.concurrency]
    type = "connections"
    hard_limit = 1000
    soft_limit = 800

[[services]]
  protocol = "tcp"
  internal_port = 4369
  processes = ["app"]

  [[services.ports]]
    port = 4369

[metrics]
  port = 9090
  path = "/metrics"

[[vm]]
  cpu_kind = "shared"
  cpus = 4
  memory_mb = 8192

[deploy]
  strategy = "rolling"
  release_command = "eval 'Automata.Release.migrate'"

[mounts]
  source = "automata_storage"
  destination = "/app/uploads"
```

### 5.2 환경별 설정

각 환경(개발, 스테이징, 프로덕션)에 대한 별도의 fly.toml 파일을 만들어 사용할 수 있습니다:

- **fly.staging.toml**: 스테이징 환경 설정
- **fly.prod.toml**: 프로덕션 환경 설정

배포 시 명시적으로 설정 파일을 지정할 수 있습니다:

```bash
flyctl deploy --config fly.staging.toml
```

### 5.3 데이터베이스 설정

데이터베이스는 fly.io의 PostgreSQL 앱을 사용하여 배포합니다:

```bash
# 데이터베이스 생성
flyctl postgres create --name automata-signal-db

# 애플리케이션에 데이터베이스 연결
flyctl postgres attach --postgres-app automata-signal-db --app automata-signal-staging
```

### 5.4 배포 명령

수동 배포가 필요한 경우 다음 명령을 사용합니다:

```bash
# 개발 환경 배포
flyctl deploy --app automata-signal-dev

# 스테이징 환경 배포
flyctl deploy --app automata-signal-staging

# 프로덕션 환경 배포
flyctl deploy --app automata-signal-prod
```

## 6. 롤백 및 장애 대응

### 6.1 롤백 절차

배포 후 문제가 발생한 경우 이전 버전으로 롤백할 수 있습니다:

```bash
# 이전 배포 버전 목록 확인
flyctl releases list --app automata-signal-prod

# 특정 버전으로 롤백
flyctl deploy --app automata-signal-prod --image registry.fly.io/automata-signal-prod:v1.2.3
```

### 6.2 데이터베이스 마이그레이션 롤백

문제가 있는 마이그레이션의 경우 다음과 같이 롤백합니다:

```bash
# SSH를 통한 접속
flyctl ssh console --app automata-signal-prod

# 마이그레이션 롤백 실행
/app/bin/automata eval 'Automata.Release.rollback(Automata.Repo, 20250401123456)'
```

### 6.3 모니터링 및 로그

배포 후 상태를 모니터링하기 위한 명령:

```bash
# 애플리케이션 상태 확인
flyctl status --app automata-signal-prod

# 실시간 로그 보기
flyctl logs --app automata-signal-prod

# 특정 인스턴스의 로그 보기
flyctl logs --app automata-signal-prod --instance 12345678
```

## 7. 릴리스 관리

### 7.1 버전 관리

Automata-Signal은 [Semantic Versioning](https://semver.org/)을 사용합니다:

- **주 버전(MAJOR)**: 이전 버전과 호환되지 않는 API 변경
- **부 버전(MINOR)**: 이전 버전과 호환되는 새로운 기능 추가
- **패치 버전(PATCH)**: 이전 버전과 호환되는 버그 수정

### 7.2 릴리스 프로세스

1. **릴리스 브랜치 생성**: `release/vX.Y.Z` 형식으로 develop 브랜치에서 분기
2. **버전 업데이트**: 릴리스 브랜치에서 버전 정보 업데이트
3. **릴리스 테스트**: 스테이징 환경에서 릴리스 테스트
4. **릴리스 노트 작성**: 새로운 기능, 개선 사항, 버그 수정 등 기록
5. **main 브랜치로 병합**: 릴리스 준비가 완료되면 main 브랜치로 병합
6. **태그 생성**: GitHub에서 릴리스 태그 생성
7. **프로덕션 배포**: CI/CD 파이프라인을 통해 자동 배포

### 7.3 Hotfix 프로세스

프로덕션 환경에서 긴급한 버그가 발견된 경우:

1. **hotfix 브랜치 생성**: `hotfix/vX.Y.Z+1` 형식으로 main 브랜치에서 분기
2. **버그 수정 및 테스트**: hotfix 브랜치에서 수정 및 테스트
3. **main 및 develop 브랜치로 병합**: 수정 사항을 양쪽 브랜치에 반영
4. **태그 생성 및 배포**: 새 버전 태그 생성 및 배포

## 8. 로깅 및 모니터링

### 8.1 로깅 가이드라인

Automata-Signal의 로깅 가이드라인:

- 로그 수준에 따라 적절한 로깅 수행 (debug, info, warn, error)
- 구조화된 로그 형식 사용 (JSON)
- 민감한 정보는 로그에 기록하지 않음
- 예외 발생 시 스택 트레이스 기록

### 8.2 모니터링 도구

fly.io 환경에서의 모니터링:

- **Prometheus**: 시스템 및 비즈니스 메트릭 수집
- **Grafana**: 대시보드 및 시각화
- **Uptime 모니터링**: API 엔드포인트 가용성 모니터링
- **알림 설정**: 임계값을 초과할 경우 Slack 또는 이메일 알림
