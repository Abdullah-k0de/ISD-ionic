import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { Tab4PageRoutingModule } from './tab4-routing.module';
import { Tab4Page } from './tab4.page';
import { ExploreContainerComponentModule } from "../../explore-container/explore-container.module";
import { File } from '@awesome-cordova-plugins/file/ngx';

@NgModule({
    declarations: [Tab4Page],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        Tab4PageRoutingModule,
        ExploreContainerComponentModule,
        AngularFireStorageModule,
        provideStorage(() => getStorage()),
    ],
    providers: [
        File
    ]
})
export class Tab4PageModule {}
