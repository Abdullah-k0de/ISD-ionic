import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-surah',
  templateUrl: './surah.page.html',
  styleUrls: ['./surah.page.scss'],
})
export class SurahPage implements OnInit {
  @Input() surahName: string;
  @Input() surahNumber: string;
  surahText: any[] = [];
  surahTextTranslation: any[] = [];
  currentAyahNumber: number | null = null;
  audioPlayer: HTMLAudioElement; // Define audioPlayer with the correct type

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
    private loadingController: LoadingController
  ) { }

  async ngOnInit() {
    const loading = this.loadingController.create();
    (await loading).present();
    this.getSurahArabicText();
    (await loading).dismiss();
  }

  close() {
    this.modalController.dismiss();
  }

  getSurahArabicText() {
    const apiUrl = `http://api.alquran.cloud/v1/surah/${this.surahNumber}/editions/ar.alafasy,en.asad`;
    this.httpService.getSurahList(apiUrl).subscribe(
      (res: any) => {
        this.surahText = res.data.at(0).ayahs; // Assuming response has data property containing array of surahs
        this.surahTextTranslation = res.data.at(1).ayahs;
        console.log("Surah Text received:", this.surahText);
        console.log("Srah Translation Text:", this.surahTextTranslation);
        
      },
      (error: any) => {
        console.error("API Error:", error);
      }
    );
  }

  playAudio(ayahNumber: number, audioUrl: string) {
    const audio = this.audioPlayer;
    if (this.currentAyahNumber === ayahNumber) {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    } else {
      this.currentAyahNumber = ayahNumber;
      audio.src = audioUrl;
      audio.load();
      audio.oncanplaythrough = () => {
        audio.play();
      };
    }
  }

}
