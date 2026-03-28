import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { IonContent, IonMenu, LoadingController, MenuController, ModalController, ToastController } from '@ionic/angular';
import { Observable, map, subscribeOn } from 'rxjs';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-surah',
  templateUrl: './surah.page.html',
  styleUrls: ['./surah.page.scss'],
})
export class SurahPage implements OnInit {
  @ViewChild(IonContent) contents: IonContent;
  @ViewChild(IonMenu) menu: IonMenu;
  @Input() surahName: string;
  @Input() surahNumber: string;

  surahText: any[] = [];
  surahTextTranslation: any[] = [];
  currentAyahNumber: number | null = null;
  audioPlayer: HTMLAudioElement;
  nextAudioPlayer = new Audio();
  isPlaying: boolean = false;
  fontSize: number = 18; // Default font size
  translationMode: boolean = false;
  ayahNumber: number; // go to ayah feature
  reciters: any[] = [];
  selectedReciterId: string = localStorage.getItem('selectedReciterId') || 'ar.muhammadayyoub';


  @ViewChild('audioPlayer', { static: true }) set content(content: any) {
    if (content) { // check if content is defined
      this.audioPlayer = content.nativeElement;
      this.audioPlayer.onended = () => {
        this.currentAyahNumber = null; // Reset currentAyahNumber when audio ends
      };
    }
  };

  constructor(
    private modalController: ModalController,
    private httpService: HttpService,
    private loadingController: LoadingController,
    private menuController: MenuController,
    private socialSharing: SocialSharing,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    const loading = await this.loadingController.create();
    await loading.present();
    this.getRecitersList();
    this.getSurahArabicText();
    await loading.dismiss();
  }

  getRecitersList() {
    this.httpService.getRecitersForAyah().subscribe(data => {
      this.reciters = data;
    });
  }

  onReciterChange() {
    localStorage.setItem('selectedReciterId', this.selectedReciterId);
    this.getSurahArabicText();
  }

  close() {
    this.audioPlayer.pause();
    this.isPlaying = false;
    this.modalController.dismiss();
  }

  closeMenu() {
    this.menu.close();
  }

  scrollToDown() {
    this.contents.scrollToBottom(700);
  }

  scrollToTop() {
    this.contents.scrollToTop(700);
  }

  openMenu() {
    this.menuController.open('fontSizeMenu'); // Open the menu with the specified ID
  }

  updateFontSize() {
    this.contents.getScrollElement().then((scrollElement) => {
      scrollElement.style.setProperty('--font-size', `${this.fontSize}px`);
    });
  }

  // getSurahArabicText() {
  //   const reciterId = this.selectedReciterId || 'ar.muhammadayyoub';
  //   const translationEdition = 'en.asad';
  //   const apiUrl = `https://api.alquran.cloud/v1/surah/${this.surahNumber}/editions/${reciterId},${translationEdition}`;

  //   this.surahText = this.httpService.getSurahList(apiUrl).pipe(
  //     map((res: any) => {
  //       const arabicAyahs = res.data[0].ayahs;
  //       this.surahTextTranslation = res.data[1].ayahs;

  //       return arabicAyahs; // ayahs already include .audio field from API!
  //     })
  //   );
  // }
  getSurahArabicText() {
    const arabicEditionId = this.selectedReciterId || 'ar.muhammadayyoub';
    const translationEdition = 'en.asad';
    const apiUrl = `https://api.alquran.cloud/v1/surah/${this.surahNumber}/editions/${arabicEditionId},${translationEdition}`;

    this.httpService.getSurahList(apiUrl).subscribe((res: any) => {
      this.surahText = res.data[0]?.ayahs || [];
      this.surahTextTranslation = res.data[1]?.ayahs || [];
    });
  }

  toggleTranslationMode() {
    this.translationMode = !this.translationMode;
  }

  shareAyah(ayahText: string, translation: string) {
    const options = {
      message: ayahText + "\n" + translation + "\n\n-" + this.surahName,
      subject: "Quran Ayah",
    };

    console.log("OPTIONS ", options);

    this.socialSharing.shareWithOptions(options)
      .then(res => {
        console.log(res);
      }).catch(e => {
        console.log(e);
      })
  }

  // playAudio(ayahNumber: number, audioUrl: string) {
  //   const audio = this.audioPlayer;
  //   if (this.currentAyahNumber === ayahNumber) {
  //     if (audio.paused) {
  //       audio.play();
  //     } else {
  //       audio.pause();
  //     }
  //   } else {
  //     this.currentAyahNumber = ayahNumber;
  //     audio.src = audioUrl;
  //     audio.load();
  //     audio.oncanplaythrough = () => {
  //       audio.play();
  //     };

  //   }
  playAudio(ayahNumberInSurah: number, audioUrl: string) {
    if (this.currentAyahNumber === ayahNumberInSurah) {
      if (this.audioPlayer.paused) {
        this.audioPlayer.play();
        this.isPlaying = true;
      } else {
        this.audioPlayer.pause();
        this.isPlaying = false;
      }
      return;
    }

    this.currentAyahNumber = ayahNumberInSurah;
    this.audioPlayer.onended = null;
    this.audioPlayer.oncanplaythrough = null;

    if (this.nextAudioPlayer.src === audioUrl && this.nextAudioPlayer.readyState >= 3) {
      // Gapless swap
      const temp = this.audioPlayer;
      this.audioPlayer = this.nextAudioPlayer;
      this.nextAudioPlayer = temp;
      this.audioPlayer.play();
      this.isPlaying = true;
      this.setupSurahAudioListeners(ayahNumberInSurah);
      this.scrollToAyah(ayahNumberInSurah);
    } else {
      this.audioPlayer.src = audioUrl;
      this.audioPlayer.load();

      this.audioPlayer.oncanplaythrough = () => {
        this.audioPlayer.play();
        this.isPlaying = true;
      };
      this.setupSurahAudioListeners(ayahNumberInSurah);
      this.scrollToAyah(ayahNumberInSurah);
    }

    // 🔁 Preload next ayah
    const currentIndex = this.surahText.findIndex(
      ayah => ayah.numberInSurah === ayahNumberInSurah
    );
    const nextAyah = this.surahText[currentIndex + 1];
    if (nextAyah) {
      this.nextAudioPlayer.src = nextAyah.audio;
      this.nextAudioPlayer.load();
    }
  }

  setupSurahAudioListeners(ayahNumberInSurah: number) {
    this.audioPlayer.onended = () => {
      this.audioPlayer.onended = null;
      const currentIndex = this.surahText.findIndex(
        ayah => ayah.numberInSurah === this.currentAyahNumber
      );

      const nextAyah = this.surahText[currentIndex + 1];
      if (nextAyah) {
        this.playAudio(nextAyah.numberInSurah, nextAyah.audio);
      } else {
        this.currentAyahNumber = null;
        this.isPlaying = false;
      }
    };
  }

  scrollToAyah(ayahNumber: number) {
    setTimeout(async () => {
      const element = document.getElementById(`ayah-${ayahNumber}`);
      if (element) {
        const scrollElement = await this.contents.getScrollElement();
        const viewportHeight = scrollElement.clientHeight;
        const targetY = element.offsetTop - (viewportHeight / 2) + (element.clientHeight / 2);

        // Using a longer duration (800ms) for a more "regal" and fluid-feeling transition
        this.contents.scrollToPoint(0, targetY, 800);
      }
    }, 150);
  }

  toggleGlobalPlayPause() {
    const audio = this.audioPlayer;

    // If nothing is playing yet, start from the first ayah
    if (!this.currentAyahNumber || !audio.src) {
      if (this.surahText && this.surahText.length > 0) {
        const firstAyah = this.surahText[0];
        this.playAudio(firstAyah.numberInSurah, firstAyah.audio);
      }
      return;
    }

    // Otherwise, toggle pause/resume
    if (audio.paused) {
      audio.play();
      this.isPlaying = true;
    } else {
      audio.pause();
      this.isPlaying = false;
    }
  }

  async onSearchAyah(event: any) {
    const ayahNumber = event.target.value;
    // Check if the input is empty
    if (!ayahNumber) {
      return; // Do nothing if input is empty
    }

    const element = document.getElementById(`ayah-${ayahNumber}`);
    if (element) {
      this.contents.scrollToPoint(0, element.offsetTop, 700);
    } else {
      // Show toast message when Ayah number is out of range
      const toast = await this.toastController.create({
        message: `Ayah number ${ayahNumber} out of range!`,
        duration: 1500,
        color: 'danger',
        buttons: [
          {
            role: 'cancel',
            text: 'X'
          }
        ],
      });
      toast.present();
    }
  }

}
