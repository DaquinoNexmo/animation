import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material';
import { ImageMethodSelectionComponent } from '../image-method-selection/image-method-selection.component';
import { PhotoDocuItem, DataModel, PhotoDataModel, Module, Option, DefaultFotoDocuElement } from '../../../../models/view.model';
import { ImageModel } from '../../../../models/view.model';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../store';
import { first, filter, map } from 'rxjs/operators';
import { FunctionalityService } from '../../../../services/functionality.service';
import { RequestType } from '../../../../helper-classes/dynamicstrings';
import { ImageEditSvgComponent } from '../image-edit-svg/image-edit-svg.component';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogDataService } from '../../../../services/dialogData.service';



export interface DocumentationModule extends Module {
    structure: Module['structure'] & {
        dataProviderCall?: string;
    };
}

@Component({
    selector: 'app-picture-documentation-component',
    templateUrl: './picture-documentation.component.html',
    styleUrls: ['./picture-documentation.component.scss'],
    providers: [DatePipe]
})

export class PictureDocumentationComponent implements OnInit, OnDestroy {
    activeSlideIndex = 0;
    public disableAddButton = false;
    documentationModule: DocumentationModule;
    browserWidth;
    browserHeight;

    subscriptions: Subscription[] = [];

    constructor(private dialog: MatDialog, private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService, private route: ActivatedRoute, private router: Router, private dialogService: DialogDataService) {

        this.browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        this.browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }

    ngOnInit() {
        this.store.select(fromStore.getModuleWithName('documentation')).pipe(
            first()
        ).subscribe(module => {
            this.documentationModule = module;
            if (!Array.isArray(this.documentationModule.structure.element)) {
                this.documentationModule.structure.element = [];
            }
            if (this.documentationModule.structure.element.length === 0) {
                // Initialize elements
                this.store.select(fromStore.getDocumentationOptions()).pipe(filter(val => !!val), first())
                    .subscribe(options => {
                        // Add all required elements
                        options.forEach((option: Option) => {
                            if (option.required) {
                                this.addElement(option);
                            }
                        });

                        // After adding all required elements check for already existing
                        // elements from the data layer which are not required and add them
                        this.documentationModule.data.forEach((d: any) => {
                            if (d.documentation) {
                                const shortname = d.documentation.find((elem: DataModel) => elem.fieldId === 'fotoDocu').value.shortname;
                                const requiredOptions = options.filter(option => option.required);
                                if (requiredOptions.find(option => option.shortname === shortname)) { return; }
                                if (!this.documentationModule.data.find(data => data.value && data.value.shortname === shortname)) {
                                    const option = options.find(op => op.shortname === shortname);
                                    this.addElement(option);
                                }
                            }
                        });
                    });
            } else {
                // The elements are already initialized, look for pictures and download them
                this.store.select(fromStore.getAllImages).pipe(first()).subscribe(images => {
                    // Check if pictures have already been downloaded, if so don't download again
                    const docImage = images.find(image => image.carouselID.split('.')[0] === 'documentation');
                    if (docImage) { return; }
                    this.documentationModule.data.forEach((data: any) => {
                        if (data.documentation) { return; }
                        this.downloadPicturesForOption({ shortname: data.value.shortname, friendlyname: data.value.friendlyname }, data.fieldId);
                    });
                });
            }
            this.funcService.dynamicStrings.addDynamicStringToStructure(this.documentationModule.structure.dataProviderCall, 'documentation', true, true, RequestType.combobox);
        });

    }


    search(document: PhotoDocuItem) {

        const id = document.id;
        const dialogRef = this.dialog.open(ImageMethodSelectionComponent, {
            height: '200px',
            width: '400px',
            data: {},
            panelClass: ''
        });

        dialogRef.afterClosed().subscribe((newImage: ImageModel) => {

            if (newImage) {
                newImage.carouselID = id;

                this.store.select(fromStore.getSelectedImageDataObject(id)).pipe(first()).subscribe(dataElem => {

                    if (!dataElem) {
                        const dataElement: PhotoDataModel = { value: {} };
                        dataElement.value.imageCarousel = [];
                        dataElement.fieldId = id;
                        dataElement.value.imageCarousel.push(newImage.id);
                        this.store.dispatch(new fromStore.SaveImageDataObject(dataElement));

                        this.editSelectedSlide(newImage);

                    } else {
                        this.store.dispatch(new fromStore.AddImageToDataObject(newImage));
                        this.store.select(fromStore.getAllImagesForDataObject(id)).pipe(first()).subscribe((arr: ImageModel[]) => {
                            // console.log(arr);
                            if (arr.length >= document.imageCarousel.imagesMax) {
                                this.store.dispatch(new fromStore.ImageCarouselChangeEditable(id, false));
                            }
                        });
                        this.editSelectedSlide(newImage);
                    }
                });
            }
        });
    }

    editSelectedSlide(image: ImageModel) {


        this.dialogService.component = ImageEditSvgComponent;

        if (this.browserWidth > 812) {
            this.dialogService.config = {
                data: image
            };
            this.router.navigate(['./dialog'], {
                relativeTo: this.route,
                });
        } else {
            console.log('mobile');

            this.dialogService.config = {
                height: `100%`,
                width: `100%`,
                minWidth: `100%`,
                data: image,
                panelClass: 'dialog-container'
            };
            this.router.navigate(['./dialog'], {
                relativeTo: this.route,
                 });
        }
    }

    addElement(option?) {
        const dataMap = new Map();
        const date = this.guid();
        const id = 'documentation.' + date;
        const nextElement: PhotoDocuItem = JSON.parse(JSON.stringify(DefaultFotoDocuElement));
        nextElement.id = id;
        nextElement.photoDocuType.id = id;
        // this.store.dispatch(new fromStore.AddPhotoDocuItem(nextElement));
        this.store.dispatch(new fromStore.AddElementToStructure(nextElement));
        if (option) {
            dataMap.set(id, { fieldId: id, value: option, serverOperation: 'UPDATE' });
            this.store.dispatch(new fromStore.SetData({ nameOfModule: 'documentation', data: dataMap }));
            this.downloadPicturesForOption(option, id);
        } else {
            // Documentations should always have an option selected, this gives new docus a default option
            // If they don't have an option selected and a sync happens, the documentations will not get saved
            // and if they have images attached to them, attempting to upload them will result in an error
            this.store.select(fromStore.getDocumentationOptions()).pipe(first()).subscribe(options => {
                const availableOptions = options.filter(opt => !this.funcService.selectedOptionsArray.map(op => op.friendlyname).includes(opt.friendlyname));
                const defaultOption = availableOptions.shift();
                dataMap.set(id, { fieldId: id, value: defaultOption, serverOperation: 'UPDATE' });
                this.store.dispatch(new fromStore.SetData({ nameOfModule: 'documentation', data: dataMap }));
            });
        }
    }

    downloadPicturesForOption(option, id: string) {
        // The method checks if the data layer contains any documentation elements that contain images
        // If images are found, they are downloaded and assigned carouselIds coresponding to that documentation
        this.documentationModule.data.forEach((doc: any) => {
            if (doc.documentation) {
                const typeOfDoc = doc.documentation.find(data => data.fieldId === 'fotoDocu');
                if (option.shortname === typeOfDoc.value.shortname) {

                    const images = doc.documentation.filter(element => element.fieldId === 'image' && !(element.serverOperation === 'DELETE'));
                    images.forEach(image => {
                        if (image.value.url === '$DUMMY$') { return; }
                        this.store.dispatch(new fromStore.DownloadImage({
                            url: image.value.url,
                            carouselId: id,
                            imageId: image.value.internalId,
                            mediaId: image.value.mediaId,
                            svg: image.value.drawData
                        }));
                    });
                    const subscription = this.store.select(fromStore.getDataElementValue(id)).subscribe(value => {
                        // Checks if there are images to be loaded, if so the background will be different
                        if (!value) { return; }
                        const allSavedDocumentations = this.documentationModule.data.filter((docu: any) => docu.documentation);
                        const savedDocu: any = allSavedDocumentations.find((docu: any) => docu.documentation.find(property => property.fieldId === 'fotoDocu' && property.value.shortname === value.shortname));
                        if (savedDocu) {
                            const allImages = savedDocu.documentation.filter(property => property.fieldId === 'image' && !(property.serverOperation === 'DELETE'));
                            if (allImages.length > 0) {
                                this.funcService.picturesLoading.set(id, true);
                                return;
                            }
                        }
                        this.funcService.picturesLoading.set(id, false);
                    });
                    this.subscriptions.push(subscription);

                    this.store.select(fromStore.getSelectedImageDataObject(id)).pipe(first()).subscribe(dataElem => {
                        // Create carousel element if one doesn't exist
                        if (!dataElem) {
                            const dataElement: PhotoDataModel = { value: {} };
                            dataElement.value.imageCarousel = [];
                            dataElement.fieldId = id;
                            this.store.dispatch(new fromStore.SaveImageDataObject(dataElement));
                        }
                    });
                }
            }
        });
    }

    imageIsLoading(id) {
        return this.funcService.picturesLoading.get(id);
    }

    shouldDisableDeleteButton(document) {
        return this.store.select(fromStore.getDatalayerForModule('documentation'))
            .pipe(first(),
                map(dataLayer => {
                    if (!dataLayer) {
                        return false;
                    }
                    const documentData = dataLayer.find((data: DataModel) => data.fieldId === document.id);
                    if (documentData && documentData.value) {
                        return documentData.value.required;
                    }
                    return false;
                })
            );
    }

    deletePhotoDocuItem(id: string) {

        let dataObj;
        this.store.select(fromStore.getDatalayerForModule('documentation'))
            .pipe(first())
            .subscribe(data => {
                dataObj = data.find((d: PhotoDataModel) => d.fieldId === id);
                let currentOption = '';
                if (dataObj) {
                    currentOption = dataObj.value.friendlyname;
                }
                this.funcService.selectedOptionsArray = this.funcService.selectedOptionsArray.filter(option => option.friendlyname !== currentOption);
                this.funcService.selectedOptions.next(this.funcService.selectedOptionsArray);
            }
            );

        this.store.select(fromStore.getDataElementValue(id)).pipe(first()).subscribe(value => {
            if (value && value.shortname) {
                this.store.dispatch(new fromStore.DeleteElementFromStructure({ id: id, documentationShortname: value.shortname }));
            } else {
                this.store.dispatch(new fromStore.DeleteElementFromStructure({ id: id }));
            }
        });

        this.store.select(fromStore.getSelectedImageDataObject(id))
            .pipe(first(), filter(carousel => !!carousel))
            .subscribe(carousel => this.store.dispatch(new fromStore.DeleteImageDataObject(carousel)));
    }

    maxPhotoDisable(id: string, maxSize: number): boolean {

        let disabled = false;
        this.store.select(fromStore.getAllImagesForDataObject(id)).subscribe((arr: ImageModel[]) => {
            console.log(arr);
            if (arr.length >= maxSize) {
                disabled = true;
                return disabled;
            }
        });
        return disabled;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

}
