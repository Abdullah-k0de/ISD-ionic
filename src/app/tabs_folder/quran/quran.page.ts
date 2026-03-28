import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, LoadingController, ModalController } from '@ionic/angular';
import { SurahPage } from 'src/app/pages/surah/surah.page';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-quran',
  templateUrl: './quran.page.html',
  styleUrls: ['./quran.page.scss'],
})
export class QuranPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  surahs: any[] = [];
  audioPlayer: HTMLAudioElement;
  nextAudioPlayer: HTMLAudioElement;
  currentSurahAyahs: any[] = [];
  currentAyahIndex: number = 0;
  playingSurahNumber: number | null = null;
  isPaused: boolean = false;
  reciters: any[] = [];
  selectedReciterId: string = localStorage.getItem('selectedReciterId') || 'ar.muhammadayyoub';
  currentSurahNumber: number;
  lastUsedReciterId: string;


  constructor(
    private httpService: HttpService,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
    this.audioPlayer = new Audio();
    this.nextAudioPlayer = new Audio();

    // reset state when a full surah ends
    this.audioPlayer.onended = () => {
      this.playingSurahNumber = null;
      this.isPaused = false;
    };
  }

  scrollToDown() {
    this.content.scrollToBottom(700);
  }
  scrollToTop() {
    this.content.scrollToTop(700);
  }

  async ngOnInit() {
    const loading = this.loadingController.create();
    (await loading).present();
    this.getSurahList();
    this.getRecitersList();
    (await loading).dismiss();
  }

  getSurahList() {
    this.httpService.getSurahList().subscribe(
      (res: any) => {
        this.surahs = res.data; // response has data property containing array of surahs
      },
      (error: any) => {
        console.error("API Error:", error);
      }
    );
  }

  async openSurahPage(surahName: string, surahNumber: string) {
    const modal = await this.modalController.create({
      component: SurahPage,
      componentProps: {
        surahName: surahName,
        surahNumber: surahNumber
      },
    });
    await modal.present();
    await modal.onDidDismiss();
    // Sync reciter if changed inside the modal
    this.selectedReciterId = localStorage.getItem('selectedReciterId') || 'ar.muhammadayyoub';
  }

  playCurrentAyah() {
    if (!this.currentSurahAyahs || this.currentSurahAyahs.length === 0) return;
    
    const ayah = this.currentSurahAyahs[this.currentAyahIndex];

    this.audioPlayer.onended = null;
    this.audioPlayer.oncanplaythrough = null;

    if (this.nextAudioPlayer.src === ayah.audio && this.nextAudioPlayer.readyState >= 3) {
      // Gapless swap
      const temp = this.audioPlayer;
      this.audioPlayer = this.nextAudioPlayer;
      this.nextAudioPlayer = temp;
      this.audioPlayer.play();
      this.setupSurahAudioListeners();
    } else {
      this.audioPlayer.src = ayah.audio;
      this.audioPlayer.load();

      this.audioPlayer.oncanplaythrough = () => {
        this.audioPlayer.play().catch(e => console.error(e));
      };
      this.setupSurahAudioListeners();
    }

    // Preload next
    if (this.currentAyahIndex + 1 < this.currentSurahAyahs.length) {
      const nextAyah = this.currentSurahAyahs[this.currentAyahIndex + 1];
      this.nextAudioPlayer.src = nextAyah.audio;
      this.nextAudioPlayer.load();
    }
  }

  setupSurahAudioListeners() {
    this.audioPlayer.onended = () => {
      this.audioPlayer.onended = null;
      if (this.currentAyahIndex + 1 < this.currentSurahAyahs.length) {
        this.currentAyahIndex++;
        this.playCurrentAyah();
      } else {
        this.playingSurahNumber = null;
        this.isPaused = false;
        this.currentSurahAyahs = [];
      }
    };
  }

  playSurah(surahNumber: number) {
    const reciterId = this.selectedReciterId || 'ar.muhammadayyoub';
    const apiUrl = `https://api.alquran.cloud/v1/surah/${surahNumber}/${reciterId}`;
    
    // We update UI immediately to indicate loading/playing
    this.currentSurahNumber = surahNumber;
    this.playingSurahNumber = surahNumber;
    this.isPaused = false;
    this.lastUsedReciterId = reciterId;
    this.currentAyahIndex = 0;

    this.httpService.getSurahList(apiUrl).subscribe(
      (res: any) => {
        this.currentSurahAyahs = res.data.ayahs;
        this.playCurrentAyah(); // Play fresh from start
      },
      (error: any) => {
        console.error("API Error fetching surah:", error);
      }
    );
  }


  togglePlayPause(event: Event, surahNumber: number) {
    event.stopPropagation();

    if (this.playingSurahNumber === surahNumber) {
      if (this.audioPlayer.paused) {
        this.audioPlayer.play();
        this.isPaused = false;
      } else {
        this.audioPlayer.pause();
        this.isPaused = true;
      }
    } else {
      this.playSurah(surahNumber);
    }
  }

  isSurahPlaying(surahNumber: number): boolean {
    return this.playingSurahNumber === surahNumber && !this.isPaused;
  }

  getRecitersList(){
    this.httpService.getRecitersForAyah().subscribe(data => {
    this.reciters = data;
    });
  }

  onReciterChange() {
    console.log('Selected Identifier:', this.selectedReciterId);
    localStorage.setItem('selectedReciterId', this.selectedReciterId);
    // If user has a surah loaded, reload it
    if (this.currentSurahNumber) {
      this.playSurah(this.currentSurahNumber);
    }
  }

  // updateCurrentSurahWithReciter() {
  //   const reciterId = this.selectedReciterId || 'ar.alafasy';
  //   const apiUrl = `https://api.alquran.cloud/v1/surah/${this.currentSurahNumber}/${reciterId}`;

  //   this.httpService.getSurahList(apiUrl).subscribe(
  //     (res: any) => {
  //       this.currentSurahAyahs = res.data.ayahs;
  //       this.lastUsedReciterId = reciterId;
  //       // Don't play — just update
  //     },
  //     (error: any) => {
  //       console.error("Error updating surah with new reciter:", error);
  //     }
  //   );
  // }

}
