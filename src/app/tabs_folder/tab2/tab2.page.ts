import { Component } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { collection } from 'firebase/firestore';
import { Iqama, IqamaClass } from 'src/app/classes/iqama-class';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  iqama$ : Observable<Iqama[]>;
  hourOfDay: string = "day";
  IqamaTimes: IqamaClass = new IqamaClass;

  constructor(public httpService: HttpService, private readonly firestore: Firestore) {
    this.updateImageBasedOnTime();
    this.httpService.getAdhanTimes();
    this.iqama$ = collectionData(collection(this.firestore, 'iqama_time')) as Observable<Iqama[]>;
    this.loadTimings();
  }

  loadTimings(){    
    this.iqama$.subscribe(iqamaArray => {
      iqamaArray.forEach(iq => {
        this.IqamaTimes.fajr = iq.fajr;
        this.IqamaTimes.duhr = iq.duhr;
        this.IqamaTimes.asr = iq.asr;
        this.IqamaTimes.maghrib = this.addTimes(this.httpService.adhans.data.timings.Maghrib, iq.maghrib);
        this.IqamaTimes.isha = iq.isha;
        this.IqamaTimes.jummah = iq.jummah;
        this.IqamaTimes.jummahUNT = iq.jummahUNT;        
      });
    });
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.updateImageBasedOnTime();
      this.httpService.getAdhanTimes();
      this.loadTimings();
      event.target.complete();
    }, 1000);
  }

  async updateImageBasedOnTime(){
    const currentHour = new Date().getHours();
    this.hourOfDay = currentHour >= 18 ? 'night' : 'day';
  }

  // Method to convert 24-hour format to 12-hour format with AM or PM
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const amPM = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${amPM}`;
  }

  addTimes(adhanTime: string, incrementTime: string) {
    // Parse adhan time and increment time into hours and minutes
    const [adhanHours, adhanMinutes] = adhanTime.split(':').map(Number);
    const [incrementHours, incrementMinutes] = incrementTime.split(':').map(Number);
  
    // Add minutes and handle carryover
    let totalMinutes = adhanMinutes + incrementMinutes;
    const carryHours = Math.floor(totalMinutes / 60);
    const adjustedMinutes = totalMinutes % 60;
  
    // Add hours and handle carryover
    let totalHours = adhanHours + incrementHours + carryHours;
    totalHours = totalHours % 24; // Ensure it stays within 24-hour format
  
    // Format the result
    const resultHours = totalHours.toString().padStart(2, '0');
    const resultMinutes = adjustedMinutes.toString().padStart(2, '0');
  
    // Return the result
    return `${resultHours}:${resultMinutes}`;
  }

  public openMapsApp(address: string) {
    console.log("Entered Maps function");  //This is working
    window.location.href = 'https://maps.apple.com/?q=' + encodeURIComponent(address);     // I think this is not working
    // window.location.href = 'maps://maps.apple.com/?q=' + encodeURIComponent('1105 Greenlee St, Denton');
  }
  
}
