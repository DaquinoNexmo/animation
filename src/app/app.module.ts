import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';


import { AppComponent } from './app.component';
import { DataLoadingService } from './services/dataLoading.service';
import { StoreModule, MetaReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { appRoutes } from './routes';
import { InnitService } from './services/innit.service';
import { BlankComponent } from './blank/blank.component';
import { FunctionalityService } from './services/functionality.service';
import { NgrxActionDebouncerModule } from 'ngrx-action-debouncer';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslationService } from './services/translation.service';
import { MaterialModule } from './material.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import { NgxPicaModule } from '@digitalascetic/ngx-pica';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoggerModule } from 'ngx-logger';

import { WindowService } from './services/window.service';

import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { SpinnerService } from './services/spinner.service';
import { TimeoutInterceptor } from './services/timeout.interceptor';
import { environment } from '../environments/environment';
import { ScreenService } from './services/screen.service';

export const metaReducers: MetaReducer<any>[] = [];


export function get_settings(appLoadService: InnitService) {
  return () => appLoadService.getSettings();
}

@NgModule({
  declarations: [
    AppComponent,
    BlankComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NoopAnimationsModule,
    StoreModule.forRoot({}, { metaReducers }),
    EffectsModule.forRoot([]),
    appRoutes,
    NgrxActionDebouncerModule,
    MaterialModule,
    FlexLayoutModule,
    NgxPicaModule,
    NgxSpinnerModule,
    LoggerModule.forRoot(environment.logging)
  ],
  providers: [ DataLoadingService, InnitService, FunctionalityService, TranslationService, WindowService, SpinnerService, ScreenService,
    {provide: APP_INITIALIZER, useFactory: get_settings, deps: [InnitService], multi: true},
    {provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig},
    {provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
