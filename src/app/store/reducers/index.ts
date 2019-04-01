import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import * as fromModules from './data.reducer';
import * as  fromImages from './image.reducer';
import * as fromScreen from './screen-size.reducer';
import { ScreenState } from '../../models/screen-size.model';

export interface ModulesState {
    data: fromModules.ModulesState;
    imageData: fromImages.PhotoDocuItemState;
    screen: ScreenState;
}

export const reducers: ActionReducerMap<ModulesState> = {
    data: fromModules.reducer,
    imageData: fromImages.reducer,
    screen: fromScreen.screenReducer
};

export const getModulesState = createFeatureSelector<ModulesState>('modules');