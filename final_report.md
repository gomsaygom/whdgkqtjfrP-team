## 1. 프로젝트 개요

### 1.1 배경 및 목적

학과 기자재 대여 관리 업무는 기존에 수기로 진행되어 관리 효율이 낮고 연체 및 분실 사고가 빈번하게 발생하였다. 이를 해결하기 위해 QR 코드 기반의 스마트 기자재 대여 관리 앱을 개발하여 대여·반납 프로세스를 자동화하고 관리자의 업무 부담을 줄이고자 하였다.

### 1.2 프로젝트 목표

- QR 코드를 활용한 기자재 대여 및 반납 프로세스 자동화
- 관리자 대시보드를 통한 실시간 재고 및 대여 현황 파악
- 연체 자동 감지 및 패널티 부과 시스템 구현
- FCM 푸시 알림을 통한 실시간 사용자 알림 서비스 제공
- 예약 대기 기능을 통한 기자재 활용도 향상
- 클라우드 배포를 통한 24시간 서비스 운영

---

## 2. 팀 구성 및 역할

| 이름 | 역할 | 담당 업무 |
|------|------|-----------|
| 김민석 | 백엔드2 | CRUD API, QR 생성 API, API 문서화, 서버 최적화 |
| 윤동훈 | 백엔드1 | MongoDB 스키마 설계, JWT 인증, FCM 알림 서버 |
| 안효진 | 프론트2 | UI 컴포넌트, 기자재 화면, QR 스캔, API 연동, 예약 대기 |
| 정건우 | 프론트1 | Figma 와이어프레임, 관리자 대시보드 UI, UI 개선 |

---

## 3. 기술 스택

### 3.1 프론트엔드

| 기술 / 라이브러리 | 버전 | 용도 |
|---|---|---|
| React Native | 0.76 | 모바일 앱 프레임워크 |
| Expo | SDK 54 | 개발 도구 & 빌드 |
| EAS Build | - | Android APK 빌드 |
| Axios | - | HTTP API 통신 |
| AsyncStorage | - | JWT 토큰 로컬 저장 |
| expo-camera | - | QR 코드 스캔 |
| expo-notifications | - | FCM 푸시 알림 수신 |
| expo-image-picker | - | 반납 사진 촬영 & 업로드 |
| react-navigation | - | 화면 네비게이션 |

### 3.2 백엔드

| 기술 / 라이브러리 | 버전 | 용도 |
|---|---|---|
| Node.js | 18 | 서버 런타임 |
| Express | - | REST API 프레임워크 |
| Mongoose | - | MongoDB ODM |
| jsonwebtoken | - | 사용자 인증 토큰 |
| bcryptjs | - | 비밀번호 해시 암호화 |
| Multer | - | 파일 업로드 처리 |
| node-cron | - | 자동화 스케줄러 |
| qrcode | - | QR 코드 자동 생성 |
| firebase-admin | - | FCM 서버 알림 발송 |
| @sendgrid/mail | - | 이메일 인증번호 발송 |

### 3.3 외부 서비스

| 서비스 | 용도 | 요금제 |
|---|---|---|
| Railway | 백엔드 클라우드 배포 | 무료 |
| MongoDB Atlas | 클라우드 DB (M0) | 무료 |
| Firebase FCM | 푸시 알림 서비스 | 무료 |
| SendGrid | 이메일 발송 (100통/일) | 무료 |
| Expo EAS | APK 빌드 서비스 | 무료 |
| GitHub | 소스코드 버전 관리 | 무료 |

---

## 4. 시스템 아키텍처

```
[Android APK]
     ↓ HTTPS
[Railway 서버 (Node.js + Express)]
     ↓              ↓
[MongoDB Atlas]  [Firebase FCM]
                     ↓
              [사용자 기기 알림]
```

**서버 URL**: https://equipment-rental-app-production.up.railway.app

---

## 5. 데이터베이스 설계

총 10개의 컬렉션으로 구성하였다.

| 컬렉션 | 설명 |
|--------|------|
| users | 학생 사용자 정보 (학번, 이름, 이메일, 패널티, FCM 토큰) |
| admins | 관리자 계정 정보 (ID, 비밀번호, FCM 토큰) |
| categories | 기자재 카테고리 (이름, 최대 대여 기간, 아이콘 색상) |
| equipment | 기자재 정보 (모델명, 시리얼, QR 코드, 상태) |
| rentals | 대여/반납 이력 (사용자, 기자재, 기간, 상태) |
| penalties | 패널티 부과/감면 이력 |
| emailverifications | 이메일 인증번호 (TTL 5분 자동 만료) |
| statushistories | 기자재 상태 변경 이력 |
| damagereports | 고장/파손 신고 내역 |
| waitlists | 예약 대기 신청 내역 |

---

## 6. 주요 기능

### 6.1 회원가입 및 로그인
- 이메일 인증 기반 3단계 회원가입 (이메일 → 인증번호 → 정보 입력)
- SendGrid를 통한 인증번호 이메일 발송
- JWT 기반 학생/관리자 분리 인증
- 패널티 누적 시 대여 자동 정지

### 6.2 QR 코드 기반 대여
- 기자재 등록 시 QR 코드 자동 생성 (Base64 Data URL)
- 카메라로 QR 스캔 → 기자재 조회 → 대여 기간 입력 → 대여 완료
- 대여 상태 실시간 반영

### 6.3 반납 및 연장
- 반납 시 기자재 상태 사진 촬영 필수
- 관리자 반납 사진 확인 기능
- 연장 신청 → 관리자 승인/거절 워크플로우
- 연장 신청 시 관리자 FCM 알림 자동 발송

### 6.4 예약 대기
- 대여 중인 기자재에 예약 대기 신청
- 현재 대기 인원 및 내 순번 표시
- 반납 완료 시 대기자에게 FCM 알림 자동 발송
- 중복 신청 방지 및 취소 기능
- 패널티 정지 사용자 신청 불가

### 6.5 관리자 대시보드
- 실시간 대여 현황 통계 (가용/대여중/수리중/연체)
- useFocusEffect로 탭 이동 시 자동 갱신
- 기자재 및 카테고리 CRUD 관리
- 강제 반납 처리 (Modal + TextInput 방식)
- 패널티 부과 및 감면

### 6.6 고장/파손 신고
- 사용자 고장 신고 (사진 첨부)
- 관리자 처리 현황 관리 (접수 → 수리중 → 완료)

### 6.7 FCM 푸시 알림
- 로그인 시 FCM 토큰 자동 등록
- 패널티 부과/감면 즉시 알림
- 연장 신청 시 관리자 알림
- 연장 승인 시 학생 알림
- 예약 대기 기자재 반납 시 대기자 알림

### 6.8 자동화 스케줄러 (Cron)
- **매일 자정**: 연체 자동 감지 → 패널티 자동 부과 → 대여 정지 처리
- **매일 오전 9시**: D-3, D-1 반납 예정 알림 자동 발송

---

## 7. 개발 과정 및 이슈 해결

### 7.1 주요 이슈

| 이슈 | 원인 | 해결 방법 |
|------|------|-----------|
| Railway SMTP 포트 차단 | 무료 플랜 465포트 차단 | Gmail → SendGrid로 전환 |
| APK 빌드 실패 | expo-barcode-scanner 호환성 | expo-camera로 대체 |
| Firebase FCM 초기화 실패 | 서비스 계정 키 파일 미배포 | 환경변수(FIREBASE_SERVICE_ACCOUNT)로 대체 |
| FCM JWT Signature 오류 | 서비스 계정 키 만료 | Firebase 콘솔에서 새 키 재발급 |
| 강제반납 미작동 | Alert.prompt iOS 전용 | Modal + TextInput 방식으로 교체 |
| 대시보드 실시간 미반영 | useEffect 미갱신 | useFocusEffect로 교체 |
| node_modules Git 충돌 | .gitignore 미설정 | .gitignore 재설정 후 해결 |

### 7.2 기술적 성과
- Railway 클라우드 배포로 24시간 서비스 운영 달성
- Firebase Admin SDK + 환경변수 방식으로 보안 강화
- EAS Build로 실제 배포 가능한 Android APK 생성 성공
- SendGrid 무료 플랜으로 이메일 인증 서비스 구현

---

## 8. 배포 현황

| 항목 | 내용 |
|------|------|
| 백엔드 서버 | Railway (https://equipment-rental-app-production.up.railway.app) |
| 데이터베이스 | MongoDB Atlas (클라우드) |
| Android APK | EAS Build (Expo) |
| FCM | Firebase Admin SDK |
| 이메일 | SendGrid |

---

## 9. 결론

본 프로젝트를 통해 React Native, Node.js, MongoDB를 활용한 풀스택 모바일 앱 개발 역량을 키울 수 있었다. QR 코드 기반 대여 시스템, FCM 푸시 알림, 크론 스케줄러, 예약 대기 기능 등 실무에서 사용되는 기술을 직접 구현하고 클라우드 배포까지 완료하여 실제 서비스 가능한 수준의 앱을 개발하였다. 개발 과정에서 발생한 다양한 이슈를 팀원들과 협력하여 해결하며 실질적인 문제 해결 능력을 향상시킬 수 있었다.
flowchart LR
  %% Actors
  Student([학생])
  Admin([관리자])
  FCM([FCM/메일 서비스])
  Cron([Cron 스케줄러])

  %% System
  subgraph System[기자재 대여 관리 시스템]
    UC1([회원가입/로그인])
    UC2([이메일 인증])
    UC3([기자재 조회])
    UC4([QR 코드 스캔])
    UC5([대여 신청])
    UC6([반납 처리])
    UC7([반납 사진 업로드])
    UC8([연장 신청])
    UC9([예약 대기 신청/취소])
    UC10([대여/재고 현황 조회])
    UC11([기자재/카테고리 CRUD])
    UC12([패널티 부과/감면])
    UC13([고장/파손 신고 처리])
    UC14([푸시 알림 발송])
    UC15([연체 자동 감지])
    UC16([반납 예정 알림])
  end

  %% Student interactions
  Student --> UC1
  Student --> UC3
  Student --> UC4
  Student --> UC5
  Student --> UC6
  Student --> UC7
  Student --> UC8
  Student --> UC9
  Student --> UC10

  %% Admin interactions
  Admin --> UC10
  Admin --> UC11
  Admin --> UC12
  Admin --> UC13
  Admin --> UC6
  Admin --> UC8

  %% External services / system triggers
  UC2 <---> FCM
  UC14 <---> FCM
  Cron --> UC15
  Cron --> UC16
  UC15 --> UC12
  UC16 --> UC14
  UC8 --> UC14
  UC9 --> UC14

