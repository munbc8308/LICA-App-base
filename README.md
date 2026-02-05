# LICA-App-base

React Native CLI 기반의 WebView 앱 템플릿 프로젝트입니다. URL과 랜딩 화면만 설정하면 다양한 서비스 앱으로 배포할 수 있습니다.

## Project Overview

LICA-App-base는 React Native CLI 기반의 WebView 앱 템플릿 프로젝트다. URL과 랜딩 화면만 설정하면 다양한 서비스 앱으로 배포할 수 있는 기본 셋을 목표로 한다.

## 핵심 컨셉

- **플랫폼:** React Native CLI (Android + iOS 동시 빌드)
- **앱 구조:** 스플래시/랜딩 화면 + WebView 화면
- **템플릿 방식:** 서비스별로 URL, 앱명, 아이콘만 교체하면 별도 앱으로 배포 가능

## 기술 스택

- React Native 0.83.1
- TypeScript
- react-native-webview

### 주요 라이브러리
| 라이브러리 | 용도 |
|-----------|------|
| `react-native-webview` | WebView 컴포넌트 |
| `@react-native-firebase/messaging` | 푸시 알림 (FCM) |
| `react-native-biometrics` | 생체 인증 |
| `react-native-image-picker` | 카메라/갤러리 |
| `react-native-geolocation-service` | 위치 정보 |
| `react-native-calendar-events` | 캘린더 연동 |
| `react-native-contacts` | 연락처 접근 |
| `react-native-vision-camera` | 카메라 제어 |
| `react-native-camera-kit` | QR/바코드 스캔 |
| `@react-native-community/netinfo` | 네트워크 상태 |
| `react-native-version-check` | 앱 버전 체크 |
| `react-native-share` | 네이티브 공유 |
| `react-native-fs` | 파일 다운로드 |

## 개발 명령어

```bash
# 의존성 설치
npm install
cd ios && pod install && cd ..

# 개발 서버 실행
npm start

# iOS 빌드 및 실행
npm run ios

# Android 빌드 및 실행
npm run android

# 타입 체크
npx tsc --noEmit

# 린트
npm run lint
```

## 프로젝트 구조

```
src/
├── components/       # 재사용 컴포넌트 (OfflineScreen, ErrorScreen)
├── screens/          # 화면 컴포넌트 (SplashScreen, WebViewScreen)
├── services/         # 비즈니스 로직 (BridgeHandler)
├── hooks/            # 커스텀 훅 (useNetworkStatus)
├── config/           # 앱 설정 (app.config.ts)
├── types/            # TypeScript 타입 정의
└── utils/            # 유틸리티 함수
```

## 설정 파일

`src/config/app.config.ts`에서 서비스별 설정 관리:

```typescript
export default {
  appName: '서비스명',
  bundleId: 'com.company.servicename',
  webview: {
    baseUrl: 'https://service.example.com',
    allowedDomains: ['service.example.com'],
  },
  splash: {
    backgroundColor: '#FFFFFF',
    logoPath: require('../../assets/logo.png'),
  },
  push: {
    fcmSenderId: '123456789',
  },
  version: '1.0.0',

  // 기능 활성화 설정
  features: {
    qrScanner: true,           // QR/바코드 스캔
    networkInfo: true,         // 네트워크 상태 상세 정보
    versionCheck: true,        // 앱 버전 체크
    screenshotProtection: false, // 스크린샷 방지
    contacts: true,            // 연락처 접근
    cameraControl: true,       // 카메라 제어
    calendar: true,            // 캘린더 연동
    biometric: true,           // 생체 인증
    location: true,            // 위치 정보
  },

  // 앱스토어 ID (버전 체크용)
  storeIds: {
    ios: '',      // App Store ID
    android: '',  // 패키지명
  },
}
```

## 웹↔앱 인증 시스템

### 앱 검증 (웹에서 앱 확인)
웹페이지가 정상적인 앱에서 열렸는지 확인하는 방식:

| 방식 | 설명 |
|------|------|
| App Signature | 앱 서명 해시값을 웹에 전달, 서버에서 검증 |
| User-Agent 커스텀 | 앱 전용 UA 문자열 추가 (예: `LICA-App/1.0.0`) |
| 초기화 토큰 | 앱 시작 시 서버에서 세션 토큰 발급 → WebView에 주입 |

### 세션 동기화 흐름

```
[앱 시작]
    ↓
[서버에서 앱 인증 토큰 발급] ← 앱 서명 검증
    ↓
[WebView URL에 토큰 포함 or 쿠키/헤더 주입]
    ↓
[웹에서 토큰 검증 → 세션 생성]
    ↓
[로그인/로그아웃 시 앱에 postMessage로 알림]
    ↓
[앱에서 토큰 갱신/삭제]
```

### 보안 고려사항
- HTTPS 필수: 모든 통신 암호화
- 토큰 만료: 세션 토큰에 TTL 설정
- 도메인 화이트리스트: 허용된 도메인만 브릿지 API 접근 가능
- 앱 무결성 검증: 루팅/탈옥 기기 감지 옵션

## 웹↔앱 브릿지 API

웹에서 `window.sendToApp(type, payload)` 호출 → 앱에서 처리 → `nativeMessage` 이벤트로 응답

### 앱 인증 (app)
| 기능 | 용도 |
|------|------|
| `app.getSignature` | 앱 서명 해시 반환 (무결성 검증) |
| `app.getSessionToken` | 현재 세션 토큰 반환 |
| `app.refreshToken` | 토큰 갱신 요청 |
| `app.validateOrigin` | 요청 출처 검증 |

### 사용자 인증 (auth)
| 기능 | 용도 |
|------|------|
| `auth.login` | 로그인 토큰 저장 |
| `auth.logout` | 토큰 삭제, 로그아웃 처리 |
| `auth.getToken` | 저장된 토큰 반환 |
| `auth.biometric` | 생체 인증 (지문/Face ID) |

### 스토리지 (storage)
| 기능 | 용도 |
|------|------|
| `storage.set` | key-value 저장 (AsyncStorage) |
| `storage.get` | 값 조회 |
| `storage.remove` | 값 삭제 |

### 디바이스 (device)
| 기능 | 용도 |
|------|------|
| `device.getInfo` | 디바이스 정보 (OS, 버전, 모델) |
| `device.getPushToken` | 푸시 토큰 반환 |
| `device.getLocation` | 현재 위치 정보 |

### 미디어 (media)
| 기능 | 용도 |
|------|------|
| `media.camera` | 카메라 촬영 |
| `media.gallery` | 갤러리에서 이미지 선택 |
| `media.download` | 파일 다운로드 |
| `media.upload` | 파일 업로드 |

### UI/UX (ui)
| 기능 | 용도 |
|------|------|
| `ui.haptic` | 햅틱 피드백 |
| `ui.share` | 네이티브 공유 시트 |
| `ui.openExternal` | 외부 브라우저로 열기 |

### 네비게이션 (nav)
| 기능 | 용도 |
|------|------|
| `nav.back` | 앱 뒤로가기 |
| `nav.exit` | 앱 종료 |

### 캘린더 (calendar)
| 기능 | 용도 |
|------|------|
| `calendar.requestPermission` | 캘린더 접근 권한 요청 |
| `calendar.addEvent` | 네이티브 캘린더에 일정 추가 |
| `calendar.getEvents` | 기간 내 일정 조회 |
| `calendar.deleteEvent` | 일정 삭제 |

### QR코드/바코드 스캔 (scanner)
| 기능 | 용도 |
|------|------|
| `scanner.requestPermission` | 카메라 권한 요청 |
| `scanner.scan` | QR/바코드 스캔 모드 진입 |

### 네트워크 상태 (network)
| 기능 | 용도 |
|------|------|
| `network.getStatus` | 네트워크 연결 상태 (연결 여부, WiFi/셀룰러) |
| `network.getDetails` | 상세 정보 (SSID, IP, 신호 강도, 통신사 등) |

### 앱 버전 체크 (version)
| 기능 | 용도 |
|------|------|
| `version.check` | 스토어 최신 버전 확인 |
| `version.openStore` | 앱스토어/플레이스토어 열기 |

### 보안 (security)
| 기능 | 용도 |
|------|------|
| `security.enableScreenshotProtection` | 스크린샷/화면 녹화 방지 활성화 |
| `security.disableScreenshotProtection` | 스크린샷 방지 비활성화 |

### 연락처 (contacts)
| 기능 | 용도 |
|------|------|
| `contacts.requestPermission` | 연락처 접근 권한 요청 |
| `contacts.getAll` | 전체 연락처 조회 |
| `contacts.getByName` | 이름으로 연락처 검색 |

### 카메라 제어 (camera)
| 기능 | 용도 |
|------|------|
| `camera.open` | 카메라 열기 (설정 포함) |
| `camera.setFlash` | 플래시 모드 설정 (on/off/auto) |
| `camera.setZoom` | 줌 레벨 설정 (0.0~1.0) |
| `camera.switchCamera` | 전면/후면 카메라 전환 |

## 웹에서 브릿지 사용 예시

```javascript
// 앱 준비 완료 감지
window.addEventListener('nativeAppReady', () => {
  console.log('앱 준비 완료');
});

// 앱으로 메시지 전송 (requestId는 선택사항)
window.sendToApp('device.getInfo', {});
window.sendToApp('device.getInfo', {}, 'my-request-123'); // requestId 지정

// 앱에서 응답 수신
window.addEventListener('nativeMessage', (event) => {
  const { success, data, error, requestId } = event.detail;
  console.log('응답:', data);
});
```

### 주요 API 사용 예시

```javascript
// 캘린더에 일정 추가
window.sendToApp('calendar.addEvent', {
  title: '회의',
  startDate: '2024-12-25T10:00:00.000Z',
  endDate: '2024-12-25T11:00:00.000Z',
  location: '회의실 A',
  notes: '프로젝트 진행 회의',
  alarms: [{ relativeOffset: -30 }] // 30분 전 알림
});

// 네트워크 상태 확인
window.sendToApp('network.getStatus', {});
// → { isConnected: true, type: 'wifi' }

window.sendToApp('network.getDetails', {});
// → { isConnected: true, type: 'wifi', details: { ssid: 'MyWifi', ipAddress: '192.168.1.10' } }

// 앱 버전 체크
window.sendToApp('version.check', {});
// → { currentVersion: '1.0.0', latestVersion: '1.1.0', isUpdateAvailable: true, storeUrl: '...' }

// 연락처 검색
window.sendToApp('contacts.getByName', { name: '홍길동' });

// 카메라 열기
window.sendToApp('camera.open', { cameraType: 'back', flashMode: 'auto' });

// 스크린샷 방지
window.sendToApp('security.enableScreenshotProtection', {});
```

## 필수 기능 목록

### 기본
- 스플래시/랜딩 화면: 앱 로딩 시 브랜딩 화면
- WebView: URL 로드 및 표시
- 로딩 인디케이터: 웹 페이지 로드 중 표시

### 네비게이션
- 뒤로가기 처리: Android 하드웨어 백버튼, iOS 제스처
- 딥링크: 외부에서 앱 특정 화면으로 진입

### 네이티브 연동 (앱스토어 통과 조건)
- 푸시 알림: FCM(Android) / APNs(iOS)
- 웹↔앱 통신: JavaScript injection, postMessage
- 생체 인증: 지문/Face ID
- 카메라/갤러리: 이미지 촬영 및 선택
- 위치 정보: GPS 좌표
- 파일 처리: 다운로드/업로드

### 안전/보안
- Safe Area 처리: 노치, 홈바 영역 대응
- URL 화이트리스트: 허용된 도메인만 로드
- SSL/HTTPS 강제: 보안 연결만 허용
- 앱↔웹 인증: 세션 토큰 기반 상호 검증

### UX
- 오프라인 처리: 네트워크 끊김 시 안내 화면
- Pull-to-refresh: 당겨서 새로고침
- 에러 화면: 로드 실패 시 대체 화면

## Firebase 설정 (선택)

Firebase 설정 파일 없이도 앱은 정상 동작합니다. 푸시 알림이 필요할 때만 설정하세요.

### iOS
1. Firebase Console에서 `GoogleService-Info.plist` 다운로드
2. `ios/LICAApp/` 폴더에 추가
3. Xcode에서 프로젝트에 파일 추가

### Android
1. Firebase Console에서 `google-services.json` 다운로드
2. `android/app/` 폴더에 추가

**참고:** Firebase 미설정 시 푸시 알림 관련 기능(`device.getPushToken`)은 `null`을 반환합니다.

## 앱스토어 정책 주의사항

Apple/Google은 단순 웹사이트 래핑 앱을 리젝할 수 있음. 다음 네이티브 기능 포함 필수:
- 푸시 알림
- 오프라인 지원
- 생체 인증
- 카메라/위치 등 디바이스 기능
- 네이티브 UX (Safe Area, 백버튼 처리 등)

## Repository

https://github.com/munbc8308/LICA-App-base.git

## License

MIT (Byeongcheon Mun, 2026)
