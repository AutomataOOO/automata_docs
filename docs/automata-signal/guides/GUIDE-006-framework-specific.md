# [GUIDE-006] Ash Framework 특화 가이드

| 버전 | 날짜       | 변경 내용      |
| ---- | ---------- | -------------- |
| 1.0  | 2025-04-02 | 최초 문서 작성 |

## 요약

본 문서는 Automata-Signal 프로젝트에서 Ash Framework를 효과적으로 활용하는 방법에 대한 상세 가이드를 제공합니다. Ash 리소스 정의, 확장 모듈 활용, 액션 구현, 쿼리, 데이터 로딩 등 Ash Framework 특화 내용을 집중적으로 다룹니다. 이 가이드는 Elixir 기반 프로젝트에서 재사용 가능한 참조 자료로 활용할 수 있습니다.

## 1. Ash Framework 개요

### 1.1 Ash Framework란?

Ash Framework는 Elixir 기반의 선언적 데이터 모델링 및 관리 프레임워크입니다. 다음과 같은 핵심 특징을 가집니다:

- **선언적 리소스 정의**: 도메인 모델을 명확하고 응집력 있게 정의
- **확장 가능한 아키텍처**: 플러그인 형태의 다양한 확장 모듈 지원
- **풍부한 쿼리 API**: 복잡한 쿼리를 간결하게 작성 가능
- **강력한 인증/인가**: 세밀한 접근 제어 매커니즘 제공
- **다양한 데이터 계층**: PostgreSQL, Mnesia 등 다양한 백엔드 지원

### 1.2 주요 구성 요소

Ash Framework는 다음 주요 구성 요소로 이루어져 있습니다:

- **Resource**: 도메인 모델 정의 (엔티티, 속성, 관계)
- **Action**: 리소스에 대한 작업 정의 (생성, 조회, 수정, 삭제, 커스텀 작업)
- **Query**: 리소스 데이터 쿼리 및 필터링
- **Domain**: 관련 리소스 그룹화 및 접근 규칙 관리
- **Registry**: 리소스 등록 및 검색
- **DataLayer**: 데이터 저장 및 조회 추상화
- **Extension**: 기능 확장 모듈 (상태 기계, 아카이빙, 감사 추적 등)

## 2. Ash 리소스 정의 가이드

### 2.1 리소스 기본 구조

```elixir
defmodule MyApp.Resources.MyResource do
  use Ash.Resource,
    data_layer: AshPostgres.DataLayer,
    extensions: [
      # 필요한 확장 모듈만 추가
    ]

  # 속성 정의
  attributes do
    # ...
  end

  # 관계 정의
  relationships do
    # ...
  end

  # 액션 정의
  actions do
    # ...
  end

  # 계산된 속성
  calculations do
    # ...
  end

  # 집계 정의
  aggregates do
    # ...
  end
end
```

### 2.2 속성 정의 모범 사례

속성(attribute)은 리소스의 데이터 필드를 정의합니다:

```elixir
attributes do
  # 기본 키 (항상 첫 번째로 정의)
  uuid_primary_key :id

  # 기본 속성 정의
  attribute :name, :string do
    # 제약 조건
    constraints [required: true, min_length: 2, max_length: 100]
    # 기본값
    default "Unnamed"
    # 설명 (문서화)
    description "사용자 이름"
  end

  # 열거형(enum) 속성
  attribute :status, :atom do
    constraints [one_of: [:active, :inactive, :pending]]
    default :pending
    description "사용자 상태"
  end

  # 구조화된 데이터
  attribute :metadata, :map, default: %{}

  # 타임스탬프 (created_at, updated_at)
  timestamps()

  # 민감 정보 (암호화 필요)
  attribute :api_key, :string, sensitive?: true

  # 비공개 속성 (API 응답에서 제외)
  attribute :internal_notes, :string, private?: true

  # 사용자 정의 타입
  attribute :coords, MyApp.Types.GeoPoint
end
```

#### 속성 정의 규칙

1. **기본 키**: 항상 `uuid_primary_key :id`를 속성 블록 최상단에 정의합니다.
2. **논리적 그룹화**: 관련 속성을 함께 그룹화하고 그룹 간에 주석으로 구분합니다.
3. **제약 조건**: 모든 필수 필드에 `constraints [required: true]`를 명시합니다.
4. **기본값**: 적절한 기본값을 제공하여 데이터 일관성을 유지합니다.
5. **설명**: 복잡한 속성에는 `description` 메타데이터를 추가합니다.

### 2.3 관계 정의 모범 사례

관계(relationship)는 리소스 간의 연결을 정의합니다:

```elixir
relationships do
  # 일대다 관계
  has_many :messages, MyApp.Resources.Message do
    destination_attribute :user_id
    description "사용자가 보낸 메시지"
  end

  # 다대일 관계
  belongs_to :organization, MyApp.Resources.Organization do
    allow_nil? false # 필수 관계
    attribute_constraints on_delete: :delete_all # 소유 관계
    description "사용자가 속한 조직"
  end

  # 일대일 관계
  has_one :profile, MyApp.Resources.Profile do
    destination_attribute :user_id
    description "사용자 프로필"
  end

  # 다대다 관계
  many_to_many :projects, MyApp.Resources.Project do
    through MyApp.Resources.ProjectMember
    source_attribute_on_join_resource :user_id
    destination_attribute_on_join_resource :project_id
    description "사용자가 참여하는 프로젝트"
  end
end
```

#### 관계 정의 규칙

1. **관계 유형**: 정확한 관계 유형(`has_many`, `belongs_to`, `has_one`, `many_to_many`)을 선택합니다.
2. **속성 명명**: 기본 외래 키 이름은 `{관계명}_id`입니다. 다른 이름을 사용할 경우 `source_attribute` 또는 `destination_attribute`를 명시합니다.
3. **무결성 제약 조건**: `on_delete`, `on_update` 정책을 명확히 설정합니다.
4. **필수 관계**: 필수 관계는 `allow_nil? false`로 설정합니다.
5. **설명**: 각 관계의 의미를 `description`에 명시합니다.

### 2.4 계산 및 집계 정의

계산된 속성과 집계는 리소스의 데이터를 기반으로 동적으로 계산된 값을 정의합니다:

```elixir
# 계산된 속성
calculations do
  # 간단한 계산
  calculate :full_name, :string, expr(first_name <> " " <> last_name)

  # 조건부 계산
  calculate :subscription_status_text, :string, expr(
    case subscription_status do
      1 -> "활성"
      0 -> "대기 중"
      -1 -> "만료됨"
      _ -> "알 수 없음"
    end
  )

  # 관계를 사용한 계산
  calculate :has_messages, :boolean, expr(count(messages) > 0)
end

# 집계 정의
aggregates do
  # 단순 카운트
  count :message_count, :messages

  # 합계
  sum :total_purchases, :orders, :amount

  # 평균
  average :average_rating, :reviews, :rating

  # 최소/최대
  max :last_login, :login_events, :timestamp
  min :first_login, :login_events, :timestamp
end
```

#### 계산 및 집계 규칙

1. **표현식 사용**: 계산된 속성은 `expr/1` 매크로를 사용하여 정의합니다.
2. **성능 고려**: 복잡한 계산은 성능에 영향을 줄 수 있으므로 최적화합니다.
3. **명시적 로딩**: 계산 및 집계를 사용하기 전에 `Ash.Query.load/2`로 명시적으로 로드합니다.

## 3. Ash 확장 모듈 활용 가이드

### 3.1 AshStateMachine

상태 전이 관리를 위한 확장 모듈입니다:

```elixir
use Ash.Resource,
  extensions: [AshStateMachine.Resource]

attributes do
  # ...
  attribute :status, :atom do
    constraints [one_of: [:pending, :approved, :rejected, :completed]]
    default :pending
  end
  # ...
end

state_machine do
  # 상태 필드 지정
  field :status

  # 초기 상태 정의
  initial_states [:pending]

  # 상태 전이 규칙
  transitions do
    transition :approve, from: [:pending], to: :approved
    transition :reject, from: [:pending], to: :rejected
    transition :complete, from: [:approved], to: :completed
    transition :reopen, from: [:rejected, :completed], to: :pending
  end

  # 전이 전/후 동작 정의
  on_transition :approve do
    # 전이 전 검증
    prevent_transition unless: fn changeset, _ ->
      has_approval_permission?(changeset)
    end

    # 전이 시 속성 변경
    set_attribute :approved_at, &DateTime.utc_now/0
    set_attribute :approver_id, fn changeset, _ ->
      Ash.Changeset.get_context(changeset).actor.id
    end
  end
end

# 액션에서 상태 전이 사용
actions do
  update :approve do
    accept []
    change transition_state(:approve)
  end

  update :reject do
    accept [:rejection_reason]
    change transition_state(:reject)
  end
end
```

#### AshStateMachine 모범 사례

1. **상태 필드**: 상태 필드는 `:atom` 타입으로 정의하고 유효한 상태 목록을 `constraints [one_of: [...]]`로 제한합니다.
2. **전이 규칙**: 모든 가능한 상태 전이를 명시적으로 정의합니다.
3. **전이 동작**: 상태 변경 시 추가 동작(타임스탬프 설정, 사용자 기록 등)을 `on_transition` 블록에 정의합니다.
4. **액션 연결**: 상태 전이를 위한 전용 액션을 정의하고 `transition_state/1`를 사용합니다.

### 3.2 AshArchival

논리적 삭제(소프트 삭제)를 위한 확장 모듈입니다:

```elixir
use Ash.Resource,
  extensions: [AshArchival.Resource]

# 아카이브 속성 설정
archival do
  # 아카이브 여부를 저장할 속성
  archive_attribute :archived
  # 아카이브 시간을 저장할 속성
  archive_timestamp_attribute :archived_at
end

# 중요: 아카이브된 레코드를 기본적으로 필터링
resource do
  base_filter? true
end

# 아카이브/복원 액션
actions do
  # 아카이브 액션
  update :archive do
    accept []
    change archive()
  end

  # 복원 액션
  update :unarchive do
    accept []
    change unarchive()
  end

  # 아카이브된 항목 포함 조회
  read :read_with_archived do
    prepare build(load: false)
  end
end
```

#### AshArchival 모범 사례

1. **base_filter 활성화**: 항상 `resource do base_filter? true end`를 설정하여 아카이브된 레코드가 기본적으로 필터링되도록 합니다.
2. **아카이브 액션**: 명시적인 아카이브/복원 액션을 정의합니다.
3. **아카이브 시간 기록**: `archive_timestamp_attribute` 설정으로 아카이브 시간을 자동으로 기록합니다.
4. **아카이브 포함 쿼리**: 필요한 경우 아카이브된 항목을 포함한 조회 액션을 별도로 정의합니다.

### 3.3 AshPaperTrail

변경 이력 추적을 위한 확장 모듈입니다:

```elixir
use Ash.Resource,
  extensions: [AshPaperTrail.Resource]

# 변경 이력 설정
paper_trail do
  # 추적할 속성 지정
  track_attribute :status
  track_attribute :assigned_to_id

  # 관계 업데이트 추적
  track_relationship_updates? true

  # 액터(변경 주체) 추적
  monitor_actor? true
  track_actor? true

  # 변경 사유(선택사항)
  track_reason? true
end

# 액션 설정
actions do
  update :assign do
    accept [:assigned_to_id]

    # 변경 사유 요구
    argument :reason, :string do
      allow_nil? false
    end

    # 변경 사유 설정
    change set_context_attribute(:paper_trail_reason, fn changeset ->
      Ash.Changeset.get_argument(changeset, :reason)
    end)
  end
end
```

#### AshPaperTrail 모범 사례

1. **추적 대상 선택**: 변경 이력이 필요한 중요 속성만 `track_attribute`로 지정합니다.
2. **액터 추적**: 변경 주체를 추적하려면 `monitor_actor?` 및 `track_actor?`를 활성화합니다.
3. **변경 사유**: 중요한 변경의 경우 `track_reason?`를 활성화하고 액션에서 변경 사유를 요구합니다.
4. **컨텍스트 활용**: 액션 실행 시 `Ash.ContextHelpers.set_actor/2`로 액터를 설정합니다.

### 3.4 AshOban

비동기 작업 처리를 위한 확장 모듈입니다:

```elixir
use Ash.Resource,
  extensions: [AshOban.Resource]

# Oban 작업 설정
oban_job do
  # 큐 이름
  queue :messages

  # 우선순위 (낮을수록 높은 우선순위)
  priority 3

  # 최대 재시도 횟수
  max_attempts 5

  # 고유 작업 식별 (중복 방지)
  unique [:message_id]

  # 작업 유효 기간
  max_age 24 * 60 * 60

  # 실행할 워커 지정
  worker MyApp.Workers.MessageWorker

  # 태그 (분류 및 필터링용)
  tags ["message", "notification"]
end

# 액션에서 작업 예약
actions do
  create :schedule_message do
    accept [:title, :body, :recipient_id]

    # 예약 시간(선택)
    argument :scheduled_at, :utc_datetime do
      allow_nil? true
    end

    # Oban 작업으로 실행
    run_oban_job fn changeset ->
      # 작업 인자 설정
      args = %{
        message_id: Ash.Changeset.get_context(changeset, :message_id),
        recipient_id: Ash.Changeset.get_attribute(changeset, :recipient_id)
      }

      # 예약 시간 설정
      scheduled_at = Ash.Changeset.get_argument(changeset, :scheduled_at)

      if scheduled_at do
        {:ok, args, [scheduled_at: scheduled_at]}
      else
        {:ok, args}
      end
    end
  end
end
```

#### AshOban 모범 사례

1. **적절한 큐 선택**: 작업 유형에 맞는 큐를 선택하여 우선순위 및 처리량을 관리합니다.
2. **고유성 관리**: 중복 작업 방지를 위해 `unique` 파라미터를 설정합니다.
3. **재시도 전략**: 중요 작업은 `max_attempts`를 높게 설정하고, 일시적 실패 시 지수 백오프 재시도 전략을 구현합니다.
4. **작업 메타데이터**: `tags`를 사용하여 작업 분류 및 모니터링을 용이하게 합니다.

### 3.5 AshCloak

민감 데이터 암호화를 위한 확장 모듈입니다:

```elixir
use Ash.Resource,
  extensions: [AshCloak.Resource]

attributes do
  # ...
  # 암호화가 필요한 속성
  attribute :email, :string, sensitive?: true
  attribute :phone_number, :string, sensitive?: true
  attribute :api_token, :string, sensitive?: true
  # ...
end

# 암호화 설정
encrypted_attributes do
  # 암호화할 속성 지정
  attribute :email
  attribute :phone_number
  attribute :api_token

  # 사용할 Vault 지정 (선택사항)
  vault MyApp.Vault.EmailVault, for: [:email]
  vault MyApp.Vault.PhoneVault, for: [:phone_number]
  vault MyApp.Vault.TokenVault, for: [:api_token]
end
```

#### AshCloak 모범 사례

1. **민감 데이터 식별**: 개인 식별 정보, 인증 정보, 금융 정보 등 민감한 데이터를 식별하고 `sensitive?: true`로 표시합니다.
2. **Vault 설정**: 데이터 유형별로 적절한 Vault를 설정합니다.
3. **키 관리**: 암호화 키를 안전하게 관리하고 정기적으로 교체합니다.

```elixir
# Vault 설정 예시
config :ash_cloak, repo: MyApp.Repo

config :ash_cloak, MyApp.Vault.EmailVault,
  keys: [
    %{tag: "1", key: :base64.decode("..."), default: true}
  ]
```

### 3.6 AshMoney 및 AshDoubleEntry

통화 처리 및 이중 원장 회계를 위한 확장 모듈입니다:

```elixir
use Ash.Resource,
  extensions: [
    AshMoney.Resource,
    AshDoubleEntry.Resource
  ]

attributes do
  # ...
  # 통화 속성
  attribute :price, :money
  attribute :balance, :money, default: 0
  # ...
end

# 이중 원장 설정
double_entry do
  # 계정 정의
  account :balance do
    # 연결할 속성
    change_attribute :balance
    # 계정 유형 (금액 증가 방향)
    credit_type :increase
    debit_type :decrease
  end
end

# 액션에서 이중 원장 사용
actions do
  # 입금 액션
  update :deposit do
    accept []

    # 입금액 인자
    argument :amount, :decimal do
      allow_nil? false
      constraints [greater_than: 0]
    end

    # 이중 원장 거래
    change double_entry_credit(:balance) do
      # 금액 설정
      amount fn changeset ->
        Ash.Changeset.get_argument(changeset, :amount)
      end

      # 거래 설명
      description "사용자 입금"

      # 메타데이터
      metadata fn changeset ->
        %{
          user_id: Ash.Changeset.get_attribute(changeset, :id),
          method: Ash.Changeset.get_argument(changeset, :method)
        }
      end
    end
  end

  # 출금 액션
  update :withdraw do
    accept []

    # 출금액 인자
    argument :amount, :decimal do
      allow_nil? false
      constraints [greater_than: 0]
    end

    # 이중 원장 거래
    change double_entry_debit(:balance) do
      # 금액 설정
      amount fn changeset ->
        Ash.Changeset.get_argument(changeset, :amount)
      end

      # 거래 설명
      description "사용자 출금"

      # 메타데이터
      metadata fn changeset ->
        %{
          user_id: Ash.Changeset.get_attribute(changeset, :id),
          method: Ash.Changeset.get_argument(changeset, :method)
        }
      end
    end
  end
end
```

#### AshMoney 및 AshDoubleEntry 모범 사례

1. **통화 속성**: 모든 금액 필드는 `:money` 타입으로 정의합니다.
2. **계정 유형**: 각 계정의 `credit_type` 및 `debit_type`을 비즈니스 규칙에 맞게 설정합니다.
3. **거래 메타데이터**: 모든 거래에 충분한 컨텍스트 정보를 메타데이터로 포함합니다.
4. **거래 설명**: 명확한 거래 설명을 제공하여 감사 추적이 용이하도록 합니다.

## 4. Ash 액션 구현 가이드

### 4.1 기본 CRUD 액션

```elixir
actions do
  # 기본 CRUD 액션 활성화
  defaults [:create, :read, :update, :destroy]

  # 부분 활성화도 가능
  # defaults [:create, :read]
end
```

### 4.2 커스텀 액션 정의

#### 생성 액션

```elixir
actions do
  # 사용자 등록 액션
  create :register do
    # 허용할 속성
    accept [:email, :password, :first_name, :last_name]

    # 추가 인자
    argument :terms_accepted, :boolean do
      allow_nil? false
      constraints [must_be: true]
    end

    # 유효성 검증
    validate confirm(:password, :password_confirmation)
    validate present([:email, :password])

    # 속성 변경
    change set_attribute(:role, :user)
    change set_attribute(:status, :pending)

    # 비밀번호 해싱
    change fn changeset ->
      password = Ash.Changeset.get_attribute(changeset, :password)
      hashed_password = Bcrypt.hash_pwd_salt(password)
      Ash.Changeset.set_attribute(changeset, :password_hash, hashed_password)
      |> Ash.Changeset.set_attribute(:password, nil)
    end
  end
end
```

#### 읽기 액션

```elixir
actions do
  # 사용자 검색 액션
  read :search do
    # 필터 인자
    argument :query, :string do
      allow_nil? true
    end

    # 필터 적용
    filter expr(
      is_nil(^arg(:query)) or
      first_name ilike ^"%#{arg(:query)}%" or
      last_name ilike ^"%#{arg(:query)}%" or
      email == ^arg(:query)
    )

    # 페이지네이션
    pagination keyset?: true, default_limit: 20

    # 정렬
    sort [:last_name, :first_name]
  end

  # 활성 사용자만 조회
  read :active_users do
    filter expr(status == :active)
  end
end
```

#### 업데이트 액션

```elixir
actions do
  # 프로필 업데이트 액션
  update :update_profile do
    # 허용할 속성
    accept [:first_name, :last_name, :bio, :avatar_url]

    # 유효성 검증
    validate present([:first_name, :last_name])

    # 현재 사용자만 수정 가능
    authorize :update
  end

  # 비밀번호 변경 액션
  update :change_password do
    # 입력 인자
    argument :current_password, :string do
      allow_nil? false
    end

    argument :new_password, :string do
      allow_nil? false
      constraints [min_length: 8]
    end

    argument :new_password_confirmation, :string do
      allow_nil? false
    end

    # 유효성 검증
    validate confirm(:new_password, :new_password_confirmation)

    # 현재 비밀번호 확인
    validate fn changeset ->
      current = Ash.Changeset.get_argument(changeset, :current_password)
      hash = Ash.Changeset.get_attribute(changeset, :password_hash)

      if Bcrypt.verify_pass(current, hash) do
        :ok
      else
        {:error, field: :current_password, message: "현재 비밀번호가 올바르지 않습니다"}
      end
    end

    # 새 비밀번호 해싱
    change fn changeset ->
      new_password = Ash.Changeset.get_argument(changeset, :new_password)
      hashed_password = Bcrypt.hash_pwd_salt(new_password)
      Ash.Changeset.set_attribute(changeset, :password_hash, hashed_password)
    end
  end
end
```

#### 삭제 액션

```elixir
actions do
  # 계정 삭제 액션
  destroy :delete_account do
    # 입력 인자
    argument :confirmation, :string do
      allow_nil? false
      constraints [must_be: "DELETE"]
    end

    # 대안으로 아카이브 사용
    soft? true

    # 실행 전 콜백
    before_transaction fn changeset ->
      # 계정 삭제 전 정리 작업
      user_id = Ash.Changeset.get_attribute(changeset, :id)
      MyApp.UserCleanupService.schedule_cleanup(user_id)
      {:ok, changeset}
    end
  end
end
```

### 4.3 액션 인자 및 유효성 검사

```elixir
# 액션 인자 정의
argument :search_term, :string do
  # 필수 여부
  allow_nil? true
  # 기본값
  default ""
  # 제약 조건
  constraints [min_length: 3]
  # 설명
  description "검색어"
end

# 공통 유효성 검사
validate present([:field1, :field2])
validate confirm(:password, :password_confirmation)
validate is_unique(:email)
validate format(:email, ~r/@/)
validate min_length(:password, 8)
validate max_length(:bio, 500)

# 커스텀 유효성 검사
validate fn changeset ->
  field1 = Ash.Changeset.get_attribute(changeset, :field1)
  field2 = Ash.Changeset.get_attribute(changeset, :field2)

  if some_condition?(field1, field2) do
    :ok
  else
    {:error, field: :field1, message: "커스텀 오류 메시지"}
  end
end
```

### 4.4 액션 변경 함수

```elixir
# 속성 설정
change set_attribute(:field, "value")

# 동적 속성 설정
change set_attribute(:created_at, &DateTime.utc_now/0)

# 인자 기반 속성 설정
change set_attribute(:field, fn changeset ->
  Ash.Changeset.get_argument(changeset, :arg_name)
end)

# 관계 관리
change manage_relationship(:posts, %{title: "새 포스트"})

# 상태 전이
change transition_state(:approve)

# 이중 원장 거래
change double_entry_credit(:account, 100)

# 커스텀 변경 함수
change fn changeset, _ ->
  # 로직 구현
  modified_changeset = do_something(changeset)
  modified_changeset
end
```

## 5. Ash 쿼리 및 데이터 로딩 가이드

### 5.1 기본 쿼리 작성

```elixir
# 모든 레코드 조회
users = MyApp.Accounts.User
|> Ash.Query.filter(status == :active)
|> Ash.Query.sort(inserted_at: :desc)
|> Ash.Query.limit(10)
|> MyApp.Accounts.read!()

# 단일 레코드 조회
user = MyApp.Accounts.User
|> Ash.Query.filter(id == ^user_id)
|> Ash.Query.limit(1)
|> MyApp.Accounts.read_one!()

# 카운트 조회
count = MyApp.Accounts.User
|> Ash.Query.filter(status == :active)
|> Ash.Query.count!()
```

### 5.2 필터링 표현식

```elixir
# 기본 비교
Ash.Query.filter(user_resource, id == ^user_id)
Ash.Query.filter(user_resource, age > 18)
Ash.Query.filter(user_resource, status != :inactive)

# 논리 연산
Ash.Query.filter(user_resource, status == :active and role == :admin)
Ash.Query.filter(user_resource, status == :active or status == :pending)
Ash.Query.filter(user_resource, not is_nil(email))

# 컬렉션 연산
Ash.Query.filter(user_resource, role in [:admin, :moderator])
Ash.Query.filter(user_resource, :admin in roles)

# 문자열 연산
Ash.Query.filter(user_resource, first_name ilike ^"john%")
Ash.Query.filter(user_resource, email == email_address)

# 날짜 연산
Ash.Query.filter(user_resource, inserted_at > ^one_week_ago)
Ash.Query.filter(user_resource, is_nil(deleted_at))

# 관계 필터
Ash.Query.filter(user_resource, exists(posts, title ilike ^"%keyword%"))
Ash.Query.filter(user_resource, count(posts) > 0)
```

### 5.3 관계 로딩

```elixir
# 단일 관계 로드
user = MyApp.Accounts.User
|> Ash.Query.filter(id == ^user_id)
|> Ash.Query.load(:profile)  # has_one 관계
|> MyApp.Accounts.read_one!()

# 다중 관계 로드
user = MyApp.Accounts.User
|> Ash.Query.filter(id == ^user_id)
|> Ash.Query.load([:profile, :posts])
|> MyApp.Accounts.read_one!()

# 중첩 관계 로드
user = MyApp.Accounts.User
|> Ash.Query.filter(id == ^user_id)
|> Ash.Query.load([posts: [:comments, :category]])
|> MyApp.Accounts.read_one!()

# 관계 필터링
user = MyApp.Accounts.User
|> Ash.Query.filter(id == ^user_id)
|> Ash.Query.load(posts: fn query ->
  query
  |> Ash.Query.filter(published == true)
  |> Ash.Query.sort(published_at: :desc)
  |> Ash.Query.limit(5)
end)
|> MyApp.Accounts.read_one!()
```

### 5.4 계산 및 집계 로딩

```elixir
# 계산된 속성 로드
users = MyApp.Accounts.User
|> Ash.Query.load(:full_name)  # 계산된 속성
|> MyApp.Accounts.read!()

# 집계 로드
users = MyApp.Accounts.User
|> Ash.Query.load(:post_count)  # 집계
|> MyApp.Accounts.read!()

# 계산된 속성을 기준으로 정렬
users = MyApp.Accounts.User
|> Ash.Query.load(:full_name)
|> Ash.Query.sort(:full_name)
|> MyApp.Accounts.read!()

# 계산된 속성 필터링 (런타임 필터)
users = MyApp.Accounts.User
|> Ash.Query.load(:post_count)
|> MyApp.Accounts.read!()
|> Enum.filter(fn user -> user.post_count > 10 end)
```

### 5.5 페이지네이션

```elixir
# 오프셋 기반 페이지네이션
{users, pagination} = MyApp.Accounts.User
|> Ash.Query.sort(inserted_at: :desc)
|> Ash.Query.page(offset: 0, limit: 20)
|> MyApp.Accounts.read!()

# 키셋 기반 페이지네이션 (권장)
{users, pagination} = MyApp.Accounts.User
|> Ash.Query.sort(inserted_at: :desc)
|> Ash.Query.paginate(:keyset, limit: 20)
|> MyApp.Accounts.read!()

# 다음 페이지 로드
{next_users, pagination} = MyApp.Accounts.User
|> Ash.Query.sort(inserted_at: :desc)
|> Ash.Query.paginate(:keyset, limit: 20, after: pagination.after_key)
|> MyApp.Accounts.read!()

# 이전 페이지 로드
{prev_users, pagination} = MyApp.Accounts.User
|> Ash.Query.sort(inserted_at: :desc)
|> Ash.Query.paginate(:keyset, limit: 20, before: pagination.before_key)
|> MyApp.Accounts.read!()
```

### 5.6 트랜잭션 및 일괄 처리

```elixir
# 트랜잭션 내에서 여러 작업 수행
Ash.transaction(fn ->
  # 사용자 생성
  {:ok, user} = MyApp.Accounts.User
  |> Ash.Changeset.for_create(:create, %{email: "user@example.com"})
  |> MyApp.Accounts.create!()

  # 프로필 생성
  {:ok, profile} = MyApp.Accounts.Profile
  |> Ash.Changeset.for_create(:create, %{user_id: user.id, bio: "..."})
  |> MyApp.Accounts.create!()

  # 초기 설정 생성
  {:ok, settings} = MyApp.Accounts.UserSettings
  |> Ash.Changeset.for_create(:create, %{user_id: user.id})
  |> MyApp.Accounts.create!()

  {:ok, {user, profile, settings}}
end)

# 데이터 배치 처리
users
|> Enum.chunk_every(100)
|> Enum.each(fn batch ->
  Ash.transaction(fn ->
    Enum.each(batch, fn user ->
      user
      |> Ash.Changeset.for_update(:update, %{status: :verified})
      |> MyApp.Accounts.update!()
    end)
  end)
end)
```

## 6. Domain 및 API 모듈 구성 가이드

### 6.1 Domain 모듈 정의

```elixir
defmodule MyApp.Accounts do
  use Ash.Domain

  resources do
    resource MyApp.Accounts.User
    resource MyApp.Accounts.Profile
    resource MyApp.Accounts.UserSettings
    resource MyApp.Accounts.LoginEvent
  end
end

defmodule MyApp.Messaging do
  use Ash.Domain

  resources do
    resource MyApp.Messaging.Message
    resource MyApp.Messaging.Conversation
    resource MyApp.Messaging.Attachment
  end
end
```

### 6.2 API 액션 호출

```elixir
# 생성 액션
{:ok, user} = MyApp.Accounts.create(User, %{
  email: "user@example.com",
  first_name: "John",
  last_name: "Doe"
})

# 읽기 액션
{:ok, users} = MyApp.Accounts.read(User, filter: [status: :active])

# 단일 레코드 읽기
{:ok, user} = MyApp.Accounts.get(User, id)

# 업데이트 액션
{:ok, user} = MyApp.Accounts.update(User, id, %{status: :active})

# 삭제 액션
{:ok, _} = MyApp.Accounts.destroy(User, id)

# 커스텀 액션 호출
{:ok, user} = MyApp.Accounts.register(User, %{
  email: "user@example.com",
  password: "password123",
  password_confirmation: "password123",
  terms_accepted: true
})
```

### 6.3 API 컨텍스트 설정

```elixir
# 액터(인증된 사용자) 설정
context = %{actor: current_user}

# 인증된 사용자 정보로 액션 호출
{:ok, message} = MyApp.Messaging.create(Message, %{
  body: "Hello",
  recipient_id: recipient_id
}, context: context)

# 추가 컨텍스트 정보 설정
context = %{
  actor: current_user,
  tenant: tenant_id,
  ip_address: client_ip
}

# 컨텍스트와 함께 액션 호출
{:ok, user} = MyApp.Accounts.update(User, user_id, %{
  status: :verified
}, context: context)
```

## 7. 테스트 가이드

### 7.1 기본 리소스 테스트

```elixir
defmodule MyApp.AccountsTest.UserTest do
  use MyApp.DataCase
  alias MyApp.Accounts
  alias MyApp.Accounts.User

  describe "create user" do
    test "creates a user with valid attributes" do
      attrs = %{
        email: "test@example.com",
        first_name: "John",
        last_name: "Doe",
        password: "password123",
        password_confirmation: "password123"
      }

      assert {:ok, user} = Accounts.create(User, attrs)
      assert user.email == "test@example.com"
      assert user.first_name == "John"
      assert user.last_name == "Doe"
    end

    test "fails with invalid attributes" do
      attrs = %{
        email: "invalid-email",
        first_name: "",
        last_name: ""
      }

      assert {:error, changeset} = Accounts.create(User, attrs)
      assert errors_on(changeset).email
      assert errors_on(changeset).first_name
      assert errors_on(changeset).last_name
    end
  end

  describe "register user" do
    test "registers a user with valid attributes" do
      attrs = %{
        email: "test@example.com",
        first_name: "John",
        last_name: "Doe",
        password: "password123",
        password_confirmation: "password123",
        terms_accepted: true
      }

      assert {:ok, user} = Accounts.register(User, attrs)
      assert user.status == :pending
      assert user.role == :user
    end

    test "fails when terms not accepted" do
      attrs = %{
        email: "test@example.com",
        first_name: "John",
        last_name: "Doe",
        password: "password123",
        password_confirmation: "password123",
        terms_accepted: false
      }

      assert {:error, changeset} = Accounts.register(User, attrs)
      assert errors_on(changeset).terms_accepted
    end
  end
end
```

### 7.2 관계 테스트

```elixir
defmodule MyApp.AccountsTest.ProfileTest do
  use MyApp.DataCase
  alias MyApp.Accounts
  alias MyApp.Accounts.{User, Profile}

  setup do
    {:ok, user} = Accounts.create(User, %{
      email: "test@example.com",
      first_name: "John",
      last_name: "Doe"
    })

    %{user: user}
  end

  test "creates a profile for user", %{user: user} do
    attrs = %{
      user_id: user.id,
      bio: "Test bio",
      avatar_url: "https://example.com/avatar.jpg"
    }

    assert {:ok, profile} = Accounts.create(Profile, attrs)
    assert profile.user_id == user.id
    assert profile.bio == "Test bio"

    # 관계 로드 검증
    user_with_profile = user
    |> Ash.Query.load(:profile)
    |> Accounts.read_one!()

    assert user_with_profile.profile.id == profile.id
  end
end
```

### 7.3 액션 테스트

```elixir
defmodule MyApp.AccountsTest.UserActionsTest do
  use MyApp.DataCase
  alias MyApp.Accounts
  alias MyApp.Accounts.User

  setup do
    {:ok, user} = Accounts.create(User, %{
      email: "test@example.com",
      first_name: "John",
      last_name: "Doe",
      status: :active,
      password_hash: Bcrypt.hash_pwd_salt("password123")
    })

    %{user: user}
  end

  describe "change_password action" do
    test "changes password with valid input", %{user: user} do
      params = %{
        current_password: "password123",
        new_password: "newpassword456",
        new_password_confirmation: "newpassword456"
      }

      assert {:ok, updated_user} = Accounts.change_password(User, user.id, params)

      # 비밀번호가 변경되었는지 확인
      assert Bcrypt.verify_pass("newpassword456", updated_user.password_hash)
    end

    test "fails with incorrect current password", %{user: user} do
      params = %{
        current_password: "wrongpassword",
        new_password: "newpassword456",
        new_password_confirmation: "newpassword456"
      }

      assert {:error, changeset} = Accounts.change_password(User, user.id, params)
      assert errors_on(changeset).current_password
    end

    test "fails with password confirmation mismatch", %{user: user} do
      params = %{
        current_password: "password123",
        new_password: "newpassword456",
        new_password_confirmation: "different"
      }

      assert {:error, changeset} = Accounts.change_password(User, user.id, params)
      assert errors_on(changeset).new_password_confirmation
    end
  end
end
```

### 7.4 쿼리 테스트

```elixir
defmodule MyApp.AccountsTest.UserQueriesTest do
  use MyApp.DataCase
  alias MyApp.Accounts
  alias MyApp.Accounts.User

  setup do
    # 테스트 데이터 생성
    {:ok, _} = Accounts.create(User, %{
      email: "admin@example.com",
      first_name: "Admin",
      last_name: "User",
      status: :active,
      role: :admin
    })

    {:ok, _} = Accounts.create(User, %{
      email: "inactive@example.com",
      first_name: "Inactive",
      last_name: "User",
      status: :inactive,
      role: :user
    })

    for i <- 1..5 do
      {:ok, _} = Accounts.create(User, %{
        email: "user#{i}@example.com",
        first_name: "User",
        last_name: "#{i}",
        status: :active,
        role: :user
      })
    end

    :ok
  end

  test "filters active users" do
    query = User
    |> Ash.Query.filter(status == :active)
    |> Ash.Query.sort(email: :asc)

    assert {:ok, users} = Accounts.read(query)
    assert length(users) == 6
    assert Enum.all?(users, &(&1.status == :active))
  end

  test "searches users by name" do
    query = User
    |> Ash.Query.filter(first_name == "Admin" or first_name == "Inactive")
    |> Ash.Query.sort(email: :asc)

    assert {:ok, users} = Accounts.read(query)
    assert length(users) == 2
    assert Enum.map(users, & &1.first_name) == ["Admin", "Inactive"]
  end

  test "paginates results" do
    query = User
    |> Ash.Query.filter(role == :user)
    |> Ash.Query.sort(email: :asc)
    |> Ash.Query.page(limit: 2, offset: 0)

    assert {:ok, {users, pagination}} = Accounts.read(query)
    assert length(users) == 2
    assert pagination.count == 6
    assert pagination.limit == 2
    assert pagination.offset == 0
  end
end
```

## 8. 성능 최적화 팁

### 8.1 데이터 로딩 최적화

1. **필요한 데이터만 로드**: 필요한 속성과 관계만 명시적으로 로드합니다.

   ```elixir
   # 특정 필드만 선택
   User
   |> Ash.Query.select([:id, :email, :first_name, :last_name])
   |> Ash.Query.load(:profile)
   ```

2. **N+1 문제 방지**: 관계를 미리 로드하여 N+1 쿼리 문제를 방지합니다.

   ```elixir
   # 모든 관계를 미리 로드
   posts = Post
   |> Ash.Query.load([:author, comments: [:author]])
   |> MyApp.Blog.read!()
   ```

3. **배치 로딩**: 대량 데이터는 배치로 처리합니다.

   ```elixir
   Stream.resource(
     fn -> 0 end,
     fn offset ->
       query = User
       |> Ash.Query.sort(id: :asc)
       |> Ash.Query.page(limit: 100, offset: offset)

       case MyApp.Accounts.read(query) do
         {:ok, {[], _}} -> {:halt, nil}
         {:ok, {users, _}} -> {[users], offset + 100}
         _ -> {:halt, nil}
       end
     end,
     fn _ -> :ok end
   )
   |> Stream.flat_map(& &1)
   |> Stream.each(fn user -> process_user(user) end)
   |> Stream.run()
   ```

### 8.2 쿼리 최적화

1. **인덱스 활용**: 자주 필터링하는 필드에 인덱스를 생성합니다.

   ```elixir
   # PostgreSQL 인덱스 설정
   postgres do
     index [:email], unique: true
     index [:status, :role]
     index [:last_name, :first_name]
   end
   ```

2. **복합 쿼리 최적화**: 복잡한 쿼리는 데이터베이스 수준에서 최적화합니다.

   ```elixir
   # 커스텀 쿼리 사용
   read :complex_search do
     prepare build(load: false)

     argument :query, :string

     manual fn _query, %{query: query}, _context ->
       sql = """
       SELECT * FROM users
       WHERE to_tsvector('english', first_name || ' ' || last_name || ' ' || email) @@ plainto_tsquery('english', $1)
       ORDER BY last_name, first_name
       LIMIT 20
       """

       # SQL 실행 (예시)
       {:ok, results} = MyApp.Repo.query(sql, [query])

       # 결과를 Ash 리소스로 변환
       # ...
     end
   end
   ```

3. **부분 인덱스**: 특정 조건에만 인덱스를 적용하여 성능을 최적화합니다.

   ```elixir
   # 부분 인덱스 예시
   postgres do
     index [:status, :last_active_at], where: "status = 'active'"
   end
   ```

### 8.3 캐싱 전략

1. **쿼리 결과 캐싱**: 자주 접근하는 데이터를 캐시합니다.

   ```elixir
   def get_active_users do
     cache_key = "active_users"

     case MyApp.Cache.get(cache_key) do
       {:ok, users} when users != nil ->
         users
       _ ->
         users = User
         |> Ash.Query.filter(status == :active)
         |> MyApp.Accounts.read!()

         MyApp.Cache.put(cache_key, users, ttl: 300) # 5분 캐싱
         users
     end
   end
   ```

2. **계산 결과 캐싱**: 비용이 많이 드는 계산 결과를 캐시합니다.

   ```elixir
   calculations do
     calculate :complex_score, :float, {MyApp.Calculations.ComplexScore, ttl: 3600}
   end
   ```

## 9. 배포 및 운영 고려사항

### 9.1 마이그레이션 관리

1. **안전한 마이그레이션**: 하위 호환성을 유지하는 마이그레이션 설계

   ```elixir
   # 안전한 열 추가
   def change do
     alter table(:users) do
       add :middle_name, :string, null: true
     end
   end
   ```

2. **마이그레이션 생성**: ash_postgres 마이그레이션 스크립트 생성

   ```bash
   mix ash_postgres.generate_migrations
   ```

3. **마이그레이션 적용**: 마이그레이션 실행

   ```bash
   mix ecto.migrate
   ```

### 9.2 배포 전략

1. **릴리스 빌드**: 릴리스 패키지 생성

   ```bash
   MIX_ENV=prod mix release
   ```

2. **환경 구성**: 환경별 설정 관리

   ```elixir
   # config/runtime.exs
   config :my_app, MyApp.Repo,
     url: System.fetch_env!("DATABASE_URL"),
     pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10")
   ```

3. **릴리스 마이그레이션**: 배포 시 자동 마이그레이션

   ```elixir
   # lib/my_app/release.ex
   defmodule MyApp.Release do
     def migrate do
       Application.load(:my_app)

       for repo <- Application.fetch_env!(:my_app, :ecto_repos) do
         {:ok, _, _} = Ecto.Migrator.with_repo(
           repo,
           &Ecto.Migrator.run(&1, :up, all: true)
         )
       end
     end
   end
   ```

## 10. 문제 해결 및 디버깅

### 10.1 일반적인 문제

1. **관계 로드 실패**: 관계가 로드되지 않을 때

   ```elixir
   # 문제: user.posts가 nil
   user = MyApp.Accounts.get!(User, id)

   # 해결: 명시적으로 관계 로드
   user = User
   |> Ash.Query.filter(id == ^id)
   |> Ash.Query.load(:posts)
   |> MyApp.Accounts.read_one!()
   ```

2. **계산된 속성 접근 실패**: 계산된 속성이 nil일 때

   ```elixir
   # 문제: user.full_name이 nil
   user = MyApp.Accounts.get!(User, id)

   # 해결: 명시적으로 계산된 속성 로드
   user = User
   |> Ash.Query.filter(id == ^id)
   |> Ash.Query.load(:full_name)
   |> MyApp.Accounts.read_one!()
   ```

3. **필터 인자 오류**: 필터에서 인자를 사용할 때

   ```elixir
   # 문제: 인자 바인딩 오류
   query = User
   |> Ash.Query.filter(email == user_email)

   # 해결: pin 연산자(^) 사용
   query = User
   |> Ash.Query.filter(email == ^user_email)
   ```

### 10.2 디버깅 기술

1. **체인지셋 검사**: 체인지셋 내용 확인

   ```elixir
   changeset = User
   |> Ash.Changeset.for_create(:create, attrs)

   IO.inspect(changeset, label: "Changeset")
   IO.inspect(Ash.Changeset.get_attributes(changeset), label: "Attributes")
   IO.inspect(Ash.Changeset.get_errors(changeset), label: "Errors")
   ```

2. **쿼리 인스펙션**: 생성된 SQL 쿼리 확인 (PostgreSQL)

   ```elixir
   # config/dev.exs
   config :ash_postgres, :repo_log_level, :debug
   ```

3. **에러 처리**: 상세 에러 정보 확인

   ```elixir
   case MyApp.Accounts.create(User, attrs) do
     {:ok, user} ->
       # 성공 처리
     {:error, error} ->
       IO.inspect(error, label: "Error")
       IO.inspect(errors_on(error), label: "Errors On")
       # 에러 처리
   end
   ```

## 11. 참고 자료

- [Ash Framework 공식 문서](https://hexdocs.pm/ash/get-started.html)
- [Ash Extensions 문서](https://ash-hq.org/docs/extensions)
- [Ash Postgres 문서](https://hexdocs.pm/ash_postgres/AshPostgres.html)
- [Ash Phoenix 문서](https://hexdocs.pm/ash_phoenix/AshPhoenix.html)
- [Elixir Forum - Ash 카테고리](https://elixirforum.com/c/elixir-framework-forum/ash-framework/107)
