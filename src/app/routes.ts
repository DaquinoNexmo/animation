import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { BlankComponent } from './blank/blank.component';
import { DamagelistComponent } from './damagelist/damagelist.component';


const routes: Routes = [
    { path: 'blank', component: BlankComponent, pathMatch: 'full'},
    { path: 'damage', component: DamagelistComponent, pathMatch: 'full'},
    { path: '**', component: BlankComponent, pathMatch: 'full'  },

];

export const appRoutes: ModuleWithProviders = RouterModule.forRoot(routes);
