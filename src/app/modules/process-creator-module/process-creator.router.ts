import { RouterModule, Routes} from '@angular/router';
import { ProcessCreatorComponent } from './components/process-creator/process-creator.component';


const PROCESS_CREATOR_ROUTER: Routes = [{

    path: '',
    component: ProcessCreatorComponent

}];

export const processCreatorRouter = RouterModule.forChild(PROCESS_CREATOR_ROUTER);