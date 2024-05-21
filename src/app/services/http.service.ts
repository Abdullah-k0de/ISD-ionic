import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Random } from '../classes/random';
import { HadithClass } from '../classes/hadith-class';
import { AdhanClass } from '../classes/adhan-class';
import { delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  hadiths: HadithClass = new HadithClass("","","","");
  adhans: AdhanClass = new AdhanClass;

  constructor(private http: HttpClient) {  }

  private generateRandomNumber(): number{
    const now = new Date();
    const seed = now.getDate() + now.getMonth() + now.getFullYear();
    const random = new Random(seed);
    return random.nextInt(2962, 3100);
    // return 3057;
  }

  getHadith() {
    let id_hadith: number = this.generateRandomNumber();
    let attempts: number = 0;       // Track the number of attempts made
    
    // Function to make API call and handle response
    const makeAPICall = (id: number) => {
      const apiUrl = `https://hadeethenc.com/api/v1/hadeeths/one/?language=en&id=${id}`;
      this.http.get<HadithClass>(apiUrl).subscribe((res) => {
          this.hadiths = res;
          if(this.hadiths.hadeeth == ""){
            id++;
            attempts++;
            makeAPICall(id);
          }
          console.log(res);
          console.log("Satisfactory response received from Hadiths.");
        },
        (error) => {
          if (error.status === 404) {
            // Increment the id if it's 404 and attempts < 5
            console.log("404 Error from Hadiths!");
            console.log("Before: " + id);
            id++;
            console.log(`Trying next ID: ${id}; Attempt #${attempts + 1}`);
            attempts++;
            if(attempts < 5){
              makeAPICall(id);
            } else {
              // Show default values after 5 attempts of API call
              console.log("Maximum attempts reached. Showing default values.");
              this.hadiths = new HadithClass("Default Hadith...Plz work", "Default Explanation", "Default arabic hadith", "Default arabic explanation");    //Default Hadiths
            }
          } else {
            // Handle other errors if needed
            console.error("API Error:", error);
          }        
        }
      );
    };
    // Call the API for the first time
    makeAPICall(id_hadith);
  }

  // ERROR: TypeError: Cannot read properties of undefined (reading 'timings')
  getAdhanTimes(){
    // Function to make API call and handle response
    const makeAdhanAPICall = () => {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        const date = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
        const coordinates = "?latitude=33.201662695006874&longitude=-97.14494994434574&method=2";
        console.log("Date being recieved is: "+date);
        const apiUrl = `https://api.aladhan.com/v1/timings/date=${date}${coordinates}`;
        this.http.get<AdhanClass>(apiUrl).subscribe((res: AdhanClass) => {
            this.adhans = res;
            console.log(res);
            console.log("Satisfactory response received from Adhans.");          
          },
          (error) => {
            if (error.status === 404) {
              // Do nothing if it's 404
              console.log("404 Error from Adhans!");
            } else {
              // Handle other errors if needed
              console.error("API Error:", error);
            }
          }
      );
    };
    makeAdhanAPICall();
  }
}