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
  currentSurahAyahs: any[] = [];
  currentAyahIndex: number = 0;
  playingSurahNumber: number | null = null;
  isPaused: boolean = false;
  reciters: any[] = [];
  selectedReciterId: string = 'ar.muhammadayyub';
  currentSurahNumber: number;
  lastUsedReciterId: string;


  constructor(
    private httpService: HttpService,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
    this.audioPlayer = new Audio();

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
    modal.present();
  }

  // playCurrentAyah() {
  //   const ayah = this.currentSurahAyahs[this.currentAyahIndex];
  //   this.audioPlayer.src = ayah.audio;
  //   this.audioPlayer.load();
  //   this.audioPlayer.oncanplaythrough = () => {
  //     this.audioPlayer.play();
  //   };
  // }


  // playCurrentAyah() {
  //   const ayah = this.currentSurahAyahs[this.currentAyahIndex];
  //   this.audioPlayer.src = ayah.audio;
  //   this.audioPlayer.load();

  //   // Preload next
  //   if (this.currentAyahIndex + 1 < this.currentSurahAyahs.length) {
  //     const nextAyah = this.currentSurahAyahs[this.currentAyahIndex + 1];
  //     this.nextAudio.src = nextAyah.audio;
  //     this.nextAudio.load(); // preload
  //   }

  //   this.audioPlayer.oncanplaythrough = () => {
  //     this.audioPlayer.play();
  //   };

  //   this.audioPlayer.onended = () => {
  //     if (this.currentAyahIndex < this.currentSurahAyahs.length - 1) {
  //       this.currentAyahIndex++;
  //       this.playCurrentAyah();
  //     }
  //   };
  // }


  // playSurah(surahNumber: number) {
  //   const reciterId = this.selectedReciterId || 'ar.muhammadayyoub'; // default 
  //   if (this.lastUsedReciterId !== reciterId || this.currentSurahNumber !== surahNumber) {

  //     const apiUrl = `https://api.alquran.cloud/v1/surah/${surahNumber}/${reciterId}`;
      
  //     this.httpService.getSurahList(apiUrl).subscribe(
  //       (res: any) => {
  //         this.currentSurahNumber = surahNumber;
  //         this.currentSurahAyahs = res.data.ayahs;
  //         this.currentAyahIndex = 0;
  //         this.playCurrentAyah(); // Play fresh from start
  //       },
  //       (error: any) => {
  //         console.error("API Error:", error);
  //       }
  //     );
  //   }
  // }

  playSurah(surahNumber: number) {
    const reciterId = this.selectedReciterId || 'ar.muhammadayyub';
    const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahNumber}.mp3`;

    console.log("Playing:", audioUrl);

    this.audioPlayer.src = audioUrl;
    this.audioPlayer.load();

    this.audioPlayer.oncanplaythrough = () => {
      this.audioPlayer.play().catch(err => {
        console.error("Playback error:", err);
        // this.handleAudioError("Playback failed. Try another reciter.");
      });
    };

    this.audioPlayer.onerror = () => {
      console.error("Audio failed to load:", audioUrl);
      // this.handleAudioError("Audio not available for this reciter.");
    };

    this.currentSurahNumber = surahNumber;
    this.playingSurahNumber = surahNumber;
    this.isPaused = false;
    this.lastUsedReciterId = reciterId;
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
      this.currentAyahIndex = 0;
      this.playingSurahNumber = surahNumber;
      this.playSurah(surahNumber);
      this.isPaused = false;
    }
  }

  isSurahPlaying(surahNumber: number): boolean {
    return this.playingSurahNumber === surahNumber && !this.isPaused;
  }

  getRecitersList(){
    this.httpService.getSurahReciters().subscribe(data => {
    this.reciters = data;
    });
  }

  onReciterChange() {
    console.log('Selected Identifier:', this.selectedReciterId);
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
