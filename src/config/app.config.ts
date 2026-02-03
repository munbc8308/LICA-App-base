export default {
  // 앱 기본 정보
  appName: 'LICAApp',
  bundleId: 'com.lica.app',

  // WebView 설정
  webview: {
    baseUrl: 'https://example.com',
    allowedDomains: ['example.com'],
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
};
