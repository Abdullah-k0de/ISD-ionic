import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Random } from '../classes/random';
import { HadithClass } from '../classes/hadith-class';
import { AdhanClass } from '../classes/adhan-class';
import { Observable, delay, map } from 'rxjs';
import { SurahList } from '../classes/surah-list';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  hadiths: HadithClass = new HadithClass("","","","","","");
  adhans: AdhanClass = new AdhanClass;
  surahs: SurahList = new SurahList;
  reciters: any[] = [];

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
              this.hadiths = new HadithClass(
                `The first thing among their deeds for which the people will be brought to account on the Day of Resurrection will be prayer. Our Lord will say to His angels, although He knows best, "Look at My slave’s prayer, is it complete or lacking?" If it is complete, it will be recorded as complete, but if it is lacking, He will say, "Look and see whether my slave did any optional prayers." If he had done voluntary prayers, He will say, "Complete the obligatory prayers of My slave from his voluntary prayers." Then the rest of his deeds will be examined in a similar manner.`,
                `On the Day of Resurrection each person will be brought to account for every major and minor action, even though he has already been brought to account for that in the grave. The first thing for which he will be brought to account for then will be his prayer. On the Day of Resurrection, people will be asked about other matters, including the following: It was narrated from Ibn Mas'ud (may Allah be pleased with him) that the Prophet (peace and blessings of Allah be upon him) said: "The son of Adam will not be dismissed from before his Lord on the Day of Resurrection until he has been questioned about five things: his life and how he spent it, his youth and how he used it, his wealth and how he earned it and how he disposed of it, and how he acted upon what he acquired of knowledge." (Narrated by At-Tirmidhi, 2422; classed as sound by Al-Albani in Sahih At-Tirmidhi, 1969) And the nations will be asked on the Day of Resurrection: "What answer gave you to the Messengers?" [Al-Qasas 28:65 – interpretation of the meaning] These are some of the things about which people will be asked on the Day of Resurrection. So the wise person who is keen to save himself should prepare answers to these questions. We ask Allah to guide us to the straight path.`,
                `إن أول ما يُحاسب به الناس من أعمالهم يوم القيامة هو الصلاة. يقول ربنا لملائكته، وهو أعلم، "انظروا إلى صلاة عبدي، هل هي كاملة أم ناقصة؟" فإذا كانت كاملة تُكتب له كاملة، وإن كانت ناقصة يقول، "انظروا هل لعبدي من تطوع؟" فإن كان له تطوع، يقول، "أكملوا لعبدي فريضته من تطوعه." ثم يُنظر في سائر أعماله على نحو ذلك.`,
                `في يوم القيامة سيحاسب كل شخص على كل عمل كبير وصغير، حتى وإن كان قد حُوسب على ذلك في القبر. وأول ما سيُحاسب عليه حينها هو صلاته. في يوم القيامة، سيُسأل الناس عن أمور أخرى، ومنها ما روي عن ابن مسعود (رضي الله عنه) أن النبي (صلى الله عليه وسلم) قال: "لا تزول قدما ابن آدم يوم القيامة من عند ربه حتى يُسأل عن خمس: عن عمره فيم أفناه، وعن شبابه فيم أبلاه، وماله من أين اكتسبه وفيم أنفقه، وماذا عمل فيما علم." (رواه الترمذي، 2422؛ وصححه الألباني في صحيح الترمذي، 1969) وستُسأل الأمم يوم القيامة: "ماذا أجبتم المرسلين؟" [القصص 28:65 - تفسير المعنى] هذه بعض الأمور التي سيُسأل عنها الناس يوم القيامة. لذلك ينبغي للإنسان الحكيم الذي يحرص على إنقاذ نفسه أن يُعد إجابات لهذه الأسئلة. نسأل الله أن يهدينا إلى الصراط المستقيم.`,
                `Sahih/Authentic`,
                `Narrated by Abu Dawud, 864; classed as authentic by Al-Albani in Sahih Abu Dawud, 770`
            ); // Default Hadiths
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

  // getAdhanTimes(){
  //   // Function to make API call and handle response
  //   const makeAdhanAPICall = () => {
  //       const today = new Date();
  //       const day = today.getDate();
  //       const month = today.getMonth() + 1;
  //       const year = today.getFullYear();
  //       const date = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
  //       const coordinates = "?latitude=33.201662695006874&longitude=-97.14494994434574&method=2";
  //       console.log("Date being recieved is: "+date);
  //       const apiUrl = `https://api.aladhan.com/v1/timings/date=${date}${coordinates}`;
  //       this.http.get<AdhanClass>(apiUrl).subscribe((res: AdhanClass) => {
  //           this.adhans = res;
  //           console.log(res);
  //           console.log("Satisfactory response received from Adhans.");          
  //         },
  //         (error) => {
  //           if (error.status === 404) {
  //             // Do nothing if it's 404
  //             console.log("404 Error from Adhans!");
  //           } else {
  //             // Handle other errors if needed
  //             console.error("API Error:", error);
  //           }
  //         }
  //     );
  //   };
  //   makeAdhanAPICall();
  // }

  getNewAdhanTimes(){
    // Function to make API call and handle response
    const makeAdhanAPICall = () => {
        const apiUrl = `https://masjidal.com/api/v1/time/range?masjid_id=O8L7ppA5`;
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

  getSurahList(url?: string): Observable<any>{
    // Function to make API call and handle response
    const apiUrl = `https://api.alquran.cloud/v1/surah`;
    const makeSurahAPICall = () => {
      if(url){
          this.http.get<SurahList>(url).subscribe((res: SurahList) => {
            this.surahs = res;
            console.log(res);
            console.log("Satisfactory response received from Surah Lists.");          
          },
          (error) => {
            if (error.status === 404) {
              // Do nothing if it's 404
              console.log("404 Error from Surah Lists with Passed url!");
            } else {
              // Handle other errors if needed
              console.error("API Error:", error);
            }
          }
        );
      } else {
        this.http.get<SurahList>(apiUrl).subscribe((res: SurahList) => {
            this.surahs = res;
            console.log(res);
            console.log("Satisfactory response received from Surah Lists.");          
          },
          (error) => {
            if (error.status === 404) {
              // Do nothing if it's 404
              console.log("404 Error from Surah Lists!");
            } else {
              // Handle other errors if needed
              console.error("API Error:", error);
            }
          }
        );
      }
    };
    if(url)
      return this.http.get(url);
    else
      return this.http.get(apiUrl);
  }

  getRecitersForAyah(): Observable<any[]> {
    const apiURL = 'https://api.alquran.cloud/v1/edition/format/audio';
    
    return this.http.get<any>(apiURL).pipe(
    map(res => {
      const allReciters = res.data || [];

      return allReciters
        .filter((r: { language: string; }) => r.language === 'ar') // keep Arabic
        .map((r: { language: string; name: any; }) => {
          return r;
        });
      })
    );
  }

  getSurahReciters(): Observable<any[]> {
    const apiUrl = 'https://raw.githubusercontent.com/islamic-network/cdn/master/info/cdn_surah_audio.json';
    return this.http.get<any[]>(apiUrl).pipe(
      map(reciters =>
        reciters.filter(r =>
          r.identifier?.startsWith('ar.')
        )
      )
    );
  }

}