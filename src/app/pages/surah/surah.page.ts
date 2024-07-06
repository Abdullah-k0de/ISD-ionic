import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { IonContent, IonMenu, LoadingController, MenuController, ModalController } from '@ionic/angular';
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

  surahText: Observable<any[]>;
  surahTextTranslation: any[] = [];
  currentAyahNumber: number | null = null;
  audioPlayer: HTMLAudioElement;
  fontSize: number = 18; // Default font size
  darkMode: boolean = false; // Track the dark mode state
  translationMode: boolean= false;


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
    private socialSharing: SocialSharing
  ) { }

  async ngOnInit() {
    const loading = await this.loadingController.create();
    await loading.present();
    this.getSurahArabicText();
    await loading.dismiss();
  }

  close() {
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

  getSurahArabicText() {
    const apiUrl = `https://api.alquran.cloud/v1/surah/${this.surahNumber}/editions/ar.alafasy,en.asad`;
    // this.httpService.getSurahList(apiUrl).subscribe(
    //   (res: any) => {
    //     this.surahText = res.data.at(0).ayahs; // Assuming response has data property containing array of surahs
    //     this.surahTextTranslation = res.data.at(1).ayahs;
    //     console.log("Surah Text received:", this.surahText);
    //     console.log("Srah Translation Text:", this.surahTextTranslation);
        
    //   },
    //   (error: any) => {
    //     console.error("API Error:", error);
    //   }
    // );
    this.surahText = this.httpService.getSurahList(apiUrl).pipe(
      map((res: any) => {
        this.surahTextTranslation = res.data[1].ayahs;
        return res.data[0].ayahs;
      })
    );
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    const mainContent = document.getElementById('main-content');
    if (this.darkMode) {
      mainContent?.classList.add('dark-mode');
    } else {
      mainContent?.classList.remove('dark-mode');
    }
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
