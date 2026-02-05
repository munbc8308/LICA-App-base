// 웹↔앱 브릿지 메시지 타입 정의

export type BridgeMessageType =
  // 앱 인증
  | 'app.getSignature'
  | 'app.getSessionToken'
  | 'app.refreshToken'
  | 'app.validateOrigin'
  // 사용자 인증
  | 'auth.login'
  | 'auth.logout'
  | 'auth.getToken'
  | 'auth.biometric'
  // 스토리지
  | 'storage.set'
  | 'storage.get'
  | 'storage.remove'
  // 디바이스
  | 'device.getInfo'
  | 'device.getPushToken'
  | 'device.getLocation'
  // 미디어
  | 'media.camera'
  | 'media.gallery'
  | 'media.download'
  | 'media.upload'
  // UI
  | 'ui.haptic'
  | 'ui.share'
  | 'ui.openExternal'
  // 네비게이션
  | 'nav.back'
  | 'nav.exit'
  // 캘린더
  | 'calendar.requestPermission'
  | 'calendar.addEvent'
  | 'calendar.getEvents'
  | 'calendar.deleteEvent'
  // QR코드/바코드 스캔
  | 'scanner.scan'
  | 'scanner.requestPermission'
  // 네트워크 상태
  | 'network.getStatus'
  | 'network.getDetails'
  // 앱 버전 체크
  | 'version.check'
  | 'version.openStore'
  // 스크린샷 방지
  | 'security.enableScreenshotProtection'
  | 'security.disableScreenshotProtection'
  // 연락처
  | 'contacts.requestPermission'
  | 'contacts.getAll'
  | 'contacts.getByName'
  // 카메라 제어
  | 'camera.open'
  | 'camera.setFlash'
  | 'camera.setZoom'
  | 'camera.switchCamera';

export interface BridgeMessage<T = unknown> {
  type: BridgeMessageType;
  payload?: T;
  requestId?: string;
}

export interface BridgeResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}

// 페이로드 타입들
export interface StorageSetPayload {
  key: string;
  value: string;
}

export interface StorageGetPayload {
  key: string;
}

export interface AuthLoginPayload {
  token: string;
  refreshToken?: string;
}

export interface SharePayload {
  title?: string;
  message?: string;
  url?: string;
}

export interface DownloadPayload {
  url: string;
  filename?: string;
}

export interface DeviceInfo {
  os: 'ios' | 'android';
  osVersion: string;
  model: string;
  appVersion: string;
  uniqueId: string;
}

// 캘린더 관련 타입
export interface CalendarEventPayload {
  title: string;
  startDate: string; // ISO 8601 형식 (예: '2024-12-25T10:00:00.000Z')
  endDate: string; // ISO 8601 형식
  location?: string;
  notes?: string;
  url?: string;
  alarms?: CalendarAlarm[];
}

export interface CalendarAlarm {
  date?: string; // 특정 시간에 알람 (ISO 8601)
  relativeOffset?: number; // 이벤트 시작 전 분 단위 (예: -30은 30분 전)
}

export interface CalendarGetEventsPayload {
  startDate: string; // ISO 8601 형식
  endDate: string; // ISO 8601 형식
}

export interface CalendarDeleteEventPayload {
  eventId: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  notes?: string;
  url?: string;
}

// QR코드/바코드 스캔 관련 타입
export interface ScanResult {
  type: string; // 'qr', 'ean13', 'code128' 등
  data: string;
}

// 네트워크 상태 관련 타입
export interface NetworkStatus {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown';
}

export interface NetworkDetails {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown';
  isWifiEnabled?: boolean;
  isInternetReachable?: boolean;
  details?: {
    ssid?: string;
    strength?: number;
    ipAddress?: string;
    cellularGeneration?: '2g' | '3g' | '4g' | '5g';
    carrier?: string;
  };
}

// 앱 버전 체크 관련 타입
export interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string;
  isUpdateAvailable: boolean;
  storeUrl: string;
}

// 연락처 관련 타입
export interface Contact {
  recordID: string;
  displayName: string;
  givenName?: string | null;
  familyName?: string | null;
  phoneNumbers: Array<{
    label: string;
    number: string;
  }>;
  emailAddresses: Array<{
    label: string;
    email: string;
  }>;
  thumbnailPath?: string | null;
}

export interface ContactSearchPayload {
  name: string;
}

// 카메라 제어 관련 타입
export interface CameraConfig {
  cameraType?: 'front' | 'back';
  flashMode?: 'on' | 'off' | 'auto';
  zoom?: number; // 0.0 ~ 1.0
}

export interface CameraResult {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}
