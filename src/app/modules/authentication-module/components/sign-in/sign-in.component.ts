import { Component, OnInit } from '@angular/core';
import * as fromStore from '../../../../store';
import { Store } from '@ngrx/store';
import { FunctionalityService } from '../../../../services/functionality.service';
import { Module, Element, DataModel } from '../../../../models/view.model';
import { first } from 'rxjs/operators';
import { RequestType } from '../../../../helper-classes/dynamicstrings';
import { SpinnerService } from '../../../../services/spinner.service';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})

export class SignInComponent implements OnInit {
  module: Module;
  moduleName = 'login';
  passwordElem: Element;
  checkElem: Element;
  textElem: Element;
  element: Element;
  dataMap: Map<string, DataModel> = new Map();


  constructor(private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService, private spinnerService: SpinnerService) { }

  ngOnInit() {
    this.store.select(fromStore.getModuleWithName(this.moduleName)).pipe(first()).subscribe(
      module => {
        console.log(module.structure.element);
        this.module = module;
        module.structure.element.forEach(element => {
          if (element.type === 'password') {
            this.passwordElem = element;
          }
          if (element.type === 'checkBox') {
            this.checkElem = element;
          }
          if (element.id === 'login.username') {
            this.textElem = element;
          }
        });

        this.initDynamicString();
      }
    );
  }

  onSubmit() {
    this.spinnerService.isLoading.next(true);
    this.funcService.dynamicStrings.sendManualRequest('login.session');
  }

  initDynamicString() {

    this.funcService.dynamicStrings.addDynamicStringToStructure(this.module.structure.loginCall, 'login.session', false, false, RequestType.login);
    this.funcService.dynamicStrings.parseModulesForDynamicStrings([this.module]);
  }

  getValue(element): string {

    const id = element.id;
    if (this.module === undefined) { return ''; }

    let elementData;
    if (id.split('.').length > 2) {
      elementData = this.module.data.find(data => data.fieldId === id.split('.').splice(0, 2).join('.'));
      elementData = elementData.value[id.split('.')[2]];
    } else {
      elementData = this.module.data.find(data => data.fieldId === id);
      if (elementData === undefined) { return ''; }
      elementData = elementData.value;
    }
    return elementData;
  }

  saveValues(event: any, element) {
    const id = element.id;
    let values;
    values = event.target.value;

    this.dataMap.set(id, { fieldId: id, value: values, serverOperation: 'UPDATE' });
    this.store.dispatch(new fromStore.SetData({ nameOfModule: this.moduleName, data: this.dataMap }));
  }
}
