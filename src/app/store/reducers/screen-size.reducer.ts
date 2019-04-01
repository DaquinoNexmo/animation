import * as screenActions from '../actions/screen-size.actions';
import { ScreenState } from '../../models/screen-size.model';

const initialState: ScreenState = {

    mobile: false,
    tablet: false,
    desktop: false,
    height: 0,
    width: 0
};


export function screenReducer(state: ScreenState = initialState, action: screenActions.ScreenActions): ScreenState {

    switch (action.type) {

        case screenActions.SET_SCREEN: {

            const MOBILE_MAX_WIDTH = 425;  // Adjust as needed
            const TABLET_MAX_WIDTH = 1024; // Adjust as needed

            const mobile = action.width <= MOBILE_MAX_WIDTH;
            const tablet = action.width <= TABLET_MAX_WIDTH && action.width > MOBILE_MAX_WIDTH;

            const newState = {
                mobile,
                tablet,
                desktop: !mobile && !tablet,
                width: action.width,
                height: action.hight
            };
            console.log(newState);

            return {
                ...newState
            };
        }
        default:
            return state;
    }
}

export const getMobile = (state: ScreenState) => state.mobile;
export const getTablet = (state: ScreenState) => state.tablet;
export const getDesktop = (state: ScreenState) => state.desktop;
export const getWindowWidth = (state: ScreenState) => state.width;
export const getWindowHeight = (state: ScreenState) => state.height;