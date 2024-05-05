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

  constructor(public httpService: HttpService) {
    this.httpService.getHadith();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }

  scrollToTop() {
    // Passing a duration to the method makes it so the scroll slowly
    // goes to the top instead of instantly
    this.content.scrollToTop(500);
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
