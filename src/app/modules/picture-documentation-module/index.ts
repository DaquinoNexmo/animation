import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../../store';
import { effects } from '../../store/effects';
import { FormsModule } from '@angular/forms';
import { ComponentLibraryModule } from '../component-library-module';
import { ImageMethodSelectionComponent } from './components/image-method-selection/image-method-selection.component';
import { ImageSelectionComponent } from './components/image-selection/image-selection.component';
import { ImageTakingComponent } from './components/image-taking/image-taking.component';
import { PictureDocumentationComponent } from './components/picture-documentation/picture-documentation.component';
import { pictureDocumentationRouter } from './picture-documentation.router';
import { MaterialModule } from '../../material.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import { ImageEditSvgComponent } from './components/image-edit-svg/image-edit-svg.component';
import { CarouselComponent } from './components/carousel/carousel.component';


@NgModule({
    declarations: [
        ImageSelectionComponent,
        CarouselComponent,
        ImageMethodSelectionComponent,
        ImageTakingComponent,
        PictureDocumentationComponent,
        ImageEditSvgComponent,
    ],
    imports: [
        FormsModule,
        HttpClientModule,
        StoreModule.forFeature('modules', reducers),
        EffectsModule.forFeature(effects),
        ComponentLibraryModule,
        pictureDocumentationRouter,
        MaterialModule,
        FlexLayoutModule

    ],
    providers: [
        ],
    exports: [ PictureDocumentationComponent, ImageSelectionComponent,
        ImageMethodSelectionComponent, CarouselComponent,
        ImageTakingComponent ],
    entryComponents: [ ImageMethodSelectionComponent, ImageSelectionComponent, ImageTakingComponent, ImageEditSvgComponent, CarouselComponent ]
})
export class PictureDocumentationModule { }
