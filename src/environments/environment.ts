// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { firebaseApp$ } from "@angular/fire/app";
import { initializeApp } from "firebase/app";

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyCm91XlFbcTSUVNqbWws7lMhVrzsmguTtU",
    authDomain: "isd-1-c39bc.firebaseapp.com",
    projectId: "isd-1-c39bc",
    storageBucket: "isd-1-c39bc.appspot.com",
    messagingSenderId: "288828081945",
    appId: "1:288828081945:web:ad9d7ddf56e78cabdfa788",
    measurementId: "G-C7KFSSVMCT"
  },
  supabase: {
    url: 'https://qybqlmhslforglomkxjg.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnFsbWhzbGZvcmdsb21reGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDkxMjEsImV4cCI6MjA4Nzg4NTEyMX0.UPWuMcfM4mc9liWuYRydq19UAr5PPI5jPcJRqdVu57E'
  }
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
