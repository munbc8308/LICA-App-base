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
  | 'nav.exit';

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
