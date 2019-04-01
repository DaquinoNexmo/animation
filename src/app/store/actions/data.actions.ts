import { Action } from '@ngrx/store';
import { DataModel, Module, Element, ImageModel } from '../../models/view.model';


export const GET_DATA = '[View] GET the data';
export const GET_DATA_SUCCESS = '[View] Set the data in the store';
export const GET_DATA_FAIL = '[View] getting data failed';
export const SET_DATA = '[View] Set Data';
export const SET_VISIBILITY = '[View] Set Visibility';
export const REHYDRATE_STORE = '[View] Get data from local storage';

export const GET_COMBOBOX_OPTIONS = '[View] Get Combobox Options';
export const GET_COMBOBOX_OPTIONS_SUCCESS = '[View] Get Combobox Options Success';
export const GET_COMBOBOX_OPTIONS_FAIL = '[View] Get Combobox Options Fail';

export const LOGIN = '[View] Login';
export const LOGIN_SUCCESS = '[View] Login Success';
export const LOGIN_FAIL = '[View] Login Fail';

export const LOGOUT = '[View] Logout';

export const GET_TABLE_ITEMS = '[View] Get Table Items';
export const GET_TABLE_ITEMS_SUCCESS = '[View] Get Table Items Success';
export const GET_TABLE_ITEMS_FAIL = '[View] Get Table Items Fail';

export const GET_EQUIPMENT_VIEW = '[View] Get Equipment View';
export const GET_EQUIPMENT_VIEW_SUCCESS = '[View] Get Equipment View Success';
export const GET_EQUIPMENT_VIEW_FAIL = '[View] Get Equipment View Fail';

export const GET_MODULES = '[View] Get Modules';
export const GET_MODULES_SUCCESS = '[View] Get Modules Success';
export const GET_MODULES_FAIL = '[View] Get Modules Fail';

export const GET_DATA_FOR_MODULES = '[View] Get Data For Modules';
export const GET_DATA_FOR_MODULES_SUCCESS = '[View] Get Data For Modules Success';
export const GET_DATA_FOR_MODULES_FAIL = '[View] Get Data For Modules Fail';

export const CREATE_INSPECTION = '[View] Create Inspection';
export const CREATE_INSPECTION_SUCCESS = '[View] Create Inspection Success';
export const CREATE_INSPECTION_FAIL = '[View] Create Inspection Fail';

export const REMOVE_MODULES = '[View] Remove Modules';
export const MENU_BAR_BUTTON_PRESS = '[View] Menu Bar Button Press';

export const SYNC_DATA = '[View] Sync Data';
export const SYNC_DATA_SUCCESS = '[View] Sync Data Success';
export const SYNC_DATA_FAIL = '[View] Sync Data Fail';

export const GET_PROTOCOL = '[View] Get Protocol';
export const GET_PROTOCOL_SUCCESS = '[View] Get Protocol Success';
export const GET_PROTOCOL_FAIL = '[View] Get Protocol Fail';

export const GET_XML_COMBOBOX = '[View] Get XML Combobox';
export const GET_XML_COMBOBOX_SUCCESS = '[View] Get XML Combobox Success';
export const GET_XML_COMBOBOX_FAIL = '[View] Get XML Combobox Fail';

export const ADD_ELEMENT_TO_STRUCTURE = '[View] Add element to structure';
export const REMOVE_DATA = '[View] Remove data element';
export const DELETE_ELEMENT_FROM_STRUCTURE = '[View] Delete element from Documentation module structure';
export const GET_LOCAL_STORAGE_CONTENT = '@ngrx/store/update-reducers';

export const SAVE_TIRES = '[View] Save all tires';
export const ADD_DAMAGE = '[View] Add damage';
export const DELETE_DAMAGE = '[View] Delete damage';
export const SET_IMAGE_TO_BE_DELETED = '[View] Set image to be deleted';
export const SYNC_AND_IMAGE_UPLOAD_COMPLETED = '[View] Sync inspection and image upload finished';

export class GetData implements Action {
    readonly type = GET_DATA;
}

export class GetDataSuccess implements Action {
    readonly type = GET_DATA_SUCCESS;
    constructor(public payload: { modules: Module[] }) { }
}

export class GetDataFail implements Action {
    readonly type = GET_DATA_FAIL;
    constructor(public payload: any) { }
}

export class SetData implements Action {
    readonly type = SET_DATA;
    constructor(public payload: { nameOfModule: string, data: Map<string, DataModel> }) { }
}

export class SetVisibility implements Action {
    readonly type = SET_VISIBILITY;
    constructor(public payload: { elementId: string, dynValue: string }) { }
}

export class RehydrateStoreData implements Action {
    readonly type = REHYDRATE_STORE;
}

export class SyncAndImageUploadCompleted implements Action {
    readonly type = SYNC_AND_IMAGE_UPLOAD_COMPLETED;
}

export class GetComboboxOptions implements Action {
    readonly type = GET_COMBOBOX_OPTIONS;
    constructor(public payload: { url: string, elementId: string }) { }
}

export class GetComboboxOptionsSuccess implements Action {
    readonly type = GET_COMBOBOX_OPTIONS_SUCCESS;
    constructor(public payload: any) { }
}
export class GetComboboxOptionsFail implements Action {
    readonly type = GET_COMBOBOX_OPTIONS_FAIL;
    constructor(public payload: any) { }
}

export class Login implements Action {
    readonly type = LOGIN;
    constructor(public payload: string) { }
}

export class LoginSuccess implements Action {
    readonly type = LOGIN_SUCCESS;
    constructor(public payload: any) { }
}

export class LoginFail implements Action {
    readonly type = LOGIN_FAIL;
    constructor(public payload: any) { }
}


export class GetTableItems implements Action {
    readonly type = GET_TABLE_ITEMS;
    constructor(public payload: { url: string, elementId: string }) { }
}

export class GetTableItemsSuccess implements Action {
    readonly type = GET_TABLE_ITEMS_SUCCESS;
    constructor(public payload: any) { }
}

export class GetTableItemsFail implements Action {
    readonly type = GET_TABLE_ITEMS_FAIL;
    constructor(public payload: any) { }
}

export class GetEquipmentView implements Action {
    readonly type = GET_EQUIPMENT_VIEW;
    constructor(public payload: string) { }
}

export class GetEquipmentViewSussess implements Action {
    readonly type = GET_EQUIPMENT_VIEW_SUCCESS;
    constructor(public payload: any) { }
}

export class GetEquipmentViewFail implements Action {
    readonly type = GET_EQUIPMENT_VIEW_FAIL;
    constructor(public payload: any) { }
}

export class GetModules implements Action {
    readonly type = GET_MODULES;
    constructor(public payload: {data: any}) {}
}

export class GetModulesSuccess implements Action {
    readonly type = GET_MODULES_SUCCESS;
    constructor(public payload: any) { }
}

export class GetModulesFail implements Action {
    readonly type = GET_MODULES_FAIL;
    constructor(public payload: any) { }
}

export class GetDataForModules implements Action {
    readonly type = GET_DATA_FOR_MODULES;
    constructor(public payload: string) { }
}

export class GetDataForModulesSuccess implements Action {
    readonly type = GET_DATA_FOR_MODULES_SUCCESS;
    // PartialUpdate is used When syncing and redownloading the dataLayer
    // to only update parts of it
    constructor(public payload: {data: any, partialUpdate?: boolean}) { }
}

export class GetDataForModulesFail implements Action {
    readonly type = GET_DATA_FOR_MODULES_FAIL;
    constructor(public payload: any) { }
}

export class CreateInspection implements Action {
    readonly type = CREATE_INSPECTION;
    constructor(public payload: any) { }
}

export class CreateInspectionFail implements Action {
    readonly type = CREATE_INSPECTION_FAIL;
    constructor(public payload: any) { }
}

export class CreateInspectionSuccess implements Action {
    readonly type = CREATE_INSPECTION_SUCCESS;
    constructor(public payload: any) { }
}

export class RemoveModules implements Action {
    readonly type = REMOVE_MODULES;
    constructor() { }
}

export class MenuBarButtonPress implements Action {
    readonly type = MENU_BAR_BUTTON_PRESS;
    constructor(public payload: { clearModule: string[], navigateToModule: string }) { }
}

export class SyncData implements Action {
    readonly type = SYNC_DATA;
    constructor(public payload: any) { }
}

export class SyncDataSuccess implements Action {
    readonly type = SYNC_DATA_SUCCESS;
    constructor(public payload: any) { }
}

export class SyncDataFail implements Action {
    readonly type = SYNC_DATA_FAIL;
    constructor(public payload: any) { }
}

export class GetProtocol implements Action {
    readonly type = GET_PROTOCOL;
    constructor(public payload: any) { }
}

export class GetProtocolSuccess implements Action {
    readonly type = GET_PROTOCOL_SUCCESS;
    constructor(public payload: any) { }
}

export class GetProtocolFail implements Action {
    readonly type = GET_PROTOCOL_FAIL;
    constructor(public payload: any) { }
}

export class GetXMLComboBox implements Action {
    readonly type = GET_XML_COMBOBOX;
    constructor(public payload: { url: string, elementId: string }) { }
}

export class GetXMLComboBoxSuccess implements Action {
    readonly type = GET_XML_COMBOBOX_SUCCESS;
    constructor(public payload: any) { }
}

export class GetXMLComboBoxFail implements Action {
    readonly type = GET_XML_COMBOBOX_FAIL;
    constructor(public payload: any) { }
}

export class AddElementToStructure implements Action {
    readonly type = ADD_ELEMENT_TO_STRUCTURE;
    constructor(public payload: Element) { }
}

export class RemoveData implements Action {
    readonly type = REMOVE_DATA;
    constructor(public payload: string) { }
}

export class DeleteElementFromStructure implements Action {
    readonly type = DELETE_ELEMENT_FROM_STRUCTURE;
    constructor(public payload: {id: string, documentationShortname?: string} ) { }
}

export class LocalStoragetAction implements Action {
    readonly type = GET_LOCAL_STORAGE_CONTENT;
}

export class SaveTiresAction implements Action {
    readonly type = SAVE_TIRES;
    constructor(public payload: any) { }
}

export class Logout implements Action {
    readonly type = LOGOUT;
    constructor() { }
}
export class AddDamage implements Action {
    readonly type = ADD_DAMAGE;
    constructor(public payload: any) {}
}

export class DeleteDamage implements Action {
    readonly type = DELETE_DAMAGE;
    constructor(public payload: any) {}
}

export class SetImageToBeDeleted implements Action {
    readonly type = SET_IMAGE_TO_BE_DELETED;
    constructor(public payload: ImageModel) {}
}

export type ModuleActions = GetData | GetDataFail | GetDataSuccess | SetData | SetVisibility | RehydrateStoreData | SyncAndImageUploadCompleted |
    GetComboboxOptions | GetComboboxOptionsSuccess | GetComboboxOptionsFail | Login | LoginFail | LoginSuccess |
    GetTableItems | GetTableItemsSuccess | GetTableItemsFail | GetEquipmentView |
    GetEquipmentViewSussess | GetEquipmentViewFail | GetModules | GetModulesFail | GetModulesSuccess |
    GetDataForModules | GetDataForModulesFail | GetDataForModulesSuccess | MenuBarButtonPress |
    CreateInspection | CreateInspectionFail | CreateInspectionSuccess | RemoveModules | SyncData | SyncDataFail |
    SyncDataSuccess | GetProtocol | GetProtocolFail | GetProtocolSuccess | GetXMLComboBox | GetXMLComboBoxFail |
    GetXMLComboBoxSuccess | AddElementToStructure | RemoveData | DeleteElementFromStructure | LocalStoragetAction |
    SaveTiresAction | Logout | AddDamage | DeleteDamage | SetImageToBeDeleted;
