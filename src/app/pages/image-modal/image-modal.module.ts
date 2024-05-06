import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ImageModalPageRoutingModule } from './image-modal-routing.module';
import { ImageModalPage } from './image-modal.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register } from 'swiper/element/bundle';
register();

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageModalPageRoutingModule,
  ],
  declarations: [ImageModalPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ImageModalPageModule {}
