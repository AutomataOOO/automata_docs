# [GUIDE-001] 시작하기 가이드

| 버전 | 날짜       | 변경 내용      |
| ---- | ---------- | -------------- |
| 1.0  | 2025-04-02 | 최초 문서 작성 |

## 관련 문서

- [DESIGN-001] 아키텍처 개요
- [DESIGN-002] 시스템 아키텍처
- [PLAN-001] 요구사항

## 요약

본 문서는 Automata-Signal 프로젝트의 개발 환경 구축을 위한 단계별 가이드를 제공합니다. Elixir Umbrella 프로젝트 생성부터 Ash Framework 설치, 그리고 기본 구성까지의 과정을 포함합니다.

## 대상 독자

- 개발자
- 시스템 엔지니어
- 프로젝트 기여자

## 사전 요구사항

Automata-Signal 개발을 시작하기 전에 다음 도구가 설치되어 있어야 합니다:

- **Elixir**: 1.18 이상
- **Erlang/OTP**: 27 이상
- **PostgreSQL**: 17 이상
- **Git**: 최신 버전

## 1. Umbrella 프로젝트 생성

Automata-Signal은 Elixir Umbrella 프로젝트 구조를 사용합니다. 다음 명령으로 프로젝트를 생성합니다:

```bash
# Umbrella 프로젝트 생성
mix new automata --umbrella

# 생성된 디렉토리로 이동
cd automata

# Git 저장소 초기화
git init
git add .
git commit -m "Initial commit: Umbrella project structure"
```

이렇게 하면 다음과 같은 기본 구조가 생성됩니다:

```
automata/
├── .git/
├── .gitignore
├── README.md
├── apps/
├── config/
└── mix.exs
```

## 2. Automata-Signal 앱 생성 및 Ash Framework 설치

Umbrella 프로젝트 내에 automata_signal 앱을 생성하고 Ash Framework와 관련 확장을 설치합니다:

```bash
# apps 디렉토리로 이동
cd apps

# 설치 스크립트 실행
sh <(curl 'https://ash-hq.org/install/automata_signal?install=phoenix') \
    && cd automata_signal && mix igniter.install ash ash_phoenix \
    ash_json_api ash_postgres --yes
```

이 명령은 다음 작업을 수행합니다:

1. Ash 설치 스크립트를 실행하여 automata_signal Phoenix 앱을 생성합니다
2. ash와 ash_phoenix, ash_json_api, ash_postgres 확장을 설치합니다

### 추가 Ash 확장 설치

기본 Ash 확장이 설치된 후, 필요한 추가 확장을 설치합니다:

```bash
# apps/automata_signal 디렉토리에서 실행
mix igniter.install ash_state_machine ash_oban ash_paper_trail ash_archival \
    ash_cloak ash_money ash_double_entry ash_csv --yes
```

이 명령은 다음 Ash 확장 모듈을 설치합니다:

- ash_state_machine: 상태 기계 관리
- ash_oban: 비동기 작업 처리
- ash_paper_trail: 변경 추적
- ash_archival: 논리적 삭제
- ash_cloak: 데이터 암호화
- ash_money: 통화 처리
- ash_double_entry: 이중 원장
- ash_csv: CSV 내보내기

## 3. Ash 설정 적용

앱 생성과 확장 설치가 완료된 후, Ash Framework 초기화를 위해 설정을 적용합니다:

```bash
mix ash.setup
```

## 4. 서버 실행

```bash
# 개발 서버 실행
mix phx.server

# 또는 대화형 셸과 함께 실행
iex -S mix phx.server
```

## 5. 자주 발생하는 문제 해결

### PostgreSQL 연결 오류

- PostgreSQL 서비스가 실행 중인지 확인
- 사용자 이름과 비밀번호가 올바른지 확인
- 데이터베이스 생성 권한이 있는지 확인

### 의존성 충돌

- `mix deps.unlock --all` 명령으로 의존성 잠금 해제 후 `mix deps.get`을 다시 실행
- 최신 Hex 패키지를 사용 중인지 확인: `mix local.hex`

## 6. 다음 단계

개발 환경 구축이 완료되었습니다. 다음 단계로 넘어가세요:

1. [DESIGN-001] 아키텍처 개요 검토
2. [REF-002] 상태 코드 사전 이해
3. [SEQ-001] 초기화 시퀀스 구현 시작
4. [SEQ-002] 메시지 처리 시퀀스 구현 시작

## 7. 참고 자료

- [Elixir 공식 문서](https://elixir-lang.org/docs.html)
- [Phoenix Framework 가이드](https://hexdocs.pm/phoenix/overview.html)
- [Ash Framework 시작하기 가이드](https://hexdocs.pm/ash/get-started.html)
- [Ash Framework 튜토리얼](https://hexdocs.pm/ash/tutorials.html)
- [Ash Phoenix 문서](https://hexdocs.pm/ash_phoenix/AshPhoenix.html)
- [Ash JSON API 문서](https://hexdocs.pm/ash_json_api/AshJsonApi.html)
- [Ash Postgres 문서](https://hexdocs.pm/ash_postgres/AshPostgres.html)
- [Oban 문서](https://hexdocs.pm/oban/Oban.html)
