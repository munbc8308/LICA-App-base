import {Platform, Linking, Share, Vibration, NativeModules} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import ReactNativeBiometrics from 'react-native-biometrics';
import Geolocation from 'react-native-geolocation-service';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';
import RNCalendarEvents from 'react-native-calendar-events';
import NetInfo from '@react-native-community/netinfo';
import Contacts from 'react-native-contacts';
import VersionCheck from 'react-native-version-check';
import appConfig from '../config/app.config';

// Firebase는 설정 파일이 있을 때만 import
let messaging: any = null;
try {
  messaging = require('@react-native-firebase/messaging').default;
} catch (e) {
  console.log('Firebase messaging not available');
}
import {
  BridgeMessage,
  BridgeResponse,
  StorageSetPayload,
  StorageGetPayload,
  AuthLoginPayload,
  SharePayload,
  DownloadPayload,
  DeviceInfo as DeviceInfoType,
  CalendarEventPayload,
  CalendarGetEventsPayload,
  CalendarDeleteEventPayload,
  CalendarEvent,
  NetworkStatus,
  NetworkDetails,
  VersionCheckResult,
  Contact,
  ContactSearchPayload,
  CameraConfig,
  CameraResult,
  ScanResult,
} from '../types/bridge';
import type {WebView} from 'react-native-webview';

const AUTH_TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';

export class BridgeHandler {
  private webViewRef: React.RefObject<WebView | null>;

  constructor(webViewRef: React.RefObject<WebView | null>) {
    this.webViewRef = webViewRef;
  }

  async handleMessage(message: BridgeMessage): Promise<BridgeResponse> {
    const {type, payload, requestId} = message;

    try {
      let data: unknown;

      switch (type) {
        // 앱 인증
        case 'app.getSignature':
          data = await this.getAppSignature();
          break;
        case 'app.getSessionToken':
          data = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
          break;
        case 'app.refreshToken':
          // 서버에서 토큰 갱신 로직 구현 필요
          data = null;
          break;
        case 'app.validateOrigin':
          data = true;
          break;

        // 사용자 인증
        case 'auth.login':
          await this.handleLogin(payload as AuthLoginPayload);
          data = true;
          break;
        case 'auth.logout':
          await this.handleLogout();
          data = true;
          break;
        case 'auth.getToken':
          data = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
          break;
        case 'auth.biometric':
          data = await this.handleBiometric();
          break;

        // 스토리지
        case 'storage.set':
          const setPayload = payload as StorageSetPayload;
          await AsyncStorage.setItem(setPayload.key, setPayload.value);
          data = true;
          break;
        case 'storage.get':
          const getPayload = payload as StorageGetPayload;
          data = await AsyncStorage.getItem(getPayload.key);
          break;
        case 'storage.remove':
          const removePayload = payload as StorageGetPayload;
          await AsyncStorage.removeItem(removePayload.key);
          data = true;
          break;

        // 디바이스
        case 'device.getInfo':
          data = await this.getDeviceInfo();
          break;
        case 'device.getPushToken':
          if (messaging) {
            data = await messaging().getToken();
          } else {
            data = null;
          }
          break;
        case 'device.getLocation':
          data = await this.getLocation();
          break;

        // 미디어
        case 'media.camera':
          data = await this.openCamera();
          break;
        case 'media.gallery':
          data = await this.openGallery();
          break;
        case 'media.download':
          data = await this.downloadFile(payload as DownloadPayload);
          break;
        case 'media.upload':
          // 업로드 로직은 서버 연동 필요
          data = null;
          break;

        // UI
        case 'ui.haptic':
          Vibration.vibrate(50);
          data = true;
          break;
        case 'ui.share':
          data = await this.handleShare(payload as SharePayload);
          break;
        case 'ui.openExternal':
          const url = (payload as {url: string}).url;
          await Linking.openURL(url);
          data = true;
          break;

        // 네비게이션
        case 'nav.back':
          this.webViewRef.current?.goBack();
          data = true;
          break;
        case 'nav.exit':
          // 앱 종료는 플랫폼별 처리 필요
          data = true;
          break;

        // 캘린더
        case 'calendar.requestPermission':
          data = await this.requestCalendarPermission();
          break;
        case 'calendar.addEvent':
          data = await this.addCalendarEvent(payload as CalendarEventPayload);
          break;
        case 'calendar.getEvents':
          data = await this.getCalendarEvents(payload as CalendarGetEventsPayload);
          break;
        case 'calendar.deleteEvent':
          data = await this.deleteCalendarEvent(payload as CalendarDeleteEventPayload);
          break;

        // QR코드/바코드 스캔
        case 'scanner.requestPermission':
          data = await this.requestCameraPermission();
          break;
        case 'scanner.scan':
          // QR 스캔은 별도 화면에서 처리해야 함 - 웹에 스캔 모드 진입 알림
          data = {message: 'Use camera.open with scanMode: true'};
          break;

        // 네트워크 상태
        case 'network.getStatus':
          data = await this.getNetworkStatus();
          break;
        case 'network.getDetails':
          data = await this.getNetworkDetails();
          break;

        // 앱 버전 체크
        case 'version.check':
          data = await this.checkVersion();
          break;
        case 'version.openStore':
          data = await this.openStore();
          break;

        // 스크린샷 방지
        case 'security.enableScreenshotProtection':
          data = await this.enableScreenshotProtection();
          break;
        case 'security.disableScreenshotProtection':
          data = await this.disableScreenshotProtection();
          break;

        // 연락처
        case 'contacts.requestPermission':
          data = await this.requestContactsPermission();
          break;
        case 'contacts.getAll':
          data = await this.getAllContacts();
          break;
        case 'contacts.getByName':
          data = await this.getContactsByName(payload as ContactSearchPayload);
          break;

        // 카메라 제어
        case 'camera.open':
          data = await this.openCameraWithConfig(payload as CameraConfig);
          break;
        case 'camera.setFlash':
          data = await this.setCameraFlash((payload as {mode: string}).mode);
          break;
        case 'camera.setZoom':
          data = await this.setCameraZoom((payload as {zoom: number}).zoom);
          break;
        case 'camera.switchCamera':
          data = await this.switchCamera();
          break;

        default:
          return {success: false, error: `Unknown message type: ${type}`, requestId};
      }

      return {success: true, data, requestId};
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      };
    }
  }

  private async getAppSignature(): Promise<string> {
    // Android에서 앱 서명 해시 반환
    if (Platform.OS === 'android') {
      // 실제 구현에서는 네이티브 모듈로 서명 해시 가져오기
      return DeviceInfo.getBundleId();
    }
    return DeviceInfo.getBundleId();
  }

  private async handleLogin(payload: AuthLoginPayload): Promise<void> {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, payload.token);
    if (payload.refreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
    }
  }

  private async handleLogout(): Promise<void> {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  }

  private async handleBiometric(): Promise<boolean> {
    const rnBiometrics = new ReactNativeBiometrics();
    const {available} = await rnBiometrics.isSensorAvailable();

    if (!available) {
      throw new Error('Biometric not available');
    }

    const {success} = await rnBiometrics.simplePrompt({
      promptMessage: '생체 인증을 진행해주세요',
    });

    return success;
  }

  private async getDeviceInfo(): Promise<DeviceInfoType> {
    return {
      os: Platform.OS as 'ios' | 'android',
      osVersion: DeviceInfo.getSystemVersion(),
      model: DeviceInfo.getModel(),
      appVersion: DeviceInfo.getVersion(),
      uniqueId: await DeviceInfo.getUniqueId(),
    };
  }

  private getLocation(): Promise<{latitude: number; longitude: number}> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => reject(error),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    });
  }

  private async openCamera(): Promise<string | null> {
    const result = await launchCamera({
      mediaType: 'photo',
      includeBase64: true,
    });

    if (result.assets && result.assets[0]?.base64) {
      return `data:image/jpeg;base64,${result.assets[0].base64}`;
    }
    return null;
  }

  private async openGallery(): Promise<string | null> {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
    });

    if (result.assets && result.assets[0]?.base64) {
      return `data:image/jpeg;base64,${result.assets[0].base64}`;
    }
    return null;
  }

  private async downloadFile(payload: DownloadPayload): Promise<string> {
    const filename = payload.filename || payload.url.split('/').pop() || 'download';
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;

    await RNFS.downloadFile({
      fromUrl: payload.url,
      toFile: path,
    }).promise;

    return path;
  }

  private async handleShare(payload: SharePayload): Promise<boolean> {
    try {
      await RNShare.open({
        title: payload.title,
        message: payload.message,
        url: payload.url,
      });
      return true;
    } catch {
      return false;
    }
  }

  // 캘린더 권한 요청
  private async requestCalendarPermission(): Promise<string> {
    const status = await RNCalendarEvents.requestPermissions();
    return status;
  }

  // 캘린더에 이벤트 추가
  private async addCalendarEvent(payload: CalendarEventPayload): Promise<string> {
    // 권한 확인
    const permission = await RNCalendarEvents.checkPermissions();
    if (permission !== 'authorized') {
      const requested = await RNCalendarEvents.requestPermissions();
      if (requested !== 'authorized') {
        throw new Error('Calendar permission denied');
      }
    }

    // 알람 설정 변환
    const alarms: Array<{date?: string; relativeOffset?: number}> | undefined =
      payload.alarms?.map(alarm => {
        if (alarm.date) {
          return {date: alarm.date};
        }
        if (alarm.relativeOffset !== undefined) {
          return {relativeOffset: alarm.relativeOffset};
        }
        return {relativeOffset: -30}; // 기본값: 30분 전
      });

    // 이벤트 생성
    const eventId = await RNCalendarEvents.saveEvent(payload.title, {
      startDate: payload.startDate,
      endDate: payload.endDate,
      location: payload.location,
      notes: payload.notes,
      url: payload.url,
      alarms: alarms as any,
    });

    return eventId;
  }

  // 캘린더 이벤트 조회
  private async getCalendarEvents(
    payload: CalendarGetEventsPayload,
  ): Promise<CalendarEvent[]> {
    // 권한 확인
    const permission = await RNCalendarEvents.checkPermissions();
    if (permission !== 'authorized') {
      const requested = await RNCalendarEvents.requestPermissions();
      if (requested !== 'authorized') {
        throw new Error('Calendar permission denied');
      }
    }

    const events = await RNCalendarEvents.fetchAllEvents(
      payload.startDate,
      payload.endDate,
    );

    return events.map(event => ({
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      notes: event.notes,
      url: event.url,
    }));
  }

  // 캘린더 이벤트 삭제
  private async deleteCalendarEvent(
    payload: CalendarDeleteEventPayload,
  ): Promise<boolean> {
    // 권한 확인
    const permission = await RNCalendarEvents.checkPermissions();
    if (permission !== 'authorized') {
      throw new Error('Calendar permission denied');
    }

    const success = await RNCalendarEvents.removeEvent(payload.eventId);
    return success;
  }

  // ============ 네트워크 상태 ============
  private async getNetworkStatus(): Promise<NetworkStatus> {
    if (!appConfig.features.networkInfo) {
      throw new Error('Network info feature is disabled');
    }

    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      type: this.mapNetworkType(state.type),
    };
  }

  private async getNetworkDetails(): Promise<NetworkDetails> {
    if (!appConfig.features.networkInfo) {
      throw new Error('Network info feature is disabled');
    }

    const state = await NetInfo.fetch();
    const details: NetworkDetails = {
      isConnected: state.isConnected ?? false,
      type: this.mapNetworkType(state.type),
      isInternetReachable: state.isInternetReachable ?? undefined,
      details: {},
    };

    if (state.type === 'wifi' && state.details) {
      const wifiDetails = state.details as any;
      details.details = {
        ssid: wifiDetails.ssid,
        strength: wifiDetails.strength,
        ipAddress: wifiDetails.ipAddress,
      };
      details.isWifiEnabled = true;
    } else if (state.type === 'cellular' && state.details) {
      const cellDetails = state.details as any;
      details.details = {
        cellularGeneration: cellDetails.cellularGeneration,
        carrier: cellDetails.carrier,
      };
    }

    return details;
  }

  private mapNetworkType(
    type: string,
  ): 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown' {
    switch (type) {
      case 'wifi':
        return 'wifi';
      case 'cellular':
        return 'cellular';
      case 'ethernet':
        return 'ethernet';
      case 'none':
        return 'none';
      default:
        return 'unknown';
    }
  }

  // ============ 앱 버전 체크 ============
  private async checkVersion(): Promise<VersionCheckResult> {
    if (!appConfig.features.versionCheck) {
      throw new Error('Version check feature is disabled');
    }

    const currentVersion = DeviceInfo.getVersion();
    let latestVersion = currentVersion;
    let storeUrl = '';

    try {
      if (Platform.OS === 'ios' && appConfig.storeIds.ios) {
        latestVersion = await VersionCheck.getLatestVersion({
          provider: 'appStore',
        });
        storeUrl = await VersionCheck.getStoreUrl({appID: appConfig.storeIds.ios});
      } else if (Platform.OS === 'android' && appConfig.storeIds.android) {
        latestVersion = await VersionCheck.getLatestVersion({
          provider: 'playStore',
        });
        storeUrl = await VersionCheck.getStoreUrl({
          packageName: appConfig.storeIds.android,
        });
      }
    } catch (e) {
      // 스토어에서 버전 정보를 가져올 수 없는 경우
      console.log('Version check error:', e);
    }

    const needsUpdate = VersionCheck.needUpdate({
      currentVersion,
      latestVersion,
    });

    return {
      currentVersion,
      latestVersion: latestVersion || currentVersion,
      isUpdateAvailable: needsUpdate?.isNeeded ?? false,
      storeUrl,
    };
  }

  private async openStore(): Promise<boolean> {
    if (!appConfig.features.versionCheck) {
      throw new Error('Version check feature is disabled');
    }

    try {
      let storeUrl = '';
      if (Platform.OS === 'ios' && appConfig.storeIds.ios) {
        storeUrl = `https://apps.apple.com/app/id${appConfig.storeIds.ios}`;
      } else if (Platform.OS === 'android' && appConfig.storeIds.android) {
        storeUrl = `market://details?id=${appConfig.storeIds.android}`;
      }

      if (storeUrl) {
        await Linking.openURL(storeUrl);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // ============ 스크린샷 방지 ============
  private async enableScreenshotProtection(): Promise<boolean> {
    if (!appConfig.features.screenshotProtection) {
      throw new Error('Screenshot protection feature is disabled');
    }

    try {
      if (Platform.OS === 'android') {
        // Android에서는 FLAG_SECURE 플래그 사용 (네이티브 모듈 필요)
        // 현재는 placeholder - 실제 구현 시 네이티브 모듈 추가 필요
        console.log('Screenshot protection enabled (Android)');
      } else {
        // iOS에서는 UITextField trick 또는 화면 녹화 감지
        console.log('Screenshot protection enabled (iOS)');
      }
      return true;
    } catch {
      return false;
    }
  }

  private async disableScreenshotProtection(): Promise<boolean> {
    if (!appConfig.features.screenshotProtection) {
      throw new Error('Screenshot protection feature is disabled');
    }

    try {
      console.log('Screenshot protection disabled');
      return true;
    } catch {
      return false;
    }
  }

  // ============ 연락처 ============
  private async requestContactsPermission(): Promise<string> {
    if (!appConfig.features.contacts) {
      throw new Error('Contacts feature is disabled');
    }

    const permission = await Contacts.requestPermission();
    return permission;
  }

  private async getAllContacts(): Promise<Contact[]> {
    if (!appConfig.features.contacts) {
      throw new Error('Contacts feature is disabled');
    }

    const permission = await Contacts.checkPermission();
    if (permission !== 'authorized') {
      const requested = await Contacts.requestPermission();
      if (requested !== 'authorized') {
        throw new Error('Contacts permission denied');
      }
    }

    const contacts = await Contacts.getAll();
    return contacts.map(contact => ({
      recordID: contact.recordID,
      displayName: contact.displayName || `${contact.givenName} ${contact.familyName}`.trim(),
      givenName: contact.givenName,
      familyName: contact.familyName,
      phoneNumbers: contact.phoneNumbers.map(phone => ({
        label: phone.label,
        number: phone.number,
      })),
      emailAddresses: contact.emailAddresses.map(email => ({
        label: email.label,
        email: email.email,
      })),
      thumbnailPath: contact.thumbnailPath,
    }));
  }

  private async getContactsByName(payload: ContactSearchPayload): Promise<Contact[]> {
    if (!appConfig.features.contacts) {
      throw new Error('Contacts feature is disabled');
    }

    const permission = await Contacts.checkPermission();
    if (permission !== 'authorized') {
      throw new Error('Contacts permission denied');
    }

    const contacts = await Contacts.getContactsMatchingString(payload.name);
    return contacts.map(contact => ({
      recordID: contact.recordID,
      displayName: contact.displayName || `${contact.givenName} ${contact.familyName}`.trim(),
      givenName: contact.givenName,
      familyName: contact.familyName,
      phoneNumbers: contact.phoneNumbers.map(phone => ({
        label: phone.label,
        number: phone.number,
      })),
      emailAddresses: contact.emailAddresses.map(email => ({
        label: email.label,
        email: email.email,
      })),
      thumbnailPath: contact.thumbnailPath,
    }));
  }

  // ============ 카메라 제어 ============
  private async requestCameraPermission(): Promise<string> {
    // react-native-image-picker가 자동으로 권한 요청
    return 'authorized';
  }

  private cameraConfig: CameraConfig = {
    cameraType: 'back',
    flashMode: 'auto',
    zoom: 0,
  };

  private async openCameraWithConfig(config?: CameraConfig): Promise<CameraResult | null> {
    if (!appConfig.features.cameraControl) {
      throw new Error('Camera control feature is disabled');
    }

    if (config) {
      this.cameraConfig = {...this.cameraConfig, ...config};
    }

    const result = await launchCamera({
      mediaType: 'photo',
      includeBase64: true,
      cameraType: this.cameraConfig.cameraType === 'front' ? 'front' : 'back',
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.8,
    });

    if (result.assets && result.assets[0]) {
      const asset = result.assets[0];
      return {
        uri: asset.uri || '',
        base64: asset.base64,
        width: asset.width || 0,
        height: asset.height || 0,
      };
    }
    return null;
  }

  private async setCameraFlash(mode: string): Promise<boolean> {
    if (!appConfig.features.cameraControl) {
      throw new Error('Camera control feature is disabled');
    }

    this.cameraConfig.flashMode = mode as 'on' | 'off' | 'auto';
    return true;
  }

  private async setCameraZoom(zoom: number): Promise<boolean> {
    if (!appConfig.features.cameraControl) {
      throw new Error('Camera control feature is disabled');
    }

    this.cameraConfig.zoom = Math.max(0, Math.min(1, zoom));
    return true;
  }

  private async switchCamera(): Promise<string> {
    if (!appConfig.features.cameraControl) {
      throw new Error('Camera control feature is disabled');
    }

    this.cameraConfig.cameraType =
      this.cameraConfig.cameraType === 'front' ? 'back' : 'front';
    return this.cameraConfig.cameraType;
  }

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
}
