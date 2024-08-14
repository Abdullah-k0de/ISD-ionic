import { Component } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  hourOfDay: string = "day";

  constructor(public httpService: HttpService) {
    this.updateImageBasedOnTime();
    this.httpService.getNewAdhanTimes();
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.updateImageBasedOnTime();
      this.httpService.getNewAdhanTimes();
      event.target.complete();
    }, 1000);
  }

  async updateImageBasedOnTime(){
    const currentHour = new Date().getHours();
    this.hourOfDay = currentHour >= 18 ? 'night' : 'day';
  }

  public openMapsApp(address: string) {
    console.log("Entered Maps function");  //This is working
    window.location.href = 'https://maps.apple.com/?q=' + encodeURIComponent(address);     // I think this is not working
    // window.location.href = 'maps://maps.apple.com/?q=' + encodeURIComponent('1105 Greenlee St, Denton');
  }
  
}
