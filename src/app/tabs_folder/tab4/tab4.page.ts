import { Component, OnInit } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';
import { Observable  } from 'rxjs';
import { NotificationClass } from 'src/app/classes/notification-class';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ModalController, ToastController } from '@ionic/angular';
import { ImageModalPage } from 'src/app/pages/image-modal/image-modal.page';
import { SocialSharing } from '@ionic-native/social-sharing';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  notification$: Observable<NotificationClass[]>
  imageTitle: string;
  loadURL$: Promise<string | null>;
  isAccordionOpen: boolean = false;
  imageBase64: string | null = null;


  constructor(
    private readonly firestore: Firestore,
    private toastController: ToastController,
    private storage: AngularFireStorage,
    private modalController: ModalController,
  ) {
    this.notification$ = collectionData(collection(this.firestore, 'notifications')) as Observable<NotificationClass[]>;
  }

  // message / download not working

  ngOnInit() {
    this.notification$.subscribe(async notificationsArray => {
      for (const nt of notificationsArray){
        this.loadURL$ = this.getNotificationImageUrl(nt.imgpath);
        this.imageTitle = nt.header;
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


  async shareImage(){
    // Base 64
    // try {
    //   if (this.imageBase64) {
    //     const options = {
    //       subject: 'Denton Masjid Event Image',
    //       files: ['https://' + this.imageBase64],
    //     };
    //     await SocialSharing.shareWithOptions(options);
    //   } else {
    //     console.error('No image to share');
    //     this.presentToast('No image to share');
    //   }
    // } catch (error) {
    //   console.error('Error sharing image:', error);
    //   this.presentToast('Error sharing image');
    // }

    //-------

    // // Use try-catch block to handle any errors that may occur during sharing
    try {
      const imgSrc: string | null = await this.loadURL$;
      if(imgSrc){
        const options = {
          subject: "Denton Masjid Event Image",
          files: [imgSrc]
        };
        await SocialSharing.shareWithOptions(options);
      }
    } catch (error) {
      console.error("Error sharing image:", error);
      // Handle error gracefully, e.g., show a toast message to the user
      this.presentToast("Error sharing image.");
    }
  }

  async downloadImageAsync() {
    const url = await this.loadURL$;
    await this.downloadImage(url);
  }

  //download not working for firebase storage
  async downloadImage(urlPromise: string | null){
    // const firebaseStorage = getStorage();
    // const storageRef = this.storage.ref(imagePath);
    // getDownloadURL(ref(firebaseStorage, imagePath))
    //   .then((url) => {
    //     const xhr = new XMLHttpRequest();
    //     xhr.responseType = 'blob';
    //     xhr.onload = (event) => {
    //       const blob = xhr.response;
    //     };
    //     xhr.open('GET', url);
    //     xhr.send();
    //   })
    //   .catch((error) => {
    //     console.error("Error from download Image: ", error);
    //   })

    // =-------------

    // try {
    //   const url = await urlPromise;
    //   if(url){
    //     const filePath = this.file.externalCacheDirectory + 'image.jpg'; // File path where the image will be saved
    //     const blob = await this.http.get(url, { responseType: 'blob' }).toPromise(); // Download the image
    //     await this.file.writeFile(filePath, blob, { replace: true }); // Write the downloaded image to file
    //     console.log('Image downloaded successfully:', filePath);
    //   }
    // } catch (error) {
    //   console.error('Error downloading image:', error);
    // }

    //Works on web
    //=---------
    try {
      const url = await urlPromise;
  
      if(!url){
        console.error('Image URL is null or empty!');
        return;        
      }
      console.log("Downloading the image...");
      const response = await fetch(url); // Fetch the image data
      const blob = await response.blob(); // Convert the response to a Blob object
      const objectUrl = URL.createObjectURL(blob); // Create a URL for the Blob object
      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('download', `${this.imageTitle}.jpg`);
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
  //     link.setAttribute('download', 'notification_image.jpeg');
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
