import { Actions, Effect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromData from '../actions';
import * as fromStore from '..';
import { map, switchMap, catchError, flatMap, first, withLatestFrom, filter, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataLoadingService } from '../../services/dataLoading.service';
import { Store } from '@ngrx/store';
import { FunctionalityService } from '../../services/functionality.service';
import { MatSnackBar } from '@angular/material';
import { SpinnerService } from '../../services/spinner.service';
import { DEFAULT_TIMEOUT } from '../../services/timeout.interceptor';
import { NGXLogger } from 'ngx-logger';
import { DataModel, PhotoDataModel } from '../../models/view.model';


export const ERROR_MESSAGE_DURATION = 3000;
@Injectable()
export class DataEffect {

    constructor( private _dataService: DataLoadingService, private actions$: Actions, private funcService: FunctionalityService,
        private store: Store<fromStore.ModulesState>, public snackBar: MatSnackBar, private spinnerService: SpinnerService,
        private logger: NGXLogger) { }

    @Effect()
    loadData$ = this.actions$.ofType(fromData.GET_DATA).pipe(
        switchMap(() =>
            this._dataService.getAppStructure().pipe(
                map(data => new fromData.GetDataSuccess(data)),
                catchError(error => {
                    this.displayError(error);
                    return of(new fromData.GetDataFail(error));
                })
            )
        )
    );


    @Effect()
    loadComboBoxOptions$ = this.actions$.pipe(
        ofType<fromData.GetComboboxOptions>(fromData.GET_COMBOBOX_OPTIONS),
        map(action => action.payload),
        flatMap(( payload => {
            console.log('Trying to get data from: ' + payload.url);
            return this._dataService.getDataFromUrl(payload.url).pipe(
                map(data => new fromData.GetComboboxOptionsSuccess({...data, elementId: payload.elementId})),
                catchError(error => {
                    this.displayError(error, payload.url);
                    return of(new fromData.GetComboboxOptionsFail(error));
                })
            );
        })
    ));

    @Effect()
    loadTableItems$ = this.actions$.pipe(
        ofType<fromData.GetTableItems>(fromData.GET_TABLE_ITEMS),
        map(action => action.payload),
        switchMap(( payload => {
            this.spinnerService.isLoading.next(true);
            console.log('Trying to get table data from: ' + payload.url);
            return this._dataService.getDataFromUrl(payload.url).pipe(
                map(data => new fromData.GetTableItemsSuccess({...data, elementId: payload.elementId})),
                catchError(error => {
                    this.displayError(error, payload.url);
                    return of(new fromData.GetTableItemsFail(error));
                })
            );
        })
    ));

    @Effect({dispatch: false})
    removeSpinner$ = this.actions$.pipe(
        ofType(fromData.GET_TABLE_ITEMS_SUCCESS, fromData.GET_TABLE_ITEMS_FAIL,
               fromData.GET_PROTOCOL_FAIL, fromData.GET_PROTOCOL_SUCCESS,
               fromData.GET_MODULES_FAIL, fromData.GET_DATA_FOR_MODULES_FAIL,
               fromData.LOGIN_SUCCESS, fromData.LOGIN_FAIL),
        map(() => this.spinnerService.isLoading.next(false))
    );

    @Effect()
    login$ = this.actions$.pipe(
        ofType<fromData.Login>(fromData.LOGIN),
        map(action => action.payload),
        switchMap(payload => {
            this.spinnerService.isLoading.next(true);
            console.log('Trying to get data from: ' + payload);
            return this._dataService.getDataFromUrl(payload).pipe(
                map(data => new fromData.LoginSuccess(data)),
                catchError(error => {
                    this.displayError(error, payload);
                    return of(new fromData.LoginFail(error));
                })
            );
        }
    ));

    @Effect({dispatch: false})
    loginSuccess$ = this.actions$.pipe(
        ofType<fromData.LoginSuccess>(fromData.LOGIN_SUCCESS),
        withLatestFrom(this.store.select(fromStore.getModuleWithName('login'))),
        map(([action, module]) => this.funcService.goToNextView(module))
    );

    @Effect()
    getModules$ = this.actions$.pipe(
        ofType<fromData.GetModules>(fromData.GET_MODULES),
        withLatestFrom(this.store.select(fromStore.getDataElementValue('processManager.getProcessDefinitionXmlUrl'))),
        switchMap(([action, url]) => {
                    // this.funcService.xmlParser.findXMLforProcessDefinition(url).pipe(
                    // this.funcService.xmlParser.findXMLforProcessDefinition('https://tuv.damagecloud.de/clients/tuv/mobileClient/processDefinitions/S_VWV_TUV_v2.9.xml').pipe(
                    return this.funcService.xmlParser.findXMLforProcessDefinition('http://localhost:4200/assets/my_S_VWV_TUV_v2.9.xml').pipe(
                        map(data => new fromData.GetModulesSuccess({data: data, dataArray: action.payload.data})),
                        catchError(error => {
                            this.displayError(error, url);
                            return of(new fromData.GetModulesFail(error));
                        }));
                    }
        )
    );

    @Effect()
    getModulesSuccess$ = this.actions$.pipe(
        ofType<fromData.GetModulesSuccess>(fromData.GET_MODULES_SUCCESS),
        map(action => action.payload),
        switchMap(( payload => {
            // Data got loaded, switch to the new view
            this.store.select(fromStore.getData).pipe(first()).subscribe(
                modules => {
                // const processModules = modules.filter( m => m.structure.tags.includes('processModule'));
                // const goToModule = processModules.find( m => m.structure.visible /* && m.structure.included */);
                // TODO: Fix hardcoded dynamicFields string & empty string
                this.funcService.changeView('', 'dynamicFields'/*goToModule.structure.moduleID*/);
                }
            );
            return of(new fromData.GetDataForModulesSuccess({data: payload.dataArray}));
        }))
    );


    @Effect()
    getDataForModules$ = this.actions$.pipe(
        ofType<fromData.GetDataForModules>(fromData.GET_DATA_FOR_MODULES),
        map(action => action.payload),
        switchMap(payload => {
            this.spinnerService.isLoading.next(true);
            console.log('Trying to get data from: ' + payload);
            return this._dataService.getDataFromUrl(payload).pipe(
                map(data => new fromData.GetModules({data: data})),
                catchError(error => {
                    this.displayError(error, payload);
                    return of(new fromData.GetDataForModulesFail(error));
                })
            );
        })
    );

    @Effect()
    createInspection$ = this.actions$.pipe(
        ofType<fromData.CreateInspection>(fromData.CREATE_INSPECTION),
        map(action => action.payload),
        switchMap(payload => {
            console.log('Trying to create inspection with call: ' + payload);
            return this._dataService.getDataFromUrl(payload).pipe(
                map(data => new fromData.CreateInspectionSuccess(data)),
                catchError(error => {
                    this.displayError(error, payload);
                    return of(new fromData.CreateInspectionFail(error));
                })
            );
        })
    );

    @Effect()
    equipmentView$ = this.actions$.pipe(
        ofType<fromData.GetEquipmentView>(fromData.GET_EQUIPMENT_VIEW),
        map(action => action.payload),
        switchMap((payload) => {
            console.log('Trying to get data from: ' +  payload);
            return this._dataService.getDataFromUrl(payload).pipe(
                map(data => new fromData.GetEquipmentViewSussess(data)),
                catchError(error => {
                    this.displayError(error, payload);
                    return of(new fromData.GetEquipmentViewFail(error));
                })
            );
        })
    );

    @Effect({dispatch: false})
    menuBarButtonPress$ = this.actions$.pipe(
        ofType<fromData.MenuBarButtonPress>(fromData.MENU_BAR_BUTTON_PRESS),
        map(action => action.payload),
        switchMap( (payload => {
            if (payload.navigateToModule !== '' && payload.navigateToModule !== undefined) {
                this.funcService.dynamicStrings.unsubscribeAllDynamicStrings();
                this.funcService.changeView(payload.navigateToModule, payload.navigateToModule);
            }
            return of({});
        }))
    );

    @Effect()
    syncData$ = this.actions$.pipe(
        ofType<fromData.SyncData>(fromData.SYNC_DATA),
        map(action => action.payload),
        withLatestFrom(this.store.select(fromStore.getUpdatedInspectionData),
                       this.store.select(fromStore.getAllImages),
                       this.store.select(fromStore.getImageDataObjects),
                       this.store.select(fromStore.getDatalayerForModule('documentation')),
                       this.store.select(fromStore.getDatalayerForModule('damageView'))),
        switchMap( ([url, updatedData, allImages, carousels, documentationDataLayer, damageViewDataLayer]) => {
            this.spinnerService.loadingMessage = 'Saving inspection changes!';
            this.spinnerService.isLoading.next(true);

            const documentationModule = updatedData.data.find( module => Object.keys(module).includes('documentation'));
            const damageViewModule = updatedData.data.find( module => Object.keys(module).includes('damageView'));
            if (allImages && allImages.length) {
                // Putting images to the coresponding damages / documentations

                carousels.forEach(carousel => {
                    const carouselId = carousel.fieldId;
                    const imagesForThisCarousel = allImages.filter(image => image.carouselID === carouselId);

                    if (imagesForThisCarousel.length === 0) {
                        // There are no pictures for this carousel
                        return;
                    }

                    const carouselBelongTo = carouselId.split('.')[0];
                    if (carouselBelongTo === 'documentation') {
                        // Find the documentation to which this carousel belongs and add all pictures to it for the sync process
                        const documentation: any = documentationModule.documentation.find((doc: any) => {
                            const carouselIdProperty: DataModel = doc.documentation.find((property: DataModel) => property.fieldId === 'carouselId');
                            if (carouselIdProperty && carouselIdProperty.value === carouselId) {
                                const index = doc.documentation.findIndex((element: DataModel) => element === carouselIdProperty);
                                doc.documentation.splice(index, 1);
                                return true;
                            }
                        });

                        if (documentation) {
                            imagesForThisCarousel.forEach(image =>
                                documentation.documentation.push({fieldId: 'image', value: {internalId: image.id , drawData: image.svg, editedInternalId: image.image64EditID }, serverOperation: 'UPDATE'})
                            );
                        }
                    } else if (carouselBelongTo === 'damageView') {
                        // Find the damage to which this carousel belongs and add all pictures to it for the sync process
                        const damage: any = damageViewModule.damageView.find((dmg: any) => {
                            const carouselIdProperty: DataModel = dmg.damage.find((property: DataModel) => property.fieldId === 'carouselId');
                            if (!carouselIdProperty) {
                                return false;
                            }
                            if (carouselIdProperty.value === carouselId) {
                                const inspectionDamageId = dmg.damage.find((property: DataModel) => property.fieldId === 'inspectionDamageId');
                                if (inspectionDamageId && inspectionDamageId.value) {
                                    if (inspectionDamageId.serverOperation !== 'DELETE') {
                                        inspectionDamageId.serverOperation = 'UPDATE';
                                    }
                                }
                                const index = dmg.damage.findIndex((element: DataModel) => element === carouselIdProperty);
                                dmg.damage.splice(index, 1);
                                return true;
                            }
                        });
                        if (damage) {
                            imagesForThisCarousel.forEach(image =>
                                damage.damage.push({fieldId: 'image', value: {internalId: image.id , drawData: image.svg, editedInternalId: image.image64EditID }, serverOperation: 'UPDATE'})
                            );
                        }
                    }
                });
            }
            console.log(updatedData);
            return this._dataService.postInspectionData(url, updatedData).pipe(
                map(data => new fromData.SyncDataSuccess(data)),
                catchError(error => {
                    this.displayError(error, url);
                    return of(new fromData.SyncDataFail(error));
                })
            );
        })
    );


    @Effect()
    syncDataSuccess$ = this.actions$.pipe(
        ofType<fromData.SyncDataSuccess>(fromData.SYNC_DATA_SUCCESS),
        withLatestFrom(this.store.select(fromStore.getAllImages)),
        switchMap(([oldAction, pictures]) => {
            if (pictures.length > 0) {
                return of(new fromData.PictureUploadStart());
            } else {
                return of(new fromData.SyncAndImageUploadCompleted());
            }
        })
    );

    @Effect()
    syncDataAndImageUploadCompleted$ = this.actions$.pipe(
        ofType<fromData.SyncAndImageUploadCompleted>(fromData.SYNC_AND_IMAGE_UPLOAD_COMPLETED),
        withLatestFrom(this.store.select(fromStore.getDataElementValue('processManager.getInspectionUrl'))),
        tap( () => {
            this.spinnerService.isLoading.next(false);
            this.spinnerService.loadingMessage = 'Loading...';
        }),
        switchMap(([oldAction, getInspectionUrl]) =>
            this._dataService.getDataFromUrl(getInspectionUrl).pipe(
                map(data => new fromData.GetDataForModulesSuccess({data: data, partialUpdate: true})),
                catchError(error => {
                    this.displayError(error);
                    return of(new fromData.GetDataForModulesFail(error));
                })
            )
        )
    );


    @Effect({dispatch: false})
    onPartialUpdate$ = this.actions$.pipe(
        ofType<fromData.GetDataForModulesSuccess>(fromData.GET_DATA_FOR_MODULES_SUCCESS),
        map(action => action.payload),
        filter(payload => payload.partialUpdate),
        withLatestFrom(this.store.select(fromStore.getDatalayerForModule('damageView'))),
        map(([payload, damageViewDataLayer]) => {
            damageViewDataLayer.forEach((damage: any) => {
                // A partial update is done after a sync
                // The data for damageView is replaced and a new carouselId is generated
                // New carousel objects need to be created for the new ids and the already downloaded images
                // need to have their carouselIds corrected to point to the new ones
                const carouselIdProperty = damage.damage.find((property: DataModel) => property.fieldId === 'carouselId');
                const dataElement: PhotoDataModel = { value: {} };
                dataElement.value.imageCarousel = [];
                dataElement.fieldId = carouselIdProperty.value;

                const allProperties = damage.damage.map((property: DataModel) => property);
                const images = allProperties.filter((property: DataModel) => property.fieldId === 'image');
                images.forEach(image =>
                    this.store.dispatch(new fromStore.UpdateCarouselIdForImage({
                        imageId: image.value.internalId,
                        newCarouselId: carouselIdProperty.value
                    })));
                this.store.dispatch(new fromStore.SaveImageDataObject(dataElement));
            });
            return;
        })
    );

    @Effect({dispatch: false})
    deleteImagesAfterCarouselDeletion$ = this.actions$.pipe(
        ofType<fromData.DeleteImageDataObject>(fromData.DELETE_IMAGE_DATA_OBJECT),
        map(action => action.payload.fieldId),
        mergeMap(id =>
            of(id).pipe(
                withLatestFrom(this.store.select(fromStore.getAllImagesForDataObject(id)))
            )
        ),
        map(([carouselId, images]) => {
            images.forEach(image => {
                if (image.carouselID === carouselId) {
                    this.store.dispatch(new fromStore.DeleteImage(image));
                }
            });
        })
    );

    @Effect()
    deleteImage$ = this.actions$.pipe(
        ofType<fromData.DeleteImage>(fromData.DELETE_IMAGE),
        map(action => action.payload),
        switchMap(payload => {
            // Change pictureLoading for this carousel so that the correct background is displayed
            this.funcService.picturesLoading.set(payload.carouselID, false);
            return of(new fromData.SetImageToBeDeleted(payload));
        })
    );

    @Effect()
    pictureUploadSuccess$ = this.actions$.pipe(
        ofType(fromData.PICTURE_UPLOAD_START, fromData.PICTURE_UPLOAD_SUCCESS),
        withLatestFrom(this.store.select(fromStore.getDataElementValue('protocol.pictureUploadCall')),
                       this.store.select(fromStore.getDataElementValue('processManager.inspectionInfo.inspectionId')),
                       this.store.select(fromStore.getNextImageForUpload),
                       this.store.select(fromStore.getNumberOfImagesToUpload)),
        switchMap(([oldAction, url, inspectionId, picture, numberOfImagesToUpload]) => {
            if (!picture) {
                return of(new fromData.SyncAndImageUploadCompleted);
            }
            this.spinnerService.loadingMessage = 'Uploading images. ' + numberOfImagesToUpload + ' images left!';
            const postData = {inspectionId: inspectionId, frontendInternalId: picture.id, imgData: picture.image64};
            console.log(postData);
            return this._dataService.postPicture(url, postData).pipe(
                map(response => new fromData.PictureUploadSuccess(picture.id)),
                catchError(error => {
                    this.displayError(error, url);
                    return of(new fromData.PictureUploadFail(error));
                })
            );
        })
    );

    @Effect()
    getProtocol$ = this.actions$.pipe(
        ofType<fromData.GetProtocol>(fromData.GET_PROTOCOL),
        map( action => action.payload),
        switchMap( url => {
            this.spinnerService.isLoading.next(true);
            console.log('Trying to get data from: ' + url);
            return this._dataService.getPictureFromUrl(url).pipe(
                map(data => new fromStore.GetProtocolSuccess(data)),
                catchError(error => {
                    this.displayError(error, url);
                    return of(new fromData.GetProtocolFail(error));
                })
            );
        })
    );

    @Effect()
    getXMLCombobox$ = this.actions$.pipe(
        ofType<fromData.GetXMLComboBox>(fromData.GET_XML_COMBOBOX),
        map(action => action.payload),
        switchMap( payload => {
            console.log('Trying to get data from: ' + payload.url);
            return this._dataService.getDataFromUrlAsText(payload.url).pipe(
                map(data => new fromStore.GetXMLComboBoxSuccess({data, elementId: payload.elementId})),
                catchError(error => {
                    this.displayError(error, payload.url);
                    return of(new fromData.GetXMLComboBoxFail(error));
                })
            );
        })
    );


    @Effect()
    loadLocalStorageData$ = this.actions$.ofType(fromData.REHYDRATE_STORE).pipe(
        switchMap(() => {
            const storageData = this.retrieveState();
            return storageData.pipe(
                map(data => new fromData.GetDataSuccess(data.data)),
                catchError(error => {
                    this.displayError(error);
                    return of(new fromData.GetDataFail(error));
                })
            );
        })
    );

    @Effect({dispatch: false})
    downloadImage$ = this.actions$.pipe(
        ofType<fromData.DownloadImage>(fromData.DOWNLOAD_IMAGE),
        map(action => action.payload),
        flatMap(payload => {
            return this._dataService.getPictureFromUrl(payload.url).pipe(
                map(image => {
                    const base64Image = 'data:image/png;base64,' + image;
                    // This recreates the edited image from the original and the svgs, if there are no saved svgs, skip this step
                    // The edited images can also be downloaded from the url and this step can be skipped, however that would require bandwith
                    // A single image takes around 200 ms on a i7-950
                    // TODO: Test on mobile/tablets and check the performance
                    if (payload.svg && payload.svg.length > 0) {

                        const canvas = document.createElement('canvas');
                        canvas.setAttribute('width', '640');
                        canvas.setAttribute('height', '480');
                        const ctx = canvas.getContext('2d');

                        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svg.style.backgroundImage = `url(${base64Image})`;
                        svg.style.backgroundSize = 'cover';
                        if (payload.svg && payload.svg.length > 0) {
                            const svgStrings = payload.svg.split('~');

                            svgStrings.forEach(svgString => {
                                const div = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                div.innerHTML = svgString;
                                const element = div.firstChild;
                                div.removeChild(element);
                                svg.appendChild(element);
                            });
                        }

                        const img = new Image();
                        const xml = new XMLSerializer().serializeToString(svg);
                        const svg64 = btoa(xml);
                        const b64Start = 'data:image/svg+xml;base64,';
                        const image64 = b64Start + svg64;
                        img.src = image64;

                        img.onload = () => {
                            // this dimension for the drawImage need to be explicitly given otherwise it resizes the image
                            ctx.drawImage(img, 0, 0, 640, 480);
                            const edited64Image = canvas.toDataURL();
                            this.store.dispatch(new fromStore.SaveImage({
                                carouselID: payload.carouselId,
                                image64: base64Image,
                                image64Edit: edited64Image,
                                id: payload.imageId || `${new Date().getTime()}`,
                                mediaId: payload.mediaId,
                                svg: payload.svg,
                                originalImageSent: true,    // Once the original image was saved it should never be saved again
                                editImageSent: true         // Change to false when the edit has been changed to resend
                            }));
                        };
                    } else {
                        this.store.dispatch(new fromStore.SaveImage({
                            carouselID: payload.carouselId,
                            image64: base64Image,
                            id: payload.imageId || `${new Date().getTime()}`,
                            mediaId: payload.mediaId,
                            svg: payload.svg,
                            originalImageSent: true,    // Once the original image was saved it should never be saved again
                            editImageSent: true         // Change to false when the edit has been changed to resend
                        }));
                    }
                    return;
            })
            );
        })
    );

    retrieveState() {
        try {
            const serializedState = localStorage.getItem('state');
            if (serializedState === null) {
              return undefined;
            }
            return of(JSON.parse(serializedState));
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }

    displayError(error, url = '') {
        // Timeout error
        if (error.name === 'TimeoutError') {
            const errorMessage = 'Your request timed out after ' + DEFAULT_TIMEOUT / 1000 + ' seconds.\
            Check your internet connection and try again.';
            this.snackBar.open(errorMessage, 'OKAY', {
                duration: ERROR_MESSAGE_DURATION
            });
            this.logger.error(errorMessage + ' For request:' + url);
            return;
        }

        if (error.error && error.error.data && error.error.data.message) {

            if (error.error.data.message.split(' ').splice(0, 2).join(' ') === 'Session expired:') {
            // Session expired, logout
                this.store.dispatch(new fromStore.Logout());
                this.funcService.changeView('login', 'authentication');
            }
            this.snackBar.open(error.error.data.message, 'OKAY', {
                duration: ERROR_MESSAGE_DURATION
            });
            this.logger.error(error.error.data.message + ' For request:' + url);
            return;
        }

        // General error message
        this.snackBar.open(error.message, 'OKAY', {
            duration: ERROR_MESSAGE_DURATION
        });
        this.logger.error(error.message + ' For request:' + url);
    }
}