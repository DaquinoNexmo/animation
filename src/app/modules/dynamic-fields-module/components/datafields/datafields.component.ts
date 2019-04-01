import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../store';
import { FunctionalityService } from '../../../../services/functionality.service';
import { Module } from '../../../../models/view.model';


export interface DataFieldsModule extends Module {
  structure: Module['structure'] & {
    buttonAdd: any;
  };
}

@Component({
  selector: 'app-datafields',
  templateUrl: './datafields.component.html',
  styleUrls: ['./datafields.component.scss']
})

export class DataFieldsComponent implements OnInit {
  @Input() module: DataFieldsModule;
  typeOfData: string;
  constructor(private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService) {
  }

  ngOnInit() {
    this.initDynamicString();
    console.log(Object.keys(this.module.structure.buttonAdd)[0]);
    this.typeOfData = Object.keys(this.module.structure.buttonAdd)[0];
  }

  addElement() {
    const dataMap = new Map();
    const time = `${new Date().getTime()}`;
    // TODO: Remake how the setData action works, the map is currently useless as the keys are never used
    dataMap.set(this.module.name + '.1', {fieldId: this.module.name + '.' + time + '.serviceMileage', value: 0, serverOperation: 'ADD'});
    dataMap.set(this.module.name + '.2', {fieldId: this.module.name + '.' + time + '.serviceDate', value: '', serverOperation: 'ADD'});
    dataMap.set(this.module.name + '.3', {fieldId: this.module.name + '.' + time + '.authorizedRepairShop', value: true, serverOperation: 'ADD'});
    this.store.dispatch(new fromStore.SetData({nameOfModule: this.module.name, data: dataMap}));
    console.log(this.module);
  }

  deleteElement(fieldId: string) {
    console.log(fieldId);
    this.store.dispatch(new fromStore.RemoveData(fieldId));
  }

  updateValue(event) {
    let values, id;
    const dataMap = new Map();

    if (event.source) { // event comes from MatSelect or MatCheckBox, access value in a different way
      if (event.checked !== undefined) {
        values = event.checked;
        id = event.source.id;
      } else {
      values = event.value;
      }
    } else {
      values = event.target.value;
      if (event.targetElement) {
        id = event.targetElement.id;
      } else {
        id = event.target.id;
      }
    }

    // This makes sure that serviceMilage is never undefined or empty string, as this breaks the backend upon sync in
    if (id.split('.')[2] === 'serviceMileage' && (values === undefined || values === '')) {
      values = 0;
    }

    dataMap.set(this.module.name + '.bla1', {fieldId: id , value: values, serverOperation: 'ADD'});
    this.store.dispatch(new fromStore.SetData({nameOfModule: this.module.name, data: dataMap}));
  }

  initDynamicString() {
    this.funcService.dynamicStrings.parseModulesForDynamicStrings([this.module]);
  }
}
