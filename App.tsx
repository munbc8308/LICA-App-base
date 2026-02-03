import React, {useState, useEffect} from 'react';
import {StatusBar, Platform, PermissionsAndroid} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import WebViewScreen from './src/screens/WebViewScreen';

// Firebase는 설정 파일이 있을 때만 import
let messaging: any = null;
try {
  messaging = require('@react-native-firebase/messaging').default;
} catch (e) {
  console.log('Firebase not configured, push notifications disabled');
}

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Firebase가 설정되어 있을 때만 푸시 알림 초기화
    if (messaging) {
      try {
        await requestNotificationPermission();
        const token = await messaging().getToken();
        console.log('FCM Token:', token);

        messaging().onMessage(async (remoteMessage: any) => {
          console.log('Foreground message:', remoteMessage);
        });
      } catch (error) {
        console.log('Firebase initialization skipped:', error);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (!messaging) return;

    if (Platform.OS === 'ios') {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('iOS notification permission granted');
        }
      } catch (error) {
        console.log('iOS permission error:', error);
      }
    } else if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        console.log('Android notification permission:', granted);
      }
    }
  };

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {isLoading ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <WebViewScreen />
      )}
    </SafeAreaProvider>
  );
};

export default App;
