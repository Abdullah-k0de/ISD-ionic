import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicSlides } from '@ionic/angular';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.page.html',
  styleUrls: ['./image-modal.page.scss'],
})
export class ImageModalPage implements OnInit {

  @Input() imageUrl: Promise<string | null>;
  // currentZoom = 1;

  // -------------------
  // offsetX = 0;
  // offsetY = 0;
  // startX = 0;
  // startY = 0;
  // isDragging = false;
  // maxOffsetX = 0;
  // maxOffsetY = 0;

  constructor(private modalController: ModalController) { }

  // onTouchStart(event: TouchEvent) {
  //   this.isDragging = true;
  //   this.startX = event.touches[0].clientX - this.offsetX;
  //   this.startY = event.touches[0].clientY - this.offsetY;
  //   this.maxOffsetX = this.calculateMaxOffsetX();
  //   this.maxOffsetY = this.calculateMaxOffsetY();
  // }

  // onTouchMove(event: TouchEvent) {
  //   if (!this.isDragging) return;
  //   event.preventDefault();
  //   let newX = event.touches[0].clientX - this.startX;
  //   let newY = event.touches[0].clientY - this.startY;
  //   newX = Math.max(Math.min(newX, this.maxOffsetX), -this.maxOffsetX);
  //   newY = Math.max(Math.min(newY, this.maxOffsetY), -this.maxOffsetY);
  //   this.offsetX = newX;
  //   this.offsetY = newY;
  // }

  // onTouchEnd() {
  //   this.isDragging = false;
  // }

  // calculateMaxOffsetX() {
  //   const imageWidth = (window.innerWidth / 2) * this.currentZoom;
  //   return Math.max(imageWidth - (window.innerWidth / 2), 0);
  // }

  // calculateMaxOffsetY() {
  //   const imageHeight = (window.innerHeight / 2) * this.currentZoom;
  //   return Math.max(imageHeight - (window.innerHeight / 2), 0);
  // }


  ngOnInit() {
    // this.currentZoom = 1;
    // document.documentElement.style.setProperty('--zoom-factor', this.currentZoom.toString());
  }


  // -------------------------


  close(){
    this.modalController.dismiss();
  }

  zoom(zoomIn: boolean){
  //   console.log("In zoom with: " + zoomIn);
    
  //   const zoomStep = 0.1;
  //   this.currentZoom = zoomIn ? this.currentZoom + zoomStep : this.currentZoom - zoomStep;
  //   this.currentZoom = Math.max(0.5, Math.min(this.currentZoom, 2));
  //   document.documentElement.style.setProperty('--zoom-factor', this.currentZoom.toString());
  }

  // handlePinchZoom(event: any){
  //   console.log("In Pinch Zoom with: " + event);
    
  //   const scale = event.detail.scale;
  //   this.currentZoom *= scale;
  //   this.currentZoom = Math.max(0.5, Math.min(this.currentZoom, 2));
  //   document.documentElement.style.setProperty('--zoom-factor', this.currentZoom.toString());
  // }

  doNothing(event: Event){
    event.stopPropagation();    
  }

}
