import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { FunctionalityService } from '../../../../services/functionality.service';
import * as  fromStore from '../../../../store';
import { Module, DataModel } from '../../../../models/view.model';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { ProcessCreatorDialogComponent } from '../process-creator-dialog/process-creator-dialog.component';
import { RequestType } from '../../../../helper-classes/dynamicstrings';


@Component({
  selector: 'app-process-creator',
  templateUrl: './process-creator.component.html',
  styleUrls: ['./process-creator.component.css']
})
export class ProcessCreatorComponent implements OnInit {

  module: Module;
  moduleName = 'processCreator';
  disabled: boolean;

  constructor(private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService, public dialog: MatDialog) {}

  ngOnInit() {
    this.store.select(fromStore.getModuleWithName(this.moduleName))
      .pipe(first()).subscribe(module => {
        this.module = module;
        this.initDynamicString();
      });

      // When a vehicle is selected disable the search function and input fields
      this.store.select(fromStore.getDataElementValue('processCreator.processCreator.selectedItems'))
        .subscribe(vehicle => {
          if (vehicle === '' || vehicle === undefined) {
            this.disabled = false;
        } else {
          this.disabled = true;
        }
      });
  }

  goBack() {
    this.funcService.goToNextView(this.module);
  }

  createInspection() {
    this.funcService.dynamicStrings.sendManualRequest('processManager.processManager.selectedItems.inspectionId');
  }

  onButtonClick(id, value) {
    if (this.disabled) {
      this.cancelSelection();
    } else {
      this.search(id, value);
    }
  }

  search(id, value) {
    const dialogRef = this.dialog.open(ProcessCreatorDialogComponent, {
      data: {}
    });

    const searchProperty = id.split('.')[1];
    const dataMap: Map<string, DataModel> = new Map();
    const vehicleSearchKeyId = 'processCreator.processCreator.vehicleSearchKey';
    const vehicleSearchValueId = 'processCreator.processCreator.vehicleSearchValue';
    const sortPropertyId = 'processCreator.processCreator.sortProperty';


    dataMap.set(vehicleSearchKeyId, {
      fieldId: vehicleSearchKeyId,
      value: searchProperty,
      serverOperation: null
    });
    dataMap.set(vehicleSearchValueId, {
      fieldId: vehicleSearchValueId,
      value: value,
      serverOperation: null
    });
    dataMap.set(sortPropertyId, {
      fieldId: sortPropertyId,
      value: searchProperty,
      serverOperation: null
    });

    this.store.dispatch(new fromStore.SetData( {nameOfModule: 'processCreator', data: dataMap}));
    this.funcService.dynamicStrings.sendManualRequest('processCreator.processCreator.tableItems');

    dialogRef.afterClosed().subscribe(result => {
    // TODO stuff on close

    });
  }

  cancelSelection() {
    const dataMap: Map<string, DataModel> = new Map();
    const vehicleId = 'processCreator.processCreator.selectedItems';
    const vinId = 'processCreator.vin';
    const licenseId = 'processCreator.license';
    const fleetNrId = 'processCreator.fleetNr';

    dataMap.set(vehicleId, {fieldId: vehicleId , value: '' , serverOperation: null});
    dataMap.set(vinId, {fieldId: vinId , value: '' , serverOperation: null});
    dataMap.set(licenseId, {fieldId: licenseId , value: '' , serverOperation: null});
    dataMap.set(fleetNrId, {fieldId: fleetNrId , value: '' , serverOperation: null});

    this.store.dispatch(new fromStore.SetData( {nameOfModule: 'processCreator', data: dataMap}));
  }

  initDynamicString() {
    this.funcService.dynamicStrings.addDynamicStringToStructure(
      this.module.structure.processCreator.dataurl,
      'processCreator.processCreator.tableItems', true, false, RequestType.table);


    this.funcService.dynamicStrings.addDynamicStringToStructure(
      this.module.structure.processCreator.createInspectionUrl,
      'processManager.processManager.selectedItems.inspectionId', false, true, RequestType.createInspection);


    this.funcService.dynamicStrings.parseModulesForDynamicStrings([this.module]);
  }
}
