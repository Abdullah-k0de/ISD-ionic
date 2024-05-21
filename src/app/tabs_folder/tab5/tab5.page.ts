import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page implements OnInit, AfterViewInit {

  @ViewChild('iframeSun') iframeSun: ElementRef;

  constructor(private toastController: ToastController) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    // Check internet connection
    if (navigator.onLine) {
      console.log("Navigator is online");
      // If online, reload the iframe
      this.reloadIframe();
    } else {
      console.log("Navigator is offline");
      // If offline, show a toast
      this.presentOfflineToast();
    }

    // //reloading the frame
    //  this.reloadIframe();
  }

  // Function to present an offline toast
  async presentOfflineToast() {
    const toast = await this.toastController.create({
      message: 'You are offline. Please check your internet connection.',
      duration: 3000
    });
    toast.present();
  }
  
  //Function to reload the iframe content
  reloadIframe() {
      this.iframeSun.nativeElement.src = 'https://sunnah.com';
  }
}
