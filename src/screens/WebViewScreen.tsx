import React, {useRef, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import appConfig from '../config/app.config';
import {BridgeHandler} from '../services/BridgeHandler';
import {BridgeMessage} from '../types/bridge';
import OfflineScreen from '../components/OfflineScreen';
import ErrorScreen from '../components/ErrorScreen';
import {useNetworkStatus} from '../hooks/useNetworkStatus';

const WebViewScreen: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isOnline = useNetworkStatus();

  const bridgeHandler = useRef(new BridgeHandler(webViewRef)).current;

  // Android 뒤로가기 처리
  React.useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [canGoBack]);

  // 웹에서 메시지 수신
  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      try {
        const message: BridgeMessage = JSON.parse(event.nativeEvent.data);
        const response = await bridgeHandler.handleMessage(message);
        bridgeHandler.sendToWeb(response);
      } catch (error) {
        console.error('Bridge message error:', error);
      }
    },
    [bridgeHandler],
  );

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    webViewRef.current?.reload();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // 오프라인 화면
  if (!isOnline) {
    return <OfflineScreen onRetry={() => webViewRef.current?.reload()} />;
  }

  // 에러 화면
  if (hasError) {
    return (
      <ErrorScreen
        onRetry={() => {
          setHasError(false);
          webViewRef.current?.reload();
        }}
      />
    );
  }

  // User-Agent 커스텀
  const customUserAgent = `${Platform.OS === 'ios' ? 'Mozilla/5.0' : 'Mozilla/5.0'} LICA-App/${appConfig.version}`;

  // WebView에 주입할 JavaScript
  const injectedJavaScript = `
    (function() {
      // 웹에서 앱으로 메시지 전송 헬퍼 (requestId를 외부에서 받을 수 있도록 수정)
      window.sendToApp = function(type, payload, requestId) {
        const message = JSON.stringify({
          type: type,
          payload: payload || {},
          requestId: requestId || Date.now().toString()
        });
        window.ReactNativeWebView.postMessage(message);
      };

      // 앱이 로드되었음을 웹에 알림
      window.isNativeApp = true;
      window.appVersion = '${appConfig.version}';

      // 웹에 앱 준비 완료 이벤트 발송
      window.dispatchEvent(new Event('nativeAppReady'));
    })();
    true;
  `;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <WebView
          ref={webViewRef}
          source={{uri: appConfig.webview.baseUrl}}
          style={styles.webview}
          userAgent={customUserAgent}
          injectedJavaScript={injectedJavaScript}
          onMessage={handleMessage}
          onNavigationStateChange={navState => {
            setCanGoBack(navState.canGoBack);
          }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          onHttpError={() => setHasError(true)}
          // 보안 설정
          originWhitelist={appConfig.webview.allowedDomains.flatMap(d => [
            `https://${d}*`,
            `http://${d}*`,
          ])}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="compatibility"
          allowsBackForwardNavigationGestures={true}
          // 캐시 설정
          cacheEnabled={true}
          // iOS 설정
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WebViewScreen;
