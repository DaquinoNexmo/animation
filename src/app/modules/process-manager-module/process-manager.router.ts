import { RouterModule, Routes} from '@angular/router';
import { ProcessManagerComponent } from './components/process-manager/process-manager.component';


const PROCESS_MANAGER_ROUTER: Routes = [{

    path: '',
    component: ProcessManagerComponent

}];

export const ProcessManagerRouter = RouterModule.forChild(PROCESS_MANAGER_ROUTER);