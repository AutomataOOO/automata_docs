# Automata-Signal

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

## 문서 가이드

### 아키텍처 문서

- [아키텍처 개요](architectures/overview.md) - 시스템 아키텍처 전체 개요
- [시스템 아키텍처](architectures/system-architecture.md) - 상세 시스템 아키텍처
- [Elixir 노드 아키텍처](architectures/elixir-node-architecture.md) - Elixir 노드 내부 구조
- [데이터 모델](architectures/data-model.md) - 데이터베이스 모델 및 스키마
- [SDK 아키텍처](architectures/sdk-architecture.md) - SDK 설계 및 구조
- [배포 아키텍처](architectures/deployment-architecture.md) - 분산 배포 구조

### 사전 및 정의

- [구독 상태 코드](dictionaries/subscription-states.md) - 구독 상태 정의 및 코드
- [오류 코드](dictionaries/error-codes.md) - 채널별 오류 코드 사전
- [메시지 상태](dictionaries/message-states.md) - 메시지 상태 및 라이프사이클
- [용어집](dictionaries/glossary.md) - 핵심 용어 정의

### 워크플로우

- [SDK 초기화 흐름](flows/sdk-initialization-flow.md) - SDK 초기화 및 사용자 식별
- [메시지 처리 흐름](flows/message-processing-flow.md) - 메시지 전송 및 처리 과정
- [메시지 라이프사이클](flows/message-lifecycle.md) - 메시지 상태 전이 흐름
- [캠페인 관리 흐름](flows/campaign-flow.md) - 캠페인 생성 및 처리 흐름

### 핵심 컴포넌트

- [템플릿 엔진](components/template-engine.md) - 템플릿 엔진 설계 및 구현
- [채널 어댑터](components/channel-adapters.md) - 채널 어댑터 시스템
- [멀티채널 메시징](components/multichannel-messaging.md) - 멀티채널 메시징 시스템

### 구현 가이드

- [코딩 가이드라인](coding-guidelines.md) - 개발 표준 및 가이드
- [성능 요구사항](implementation/performance-requirements.md) - 성능 및 부하 요구사항
- [모니터링 전략](implementation/monitoring-strategy.md) - 모니터링 및 운영 전략
- [기술 스택](implementation/tech-stack.md) - 사용 기술 및 라이브러리

## 시작하기

- [요구사항](requirements.md) - 시스템 기능 및 비기능 요구사항
- [로드맵](roadmap.md) - 개발 일정 및 마일스톤

## 기술 스택

- **백엔드**: Elixir, Phoenix, Ash Framework
- **데이터베이스**: PostgreSQL
- **작업 큐**: Oban(ash_oban)
- **푸시 서비스**: Pigeon(APNS/FCM)
- **클라이언트**: Flutter
- **배포**: fly.io(글로벌 분산 배포)
