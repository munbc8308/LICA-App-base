// 타입 정의가 없는 모듈 선언

declare module 'react-native-version-check' {
  interface VersionCheckOptions {
    provider?: 'appStore' | 'playStore';
  }

  interface StoreUrlOptions {
    appID?: string;
    packageName?: string;
  }

  interface NeedUpdateOptions {
    currentVersion: string;
    latestVersion: string;
  }

  interface NeedUpdateResult {
    isNeeded: boolean;
  }

  export function getLatestVersion(options?: VersionCheckOptions): Promise<string>;
  export function getStoreUrl(options?: StoreUrlOptions): Promise<string>;
  export function needUpdate(options: NeedUpdateOptions): NeedUpdateResult | null;

  export default {
    getLatestVersion,
    getStoreUrl,
    needUpdate,
  };
}
