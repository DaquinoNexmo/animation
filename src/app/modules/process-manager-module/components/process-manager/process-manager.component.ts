import { Component, OnInit } from '@angular/core';
import { FunctionalityService } from '../../../../services/functionality.service';
import { Store } from '@ngrx/store';
import * as  fromStore from '../../../../store';
import { Module, DataModel } from '../../../../models/view.model';
import { first } from 'rxjs/operators';
import { RequestType } from '../../../../helper-classes/dynamicstrings';


@Component({
  selector: 'app-process-manager',
  templateUrl: './process-manager.component.html',
  styleUrls: ['./process-manager.component.scss']
})
export class ProcessManagerComponent implements OnInit {

  module: Module;
  moduleName = 'processManager';

  constructor(private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService) { }

  ngOnInit() {
    this.store.select(fromStore.getModuleWithName(this.moduleName)).pipe(first()).subscribe(
      module => {
        this.module = module;
        this.initDynamicString();
      }
    );
  }

  createInspection() {
    this.funcService.goToNextView(this.module);
  }

  onSelectedRow(row) {
    const selectedItemsId = this.moduleName + '.' + this.moduleName + '.selectedItems';
    const dataMap = new Map<string, DataModel>();
    dataMap.set(selectedItemsId, {fieldId: selectedItemsId , value: row , serverOperation: null});
    this.store.dispatch(new fromStore.SetData( {nameOfModule: this.moduleName, data: dataMap}));

    this.funcService.dynamicStrings.sendManualRequest('openInspection');
  }

  initDynamicString() {

    this.funcService.dynamicStrings.addDynamicStringToStructure(
      this.module.structure.processManager.dataurl,
      'processManager.processManager.tableItems', true, false, RequestType.table);

    this.funcService.dynamicStrings.addDynamicStringToStructure(
      this.module.structure.processManager.getInspectionUrl,
      'openInspection', false, false, RequestType.dataForModules);

    this.funcService.dynamicStrings.addDynamicStringToStructure(
      this.module.structure.processManager.getProcessDefinitionXmlUrl,
      'processManager.getProcessDefinitionXmlUrl', true, false, RequestType.setData
    );

    this.funcService.dynamicStrings.parseModulesForDynamicStrings([this.module]);
  }

}
