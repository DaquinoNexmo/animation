import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../../store';
import { effects } from '../../store/effects';
import { FormsModule } from '@angular/forms';
import { ProcessCreatorComponent } from './components/process-creator/process-creator.component';
import { ComponentLibraryModule } from '../component-library-module';
import { processCreatorRouter } from './process-creator.router';
import { ProcessCreatorDialogComponent } from './components/process-creator-dialog/process-creator-dialog.component';

@NgModule({
    declarations: [
        ProcessCreatorComponent,
        ProcessCreatorDialogComponent,
    ],
    imports: [
        FormsModule,
        HttpClientModule,
        ComponentLibraryModule,
        processCreatorRouter,
        StoreModule.forFeature('modules', reducers),
        EffectsModule.forFeature(effects),
    ],
    providers: [
        ],
    entryComponents: [ProcessCreatorDialogComponent],
    exports: [ ProcessCreatorComponent, ProcessCreatorDialogComponent ]
})
export class ProcessCreatorModule {}
