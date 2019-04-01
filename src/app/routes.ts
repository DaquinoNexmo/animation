import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { BlankComponent } from './blank/blank.component';


const routes: Routes = [
    { path: 'authentication', loadChildren: 'app/modules/authentication-module/index#AuthenticationModule', pathMatch: 'full'  },
    { path: 'dynamicFields', loadChildren: 'app/modules/dynamic-fields-module/index#DynamicFieldsModule'},
    { path: 'stationSelector', loadChildren: 'app/modules/select-station-module/index#StationSelectModule'},
    { path: 'processManager', loadChildren: 'app/modules/process-manager-module/index#ProcessManagerModule'},
    { path: 'processCreator', loadChildren: 'app/modules/process-creator-module/index#ProcessCreatorModule'},
    { path: 'equipmentView', loadChildren: 'app/modules/equipment-view-module/index#EquipmentViewModule'},
    { path: 'documentation', loadChildren: 'app/modules/picture-documentation-module/index#PictureDocumentationModule'},
    { path: '**', component: BlankComponent, pathMatch: 'full'  },

];

export const appRoutes: ModuleWithProviders = RouterModule.forRoot(routes);
