import { Component, OnInit } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';
import { Observable  } from 'rxjs';
import { NotificationClass } from 'src/app/classes/notification-class';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ImageModalPage } from 'src/app/pages/image-modal/image-modal.page';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx'

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  notification$: Observable<NotificationClass[]>
  imageTitle: string;
  loadURL$: Promise<string | undefined>;
  isAccordionOpen: boolean = false;
  imageUrls: { [header: string]: Promise<string | undefined> } = {}; // Store image URLs by notification header
  openAccordions: { [header: string]: boolean } = {}; // Track open state of each accordion


  constructor(
    private readonly firestore: Firestore,
    private toastController: ToastController,
    private storage: AngularFireStorage,
    private modalController: ModalController,
    private socialSharing: SocialSharing,
    private file: File,
    private loadingController: LoadingController
  ) {
    this.notification$ = collectionData(collection(this.firestore, 'notifications')) as Observable<NotificationClass[]>;
  }

  // message / download not working

  async ngOnInit() {
    const loading = this.loadingController.create();
    (await loading).present();
    this.loadEvents();
    (await loading).dismiss();
  }

  loadEvents() {
    this.notification$.subscribe(async notificationsArray => {
      for (const nt of notificationsArray){
        this.imageTitle = nt.header;

        this.loadURL$ = this.getNotificationImageUrl(nt.imgpath);
                
        const imageUrl = this.getNotificationImageUrl(nt.imgpath);
        this.imageUrls[nt.header] = imageUrl; // Store the URL with the header as key
        this.openAccordions[nt.header] = false; // Initialize all accordions to be closed
      }
    });
  }

  //For image full screen
  async openPreview(imageUrl: Promise<string | undefined>){
    const modal = await this.modalController.create({
      component: ImageModalPage,
      componentProps: {
        imageUrl: imageUrl
      },
      cssClass: 'transparent-modal'
    });
    modal.present();
  }

  async getNotificationImageUrl(imagePath: string): Promise<string | undefined> {
    if (!imagePath || imagePath.length === 0) {
      return undefined; // Return null for notifications without an image path
    }

    const storageRef = this.storage.ref(imagePath); // Construct the storage reference    
    try{
      const downloadURL = await storageRef.getDownloadURL().toPromise();
      return downloadURL;
    } catch (error) {
      console.error('Error getting image download URL:', error);
      this.presentToast('Error loading image');
      return undefined;
    }
  }

  async shareImage(imageHeader: string, imagePath: string, imageDesc: string, imageLink: string){
    const imgSrc = await this.getNotificationImageUrl(imagePath);

    if(imgSrc){
      const fileName = imageHeader + '.png';
      const filePath = this.file.externalDataDirectory + fileName;

      const response = await fetch(imgSrc);
      const blob = await response.blob();
      await this.file.writeFile(this.file.externalDataDirectory, fileName, blob, { replace: true });

      const resolvedUri = await this.file.resolveLocalFilesystemUrl(filePath);
      console.log("Resolved URI:", resolvedUri.nativeURL);
      const options = {
        message: imageHeader + "\n" + imageDesc + "\n",
        subject: "Denton Masjid Event",
        files: [resolvedUri.nativeURL],
        url: imageLink,
      };
      console.log("Image Src = " + imgSrc);
      this.socialSharing.shareWithOptions(options)
      .then(response => {
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      })
    } else {
      const options = {
        message: imageHeader + "\n" + imageDesc + "\n",
        subject: "Denton Masjid Event",
        url: imageLink,
      };
      this.socialSharing.shareWithOptions(options)
      .then(response => {
        console.log(response);
      })
      .catch(e => {
        console.log(e);
      })
    }
}

  // async downloadImageAsync() {
  //   const url = await this.loadURL$;
  //   await this.downloadImage(url);
  // }

  //download not working for firebase storage
  async downloadImage(imageHeader: string, imagePath: string){
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
      const url = await this.getNotificationImageUrl(imagePath);
  
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
      link.setAttribute('download', `${imageHeader}.jpg`);
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

    // try {
    //   const imgSrc = await this.getNotificationImageUrl(imagePath);
    //   if (imgSrc) {
    //     console.log("imgSrc = "+imgSrc);
        
    //     const response = await fetch(imgSrc);
    //     console.log("Response" + response);
        
    //     const blob = await response.blob();
    //     console.log("blob = " + blob);
        
    //     const fileName = imageHeader.replace(/\s/g, '%20') + '.png';
    //     console.log("FileName = " + fileName);
        
    //     const filePath = this.file.externalDataDirectory + fileName;
    //     console.log("filePath = " + filePath);
        
  
    //     await this.file.writeFile(this.file.externalDataDirectory, fileName, blob, { replace: true });
  
    //     // Optionally notify the user that the download is complete
    //     console.log('Image downloaded successfully:', filePath);
    //     this.presentToast('Image download initiated');
    //   }
    // } catch (error) {
    //   console.error("Error downloading image: ", error);
    //   this.presentToast('Error downloading image');
    // }
  }

  // // WORKING ONE
  // async downloadImage(imageHeader: string, imagePath: string){
  //   const url = await this.getNotificationImageUrl(imagePath);
  //   if(url){
  //     try {
  //       const response = await fetch(url); // Fetch the image data
  //       const blob = await response.blob(); // Convert the response to a Blob object
  //       const objectUrl = URL.createObjectURL(blob); // Create a URL for the Blob object
  //       const link = document.createElement('a');
  //       link.href = objectUrl;
  //       link.setAttribute('download', imageHeader+'.jpeg');
  //       link.style.display = 'none';
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //       URL.revokeObjectURL(objectUrl); // Release the object URL
  //       this.presentToast('Image download initiated');
  //     } catch (error) {
  //       console.error("Error downloading image: ", error);
  //       this.presentToast('Error downloading image');
  //     }
  //   }
  // }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      buttons: [{
        text: 'X',
        role: 'cancel'
      }]
    });
    toast.present();
  }

  toggleAccordion(header: string) {
    this.openAccordions[header] = !this.openAccordions[header];
  }
}
