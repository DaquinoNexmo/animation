import { RouterModule, Routes} from '@angular/router';
import { ViewDynamicFieldsComponent } from './components/view-dynamic-fields/view-dynamic-fields.component';
import { DialogWrapperComponent } from '../component-library-module/components/dialog-wrapper/dialog-wrapper.component';


const DYNAMIC_VIEW_ROUTER: Routes = [{

    path: '',
    component: ViewDynamicFieldsComponent


}];

export const dynamicViewRouter = RouterModule.forChild(DYNAMIC_VIEW_ROUTER);