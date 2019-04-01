import { RouterModule, Routes } from '@angular/router';
import { PictureDocumentationComponent } from './components/picture-documentation/picture-documentation.component';
import { ViewDynamicFieldsComponent } from '../dynamic-fields-module/components/view-dynamic-fields/view-dynamic-fields.component';
import { ImageEditSvgComponent } from './components/image-edit-svg/image-edit-svg.component';
import { DialogWrapperComponent } from '../component-library-module/components/dialog-wrapper/dialog-wrapper.component';

const PICTURE_DOCUMENTATION: Routes = [
    {
        path: '',
        component: ViewDynamicFieldsComponent,
        children: [
            {
                path: 'dialog',
                component: DialogWrapperComponent
            }
        ]

    }
];

export const pictureDocumentationRouter = RouterModule.forChild(PICTURE_DOCUMENTATION);