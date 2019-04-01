import { Action } from '@ngrx/store';
import { ImageModel, PhotoDataModel, PhotoDocuItem } from '../../models/view.model';


export const SAVE_IMAGE = '[Images] - Save Image Action';
export const SAVE_IMAGE_DATA_OBJECT = '[Images] - Save ImageDataObject action';
export const DELETE_IMAGE = '[Images] - Delete Image Action';
export const DELETE_IMAGE_DATA_OBJECT = '[Images] - Delete Image Data Object Action';
export const GET_ALL_IMAGES = '[Images] - Get All Images action';
export const ADD_IMAGE_TO_DATA_OBJECT = '[Images] - Add Image to Data Object action';
export const IMAGE_CAROUSEL_CHANGE_EDITABLE = '[Images] - Change editable on image carousel action';
export const ADD_PHOTODOCU_ITEM = '[Images] - Add PhotoDocuItem';
export const DELETE_PHOTODOCU_ITEM = '[Images] - Delete PhotoDocuItem';
export const EDIT_IMAGE = '[Images] - Save edited Image';

export const PICTURE_UPLOAD_SUCCESS = '[Images] Picture Upload Success';
export const PICTURE_UPLOAD_FAIL = '[Images] Picture Upload Fail';
export const PICTURE_UPLOAD_START = '[Images] Picture Upload Start';

export const DOWNLOAD_IMAGE = '[Images] Download picture';
export const UPDATE_CAROUSEL_ID_FOR_IMAGE = '[Images] Update carousel id for image';

export class SaveImage implements Action {

    readonly type = SAVE_IMAGE;
    constructor(public payload: ImageModel) { }
}

export class DeleteImage implements Action {
    readonly type = DELETE_IMAGE;
    constructor(public payload: ImageModel) { }
}

export class GetAllImages implements Action {
    readonly type = GET_ALL_IMAGES;
    constructor() { }
}

export class SaveImageDataObject implements Action {
    readonly type = SAVE_IMAGE_DATA_OBJECT;
    constructor(public payload: PhotoDataModel) { }
}

export class DeleteImageDataObject implements Action {

    readonly type = DELETE_IMAGE_DATA_OBJECT;
    constructor(public payload: PhotoDataModel) { }
}

export class AddImageToDataObject implements Action {

    readonly type = ADD_IMAGE_TO_DATA_OBJECT;
    constructor(public payload: ImageModel) { }
}

export class ImageCarouselChangeEditable implements Action {

    readonly type = IMAGE_CAROUSEL_CHANGE_EDITABLE;
    constructor(public payload: string, public actionType: boolean) { }
}

export class AddPhotoDocuItem implements Action {

    readonly type = ADD_PHOTODOCU_ITEM;
    constructor(public payload: PhotoDocuItem) { }
}

export class DeletePhotoDocuItem implements Action {

    readonly type = DELETE_PHOTODOCU_ITEM;
    constructor(public payload: string) { }
}

export class EditImage implements Action {
    readonly type = EDIT_IMAGE;
    constructor(public payload: {editedImage: ImageModel, svgs?: string}) { }
}

export class PictureUploadStart implements Action {
    readonly type = PICTURE_UPLOAD_START;
    constructor() {}
}

export class PictureUploadFail implements Action {
    readonly type = PICTURE_UPLOAD_FAIL;
    constructor(public payload: any) {}
}

export class PictureUploadSuccess implements Action {
    readonly type = PICTURE_UPLOAD_SUCCESS;
    constructor(public payload: String) {}
}

export class DownloadImage implements Action {
    readonly type = DOWNLOAD_IMAGE;
    constructor(public payload: {
        url: string,
        carouselId: string,
        imageId: string,
        mediaId: string,
        svg: string
    }) {}
}

export class UpdateCarouselIdForImage implements Action {
    readonly type = UPDATE_CAROUSEL_ID_FOR_IMAGE;
    constructor(public payload: {
        imageId: string,
        newCarouselId: string;
    }) {}
}

export type ImageActions = SaveImage | DeleteImage
    | GetAllImages | SaveImageDataObject | DeleteImageDataObject
    | AddImageToDataObject | ImageCarouselChangeEditable
    | AddPhotoDocuItem | DeletePhotoDocuItem | EditImage
    | PictureUploadStart | PictureUploadSuccess | PictureUploadFail
    | DownloadImage | UpdateCarouselIdForImage;