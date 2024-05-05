import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements AfterViewInit{
  @ViewChild('iframeCal') iframeCal: ElementRef;


  constructor() {}
  ngAfterViewInit(): void {
    // this.iframeCal.nativeElement.style.width = window.innerWidth + 'px';
    // this.iframeCal.nativeElement.style.height = window.innerHeight + 'px';
  }

}
