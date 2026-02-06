import React, {useEffect, useRef} from 'react';
import {View, Image, StyleSheet, Animated, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

interface SplashScreenProps {
  onFinish: () => void;
}

const {width} = Dimensions.get('window');
const SPLASH_DURATION = 2000; // 2초

// FoodLICA 테마 색상
const BACKGROUND_COLOR = '#FFFFFF'; // 흰색 배경 (로고에 맞춤)
const THEME_COLOR = '#FF6347'; // 코랄/토마토 색상
const PROGRESS_BG = 'rgba(255, 99, 71, 0.2)'; // 연한 오렌지 배경
const PROGRESS_COLOR = '#FF6347'; // 오렌지 프로그레스 바

const SplashScreen: React.FC<SplashScreenProps> = ({onFinish}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 프로그레스 바 애니메이션
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: SPLASH_DURATION,
      useNativeDriver: false,
    }).start();

    // 2초 후 메인 화면으로 이동
    const timer = setTimeout(() => {
      onFinish();
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [onFinish, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width - 80],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* 하단 프로그레스 바 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[styles.progressBar, {width: progressWidth}]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 280,
    height: 280,
  },
  progressContainer: {
    paddingHorizontal: 40,
    paddingBottom: 60,
    width: '100%',
  },
  progressBackground: {
    height: 6,
    backgroundColor: PROGRESS_BG,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: PROGRESS_COLOR,
    borderRadius: 3,
  },
});

export default SplashScreen;
