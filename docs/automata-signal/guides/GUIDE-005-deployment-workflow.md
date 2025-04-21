# [GUIDE-005] 배포 워크플로우

| 버전 | 날짜       | 변경 내용      |
| ---- | ---------- | -------------- |
| 1.0  | 2025-04-02 | 최초 문서 작성 |

## 요약

본 문서는 Automata-Signal 프로젝트의 배포 워크플로우를 설명합니다. GitHub Actions를 활용한 CI/CD(지속적 통합 및 배포) 파이프라인과 다중 환경 배포 프로세스에 대한 상세 내용을 제공합니다. 배포 인프라의 세부 구조는 [DESIGN-004] 운영 아키텍처 문서를 참조하세요.

## 1. 배포 워크플로우 개요

Automata-Signal 프로젝트는 GitHub Actions를 통해 완전 자동화된 CI/CD 파이프라인을 구현합니다. 이 파이프라인은 코드 품질 검증부터 다중 환경/리전 자동 배포까지의 전체 과정을 자동화합니다.

### 1.1 파이프라인 흐름

```mermaid
flowchart TD
    PR[코드 변경/PR] --> QA[코드 품질 검사]
    QA --> Tests[테스트 실행]
    Tests --> Result{결과}
    Result -->|성공| Branch{브랜치?}
    Result -->|실패| Fail[빌드 실패]
    Branch -->|develop| DevDeploy[개발 환경 배포]
    Branch -->|main| ProdDeploy[프로덕션 환경 배포]
    Branch -->|기타| End[완료]
    DevDeploy --> End
    ProdDeploy --> ProdMigrate[마이그레이션 실행]
    ProdMigrate --> End
```

### 1.2 주요 구성 요소

1. **코드 품질 검증**: 코드 형식, 스타일, 보안 취약점 등 검사
2. **자동화된 테스트**: 단위 테스트, 통합 테스트 실행 및 커버리지 측정
3. **환경별 배포**: 특정 브랜치 변경에 따른 자동 배포
   - 개발(Development): develop 브랜치 변경 시
   - 스테이징(Staging): 수동 워크플로우 트리거 시
   - 프로덕션(Production): main 브랜치 변경 시 (다중 리전 배포)

## 2. GitHub Actions 워크플로우

### 2.1 워크플로우 파일 구성

CI/CD 파이프라인은 `.github/workflows/ci_cd.yml` 파일에 정의되어 있습니다:

```yaml
# .github/workflows/ci_cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:

jobs:
  verify:
    name: Code Quality & Tests
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

      - name: Cache deps
        uses: actions/cache@v3
        with:
          path: deps
          key: ${{ runner.os }}-mix-${{ hashFiles(format('{0}{1}', github.workspace, '/mix.lock')) }}
          restore-keys: |
            ${{ runner.os }}-mix-

      - name: Cache _build
        uses: actions/cache@v3
        with:
          path: _build
          key: ${{ runner.os }}-build-${{ hashFiles(format('{0}{1}', github.workspace, '/mix.lock')) }}
          restore-keys: |
            ${{ runner.os }}-build-

      - name: Install Dependencies
        run: mix deps.get

      - name: Check Formatting
        run: mix format --check-formatted

      - name: Run Credo
        run: mix credo --strict

      - name: Run Dialyxir
        run: mix dialyxir

      - name: Run Sobelow
        run: mix sobelow --config

      - name: Run Tests with Coverage
        run: mix coveralls.github
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  deploy_dev:
    name: Deploy to Development
    needs: verify
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - name: Deploy to Development
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
        run: |
          flyctl deploy --app automata-signal-dev --config fly.dev.toml

  deploy_staging:
    name: Deploy to Staging
    needs: verify
    if: github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - name: Deploy to Staging
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
        run: |
          flyctl deploy --app automata-signal-staging --config fly.staging.toml

  deploy_production:
    name: Deploy to Production
    needs: verify
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - name: Deploy to Production
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
        run: |
          for region in nrt fra syd; do
            flyctl deploy --app automata-signal-$region --config fly.prod.$region.toml
          done

      - name: Run Migrations
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
        run: |
          flyctl ssh console --app automata-signal-nrt --command "/app/bin/automata eval 'Automata.Release.migrate'"
```

### 2.2 트리거 이벤트

워크플로우는 다음 이벤트에 의해 트리거됩니다:

1. **push**: main 또는 develop 브랜치에 코드가 푸시될 때
2. **pull_request**: main 또는 develop 브랜치로 PR이 생성될 때
3. **workflow_dispatch**: 수동으로 워크플로우를 실행할 때

### 2.3 작업(Jobs) 구성

워크플로우는 다음 작업들로 구성됩니다:

1. **verify**: 코드 품질 검사 및 테스트 실행
2. **deploy_dev**: 개발 환경 배포 (develop 브랜치에 변경 사항이 있을 때)
3. **deploy_staging**: 스테이징 환경 배포 (수동 트리거 시)
4. **deploy_production**: 프로덕션 환경 배포 (main 브랜치에 변경 사항이 있을 때)

## 3. 코드 품질 및 테스트 검증

### 3.1 사용되는 도구

`verify` 작업에서는 다음 코드 품질 도구가 사용됩니다:

| 도구        | 명령                           | 목적                         |
| ----------- | ------------------------------ | ---------------------------- |
| Formatter   | `mix format --check-formatted` | 코드 형식 일관성 검사        |
| Credo       | `mix credo --strict`           | 코드 스타일 및 일관성 검사   |
| Dialyxir    | `mix dialyxir`                 | 타입 검사                    |
| Sobelow     | `mix sobelow --config`         | 보안 취약점 분석             |
| ExCoveralls | `mix coveralls.github`         | 테스트 커버리지 측정 및 보고 |

### 3.2 데이터베이스 서비스

테스트 실행 시 다음과 같이 PostgreSQL 서비스가 제공됩니다:

```yaml
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
```

### 3.3 캐싱 최적화

빌드 시간을 단축하기 위해 다음 항목을 캐싱합니다:

1. **deps 디렉토리**: 의존성 라이브러리 캐싱
2. **\_build 디렉토리**: 컴파일된 결과물 캐싱

```yaml
- name: Cache deps
  uses: actions/cache@v3
  with:
    path: deps
    key: ${{ runner.os }}-mix-${{ hashFiles(format('{0}{1}', github.workspace, '/mix.lock')) }}
    restore-keys: |
      ${{ runner.os }}-mix-

- name: Cache _build
  uses: actions/cache@v3
  with:
    path: _build
    key: ${{ runner.os }}-build-${{ hashFiles(format('{0}{1}', github.workspace, '/mix.lock')) }}
    restore-keys: |
      ${{ runner.os }}-build-
```

## 4. 환경별 배포 구성

### 4.1 배포 프로세스

각 환경에 대한 배포 작업은 다음과 같은 조건과 단계로 구성됩니다:

#### 개발 환경 배포

```yaml
deploy_dev:
  name: Deploy to Development
  needs: verify
  if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v3
    - uses: superfly/flyctl-actions/setup-flyctl@master
    - name: Deploy to Development
      env:
        FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
      run: |
        flyctl deploy --app automata-signal-dev --config fly.dev.toml
```

#### 스테이징 환경 배포

```yaml
deploy_staging:
  name: Deploy to Staging
  needs: verify
  if: github.event_name == 'workflow_dispatch'
  runs-on: ubuntu-latest
  environment: staging

  steps:
    - uses: actions/checkout@v3
    - uses: superfly/flyctl-actions/setup-flyctl@master
    - name: Deploy to Staging
      env:
        FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
      run: |
        flyctl deploy --app automata-signal-staging --config fly.staging.toml
```

#### 프로덕션 환경 배포

```yaml
deploy_production:
  name: Deploy to Production
  needs: verify
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  environment: production

  steps:
    - uses: actions/checkout@v3
    - uses: superfly/flyctl-actions/setup-flyctl@master
    - name: Deploy to Production
      env:
        FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
      run: |
        for region in nrt fra syd; do
          flyctl deploy --app automata-signal-$region --config fly.prod.$region.toml
        done

    - name: Run Migrations
      env:
        FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
      run: |
        flyctl ssh console --app automata-signal-nrt --command "/app/bin/automata eval 'Automata.Release.migrate'"
```

### 4.2 환경별 구성 파일

각 환경은 별도의 구성 파일을 사용합니다:

| 환경     | 구성 파일                | 애플리케이션 이름          |
| -------- | ------------------------ | -------------------------- |
| 개발     | fly.dev.toml             | automata-signal-dev        |
| 스테이징 | fly.staging.toml         | automata-signal-staging    |
| 프로덕션 | fly.prod.`{region}`.toml | automata-signal-`{region}` |

### 4.3 환경 승인 프로세스

스테이징 및 프로덕션 환경은 GitHub Environments를 통한 승인 프로세스를 적용하고 있습니다:

```yaml
environment: staging
```

```yaml
environment: production
```

이를 통해 배포 전 지정된 리뷰어의 승인을 요구할 수 있습니다. 프로덕션 환경의 경우 다음 단계로 구성됩니다:

1. 코드 변경 main 브랜치 병합
2. CI/CD 파이프라인 자동 트리거
3. 코드 품질 및 테스트 검증
4. 지정된 리뷰어에게 배포 승인 요청
5. 리뷰어 승인 후 자동 배포
6. 다중 리전에 순차적 배포
7. 마이그레이션 실행

## 5. 비밀 관리

### 5.1 GitHub Secrets

워크플로우에서 사용되는 비밀은 GitHub Secrets를 통해 관리됩니다:

- **GITHUB_TOKEN**: GitHub API 접근을 위한 토큰 (GitHub에서 자동 제공)
- **FLY_API_TOKEN**: fly.io API 접근을 위한 토큰

비밀은 다음과 같이 환경 변수로 접근합니다:

```yaml
env:
  FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### 5.2 환경별 비밀 관리

환경별로 다른 비밀을 사용해야 하는 경우, GitHub Environments 기능을 활용하여 환경별 비밀을 구성할 수 있습니다:

1. GitHub 저장소 → Settings → Environments → 해당 환경 선택
2. Environment secrets 섹션에서 해당 환경에만 적용되는 비밀 추가
3. 워크플로우 파일에서 `environment: [환경명]` 설정

이를 통해 개발, 스테이징, 프로덕션 환경에 서로 다른 API 키, 인증 정보 등을 안전하게 관리할 수 있습니다.

## 6. 배포 전략

### 6.1 무중단 배포

Automata-Signal은 무중단 배포(Zero-Downtime Deployment)를 위해 롤링 업데이트 전략을 채택하고 있습니다:

```toml
# fly.toml 파일의 배포 설정
[deploy]
  strategy = "rolling"
  release_command = "eval 'Automata.Release.migrate'"
```

롤링 업데이트 과정:

1. 새 버전의 애플리케이션 이미지 빌드
2. 기존 인스턴스 중 하나를 새 버전으로 교체
3. 상태 점검을 통해 새 인스턴스의 정상 작동 확인
4. 정상 작동 시 트래픽을 새 인스턴스로 전환
5. 나머지 인스턴스를 순차적으로 교체

### 6.2 블루-그린 배포 옵션

중요한 변경사항의 경우, 필요에 따라 블루-그린 배포 방식을 수동으로 구성할 수 있습니다:

1. 새로운 애플리케이션 인스턴스(그린) 배포
2. 테스트 및 검증 수행
3. 트래픽을 이전 인스턴스(블루)에서 새 인스턴스(그린)로 전환
4. 문제 발생 시 빠르게 이전 인스턴스로 롤백

블루-그린 배포를 위한 수동 워크플로우:

```yaml
deploy_blue_green:
  name: Blue-Green Deployment
  needs: verify
  if: github.event_name == 'workflow_dispatch'
  runs-on: ubuntu-latest
  environment: production

  steps:
    - uses: actions/checkout@v3
    - uses: superfly/flyctl-actions/setup-flyctl@master
    - name: Deploy Green Environment
      env:
        FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
      run: |
        flyctl deploy --app automata-signal-green --config fly.green.toml

    # 검증 단계
    - name: Verify Green Environment
      run: |
        # 상태 확인 및 테스트 실행

    # 트래픽 전환
    - name: Switch Traffic
      run: |
        # DNS 또는 로드 밸런서 설정 업데이트
```

### 6.3 카나리 배포 옵션

점진적인 롤아웃을 위해 카나리 배포 방식도 선택할 수 있습니다:

1. 새 버전을 소수의 사용자 또는 리전에만 배포
2. 모니터링 및 성능 데이터 수집
3. 문제가 없을 경우 점진적으로 배포 범위 확장
4. 이슈 발생 시 영향 범위를 최소화하면서 롤백

## 7. 데이터베이스 마이그레이션

### 7.1 마이그레이션 실행 절차

데이터베이스 마이그레이션은 다음 절차에 따라 실행됩니다:

1. 마이그레이션 스크립트 생성: `mix ash_postgres.generate_migrations`
2. 테스트 환경에서 마이그레이션 검증: `mix ecto.migrate`
3. 프로덕션 배포 후 마이그레이션 실행:

```yaml
- name: Run Migrations
  env:
    FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
  run: |
    flyctl ssh console --app automata-signal-nrt --command "/app/bin/automata eval 'Automata.Release.migrate'"
```

### 7.2 안전한 마이그레이션 실행

데이터베이스 마이그레이션 실행 시 다음 안전 조치를 적용합니다:

1. **백업 생성**: 마이그레이션 전 데이터베이스 백업 수행
2. **하위 호환성**: 롤링 업데이트 동안 구 버전과 신 버전 공존을 고려한 마이그레이션 설계
3. **롤백 계획**: 마이그레이션 실패 시 이전 상태로 복원할 수 있는 롤백 계획 마련
4. **대규모 변경 분할**: 대규모 스키마 변경은 여러 단계로 분할하여 위험 최소화

## 8. 모니터링 및 피드백

### 8.1 워크플로우 실행 모니터링

GitHub Actions 대시보드에서 워크플로우 실행 상태를 모니터링할 수 있습니다:

- GitHub 저장소 → Actions 탭 → CI/CD Pipeline 워크플로우

### 8.2 빌드 상태 배지

README.md 파일에 다음과 같은 빌드 상태 배지를 추가하여 최신 빌드 상태를 표시할 수 있습니다:

```markdown
![CI/CD Pipeline](https://github.com/{owner}/{repo}/actions/workflows/ci_cd.yml/badge.svg)
```

### 8.3 테스트 커버리지 보고서

ExCoveralls를 통해 생성된 테스트 커버리지 보고서는 GitHub Actions의 실행 결과에서 확인할 수 있습니다. 또한 GitHub의 PR 페이지에서도 커버리지 정보를 확인할 수 있습니다.

### 8.4 배포 알림

팀 커뮤니케이션 도구(Slack, Teams 등)에 배포 알림을 전송하도록 구성할 수 있습니다:

```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    fields: repo,message,commit,author,action,workflow
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  if: always() # 성공/실패 상관없이 항상 알림 전송
```

## 9. 문제 해결

### 9.1 일반적인 문제

| 문제                | 해결 방법                                                  |
| ------------------- | ---------------------------------------------------------- |
| 의존성 설치 실패    | `mix.lock` 파일이 저장소에 포함되어 있는지 확인            |
| 테스트 실패         | 로컬에서 `mix test`를 실행하여 문제 확인                   |
| 포맷팅 검사 실패    | `mix format`을 실행한 후 변경사항 커밋                     |
| 코드 품질 검사 실패 | `mix credo --strict`를 로컬에서 실행하여 문제 확인 및 수정 |
| 배포 실패           | fly.io 구성 파일이 올바른지 확인                           |

### 9.2 디버깅 방법

GitHub Actions의 실행 로그를 확인하여 오류의 원인을 파악할 수 있습니다:

1. GitHub 저장소 → Actions 탭 → 해당 워크플로우 실행 → 실패한 작업 클릭
2. 오류가 발생한 단계의 로그 확인

### 9.3 수동 워크플로우 실행

문제 해결을 위해 워크플로우를 수동으로 실행할 수 있습니다:

1. GitHub 저장소 → Actions 탭 → CI/CD Pipeline 워크플로우 → Run workflow 버튼
2. 필요한 경우 브랜치 선택 후 실행

## 10. 배포 워크플로우 확장 및 커스터마이징

### 10.1 새 작업 추가

새로운 작업을 추가하려면 `jobs` 섹션에 다음과 같이 정의합니다:

```yaml
jobs:
  # 기존 작업들...

  new_job_name:
    name: New Job Description
    runs-on: ubuntu-latest
    needs: [verify] # 의존하는 작업 지정

    steps:
      - uses: actions/checkout@v3
      # 필요한 단계 추가
```

### 10.2 환경 추가

새로운 환경(예: QA)을 추가하려면 다음과 같이 설정합니다:

```yaml
deploy_qa:
  name: Deploy to QA
  needs: verify
  if: github.event_name == 'push' && github.ref == 'refs/heads/qa'
  runs-on: ubuntu-latest
  environment: qa

  steps:
    - uses: actions/checkout@v3
    - uses: superfly/flyctl-actions/setup-flyctl@master
    - name: Deploy to QA
      env:
        FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
      run: |
        flyctl deploy --app automata-signal-qa --config fly.qa.toml
```

### 10.3 통합 추가

알림 시스템, 모니터링 도구 등과의 통합을 추가할 수 있습니다:

```yaml
# Datadog 통합 예시
- name: Push Metrics to Datadog
  run: |
    curl -X POST "https://api.datadoghq.com/api/v1/series" \
    -H "Content-Type: application/json" \
    -H "DD-API-KEY: ${{ secrets.DATADOG_API_KEY }}" \
    -d @- << EOF
    {
      "series": [
        {
          "metric": "deployment.count",
          "points": [[$(date +%s), 1]],
          "tags": ["env:${{ github.ref_name }}", "app:automata-signal"]
        }
      ]
    }
    EOF
```

## 11. 배포 모범 사례

### 11.1 워크플로우 최적화

1. **캐싱 활용**: 의존성과 빌드 결과물을 캐싱하여 실행 시간 단축
2. **매트릭스 빌드**: 여러 버전의 Elixir/OTP로 테스트해야 하는 경우 매트릭스 전략 사용
3. **필요한 작업만 실행**: 조건부 실행을 통해 필요한 작업만 수행

### 11.2 보안 강화

1. **비밀 관리**: 모든 민감한 정보는 GitHub Secrets로 관리
2. **최소 권한**: 각 작업에 필요한 최소한의 권한만 부여
3. **의존성 검사**: `mix hex.audit`를 통한 의존성 취약점 검사 추가

### 11.3 배포 안전성

1. **점진적 롤아웃**: 중요 변경사항은 단계적으로 배포
2. **자동 롤백**: 중요 지표 이상 시 자동 롤백 메커니즘 구현
3. **배포 창**: 위험이 낮은 시간대에 배포 일정 계획

## 12. 참고 자료

- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [fly.io 배포 가이드](https://fly.io/docs/languages-and-frameworks/elixir/)
- [ExCoveralls 문서](https://github.com/parroty/excoveralls)
- [Credo 문서](https://github.com/rrrene/credo)
- [Dialyxir 문서](https://github.com/jeremyjh/dialyxir)
- [Sobelow 문서](https://github.com/nccgroup/sobelow)
