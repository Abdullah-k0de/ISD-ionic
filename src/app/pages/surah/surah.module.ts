import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SurahPageRoutingModule } from './surah-routing.module';

import { SurahPage } from './surah.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SurahPageRoutingModule
  ],
  declarations: [SurahPage]
})
export class SurahPageModule {}
