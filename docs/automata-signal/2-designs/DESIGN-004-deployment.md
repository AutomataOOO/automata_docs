# [DESIGN-004] 배포 구조

| 버전 | 날짜       | 변경 내용      |
| ---- | ---------- | -------------- |
| 1.0  | 2025-04-02 | 최초 문서 작성 |

## 관련 문서

- [DESIGN-001] 아키텍처 개요
- [DESIGN-002] 시스템 아키텍처
- [DESIGN-003] 데이터 모델
- [SEQ-001] 초기화 시퀀스
- [SEQ-002] 메시지 처리 시퀀스

## 요약

본 문서는 Automata-Signal 시스템의 배포 구조를 상세히 설명합니다. 글로벌 분산 배포 전략, 인프라 구성, 확장성, 고가용성, CI/CD 파이프라인 등을 다룹니다.

## 대상 독자

- DevOps 엔지니어
- 시스템 운영자
- 개발자
- 시스템 아키텍트

## 1. 배포 아키텍처 개요

Automata-Signal은 fly.io 플랫폼을 기반으로 글로벌 분산 배포를 구현합니다. 지리적으로 분산된 데이터센터에 애플리케이션을 배포하여 전 세계 사용자에게 낮은 지연 시간과 높은 가용성을 제공합니다.

```mermaid
flowchart TB
    subgraph fly ["fly.io"]
        subgraph nrt ["도쿄 리전 (nrt)"]
            nrt1[Elixir 노드 #1]
            nrt2[Elixir 노드 #2]
            nrt3[Elixir 노드 #3]
            nrt4[Elixir 노드 #4]
        end

        subgraph fra ["프랑크푸르트 리전 (fra)"]
            fra1[Elixir 노드 #1]
            fra2[Elixir 노드 #2]
            fra3[Elixir 노드 #3]
            fra4[Elixir 노드 #4]
        end

        subgraph syd ["시드니 리전 (syd)"]
            syd1[Elixir 노드 #1]
            syd2[Elixir 노드 #2]
            syd3[Elixir 노드 #3]
            syd4[Elixir 노드 #4]
        end

        db_nrt[(PostgreSQL<br>Primary<br>도쿄)]
        db_fra[(PostgreSQL<br>Replica<br>프랑크푸르트)]
        db_syd[(PostgreSQL<br>Replica<br>시드니)]
    end

    subgraph cd ["CI/CD 파이프라인"]
        github[GitHub]
        actions[GitHub Actions]
        registry[컨테이너 레지스트리]
    end

    subgraph external ["외부 서비스"]
        apns[Apple APNS]
        fcm[Firebase FCM]
        email[이메일 서비스<br>지원 예정]
        sms[SMS 게이트웨이<br>지원 예정]
        kakao[카카오 API<br>지원 예정]
    end

    subgraph client ["사용자"]
        asia[아시아 지역<br>사용자]
        europe[유럽 지역<br>사용자]
        oceania[오세아니아<br>지역 사용자]
    end

    %% 노드 간 연결
    nrt1 <--> nrt2
    nrt2 <--> nrt3
    nrt3 <--> nrt4
    nrt4 <--> nrt1

    fra1 <--> fra2
    fra2 <--> fra3
    fra3 <--> fra4
    fra4 <--> fra1

    syd1 <--> syd2
    syd2 <--> syd3
    syd3 <--> syd4
    syd4 <--> syd1

    %% 리전 간 연결 (libcluster)
    nrt1 <--> fra1
    nrt1 <--> syd1
    fra1 <--> syd1

    %% 데이터베이스 복제
    db_nrt --> db_fra
    db_nrt --> db_syd

    %% 데이터베이스 연결
    nrt1 --> db_nrt
    nrt2 --> db_nrt
    nrt3 --> db_nrt
    nrt4 --> db_nrt

    fra1 --> db_fra
    fra2 --> db_fra
    fra3 --> db_fra
    fra4 --> db_fra

    syd1 --> db_syd
    syd2 --> db_syd
    syd3 --> db_syd
    syd4 --> db_syd

    %% CI/CD 흐름
    github --> actions
    actions --> registry
    registry --> nrt1
    registry --> fra1
    registry --> syd1

    %% 외부 서비스 연결
    nrt1 --- apns
    nrt1 --- fcm
    fra1 --- apns
    fra1 --- fcm
    syd1 --- apns
    syd1 --- fcm

    %% 사용자 요청 라우팅
    asia --> nrt1
    europe --> fra1
    oceania --> syd1
```

## 2. fly.io 인프라 구성

### 2.1 리전 및 노드 구성

Automata-Signal은 초기에 다음 3개 리전에 배포됩니다:

| 리전 코드 | 위치               | 노드 수 | 목적                   |
| --------- | ------------------ | ------- | ---------------------- |
| nrt       | 도쿄, 일본         | 4       | 아시아 지역 서비스     |
| fra       | 프랑크푸르트, 독일 | 4       | 유럽 지역 서비스       |
| syd       | 시드니, 호주       | 4       | 오세아니아 지역 서비스 |

각 노드는 다음과 같이 구성됩니다:

- **VM 크기**: 4 vCPU, 8GB RAM
- **스토리지**: 40GB SSD (노드당)
- **운영체제**: Linux (Debian)
- **컨테이너 런타임**: Docker
- **네트워크**: 리전 내 로컬 네트워크, 리전 간 암호화된 통신

### 2.2 데이터베이스 구성

PostgreSQL 데이터베이스는 다음과 같이 구성됩니다:

- **프라이머리 노드**: 도쿄(nrt) 리전
- **읽기 복제본**: 프랑크푸르트(fra) 및 시드니(syd) 리전
- **VM 크기**: 8 vCPU, 16GB RAM
- **스토리지**: 500GB SSD
- **복제 방식**: 스트리밍 복제 (비동기)
- **백업 전략**: 일일 전체 백업, 15분 간격 증분 백업

### 2.3 네트워크 구성

- **공용 엔드포인트**: 리전별 API 엔드포인트 (\*.automata-signal.com)
- **애니캐스트 IP**: 글로벌 단일 엔드포인트로 가장 가까운 리전으로 라우팅
- **프라이빗 네트워크**: fly.io 내부 네트워크로 노드 및 데이터베이스 간 통신
- **IPv6 지원**: 모든 엔드포인트에서 IPv6 지원

### 2.4 DNS 구성

| 도메인                       | 목적                               |
| ---------------------------- | ---------------------------------- |
| api.automata-signal.com      | 글로벌 API 엔드포인트 (애니캐스트) |
| api-asia.automata-signal.com | 아시아 리전 직접 접근 (도쿄)       |
| api-eu.automata-signal.com   | 유럽 리전 직접 접근 (프랑크푸르트) |
| api-oce.automata-signal.com  | 오세아니아 리전 직접 접근 (시드니) |
| admin.automata-signal.com    | 관리자 대시보드 (향후 구현)        |

## 3. fly.io 구성 및 배포

### 3.1 fly.toml 구성

Automata-Signal의 기본 `fly.toml` 설정:

```toml
# fly.toml

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

### 3.2 Dockerfile

```dockerfile
FROM hexpm/elixir:1.18.0-erlang-27.0.0-debian-bullseye-20240311 as build

# 빌드 환경 설정
WORKDIR /app
ENV MIX_ENV=prod

# 의존성 파일 복사 및 설치
COPY mix.exs mix.lock ./
COPY config config
COPY apps apps

RUN mix local.hex --force && \
    mix local.rebar --force && \
    mix deps.get --only prod && \
    mix deps.compile

# 릴리스 빌드
RUN mix compile
RUN mix release

# 실행 이미지 준비
FROM debian:bullseye-slim

# 런타임 의존성 설치
RUN apt-get update -y && \
    apt-get install -y libstdc++6 openssl libncurses5 locales ca-certificates && \
    apt-get clean && \
    rm -f /var/lib/apt/lists/*_*

# 로케일 설정
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

WORKDIR /app
COPY --from=build /app/_build/prod/rel/automata ./

# 앱 실행
CMD ["/app/bin/automata", "start"]
```

### 3.3 리전별 배포 전략

각 리전은 별도의 fly 앱으로 배포하여 독립적으로 관리합니다:

```bash
# 도쿄 리전 배포
fly deploy --app automata-signal-nrt

# 프랑크푸르트 리전 배포
fly deploy --app automata-signal-fra

# 시드니 리전 배포
fly deploy --app automata-signal-syd
```

### 3.4 스케일링 설정

자동 스케일링을 위한 구성:

```bash
# 최소 노드 수 설정
fly scale count 4 --app automata-signal-nrt
fly scale count 4 --app automata-signal-fra
fly scale count 4 --app automata-signal-syd

# VM 크기 설정
fly scale vm shared-cpu-4x:8gb --app automata-signal-nrt
fly scale vm shared-cpu-4x:8gb --app automata-signal-fra
fly scale vm shared-cpu-4x:8gb --app automata-signal-syd
```

### 3.5 데이터베이스 배포

PostgreSQL 클러스터 생성 및 구성:

```bash
# 프라이머리 데이터베이스 생성 (도쿄)
fly postgres create --name automata-signal-db --region nrt

# 읽기 복제본 추가 (프랑크푸르트)
fly postgres attach --postgres-app automata-signal-db --app automata-signal-fra

# 읽기 복제본 추가 (시드니)
fly postgres attach --postgres-app automata-signal-db --app automata-signal-syd
```

## 4. 분산 Elixir 클러스터 구성

### 4.1 libcluster 설정

Elixir 노드 간의 자동 클러스터링을 위한 libcluster 구성:

```elixir
# config/prod.exs
config :libcluster,
  topologies: [
    fly6pn: [
      strategy: Cluster.Strategy.DNSPoll,
      config: [
        polling_interval: 5_000,
        query: "#{System.get_env("FLY_APP_NAME")}.internal",
        node_basename: System.get_env("FLY_APP_NAME")
      ]
    ],
    global_cluster: [
      strategy: Elixir.Cluster.Strategy.Gossip,
      config: [
        secret: System.get_env("CLUSTER_SECRET"),
        hosts: [
          :"automata-signal-nrt@fly-global-services",
          :"automata-signal-fra@fly-global-services",
          :"automata-signal-syd@fly-global-services"
        ]
      ]
    ]
  ]
```

### 4.2 Erlang 분산 설정

Erlang 분산 프로토콜 설정:

```elixir
# config/runtime.exs
config :automata, :distributed,
  cookie: System.fetch_env!("NODE_COOKIE"),
  name: :"#{System.get_env("FLY_APP_NAME")}@#{System.get_env("FLY_PRIVATE_IP")}"
```

### 4.3 분산 Phoenix PubSub 구성

노드 간 이벤트 공유를 위한 PubSub 구성:

```elixir
# lib/automata/application.ex
def start(_type, _args) do
  children = [
    # ... 다른 자식 프로세스들 ...
    {Phoenix.PubSub, name: Automata.PubSub},
    {Phoenix.PubSub.PG2, name: Automata.GlobalPubSub, adapter_name: Automata.PubSub}
  ]

  # ...
end
```

### 4.4 분산 캐시 구성

전역 상태 및 캐시 관리를 위한 Nebulex 설정:

```elixir
# lib/automata/cache.ex
defmodule Automata.Cache do
  use Nebulex.Cache,
    otp_app: :automata,
    adapter: Nebulex.Adapters.Partitioned

  # ...
end

# config/prod.exs
config :automata, Automata.Cache,
  backend: :shards,
  partitions: 8,
  distributed: [
    name: Automata.DistributedCache,
    only_nodes: [node()]
  ]
```

## 5. 데이터베이스 연결 관리

### 5.1 Ecto 리포지토리 설정

PostgreSQL 연결 설정:

```elixir
# config/prod.exs
config :automata, Automata.Repo,
  adapter: Ash.Postgres.Repo,
  url: System.get_env("DATABASE_URL"),
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "30"),
  socket_options: [:inet6],
  ssl: true,
  ssl_opts: [
    verify: :verify_peer,
    cacertfile: System.get_env("FLY_DB_CA_CERT", "/etc/ssl/certs/ca-certificates.crt"),
    server_name_indication: System.get_env("FLY_DB_HOST") |> String.to_charlist()
  ]
```

### 5.2 읽기/쓰기 분리

읽기와 쓰기 작업을 분리하여 효율성 향상:

```elixir
# lib/automata/repo.ex
defmodule Automata.Repo do
  use Ecto.Repo,
    otp_app: :automata,
    adapter: Ecto.Adapters.Postgres
end

defmodule Automata.ReadOnlyRepo do
  use Ecto.Repo,
    otp_app: :automata,
    adapter: Ecto.Adapters.Postgres

  def init(_, config) do
    config = Keyword.put(config, :url, System.get_env("DATABASE_READ_REPLICA_URL") || System.get_env("DATABASE_URL"))
    {:ok, config}
  end
end

# 사용 예시
defmodule Automata.QueryService do
  def get_analytics_data(params) do
    # 읽기 전용 쿼리는 읽기 복제본 사용
    Automata.ReadOnlyRepo.all(analytics_query(params))
  end

  def update_record(id, params) do
    # 쓰기 작업은 주 데이터베이스 사용
    Automata.Repo.update(...)
  end
end
```

### 5.3 연결 풀 최적화

데이터베이스 연결 풀 최적화 설정:

```elixir
# config/prod.exs
config :automata, Automata.Repo,
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "30"),
  queue_target: 5000,
  queue_interval: 5000,
  timeout: 60000

config :automata, Automata.ReadOnlyRepo,
  pool_size: String.to_integer(System.get_env("RO_POOL_SIZE") || "50"),
  queue_target: 2000,
  queue_interval: 2000,
  timeout: 30000
```

### 5.4 데이터베이스 마이그레이션

배포 중 안전한 데이터베이스 마이그레이션 방법:

```elixir
# lib/automata/release.ex
defmodule Automata.Release do
  @app :automata

  def migrate do
    load_app()

    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end
  end

  def rollback(repo, version) do
    load_app()
    {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :down, to: version))
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    Application.load(@app)
  end
end
```

## 6. CI/CD 파이프라인

### 6.1 GitHub Actions 워크플로우

지속적 통합 및 배포를 위한 GitHub Actions 구성:

```yaml
# .github/workflows/deploy.yml
name: Deploy Automata-Signal

on:
  push:
    branches: [main]
  workflow_dispatch:

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
      - uses: actions/cache@v3
        with:
          path: deps
          key: ${{ runner.os }}-mix-${{ hashFiles(format('{0}{1}', github.workspace, '/mix.lock')) }}
          restore-keys: |
            ${{ runner.os }}-mix-
      - name: Install Dependencies
        run: mix deps.get
      - name: Run Tests
        run: mix test

  deploy:
    name: Deploy to fly.io
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        region: [nrt, fra, syd]

    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - name: Deploy to ${{ matrix.region }}
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
        run: |
          flyctl deploy --app automata-signal-${{ matrix.region }} --remote-only

  migrations:
    name: Run Migrations
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - name: Run Migrations
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
        run: |
          flyctl ssh console --app automata-signal-nrt --command "/app/bin/automata eval 'Automata.Release.migrate'"
```

### 6.2 배포 전략

무중단 배포를 위한 롤링 업데이트 전략:

1. 각 리전의 노드를 한 번에 하나씩 업데이트
2. 노드 교체 전 상태 점검 및 트래픽 드레이닝
3. 배포 중 지속적인 상태 모니터링
4. 문제 발생 시 자동 롤백 수행

### 6.3 환경별 구성

서로 다른 환경을 위한 구성 관리:

| 환경     | 애플리케이션 이름               | 목적               |
| -------- | ------------------------------- | ------------------ |
| 개발     | automata-signal-dev             | 개발자 테스트      |
| 스테이징 | automata-signal-staging         | QA 및 통합 테스트  |
| 프로덕션 | automata-signal-`{nrt,fra,syd}` | 실제 사용자 서비스 |

### 6.4 비밀 관리

민감한 구성 정보를 안전하게 관리하기 위한 전략:

1. GitHub Secrets를 통한 CI/CD 비밀 관리
2. fly.io 비밀 관리 서비스를 통한 런타임 비밀 관리
3. 환경 변수 기반 구성 로드

```bash
# 런타임 비밀 설정
fly secrets set NODE_COOKIE=<secret_value> --app automata-signal-nrt
fly secrets set APNS_KEY_ID=<secret_value> --app automata-signal-nrt
fly secrets set FCM_SERVER_KEY=<secret_value> --app automata-signal-nrt
```

## 7. 확장 전략

### 7.1 수평적 확장

트래픽 증가에 따른 수평적 확장 전략:

1. **새 노드 추가**: 리전별 노드 수 증가

   ```bash
   fly scale count 8 --app automata-signal-nrt
   ```

2. **새 리전 추가**: 주요 사용자 지역에 새 리전 배포

   ```bash
   # 예: IAD(북미, 버지니아) 리전 추가
   fly regions add iad --app automata-signal-iad
   ```

3. **자동 스케일링**: 트래픽 기반 자동 스케일링 설정
   ```bash
   fly autoscale set min=4 max=8 --app automata-signal-nrt
   ```

### 7.2 데이터베이스 확장

데이터 볼륨 증가에 따른 데이터베이스 확장 전략:

1. **수직적 확장**: 더 큰 VM으로 데이터베이스 업그레이드

   ```bash
   fly postgres update vm-size --vm-size performance-8x --app automata-signal-db
   ```

2. **스토리지 확장**: 데이터베이스 볼륨 확장

   ```bash
   fly volumes extend vol_123abcd --size 1000 --app automata-signal-db
   ```

3. **읽기 전용 복제본 추가**: 읽기 작업 분산을 위한 추가 복제본 배포

   ```bash
   fly postgres create --name automata-signal-db-ro --region nrt
   ```

4. **향후 샤딩 전략**: 대규모 데이터를 위한 샤딩 아키텍처 준비
   - 시간 기반 샤딩
   - 애플리케이션 ID 기반 샤딩
   - 리전 기반 샤딩

### 7.3 캐시 계층

성능 향상을 위한 캐시 전략:

1. **Nebulex 분산 캐시**: 노드 간 공유 캐시
2. **Redis 캐시 계층**: 전역 공유 상태 및 임시 데이터 저장
3. **CDN**: 정적 자산 및 API 응답 캐싱

### 7.4 작업 처리 확장

대규모 작업 처리를 위한 확장 전략:

1. **작업 노드 분리**: 전용 작업 처리 노드 배포
2. **작업 분산**: 작업 유형별 전용 큐 및 워커 설정
3. **우선순위 큐**: 중요 작업 우선 처리

## 8. 고가용성 및 장애 허용성

### 8.1 리전 장애 대응

단일 리전 장애 시 대응 전략:

1. **트래픽 페일오버**: 자동 트래픽 재라우팅
2. **데이터베이스 페일오버**: 복제본을 기본 데이터베이스로 승격
3. **복구 자동화**: 장애 복구 프로세스 자동화

### 8.2 데이터베이스 장애 대응

데이터베이스 장애 시 대응 전략:

1. **읽기 전용 모드**: 기본 DB 장애 시 읽기 전용 모드 운영
2. **자동 복구**: 오류 감지 및 자동 복구 시퀀스
3. **백업 복원**: 최신 백업에서 신속한 복원

### 8.3 노드 장애 대응

단일 노드 장애 시 대응 전략:

1. **상태 점검**: 정기적인 노드 상태 점검
2. **자동 재시작**: 장애 노드 자동 재시작
3. **트래픽 우회**: 장애 노드로의 트래픽 차단

### 8.4 다중 리전 복원력

전역 서비스 가용성을 위한 전략:

1. **리전 격리**: 리전 간 장애 격리
2. **데이터 복제**: 주요 데이터 다중 리전 복제
3. **분산 작업 복구**: 작업 복구 및 재시도 메커니즘

## 9. 모니터링 및 알림

### 9.1 모니터링 아키텍처

시스템 상태 모니터링을 위한 아키텍처:

```mermaid
flowchart LR
    subgraph Apps ["애플리케이션"]
        metrics[Prometheus 측정항목]
        logs[로그 시스템]
        traces[분산 추적]
    end

    subgraph Monitoring ["모니터링 도구"]
        prom[Prometheus]
        loki[Loki]
        tempo[Tempo]
        grafana[Grafana]
    end

    subgraph Alerts ["알림"]
        alertmanager[AlertManager]
        slack[Slack]
        email[이메일]
        pager[PagerDuty]
    end

    metrics --> prom
    logs --> loki
    traces --> tempo

    prom --> grafana
    loki --> grafana
    tempo --> grafana

    prom --> alertmanager
    alertmanager --> slack
    alertmanager --> email
    alertmanager --> pager
```

### 9.2 핵심 지표

모니터링할 핵심 시스템 지표:

1. **시스템 지표**:

   - CPU 사용률
   - 메모리 사용량
   - 디스크 I/O
   - 네트워크 트래픽

2. **애플리케이션 지표**:

   - API 요청 처리량
   - 응답 시간
   - 오류율
   - 동시 연결 수

3. **비즈니스 지표**:
   - 메시지 처리량
   - 전송 성공률
   - 메시지 전환율
   - 채널별 성능

### 9.3 로깅 전략

시스템 로그 관리 전략:

1. **구조화된 로깅**: JSON 형식 로그 생성
2. **중앙 로그 집계**: Loki를 통한 로그 저장 및 쿼리
3. **로그 수준 관리**: 환경별 로그 수준 조정
4. **로그 보존 정책**: 로그 유형별 보존 기간 설정

### 9.4 알림 설정

중요 이벤트 감지 및 알림 전략:

1. **심각도 수준**:

   - 긴급: 즉시 대응 필요한 프로덕션 장애
   - 주요: 성능 저하 또는 부분적 장애
   - 경고: 잠재적 문제 징후
   - 정보: 일반 정보 알림

2. **알림 채널**:

   - Slack: 팀 알림
   - 이메일: 요약 및 일일 보고서
   - PagerDuty: 긴급 상황 온콜 알림

3. **알림 규칙 예시**:
   ```yaml
   # 알림 규칙 예시
   groups:
     - name: automata_signal_alerts
       rules:
         - alert: HighErrorRate
           expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
           for: 2m
           labels:
             severity: critical
           annotations:
             summary: 'High error rate detected'
             description: 'Error rate is above 5% for the past 2 minutes'
   ```

## 10. 재해 복구

### 10.1 백업 전략

데이터 손실 방지를 위한 백업 전략:

1. **정기 백업**:

   - 일일 전체 백업
   - 6시간 간격 차등 백업
   - 1시간 간격 증분 백업

2. **백업 저장소**:

   - 리전별 기본 백업
   - 다중 리전 복제 백업
   - 장기 보존을 위한 냉각 저장소

3. **백업 점검**:
   - 정기적인 백업 복원 테스트
   - 백업 무결성 확인

### 10.2 재해 복구 계획

주요 재해 시나리오에 대한 복구 계획:

1. **리전 장애 복구**:

   - 장애 리전 감지
   - 트래픽 재라우팅
   - 새 리전에 인프라 재배포
   - 데이터 복구

2. **데이터베이스 장애 복구**:

   - 복제본 승격
   - 읽기/쓰기 엔드포인트 재구성
   - 새 복제본 생성
   - 장애 노드 복구

3. **애플리케이션 장애 복구**:
   - 장애 노드 식별
   - 노드 교체
   - 클러스터 재구성

### 10.3 복구 시간 목표

서비스 복구 목표:

| 장애 유형         | RTO (복구 시간 목표) | RPO (복구 지점 목표) |
| ----------------- | -------------------- | -------------------- |
| 단일 노드 장애    | 5분                  | 0 (데이터 손실 없음) |
| 단일 리전 장애    | 15분                 | 5분                  |
| 데이터베이스 장애 | 30분                 | 15분                 |
| 다중 리전 장애    | 2시간                | 30분                 |
| 재해 수준 장애    | 4시간                | 1시간                |

### 10.4 재해 복구 테스트

재해 복구 계획 검증을 위한 정기 테스트:

1. **정기 훈련**: 분기별 DR 시뮬레이션
2. **카오스 엔지니어링**: 임의 장애 주입 테스트
3. **리전 페일오버 테스트**: 리전 간 전환 테스트

## 11. 보안 아키텍처

### 11.1 네트워크 보안

네트워크 보안 아키텍처:

1. **TLS/SSL**: 모든 통신에 TLS 1.3 암호화
2. **IP 제한**: 관리 인터페이스 접근 제한
3. **WAF**: 웹 애플리케이션 방화벽 보호
4. **DDoS 방어**: 분산 서비스 거부 공격 방어 메커니즘

### 11.2 애플리케이션 보안

애플리케이션 레벨 보안:

1. **API 인증**: API 키 및 JWT 기반 인증
2. **접근 제어**: 세분화된 권한 관리
3. **입력 검증**: 모든 사용자 입력 검증
4. **의존성 검사**: 정기적인 의존성 취약점 검사

### 11.3 데이터 보안

데이터 보안 방식:

1. **저장 데이터 암호화**: 민감 데이터 암호화 (ash_cloak)
2. **전송 중 암호화**: TLS를 통한 모든 데이터 암호화
3. **접근 로깅**: 민감 데이터 접근 감사 로깅
4. **데이터 최소화**: 필요한 최소한의 데이터만 저장

### 11.4 인증 및 인가

사용자 및 API 인증 메커니즘:

1. **API 키 관리**: 앱별 API 키 관리
2. **토큰 회전**: 정기적 API 키 갱신
3. **세션 관리**: 안전한 관리자 세션 처리
4. **역할 기반 권한**: 세분화된 접근 제어 모델

## 12. 성능 최적화

### 12.1 처리량 최적화

높은 처리량을 위한 최적화:

1. **병렬 처리**: 멀티코어 활용 병렬 작업 처리
2. **비동기 처리**: 작업 큐 기반 비동기 처리
3. **배치 처리**: 대량 작업 배치 처리
4. **연결 풀링**: 효율적인 리소스 활용

### 12.2 지연 시간 최적화

낮은 지연 시간을 위한 최적화:

1. **엣지 배포**: 사용자에 가까운 위치 배포
2. **캐싱 전략**: 다중 계층 캐싱 구현
3. **인덱스 최적화**: 데이터베이스 쿼리 최적화
4. **콜드 경로 분리**: 중요 작업 우선 처리

### 12.3 부하 분산

효율적인 부하 분산 전략:

1. **지역 기반 라우팅**: 사용자에게 가장 가까운 리전으로 라우팅
2. **가중치 기반 분산**: 노드 용량에 따른 트래픽 분산
3. **상태 기반 라우팅**: 노드 상태에 따른 트래픽 조정
4. **캠페인 부하 분산**: 대량 캠페인 다중 노드 분산 처리

## 13. 운영 가이드라인

### 13.1 일반 운영 절차

일상적인 운영 작업:

1. **일일 점검**:

   - 시스템 상태 확인
   - 오류 로그 검토
   - 성능 지표 모니터링

2. **주간 유지보수**:

   - 비정상 노드 교체
   - 성능 최적화
   - 보안 패치 적용

3. **월간 작업**:
   - 용량 계획 검토
   - 확장 요구사항 평가
   - 백업 복원 테스트

### 13.2 인시던트 대응

장애 상황 대응 절차:

1. **감지 및 알림**:

   - 자동 알림 수신
   - 상황 평가
   - 대응팀 소집

2. **초기 대응**:

   - 영향 평가
   - 임시 조치 적용
   - 사용자 커뮤니케이션

3. **해결 및 복구**:

   - 근본 원인 분석
   - 영구적 해결책 적용
   - 서비스 복원 확인

4. **사후 분석**:
   - 인시던트 보고서 작성
   - 개선 사항 식별
   - 재발 방지 대책 수립

### 13.3 변경 관리

시스템 변경 관리 절차:

1. **변경 요청**:

   - 요청 목적 및 범위 정의
   - 영향 평가
   - 롤백 계획 수립

2. **변경 승인**:

   - 기술 검토
   - 리스크 평가
   - 최종 승인

3. **변경 구현**:

   - 점진적 롤아웃
   - 모니터링 강화
   - 테스트 검증

4. **사후 검토**:
   - 변경 결과 평가
   - 문제점 식별
   - 프로세스 개선

### 13.4 용량 계획

리소스 용량 관리:

1. **현재 사용량 분석**:

   - 시스템 리소스 사용률
   - 성장 추세 분석
   - 병목 지점 식별

2. **예측 모델링**:

   - 사용자 증가 예측
   - 메시지 볼륨 예측
   - 스토리지 요구사항 예측

3. **확장 계획**:
   - 단기 확장 계획
   - 중기 확장 계획
   - 장기 인프라 로드맵
