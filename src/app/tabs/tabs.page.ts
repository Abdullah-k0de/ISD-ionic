import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage{

  // @ViewChild('iframe') iframe: ElementRef;

  constructor() {}
  // ngAfterViewInit(): void {
  //   //Setting the size of the frame
  //   this.iframe.nativeElement.style.width = window.innerWidth + 'px';
  //   this.iframe.nativeElement.style.height = window.innerHeight + 'px';  
  // }

  // openLink(){
  //   const url:any = 'https://sunnah.com';
  //   this.iframe.nativeElement.src = url;
  // }

}
