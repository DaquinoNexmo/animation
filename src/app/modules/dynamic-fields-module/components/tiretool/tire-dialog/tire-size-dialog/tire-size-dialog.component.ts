import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../../../store';
import { FunctionalityService } from '../../../../../../services/functionality.service';
import { TireToolModule } from '../../tiretool.component';
import { DataModel } from '../../../../../../models/view.model';


export enum TireSizeState {
    WIDTH = 'WIDTH',
    RATIO = 'RATIO',
    DIAMETER = 'DIAMETER'
}
@Component({
    selector: 'app-tire-size-dialog',
    templateUrl: './tire-size-dialog.component.html',
    styleUrls: ['./tire-size-dialog.component.scss']
})


export class TireSizeDialogComponent implements OnInit {

    widths = [];
    ratios = [];
    diameters = [];

    @ViewChild('widthTitle') widthTitle;
    @ViewChild('ratioTitle') ratioTitle;
    @ViewChild('diameterTitle') diameterTitle;

    public tireSizeState = TireSizeState;

    currentWidth;
    currentRatio;
    currentDiameter;

    state: TireSizeState = TireSizeState.WIDTH;

    constructor(public dialogRef: MatDialogRef<TireSizeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {module: TireToolModule, elementId: string},
        private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService) {
    }

    ngOnInit() {
        this.ratios = this.data.module.structure.axisStructure.tireStructure.tireMeasure.tireRaito.split(',');
        this.diameters = this.data.module.structure.axisStructure.tireStructure.tireMeasure.tireDiameter.split(',');
        this.widths = this.data.module.structure.axisStructure.tireStructure.tireMeasure.tireWidth.split(',');

        this.dialogRef.updateSize('400px', '600px'); // TODO: make size dynamic

        this.widthTitle.nativeElement.style.backgroundColor = 'orange';
        this.store.select(fromStore.getDataElementValue(this.data.elementId)).subscribe(value => {
            if (value) {
                const parts = value.split(' ');
                const widthAndRatio = parts[0];
                this.currentWidth = widthAndRatio.split('/')[0];
                this.currentRatio = widthAndRatio.split('/')[1];
                this.currentDiameter = parts[1].split('R').join('');
            }
        });
    }

    saveSize() {
        const size = this.currentWidth + '/' + this.currentRatio + ' R' + this.currentDiameter;
        const dataMap = new Map<string, DataModel>();
        dataMap.set(this.data.elementId, {fieldId: this.data.elementId, value: size, serverOperation: null});
        this.store.dispatch(new fromStore.SetData({nameOfModule: 'tireTool', data: dataMap}));
        this.dialogRef.close();
    }

    selectWidth(width) {
        this.changeState(this.tireSizeState.RATIO);
        this.currentWidth = width;
    }

    selectRatio(ratio) {
        this.changeState(this.tireSizeState.DIAMETER);
        this.currentRatio = ratio;
    }

    selectDiameter(diameter) {
        this.currentDiameter = diameter;
    }

    changeState(newState) {
        switch (newState) {
            case this.tireSizeState.RATIO: {
                this.ratioTitle.nativeElement.style.backgroundColor = 'orange';
                this.diameterTitle.nativeElement.style.backgroundColor = 'gray';
                this.widthTitle.nativeElement.style.backgroundColor = 'gray';
                this.state = this.tireSizeState.RATIO;
                return;
            }

            case this.tireSizeState.DIAMETER: {
                this.diameterTitle.nativeElement.style.backgroundColor = 'orange';
                this.ratioTitle.nativeElement.style.backgroundColor = 'gray';
                this.widthTitle.nativeElement.style.backgroundColor = 'gray';
                this.state = this.tireSizeState.DIAMETER;
                return;
            }

            case this.tireSizeState.WIDTH: {
                this.widthTitle.nativeElement.style.backgroundColor = 'orange';
                this.diameterTitle.nativeElement.style.backgroundColor = 'gray';
                this.ratioTitle.nativeElement.style.backgroundColor = 'gray';
                this.state = this.tireSizeState.WIDTH;
                return;
            }
        }
    }
}