import { createSelector } from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromImages from '../reducers/image.reducer';
import { PhotoDataModel } from '../../models/view.model';





export const getImageModule = createSelector(fromFeature.getModulesState, (state: fromFeature.ModulesState) => state.imageData);
export const getAllImages = createSelector(getImageModule, fromImages.getImageData);
export const getImageDataObjects = createSelector(getImageModule, fromImages.getData);
export const getDocumentObjects = createSelector(getImageModule, fromImages.getElements);


export const getNextImageForUpload = createSelector(getAllImages,
    images => {
        // We must check for false, as undefined or null could mean that an editImage does not exist
        // And we don't want to try and send something that does not exist

        // Only upload images without mediaIds
        const imagesToUpload = images.filter(image => !image.mediaId);

        const newImage = imagesToUpload.find(img => img.originalImageSent === false || img.editImageSent === false);
        if (newImage) {
            if (!newImage.originalImageSent ) {
                return {id: newImage.id, image64: newImage.image64};
            } else {
                return {id: newImage.image64EditID, image64: newImage.image64Edit};
            }
        } else {
            return;
        }
    }
);

export const getNumberOfImagesToUpload = createSelector(getAllImages,
    images => {
        let n = 0;
        const imagesToUpload = images.filter(image => !image.mediaId);
        imagesToUpload.forEach(image => {
            if (image.originalImageSent === false) {
                n++;
            }
            if (image.editImageSent === false) {
                n++;
            }
        });
        return n;
    }
);

export const getAllImageDataObjectsForView = (viewName: string) =>
    createSelector(getImageDataObjects, data =>
        data.filter(d => d.fieldId.split('.')[0] === viewName)
);


export const getSelectedImageDataObject = (id: string) =>
    createSelector(getImageDataObjects, data => {
        return data.find(e => e.fieldId === id);
});

export const getAllImagesForDataObject = (id: string) =>
    createSelector(getAllImages, images => {
        return images.filter(img => img.carouselID === id);
});
