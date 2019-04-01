import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../../store';
import { effects } from '../../store/effects';
import { FormsModule } from '@angular/forms';
import { EquipmentViewComponent } from './components/equipment-view-component/equipment-view.component';
import { processCreatorRouter } from './equipment-view.router';
import { ComponentLibraryModule } from '../component-library-module';

@NgModule({
    declarations: [
        EquipmentViewComponent,
    ],
    imports: [
        FormsModule,
        HttpClientModule,
        StoreModule.forFeature('modules', reducers),
        EffectsModule.forFeature(effects),
        processCreatorRouter,
        ComponentLibraryModule
    ],
    providers: [
        ],
    exports: [ EquipmentViewComponent ],
    entryComponents: [ ]
})
export class EquipmentViewModule { }
