import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Added HttpClient to make it global
import { HttpClientModule } from '@angular/common/http';
import { FirebaseStorage } from '@angular/fire/storage';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
// import { getAuth, provideAuth } from '@angular/fire/auth';
// import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
// import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck } from '@angular/fire/app-check';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage, getDownloadURL, ref } from '@angular/fire/storage';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { environment } from 'src/environments/environment.prod';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    AngularFireStorageModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    AngularFireModule.initializeApp(environment.firebase),
    // provideAuth(() => getAuth()), provideAnalytics(() => getAnalytics()),
    // provideAppCheck(() => {
  // // TODO get a reCAPTCHA Enterprise here https://console.cloud.google.com/security/recaptcha?project=_
  // const provider = new ReCaptchaEnterpriseProvider(/* reCAPTCHA Enterprise site key */);
  // return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
    provideFirestore(() => getFirestore()),
    // provideDatabase(() => getDatabase()),
    // provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
    // providePerformance(() => getPerformance()),
    provideStorage(() => getStorage()),
    // provideRemoteConfig(() => getRemoteConfig())
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}


/** Error:
 * Check if maps is working in Home page
 * Check if links are opening in Calendar page & maintain the size (iframe set size or hardcode)
 * Check which config to set in the index.html page
 *  *
 *  TO DO:
 * Hadith should be one each day or again and again.
 * prayer times table should be responsive
 * calendar ask and margin
 * Image Storage and Messageing 
 * going back should go back
 *  * 
 *  *
 * Prayer times - table should be responsive
 * 
 * going back should go back 
 *  * 
 * 
 * 4 MAIN THINGS
 * 1. Testing on IOS - right now testing on apk s
 * 2. Connecting to firebase
 * 3. Notifications and then alert
 * 4. Deploying to ios and android store
 */