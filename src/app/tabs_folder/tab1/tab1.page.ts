import { Component, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { HadithClass } from 'src/app/classes/hadith-class';
import { HttpService } from 'src/app/services/http.service';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  @ViewChild(IonContent) content: IonContent;
  platform: any;
  isAccordionOpen: boolean = false;
  introductionText: string = "The Islamic Society of Denton (ISD) is a non-profit religious organization founded to serve the Greater Denton area community. ISD is dedicated towards worship, education and services according to Islamic faith principles as dictated by the Quran and the authentic sayings and traditions of Prophet Mohammed, peace be upon him. The Masjid (Mosque) was built, primarily, by residents of Denton, which included students attending both the University of North Texas and Texas Woman's University. Through hard work and generous donations, the Islamic Society of Denton opened in August of 1981 making it the first Masjid built in the State of Texas. ISD is not affiliated with any private, public or any other political organizations and/or governments.";

  constructor(public httpService: HttpService) {
    // this.httpService.getHadith();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.httpService.getHadith();
  }

  scrollToTop() {
    // Passing a duration to the method makes it so the scroll slowly
    this.content.scrollToTop(500);
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.httpService.getHadith();
      event.target.complete();
    }, 1000);
  }

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;    
  }

  public openMapsApp() {
      console.log("Entered Maps function");  //This is working
      window.location.href = 'https://maps.apple.com/?q=' + encodeURIComponent('1105 Greenlee St, Denton');     // I think this is not working
      // window.location.href = 'maps://maps.apple.com/?q=' + encodeURIComponent('1105 Greenlee St, Denton');
  }

}
