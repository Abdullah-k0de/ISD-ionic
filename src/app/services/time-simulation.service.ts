import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeSimulationService {
  private isSimulationMode = new BehaviorSubject<boolean>(false);
  private simulatedDate = new BehaviorSubject<string>(new Date().toISOString().split('T')[0]);
  private simulatedTime = new BehaviorSubject<string>(new Date().toTimeString().slice(0, 5));

  isSimulationMode$ = this.isSimulationMode.asObservable();
  simulatedDate$ = this.simulatedDate.asObservable();
  simulatedTime$ = this.simulatedTime.asObservable();

  constructor() { }

  getIsSimulationMode(): boolean {
    return this.isSimulationMode.value;
  }

  setIsSimulationMode(value: boolean): void {
    this.isSimulationMode.next(value);
  }

  getSimulatedDate(): string {
    return this.simulatedDate.value;
  }

  setSimulatedDate(value: string): void {
    this.simulatedDate.next(value);
  }

  getSimulatedTime(): string {
    return this.simulatedTime.value;
  }

  setSimulatedTime(value: string): void {
    this.simulatedTime.next(value);
  }

  /**
   * Returns a Date object representing "Now".
   * If simulation mode is active, it constructs a Date from simulatedDate and simulatedTime.
   * Otherwise, it returns new Date().
   */
  getNow(): Date {
    if (!this.isSimulationMode.value) {
      return new Date();
    }

    const [year, month, day] = this.simulatedDate.value.split('-').map(Number);
    const [hours, minutes] = this.simulatedTime.value.split(':').map(Number);
    
    // Construct local date from simulated values
    return new Date(year, month - 1, day, hours, minutes, 0);
  }
}
