import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../store';
import { FunctionalityService } from '../../../../services/functionality.service';
import { Module, DataModel, PhotoDocuItem, ImageModel, PhotoDataModel } from '../../../../models/view.model';
import { MatDialog } from '@angular/material';
import { ImageMethodSelectionComponent } from '../../../picture-documentation-module/components/image-method-selection/image-method-selection.component';
import { first } from 'rxjs/operators';
import { ImageEditSvgComponent } from '../../../picture-documentation-module/components/image-edit-svg/image-edit-svg.component';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogDataService } from '../../../../services/dialogData.service';


export interface DamageViewModule extends Pick<Module, Exclude<keyof Module, 'data'>> {
    data: [{
        damage: DataModel[]
    }];
    structure: Module['structure'] & {
        buttonAdd: any;
    };
}

export enum DamageViewState {
    SELECT_IMAGE = 'Select image for damaged part',
    CREATE_DAMAGE = 'Pick damaged part from SVG'
}
@Component({
    selector: 'app-damage-view',
    templateUrl: './damage-view.component.html',
    styleUrls: ['../../../picture-documentation-module/components/picture-documentation/picture-documentation.component.scss',
        './damage-view.component.scss']
})


export class DamageViewComponent implements OnInit, OnDestroy {
    public disableAddButton = false;
    initialValues = [];
    browserWidth;
    browserHeight;
    subscription: Subscription;

    damageViewStates = DamageViewState;
    damageViewState: DamageViewState;
    @Input() module: DamageViewModule;
    damages = [];

    constructor(private dialog: MatDialog, private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService,
        private router: Router, private route: ActivatedRoute, private dialogDataService: DialogDataService) {
        this.browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        this.browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }

    ngOnInit() {
        this.damageViewState = this.damageViewStates.SELECT_IMAGE;
        this.subscription = this.store.select(fromStore.getDatalayerForModule('damageView')).subscribe(damages => {
            this.damages = damages;
            this.damages.forEach(damage => {
                const imageToDownload = damage.damage.find(property => property.fieldId === 'image' && property.serverOperation !== 'DELETE');
                if (imageToDownload) {
                    this.funcService.picturesLoading.set(this.getDamageCarouselId(damage.damage), true);
                }
            });
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getDamageType(damage: DataModel[]) {
        const type = damage.find(d => d.fieldId === 'damageType');
        return type.value ? type.value.friendlyname : '';
    }

    getDamageComponent(damage: DataModel[]) {
        const component = damage.find(d => d.fieldId === 'vehicleComponent');
        return component.value ? component.value.friendlyname : '';
    }

    getDamageDegree(damage: DataModel[]) {
        const degree = damage.find(d => d.fieldId === 'damageDegree');
        return degree.value ? degree.value.friendlyname : '';
    }

    getDamageCarouselId(damage: DataModel[]) {
        const carouselId = damage.find(d => d.fieldId === 'carouselId');
        return carouselId.value ? carouselId.value : '';
    }

    imageIsLoading(id) {
        return this.funcService.picturesLoading.get(id);
    }

    addPicture(carouselId: string) {
        const dialogRef = this.dialog.open(ImageMethodSelectionComponent, {
            height: '200px',
            width: '400px',
            data: {},
            panelClass: ''
        });

        dialogRef.afterClosed().subscribe((newImage: ImageModel) => {

            if (newImage) {
                this.store.select(fromStore.getSelectedImageDataObject(carouselId)).pipe(first()).subscribe(dataElem => {
                    // Create carousel element if one doesn't exist
                    if (!dataElem) {
                        const dataElement: PhotoDataModel = { value: {} };
                        dataElement.value.imageCarousel = [];
                        dataElement.fieldId = carouselId;
                        this.store.dispatch(new fromStore.SaveImageDataObject(dataElement));
                    }
                });

                newImage.carouselID = carouselId;
                this.store.dispatch(new fromStore.AddImageToDataObject(newImage));
                this.store.select(fromStore.getAllImagesForDataObject(carouselId)).pipe(first()).subscribe((arr: ImageModel[]) => {
                    console.log(arr);
                    if (arr.length >= 5) {
                        this.store.dispatch(new fromStore.ImageCarouselChangeEditable(carouselId, false));
                    }
                });
                this.editSelectedSlide(newImage);
            }
        });
    }

    shouldDisplayDamage(damage) {
        // If the damage is already saved, deleting it just marks it as deleted
        // Therefore it needs to be checked if its marked so it doesn't get displayed

        // If it is a new damage, deleting it removes it from the data completely
        // Therefore it doesn't need to be checked
        const inspectionDamageId = damage.damage.find(element => element.fieldId === 'inspectionDamageId');
        if (inspectionDamageId && inspectionDamageId.value) {
            if (inspectionDamageId.serverOperation === 'DELETE') {
                return false;
            }
        }
        return true;
    }

    editSelectedSlide(image: ImageModel) {

        // console.log(this.browserHeight, this.browserWidth);
        this.dialogDataService.component = ImageEditSvgComponent;

        if (this.browserWidth > 812) {
            // console.log('desktop');
            this.dialogDataService.config = { data: image };
            this.router.navigate(['./dialog'], {
                relativeTo: this.route,
            });

        } else {
            // console.log('mobile');
            this.dialogDataService.config = {
                height: `${this.browserHeight}px`,
                width: `${this.browserWidth}px`,
                minWidth: `${this.browserWidth}px`,
                data: image
            };
            this.router.navigate(['./dialog'], {
                relativeTo: this.route,
            });
        }
    }

    addDamage() {
        this.damageViewState = this.damageViewStates.CREATE_DAMAGE;
    }

    changeStateToDamageView() {
        this.damageViewState = this.damageViewStates.SELECT_IMAGE;
    }

    deleteDamageItem(damage) {
        this.store.dispatch(new fromStore.DeleteDamage(damage));
        const carouselId = damage.damage.find((property: DataModel) => property.fieldId === 'carouselId').value;
        this.store.select(fromStore.getSelectedImageDataObject(carouselId))
            .pipe(first())
            .subscribe(carousel => {
                if (carousel) {
                    this.store.dispatch(new fromStore.DeleteImageDataObject(carousel));
                }
            });
    }
}