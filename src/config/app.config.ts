export default {
  // 앱 기본 정보
  appName: 'RentLICA',
  bundleId: 'com.lica.app',

  // WebView 설정
  //webview: {
  //  baseUrl: 'http://localhost:3000',
  //  allowedDomains: ['localhost'],
  //},
  webview: {
    baseUrl: 'https://rent-lica-web.vercel.app',
    allowedDomains: ['rent-lica-web.vercel.app'],
  },

  // 스플래시/테마
  splash: {
    backgroundColor: '#FFFFFF',
    logoPath: require('../../assets/logo.png'),
  },

  // 푸시 알림
  push: {
    fcmSenderId: '',
  },

  // 앱 버전
  version: '1.0.0',

  // 기능 활성화 설정
  features: {
    // QR코드/바코드 스캔
    qrScanner: true,
    // 네트워크 상태 상세 정보
    networkInfo: true,
    // 앱 버전 체크 & 업데이트
    versionCheck: true,
    // 스크린샷 방지
    screenshotProtection: false,
    // 연락처 접근
    contacts: true,
    // 카메라 제어
    cameraControl: true,
    // 캘린더
    calendar: true,
    // 생체 인증
    biometric: true,
    // 위치 정보
    location: true,
  },

  // 앱스토어 ID (버전 체크용)
  storeIds: {
    ios: '', // App Store ID (예: '123456789')
    android: '', // 패키지명 (예: 'com.lica.app')
  },
};
