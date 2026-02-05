# DEBUG.md - 작업 기록

## 2026-02-05 작업 내역

### 1. WebView 외부 브라우저 열림 문제 해결

**문제:** `app.config.ts`의 `baseUrl`이 WebView에서 열리지 않고 외부 브라우저로 열림

**원인:** `WebViewScreen.tsx`의 `originWhitelist`가 `https://`만 허용
```typescript
// 수정 전
originWhitelist={appConfig.webview.allowedDomains.map(d => `https://${d}*`)}
```

**해결:** `http://`와 `https://` 모두 허용하도록 수정
```typescript
// 수정 후
originWhitelist={appConfig.webview.allowedDomains.flatMap(d => [
  `https://${d}*`,
  `http://${d}*`,
])}
```

**파일:** `src/screens/WebViewScreen.tsx:131`

---

### 2. 브릿지 API 응답 안 받는 문제 해결

**문제:** 웹에서 `app.getSignature` 등 브릿지 API 호출 시 응답을 받지 못함

**원인:** `sendToWeb` 메서드의 `injectJavaScript` 스크립트에 `true;` 반환 누락

**해결:** IIFE 패턴과 `true;` 반환 추가
```typescript
// 수정 후 (BridgeHandler.ts)
sendToWeb(response: BridgeResponse): void {
  const responseJson = JSON.stringify(response);
  const script = `
    console.log('[App->Web] Script executing...');
    console.log('[App->Web] Response:', ${JSON.stringify(responseJson)});
    (function() {
      window.dispatchEvent(new CustomEvent('nativeMessage', {
        detail: ${responseJson}
      }));
    })();
    true;
  `;
  this.webViewRef.current?.injectJavaScript(script);
}
```

**파일:** `src/services/BridgeHandler.ts:270-283`

---

### 3. sendToApp 함수 requestId 파라미터 추가

**요청:** 웹 서비스에서 `requestId`를 직접 전달할 수 있도록 수정 요청

**수정 전:**
```javascript
window.sendToApp = function(type, payload) {
  // requestId 자동 생성
  requestId: Date.now().toString()
}
```

**수정 후:**
```javascript
window.sendToApp = function(type, payload, requestId) {
  // requestId가 전달되면 사용, 없으면 자동 생성
  requestId: requestId || Date.now().toString()
}
```

**파일:** `src/screens/WebViewScreen.tsx` (injectedJavaScript 부분)

**사용법:**
```javascript
// requestId 전달
window.sendToApp('app.getSignature', {}, 'my-request-123');

// requestId 미전달 (자동 생성)
window.sendToApp('app.getSignature', {});
```

---

### 4. 디버깅 방법

브릿지 통신 문제 디버깅 시 사용한 방법:

**디버그 alert 추가 위치:**
1. `injectedJavaScript` - sendToApp 호출 시
2. `handleMessage` - 앱에서 메시지 수신/처리/응답 각 단계
3. `sendToWeb` - 응답 전송 시

**디버그 흐름:**
```
[DEBUG INIT] → 브릿지 초기화 완료
[DEBUG 0]    → 웹에서 sendToApp 호출
[DEBUG 0.5]  → postMessage 호출 완료
[DEBUG 1]    → 앱에서 메시지 수신
[DEBUG 2]    → 메시지 타입 파싱
[DEBUG 3]    → 응답 생성 완료
[DEBUG 4]    → sendToWeb 호출 완료
[DEBUG 5]    → 웹에서 응답 수신
```

**로그 확인 명령어:**
```bash
# iOS 로그
npx react-native log-ios

# Android 로그
npx react-native log-android
```

---

### 5. Metro Bundler 문제 해결

**문제:** `npm run ios` 실행 시 "No script URL provided. unsanitizedScriptUrlString = null" 에러

**해결:**
```bash
# 1. Metro 캐시 정리 후 서버 시작
npm start -- --reset-cache

# 2. 새 터미널에서 앱 빌드
npm run ios

# 또는 전체 클린 빌드
cd ios && rm -rf build Pods Podfile.lock && pod install && cd ..
npm run ios
```

---

## 관련 파일 목록

| 파일 | 설명 |
|------|------|
| `src/screens/WebViewScreen.tsx` | WebView 화면, 브릿지 메시지 처리 |
| `src/services/BridgeHandler.ts` | 브릿지 API 핸들러 |
| `src/config/app.config.ts` | 앱 설정 (baseUrl, allowedDomains 등) |

---

## 다음 작업 예정

- [ ] 실제 서비스 URL 연동 테스트
- [ ] Firebase 푸시 알림 설정
- [ ] Android 빌드 테스트
- [ ] 앱 아이콘/스플래시 이미지 교체
