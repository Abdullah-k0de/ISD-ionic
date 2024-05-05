import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Tab5PageRoutingModule } from './tab5-routing.module';

import { Tab5Page } from './tab5.page';
import { ExploreContainerComponentModule } from "../../explore-container/explore-container.module";

@NgModule({
    declarations: [Tab5Page],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        Tab5PageRoutingModule,
        ExploreContainerComponentModule
    ]
})
export class Tab5PageModule {}
