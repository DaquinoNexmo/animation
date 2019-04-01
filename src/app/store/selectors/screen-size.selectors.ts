import { createSelector } from '@ngrx/store';
import * as fromFeature from '../reducers';
import * as fromScreen from '../reducers/screen-size.reducer';
import { ScreenState } from '../../models/screen-size.model';



export const getScreenModule = createSelector(fromFeature.getModulesState, (state: fromFeature.ModulesState) => state.screen);
export const getMobile = createSelector(getScreenModule, fromScreen.getMobile);
export const getTablet = createSelector(getScreenModule, fromScreen.getTablet);
export const getDesktop = createSelector(getScreenModule, fromScreen.getDesktop);
export const getWidth = createSelector(getScreenModule, fromScreen.getWindowWidth);
export const getHeight = createSelector(getScreenModule, fromScreen.getWindowHeight);