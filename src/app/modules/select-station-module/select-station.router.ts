import { RouterModule, Routes} from '@angular/router';
import { SelectStationComponent } from './components/select-station/select-station.component';


const SELECT_STATION_ROUTER: Routes = [{

    path: '',
    component: SelectStationComponent

}];

export const selectStationRouter = RouterModule.forChild(SELECT_STATION_ROUTER);