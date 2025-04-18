# [GUIDE-004] 코딩 표준

| 버전 | 날짜       | 변경 내용      |
| ---- | ---------- | -------------- |
| 1.0  | 2025-04-02 | 최초 문서 작성 |

## 요약

본 문서는 Automata-Signal 프로젝트의 코딩 표준과 가이드라인을 정의합니다. 코드의 일관성, 가독성, 유지보수성을 높이기 위한 규칙과 권장사항을 제공합니다.

## 대상 독자

- 신규 개발자
- 개발팀

## 1. 일반 원칙

### 1.1 SOLID 원칙 준수

Automata-Signal은 다음 SOLID 원칙을 따릅니다:

- **S (Single Responsibility)**: 각 모듈은 하나의 책임만 가져야 합니다.
- **O (Open-Closed)**: 코드는 확장에는 열려있고 수정에는 닫혀있어야 합니다.
- **L (Liskov Substitution)**: 하위 타입은 상위 타입을 대체할 수 있어야 합니다.
- **I (Interface Segregation)**: 클라이언트는 사용하지 않는 인터페이스에 의존하지 않아야 합니다.
- **D (Dependency Inversion)**: 고수준 모듈은 저수준 모듈에 의존하지 않아야 합니다.

### 1.2 코드 품질 원칙

- **단순성**: 항상 복잡한 솔루션보다 단순한 솔루션을 우선시합니다.
- **DRY (Don't Repeat Yourself)**: 코드 중복을 피하고 기존 기능을 재사용합니다.
- **명확성**: 성능 최적화보다 코드 명확성을 우선시합니다.
- **일관성**: 전체 코드베이스에서 일관된 패턴과 관행을 유지합니다.

### 1.3 문서화 원칙

- 모든 모듈, 함수, 프로토콜에는 문서 주석을 작성해야 합니다.
- 복잡한 로직이나 비즈니스 규칙은 주석으로 설명해야 합니다.
- 문서화는 코드와 함께 업데이트되어야 합니다.

## 2. Elixir 코딩 표준

### 2.1 파일 구조

- 파일당 200-300줄을 초과하지 않도록 합니다.
- 파일명은 스네이크 케이스(snake_case)로 작성합니다.
- 모듈 구조는 논리적 계층에 따라 구성합니다.

```elixir
# 권장 디렉토리 구조
lib/
  automata_signal/
    resources/       # Ash 리소스 정의
    services/        # 비즈니스 로직
    workers/         # 비동기 작업자
    adapters/        # 채널 어댑터
    templates/       # 템플릿 엔진
    campaigns/       # 캠페인 관리
  automata_signal_web/
    controllers/     # API 컨트롤러
    views/           # 응답 포맷팅
```

### 2.2 명명 규칙

- **모듈명**: 파스칼 케이스(PascalCase)를 사용합니다.

  ```elixir
  defmodule AutomataSignal.Adapters.PushAdapter do
  ```

- **함수명**: 스네이크 케이스(snake_case)를 사용합니다.

  ```elixir
  def send_message(message) do
  ```

- **변수명**: 스네이크 케이스(snake_case)를 사용합니다.

  ```elixir
  user_subscription = get_subscription(user_id)
  ```

- **상수**: 대문자 스네이크 케이스(UPPER_SNAKE_CASE)를 사용합니다.

  ```elixir
  @MAX_RETRY_COUNT 5
  ```

- **타입 지정자**: 타입 지정자는 스네이크 케이스(snake_case)를 사용합니다.
  ```elixir
  @type subscription_status :: integer()
  ```

### 2.3 모듈 구조

모듈은 다음 순서로 구성합니다:

1. 모듈 문서화 (필수)
2. `@moduledoc`
3. `use`, `import`, `alias`, `require` 문
4. 모듈 속성 (`@attribute`)
5. 타입 정의 (`@type`, `@typep`)
6. 콜백 정의 (`@callback`)
7. 함수 매크로 (`defmacro`)
8. 공개 함수 (`def`)
9. 비공개 함수 (`defp`)

```elixir
defmodule AutomataSignal.Adapters.PushAdapter do
  @moduledoc """
  푸시 알림 채널 어댑터 모듈.
  iOS(APNS)와 Android(FCM) 플랫폼에 푸시 알림을 전송합니다.
  """

  alias AutomataSignal.Resources.Message
  alias AutomataSignal.Resources.Subscription

  @apns_config %{
    cert: {:file, "path/to/cert.pem"},
    key: {:file, "path/to/key.pem"},
    mode: :prod
  }

  @type push_result :: {:ok, map()} | {:error, map()}

  @callback send_message(message :: Message.t()) :: push_result()

  @impl true
  def send_message(%Message{subscription: subscription} = message) do
    # 구현 내용
  end

  defp format_payload(message) do
    # 내부 구현
  end
end
```

### 2.4 함수 작성 가이드라인

- 함수는 가능한 짧게 유지하고, 하나의 책임만 가져야 합니다.
- 함수 본문은 가급적 8-10줄을 넘지 않도록 합니다.
- 다형성을 활용하여 조건문 대신 함수 패턴 매칭을 사용합니다.
- 파이프 연산자(`|>`)를 사용하여 데이터 변환 과정을 명확히 표현합니다.

```elixir
# 나쁜 예
def process_message(message) do
  msg = validate_message(message)
  if msg != nil do
    msg = transform_message(msg)
    if msg != nil do
      send_message(msg)
    else
      {:error, :transform_failed}
    end
  else
    {:error, :validation_failed}
  end
end

# 좋은 예
def process_message(message) do
  message
  |> validate_message()
  |> transform_message()
  |> send_message()
end

defp validate_message(nil), do: {:error, :validation_failed}
defp validate_message(message), do: {:ok, message}

defp transform_message({:error, reason}), do: {:error, reason}
defp transform_message({:ok, message}), do: {:ok, transform(message)}

defp send_message({:error, reason}), do: {:error, reason}
defp send_message({:ok, message}), do: do_send(message)
```

### 2.5 문서화 표준

- 모든 공개 함수는 `@doc` 문서화를 가져야 합니다.
- 복잡한 비공개 함수도 문서화하는 것이 좋습니다.
- 문서화는 함수의 목적, 매개변수, 반환값, 발생 가능한 오류를 설명해야 합니다.
- 예제 코드를 제공하면 더 좋습니다.

````elixir
@doc """
메시지를 적절한 푸시 서비스(APNS 또는 FCM)로 전송합니다.

## 매개변수
  - message: 전송할 메시지 (Message 구조체)

## 반환값
  - {:ok, %{provider_message_id: String.t()}} - 성공적으로 전송된 경우
  - {:error, %{reason: atom(), details: map()}} - 전송 실패 시

## 예제
    ```
    message = %Message{title: "알림 제목", body: "내용", subscription: subscription}
    {:ok, response} = PushAdapter.send_message(message)
    ```
"""
def send_message(%Message{} = message) do
  # 구현 내용
end
````

### 2.6 오류 처리 가이드라인

- 오류는 명시적으로 처리하고, 가능한 한 빨리 실패합니다.
- 예외 대신 결과 튜플(`{:ok, result}` 또는 `{:error, reason}`)을 사용합니다.
- 실패 이유를 명확하게 표현합니다.
- 오류 정보는 가능한 한 구체적이어야 합니다.

```elixir
# 나쁜 예
def divide(a, b) do
  a / b
rescue
  _ -> nil
end

# 좋은 예
def divide(_, 0), do: {:error, :division_by_zero}
def divide(a, b), do: {:ok, a / b}
```

## 3. Ash Framework 활용 가이드라인

### 3.1 리소스 정의

- 리소스 속성은 논리적 그룹으로 구성합니다.
- 관계는 명확히 정의하고 적절한 참조 무결성 제약조건을 설정합니다.
- 계산된 속성은 `calculations` 블록에 정의합니다.
- 모든 리소스는 자체 파일에 정의합니다.

```elixir
defmodule AutomataSignal.Resources.Message do
  use Ash.Resource,
    data_layer: Ash.DataLayer.Postgres,
    extensions: [AshStateMachine.Resource]

  attributes do
    uuid_primary_key :id

    # 메시지 내용 관련 속성
    attribute :title, :string
    attribute :body, :string
    attribute :data, :map, default: %{}

    # 관계 식별자
    attribute :user_id, :uuid
    attribute :subscription_id, :uuid
    attribute :application_id, :uuid
    attribute :campaign_id, :uuid, allow_nil?: true

    # 상태 관련 속성
    attribute :status, :atom do
      constraints [one_of: [:pending, :successful, :failed, :errored, :received, :converted]]
      default :pending
    end

    attribute :channel_type, :atom do
      constraints [one_of: [:push, :email, :sms, :kakao_talk, :in_app]]
    end

    # 타임스탬프
    timestamps()
    attribute :sent_at, :utc_datetime
    attribute :received_at, :utc_datetime
    attribute :converted_at, :utc_datetime
    attribute :failed_at, :utc_datetime

    # 오류 관련 속성
    attribute :error_reason, :string
    attribute :error_details, :map, default: %{}
    attribute :version_history, :map, default: %{}
  end

  # ... 상태 머신, 관계, 액션 등 ...
end
```

### 3.2 확장 모듈 활용

각 Ash 확장 모듈을 적절히 활용합니다:

- **ash_state_machine**: 메시지 상태 전이 모델링

  ```elixir
  state_machine do
    field :status
    initial_states [:pending]
    transitions do
      transition :send, from: [:pending], to: :successful
      transition :fail, from: [:pending, :successful], to: :failed
      # ...
    end
  end
  ```

- **ash_oban**: 비동기 작업 처리

  ```elixir
  oban_job do
    queue :messages
    priority 3
    max_attempts 5
    unique [:message_id]
  end
  ```

- **ash_paper_trail**: 변경 이력 추적

  ```elixir
  paper_trail do
    track_attribute :status
    track_attribute :error_details
  end
  ```

- **ash_archival**: 소프트 삭제 처리

  ```elixir
  archival do
    archive_attribute :is_archived
    archive_timestamp_attribute :archived_at
  end
  ```

- **ash_cloak**: 민감 데이터 암호화
  ```elixir
  encrypted_attributes do
    attribute :token
  end
  ```

### 3.3 액션 및 쿼리 정의

- 읽기 전용 쿼리는 `queries` 블록에 정의합니다.
- 복잡한 업데이트 로직은 `changes` 함수를 사용합니다.
- 액션에는 적절한 인증 및 권한 설정을 포함합니다.

```elixir
actions do
  defaults [:create, :read, :update, :destroy]

  create :send do
    accept [:title, :body, :data, :subscription_id]
    change set_attribute(:status, :pending)
    change relate_actor(:application)
  end

  update :mark_as_sent do
    accept []
    change transition_state(:send)
    change set_attribute(:sent_at, &DateTime.utc_now/0)
  end
end

queries do
  query :by_user, :all do
    filter expr(user_id == ^arg(:user_id))
  end

  query :pending_messages, :all do
    filter expr(status == :pending)
  end
end
```

## 4. Flutter SDK 코딩 표준

### 4.1 파일 구조

- 파일은 논리적 계층에 따라 구성합니다.
- 파일 이름은 스네이크 케이스(snake_case)를 사용합니다.
- 각 클래스는 자체 파일에 정의합니다.

```
lib/
  src/
    core/           # 핵심 기능 및 유틸리티
    managers/       # 기능별 관리자 클래스
    models/         # 데이터 모델
    network/        # API 통신 관련
    utils/          # 유틸리티 함수
  automata_signal.dart  # 메인 SDK 진입점
```

### 4.2 명명 규칙

- **클래스명**: 파스칼 케이스(PascalCase)를 사용합니다.

  ```dart
  class SubscriptionManager { ... }
  ```

- **변수/메소드명**: 카멜 케이스(camelCase)를 사용합니다.

  ```dart
  String deviceToken;
  Future<void> registerPushSubscription() { ... }
  ```

- **상수**: 대문자 스네이크 케이스(UPPER_SNAKE_CASE)를 사용합니다.

  ```dart
  const int MAX_RETRY_COUNT = 5;
  ```

- **프라이빗 멤버**: 언더스코어(\_)로 시작합니다.
  ```dart
  String _apiKey;
  void _initialize() { ... }
  ```

### 4.3 클래스 구조

클래스는 다음 순서로 구성합니다:

1. 상수 및 정적 변수
2. 인스턴스 변수
3. 생성자
4. 팩토리 생성자
5. 게터/세터
6. 공개 메소드
7. 비공개 메소드

```dart
class SubscriptionManager {
  // 상수 및 정적 변수
  static const int MAX_RETRIES = 3;

  // 인스턴스 변수
  final String _appId;
  Map<String, String> _subscriptionIds = {};

  // 생성자
  SubscriptionManager(this._appId);

  // 팩토리 생성자
  factory SubscriptionManager.fromConfig(AutomataSignalConfig config) {
    return SubscriptionManager(config.appId);
  }

  // 게터/세터
  Map<String, String> get subscriptionIds => _subscriptionIds;

  // 공개 메소드
  Future<String?> registerPushSubscription() async {
    // 구현
  }

  // 비공개 메소드
  Future<Map<String, dynamic>> _collectDeviceInfo() async {
    // 구현
  }
}
```

### 4.4 비동기 코드 가이드라인

- `async`/`await`를 사용하여 비동기 코드를 작성합니다.
- 모든 예외는 적절히 처리합니다.
- 오류 전파가 필요한 경우 명시적으로 예외를 다시 던집니다.

```dart
// 좋은 예
Future<void> initialize() async {
  try {
    await _loadPreferences();
    await _registerDeviceToken();
    await _restoreUser();
  } catch (e) {
    _logger.error('Initialization failed: $e');
    rethrow; // 상위 레벨에서 처리하도록 다시 던짐
  }
}
```

### 4.5 문서화 표준

- 모든 공개 클래스 및 메소드는 문서 주석을 가져야 합니다.
- 문서 주석은 메소드의 목적, 매개변수, 반환값, 발생 가능한 예외를 설명해야 합니다.

```dart
/// 푸시 알림 구독을 등록합니다.
///
/// 기기의 푸시 토큰을 서버에 등록하고 구독 ID를 반환합니다.
/// 이미 등록된 경우 기존 구독 ID를 반환합니다.
///
/// 반환값: 등록된 구독 ID 또는 오류 발생 시 null
///
/// 예외:
/// - [NetworkException]: 서버 연결 실패 시
/// - [InvalidTokenException]: 유효하지 않은 토큰일 경우
Future<String?> registerPushSubscription() async {
  // 구현
}
```

## 5. API 설계 가이드라인

### 5.1 RESTful API 디자인

- 리소스 중심으로 API를 설계합니다.
- HTTP 메소드를 적절히 활용합니다 (GET, POST, PUT, DELETE).
- URL은 명사를 사용하고, 동사는 피합니다.
- 복수형 명사를 사용합니다 (/messages, /subscriptions).

### 5.2 API 경로 규칙

```
# 기본 경로
/api/v1/applications
/api/v1/users
/api/v1/subscriptions
/api/v1/messages
/api/v1/templates
/api/v1/campaigns

# 중첩 리소스
/api/v1/applications/:id/subscriptions
/api/v1/users/:id/subscriptions
/api/v1/campaigns/:id/messages
```

### 5.3 요청/응답 형식

- 모든 요청 및 응답 본문은 JSON 형식을 사용합니다.
- 응답에는 일관된 구조를 사용합니다.

```json
// 성공 응답
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "알림 제목",
    "body": "알림 내용"
  }
}

// 오류 응답
{
  "status": "error",
  "error": {
    "code": "invalid_token",
    "message": "유효하지 않은 토큰입니다.",
    "details": { ... }
  }
}
```

### 5.4 상태 코드 사용

- **200 OK**: 성공적인 요청
- **201 Created**: 리소스 생성 성공
- **400 Bad Request**: 클라이언트 오류
- **401 Unauthorized**: 인증 필요
- **403 Forbidden**: 권한 없음
- **404 Not Found**: 리소스 없음
- **429 Too Many Requests**: 요청 제한 초과
- **500 Internal Server Error**: 서버 오류

## 6. 성능 최적화 가이드라인

### 6.1 데이터베이스 최적화

- 적절한 인덱스를 사용합니다.
- 대량 쿼리는 배치 작업으로 처리합니다.
- 트랜잭션을 적절히 사용합니다.
- 데이터베이스 연결 풀을 효율적으로 관리합니다.

```elixir
# 배치 삽입 예시
def create_campaign_messages(campaign, subscriptions) do
  subscriptions
  |> Enum.chunk_every(500)  # 500개씩 배치 처리
  |> Enum.each(fn batch ->
    Ash.transaction(fn ->
      Enum.map(batch, fn subscription ->
        create_message_for_subscription(campaign, subscription)
      end)
    end)
  end)
end
```

### 6.2 메모리 관리

- 대량의 데이터는 스트림으로 처리합니다.
- 불필요한 데이터 복사를 피합니다.
- 자원 사용량을 모니터링합니다.

```elixir
# 스트림 처리 예시
defmodule AutomataSignal.Services.CampaignService do
  def process_large_campaign(campaign) do
    AutomataSignal.Repo.stream(
      from(s in Subscription, where: s.application_id == ^campaign.application_id)
    )
    |> Stream.chunk_every(1000)
    |> Stream.each(fn subscriptions ->
      create_messages_for_subscriptions(campaign, subscriptions)
    end)
    |> Stream.run()
  end
end
```

### 6.3 네트워크 최적화

- 요청/응답 페이로드를 최소화합니다.
- 적절한 캐싱을 사용합니다.
- 연결 풀링을 구현합니다.
- 비율 제한을 적용합니다.

## 7. 테스트 코딩 표준

### 7.1 테스트 파일 구조

- 테스트 파일은 테스트 대상 모듈 구조를 반영합니다.
- 파일 이름은 `[module_name]_test.exs` 형식을 사용합니다.

```
test/
  automata_signal/
    resources/
      message_test.exs
      subscription_test.exs
    services/
      message_service_test.exs
    adapters/
      push_adapter_test.exs
```

### 7.2 테스트 그룹화

- `describe` 블록을 사용하여 관련 테스트를 그룹화합니다.
- 테스트 이름은 명확하고 설명적이어야 합니다.

```elixir
defmodule AutomataSignal.Adapters.PushAdapterTest do
  use AutomataSignal.DataCase
  alias AutomataSignal.Adapters.PushAdapter

  describe "send_message/1" do
    test "successfully sends iOS push notification" do
      # 테스트 내용
    end

    test "successfully sends Android push notification" do
      # 테스트 내용
    end

    test "returns error for invalid token" do
      # 테스트 내용
    end
  end

  describe "map_error/1" do
    test "maps APNS errors correctly" do
      # 테스트 내용
    end

    test "maps FCM errors correctly" do
      # 테스트 내용
    end
  end
end
```

### 7.3 테스트 데이터 설정

- 각 테스트에 필요한 데이터만 설정합니다.
- 공통 설정은 `setup` 블록을 사용합니다.
- 팩토리 패턴을 사용하여 테스트 데이터를 생성합니다.

```elixir
defmodule AutomataSignal.Factory do
  def build(:message) do
    %{
      title: "Test Title",
      body: "Test Body",
      data: %{},
      status: :pending,
      channel_type: :push
    }
  end

  def build(:subscription) do
    %{
      token: "test_token",
      type: :iOSPush,
      subscription_status: 1
    }
  end

  # 팩토리 헬퍼 함수
  def build(factory_name, attrs) do
    factory_name
    |> build()
    |> Map.merge(attrs)
  end
end

# 테스트에서 사용
test "successfully sends iOS push notification" do
  subscription = Factory.build(:subscription, type: :iOSPush)
  message = Factory.build(:message, subscription: subscription)

  assert {:ok, _response} = PushAdapter.send_message(message)
end
```

### 7.4 모의 객체 및 스텁

- `mox` 라이브러리를 사용하여 외부 의존성을 모킹합니다.
- 테스트 헬퍼 모듈을 사용하여 반복적인 모킹 코드를 추상화합니다.

```elixir
# 모킹 설정
defmodule AutomataSignal.MockAPNS do
  @behaviour AutomataSignal.APNS.Behaviour

  def push(notification, _config) do
    send(self(), {:apns_push, notification})
    {:ok, %{id: "mock_id"}}
  end
end

# 테스트에서 사용
test "sends notification to APNS" do
  subscription = Factory.build(:subscription, type: :iOSPush)
  message = Factory.build(:message, subscription: subscription)

  PushAdapter.send_message(message)

  assert_received {:apns_push, notification}
  assert notification.token == subscription.token
  assert notification.notification.title == message.title
end
```

## 8. 코드 리뷰 체크리스트

코드 리뷰 시 다음 사항을 확인합니다:

### 8.1 일반 사항

- [ ] 코드가 기능 요구사항을 충족하는가?
- [ ] 코드가 이해하기 쉬운가?
- [ ] 변수 및 함수 이름이 의미 있는가?
- [ ] 주석이 명확하고 필요한 곳에 있는가?
- [ ] 중복 코드가 없는가?

### 8.2 성능 및 보안

- [ ] 데이터베이스 쿼리가 최적화되어 있는가?
- [ ] 리소스 사용이 효율적인가?
- [ ] 민감한 데이터가 적절히 암호화되어 있는가?
- [ ] 입력 데이터가 적절히 검증되는가?
- [ ] 오류 처리가 적절한가?

### 8.3 테스트

- [ ] 테스트 코드가 있는가?
- [ ] 테스트가 모든 중요한 경로를 커버하는가?
- [ ] 테스트가 이해하기 쉬운가?
- [ ] 테스트가 안정적으로 실행되는가?

### 8.4 문서화

- [ ] 필요한 모든 함수와 모듈이 문서화되어 있는가?
- [ ] 문서가 명확하고 정확한가?
- [ ] 복잡한 로직이 문서화되어 있는가?

## 9. 코드 품질 도구

### 9.1 정적 분석 도구

프로젝트에서는 다음과 같은 코드 품질 도구를 사용합니다:

- **Credo**: Elixir 코드 스타일 및 일관성 검사
- **Dialyxir**: 타입 검사
- **Sobelow**: 보안 취약점 분석
- **ExCoveralls**: 테스트 커버리지 측정 및 보고
- **dart_code_metrics**: Flutter/Dart 코드 품질 검사

### 9.2 설정 방법

다음과 같이 `mix.exs` 파일에 설정합니다:

```elixir
defp deps do
  [
    {:credo, "~> 1.6", only: [:dev, :test], runtime: false},
    {:dialyxir, "~> 1.2", only: [:dev, :test], runtime: false},
    {:sobelow, "~> 0.11", only: [:dev, :test], runtime: false},
    {:excoveralls, "~> 0.14", only: :test},
    # ... 기타 의존성
  ]
end

def project do
  [
    # ... 기타 설정
    test_coverage: [tool: ExCoveralls],
    preferred_cli_env: [
      coveralls: :test,
      "coveralls.detail": :test,
      "coveralls.post": :test,
      "coveralls.html": :test,
      "coveralls.github": :test
    ]
  ]
end
```

### 9.3 CI 통합

코드 품질 도구는 로컬 개발 환경뿐만 아니라 CI 환경에서도 자동으로 실행되어야 합니다. 지속적 통합을 통해 모든 변경사항에 대해 품질 검사를 수행합니다:

- 코드 형식 검사: `mix format --check-formatted`
- 코드 스타일 및 일관성 검사: `mix credo --strict`
- 타입 검사: `mix dialyxir`
- 보안 취약점 분석: `mix sobelow --config`
- 테스트 커버리지 측정: `mix coveralls.github`

프로젝트의 CI/CD 파이프라인 구성 및 GitHub Actions 워크플로우에 대한 자세한 내용은 [GUIDE-003] 개발 워크플로우 문서를 참조하세요.

## 10. 리팩토링 가이드라인

### 10.1 리팩토링 시점

다음과 같은 경우 리팩토링을 고려해야 합니다:

- 코드 중복이 발생한 경우
- 함수나 모듈이 너무 커진 경우
- 기능이 추가됨에 따라 기존 설계가 적합하지 않게 된 경우
- 성능 문제가 발생한 경우
- 테스트가 어려워진 경우

### 10.2 리팩토링 계획

리팩토링 전에는 다음을 준비합니다:

1. 리팩토링 범위와 목표를 명확히 정의
2. 현재 코드의 동작을 테스트로 문서화
3. 리팩토링 계획 문서 작성 (`../progress/[이슈명]_refactoring.md`)
4. 작은 단위로 나누어 리팩토링 수행
5. 각 단계마다 테스트 실행

### 10.3 리팩토링 승인

큰 규모의 리팩토링은 다음 절차를 따릅니다:

1. 리팩토링 계획 제출
2. 팀 리뷰 및 논의
3. 승인 후 리팩토링 진행
4. 완료 후 코드 리뷰
