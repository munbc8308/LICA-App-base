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
  | 'calendar.deleteEvent';

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
