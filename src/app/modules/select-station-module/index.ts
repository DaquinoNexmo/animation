import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../../store';
import { effects } from '../../store/effects';
import { FormsModule } from '@angular/forms';
import { SelectStationComponent } from './components/select-station/select-station.component';
import { ComponentLibraryModule } from '../component-library-module';
import { selectStationRouter } from './select-station.router';

@NgModule({
    declarations: [
        SelectStationComponent
    ],
    imports: [
        FormsModule,
        HttpClientModule,
        ComponentLibraryModule,
        selectStationRouter,
        StoreModule.forFeature('modules', reducers),
        EffectsModule.forFeature(effects),
    ],
    providers: [
        ],
    exports: [ SelectStationComponent ]
})
export class StationSelectModule {}
