import * as fromStore from '../store';
import { Store } from '@ngrx/store';
import { first, filter, map } from 'rxjs/operators';
import { Module, DataModel } from '../models/view.model';
import { Subscription } from 'rxjs';
import { NGXLogger } from 'ngx-logger';


export interface DynamicStringPart {
  id: string;
  isVariable: Boolean;
  required: Boolean;
  secure: Boolean;
  value?: string;
  initialValueLoaded?: boolean;
}

export interface DynamicStringUrl {
  belongsToElement: string;
  sendOnlyOnce?: boolean;
  requestSent?: boolean;
  autoSend: boolean;
  requestType: RequestType;
  triggered: boolean;
  elements: DynamicStringPart[];
  initialRequestAttemptSent: boolean;
}

export enum RequestType {
  combobox = 'COMBOBOX',
  login = 'LOGIN',
  table = 'TABLE',
  equipmentView = 'EQUIPMENT_VIEW',
  dataForModules = 'DATA_FOR_MODULES',
  createInspection = 'CREATE_INSPECTION',
  setData = 'SET_DATA',
  setVisibility = 'SET_VISIBILITY',
  protocolSync = 'PROTOCOL_SYNC',
  protocolGet = 'PROTOCOL_GET'
}

export class DynamicStrings {
    subscribedElements: string[] = [];
    urls: DynamicStringUrl[] = [];
    subscriptions: Subscription[] = [];
    verbose = false;

    lastTimeSend = new Map<string, number>();

    constructor(private store: Store<fromStore.ModulesState>, private logger: NGXLogger) {}

    private registerSubscriptions(url: DynamicStringUrl) {
      url.elements.forEach(
        element => {
          if (element.isVariable) {
            const moduleName = element.id.split('.')[0];
            const dataName = element.id.split('.')[0] + '.' + element.id.split('.')[1];

            // First make sure that the property exists, if it does not we subscribe to the store until it shows up
            this.store.select(fromStore.getData).pipe(
              map(modules => modules.find(m => m.name === moduleName)),
              filter(m => m !== undefined), // Module is not in the store yet. Listen to changes of the modules array and try again.
              filter(m =>  !!m.data.find(d => d.fieldId === dataName)), // no data
              first())
            .subscribe(
              module => {
                  // Check if subscribtion already exists for this element
                  // Do a new subscribtion if it doesn't exist, else only copy the value once
                  if (!this.subscribedElements.includes(element.id)) {
                    if (this.verbose) {
                      // console.log('Subscribing to: ' + element.id);
                      this.logger.log('Subscribing to: ' + element.id);

                    }
                    this.subscribedElements.push(element.id);
                    const subscription = this.store.select(fromStore.getDataElementValue(element.id))
                      .subscribe(value => this.dataChanged(element.id, value));
                    this.subscriptions.push(subscription);
                  } else {

                    // The property is already being tracked for changes,
                    // Only get the latest value to initiate the element

                    this.store.select(fromStore.getDataElementValue(element.id))
                      .pipe(first()).subscribe(value => {
                        this.updateValue(url, element.id, value);
                        if (!url.initialRequestAttemptSent && !url.elements.map(e => e.initialValueLoaded).includes(false)) {
                          this.checkIfReadyAndSendRequest(url);
                        }
                      });
                  }
              }
            );
          }
        }
      );

      // Check if the url contains only constants, in that case, try to send request immediately
      if (url.elements.map( element => element.isVariable).includes(true)) {
        return;
      } else {
        this.checkIfReadyAndSendRequest(url);
      }
    }

    addDynamicStringToStructure(
      dynamicString: string, elementId: string, autoSend: boolean, sendOnlyOnce: boolean, requestType: RequestType) {

      const dynamicStringParts = this.getDynamicString(dynamicString);
      const newUrl: DynamicStringUrl = {
        belongsToElement: elementId,
        elements: [],
        requestSent: false,
        autoSend: autoSend,
        sendOnlyOnce: sendOnlyOnce,
        requestType: requestType,
        triggered: false,
        initialRequestAttemptSent: false  // used to trigger the first request when all the elements get their values for the first time
                                          // if all elements are already subscribed to, this will trigger an attempt to send the request
                                          // which would otherwise not happen
      };

      dynamicStringParts.forEach( dynamicStringPart => {
        const newElement: DynamicStringPart = {
          id: dynamicStringPart.id,
          isVariable: dynamicStringPart.isVariable,
          required: dynamicStringPart.required,
          secure: dynamicStringPart.secure,
          value: '',
          initialValueLoaded: false
        };
        if (!newElement.isVariable) {
          newElement.value = newElement.id; // Element is not a var, id should be the same as value
          newElement.initialValueLoaded = true;
        }
        if (newElement.isVariable && !newElement.required) {
          // Element is a not required variable, we don't care about its initial value being loaded in this case
          newElement.initialValueLoaded = true;
        }
        newUrl.elements.push(newElement);
        }
      );
      this.urls.push(newUrl);

      // TODO: do urls with observables somehow

      // Check if the url containes new elements that we need to subscribe to
      this.registerSubscriptions(newUrl);
    }

    private dataChanged(id: string, value) {
      // Loop through all dynamic urls, update values and fire requests if everything is ready
      let logData = true; // workaround to only log data once on change
      this.urls.forEach( url => {
        if (this.urlDependsOnElement(url, id)) {
          this.updateValue(url, id, value, logData);
          logData = false;
            if (!url.elements.map(e => e.initialValueLoaded).includes(false)) {
              // Only attempt to send requests when all elements have initial values
              if (url.elements.filter(element => element.isVariable && !element.required).length > 0) {
                // Timeout is a workaround for optional vars that have not yet been loaded as they appear later in the string
                setTimeout( () => this.checkIfReadyAndSendRequest(url), 200);
            } else {
                this.checkIfReadyAndSendRequest(url);
            }
          }
        }
      });
    }

    private urlDependsOnElement(url: DynamicStringUrl, id: string) {
      const urlElements = url.elements.map( element => element.id);
      return urlElements.includes(id);
    }

    private updateValue(url: DynamicStringUrl, id: string, value: string, logData: boolean = false) {
      const updatedElement = url.elements.find( element => element.id === id);

      if (this.verbose && logData) {
        // Display * for any secure variables
        if (updatedElement.secure) {
          // console.log('The value for ' + id + ' is: ' + new Array(value.length + 1).join('*'));
          this.logger.log('The value for ' + id + ' is: ' + new Array(value.length + 1).join('*'));
        } else {
          // console.log('The value for ' + id + ' is: ' + value);
          this.logger.log('The value for ' + id + ' is: ' + value);
        }
      }
      updatedElement.initialValueLoaded = true;
      updatedElement.value = value;
    }

    sendManualRequest(belongsToElement: string) {
      const url = this.urls.find(u => u.belongsToElement === belongsToElement);
      url.triggered = true;
      this.checkIfReadyAndSendRequest(url);
    }

    private checkIfReadyAndSendRequest(url: DynamicStringUrl) {

      url.initialRequestAttemptSent = true;

      // SetVisibility has to be triggered even when elements have no value
      // Therefore it can be executed without any other checks

      if (url.requestType === RequestType.setVisibility) {
        // console.log('DYNAMIC REQUEST. TYPE: ' + url.requestType + ' | ELEMENT: ' + url.belongsToElement);
        this.store.dispatch(new fromStore.SetVisibility({elementId: url.belongsToElement,
          dynValue: url.elements.map(e => e.value).join('')}));
        return;
      }



      if (url.requestSent || (!url.autoSend && !url.triggered)) { // request already sent or needs a trigger
        return;
      }
      url.triggered = false;

      const elementsValues = url.elements.filter( element => {
        if (!element.required && element.isVariable && (element.value === '' || element.value === undefined)) {
          return false; // Filter variables that are not required and have no value
        }
        return true;
      }).map(element => element.value);

      // Check if all elements have values
      if (elementsValues.includes('') || elementsValues.includes(undefined)) {

        // If one of the subscribed properties has just lost its value the appropriate element should be updated
        // with an empty string for value in order to be reset properly

        if (url.requestType === RequestType.setData) {

          const dataMap = new Map<string, DataModel>();
          dataMap.set(url.belongsToElement, {fieldId: url.belongsToElement, value: '', serverOperation: null});
          this.store.dispatch(new fromStore.SetData({ nameOfModule: url.belongsToElement.split('.')[0], data: dataMap}));
          return;
        }
        return;
      }

      // TODO: this might no longer be needed, testing with 0, remove soon
      // Only send a particular request every n miliseconds
      const n = 0;
      if (this.lastTimeSend.get(url.belongsToElement) > ((new Date()).getTime() - n)) {
        return;
      } else {
        const now = (new Date()).getTime();
        this.lastTimeSend.set(url.belongsToElement, now);
      }

      const link = elementsValues.join('');
      // console.log('DYNAMIC REQUEST. TYPE: ' + url.requestType + ' | ELEMENT: ' + url.belongsToElement);
      this.logger.log('DYNAMIC REQUEST. TYPE: ' + url.requestType + ' | ELEMENT: ' + url.belongsToElement);
      if (url.sendOnlyOnce) {
        url.requestSent = true;
      }

      switch (url.requestType) {
        case RequestType.combobox: {
          // console.log(link);
          this.store.dispatch(new fromStore.GetComboboxOptions({ url: link, elementId: url.belongsToElement}));
          return;
        }
        case RequestType.login: {
          this.store.dispatch(new fromStore.Login(link));
          return;
        }
        case RequestType.table: {
          this.store.dispatch(new fromStore.GetTableItems({ url: link, elementId: url.belongsToElement}));
          return;
        }
        case RequestType.equipmentView: {
          this.store.dispatch(new fromStore.GetEquipmentView(link));
          return;
        }
        case RequestType.dataForModules: {
          this.store.dispatch(new fromStore.GetDataForModules(link));
          // Save the url for the inspection call to use when syncing and downloading the updated inspection
          const dataMap = new Map<string, DataModel>();
          dataMap.set('processManager.getInspectionUrl', {fieldId: 'processManager.getInspectionUrl', value: link, serverOperation: null});
          this.store.dispatch(new fromStore.SetData({nameOfModule: 'processManager', data: dataMap}));
          return;
        }
        case RequestType.createInspection: {
          this.store.dispatch(new fromStore.CreateInspection(link));
          return;
        }
        case RequestType.protocolSync: {
          this.store.dispatch(new fromStore.SyncData(link));
          return;
        }
        case RequestType.protocolGet: {
          this.store.dispatch(new fromStore.GetProtocol(link));
          break;
        }
        case RequestType.setData: {
          // link is the value to be set as data
          const dataMap = new Map<string, DataModel>();
          dataMap.set(url.belongsToElement, {fieldId: url.belongsToElement, value: link, serverOperation: null});
          this.store.dispatch(new fromStore.SetData({ nameOfModule: url.belongsToElement.split('.')[0], data: dataMap}));
          return;
        }
      }
    }

    parseModulesForDynamicStrings(modules: Module[]) {
      if (modules === undefined) {return; }

      this.parseModulesForComboboxDataProviders(modules);
      this.parseModulesForVisibilityStrings(modules);
    }

    private parseModulesForComboboxDataProviders(modules: Module[]) {
      modules.forEach(module => {
        if (Array.isArray(module.structure.element)) {
          module.structure.element.forEach(element => {
            if (element.optionsurl !== '' && element.optionsurl !== undefined) {
              this.addDynamicStringToStructure(element.optionsurl, element.id, true, false, RequestType.combobox);
            }
          });
        }
      });
    }

    private parseModulesForVisibilityStrings(modules: Module[]) {
      modules.forEach(module => {
        if (!module.structure.tags.includes('processModule')) {
          return;
        }
        if (module.structure.visibleExp) {
          // console.log('Adding dynamic string for module: ' + module.name);
          this.logger.log('Adding dynamic string for module: ' + module.name);
          this.addDynamicStringToStructure(module.structure.visibleExp.dynExp, module.name, true, false, RequestType.setVisibility);
        } else {
          this.addDynamicStringToStructure('true', module.name, true, false, RequestType.setVisibility);
        }

        if (Array.isArray(module.structure.element)) {
          // Adds visibility tracking for all elements
          module.structure.element.forEach(element => {
            if (element.visibleExp) {
              this.addDynamicStringToStructure(element.visibleExp.dynExp, element.id, true, false, RequestType.setVisibility);
            }
          });
        }
      });
    }

    removeDynamicStringsForModule(nameOfModule: string) {
      // TODO: this will probably leak subscriptions, they shouldn't trigger anything but are still a memory problem
      // Add a list that tracks all subscribtions and unsubscribe when removing.
      this.urls = this.urls.filter( url => nameOfModule !== url.belongsToElement.split('.')[0]);
    }

    removeDynamicStringForElement(belongsToElement: string) {
      // TODO: this will probably leak subscriptions, they shouldn't trigger anything but are still a memory problem
      // Add a list that tracks all subscribtions and unsubscribe when removing.
      this.urls = this.urls.filter( url => belongsToElement !== url.belongsToElement);
    }

    unsubscribeAllDynamicStrings() {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
      this.subscribedElements = [];
      this.urls = [];
    }

    // Parsing strings
    private getDynamicString(input: string): DynamicStringPart[] {
             input = input.split('\\$').join('◙').split('\\!').join('◘').split('\\?').join('■');
             const inputParts: Array<String> = input.split('$');
             const output: DynamicStringPart[] = [];
              
              let onItem: Boolean = false;
              let required: Boolean = true;
              
              if (inputParts[0] === '') {
                  onItem = true;
                  inputParts.shift();
              }
              for (let i = 0; i < inputParts.length; i++) {
                  if (onItem) {
                      if (inputParts[i] === '') {
                          required = false;
                      } else {
                          if (inputParts[i].charAt(0) === '!') {
                              output.push({id: inputParts[i].substr(1), isVariable: true, required: required, secure: true});
                          } else {
                            output.push({id: inputParts[i].substr(0), isVariable: true, required: required, secure: false});
                          }
                          required = true;
                          onItem = false;
                      }
                  } else {
                      if (inputParts[i] !== '') {
                          output.push({id: inputParts[i].substr(0), isVariable: false, required: false, secure: false});
                      }
                      onItem = true;
                  }
              }
              for (let i = 0; i < output.length; i++) {
                  output[i].id = output[i].id.split('◙').join('$').split('◘').join('!').split('■').join('?');
                  // console.log(output[i].id + '\t' + output[i].isVariable + '\t' + output[i].required + '\t' + output[i].secure);
              }
          return output;
        }
}
