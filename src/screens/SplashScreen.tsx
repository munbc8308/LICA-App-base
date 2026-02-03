import React, {useEffect} from 'react';
import {View, Image, StyleSheet, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import appConfig from '../config/app.config';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({onFinish}) => {
  useEffect(() => {
    // 스플래시 표시 후 메인 화면으로 이동
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: appConfig.splash.backgroundColor}]}>
      <View style={styles.content}>
        {/* 로고 이미지 - assets/logo.png 필요 */}
        {/* <Image source={appConfig.splash.logoPath} style={styles.logo} resizeMode="contain" /> */}
        <View style={styles.logoPlaceholder} />
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
  },
  loader: {
    marginTop: 30,
  },
});

export default SplashScreen;
