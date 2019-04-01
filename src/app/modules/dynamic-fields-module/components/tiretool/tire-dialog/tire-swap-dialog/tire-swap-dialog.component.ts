import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../../../store';
import { FunctionalityService } from '../../../../../../services/functionality.service';
import { TireToolModule } from '../../tiretool.component';
import { DataModel } from '../../../../../../models/view.model';

export const TireOptions = ['loadIndex', 'manufacturer', 'speedIndex', 'tireClass', 'tireAddOn', 'serialNumber', 'tireMeasure', 'profile'];

@Component({
    selector: 'app-tire-swap-dialog',
    templateUrl: './tire-swap-dialog.component.html',
    styleUrls: ['./tire-swap-dialog.component.scss']
})


export class TireSwapDialogComponent implements OnInit {

    public tireOptions = TireOptions;

    constructor(public dialogRef: MatDialogRef<TireSwapDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {currentTire: any, tires: any[]},
        private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService) {
    }

    ngOnInit() {
        this.dialogRef.updateSize('400px', '600px'); // TODO: make size dynamic
    }

    getTireManufacturer(tire) {
        const manufacturer =  tire.find(element => element.fieldId === 'manufacturer').value;
        if (manufacturer && manufacturer.friendlyname) {
            return manufacturer.friendlyname;
        }
    }

    getTirePositionCode(tire) {
        const positionCode =  tire.find(element => element.fieldId === 'positionCode').value;
        if (positionCode && positionCode.shortname) {
            return positionCode.shortname;
        }
    }

    getTireProfile(tire) {
        const profile =  tire.find(element => element.fieldId === 'profile').value;
        if (profile) {
            return profile;
        }
    }

    swapTire(tire) {
        const positionCode =  tire.find(element => element.fieldId === 'positionCode').value;
        if (positionCode && positionCode.shortname) {
            this.data.currentTire.forEach(element => {
                if (element.fieldId === 'positionCode' || element.fieldId === 'axle' || element.fieldId === 'axlePosition' || element.fieldId === 'profile') {
                    // Swap all properties of the two tires besides the position properties
                    return;
                }
                const temp = element.value;
                const tireElementValue = tire.find(e => e.fieldId === element.fieldId).value;
                element.value = JSON.parse(JSON.stringify(tireElementValue));
                tire.find(e => e.fieldId === element.fieldId).value = JSON.parse(JSON.stringify(temp));
            });
        }

        const dataMap = new Map<string, DataModel>();
        this.tireOptions.forEach(option => {
            const newValue = this.data.currentTire.find(element => element.fieldId === option).value;
            dataMap.set(option, {fieldId: 'tireTool.' + option, value: newValue, serverOperation: null});
        });
        this.store.dispatch(new fromStore.SetData({nameOfModule: 'tireTool', data: dataMap}));

        this.dialogRef.close();
    }
}