# [REF-001] API 참조

| 버전 | 날짜       | 변경 내용      |
| ---- | ---------- | -------------- |
| 1.0  | 2025-04-02 | 최초 문서 작성 |

## 관련 문서

- [DESIGN-001] 아키텍처 개요
- [DESIGN-002] 시스템 아키텍처
- [REF-002] 상태 코드
- [REF-003] 오류 코드

## 요약

본 문서는 Automata-Signal API의 포괄적인 참조 문서입니다. API 엔드포인트, 요청/응답 형식, 인증 방법, 오류 처리 등에 대한 상세 정보를 제공합니다.

## 대상 독자

- 클라이언트 개발자
- API 통합 개발자
- 시스템 엔지니어
- QA 엔지니어

## 1. API 개요

### 1.1 기본 URL

```
https://api.automata-signal.com/api/v1
```

리전별 엔드포인트:

- 아시아: `https://api-asia.automata-signal.com/api/v1`
- 유럽: `https://api-eu.automata-signal.com/api/v1`
- 오세아니아: `https://api-oce.automata-signal.com/api/v1`

### 1.2 인증

모든 API 요청은 HTTP 헤더를 통해 API 키를 제공해야 합니다:

```
X-API-Key: your_api_key_here
```

API 키는 애플리케이션 관리 인터페이스에서 생성하고 관리할 수 있습니다.

### 1.3 요청 형식

모든 요청 본문은 JSON 형식을 사용해야 하며, `Content-Type` 헤더를 `application/json`으로 설정해야 합니다.

### 1.4 응답 형식

모든 응답은 표준 JSON 형식을 사용하며, 다음과 같은 일관된 구조를 가집니다:

```json
{
  "status": "success",
  "data": { ... }
}
```

오류 발생 시:

```json
{
  "status": "error",
  "error": {
    "code": "error_code",
    "message": "오류 설명",
    "details": { ... }
  }
}
```

### 1.5 HTTP 상태 코드

API는 다음과 같은 HTTP 상태 코드를 사용합니다:

| 상태 코드 | 설명                                        |
| --------- | ------------------------------------------- |
| 200       | 성공 (OK)                                   |
| 201       | 생성됨 (Created)                            |
| 400       | 잘못된 요청 (Bad Request)                   |
| 401       | 인증 실패 (Unauthorized)                    |
| 403       | 접근 권한 없음 (Forbidden)                  |
| 404       | 리소스 없음 (Not Found)                     |
| 422       | 처리 불가능한 엔티티 (Unprocessable Entity) |
| 429       | 요청 횟수 제한 초과 (Too Many Requests)     |
| 500       | 서버 오류 (Internal Server Error)           |

### 1.6 비율 제한

API는 다음과 같은 비율 제한이 적용됩니다:

| 계층              | 제한              | 헤더 정보             |
| ----------------- | ----------------- | --------------------- |
| 기본 계층         | 분당 300개 요청   | X-RateLimit-Limit     |
| 프리미엄 계층     | 분당 1,000개 요청 | X-RateLimit-Remaining |
| 엔터프라이즈 계층 | 분당 5,000개 요청 | X-RateLimit-Reset     |

비율 제한에 도달하면 429 상태 코드가 반환됩니다. 응답 헤더에는 다음 정보가 포함됩니다:

- `X-RateLimit-Limit`: 분당 최대 요청 수
- `X-RateLimit-Remaining`: 현재 기간 내 남은 요청 수
- `X-RateLimit-Reset`: 비율 제한 카운터가 재설정되는 시간(Unix 타임스탬프)

## 2. 구독 관리 API

구독은 특정 채널(푸시 알림, 이메일, SMS 등)을 통해 사용자에게 메시지를 전송하기 위한 등록 정보입니다.

### 2.1 구독 생성

**엔드포인트:** `POST /subscriptions`

새로운 구독을 생성합니다.

**요청 본문:**

```json
{
  "type": "iOSPush",
  "token": "device_push_token_here",
  "user_id": "optional_user_id_if_known",
  "device_info": {
    "device_model": "iPhone 13",
    "device_os": "iOS 15.4",
    "device_language": "ko",
    "app_version": "1.0.0",
    "sdk_version": "1.0.0",
    "country_code": "KR",
    "test_type": 0
  }
}
```

**필수 필드:**

- `type`: 구독 유형 (iOSPush, AndroidPush, Email, SMS, KakaoTalk, InAppMessage)
- `token`: 채널 토큰 (푸시 토큰, 이메일 주소, 전화번호 등)

**선택적 필드:**

- `user_id`: 사용자 ID (알려진 경우)
- `device_info`: 디바이스 관련 정보

**응답:**

```json
{
  "status": "success",
  "data": {
    "subscription_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "type": "iOSPush",
    "subscription_status": 1,
    "created_at": "2025-04-05T08:30:45Z"
  }
}
```

### 2.2 구독 조회

**엔드포인트:** `GET /subscriptions/:id`

특정 구독의 정보를 조회합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "type": "iOSPush",
    "user_id": "u1234567890",
    "subscription_status": 1,
    "device_info": {
      "device_model": "iPhone 13",
      "device_os": "iOS 15.4",
      "device_language": "ko",
      "app_version": "1.0.0",
      "sdk_version": "1.0.0",
      "country_code": "KR"
    },
    "tags": {
      "premium_user": "true",
      "user_level": "silver"
    },
    "subscribed_at": "2025-04-05T08:30:45Z",
    "last_active_at": "2025-04-05T10:15:22Z"
  }
}
```

### 2.3 구독 업데이트

**엔드포인트:** `PATCH /subscriptions/:id`

기존 구독 정보를 업데이트합니다.

**요청 본문:**

```json
{
  "token": "updated_token_value",
  "device_info": {
    "app_version": "1.0.1"
  }
}
```

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "type": "iOSPush",
    "subscription_status": 1,
    "updated_at": "2025-04-05T11:22:33Z"
  }
}
```

### 2.4 구독 비활성화

**엔드포인트:** `POST /subscriptions/:id/disable`

구독을 비활성화합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "subscription_status": -2,
    "unsubscribed_at": "2025-04-05T15:45:12Z"
  }
}
```

### 2.5 구독 활성화

**엔드포인트:** `POST /subscriptions/:id/enable`

비활성화된 구독을 다시 활성화합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "subscription_status": 1,
    "subscribed_at": "2025-04-05T16:10:30Z"
  }
}
```

### 2.6 토큰 업데이트

**엔드포인트:** `POST /subscriptions/:id/update-token`

구독 토큰을 업데이트합니다(예: 푸시 토큰 갱신).

**요청 본문:**

```json
{
  "token": "new_token_value"
}
```

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "token_updated_at": "2025-04-05T16:30:45Z"
  }
}
```

### 2.7 태그 관리

**엔드포인트:** `POST /subscriptions/:id/tags`

구독에 태그를 추가하거나 업데이트합니다.

**요청 본문:**

```json
{
  "tags": {
    "premium_user": "true",
    "user_level": "gold",
    "favorite_category": "electronics"
  }
}
```

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "tags": {
      "premium_user": "true",
      "user_level": "gold",
      "favorite_category": "electronics"
    }
  }
}
```

**엔드포인트:** `DELETE /subscriptions/:id/tags`

구독에서 태그를 제거합니다.

**요청 본문:**

```json
{
  "tag_keys": ["user_level", "favorite_category"]
}
```

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "tags": {
      "premium_user": "true"
    }
  }
}
```

### 2.8 구독 목록 조회

**엔드포인트:** `GET /subscriptions`

구독 목록을 조회합니다.

**쿼리 파라미터:**

- `user_id`: 특정 사용자의 구독만 조회
- `type`: 특정 유형의 구독만 조회
- `status`: 특정 상태의 구독만 조회
- `page`: 페이지 번호
- `per_page`: 페이지당 항목 수

**응답:**

```json
{
  "status": "success",
  "data": {
    "subscriptions": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "type": "iOSPush",
        "user_id": "u1234567890",
        "subscription_status": 1,
        "subscribed_at": "2025-04-05T08:30:45Z"
      },
      {
        "id": "b2c3d4e5-f678-9012-abcd-ef1234567890",
        "type": "Email",
        "user_id": "u1234567890",
        "subscription_status": 1,
        "subscribed_at": "2025-04-05T09:15:22Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 2,
      "total_pages": 1
    }
  }
}
```

## 3. 사용자 관리 API

사용자는 여러 구독 채널을 가질 수 있는 애플리케이션 사용자를 나타냅니다.

### 3.1 사용자 식별

**엔드포인트:** `POST /users/identify`

사용자를 식별하고 구독을 연결합니다.

**요청 본문:**

```json
{
  "external_id": "user_123",
  "subscriptions": ["a1b2c3d4-e5f6-7890-abcd-ef1234567890"]
}
```

**필수 필드:**

- `external_id`: 애플리케이션의 사용자 식별자

**선택적 필드:**

- `subscriptions`: 사용자와 연결할 구독 ID 목록

**응답:**

```json
{
  "status": "success",
  "data": {
    "user_id": "u1234567890",
    "external_id": "user_123",
    "created_at": "2025-04-05T12:34:56Z"
  }
}
```

### 3.2 사용자 로그아웃

**엔드포인트:** `POST /users/logout`

현재 구독과 사용자의 연결을 해제합니다.

**요청 본문:**

```json
{
  "subscriptions": ["a1b2c3d4-e5f6-7890-abcd-ef1234567890"]
}
```

**응답:**

```json
{
  "status": "success",
  "data": {
    "unlinked_subscriptions": ["a1b2c3d4-e5f6-7890-abcd-ef1234567890"]
  }
}
```

### 3.3 사용자 구독 조회

**엔드포인트:** `GET /users/:external_id/subscriptions`

사용자의 모든 구독을 조회합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "subscriptions": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "type": "iOSPush",
        "subscription_status": 1,
        "subscribed_at": "2025-04-05T08:30:45Z"
      },
      {
        "id": "b2c3d4e5-f678-9012-abcd-ef1234567890",
        "type": "Email",
        "subscription_status": 1,
        "subscribed_at": "2025-04-05T09:15:22Z"
      }
    ]
  }
}
```

### 3.4 사용자 삭제 요청

**엔드포인트:** `DELETE /users/:external_id`

사용자 정보와 관련 구독을 삭제합니다(GDPR 요청).

**응답:**

```json
{
  "status": "success",
  "data": {
    "message": "User deletion request has been processed",
    "request_id": "del-1234567890"
  }
}
```

## 4. 메시지 API

메시지 API를 사용하여 개별 메시지를 전송하고 상태를 추적할 수 있습니다.

### 4.1 메시지 전송

**엔드포인트:** `POST /messages`

개별 메시지를 전송합니다.

**요청 본문:**

```json
{
  "subscription_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "알림 제목",
  "body": "알림 내용 메시지",
  "data": {
    "action": "open_screen",
    "screen": "order_details",
    "order_id": "ORD-12345"
  }
}
```

**필수 필드:**

- `subscription_id`: 메시지를 전송할 구독 ID
- `title` 또는 `body`: 메시지 제목 또는 본문(둘 중 하나는 필수)

**선택적 필드:**

- `data`: 메시지와 함께 전달할 추가 데이터

**응답:**

```json
{
  "status": "success",
  "data": {
    "message_id": "m1234567890",
    "status": "pending",
    "created_at": "2025-04-05T13:45:30Z"
  }
}
```

### 4.2 템플릿 기반 메시지 전송

**엔드포인트:** `POST /messages/template`

템플릿을 사용하여 메시지를 전송합니다.

**요청 본문:**

```json
{
  "subscription_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "template_id": "t1234567890",
  "variables": {
    "user_name": "홍길동",
    "order_id": "ORD-12345",
    "order_amount": "35,000원",
    "estimated_delivery": "4월 10일"
  }
}
```

**필수 필드:**

- `subscription_id`: 메시지를 전송할 구독 ID
- `template_id`: 사용할 템플릿 ID

**선택적 필드:**

- `variables`: 템플릿에 적용할 변수 데이터

**응답:**

```json
{
  "status": "success",
  "data": {
    "message_id": "m2345678901",
    "status": "pending",
    "created_at": "2025-04-05T14:22:15Z"
  }
}
```

### 4.3 메시지 상태 조회

**엔드포인트:** `GET /messages/:id`

특정 메시지의 상태와 정보를 조회합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "m1234567890",
    "subscription_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "알림 제목",
    "body": "알림 내용 메시지",
    "data": {
      "action": "open_screen",
      "screen": "order_details",
      "order_id": "ORD-12345"
    },
    "status": "successful",
    "created_at": "2025-04-05T13:45:30Z",
    "sent_at": "2025-04-05T13:45:32Z",
    "events": [
      {
        "event_type": "sent",
        "occurred_at": "2025-04-05T13:45:32Z"
      }
    ]
  }
}
```

### 4.4 메시지 상태 업데이트

**엔드포인트:** `POST /messages/:id/status`

메시지 상태를 업데이트합니다(SDK에서 수신 확인 시).

**요청 본문:**

```json
{
  "status": "received"
}
```

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "m1234567890",
    "status": "received",
    "received_at": "2025-04-05T13:46:05Z"
  }
}
```

### 4.5 메시지 변환 추적

**엔드포인트:** `POST /messages/:id/convert`

메시지 상호작용(클릭, 열기 등)을 추적합니다.

**요청 본문:**

```json
{
  "action": "clicked_button",
  "data": {
    "button_id": "confirm",
    "screen": "order_details"
  }
}
```

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "m1234567890",
    "status": "converted",
    "converted_at": "2025-04-05T13:48:22Z"
  }
}
```

### 4.6 메시지 전송 취소

**엔드포인트:** `POST /messages/:id/cancel`

아직 처리되지 않은 메시지의 전송을 취소합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "m1234567890",
    "status": "cancelled",
    "cancelled_at": "2025-04-05T13:50:10Z"
  }
}
```

## 5. 템플릿 API

템플릿 API를 사용하여 재사용 가능한 메시지 템플릿을 관리할 수 있습니다.

### 5.1 템플릿 생성

**엔드포인트:** `POST /templates`

새로운 메시지 템플릿을 생성합니다.

**요청 본문:**

```json
{
  "name": "주문 확인 알림",
  "title_template": "{{user_name}}님의 주문이 확인되었습니다",
  "body_template": "주문번호 {{order_id}}가 확인되었습니다. 결제금액: {{order_amount}}, 예상 배송일: {{estimated_delivery}}",
  "data_template": {
    "action": "open_screen",
    "screen": "order_details",
    "order_id": "{{order_id}}"
  },
  "description": "주문 확인 시 전송되는 알림 템플릿"
}
```

**필수 필드:**

- `name`: 템플릿 이름
- `title_template` 또는 `body_template`: 제목 또는 본문 템플릿(둘 중 하나는 필수)

**선택적 필드:**

- `data_template`: 추가 데이터 템플릿
- `description`: 템플릿 설명

**응답:**

```json
{
  "status": "success",
  "data": {
    "template_id": "t1234567890",
    "name": "주문 확인 알림",
    "created_at": "2025-04-05T15:10:22Z",
    "version": 1
  }
}
```

### 5.2 템플릿 조회

**엔드포인트:** `GET /templates/:id`

특정 템플릿의 정보를 조회합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "t1234567890",
    "name": "주문 확인 알림",
    "title_template": "{{user_name}}님의 주문이 확인되었습니다",
    "body_template": "주문번호 {{order_id}}가 확인되었습니다. 결제금액: {{order_amount}}, 예상 배송일: {{estimated_delivery}}",
    "data_template": {
      "action": "open_screen",
      "screen": "order_details",
      "order_id": "{{order_id}}"
    },
    "description": "주문 확인 시 전송되는 알림 템플릿",
    "created_at": "2025-04-05T15:10:22Z",
    "updated_at": "2025-04-05T15:10:22Z",
    "version": 1,
    "is_active": true
  }
}
```

### 5.3 템플릿 업데이트

**엔드포인트:** `PUT /templates/:id`

기존 템플릿 정보를 업데이트합니다.

**요청 본문:**

```json
{
  "title_template": "{{user_name}}님, 주문이 확인되었습니다",
  "body_template": "주문번호: {{order_id}}\n결제금액: {{order_amount}}\n예상 배송일: {{estimated_delivery}}",
  "data_template": {
    "action": "open_screen",
    "screen": "order_details",
    "order_id": "{{order_id}}",
    "highlight": true
  }
}
```

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "t1234567890",
    "version": 2,
    "updated_at": "2025-04-05T16:30:45Z"
  }
}
```

### 5.4 템플릿 비활성화

**엔드포인트:** `POST /templates/:id/disable`

템플릿을 비활성화합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "t1234567890",
    "is_active": false,
    "updated_at": "2025-04-05T17:15:30Z"
  }
}
```

### 5.5 템플릿 활성화

**엔드포인트:** `POST /templates/:id/enable`

비활성화된 템플릿을 다시 활성화합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "t1234567890",
    "is_active": true,
    "updated_at": "2025-04-05T17:45:12Z"
  }
}
```

### 5.6 템플릿 목록 조회

**엔드포인트:** `GET /templates`

템플릿 목록을 조회합니다.

**쿼리 파라미터:**

- `is_active`: 활성 템플릿만 조회(true/false)
- `page`: 페이지 번호
- `per_page`: 페이지당 항목 수

**응답:**

```json
{
  "status": "success",
  "data": {
    "templates": [
      {
        "id": "t1234567890",
        "name": "주문 확인 알림",
        "version": 2,
        "is_active": true,
        "created_at": "2025-04-05T15:10:22Z",
        "updated_at": "2025-04-05T16:30:45Z"
      },
      {
        "id": "t2345678901",
        "name": "배송 시작 알림",
        "version": 1,
        "is_active": true,
        "created_at": "2025-04-05T15:30:12Z",
        "updated_at": "2025-04-05T15:30:12Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 2,
      "total_pages": 1
    }
  }
}
```

### 5.7 템플릿 렌더링 테스트

**엔드포인트:** `POST /templates/:id/render-test`

템플릿을 테스트 렌더링합니다.

**요청 본문:**

```json
{
  "variables": {
    "user_name": "홍길동",
    "order_id": "ORD-12345",
    "order_amount": "35,000원",
    "estimated_delivery": "4월 10일"
  }
}
```

**응답:**

```json
{
  "status": "success",
  "data": {
    "title": "홍길동님, 주문이 확인되었습니다",
    "body": "주문번호: ORD-12345\n결제금액: 35,000원\n예상 배송일: 4월 10일",
    "data": {
      "action": "open_screen",
      "screen": "order_details",
      "order_id": "ORD-12345",
      "highlight": true
    }
  }
}
```

## 6. 캠페인 API

캠페인 API를 사용하여 대규모 메시지 캠페인을 관리할 수 있습니다.

### 6.1 캠페인 생성

**엔드포인트:** `POST /campaigns`

새로운 메시지 캠페인을 생성합니다.

**요청 본문:**

```json
{
  "name": "4월 프로모션 캠페인",
  "template_id": "t1234567890",
  "targeting_criteria": {
    "tags": {
      "premium_user": "true",
      "user_level": ["silver", "gold", "platinum"]
    },
    "last_active_after": "2025-03-01T00:00:00Z",
    "countries": ["KR"]
  },
  "variables": {
    "promotion_name": "봄맞이 할인 행사",
    "discount_percent": "20%",
    "promotion_end_date": "4월 15일"
  },
  "scheduled_at": "2025-04-10T09:00:00Z"
}
```

**필수 필드:**

- `name`: 캠페인 이름
- `template_id` 또는 직접 메시지 내용(`title`, `body`, `data`)

**선택적 필드:**

- `targeting_criteria`: 대상 사용자 필터링 조건
- `variables`: 템플릿 변수 데이터
- `scheduled_at`: 예약 전송 시간(미설정 시 즉시 전송)

**응답:**

```json
{
  "status": "success",
  "data": {
    "campaign_id": "c1234567890",
    "name": "4월 프로모션 캠페인",
    "status": "scheduled",
    "scheduled_at": "2025-04-10T09:00:00Z",
    "created_at": "2025-04-05T18:30:45Z"
  }
}
```

### 6.2 캠페인 조회

**엔드포인트:** `GET /campaigns/:id`

특정 캠페인의 정보를 조회합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "c1234567890",
    "name": "4월 프로모션 캠페인",
    "template_id": "t1234567890",
    "targeting_criteria": {
      "tags": {
        "premium_user": "true",
        "user_level": ["silver", "gold", "platinum"]
      },
      "last_active_after": "2025-03-01T00:00:00Z",
      "countries": ["KR"]
    },
    "variables": {
      "promotion_name": "봄맞이 할인 행사",
      "discount_percent": "20%",
      "promotion_end_date": "4월 15일"
    },
    "status": "scheduled",
    "scheduled_at": "2025-04-10T09:00:00Z",
    "created_at": "2025-04-05T18:30:45Z",
    "created_by": "api_user",
    "total_recipients": 0,
    "successful_count": 0,
    "failed_count": 0
  }
}
```

### 6.3 캠페인 실행

**엔드포인트:** `POST /campaigns/:id/execute`

예약된 캠페인을 즉시 실행합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "c1234567890",
    "status": "in_progress",
    "started_at": "2025-04-05T19:15:30Z"
  }
}
```

### 6.4 캠페인 취소

**엔드포인트:** `POST /campaigns/:id/cancel`

예약되거나 진행 중인 캠페인을 취소합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "c1234567890",
    "status": "cancelled",
    "cancelled_at": "2025-04-05T19:45:12Z"
  }
}
```

### 6.5 캠페인 통계 조회

**엔드포인트:** `GET /campaigns/:id/stats`

캠페인의 전송 및 참여 통계를 조회합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "id": "c1234567890",
    "name": "4월 프로모션 캠페인",
    "status": "completed",
    "total_recipients": 5420,
    "successful_count": 5380,
    "failed_count": 40,
    "received_count": 4930,
    "converted_count": 1245,
    "channel_stats": {
      "push": {
        "total": 3200,
        "successful": 3180,
        "failed": 20,
        "received": 2950,
        "converted": 720
      },
      "email": {
        "total": 2220,
        "successful": 2200,
        "failed": 20,
        "received": 1980,
        "converted": 525
      }
    },
    "delivery_rate": 99.26,
    "receive_rate": 91.63,
    "conversion_rate": 25.25,
    "started_at": "2025-04-10T09:00:03Z",
    "completed_at": "2025-04-10T09:15:45Z"
  }
}
```

### 6.6 캠페인 목록 조회

**엔드포인트:** `GET /campaigns`

캠페인 목록을 조회합니다.

**쿼리 파라미터:**

- `status`: 특정 상태의 캠페인만 조회
- `from`: 시작 날짜/시간 필터(ISO 8601 형식)
- `to`: 종료 날짜/시간 필터(ISO 8601 형식)
- `page`: 페이지 번호
- `per_page`: 페이지당 항목 수

**응답:**

```json
{
  "status": "success",
  "data": {
    "campaigns": [
      {
        "id": "c1234567890",
        "name": "4월 프로모션 캠페인",
        "status": "scheduled",
        "scheduled_at": "2025-04-10T09:00:00Z",
        "created_at": "2025-04-05T18:30:45Z",
        "total_recipients": 0
      },
      {
        "id": "c2345678901",
        "name": "3월 이벤트 알림",
        "status": "completed",
        "started_at": "2025-03-15T10:00:00Z",
        "completed_at": "2025-03-15T10:12:34Z",
        "total_recipients": 4850,
        "successful_count": 4820,
        "failed_count": 30
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 2,
      "total_pages": 1
    }
  }
}
```

## 7. 분석 API

분석 API를 사용하여 메시지 성과 및 사용자 참여 데이터를 조회할 수 있습니다.

### 7.1 메시지 통계 조회

**엔드포인트:** `GET /analytics/messages`

전체 메시지 전송 및 참여 통계를 조회합니다.

**쿼리 파라미터:**

- `from`: 시작 날짜/시간 필터(ISO 8601 형식)
- `to`: 종료 날짜/시간 필터(ISO 8601 형식)
- `channel_type`: 채널 유형 필터
- `group_by`: 통계 그룹화 방식 (day, week, month, channel)

**응답:**

```json
{
  "status": "success",
  "data": {
    "period": {
      "from": "2025-04-01T00:00:00Z",
      "to": "2025-04-05T23:59:59Z"
    },
    "summary": {
      "total_sent": 125430,
      "successful": 124980,
      "failed": 450,
      "received": 115420,
      "converted": 28560,
      "delivery_rate": 99.64,
      "receive_rate": 92.35,
      "conversion_rate": 24.74
    },
    "by_channel": {
      "push": {
        "total_sent": 85230,
        "successful": 84950,
        "failed": 280,
        "received": 79820,
        "converted": 19450,
        "delivery_rate": 99.67,
        "receive_rate": 93.96,
        "conversion_rate": 24.37
      },
      "email": {
        "total_sent": 40200,
        "successful": 40030,
        "failed": 170,
        "received": 35600,
        "converted": 9110,
        "delivery_rate": 99.58,
        "receive_rate": 88.93,
        "conversion_rate": 25.59
      }
    },
    "by_day": [
      {
        "date": "2025-04-01",
        "total_sent": 25120,
        "successful": 25020,
        "failed": 100,
        "received": 23150,
        "converted": 5720
      },
      {
        "date": "2025-04-02",
        "total_sent": 24580,
        "successful": 24500,
        "failed": 80,
        "received": 22670,
        "converted": 5530
      }
      // ... 다른 날짜 데이터
    ]
  }
}
```

### 7.2 구독 통계 조회

**엔드포인트:** `GET /analytics/subscriptions`

구독 현황 통계를 조회합니다.

**쿼리 파라미터:**

- `from`: 시작 날짜/시간 필터(ISO 8601 형식)
- `to`: 종료 날짜/시간 필터(ISO 8601 형식)
- `group_by`: 통계 그룹화 방식 (day, week, month, channel)

**응답:**

```json
{
  "status": "success",
  "data": {
    "period": {
      "from": "2025-04-01T00:00:00Z",
      "to": "2025-04-05T23:59:59Z"
    },
    "summary": {
      "total_active": 250430,
      "new_subscriptions": 5280,
      "unsubscribed": 1240,
      "net_change": 4040
    },
    "by_channel": {
      "push": {
        "total_active": 180250,
        "new_subscriptions": 3750,
        "unsubscribed": 820,
        "net_change": 2930
      },
      "email": {
        "total_active": 70180,
        "new_subscriptions": 1530,
        "unsubscribed": 420,
        "net_change": 1110
      }
    },
    "by_day": [
      {
        "date": "2025-04-01",
        "new_subscriptions": 1050,
        "unsubscribed": 240,
        "net_change": 810
      },
      {
        "date": "2025-04-02",
        "new_subscriptions": 980,
        "unsubscribed": 210,
        "net_change": 770
      }
      // ... 다른 날짜 데이터
    ]
  }
}
```

### 7.3 사용자 참여 분석

**엔드포인트:** `GET /analytics/engagement`

사용자 참여 데이터를 조회합니다.

**쿼리 파라미터:**

- `from`: 시작 날짜/시간 필터(ISO 8601 형식)
- `to`: 종료 날짜/시간 필터(ISO 8601 형식)
- `segment`: 사용자 세그먼트 필터(태그 기반)

**응답:**

```json
{
  "status": "success",
  "data": {
    "period": {
      "from": "2025-04-01T00:00:00Z",
      "to": "2025-04-05T23:59:59Z"
    },
    "overall_engagement": {
      "total_users": 125000,
      "active_users": 85600,
      "engagement_rate": 68.48,
      "average_response_time": 125.4
    },
    "by_segment": {
      "premium_users": {
        "total_users": 32500,
        "active_users": 24800,
        "engagement_rate": 76.31,
        "average_response_time": 98.2
      },
      "regular_users": {
        "total_users": 92500,
        "active_users": 60800,
        "engagement_rate": 65.73,
        "average_response_time": 135.7
      }
    },
    "top_converting_messages": [
      {
        "template_id": "t1234567890",
        "template_name": "특별 할인 알림",
        "conversion_rate": 38.5,
        "total_sent": 12500
      },
      {
        "template_id": "t2345678901",
        "template_name": "재입고 알림",
        "conversion_rate": 36.2,
        "total_sent": 8750
      }
      // ... 다른 메시지 데이터
    ]
  }
}
```

### 7.4 사용량 및 할당량 조회

**엔드포인트:** `GET /analytics/usage`

앱의 메시지 사용량 및 할당량 정보를 조회합니다.

**응답:**

```json
{
  "status": "success",
  "data": {
    "current_period": {
      "start_date": "2025-04-01T00:00:00Z",
      "end_date": "2025-04-30T23:59:59Z"
    },
    "quotas": {
      "daily": {
        "limit": 100000,
        "used": 25430,
        "remaining": 74570,
        "reset_at": "2025-04-06T00:00:00Z"
      },
      "monthly": {
        "limit": 2000000,
        "used": 125430,
        "remaining": 1874570,
        "reset_at": "2025-05-01T00:00:00Z"
      }
    },
    "usage_by_channel": {
      "push": 85230,
      "email": 40200
    },
    "usage_trend": [
      {
        "date": "2025-04-01",
        "total": 25120,
        "push": 18250,
        "email": 6870
      },
      {
        "date": "2025-04-02",
        "total": 24580,
        "push": 17420,
        "email": 7160
      }
      // ... 다른 날짜 데이터
    ]
  }
}
```

## 8. 오류 처리

### 8.1 오류 응답 형식

모든 오류 응답은 다음 형식을 따릅니다:

```json
{
  "status": "error",
  "error": {
    "code": "error_code",
    "message": "오류에 대한 설명",
    "details": {
      // 추가 오류 세부 정보
    }
  }
}
```

### 8.2 일반 오류 코드

| 오류 코드             | 설명                                       | HTTP 상태 코드 |
| --------------------- | ------------------------------------------ | -------------- |
| invalid_request       | 잘못된 요청 형식 또는 필수 필드 누락       | 400            |
| authentication_failed | 인증 실패 (API 키 누락 또는 유효하지 않음) | 401            |
| permission_denied     | 권한 없음                                  | 403            |
| resource_not_found    | 요청한 리소스를 찾을 수 없음               | 404            |
| validation_error      | 데이터 유효성 검증 실패                    | 422            |
| rate_limit_exceeded   | 요청 비율 제한 초과                        | 429            |
| internal_server_error | 서버 내부 오류                             | 500            |

### 8.3 리소스별 오류 코드

#### 구독 관련 오류

| 오류 코드                 | 설명                    | HTTP 상태 코드 |
| ------------------------- | ----------------------- | -------------- |
| invalid_token             | 유효하지 않은 구독 토큰 | 400            |
| invalid_subscription_type | 지원되지 않는 구독 유형 | 400            |
| duplicate_subscription    | 중복된 구독 토큰        | 400            |
| subscription_disabled     | 비활성화된 구독         | 400            |

#### 메시지 관련 오류

| 오류 코드                 | 설명                         | HTTP 상태 코드 |
| ------------------------- | ---------------------------- | -------------- |
| message_too_large         | 메시지 크기 초과             | 400            |
| invalid_message_content   | 유효하지 않은 메시지 내용    | 400            |
| quota_exceeded            | 메시지 할당량 초과           | 403            |
| message_already_processed | 이미 처리된 메시지 수정 시도 | 400            |

#### 템플릿 관련 오류

| 오류 코드                  | 설명                        | HTTP 상태 코드 |
| -------------------------- | --------------------------- | -------------- |
| template_not_found         | 템플릿을 찾을 수 없음       | 404            |
| invalid_template_variables | 유효하지 않은 템플릿 변수   | 400            |
| missing_required_variable  | 필수 템플릿 변수 누락       | 400            |
| template_inactive          | 비활성화된 템플릿 사용 시도 | 400            |

#### 캠페인 관련 오류

| 오류 코드                  | 설명                         | HTTP 상태 코드 |
| -------------------------- | ---------------------------- | -------------- |
| campaign_not_found         | 캠페인을 찾을 수 없음        | 404            |
| invalid_targeting_criteria | 유효하지 않은 타겟팅 조건    | 400            |
| campaign_already_started   | 이미 시작된 캠페인 수정 시도 | 400            |
| campaign_already_completed | 이미 완료된 캠페인 취소 시도 | 400            |

### 8.4 오류 응답 예시

**인증 실패:**

```json
{
  "status": "error",
  "error": {
    "code": "authentication_failed",
    "message": "API 키가 유효하지 않습니다",
    "details": {
      "header": "X-API-Key"
    }
  }
}
```

**유효성 검증 실패:**

```json
{
  "status": "error",
  "error": {
    "code": "validation_error",
    "message": "요청 데이터의 유효성 검증에 실패했습니다",
    "details": {
      "fields": {
        "title": "제목은 필수 입력 항목입니다",
        "subscription_id": "유효한 UUID 형식이어야 합니다"
      }
    }
  }
}
```

**리소스 없음:**

```json
{
  "status": "error",
  "error": {
    "code": "resource_not_found",
    "message": "요청한 메시지를 찾을 수 없습니다",
    "details": {
      "id": "m9876543210"
    }
  }
}
```

**할당량 초과:**

```json
{
  "status": "error",
  "error": {
    "code": "quota_exceeded",
    "message": "일일 메시지 할당량을 초과했습니다",
    "details": {
      "limit": 100000,
      "used": 100000,
      "reset_at": "2025-04-06T00:00:00Z"
    }
  }
}
```

## 9. API 모범 사례

### 9.1 요청 최적화

- **배치 처리**: 가능한 한 배치 API를 사용하여 요청 수를 최소화하세요.
- **필요한 필드 지정**: 필요한 필드만 요청하여 응답 크기를 최적화하세요.
- **적절한 페이지 크기**: 목록 API에서 합리적인 페이지 크기(20-100개)를 사용하세요.
- **조건부 요청**: `If-Modified-Since` 헤더를 사용하여 변경된 데이터만 조회하세요.

### 9.2 오류 처리

- **모든 오류 처리**: 발생 가능한 모든 HTTP 상태 코드에 대해 처리 로직을 구현하세요.
- **재시도 전략**: 일시적인 오류(429, 500-504)에 대한 적절한 재시도 전략을 구현하세요.
- **백오프 알고리즘**: 재시도 시 지수 백오프 알고리즘을 사용하세요.
- **오류 로깅**: 오류 응답을 로깅하여 디버깅 및 문제 해결에 활용하세요.

### 9.3 보안 모범 사례

- **API 키 보호**: API 키를 소스 코드에 하드코딩하지 마세요.
- **HTTPS 사용**: 항상 HTTPS를 통해 API를 호출하세요.
- **최소 권한 원칙**: 필요한 최소한의 권한만 가진 API 키를 사용하세요.
- **키 순환**: 정기적으로 API 키를 갱신하세요.

### 9.4 성능 최적화

- **연결 풀링**: HTTP 클라이언트에서 연결 풀링을 활성화하세요.
- **요청 압축**: 대용량 요청에 대해 Gzip 압축을 활성화하세요.
- **비동기 처리**: 응답을 기다릴 필요가 없는 경우 비동기 호출을 사용하세요.
- **캐싱**: 자주 액세스하는 데이터를 적절히 캐싱하세요.

## 10. API 클라이언트 예제

### 10.1 cURL 예제

**메시지 전송:**

```bash
curl -X POST \
  https://api.automata-signal.com/api/v1/messages \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: your_api_key_here' \
  -d '{
    "subscription_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "알림 제목",
    "body": "알림 내용 메시지",
    "data": {
      "action": "open_screen",
      "screen": "order_details",
      "order_id": "ORD-12345"
    }
  }'
```

**구독 목록 조회:**

```bash
curl -X GET \
  'https://api.automata-signal.com/api/v1/subscriptions?user_id=u1234567890&type=iOSPush' \
  -H 'X-API-Key: your_api_key_here'
```

### 10.2 Node.js 예제

```javascript
const axios = require('axios');

const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://api.automata-signal.com/api/v1';

// 메시지 전송 함수
async function sendMessage(subscriptionId, title, body, data) {
  try {
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/messages`,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      data: {
        subscription_id: subscriptionId,
        title,
        body,
        data,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      // API 오류 응답
      console.error('API Error:', error.response.data);
    } else {
      // 네트워크 오류
      console.error('Network Error:', error.message);
    }
    throw error;
  }
}

// 사용 예시
sendMessage('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '알림 제목', '알림 내용 메시지', {
  action: 'open_screen',
  screen: 'order_details',
  order_id: 'ORD-12345',
})
  .then((result) => console.log('Message sent:', result))
  .catch((err) => console.error('Failed to send message:', err));
```

### 10.3 Python 예제

```python
import requests
import json

API_KEY = 'your_api_key_here'
BASE_URL = 'https://api.automata-signal.com/api/v1'

def send_message(subscription_id, title, body, data=None):
    """
    메시지를 전송합니다.

    Args:
        subscription_id (str): 구독 ID
        title (str): 메시지 제목
        body (str): 메시지 본문
        data (dict, optional): 추가 데이터

    Returns:
        dict: API 응답 데이터
    """
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
    }

    payload = {
        'subscription_id': subscription_id,
        'title': title,
        'body': body
    }

    if data:
        payload['data'] = data

    try:
        response = requests.post(
            f'{BASE_URL}/messages',
            headers=headers,
            data=json.dumps(payload)
        )

        response.raise_for_status()  # 4xx, 5xx 오류 발생 시 예외 발생
        return response.json()

    except requests.exceptions.HTTPError as err:
        print(f'HTTP Error: {err}')
        print(f'Response: {response.text}')
        raise
    except requests.exceptions.RequestException as err:
        print(f'Request Error: {err}')
        raise

# 사용 예시
if __name__ == '__main__':
    try:
        result = send_message(
            'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            '알림 제목',
            '알림 내용 메시지',
            {
                'action': 'open_screen',
                'screen': 'order_details',
                'order_id': 'ORD-12345'
            }
        )
        print('Message sent:', result)
    except Exception as e:
        print('Failed to send message:', e)
```

## 11. 결론

Automata-Signal API는 멀티채널 메시징 플랫폼을 위한 포괄적인 인터페이스를 제공합니다. 이 API를 통해 다양한 채널(푸시 알림, 이메일, SMS 등)을 통해 사용자에게 메시지를 전송하고, 대규모 캠페인을 관리하며, 메시지 성과를 추적할 수 있습니다.

API 사용 중 문제가 발생하거나 추가 도움이 필요한 경우 support@automata-signal.com으로 문의하거나 개발자 포럼을 이용해 주시기 바랍니다.
