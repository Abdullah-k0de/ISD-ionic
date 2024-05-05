import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.page.html',
  styleUrls: ['./image-modal.page.scss'],
})
export class ImageModalPage implements OnInit {

  @Input() imageUrl: Promise<string | null>;


  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  close(){
    this.modalController.dismiss();
  }

  zoom(zoomIn: boolean){

  }

  doNothing(event: Event){
    event.stopPropagation();    
  }

}
