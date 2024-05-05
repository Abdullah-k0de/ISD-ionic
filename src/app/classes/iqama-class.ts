export class IqamaClass implements Iqama{
    fajr: string = "00:00";
    duhr: string = "00:00";
    asr: string = "00:00";
    maghrib: string = "00:00";
    isha: string = "00:00";
    jummah: string = "00:00";
    jummahUNT: string = "00:00";
}

export interface Iqama{
    fajr: string;
    duhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    jummah: string;
    jummahUNT: string;
}
