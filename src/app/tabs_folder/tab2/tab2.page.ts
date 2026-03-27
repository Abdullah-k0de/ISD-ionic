import { Component } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { IqamaService, IqamaTimes } from 'src/app/services/iqama.service';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  hourOfDay: string = "day";
  iqamaTimes: IqamaTimes = { fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '' };

  constructor(public httpService: HttpService, private iqamaService: IqamaService) {
    this.updateImageBasedOnTime();
    this.httpService.getNewAdhanTimes();
    this.iqamaService.fetchIqamaTimes().subscribe(times => {
      this.iqamaTimes = times;
    });
  }

  handleRefresh(event: any) {
    this.httpService.getNewAdhanTimes();
    this.iqamaService.fetchIqamaTimes().subscribe(times => {
      this.iqamaTimes = times;
      this.updateImageBasedOnTime();
      event.target.complete();
    });
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
