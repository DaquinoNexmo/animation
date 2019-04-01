import { RouterModule, Routes} from '@angular/router';
import { EquipmentViewComponent } from './components/equipment-view-component/equipment-view.component';


const PROCESS_CREATOR_ROUTER: Routes = [{

    path: '',
    component: EquipmentViewComponent

}];

export const processCreatorRouter = RouterModule.forChild(PROCESS_CREATOR_ROUTER);