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
};
