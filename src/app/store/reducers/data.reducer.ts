import * as fromModulesActions from '../actions';
import { Module, DataModel, Element } from '../../models/view.model';

declare var require: any;

const initialModulesState = require('../../../assets/db/db_new.json');


export const initialElementState: Element = {
  id: '',
  editable: true,
  required: true,
  visible: false,
  type: '',
  label: {
    translation: true,
    text: ''
  },
  visibleExp: {
    regExp: '',
    dynExp: ''
  }
};

export const initialDataState: DataModel = {
  fieldId: '',
  value: '',
  serverOperation: ''
};

export const initialModuleState: Module = {
  name: 'INITIALSTATE',
  structure: {
    moduleID: '',
    icon: '',
    label: '',
    included: false,
    loadInvisible: false,
    element: [initialElementState],
  },
  data: [initialDataState]
};

export interface ModulesState {
  modules: Module[];
  loaded: boolean;
  loading: boolean;
}

export const initialState: ModulesState = {
  modules: [initialModuleState],
  loaded: false,
  loading: false
};


export function reducer(
  state: ModulesState = initialState,
  action: fromModulesActions.ModuleActions | fromModulesActions.ImageActions
): ModulesState {
  console.log(action.type);
  switch (action.type) {

    case fromModulesActions.GET_DATA:
    case fromModulesActions.GET_COMBOBOX_OPTIONS:
    case fromModulesActions.GET_TABLE_ITEMS:
    case fromModulesActions.LOGIN:
    case fromModulesActions.GET_MODULES:
    case fromModulesActions.GET_EQUIPMENT_VIEW:
    case fromModulesActions.GET_DATA_FOR_MODULES:
    case fromModulesActions.CREATE_INSPECTION:
    case fromModulesActions.SYNC_DATA:
    case fromModulesActions.GET_XML_COMBOBOX:
    case fromModulesActions.GET_PROTOCOL: {
      return {
        ...state,
        loading: true,
        loaded: false
      };
    }

    case fromModulesActions.GET_TABLE_ITEMS_FAIL:
    case fromModulesActions.GET_COMBOBOX_OPTIONS_FAIL:
    case fromModulesActions.GET_DATA_FAIL:
    case fromModulesActions.LOGIN_FAIL:
    case fromModulesActions.GET_MODULES_FAIL:
    case fromModulesActions.GET_EQUIPMENT_VIEW_FAIL:
    case fromModulesActions.GET_DATA_FOR_MODULES_FAIL:
    case fromModulesActions.CREATE_INSPECTION_FAIL:
    case fromModulesActions.SYNC_DATA_FAIL:
    case fromModulesActions.GET_XML_COMBOBOX_FAIL:
    case fromModulesActions.GET_PROTOCOL_FAIL: {
      console.log(action.payload);
      return {
        ...state,
        loaded: false,
        loading: false
      };
    }

    case fromModulesActions.GET_DATA_SUCCESS: {
      return {
        ...state,
        loaded: true,
        loading: false,
        modules: action.payload.modules
      };
    }


    case fromModulesActions.SET_DATA: {
      const stateCopy = { ...state };
      stateCopy.modules = stateCopy.modules.map((module) => {
        if (module.name !== action.payload.nameOfModule) {
          return module;
        } else {
          return changeElementData(module, action.payload.data);
        }
      });

      return stateCopy;
    }


    case fromModulesActions.SET_VISIBILITY: {
      const stateCopy = { ...state };

      const elementId = action.payload.elementId;
      const dynValue = action.payload.dynValue;
      const moduleName = elementId.split('.')[0];
      let re;

      stateCopy.modules = stateCopy.modules.map(module => {
        if (module.name === moduleName) {

          if (elementId.split('.').length === 1) {
            // This is a call to set the visibility of a module and not an element
            if (!module.structure.visibleExp) {
              // There is no regex for visibility, set it to true always in this case
              module.structure.visible = true;
            } else {
              const regex = new RegExp(module.structure.visibleExp.regExp);
              module.structure.visible = regex.test(dynValue);
            }
          } else {
            // Set visibility of this element
            const element = module.structure.element.find(e => e.id === elementId);
            if (element.visibleExp) {
              re = new RegExp(element.visibleExp.regExp);
            }
            if (element.visible === re.test(dynValue)) {
              // Element already has the right visibility
              return module;
            }

            element.visible = re.test(dynValue);
          }

          return { ...module };

        } else {
          return module;
        }
      });

      return stateCopy;
    }

    case fromModulesActions.GET_COMBOBOX_OPTIONS_SUCCESS: {
      const newState = { ...state, loading: false, loaded: true };

      // Backend failed, log error and return
      if (action.payload.success === false) {
        console.log(action.payload.data);
        return newState;
      }
      if (action.payload.elementId.split('.')[1]) {
        const moduleName = action.payload.elementId.split('.')[0];
        newState.modules = newState.modules.map(module => {
          if (module.name === moduleName) {
            const elementToChange = module.structure.element.find(element => element.id === action.payload.elementId);
            elementToChange.options = action.payload.data;


            // Check if the selected data option needs to be added to the list of options
            if (elementToChange.loadedOption === 'true') {
              const dataObject = module.data.find(d => d.fieldId === elementToChange.id);
              let currentValue;
              if (dataObject) {
                currentValue = dataObject.value;
                if (!currentValue) {
                  // No preselected value for this element, there is no option to be preloaded, LEAVE
                  return {...module};
                }
              } else {
                // No data object for this element, there is no option to be preloaded, LEAVE
                return {...module};
              }

              let currentValueIsInOption = false;
              elementToChange.options.filter(option => {
                // Deep check if the currentValue exists in the options array
                if (Object.keys(currentValue).every( key => currentValue[key] === option[key])) {
                  currentValueIsInOption = true;
                }
              });
              if (!currentValueIsInOption) {
                elementToChange.options.push(currentValue);
              }
            }

            // TODO rework this bs
            if (action.payload.data[0] && action.payload.data[0].equipment) {
              elementToChange.options.forEach((option, index) => option.friendlyname = action.payload.data[index].equipment.friendlyname);
            }
            return { ...module };
          } else {
            return module;
          }
        });

        return newState;
      } else {

        newState.modules = newState.modules.map(module => {
          if (module.name === action.payload.elementId) {
            module.structure['options'] = action.payload.data;
            return { ...module };
          } else {
            return module;
          }
        });

        return newState;
      }
    }

    case fromModulesActions.GET_TABLE_ITEMS_SUCCESS: {
      const stateCopy = { ...state };

      if (action.payload.success === false) {
        console.log(action.payload.data);
        return stateCopy; // backend error
      }
      const moduleName = action.payload.elementId.split('.')[0];
      const objectName = action.payload.elementId.split('.')[1];
      const propertyName = action.payload.elementId.split('.')[2];

      stateCopy.modules = stateCopy.modules.map(m => {
        if (m.name === moduleName) {
          m.structure[objectName][propertyName] = action.payload.data;
          m.data.find(d => d.fieldId === moduleName + '.' + moduleName).value.totalCount = action.payload.totalCount;
          return { ...m };
        } else {
          return m;
        }
      });

      return stateCopy;
    }

    case fromModulesActions.LOGIN_SUCCESS: {

      const stateCopy = { ...state };
      stateCopy.modules = state.modules.map(module => {
        if (module.name === 'login') {
          const loginSessionData = module.data.find(element => element.fieldId === 'login.session');
          loginSessionData.value = action.payload.data.session.sessionid;
          return module;
        } else if (module.name === 'station') {
          const businessUnit = module.structure.element.find(element => element.id === 'station.appDomain');
          const allOptions = Object.keys(action.payload.data.allowedAppDomains);
          businessUnit.options = [];
          allOptions.forEach(option => businessUnit.options.push(action.payload.data.allowedAppDomains[option]));
          return module;
        } else {
          return module;
        }
      });
      return stateCopy;
    }

    case fromModulesActions.GET_MODULES_SUCCESS: {
      const stateCopy = { ...state };

      // Manually create inspectionInfo module
      // TODO: Make it visibile only to support
      const inspectionInfoModule = {
        name: 'inspectionInfo',
        structure: {
          moduleID: 'inspectionInfo',
          icon: 'none',
          label: 'INSPECTION_INFO',
          tags: ['processModule'],
          included: true,
          visible: true,
          element: []
        },
        data: []
      };
      stateCopy.modules.push(inspectionInfoModule);

      const moduleNames = Object.keys(action.payload.data.processStructure);
      moduleNames.forEach(name => {
        const newModule = { ...stateCopy.modules[0] }; // Initialization workaround, because of ts & tslint crap
        newModule.structure = { ...action.payload.data.processStructure[name] };
        if (!newModule.structure.tags) {
          newModule.structure.tags = [];
        }
        newModule.structure.tags.push('processModule');
        newModule.name = name;
        newModule.data = [];

        if (newModule.structure.element && !Array.isArray(newModule.structure.element)) {
          newModule.structure.element = [newModule.structure.element];
        }

        // TODO: remove this, when the elements in the xml are named correctly
        if (Array.isArray(newModule.structure.element)) {
          newModule.structure.element.forEach(e => e.id = newModule.name + '.' + e.id);
        }

        stateCopy.modules.push(newModule);
      });

      // TODO: currently deleting using tags, this could be removed
      // Save loaded modules for later deletion
      const processManagerModule = stateCopy.modules.find(m => m.name === 'processManager');
      const processManagerObj = processManagerModule.data.find(d => d.fieldId === 'processManager.processManager');
      processManagerObj.value.addedModules = moduleNames;

      return stateCopy;
    }

    case fromModulesActions.REMOVE_MODULES: {
      const stateCopy = { ...state };

      // Find and delete all modules which were loaded for an inspection
      stateCopy.modules = stateCopy.modules.filter(m => !m.structure.tags.includes('processModule'));

      return stateCopy;
    }

    case fromModulesActions.GET_DATA_FOR_MODULES_SUCCESS: {
      const stateCopy = { ...state };

      const modulesToBeUpdated = [];
      console.log(action.payload);
      action.payload.data.data.forEach(d => modulesToBeUpdated.push(Object.keys(d).join('')));

      if (action.payload.partialUpdate) {
        stateCopy.modules = stateCopy.modules.map(module => {
          if (module.name === 'damageView') {
            // Create caroselIds for each existing damage and add them to the damage objects
            const damages: any = action.payload.data.data.find(d => d[module.name] !== undefined)[module.name];
            damages.forEach(damage => {
              console.log(damage);
              damage.damage.push({
                fieldId: 'carouselId',
                value: 'damageView.' + new Date().getTime()
              });
            });
            module.data = damages;
          }

          if (module.name === 'documentation') {
            const documentationOptions = module.data.filter(d => d.fieldId);
            const documentations = action.payload.data.data.find(d => d[module.name] !== undefined)[module.name];
            module.data = [...documentationOptions, ...documentations];
          }
          return {...module};
        });

        return stateCopy;
      }

      stateCopy.modules = stateCopy.modules.map(module => {

        // Mapping of inspectionInfo to processManager
        if (module.name === 'processManager') {
          const inspectionData = action.payload.data.data.find(d => d.inspectionInfo !== undefined).inspectionInfo;
          let inspectionInfoData = module.data.find(d => d.fieldId === 'processManager.inspectionInfo');
          if (!inspectionInfoData) {
            module.data.push({ fieldId: 'processManager.inspectionInfo', value: {}, serverOperation: null });
            inspectionInfoData = module.data.find(d => d.fieldId === 'processManager.inspectionInfo');
          }
          inspectionData.forEach(data => {
            const id = data.fieldId;
            const value = data.value;
            inspectionInfoData.value[id] = value;
          });
          return { ...module };
        }

        if (modulesToBeUpdated.includes(module.name)) {
          // There is data for this module in the server response. Replace the current data with it.
          module.data = [...action.payload.data.data.find(d => d[module.name] !== undefined)[module.name]];

          // TODO: remove this, when data is named accordingly e.g modulename + elemenetname
          module.data.forEach(d => {
            if (d.fieldId) { // Only modify the fieldIds of data objects with fieldIds
              d.fieldId = module.name + '.' + d.fieldId;
            }
          });

          if (module.name === 'damageView') {
            // Create caroselIds for each existing damage and add them to the damage objects
            const damages: any = module.data.filter(d => d['damage']);
            damages.forEach(damage => {
              console.log(damage);
              damage.damage.push({
                fieldId: 'carouselId',
                value: 'damageView.' + new Date().getTime()
              });
            });
          }

          // TODO: add the other possible dynamic fields modules here, could also check based on moduleId = 'dataFields'
          // TODO: to be deleted in a week supposedly, written on 06.12.2018
          if (module.name === 'vehicleServiceHistoryView') {
            let counter = 0;
            module.data.forEach( (d): any => {
              if (Object.keys(d).includes('vehicleServiceHistory')) {
                counter++;
                const id = d['vehicleServiceHistory'].find(element => element.fieldId === 'vehicleServiceHistoryId');
                const index = d['vehicleServiceHistory'].indexOf(id);
                d['vehicleServiceHistory'].splice(id, 1);
                const elements = [];
                d['vehicleServiceHistory'].forEach(element => elements.push({fieldsId: element.fieldId, value: element.value}));
                const newDataCreatedFromObject = {fieldId: 'vehicleServiceHistoryView.' + id.value, value: {}, serverOperation: null};
                // console.log(elements);
                elements.forEach(e => newDataCreatedFromObject.value[e.fieldsId] = e.value);
                delete d['vehicleServiceHistory'];
                delete d['fieldId'];
                module.data.push(newDataCreatedFromObject);
              }
            });
            module.data.splice(0, counter);
          }
          return { ...module };
        } else {
          return module;
        }
      });

      return stateCopy;
    }

    case fromModulesActions.CREATE_INSPECTION_SUCCESS: {
      const stateCopy = { ...state };

      if (!action.payload.success) {
        console.log('Something went wrong with creating an inspection:');
        console.log(action.payload);
        return { ...stateCopy };
      }

      stateCopy.modules = stateCopy.modules.map(module => {
        if (module.name === 'processManager') {
          const processManager = module.data.find(d => d.fieldId === 'processManager.processManager');
          processManager.value.selectedItems = action.payload.data;
          return { ...module };
        } else {
          return module;
        }
      }
      );

      return state;
    }

    case fromModulesActions.SYNC_DATA_SUCCESS: {
      const stateCopy = { ...state };
      const now = Date.now();
      stateCopy.modules = stateCopy.modules.map(m => {
        //  The data was synced with the server successfully, reset serveroperation to null
        if (m.structure.tags.includes('processModule')) {
          m.data.forEach(d => d.serverOperation = null);
          return { ...m };
        } else {
          return m;
        }
      });
      return stateCopy;
    }

    case fromModulesActions.MENU_BAR_BUTTON_PRESS: {
      const stateCopy = { ...state };

      action.payload.clearModule.forEach(clearModule => {
        if (clearModule.includes('*')) { // Its not a module name but a group
          switch (clearModule) {
            case '*all': {
              stateCopy.modules = JSON.parse(JSON.stringify(initialModulesState.appStructure.modules));
              break;
            }
            case '*processModules': {

              const processManagerModule = stateCopy.modules.find(m => m.name === 'processManager');
              const processManagerObj = processManagerModule.data.find(d => d.fieldId === 'processManager.processManager');

              processManagerObj.value.selectedItems = '';
              stateCopy.modules = stateCopy.modules.filter(m => !m.structure.tags.includes('processModule'));
            }
          }
        } else {
          const index = stateCopy.modules.findIndex(m => m.name === clearModule);
          stateCopy.modules.splice(index, 1);
        }
      });
      return stateCopy;
    }

    case fromModulesActions.GET_PROTOCOL_SUCCESS: {
      const stateCopy = { ...state };
      const protocolModule = stateCopy.modules.find(m => m.name === 'protocol');
      if (protocolModule) {
        const photoData = protocolModule.data.find(d => d.fieldId === 'protocol.photo');
        if (!photoData) { // data element does not exist yet
          protocolModule.data.push({ fieldId: 'protocol.photo', value: action.payload, serverOperation: null });
        } else {
          photoData.value = action.payload;
        }
      }
      stateCopy.modules = stateCopy.modules.map(m => {
        if (m.name === 'protocol') {
          return { ...m };
        } else {
          return m;
        }
      });

      return stateCopy;
    }


    // TODO: remove this action, reducer and effects
    case fromModulesActions.GET_XML_COMBOBOX_SUCCESS: {
      const stateCopy = state;
      const belongsToElement = action.payload.elementId;

      if (belongsToElement === 'damageCreatorSVG.modelSelector') {
        stateCopy.modules = stateCopy.modules.map(m => {
          if (m.name === 'damageCreatorSVG') {
            if (!Array.isArray(m.structure.element)) {
              return m;
            }
            const comboBoxElement = m.structure.element.find(e => e.id === belongsToElement);
            comboBoxElement.options = action.payload.root.model.map(model => ({ id: model.id._text, name: model.name._text }));
            return m;
          } else {
            return m;
          }
        });
      } else if (belongsToElement === 'damageCreatorSVG.viewSelector') {
        stateCopy.modules = stateCopy.modules.map(m => {
          if (m.name === 'damageCreatorSVG') {
            const comboBoxElement = m.structure.element.find(e => e.id === belongsToElement);
            comboBoxElement.options = action.payload.model.map(model => ({ id: model.id._text, name: model.name._text }));
            return m;
          } else {
            return m;
          }
        });
      }
      return stateCopy;
    }

    case fromModulesActions.GET_EQUIPMENT_VIEW_SUCCESS: {

      // console.log('Equipment Success ###########################');
      // console.log(action.payload);
      const stateCopy = {...state};

      stateCopy.modules.map((module: Module) => {
        if (module.name === 'equipmentView') {

          action.payload.data.forEach(elem => {

            const editable = JSON.parse(elem.toBeCheckedFlag);

            const equipmentElement: Element = {

              id: 'equipmentView.' + elem.equipment.shortname,
              editable: editable,
              dataType: elem.dataType, // null; "combo", "number", "string"
              required: true,
              type: '',
              visible: true,
              displayname: 'friendlyname',
              equipmentDamages: elem.equipmentDamages,
              toBeChecked: elem.toBeCheckedFlag,
              options: elem.equipment.equipmentChoice,
              label: {
                translation: false,
                text: elem.equipment.friendlyname
              }
            };

            const dataElement: DataModel = {};
            dataElement.serverOperation = null;
            dataElement.fieldId = equipmentElement.id;

            switch (elem.dataType) {

              case null: {

                equipmentElement.type = 'checkbox';
                dataElement.value = false;
                module.data.push(dataElement);
                break;
              }
              case 'CHOICE': {

                dataElement.value = {
                  selected: false,
                  option: ''
                };
                module.data.push(dataElement);
                equipmentElement.type = 'comboBox';
                break;
              }
              case 'INTEGER': {

                dataElement.value = {
                  value: null,
                  isValue: null,
                  selected: false
                };

                module.data.push(dataElement);
                equipmentElement.type = 'number';
                break;
              }
              default: {

                dataElement.value = {
                  text: '',
                  selected: false
                };
                module.data.push(dataElement);
                equipmentElement.type = 'text';
                break;
              }
            }
            if (!module.structure.element) {
              module.structure.element = [];
            }
            module.structure.element.push(equipmentElement);
          });
        }
      });

      return stateCopy;
    }

    case fromModulesActions.ADD_ELEMENT_TO_STRUCTURE: {

      const stateCopy = { ...state };
      let module = stateCopy.modules.find(m => m.name === action.payload.id.split('.')[0]);
      if (!Array.isArray(module.structure.element)) {
        module.structure.element = [];
      }
      module.structure.element.push(action.payload);

      module = JSON.parse(JSON.stringify(module));

      return stateCopy;
    }

    case fromModulesActions.REMOVE_DATA: {

      const stateCopy = {...state};
      const moduleToChange = stateCopy.modules.find( m => m.name === action.payload.split('.')[0]);
      const dataElementToDelete = moduleToChange.data.find(d => d.fieldId === action.payload);
      const index = moduleToChange.data.indexOf(dataElementToDelete);
      moduleToChange.data.splice(index, 1);

      return stateCopy;
    }

    case fromModulesActions.DELETE_ELEMENT_FROM_STRUCTURE: {

      const stateCopy = { ...state };

      const nameOfModule = action.payload.id.split('.')[0];
      let module = stateCopy.modules.find(m => m.name === nameOfModule);
      if (nameOfModule === 'documentation' && action.payload.documentationShortname) {
        // Documentation element was just deleted, check if it was already in the datalayer coming from the backend,
        // if so, mark all pictures as to be deleted. If in the same session the same fotoDocu type is later recreated
        // and new pictures are added the old pictures will be deleted, and the new ones will be uploaded

        module.data.find((doc: any) => {
          if (doc.documentation) {
            const fotoDocuProperty = doc.documentation.find((element: DataModel) =>
              element.fieldId === 'fotoDocu' && element.value.shortname === action.payload.documentationShortname
            );
            if (fotoDocuProperty) {
              const images = doc.documentation.filter((element: DataModel) => element.fieldId === 'image');
              images.forEach((image: DataModel) => image.serverOperation = 'DELETE');
              return true;
            }
          }
          return false;
        });
      }

      module.structure.element = module.structure.element.filter(el => el.id !== action.payload.id);
      module.data = module.data.filter(data => data.fieldId !== action.payload.id);
      module = JSON.parse(JSON.stringify(module));

      return { ...stateCopy };
    }

    case fromModulesActions.DELETE_DAMAGE: {
      const stateCopy = {...state};

      const damageToBeDeleted = action.payload;
      const damageModule = stateCopy.modules.find(m => m.name === 'damageView');


      const inspectionDamageId = damageToBeDeleted.damage.find((element: DataModel) => element.fieldId === 'inspectionDamageId');
      if (inspectionDamageId) {
        inspectionDamageId.serverOperation = 'DELETE';
      } else {
        const index = damageModule.data.findIndex(damage => damage === action.payload);
        damageModule.data.splice(index, 1);
      }
      return stateCopy;
    }

    case fromModulesActions.SET_IMAGE_TO_BE_DELETED: {
      const stateCopy = {...state};

      const internalId = action.payload.id;
      const carouselBelongsTo = action.payload.carouselID.split('.')[0];
      if (carouselBelongsTo === 'damageView') {
        const damageViewModule = stateCopy.modules.find(m => m.name === 'damageView');
        damageViewModule.data.forEach((damage: any) => {
          damage.damage.forEach((property: DataModel) => {
            if (property.fieldId === 'image' && property.value.internalId === internalId) {
              property.serverOperation = 'DELETE';
            }
          });
        });
      } else if (carouselBelongsTo === 'documentation') {
        const documentationModule = stateCopy.modules.find(m => m.name === 'documentation');
        documentationModule.data.forEach((documentation: any) => {
          if (Array.isArray(documentation.documentation)) {
            documentation.documentation.forEach((property: DataModel) => {
              if (property.fieldId === 'image' && property.value.internalId === internalId) {
                property.serverOperation = 'DELETE';
              }
            });
          }
        });
      }
      return stateCopy;
    }

    case fromModulesActions.SAVE_TIRES: {
      const stateCopy = {...state};

      const tireToolModule = stateCopy.modules.find(m => m.name === 'tireTool');
      if (!tireToolModule) {
        // Inspection has been deleted, no tires to be saved
        return stateCopy;
      }
      const underbody = tireToolModule.data.find((d: any) => d.underbody);

      tireToolModule.data = [];
      tireToolModule.data.push(underbody);

      action.payload.forEach(tire => tireToolModule.data.push(tire));
      return stateCopy;
    }

    case fromModulesActions.ADD_DAMAGE: {
      const stateCopy = {...state};

      const damageViewModule = stateCopy.modules.find(m => m.name === 'damageView');
      damageViewModule.data.push(action.payload);

      return stateCopy;
    }

    case fromModulesActions.LOGOUT: {
      const stateCopy = {...state};
      stateCopy.modules = JSON.parse(JSON.stringify(initialModulesState.appStructure.modules));
      return stateCopy;
    }

    case fromModulesActions.GET_LOCAL_STORAGE_CONTENT: {
      if (retrieveState()) {
        const newState = retrieveState();
        console.log('Retrieving State');
        console.log(newState);
        return newState;
      } else {
        console.log('No saved state found.');
        console.log(state);
        return state;
      }
    }
    default: {

      return state;
    }
  }
}

function retrieveState() {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
}

function changeElementData(module: Module, elementsDataMap: Map<string, DataModel>) {

  let newModule: Module;
  elementsDataMap.forEach(dataModel => {
    // Workaround for objects nested inside the data structure like processManager & processCreator
    // Like processCreator.processCreator.searchVehicleKey
    let elementData;
    if (dataModel.fieldId.split('.').length > 2) {
      const objectNameInData = dataModel.fieldId.split('.')[0] + '.' + dataModel.fieldId.split('.')[1];
      const objectPropertyNameInData = dataModel.fieldId.split('.')[2];
      elementData = module.data.find(data => data.fieldId === objectNameInData);

      if (elementData !== undefined) {
        elementData.value[objectPropertyNameInData] = dataModel.value;
        elementData.serverOperation = dataModel.serverOperation;
      } else {
        console.log('Element data for ' + dataModel.fieldId + ' was not found! Creating a data object for it.');
        module.data.push({ fieldId: objectNameInData, value: {[objectPropertyNameInData]: dataModel.value}, serverOperation: 'ADD' });
      }

    } else {
      elementData = module.data.find(data => data.fieldId === dataModel.fieldId);
      if (elementData !== undefined) {
        elementData.value = dataModel.value;
        elementData.serverOperation = dataModel.serverOperation;
      } else {
        console.log('Element data for ' + dataModel.fieldId + ' was not found! Creating a data object for it.');
        module.data.push({ fieldId: dataModel.fieldId, value: dataModel.value, serverOperation: 'ADD' });
      }
    }
  });

  newModule = { // this might be unnecessary
    ...module,
    data: module.data
  };
  return newModule;
}

export const getDataLoading = (state: ModulesState) => state.loading;
export const getDataLoaded = (state: ModulesState) => state.loaded;
export const getData = (state: ModulesState) => state.modules;
