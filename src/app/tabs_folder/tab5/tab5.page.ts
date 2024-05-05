import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page implements OnInit, AfterViewInit {

  @ViewChild('iframeSun') iframeSun: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
     
    //reloading the frame
     this.reloadIframe();
  }
  
  //Function to reload the iframe content
  reloadIframe(){
      this.iframeSun.nativeElement.src = 'https://sunnah.com';
  }

}
