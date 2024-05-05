export class NotificationClass implements Notification{
    date: string = "";
    description: string = "";
    header: string = "";
    imgpath: string = "";
    time: string = "";
    link: string = "";
}

export interface Notification{
    date: string,
    description: string,
    header: string,
    imgpath: string,
    time: string,
    link: string
}
