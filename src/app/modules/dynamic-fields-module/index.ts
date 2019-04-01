import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../../store';
import { effects } from '../../store/effects';
import { FormsModule } from '@angular/forms';
import { ViewDynamicFieldsComponent } from './components/view-dynamic-fields/view-dynamic-fields.component';
import { ComponentLibraryModule } from '../component-library-module';
import { dynamicViewRouter } from './view-dynamic-fields.router';
import { ProtocolComponent } from './components/protocol/protocol.component';
import { DamageCreatorSvgComponent } from './components/damage-creator-svg/damage-creator-svg.component';
import { MaterialModule } from '../../material.module';
import { InspectionInfoComponent } from './components/inspection-info/inspection-info.component';
import { DataFieldsComponent } from './components/datafields/datafields.component';
import { TireToolComponent } from './components/tiretool/tiretool.component';
import { PictureDocumentationModule } from '../picture-documentation-module';
import { EquipmentViewModule } from '../equipment-view-module';
import { DamageViewComponent } from './components/damage-view/damage-view.component';


@NgModule({

    declarations: [
        ViewDynamicFieldsComponent,
        ProtocolComponent,
        DamageCreatorSvgComponent,
        InspectionInfoComponent,
        DataFieldsComponent,
        TireToolComponent,
        DamageViewComponent
    ],
    imports: [
        FormsModule,
        HttpClientModule,
        ComponentLibraryModule,
        dynamicViewRouter,
        MaterialModule,
        StoreModule.forFeature('modules', reducers),
        EffectsModule.forFeature(effects),
        PictureDocumentationModule,
        EquipmentViewModule
    ],
    providers: [
        ],
    exports: [ ViewDynamicFieldsComponent ]

})
export class DynamicFieldsModule {}

/**    providers: [ DataLoadingService, InitService,
        {provide: APP_INITIALIZER, useFactory: init_app, deps: [InitService], multi: true},
        {provide: APP_INITIALIZER, useFactory: get_settings, deps: [InitService], multi: true}] */