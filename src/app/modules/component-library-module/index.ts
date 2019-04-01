import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ElementListComponent } from './components/element-list/element-list.component';
import { FormsModule } from '@angular/forms';
import { DataTableComponent} from './components/data-table/data-table.component';
import { DateConversion } from './pipes/date-conversion.pipe';
import { Translate } from './pipes/translate.pipe';
import { MenuBarComponent } from './components/menu-bar/menu-bar.component';
import { SettingsDialogComponent } from './components/menu-bar/menu-bar-settings-dialog/menu-bar-settings-dialog.component';
import { SignatureDialogComponent } from '../dynamic-fields-module/components/protocol/signature-dialog/signature-dialog.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { DamageDialogComponent } from '../dynamic-fields-module/components/damage-creator-svg/damage-dialog/damage-dialog.component';
import { MaterialModule } from '../../material.module';
import { TireDialogComponent } from '../dynamic-fields-module/components/tiretool/tire-dialog/tire-dialog.component';
import { TireSizeDialogComponent } from '../dynamic-fields-module/components/tiretool/tire-dialog/tire-size-dialog/tire-size-dialog.component';
import { TireSwapDialogComponent } from '../dynamic-fields-module/components/tiretool/tire-dialog/tire-swap-dialog/tire-swap-dialog.component';
import { DialogWrapperComponent } from './components/dialog-wrapper/dialog-wrapper.component';

@NgModule({

    declarations: [
        ElementListComponent,
        DataTableComponent,
        DateConversion,
        MenuBarComponent,
        SettingsDialogComponent,
        Translate,
        SignatureDialogComponent,
        DamageDialogComponent,
        TireDialogComponent,
        TireSizeDialogComponent,
        TireSwapDialogComponent,
        DialogWrapperComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        MaterialModule,
        SignaturePadModule
    ],
    providers: [
        ],
    exports: [ ElementListComponent, CommonModule, DataTableComponent,
         MenuBarComponent, Translate],
    entryComponents: [SignatureDialogComponent, SettingsDialogComponent, DamageDialogComponent, TireDialogComponent,
        TireSizeDialogComponent, TireSwapDialogComponent]

})
export class ComponentLibraryModule {}

