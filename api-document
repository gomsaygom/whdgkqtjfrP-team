# API 명세서

## Base URL
- 기본 경로: `/api`
- 인증 방식: `Authorization: Bearer <JWT>`
- 파일 업로드: `multipart/form-data`

## 인증/Auth (`/api/auth`)
라우터: `app/backend/routes/auth.js`

### 1) 이메일 인증번호 발송
- **POST** `/api/auth/send-code`
- **Body**: `{ email }`
- **응답**: `{ message }`

### 2) 이메일 인증번호 확인
- **POST** `/api/auth/verify-code`
- **Body**: `{ email, code }`
- **응답**: `{ message }`

### 3) 회원가입
- **POST** `/api/auth/register`
- **Body**: `{ studentId, name, email, password, phone }`
- **응답**: `{ token, user }`

### 4) 로그인
- **POST** `/api/auth/login`
- **Body**: `{ studentId, password, fcmToken? }`
- **응답**: `{ token, user }`

### 5) 관리자 로그인
- **POST** `/api/auth/admin/login`
- **Body**: `{ adminId, password }`
- **응답**: `{ token, admin }`

### 6) 내 정보 조회
- **GET** `/api/auth/me`
- **Auth**: 필요

### 7) FCM 토큰 업데이트
- **PUT** `/api/auth/fcm-token`
- **Auth**: 필요
- **Body**: `{ fcmToken }`
- **응답**: `{ message }`

---

## 카테고리/Categories (`/api/categories`)
라우터: `app/backend/routes/index.js` (catRouter)

### 1) 목록 조회
- **GET** `/api/categories`
- **Auth**: 필요

### 2) 생성
- **POST** `/api/categories`
- **Auth**: 관리자 필요
- **Body**: `{ name, maxRentalDays, ... }`

### 3) 수정
- **PUT** `/api/categories/:id`
- **Auth**: 관리자 필요
- **Body**: 업데이트할 필드

### 4) 삭제
- **DELETE** `/api/categories/:id`
- **Auth**: 관리자 필요

---

## 기자재/Equipment (`/api/equipment`)
라우터: `app/backend/routes/index.js` (eqRouter)

### 1) 목록 조회
- **GET** `/api/equipment`
- **Auth**: 필요
- **Query**: `search`, `category`, `status`

### 2) 상세 조회
- **GET** `/api/equipment/:id`
- **Auth**: 필요

### 3) 등록
- **POST** `/api/equipment`
- **Auth**: 관리자 필요
- **Body**: `multipart/form-data`
  - `images` (최대 3장)
  - 기타 기자재 필드
- **응답**: 기자재 객체 + `qrCodeUrl`

### 4) 수정
- **PUT** `/api/equipment/:id`
- **Auth**: 관리자 필요
- **Body**: 업데이트 필드
- **특이사항**: 상태 변경 시 이력 기록

### 5) QR 코드 조회
- **GET** `/api/equipment/:id/qr`
- **Auth**: 필요
- **응답**: `{ qrCodeUrl }`

### 6) 삭제
- **DELETE** `/api/equipment/:id`
- **Auth**: 관리자 필요

---

## 대여/Rentals (`/api/rentals`)
라우터: `app/backend/routes/index.js` (rentRouter)

### 1) 내 대여 목록
- **GET** `/api/rentals/my`
- **Auth**: 필요

### 2) 전체 대여 목록 (관리자)
- **GET** `/api/rentals`
- **Auth**: 관리자 필요
- **Query**: `status`

### 3) 대여 신청
- **POST** `/api/rentals`
- **Auth**: 필요
- **Body**: `{ equipmentId, dueDate, purpose }`

### 4) 반납
- **PUT** `/api/rentals/:id/return`
- **Auth**: 필요
- **Body**: `multipart/form-data`
  - `photo` (선택)

### 5) 반납 연장 신청/승인
- **PUT** `/api/rentals/:id/extend`
- **Auth**: 필요
- **Body**: `{ newDueDate, approved? }`
  - `approved=true` + 관리자면 승인 처리

### 6) 강제 반납 (관리자)
- **PUT** `/api/rentals/:id/force-return`
- **Auth**: 관리자 필요
- **Body**: `{ reason }`

---

## 관리자/Admin (`/api/admin`)
라우터: `app/backend/routes/index.js` (adminRouter)

### 1) 통계 조회
- **GET** `/api/admin/stats`
- **Auth**: 관리자 필요
- **응답**: `{ total, available, rented, repairing, overdue, todayReturns }`

### 2) 연체 목록
- **GET** `/api/admin/overdue`
- **Auth**: 관리자 필요

### 3) 오늘 반납 예정
- **GET** `/api/admin/due-today`
- **Auth**: 관리자 필요

### 4) 사용자 목록
- **GET** `/api/admin/users`
- **Auth**: 관리자 필요

### 5) 패널티 부과
- **POST** `/api/admin/penalty`
- **Auth**: 관리자 필요
- **Body**: `{ userId, score, reason, rentalId }`

### 6) 패널티 감면
- **PUT** `/api/admin/penalty/:userId/reduce`
- **Auth**: 관리자 필요
- **Body**: `{ score, reason }`

---

## 신고/Reports (`/api/reports`)
라우터: `app/backend/routes/index.js` (reportRouter)

### 1) 파손 신고
- **POST** `/api/reports/damage`
- **Auth**: 필요
- **Body**: `multipart/form-data`
  - `photo` (선택)
  - `equipmentId`, `description`, `rentalId`

### 2) 파손 신고 목록 (관리자)
- **GET** `/api/reports/damage`
- **Auth**: 관리자 필요

### 3) 파손 신고 처리 (관리자)
- **PUT** `/api/reports/damage/:id`
- **Auth**: 관리자 필요
- **Body**: 업데이트 필드

---

## 기타
### 헬스체크
- **GET** `/api/health`
- **응답**: `{ status: "ok", time: ... }`
