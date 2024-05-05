import { Component, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { IonRouterOutlet } from '@ionic/angular';
import { App } from '@capacitor/app';
import { FcmService } from './services/fcm.service';
import 'firebase/messaging';
import { environment } from 'src/environments/environment.prod';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { AngularFireModule } from '@angular/fire/compat';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  @ViewChild(IonRouterOutlet) outlet: any;

  constructor(private platform: Platform, private fcmService: FcmService) {

    // Back and exit with hardware back button
    this.platform.backButton.subscribeWithPriority(-1, () => {
      if(!this.outlet?.canGoBack()){
        App.exitApp();
      }
    });

    //Initializing Firebase
    // FirebaseApp.initializeApp(environment.firebase);
    // initializeApp(environment.firebase);
    // AngularFireModule.initializeApp(environment.firebase);

    // console.log("Before initPush()");
    // this.fcmService.initPush();

    this.platform.ready().then(async () => {
      try {
        initializeApp(environment.firebase);
        console.log("Only init");        
        AngularFireModule.initializeApp(environment.firebase);
        console.log("Angular init");
        console.log("Firebase initialized successfully && Before initPush()");
        // this.fcmService.initPush();
      } catch (error) {
        console.error("Error initializing Firebase:", error);
      }
    });
  }
}
