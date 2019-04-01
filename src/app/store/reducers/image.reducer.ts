import * as fromImageActions from '../actions/image.actions';
import { ImageModel, PhotoDataModel, PhotoDocuItem } from '../../models/view.model';

export interface PhotoDocuItemState {
    elements: PhotoDocuItem[];
    data: PhotoDataModel[];
    images: ImageModel[];
}

export const innitialState: PhotoDocuItemState = {
    elements: [],
    data: [],
    images: []
};

export function reducer(state: PhotoDocuItemState = innitialState, action: fromImageActions.ImageActions): PhotoDocuItemState {

    switch (action.type) {

        case fromImageActions.PICTURE_UPLOAD_FAIL: {
            const stateCopy = {...state};
            console.log(action.payload);
            return stateCopy;
        }

        case fromImageActions.SAVE_IMAGE: {

            console.log(action.payload);
            const newImageArray = [...state.images, {...action.payload, originalImageSent: false}];

            return { ...state, images: newImageArray };
        }
        case fromImageActions.DELETE_IMAGE: {
            console.log('Delete image', action.payload);

            const stateCopy = { ...state };

            stateCopy.data.forEach(data => {
                data.value.imageCarousel = data.value.imageCarousel.filter(imgId => imgId !== action.payload.id);
            });
            const newDataArray = stateCopy.data;
            const newImageArray = stateCopy.images.filter(img => img.id !== action.payload.id);

            return { ...state, images: newImageArray, data: newDataArray };

        }
        case fromImageActions.GET_ALL_IMAGES: {

            return { ...state };
        }
        case fromImageActions.SAVE_IMAGE_DATA_OBJECT: {

            const newDataArray = [...state.data, action.payload];

            return { ...state, data: newDataArray };
        }

        case fromImageActions.DELETE_IMAGE_DATA_OBJECT: {

            const index = state.data.indexOf(action.payload);
            const newImageDataArray = state.data.slice(0, index).concat(state.data.splice(index + 1));

            return { ...state, data: newImageDataArray };
        }

        case fromImageActions.ADD_IMAGE_TO_DATA_OBJECT: {

            const newDataArray = state.data;
            newDataArray.map(data => {
                if (data.fieldId === action.payload.carouselID) {
                    data.value.imageCarousel.push(action.payload.id);
                }
            });
            return { ...state, data: newDataArray };
        }

        case fromImageActions.IMAGE_CAROUSEL_CHANGE_EDITABLE: {

            const newElementsArray = state.elements;
            newElementsArray.forEach(data => {
                if (data.id === action.payload) {
                    data.imageCarousel.editable = action.actionType;
                }
            });

            return {...state, elements: newElementsArray };
        }

        case fromImageActions.ADD_PHOTODOCU_ITEM: {

            const elementsArr = [...state.elements, action.payload];

            return {...state, elements: elementsArr };
        }

        case fromImageActions.DELETE_PHOTODOCU_ITEM: {
            let elementsArr = state.elements;
            elementsArr = elementsArr.filter(d => d.id !== action.payload);
            return {...state, elements: elementsArr };
        }

        case fromImageActions.EDIT_IMAGE: {

            const newImageArray = state.images;
            newImageArray.forEach(image => {
                if (image.id === action.payload.editedImage.id) {
                    console.log(action.payload);
                    image.image64Edit = action.payload.editedImage.image64Edit;
                    image.image64EditID = Date.now().toString();
                    image.editImageSent = false;
                    image.svg = action.payload.svgs;
                }
            });
            console.log(newImageArray);
            return {...state, images: newImageArray};
        }

        case fromImageActions.PICTURE_UPLOAD_SUCCESS: {
            // Once a picture is successfully uploaded set the imageSent flag to true
            // The image id should come in the payload
            const copyState = {...state};
            if (action.payload) {
                const pictureId = action.payload;
                let sentImage = copyState.images.find(img => img.id === pictureId);
                if (sentImage) {
                    sentImage.originalImageSent = true;
                    if (!sentImage.image64Edit) {
                        // Set fake mediaId to avoid resending if the sync is triggered again
                        sentImage.mediaId = '999999';
                    }
                } else if (sentImage = copyState.images.find(img => img.image64EditID === pictureId)) {
                    sentImage.editImageSent = true;
                    // Set fake mediaId to avoid resending if the sync is triggered again
                    sentImage.mediaId = '999999';
                }
                // TODO: Remove this line maybe, not sure why its here
                copyState.images = JSON.parse(JSON.stringify(copyState.images));
            }
            return copyState;
        }

        case fromImageActions.UPDATE_CAROUSEL_ID_FOR_IMAGE: {
            // Change the carouselId of an image
            // Done after a partial update on sync
            // to match the new carousel Ids with the alredy downloaded pictures
            const stateCopy = {...state};

            const imageToUpdate = stateCopy.images.find(image => image.id === action.payload.imageId);
            if (imageToUpdate) {
                imageToUpdate.carouselID = action.payload.newCarouselId;
            }
            return stateCopy;
        }

        default: {
            // console.log('Image Reducer Default action');

            return { ...state };
        }
    }

}

export const getData = (state: PhotoDocuItemState) => state.data;
export const getImageData = (state: PhotoDocuItemState) => state.images;
export const getElements = (state: PhotoDocuItemState) => state.elements;
