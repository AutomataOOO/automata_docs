# [GUIDE-006] AI 코딩 표준: Ash Framework

| 버전 | 날짜       | 변경 내용      |
| ---- | ---------- | -------------- |
| 1.0  | 2025-04-02 | 최초 문서 작성 |

## 요약

본 문서는 AI를 활용한 코드 생성 시 Ash Framework에 특화된 코딩 표준을 제시합니다. 리소스 정의, 액션 구현, 확장 모듈 활용 등 Ash Framework 기반 애플리케이션 개발에서 일관성과 품질을 유지하기 위한 규칙과 패턴을 정의합니다.

## 대상 독자

- 신규 개발자
- 개발팀

## 1. 에이전트 지침

- **준수 의무:** 본 문서에 명시된 패턴, 템플릿, 규칙(`*규칙:*`) 및 절차(`*절차:*`)를 **엄격히 준수**하십시오. 단, 제공된 기술 명세서, 요구사항 정의서, 또는 인간 개발자의 명시적인 지침이 본 가이드와 상충될 경우 해당 지침을 우선합니다.
- **우선순위:** 코드 생성 시 명확성, 일관성, 성능, 유지보수성을 최우선으로 고려하십시오. Ash의 선언적 특성을 최대한 활용하십시오.
- **모호성 해결:** 본 가이드에서 다루지 않거나 해석이 모호한 상황 발생 시, 즉시 코드 생성을 중단하고 인간 개발자에게 명확한 지침을 요청하십시오. 추가 정보가 필요하다고 판단될 경우에만, 본 문서 13절에 명시된 공식 Ash 문서를 참조할 수 있으나, 본 가이드의 지침이 우선합니다.
- **피드백 반영:** 코드 리뷰 및 인간 개발자의 피드백(채팅 등)을 통해 생성된 코드를 수정하고 개선하십시오.

## 2. 핵심 원칙 및 개념 (요약)

AI 에이전트가 Ash 코드를 생성하기 위해 이해해야 할 기본 개념입니다. 세부 구현 규칙은 후속 섹션을 참조하십시오.

- **선언적 정의:** Ash는 데이터 모델(Resource)과 그 동작(Action)을 Elixir 코드로 선언합니다. AI는 이 선언적 정의 생성에 집중합니다.
- **핵심 구성:** Resources, Attributes, Relationships, Actions, Calculations, Aggregates, Data Layers, Extensions, Domains. (세부 사항은 각 구현 표준 섹션 참조)

## 3. 표준 구현 워크플로우

### 3.1 파일 생성 순서 (규칙)

다음 순서를 엄격히 준수하여 파일을 생성하고 구현하십시오. 이는 모듈 간 의존성을 관리하고 코드 구조를 일관되게 유지하기 위함입니다.

1. **Behaviours** (Elixir Behaviours, 인터페이스 정의 시)
2. **Ash Resources** (`lib/my_app/domain_name/resources/`) - 도메인별 하위 디렉토리 사용 권장
3. **유틸리티 모듈** (`lib/my_app/support/` 또는 `lib/my_app/utils/`)
4. **서비스/컨텍스트 모듈** (`lib/my_app/domain_name/services/` 또는 `lib/my_app/domain_name/`)
5. **어댑터/통합 모듈** (`lib/my_app/adapters/`)
6. **Ash Domain 모듈** (`lib/my_app/domain_name/domain.ex`) - 도메인 정의
7. **웹 인터페이스 관련** (`lib/my_app_web/controllers/`, `lib/my_app_web/live/` 등)
8. **테스트 코드** (`test/my_app/domain_name/resources/`, `test/my_app_web/` 등 각 단계별 생성)

### 3.2 자동 문서화 및 주석 (규칙)

- 생성하는 모든 Elixir 모듈에는 `@moduledoc` 을 사용하여 모듈의 목적과 역할을 명확히 설명하십시오.
- 생성하는 모든 public 함수(특히 Ash Action, Calculation 등)에는 `@doc` 을 사용하여 파라미터, 반환값, 기능 설명을 포함시키십시오.
- 복잡한 로직, 특정 결정의 근거, 외부 라이브러리 사용법 등 코드 이해에 필요한 부분에는 상세한 구현 주석(`#`)을 추가하십시오.
- **템플릿:**

```elixir
@moduledoc """
[모듈의 역할 및 목적에 대한 간결한 설명]

자동 생성: #{DateTime.utc_now()}
"""

@doc """
[함수/액션의 기능에 대한 설명]

## Parameters
  * `param1`: [파라미터 설명]
  * `changeset`: [Ash Changeset 설명 - 해당 시]

## Returns
  * `{:ok, result}`: [성공 시 반환값 설명]
  * `{:error, reason}`: [실패 시 반환값 설명]

## Examples
    iex> MyModule.function(arg1)
    {:ok, expected_result}
"""
```

## 4. 리소스 정의 표준

### 4.1 기본 구조 (템플릿 준수)

```elixir
defmodule MyApp.DomainName.MyResource do
  use Ash.Resource,
    # 데이터 계층: 명세서 지정 또는 AshPostgres 기본 사용 (규칙)
    data_layer: AshPostgres.DataLayer,
    # 필요한 확장 모듈만 명시 (규칙)
    extensions: [
      # 예: AshStateMachine, AshArchival 등 요구사항 기반 추가
    ]

  # 문서화 (규칙)
  @moduledoc """
  [리소스 설명 - 예: 사용자를 나타내는 리소스]

  자동 생성: #{DateTime.utc_now()}
  """

  # --- 속성, 관계, 액션 등 정의 ---
  # ... (아래 규칙들에 따라 내용 채우기) ...

end
```

### 4.2 속성 정의 (규칙 및 지침)

- **기본 키 (규칙):** `uuid_primary_key :id` 를 사용하십시오.
- **타입 (규칙):** 요구사항의 타입을 Ash 타입(`:string`, `:integer`, `:boolean`, `:utc_datetime_usec`, `:atom`, `:map`, `:decimal` 등)으로 정확히 매핑하십시오. 불명확 시 `:string` 사용 후 주석 명시 및 인간 확인 요청.
- **Null 허용 (규칙):** 요구사항에 '필수' 명시 시 `allow_nil?: false` 설정. 그 외는 기본값(`true`).
- **제약 조건 (규칙):** `constraints: [...]` 를 사용하여 명시된 제약 조건(`max_length`, `one_of`, `format` 등)을 **반드시** 구현하십시오.
- **타임스탬프 (규칙):** `timestamps()` 헬퍼를 사용하십시오 (별도 요구사항 없을 시).
- **민감 데이터 (지침):** 명백히 민감하거나 요구사항에 명시 시 `sensitive?: true` 추가 (`AshCloak` 사용 전제, 7.5절 참조).
- **비공개 속성 (지침):** 내부용 속성은 `private?: true` 설정.

```elixir
# attributes 블록 예시
attributes do
  uuid_primary_key :id # 규칙
  attribute :email, :string, allow_nil?: false, constraints: [format: ~r/@/] # 규칙 (필수, 형식 검증)
  attribute :failed_login_attempts, :integer, default: 0, allow_nil?: false # 지침 (기본값)
  attribute :settings, :map, default: %{} # 지침 (Map 타입)
  attribute :status, :atom, allow_nil?: false, default: :active, constraints: [one_of: [:active, :inactive, :pending]] # 규칙 (Atom 타입, 제약)
  attribute :api_token, :string, private?: true, sensitive?: true # 지침 (비공개, 민감)
  timestamps() # 규칙
end
```

### 4.3 관계 정의 (규칙 및 지침)

- **타입 선택 (규칙):** 요구사항 기반 정확한 관계 타입(`belongs_to`, `has_many`, `has_one`, `many_to_many`) 선택.
- **속성 명명 (규칙):** Ash 기본 명명 규칙(`관계명_id`) 사용. 예외 시 `source_attribute`, `destination_attribute` 명시.
- **Null 허용 (규칙):** `belongs_to` 관계 외래 키 필수 시 `allow_nil? false` 명시.
- **무결성 (`attribute_constraints`) (규칙):** 요구사항의 `on_delete`/`on_update` 정책 구현. 명시 없을 시 `on_delete: :nilify, on_update: :update` 기본 적용 또는 소유 관계 시 `on_delete: :delete_all` 고려 후 주석 명시.

```elixir
# relationships 블록 예시
relationships do
  belongs_to :user, MyApp.Accounts.User do
    allow_nil? false # 규칙 (필수 관계)
    attribute_constraints on_delete: :delete_all # 규칙 (소유 관계 시 일반적)
  end

  has_many :comments, MyApp.Blog.Comment

  many_to_many :tags, MyApp.Blog.Tag, through: MyApp.Blog.PostTag
end
```

### 4.4 계산 및 집계 (지침)

- `calculations`, `aggregates` 블록 내 `expr/1` 로 구현.
- `expr` 로직은 단순하게 유지. 복잡 로직은 서비스 계층으로 분리.

### 4.5 리소스 레벨 설정 (`resource do ... end`) (규칙)

- `AshArchival` 사용 시: `base_filter? true` **반드시** 추가 (7.2절 규칙).
- 기타 필요한 설정(예: `plural_name`, `description`) 추가.

## 5. 액션 구현 패턴

### 5.1 액션 타입 및 명명 (규칙)

- 기본 CRUD는 `defaults [...]` 우선 사용.
- 커스텀 액션은 타입과 명확한 동사 기반 이름(예: `create :register`, `update :approve`) 사용.

### 5.2 입력 처리 (`accept`, `argument`) (규칙)

- 모든 예상 입력 파라미터 명시적 정의. 상세 설정 필요 시 `argument` 사용.

### 5.3 유효성 검사 (`validate`) (규칙)

- 요구사항의 모든 유효성 검사 규칙 구현. 내장 검증자 우선 사용.

### 5.4 변경 로직 (`change`) (규칙)

- 내장 변경자(`set_attribute`, `manage_relationship`, `transition_state` 등) 우선 사용.
- 비밀번호 해싱 필요 시, 적절한 해싱 메커니즘(예: Comeonin 또는 Elixir 내장 기능 활용)을 사용하여 구현하거나 관련 서비스 호출.

### 5.5 복잡 로직 (`manual`) (지침)

- DSL로 구현 불가 시 **제한적** 사용. 코드는 간결하게, 상세 주석 필수. 핵심 로직은 별도 함수/모듈 분리 고려.

### 5.6 훅 (`after_action` 등) (지침)

- 요구사항의 부수 효과는 훅과 별도 훅 모듈로 구현.
- **규칙:** 훅 내 시간 소요/실패 가능 작업은 백그라운드(`AshOban`) 처리.

### 5.7 트랜잭션 (`transactional?`) (규칙)

- `create`, `update`, `destroy` 액션은 기본값 `true` 유지.
- 롤백 불가 작업 포함 시, 명시적 요구사항/인간 지침 하에만 `false` 고려.

## 6. 쿼리 및 데이터 로딩 표준

### 6.1 필터링 (`filter`, `expr/1`) (규칙)

- 동적 필터링은 **반드시** `expr/1` 사용.
- 외부 변수 사용 시 **반드시** `^` (pin operator) 사용.

### 6.2 데이터 로딩 (`load`) (★★ 중요 규칙 ★★)

- 쿼리 결과에서 관계/계산/집계 속성 접근 전, **반드시** `Ash.Query.load/2` 로 명시적 로드.
- N+1 방지를 위해 요구사항/코드 컨텍스트 분석하여 필요한 `load` 결정.

### 6.3 페이지네이션 (규칙)

- 목록 조회 시 요구사항 따라 구현. 기본 `Ash.Query.page/2` 사용. 대규모 데이터 시 `Ash.Query.paginate(:keyset)` 고려 (인간 확인).

### 6.4 필드 선택 (`select`) (지침)

- 성능 최적화 요구사항 명시 시에만 사용. 기본은 전체 필드 로드.

## 7. 확장 모듈 사용 규칙

### 7.1 `AshStateMachine` (상태/전이 필요 시)

- `extensions` 추가, `state_machine` 블록 정의, 전이 액션 구현.

### 7.2 `AshArchival` (논리적 삭제 요구 시)

- `extensions` 추가, `resource do base_filter? true end` **반드시** 설정.
- **규칙:** 기본 사용 시 `:archived_at` 직접 정의 금지.

### 7.3 `AshPaperTrail` (변경 이력 요구 시)

- `extensions` 추가, `paper_trail` 블록 설정 (추적 대상, 액터 등).

### 7.4 `AshOban` (비동기 작업 요구 시)

- `extensions` 추가, `oban_job` 블록 설정 (워커, 큐, 트리거, 인자).

### 7.5 `AshCloak` (필드 암호화 요구 시)

- `extensions` 추가, 속성에 `sensitive?: true` 추가, `encrypted_attributes` 블록 설정 (Vault 지정).
- Vault 설정 확인 (필요시 인간 요청).

## 8. 데이터 계층 및 마이그레이션 절차

### 8.1 데이터 계층 (규칙)

- 지정 없을 시 `AshPostgres.DataLayer` 사용.

### 8.2 마이그레이션 생성 (★★ 필수 절차 ★★)

- 리소스 `attributes`/`relationships` 변경 후 **반드시** `mix ash_postgres.generate_migrations` 실행 및 생성 파일 커밋.

### 8.3 마이그레이션 실행 (규칙)

- 개발/테스트 시 `mix ecto.migrate` 실행.
- 릴리스 프로세스에 마이그레이션 실행 포함 확인.

## 9. 도메인 및 API 생성 표준

### 9.1 도메인 정의 (`Ash.Domain`) (규칙)

- 요구사항에 따라 애플리케이션의 논리적 경계(예: 블로그 관리, 사용자 계정)별로 `Ash.Domain` 모듈을 생성하여 리소스를 구성하고 상호작용을 정의하십시오.
- `use Ash.Domain`으로 시작하며, `resources` 블록 내에 해당 도메인에 속한 리소스나 레지스트리를 명시하십시오.
- 필요한 도메인 레벨 인가 정책 등을 설정할 수 있습니다.

```elixir
defmodule MyApp.Blog do # 파일 경로: lib/my_app/blog/blog.ex
  use Ash.Domain

  # Domain 레벨 설정 (필요시)
  # authorization do ... end

  resources do
    # 해당 도메인에 속한 리소스 등록
    resource MyApp.Blog.Post
    resource MyApp.Blog.Comment
    resource MyApp.Blog.Tag
    resource MyApp.Blog.PostTag # ManyToMany 중간 리소스 포함
    # registry MyApp.BlogRegistry # 레지스트리 사용 가능
  end
end
```

### 9.2 JSON:API (`AshJsonApi`) (규칙)

- RESTful API는 JSON:API 표준을 따르는 `AshJsonApi` 사용을 기본으로 함 (별도 요구사항 없을 시).
- Phoenix `router.ex`에서 `AshJsonApi.Router`로 포워딩하고, `domains:` 옵션에 노출할 `Ash.Domain` 모듈 목록을 지정하십시오.
- `accepts ["json-api"]` 플러그 및 인증/인가 플러그를 파이프라인에 설정하십시오.

```elixir
# lib/my_app_web/router.ex
pipeline :api do
  plug :accepts, ["json-api"]
  # plug MyAppWeb.Plugs.ApiAuth
end

scope "/api/v1" do
  pipe_through :api

  forward "/", AshJsonApi.Router,
    # `apis:` 대신 `domains:` 사용 (Ash 3.x)
    domains: [MyApp.Blog, MyApp.Accounts] # 노출할 Domain 모듈 목록
end
```

## 10. Phoenix 통합 패턴

### 10.1 폼 (`AshPhoenix.Form`) (권장)

- 리소스 기반 웹 폼에 우선 사용.

### 10.2 LiveView (`AshPhoenix.LiveView`) (권장)

- LiveView에서 Ash 데이터 사용 시 헬퍼 우선 사용 (`stream!`, `load` 등 함수 이름 변경 가능성 유의).

### 10.3 컨트롤러 (규칙)

- 이제 `Ash.Domain` 모듈을 통해 액션을 실행합니다 (예: `MyApp.Blog.create(Post, params)`). 또는 리소스 모듈의 액션을 직접 호출할 수도 있습니다 (`MyApp.Blog.Post.create(params)`).
- `{:ok, ...}` / `{:error, ...}` 결과 명시적 처리.

```elixir
# Controller 예시 (Domain 모듈 사용)
def create(conn, %{"post" => post_params}) do
  # actor/tenant 설정 가능
  # conn = Ash.Plug.set_context(conn, %{actor: conn.assigns.current_user})

  # Domain 모듈을 통해 액션 실행
  case MyApp.Blog.create(Post, post_params, context: conn.assigns.context) do
    {:ok, post} ->
      # 성공 처리
    {:error, changeset} ->
      # 실패 처리 (폼 다시 렌더링 등)
  end
end
```

## 11. 테스팅 절차 및 템플릿

### 11.1 테스트 유형 (규칙)

- Resource, Data Layer, Integration 테스트 **반드시** 생성.
- 요구된 커버리지 충족.

### 11.2 리소스 테스트 (DataCase) (템플릿 준수)

```elixir
defmodule MyApp.DomainName.MyResourceTest do
  use MyApp.DataCase # 프로젝트의 DataCase 사용

  alias MyApp.DomainName.MyResource
  alias MyApp.DomainName # Domain 모듈 alias

  setup do
    # 필요한 초기 데이터 생성
    :ok
  end

  describe "Basic CRUD" do
    test "create resource with valid attributes" do
      attrs = %{field1: "value1"}

      # Domain 모듈 통해 액션 실행 (선호) 또는 리소스 모듈 직접 사용
      assert {:ok, resource} = DomainName.create(MyResource, attrs)
      # 또는 assert {:ok, resource} = MyResource.create(attrs)

      # 검증
      assert resource.id != nil
      assert resource.field1 == "value1"
    end

    test "create resource fails with invalid attributes" do
      attrs = %{field1: nil} # 필수 필드 누락

      assert {:error, changeset} = DomainName.create(MyResource, attrs)
      # 또는 assert {:error, changeset} = MyResource.create(attrs)

      # 에러 내용 검증
      assert errors_on(changeset).field1 != nil
    end
    # ... read, update, destroy 테스트 ...
  end

  # ... describe 블록 (Custom Actions, Validations 등) ...
end
```

### 11.3 데이터 계층 테스트 초점

- 트랜잭션 롤백, DB 제약 조건, `on_delete` 동작 검증.

### 11.4 통합 테스트 초점

- API 엔드포인트(Request/Response 검증, Auth 포함), 주요 사용자 플로우 검증.
- 실제 DB 상태 변화 확인.

## 12. 성능 고려사항

다음 성능 규칙을 코드 생성 시 기본적으로 고려해야 합니다.

- **규칙:** N+1 방지를 위해 `Ash.Query.load/2`를 적극적으로 사용하십시오.
- **규칙:** 시간이 오래 걸리는 작업은 `AshOban` 등을 이용해 백그라운드로 처리하십시오.
- **지침:** 대량 데이터 처리가 필요한 경우 배치(chunking) 처리를 구현하십시오.
- **지침:** 쿼리 성능 확보를 위해 필요한 DB 인덱스를 생성하고 확인하십시오 (마이그레이션 절차 참조).

## 13. 코드 템플릿 참조

이 문서의 다음 섹션에서 제시된 기본 구조 및 템플릿을 참조하여 코드를 생성하십시오.

- 리소스 기본 구조: 4.1절
- 리소스 테스트 기본 구조: 11.2절
- 도메인 모듈 기본 구조: 9.1절

## 14. 참조 문서 링크

본 가이드에서 다루지 않거나 해석이 모호한 경우 다음 공식 문서를 참조하되, **본 가이드의 규칙 및 패턴을 우선 적용**하십시오.

- **ash**: https://hexdocs.pm/ash/
- **ash_phoenix**: https://hexdocs.pm/ash_phoenix/
- **ash_json_api**: https://hexdocs.pm/ash_json_api/
- **ash_postgres**: https://hexdocs.pm/ash_postgres/
- **ash_state_machine**: https://hexdocs.pm/ash_state_machine/
- **ash_oban**: https://hexdocs.pm/ash_oban/
- **ash_paper_trail**: https://hexdocs.pm/ash_papertrail/ (Ash 통합)
- **ash_archival**: https://hexdocs.pm/ash_archival/
- **ash_cloak**: https://hexdocs.pm/ash_cloak/
- **ash_money**: https://hexdocs.pm/ash_money/
- **ash_double_entry**: https://hexdocs.pm/ash_double_entry/
- **ash_csv**: https://hexdocs.pm/ash_csv/
