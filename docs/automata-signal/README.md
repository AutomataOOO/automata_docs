# [APP-001] Automata-Signal

| 버전 | 날짜       | 변경 내용      |
| ---- | ---------- | -------------- |
| 1.0  | 2025-04-02 | 최초 문서 작성 |

## 개요

Automata-Signal은 확장성 있는 멀티채널 메시징 플랫폼으로, 다양한 메시징 채널을 통합하여 사용자 참여를 증대시키고 효과적인 메시지 전달을 가능하게 합니다. 글로벌 규모의 고성능 메시징 서비스를 제공하기 위해 설계되었습니다.

### 지원 채널

- **푸시 알림** (iOS, Android) - 현재 지원
- **이메일** - 지원 예정
- **SMS** - 지원 예정
- **카카오 알림톡** - 지원 예정
- **인앱 메시지** - 지원 예정

### 주요 특징

- 멀티채널 통합 메시징
- 메시지 상태 추적 (발송→도달→오픈)
- 대량 메시지 캠페인 및 스케줄링
- 사용자 및 채널별 구독 관리
- 템플릿 기반 개인화 메시지
- 분산 아키텍처 기반 고성능 처리
- 통합 SDK 제공

## 기술 스택

- **백엔드**: Elixir, Phoenix, Ash Framework
- **데이터베이스**: PostgreSQL
- **작업 큐**: Oban(ash_oban)
- **푸시 서비스**: Pigeon(APNS/FCM)
- **클라이언트**: Flutter
- **배포**: fly.io(글로벌 분산 배포)

## 문서 가이드

### 개발자 가이드

- [[GUIDE-001] 시작하기 가이드](1-guides/GUIDE-001-getting-started.md) - 프로젝트 설정 및 초기화 과정
- [[GUIDE-002] 개발 워크플로우](1-guides/GUIDE-002-development-workflow.md) - 개발, 테스트, 배포 과정 설명
- [[GUIDE-003] 코딩 표준 가이드](1-guides/GUIDE-003-coding-standards.md) - 개발 표준 및 코딩 규칙

### 시스템 설계

- [[DESIGN-001] 아키텍처 개요](2-designs/DESIGN-001-architecture-overview.md) - 시스템 아키텍처 전체 개요
- [[DESIGN-002] 시스템 아키텍처](2-designs/DESIGN-002-system-architecture.md) - 상세 시스템 아키텍처
- [[DESIGN-003] 데이터 모델](2-designs/DESIGN-003-data-model.md) - 데이터베이스 모델 및 스키마
- [[DESIGN-004] 배포 구조](2-designs/DESIGN-004-deployment.md) - 분산 배포 구조

### 컴포넌트

- [[COMP-001] 템플릿 엔진](3-components/COMP-001-template-engine.md) - 템플릿 엔진 설계 및 구현
- [[COMP-002] 어댑터 시스템](3-components/COMP-002-adapters.md) - 채널 어댑터 시스템
- [[COMP-003] 메시징 시스템](3-components/COMP-003-messaging.md) - 멀티채널 메시징 시스템

### 시퀀스

- [[SEQ-001] 초기화 시퀀스](4-sequences/SEQ-001-initialization.md) - SDK 초기화 및 사용자 식별
- [[SEQ-002] 메시지 처리 시퀀스](4-sequences/SEQ-002-message-processing.md) - 메시지 전송 및 처리 과정
- [[SEQ-003] 라이프사이클 시퀀스](4-sequences/SEQ-003-lifecycle.md) - 메시지 상태 전이 흐름
- [[SEQ-004] 캠페인 관리 시퀀스](4-sequences/SEQ-004-campaign-management.md) - 캠페인 생성 및 처리 흐름

### 참조 자료

- [[REF-001] API 참조](5-references/REF-001-api.md) - API 명세 및 사용법
- [[REF-002] 상태 코드](5-references/REF-002-status-codes.md) - 구독 및 메시지 상태 코드
- [[REF-003] 오류 코드](5-references/REF-003-error-codes.md) - 채널별 오류 코드 사전
- [[REF-004] 용어집](5-references/REF-004-glossary.md) - 핵심 용어 정의

### 프로젝트 계획

- [[PLAN-001] 요구사항](6-planning/PLAN-001-requirements.md) - 시스템 기능 및 비기능 요구사항
- [[PLAN-002] 로드맵](6-planning/PLAN-002-roadmap.md) - 개발 일정 및 마일스톤
- [[PLAN-003] 이슈 추적](6-planning/PLAN-003-issues.md) - 현재 이슈 및 버그 목록
