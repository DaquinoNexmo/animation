import { MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../../store';
import { FunctionalityService } from '../../../../../services/functionality.service';
import { TireToolModule } from '../tiretool.component';
import { DataModel, DefaultTire } from '../../../../../models/view.model';
import { TireSizeDialogComponent } from './tire-size-dialog/tire-size-dialog.component';
import { TireSwapDialogComponent, TireOptions } from './tire-swap-dialog/tire-swap-dialog.component';

@Component({
    selector: 'app-tire-dialog',
    templateUrl: './tire-dialog.component.html',
    styleUrls: ['./tire-dialog.component.scss']
})

export class TireDialogComponent implements OnInit {

    public tireOptions = TireOptions;
    constructor(public dialogRef: MatDialogRef<TireDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {tire: any, module: TireToolModule, axle: any, axles: any, spareTires: any, additionalTires: any,
            deletedSpareTires: any, deletedAdditionalTires: any},
        private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService, public dialog: MatDialog) {
    }

    ngOnInit() {
        const dataMap = new Map<string, DataModel>();
        this.tireOptions.forEach(option => {
            const newValue = this.data.tire.find(element => element.fieldId === option).value;
            dataMap.set(option, {fieldId: 'tireTool.' + option, value: newValue, serverOperation: null});
        });
        this.store.dispatch(new fromStore.SetData({nameOfModule: 'tireTool', data: dataMap}));
    }

    saveTire() {
        this.tireOptions.forEach(option => {
            const newValue = this.data.module.data.find(data => data.fieldId === 'tireTool.' + option).value;
            const elementInTire = this.data.tire.find(element => element.fieldId === option);
            elementInTire.value = newValue;
            elementInTire.serverOperation = 'UPDATE';
        });

        this.dialogRef.close();
    }

    copyTireToAxle() {
        if (!this.data.axle) {
            //  Tire is a spare or additional - don't copy to main axles
            this.copyTireToAllSpareOrAdditionalTires();
        } else {
            this.data.axle.forEach(tire => {
                this.tireOptions.forEach(option => {
                    if (!(tire === this.data.tire) && option === 'serialNumber') {
                        return; // Don't copy the serial number
                    }
                    const newValue = this.data.module.data.find(data => data.fieldId === 'tireTool.' + option).value;
                    const elementInTire = tire.find(element => element.fieldId === option);
                    elementInTire.value = JSON.parse(JSON.stringify(newValue));
                });
            });
        }
        this.dialogRef.close();
    }

    copyTireToAllAxles() {
        if (!this.data.axle) {
            //  Tire is a spare or additional - don't copy to main axles
            this.copyTireToAllSpareOrAdditionalTires();
        } else {
            this.data.axles.forEach(axle => {
                axle.forEach(tire => {
                    this.tireOptions.forEach(option => {
                        if (!(tire === this.data.tire) && option === 'serialNumber') {
                            return; // Don't copy the serial number
                        }
                        const newValue = this.data.module.data.find(data => data.fieldId === 'tireTool.' + option).value;
                        const elementInTire = tire.find(element => element.fieldId === option);
                        elementInTire.value = JSON.parse(JSON.stringify(newValue));
                    });
                });
            });
        }
        this.dialogRef.close();
    }

    private copyTireToAllSpareOrAdditionalTires() {
        const positionCode = this.data.tire.find(element => element.fieldId === 'positionCode');

        if (positionCode.value && positionCode.value.shortname.split('').includes('S')) {
            // This is a spare tire
            this.data.spareTires.forEach(tire => {
                this.tireOptions.forEach(option => {
                    if (!(tire === this.data.tire) && option === 'serialNumber') {
                        return; // Don't copy the serial number
                    }
                    const newValue = this.data.module.data.find(data => data.fieldId === 'tireTool.' + option).value;
                    const elementInTire = tire.find(element => element.fieldId === option);
                    elementInTire.value = JSON.parse(JSON.stringify(newValue));
                });
            });
        }
        if (positionCode.value && positionCode.value.shortname.split('').includes('A')) {
            // This is an additional tire
            this.data.additionalTires.forEach(tire => {
                this.tireOptions.forEach(option => {
                    if (!(tire === this.data.tire) && option === 'serialNumber') {
                        return; // Don't copy the serial number
                    }
                    const newValue = this.data.module.data.find(data => data.fieldId === 'tireTool.' + option).value;
                    const elementInTire = tire.find(element => element.fieldId === option);
                    elementInTire.value = JSON.parse(JSON.stringify(newValue));
                });
            });
        }
    }

    swapTire() {
        let allTires = [];
        this.data.axles.forEach(axle => {
            axle.forEach(tire => allTires.push(tire));
        });
        // Put all tires in one array and remove the current tire from the array
        allTires = [...allTires, ...this.data.spareTires, ...this.data.additionalTires];
        const index = allTires.indexOf(this.data.tire);
        const currentTire = allTires.splice(index, 1)[0];

        const dialogRef = this.dialog.open(TireSwapDialogComponent, {
            data: {tires: [...allTires], currentTire: currentTire}
        });
    }

    deleteTire() {
        const positionCode = this.data.tire.find(element => element.fieldId === 'positionCode');

        if (!this.data.axle) {
            // This is a spare or additional tire
            if (positionCode.value && positionCode.value.shortname.split('').includes('A')) {
                const index = this.data.additionalTires.indexOf(this.data.tire);
                const deletedAdditionalTire = this.data.additionalTires.splice(index, 1)[0];
                this.data.deletedAdditionalTires.push(deletedAdditionalTire);
                // Reorder the position code for the remaining tires
                let i = 1;
                this.data.additionalTires.forEach(tire => {
                    const posCode = tire.find(element => element.fieldId === 'positionCode');
                    posCode.value = {
                        friendlyname: 'Zusatzreifen ' + i,
                        shortname: 'A' + i,
                    };
                    i++;
                });

            } else if (positionCode.value && positionCode.value.shortname.split('').includes('S')) {
                const index = this.data.spareTires.indexOf(this.data.tire);
                const deletedSpareTire = this.data.spareTires.splice(index, 1)[0];
                this.data.deletedSpareTires.push(deletedSpareTire);
                // Reorder the position code for the remaining tires
                let i = 1;
                this.data.spareTires.forEach(tire => {
                    const posCode = tire.find(element => element.fieldId === 'positionCode');
                    posCode.value = {
                        friendlyname: 'Reserverad ' + i,
                        shortname: 'S' + i,
                    };
                    i++;
                });
            } else {
                console.log('Could not find where this tire belongs!');
            }
        } else {
            // Tire is on an axle
            this.tireOptions.forEach(option => {
                const elementInTire = this.data.tire.find(element => element.fieldId === option);
                elementInTire.value = null;
            });
        }
        this.dialogRef.close();
    }

    openTireMeasurePopup(elementId: string) {
        if (elementId === 'tireTool.tireMeasure') {
            const dialogRef = this.dialog.open(TireSizeDialogComponent, {
                data: {module: this.data.module, elementId: elementId},
                autoFocus: false
            });
        }
    }
}


