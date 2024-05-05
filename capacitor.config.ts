import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ISD.DentonMasjid',
  appName: 'Denton Masjid',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    "SplashScreen": {
      "launchShowDuration": 0
    },
    CapacitorFirebaseMessaging: {
      alias: 'fcm',
      projectId: 'isd-1-c39bc',
      apiKey: 'AIzaSyCm91XlFbcTSUVNqbWws7lMhVrzsmguTtU'
    }
  }
};

export default config;
