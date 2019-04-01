import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../../store';
import { effects } from '../../store/effects';
import { FormsModule } from '@angular/forms';
import { ProcessManagerComponent } from './components/process-manager/process-manager.component';
import { ComponentLibraryModule } from '../component-library-module';
import { ProcessManagerRouter } from './process-manager.router';
import { InspectionDialogComponent } from '../component-library-module/components/data-table/data-table.component';
@NgModule({

    declarations: [
        ProcessManagerComponent,
        InspectionDialogComponent
    ],
    imports: [
        FormsModule,
        HttpClientModule,
        ComponentLibraryModule,
        ProcessManagerRouter,
        StoreModule.forFeature('modules', reducers),
        EffectsModule.forFeature(effects),
    ],
    entryComponents: [InspectionDialogComponent],
    providers: [
        ],
    exports: [ ProcessManagerComponent ]

})
export class ProcessManagerModule {}
