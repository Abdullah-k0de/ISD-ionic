import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuranPage } from './quran.page';

const routes: Routes = [
  {
    path: '',
    component: QuranPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuranPageRoutingModule {}
