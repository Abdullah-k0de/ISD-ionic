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

  constructor(
    private httpService: HttpService,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
    this.audioPlayer = new Audio();
    this.audioPlayer.onended = () => {
      this.currentAyahIndex++;
      if (this.currentAyahIndex < this.currentSurahAyahs.length) {
        this.playCurrentAyah();
      } else {
        this.playingSurahNumber = null;
        this.isPaused = false;  // Reset play/pause state when surah ends
      }
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

  playCurrentAyah() {
    const ayah = this.currentSurahAyahs[this.currentAyahIndex];
    this.audioPlayer.src = ayah.audio;
    this.audioPlayer.load();
    this.audioPlayer.oncanplaythrough = () => {
      this.audioPlayer.play();
    };
  }

  playSurah(surahNumber: number) {
    const apiUrl = `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`;
    this.httpService.getSurahList(apiUrl).subscribe(
      (res: any) => {
        console.log("currentSurahAyahs: ", this.currentAyahIndex);
        
        this.currentSurahAyahs = res.data.ayahs;
        this.playCurrentAyah();
      },
      (error: any) => {
        console.error("API Error:", error);
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
      this.currentAyahIndex = 0;
      this.playingSurahNumber = surahNumber;
      this.playSurah(surahNumber);
      this.isPaused = false;
    }
  }

  isSurahPlaying(surahNumber: number): boolean {
    return this.playingSurahNumber === surahNumber && !this.isPaused;
  }

}
