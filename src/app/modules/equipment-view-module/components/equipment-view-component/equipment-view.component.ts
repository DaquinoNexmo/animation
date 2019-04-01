import { Component, OnInit } from '@angular/core';
import { Module, DataModel, Element } from '../../../../models/view.model';
import { Store } from '@ngrx/store';
import * as  fromStore from '../../../../store';
import { FunctionalityService } from '../../../../services/functionality.service';
import { RequestType } from '../../../../helper-classes/dynamicstrings';
import { first } from 'rxjs/operators';


export interface EquipmentViewModule extends Module {
  structure: Module['structure'] & {
    equipementDataPtovider?: string;
  };
}

@Component({
  selector: 'app-equipmentview',
  templateUrl: './equipment-view.component.html',
  styleUrls: ['./equipment-view.component.scss']
})

export class EquipmentViewComponent implements OnInit {

  constructor(private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService) {}

  module: EquipmentViewModule;
  moduleName = 'equipmentView';

  ngOnInit() {
    this.store.select(fromStore.getModuleWithName(this.moduleName))
      .pipe(first()).subscribe(module => {
        this.module = module;
        this.initDynamicString();
    });
  }

  updateDataForSelectedCheckbox(isChecked: boolean, element: Element) {

    const dataMap = new Map<string, DataModel>();


      if (element.dataType === null) {

        dataMap.set(element.id, {fieldId: element.id, value: isChecked, serverOperation: null} );
        this.display(element.id);
        return this.store.dispatch(new fromStore.SetData({ nameOfModule: this.module.name, data: dataMap}));
      } else { // case if the input is text/integer/combobox

        const value = this.module.data.find( d => d.fieldId === element.id).value;

        value.selected = isChecked;
        dataMap.set(element.id, {fieldId: element.id, value: value, serverOperation: null} );

        return this.store.dispatch(new fromStore.SetData({ nameOfModule: this.module.name, data: dataMap}));
      }
    }

  getValue(id: string) {

    let value = '';
    const element = this.module.structure.element.find(elem =>  elem.id === id );
    if (element.dataType === 'INTEGER') {

      this.module.data.forEach(d => {
        if (d.fieldId === id) {
          value = d.value.value;
        }
    });
    }
    return value;
  }

  isChecked(id: string) {

    let checked = false;
    const element = this.module.structure.element.find(elem =>  elem.id === id );
    this.module.data.forEach(d => {

      if (element.dataType === null) {
        if (d.fieldId === id) {
          checked = d.value;
        }
      } else {
        if (d.fieldId === id) {
          checked = d.value.selected;
        }
      }
    });

    return checked;
  }

  updateDataForSelectedInput(event: any, element: Element) {

    const dataMap = new Map<string, DataModel>();

    const text = event.target.value;
    const value = this.module.data.find( d => d.fieldId === element.id).value;

    switch (element.dataType) {
      case 'INTEGER': {
        value.value = text;
        break;
      }
      case 'CHOICE': {
        value.option = text;
        break;
      }
      default: {
        value.text = text;
      }
    }

    dataMap.set(element.id, {fieldId: element.id, value: value, serverOperation: null} );

    return this.store.dispatch(new fromStore.SetData({ nameOfModule: this.module.name, data: dataMap}));
  }

  display(id: string) {

    let visible = false;
    this.module.data.map( d => {
      if (d.fieldId === id) {

        visible = d.value.selected;
      }
    });

    if (visible === false) {
      return 'none';
    } else {
      return 'inline-block';
    }
  }

  initDynamicString() {
    if (this.module.structure.element && this.module.structure.element.length > 0) {
      // Equipments have been loaded already
      return;
    }
    this.funcService.dynamicStrings.addDynamicStringToStructure(
      this.module.structure.equipementDataPtovider, 'equipmentView', true, true, RequestType.equipmentView);
  }

  getOptionsValue(id: string): string {
    if (this.module === undefined) { return; }
    const elementData = this.module.data.find(data => data.fieldId === id );
    if (elementData === undefined) { return; }
    return elementData.value.option;

  }

}
