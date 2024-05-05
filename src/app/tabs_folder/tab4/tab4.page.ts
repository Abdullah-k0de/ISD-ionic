import { Component, OnInit } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';
import { Observable  } from 'rxjs';
import { NotificationClass } from 'src/app/classes/notification-class';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ModalController, ToastController } from '@ionic/angular';
import { ImageModalPage } from 'src/app/pages/image-modal/image-modal.page';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  notification$: Observable<NotificationClass[]>
  loadURL$: Promise<string | null>;
  isAccordionOpen: boolean = false;


  constructor(
    private readonly firestore: Firestore,
    private toastController: ToastController,
    private storage: AngularFireStorage,
    private modalController: ModalController
  ) {
    this.notification$ = collectionData(collection(this.firestore, 'notifications')) as Observable<NotificationClass[]>;
  }

  // message / download not working

  ngOnInit() {
    this.notification$.subscribe(notificationsArray => {
      for (const nt of notificationsArray){
        this.loadURL$ = this.getNotificationImageUrl(nt.imgpath);        
      }
    });
  }

  //For image full screen
  async openPreview(){
    const modal = await this.modalController.create({
      component: ImageModalPage,
      componentProps: {
        imageUrl: this.loadURL$
      },
      cssClass: 'transparent-modal'
    });
    modal.present();
  }

  async getNotificationImageUrl(imagePath: string): Promise<string | null> {
    if (!imagePath || imagePath.length === 0) {
      return null; // Return null for notifications without an image path
    }
    const storageRef = this.storage.ref(imagePath); // Construct the storage reference    
    try{
      const downloadURL = await storageRef.getDownloadURL().toPromise();
      return downloadURL;
    } catch (error) {
      console.error('Error getting image download URL:', error);
      this.presentToast('Error loading image');
      return null;
    }
  }

  //download not working for firebase storage
  async downloadImage(urlPromise: Promise<string | null>){
    try {
      const url = await urlPromise;
      console.log("URL = " + url);
      
      if(!url){
        console.error('Image URL is null or empty!');
        return;        
      }

      const response = await fetch(url); // Fetch the image data
      const blob = await response.blob(); // Convert the response to a Blob object
      const objectUrl = URL.createObjectURL(blob); // Create a URL for the Blob object
      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('download', 'notification_image.jpg');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl); // Release the object URL
      this.presentToast('Image download initiated');
    } catch (error) {
      console.error("Error downloading image: ", error);
      this.presentToast('Error downloading image');
    }
  }

  // // WORKING ONE
  // async downloadImage(url: string){
  //   try {
  //     const response = await fetch(url); // Fetch the image data
  //     const blob = await response.blob(); // Convert the response to a Blob object
  //     const objectUrl = URL.createObjectURL(blob); // Create a URL for the Blob object
  //     const link = document.createElement('a');
  //     link.href = objectUrl;
  //     link.setAttribute('download', 'notification_image.jpg');
  //     link.style.display = 'none';
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     URL.revokeObjectURL(objectUrl); // Release the object URL
  //     this.presentToast('Image download initiated');
  //   } catch (error) {
  //     console.error("Error downloading image: ", error);
  //     this.presentToast('Error downloading image');
  //   }
  // }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;    
  }
}
