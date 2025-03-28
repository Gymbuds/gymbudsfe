// types/react-native-health.d.ts
declare module 'react-native-health' {
    export interface AppleHealthKit {
      requestAuthorization: (options: any, callback: (err: any, result: any) => void) => void;
    }
  }  