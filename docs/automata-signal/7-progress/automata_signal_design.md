# Automata-Signal 설계 문서

| 버전 | 날짜       | 변경 내용      |
| ---- | ---------- | -------------- |
| 1.0  | 2025-04-04 | 최초 문서 작성 |

## 1. 개요

Automata-Signal은 다양한 메시징 채널을 통합하여 효과적인 사용자 참여를 위한 메시징 서비스를 제공하는 플랫폼입니다. 본 문서는 Automata-Signal의 아키텍처, 주요 컴포넌트 및 데이터 흐름을 설명합니다.

## 2. 아키텍처

### 2.1 전체 시스템 아키텍처

Automata-Signal은 Elixir 기반의 Ash Framework를 사용하여 구현된 확장 가능한 메시징 시스템입니다. 주요 아키텍처 구성 요소는 다음과 같습니다:

- **리소스 계층**: 핵심 도메인 모델(Message, Subscription 등)을 정의
- **서비스 계층**: 비즈니스 로직을 캡슐화(MessageService, SubscriptionService 등)
- **어댑터 계층**: 다양한 메시징 채널(푸시, 이메일 등)과의 통합을 제공
- **API 계층**: 외부 시스템과의 통합을 위한 REST API
- **비동기 작업 처리**: 메시지 재시도 및 스케줄링을 위한 Oban 작업 큐

### 2.2 기술 스택

- **백엔드**: Elixir, Phoenix, Ash Framework
- **데이터베이스**: PostgreSQL
- **확장 모듈**:
  - ash_state_machine: 메시지 및 구독 상태 관리
  - ash_archival: 구독 논리적 삭제 처리
  - ash_paper_trail: 변경 이력 관리
  - ash_oban: 비동기 작업 처리

### 2.3 배포 아키텍처

- 글로벌 분산 배포 (fly.io)
- 멀티 리전 지원 (도쿄, 프랑크푸르트, 시드니 등)
- 근접성 기반 라우팅

## 3. 핵심 컴포넌트

### 3.1 도메인 모델

#### 3.1.1 Message

메시지 리소스는 사용자에게 전송되는 메시지 정보를 저장합니다.

| 속성           | 타입           | 설명                           |
| -------------- | -------------- | ------------------------------ |
| id             | UUID           | 고유 식별자                    |
| title          | String         | 메시지 제목                    |
| body           | String         | 메시지 본문                    |
| data           | Map            | 추가 데이터(JSON)              |
| user_id        | UUID           | 메시지 수신자 ID               |
| subscription_id| UUID           | 구독 정보 ID                   |
| application_id | UUID           | 애플리케이션 ID                |
| campaign_id    | UUID           | 캠페인 ID (옵션)               |
| status         | Atom           | 메시지 상태                    |
| channel_type   | Atom           | 채널 타입                      |
| external_id    | String         | 외부 시스템에서의 ID           |
| sent_at        | DateTime       | 전송 시간                      |
| received_at    | DateTime       | 수신 확인 시간                 |
| converted_at   | DateTime       | 열람/클릭 시간                 |
| failed_at      | DateTime       | 실패 시간                      |
| error_reason   | String         | 오류 이유                      |
| error_details  | Map            | 상세 오류 정보                 |

**상태 다이어그램**:
```
pending -> successful -> received -> converted
  |              |
  v              v
errored        failed
  |
  -----> (retry) ----> pending
```

#### 3.1.2 Subscription

구독 리소스는 사용자의 채널 구독 정보를 저장합니다.

| 속성           | 타입           | 설명                           |
| -------------- | -------------- | ------------------------------ |
| id             | UUID           | 고유 식별자                    |
| user_id        | UUID           | 사용자 ID                      |
| application_id | UUID           | 애플리케이션 ID                |
| type           | Atom           | 채널 타입                      |
| token          | String         | 채널 토큰                      |
| device_info    | Map            | 기기 정보                      |
| preferences    | Map            | 알림 설정                      |
| status         | Atom           | 구독 상태                      |
| last_active_at | DateTime       | 마지막 활성 시간               |
| error_details  | Map            | 오류 정보                      |
| archived       | Boolean        | 아카이브 여부                  |
| archived_at    | DateTime       | 아카이브 시간                  |

**상태 다이어그램**:
```
       +--> active <--> inactive
       |      ^
unverified    |
       |      v
       +--> errored

       opted_out (터미널 상태)
```

### 3.2 어댑터 시스템

어댑터 시스템은 다양한 메시징 채널과의 통합을 위한 추상화 계층을 제공합니다.

#### 3.2.1 ChannelAdapter 인터페이스

모든 채널 어댑터가 구현해야 하는 공통 인터페이스:

```elixir
@callback send_message(message :: Message.t()) ::
  {:ok, map()} | {:error, map()}

@callback validate_message(message :: Message.t()) ::
  :ok | {:error, reason :: atom(), details :: map()}

@callback get_status(message_id :: String.t()) ::
  {:ok, status :: atom()} | {:error, reason :: atom()}

@callback map_error(error :: any()) ::
  {:permanent, reason :: atom(), details :: map()} |
  {:temporary, reason :: atom(), details :: map()}
```

#### 3.2.2 구현 어댑터

- **PushAdapter**: APNS 및 FCM을 사용한 푸시 알림
- **EmailAdapter**: 향후 구현 예정
- **SMSAdapter**: 향후 구현 예정
- **KakaoTalkAdapter**: 향후 구현 예정
- **InAppAdapter**: 향후 구현 예정

### 3.3 서비스 계층

#### 3.3.1 MessageService

메시지 전송 및 상태 관리를 담당하는 서비스:

- 메시지 생성 및 전송
- 메시지 상태 업데이트 (수신 확인, 열람 확인)
- 오류 처리 및 재시도 전략

#### 3.3.2 SubscriptionService

구독 관리를 담당하는 서비스:

- 구독 등록 및 업데이트
- 구독 활성화/비활성화
- 구독 영구 거부(opt-out)

### 3.4 API 계층

REST API는
아래와 같은 주요 엔드포인트를 제공합니다:

#### 3.4.1 구독 API

- `POST /api/v1/subscriptions` - 구독 등록
- `GET /api/v1/users/:user_id/subscriptions` - 사용자 구독 목록 조회
- `GET /api/v1/users/:user_id/subscriptions/:type` - 특정 유형의 사용자 구독 조회
- `PUT /api/v1/users/:user_id/subscriptions/:type/activate` - 구독 활성화
- `PUT /api/v1/users/:user_id/subscriptions/:type/deactivate` - 구독 비활성화
- `PUT /api/v1/users/:user_id/subscriptions/:type/opt-out` - 구독 영구 거부

#### 3.4.2 메시지 API

- `POST /api/v1/messages` - 메시지 생성
- `GET /api/v1/messages/:id` - 메시지 조회
- `GET /api/v1/users/:user_id/messages` - 사용자 메시지 목록 조회
- `POST /api/v1/messages/:id/send` - 메시지 전송
- `PUT /api/v1/messages/:id/received` - 메시지 수신 확인
- `PUT /api/v1/messages/:id/converted` - 메시지 열람 확인

## 4. 비동기 작업 처리

### 4.1 메시지 재시도 전략

일시적인 오류로 인한 메시지 전송 실패 시 재시도 전략:

- 지수 백오프 적용 (30초, 2분, 5분, 15분, 30분)
- 최대 5회 재시도
- 영구적 오류(잘못된 토큰 등)는 재시도 없음

### 4.2 Oban 작업자

- **MessageRetryWorker**: 메시지 재시도 처리

## 5. 성능 고려사항

- 메시지 배치 처리
- 데이터베이스 연결 풀링 최적화
- 템플릿 캐싱
- 채널별 전송 비율 제한 관리

## 6. 보안 고려사항

- 개인 식별 정보 보호
- API 인증 및 권한 관리
- 데이터 암호화
- HTTPS/TLS 통신

## 7. 확장성 계획

- 멀티채널 메시징 확장
- 템플릿 시스템 구현
- 분석 시스템 통합
- 캠페인 관리 기능