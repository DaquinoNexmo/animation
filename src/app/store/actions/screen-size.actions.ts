import { Action } from '@ngrx/store';
import { ScreenState } from '../../models/screen-size.model';


export const SET_SCREEN =  'Set screen size';

// Action type for screen
export class SetScreen implements Action {
    readonly type = SET_SCREEN;
    constructor(public width: number, public hight: number) {}
}




export type ScreenActions = SetScreen;