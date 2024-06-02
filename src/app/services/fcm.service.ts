import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor, Plugins } from '@capacitor/core';
import {  PushNotifications, Token, ActionPerformed, PermissionStatus } from '@capacitor/push-notifications';
@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(private router: Router) { }

  public initPush() {
    console.log("Inside initPush()");
    
    if (Capacitor.getPlatform() !== 'web') {
      this.registerPush();
    }
  }

  private registerPush() {
    console.log("Inside registerPush()");
    
    PushNotifications.requestPermissions().then(() => {
      PushNotifications.checkPermissions().then((permissions: PermissionStatus) => {
        console.log("Permission object is: " + JSON.stringify(permissions));
        
        if(permissions && permissions.receive == "granted") {      // the object has but cannot check
          console.log("Permission granted!");
          console.log("Before registerring");
          PushNotifications.register();
          console.log("After registerring!"); 
        } else {
          console.log("Permission was not granted.");
        }
      });
    }).catch(error => {
      console.error('Error requesting push notification permissions: ', error);
    });

    PushNotifications.addListener(
      'registration',
      (token: Token) => {
        console.log('My token: ' + JSON.stringify(token));
      }
    );

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: any) => {
        console.log('Push received: ' + JSON.stringify(notification));
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification: ActionPerformed) => {
        const data = notification.notification.data;
        console.log('Action Performed: ' + JSON.stringify(notification.notification));
        this.router.navigateByUrl(`../tabs_folder/tab1/tab1.module`);        
      }
    );
  }
}
