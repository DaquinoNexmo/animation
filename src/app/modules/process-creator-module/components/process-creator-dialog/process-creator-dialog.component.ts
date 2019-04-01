import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort} from '@angular/material';
import { Component, Inject, ViewChild, Pipe, PipeTransform, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../store';
import { FunctionalityService } from '../../../../services/functionality.service';
import { DataModel } from '../../../../models/view.model';

@Component({
    selector: 'app-process-creator-dialog',
    templateUrl: './process-creator-dialog.component.html',
    styleUrls: ['./process-creator-dialog.component.css']
  })
  export class ProcessCreatorDialogComponent implements OnInit {

  moduleName = 'processCreator';

    constructor(
      public dialogRef: MatDialogRef<ProcessCreatorDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService) {

    }

    onSelectedRow(row) {
      const dataMap = new Map<string, DataModel>();
      const vehicleId = 'processCreator.processCreator.selectedItems';
      const vinId = 'processCreator.vin';
      const licenseId = 'processCreator.license';
      const fleetNrId = 'processCreator.fleetNr';

      dataMap.set(vehicleId, {fieldId: vehicleId , value: row , serverOperation: null});
      dataMap.set(vinId, {fieldId: vinId , value: row.vin , serverOperation: null});
      dataMap.set(licenseId, {fieldId: licenseId , value: row.license , serverOperation: null});
      dataMap.set(fleetNrId, {fieldId: fleetNrId , value: row.fleetNr , serverOperation: null});

      this.store.dispatch(new fromStore.SetData( {nameOfModule: 'processCreator', data: dataMap}));
      this.dialogRef.close();
    }


    ngOnInit(): void {
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
}
