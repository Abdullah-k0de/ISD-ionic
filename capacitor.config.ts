import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.isd.DentonMasjid',
  appName: 'Denton Masjid',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    "SplashScreen": {
      "launchShowDuration": 0
    },

    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    },

    CapacitorFirebaseMessaging: {
      alias: 'fcm',
      projectId: 'isd-1-c39bc',
      apiKey: 'AIzaSyCm91XlFbcTSUVNqbWws7lMhVrzsmguTtU'
    },
  }
};

export default config;
