import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../../store';
import { effects } from '../../store/effects';
import { FormsModule } from '@angular/forms';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { signinRouter } from './authentication.router';
import { ComponentLibraryModule } from '../component-library-module';

@NgModule({

    declarations: [
        SignInComponent,

    ],
    imports: [
        FormsModule,
        HttpClientModule,
        StoreModule.forFeature('modules', reducers),
        EffectsModule.forFeature(effects),
        signinRouter,
        ComponentLibraryModule

    ],
    providers: [
    ],
    exports: []

})
export class AuthenticationModule { }
