import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';


import { AppComponent } from './app.component';
import { StoreModule, MetaReducer } from '@ngrx/store';
import { appRoutes } from './routes';
import { BlankComponent } from './blank/blank.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
export const metaReducers: MetaReducer<any>[] = [];


@NgModule({
  declarations: [
    AppComponent,
    BlankComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NoopAnimationsModule,
    appRoutes,
    MaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
