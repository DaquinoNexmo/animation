import { Component, Input, Output, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import * as fromStore from '../../../../store';
import { Store } from '@ngrx/store';
import { DataModel, Element, Module, Option } from '../../../../models/view.model';

import { EventEmitter } from '@angular/core';
import { first, filter } from 'rxjs/operators';
import { FunctionalityService } from '../../../../services/functionality.service';
import { RequestType } from '../../../../helper-classes/dynamicstrings';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-element',
  templateUrl: './element-list.component.html',
  styleUrls: ['./element-list.component.scss']
})

export class ElementListComponent implements OnInit, OnDestroy {
  @Input() element: Element;
  @Output() buttonEmitter = new EventEmitter<any>();

  @Input() disabled = false;
  @Input() value; // TODO: seems to be a depricated property remove and test when time permits.

  @Input() isFilter = false;
  @Input() isDocumentation = false;

  dataMap: Map<string, DataModel> = new Map();
  nameOfModule: string;
  module: Module;
  options = [];
  subscriptions: Subscription[] = [];
  editable = true;

  valueForThisComboBox;
  previousValueForThisComboBox;
  required = false;

  constructor(private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    if (this.element.editable !== undefined) {
      // Editable comes as string from backend, convert to boolean with JSON.parse
      // Adding empty string, because it is a boolean in our model, even though it comes as a string.
      // Changing it to string in our model breaks other stuff, which I don't wish to change atm.
      this.editable = JSON.parse(this.element.editable + '');
    }

    if (this.element.required !== undefined) {
      this.required = JSON.parse(this.element.required + '');
    }

    this.nameOfModule = this.element.id.split('.')[0];
    this.store.select(fromStore.getModuleWithName(this.nameOfModule)).pipe(
      first()
    ).subscribe(m => {
      this.module = m;

      // Loading of the selected option, in case it does not come from the dataProvider, or there is no provider at all

      if (this.element.loadedOption === 'true') {
        const dataObject = this.module.data.find(d => d.fieldId === this.element.id);
        let currentValue;
        if (dataObject) {
          currentValue = dataObject.value;
          if (!currentValue) {
            // No preselected value for this element, there is no option to be preloaded, LEAVE
            return;
          }
        } else {
          // No data object for this element, there is no option to be preloaded, LEAVE
          return;
        }

        if (!this.element.options) {
          // Options array doesn't exist, create it and add the current value if it exists
          this.element.options = [];
          this.element.options.push(currentValue);
        } else {
          // Options array exists. Check if the current value is in it, else add it
          let currentValueIsInOption = false;
          this.element.options.filter(option => {
            // Deep check if the currentValue exists in the options array
            if (Object.keys(currentValue).every( key => currentValue[key] === option[key])) {
              currentValueIsInOption = true;
            }
          });
          if (!currentValueIsInOption) {
            this.element.options.push(currentValue);
          }
        }
      }
    });


    if (!this.isDocumentation) {
    const subscription = this.store.select(fromStore.getElementOptions(this.element.id)).subscribe(val => {
      this.options = val;
    });
    this.subscriptions.push(subscription);
  }
    // Check if the value for the combobox comes from the documentation view since the logic there for displaying the options is different than the rest of the application
    if (this.isDocumentation) {

     if (this.module.structure['options']) {
      this.options = this.module.structure['options'];
      } else {
        this.store.dispatch(new fromStore.GetComboboxOptionsSuccess({ data: [], elementId: 'documentation' }));
      }

      const subscription1 = this.funcService.selectedOptions.subscribe(value => {
        // console.log(value);
        this.funcService.selectedOptionsArray = value;
        this.options = this.module.structure['options'];
        // making a promise so we can bypass the change detection afterviewInit
        this.options = this.options.filter(option => !this.funcService.selectedOptionsArray.map(o => o.friendlyname).includes(option.friendlyname));
        this.cdr.detectChanges();

      });
      this.subscriptions.push(subscription1);

      const subscription2 = this.store.select(fromStore.getDataElementValue(this.element.id)).subscribe(val => {
        if (val) {
          // console.log(val);
          // since the subscription gets triggered upon adding a new photoDocu, it tries to add the same vals to the selectedOptions we need to make a check here. This way it only adds the value when it is a new value
          if (!this.funcService.selectedOptionsArray.map(option => option.friendlyname).includes(val.friendlyname)) {
            this.funcService.selectedOptionsArray = [...this.funcService.selectedOptionsArray, val];
          }
        // this step is done so that when the user changes the value in the combobox the previousValue appears back in the options
        this.funcService.selectedOptionsArray = this.funcService.selectedOptionsArray.filter(option => option.friendlyname !== this.previousValueForThisComboBox);
        // console.log(this.element);
        this.funcService.selectedOptions.next(this.funcService.selectedOptionsArray);
        }
      });

      this.subscriptions.push(subscription2);
    }
  }

  display(visible: boolean) {
    if (visible === false) {
      return 'none';
    } else {
      return 'block';
    }
  }

  saveValues(event: any, valueForCustomName = null) {
    const id = this.element.id;
    let values;
    if (event.source) { // event comes from MatSelect or MatCheckBox, access value in a different way
      if (event.checked !== undefined) {
        values = event.checked;
      } else {
      values = event.value;
      }
    } else {
      values = event.target.value;
    }

    if (valueForCustomName) { // combobox value is already saved and selected, only need to append the customname
      values = this.getValue();
    }

    if (this.isDocumentation) {
      this.previousValueForThisComboBox = this.valueForThisComboBox;
      this.valueForThisComboBox = event.value;

      if (this.module.structure.options.find(option => option[this.element.displayname] === this.valueForThisComboBox)) {
        values = this.module.structure.options.find(option => option[this.element.displayname] === this.valueForThisComboBox);
      }
    } else {

      // Update dynamic string when new filter is selected
      if (this.isFilter) {
        const filterId = this.nameOfModule + '.' + this.nameOfModule + '.filterUrl';
        this.funcService.dynamicStrings.removeDynamicStringForElement(filterId);
        this.funcService.dynamicStrings.addDynamicStringToStructure(
          this.element.options.find(option => option.name === values).filterOptions,
          filterId, true, false, RequestType.setData);
        console.log(this.element.options.find(option => option.name === values).filterOptions);
      }

      // Check if element is a combo box with an object for value instead of just a string
      if (this.element.type === 'comboBox' && this.element.displayname !== undefined && this.element.displayname !== '') {

        // Selected option is either in options or in defaultoptions so check both

        if (this.element.options.find(option => option[this.element.displayname] === values)) {
          values = this.element.options.find(option => option[this.element.displayname] === values);

        } else if (this.element.defaultoptions) {

          values = this.element.defaultoptions.find(option => option[this.element.displayname] === values);
        }

        if (valueForCustomName) { // append customName
          values = { ...values, customName: valueForCustomName };
        }
      }
    }

    this.dataMap.set(id, { fieldId: id, value: values, serverOperation: 'UPDATE' });
    this.store.dispatch(new fromStore.SetData({ nameOfModule: this.nameOfModule, data: this.dataMap }));
  }

  getValue(): string {
    const id = this.element.id;
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


    if (elementData === undefined || elementData === null) { return ''; }
    const displayname = this.element.displayname;
    if (displayname === '' || displayname === undefined) {
      this.valueForThisComboBox = elementData;
      return elementData;
    } else {
      this.valueForThisComboBox = elementData[displayname];
      return elementData[displayname] ? elementData[displayname] : '';
    }
  }

  // Md-input has a different visual when the input is empty and unfocused compared to focused / non-empty
  // This 2 functions keep it non-empty when unfocused to keep the visual consistent and reset it on focus
  hackBox(event) {
    if (event.target.value === '') {
      event.target.value = ' ';
    } else {
    }
  }

  resetHackBox(event) {
    if (event.target.value === ' ') {
      event.target.value = '';
    }
  }
  // -------------------------------------------------------------------------------------------------------

  saveCustomName(event) {
    const value = event.target.value;
    console.log('Custom name: ' + value);
    this.saveValues(event, value);
  }

  hackBoxVisibility() {
    const value = this.getValue();
    if (value === 'Sonstiges' || (this.element.customValue === 'true')) {
      return 'visible';
    }
    return 'hidden';
  }

  getImage(image: string) {
    return 'url("./assets/icons/' + image + '")';
  }

  buttonClick() {
    if (this.element.action && this.element.action.clearModules && this.element.action.clearModules.includes('*all')) {
      // Logging out, clean up the dynamic strings
      this.funcService.dynamicStrings.unsubscribeAllDynamicStrings();
    }
    this.buttonEmitter.emit([this.element.id, this.getValue()]);
  }

  getButtonLabel(label: string) {
    if (this.disabled) {
      return 'X';
    } else {
      return label;
    }
  }

  isDropdownDisabled(): boolean {

    let disabled = false;
    if (this.valueForThisComboBox && this.isDocumentation) {
      this.module.structure.options.forEach((option: Option) => {
        if (option.friendlyname === this.valueForThisComboBox) {
          disabled = option.required;
        }
      });

    }

    return disabled || !this.editable;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
