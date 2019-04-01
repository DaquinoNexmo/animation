import { createSelector } from '@ngrx/store';
import * as fromFeature from '../reducers';
import * as fromModules from '../reducers/data.reducer';
import { Module, DataModel } from '../../models/view.model';


export const getDataState = createSelector(fromFeature.getModulesState, (state: fromFeature.ModulesState) => state.data);
export const getData = createSelector(getDataState, fromModules.getData); // returns Module[]

export const getDataElementValue = (elementId) => createSelector(getData,
    modules => {
        // if element is a combobox, it can have a name like station.businessunit.friendlyname
        // this is why the input is split by '.' and checks are made to make sure we return the right thing

        const elementIdSplit = elementId.split('.');
        const moduleName = elementIdSplit[0];
        const elementFieldId = elementIdSplit[0] + '.' + elementIdSplit[1];

        const module = modules.find(m => m.name === moduleName);
        if (module === undefined) {
            return;
        }

        const data = module.data.find(d => d.fieldId === elementFieldId);
        if (data === undefined) {
            // console.log('ELEMENT IS UNDEFINDED : ' + elementId);
            return;
        }

        if (elementIdSplit.length > 2) {
            // Element is not a simple data object, but is nested inside value
            elementIdSplit.splice(0, 2); // remove fieldId, the rest are properties in value
            return getNestedValue(elementIdSplit, data.value);
        } else {
            // Element has a simple data object, just return value
            return data.value;
        }
    }
);

export const getUpdatedInspectionData = createSelector(getData,
    modules => {
        const processModules = modules.filter(m => m.structure.tags.includes('processModule'));
        const result = { data: [] };
        processModules.forEach(m => {
            // The data for this modules is not what the backend expects, so we exclude it from the sync call
            // TODO: Remove this 'if' when the data is corrected
            if (m.name === 'equipmentView' || m.name === 'protocol') {
                return;
            }
            const module = {};
            const allData = [];
            module[m.name] = allData;
            result.data.push(module);
            if (m.name === 'documentation') {
                m.data.forEach((documentation: any) => {
                    if (documentation.fieldId) {
                        const newDocumentation = {documentation: []};
                        const shortname = documentation.value.shortname;

                        // CarouselId is only used to match the pictures with the documentations / damage views
                        // They are not saved by the server and don't have to be
                        newDocumentation.documentation.push({fieldId: 'carouselId', value: documentation.fieldId});

                        // Check if this documentation has already been saved in the backend
                        // If it is, check for pictures that have been marked to be deleted in the current session
                        const oldDocumentation: any = m.data.find((doc: any) => {
                            if (doc.documentation) {
                                const fotoDocuProperty = doc.documentation.find((property: DataModel) =>
                                    property.fieldId === 'fotoDocu'
                                );
                                if (fotoDocuProperty.value.shortname === shortname) {
                                    newDocumentation.documentation.push(fotoDocuProperty);
                                    return true;
                                }
                            }
                            return false;
                        });
                        if (oldDocumentation) {
                            const images = oldDocumentation.documentation.filter((property: DataModel) =>
                                property.fieldId === 'image' && property.serverOperation === 'DELETE'
                            );
                            images.forEach(image => newDocumentation.documentation.push(image));
                        } else {
                            newDocumentation.documentation.push({fieldId: 'fotoDocu', serverOperation: 'UPDATE', value: {shortname: shortname}});
                        }
                        allData.push(newDocumentation);
                    }
                });
                m.data.forEach((documentation: any) => {
                    if (documentation.documentation) {
                        // This is a backend-saved documentation
                        // If it was deleted in this session, it has to be included in the update to the backend
                        const newDocumentation = {documentation: []};
                        const fotoDocuProperty = documentation.documentation.find((property: DataModel) =>
                            property.fieldId === 'fotoDocu');
                        let documentationHasNotBeenIncluded = true;
                        allData.forEach(doc => doc.documentation.forEach((property: DataModel) => {
                            if (property.fieldId === 'fotoDocu' && property.value.shortname === fotoDocuProperty.value.shortname) {
                                documentationHasNotBeenIncluded = false;
                            }
                        }
                        ));
                        if (documentationHasNotBeenIncluded) {
                            const images = documentation.documentation.filter((property: DataModel) =>
                                property.fieldId === 'image' && property.serverOperation === 'DELETE'
                            );
                            images.forEach(image => newDocumentation.documentation.push(image));
                            newDocumentation.documentation.push(fotoDocuProperty);
                            allData.push(newDocumentation);
                        }
                    }
                });
                return;
            }

            if (m.name === 'damageView') {
                m.data.forEach((damage: any) => {
                    const newDamage = {damage: []};
                    const inspectionDamageId = damage.damage.find((property: DataModel) => property.fieldId === 'inspectionDamageId');

                    // Need the carouselId to match the images that need to be uploaded
                    const carouselId = damage.damage.find((property: DataModel) => property.fieldId === 'carouselId');
                    newDamage.damage.push(carouselId);

                    // Find all images that have been flagged as 'to be deleted' and add them to the damage
                    const images = damage.damage.filter((property: DataModel) => property.fieldId === 'image' && property.serverOperation === 'DELETE');
                    images.forEach(image => newDamage.damage.push(image));

                    // If the damage already has an inspectionDamageId, it was already registered with the backend
                    // Else add the three properties for syncing to define the damage and get an inspectionDamageId
                    if (inspectionDamageId && inspectionDamageId.value) {
                        newDamage.damage.push(inspectionDamageId);
                    } else {
                        const damageType = damage.damage.find((property: DataModel) => property.fieldId === 'damageType');
                        const vehicleComponent = damage.damage.find((property: DataModel) => property.fieldId === 'vehicleComponent');
                        const damageDegree = damage.damage.find((property: DataModel) => property.fieldId === 'damageDegree');
                        newDamage.damage.push(damageType);
                        newDamage.damage.push(vehicleComponent);
                        newDamage.damage.push(damageDegree);
                    }
                    allData.push(newDamage);
                });
                return;
            }
            if (m.name === 'tireTool') {
                // TODO: Fix when syncing call supports updating tires
                return;
                const allTires = m.data.filter((element: any) => element.tire);
                allTires.forEach(tire => allData.push(tire));
            }
            m.data.forEach(d => {
                if (d.fieldId === 'inspectionInfo.inspectionId') {
                    d.serverOperation = 'UPDATE';
                }
                if (d.serverOperation === null || d.serverOperation === undefined) {
                    return;
                }
                let dataCopy = { ...d };
                if (d.serverOperation === 'DELETE') {
                    dataCopy = { ...dataCopy, value: null };
                }
                dataCopy.fieldId = dataCopy.fieldId.split('.').splice(1).join('.');
                allData.push(dataCopy);
            });
        });
        return result;
    }
);


function getNestedValue(namesArray: string[], object: DataModel): string {
    const property = namesArray.shift();

    if (!object) {
        // TODO: test if this doesn't ruin the recursion and change the message or remove it
        // console.log('Object not found.Looking for: ' + property);
        return;
    }

    if (namesArray.length === 0) {
        return object[property];
    }
    if (object[property] === undefined) {
        console.log('Property not found. Property name: ' + property);
        return;
    }
    return getNestedValue(namesArray, object[property]);
}

export const getModuleWithName = (moduleName) => createSelector(getData,
    modules => modules.find(m => m.name === moduleName)
);

export const getElementOptions = (elementId) => createSelector(getData,
    modules => {
        const module = modules.find(m => m.name === elementId.split('.')[0]);
        if (module && module.structure && module.structure.element) {
            const element = module.structure.element.find(e => e.id === elementId);
            if (element && element.options !== undefined) {
                return element.options;
            } else {
                return;
            }
        }
    }
);

export const getDocumentationOptions = () => createSelector(getData,
    modules => {
        const module = modules.find(m => m.name === 'documentation');
        if (module) {
            return module.structure.options;
        }
    }
);

export const getElementObject = (elementId) => createSelector(getData,
    modules => {
        const moduleName = elementId.split('.')[0];
        const module = modules.find(m => m.name === moduleName);
        if (!module) {
            console.log('Module ' + moduleName + ' was not found!');
            return;
        }
        const element = module.structure.element.find(e => e.id === elementId);
        if (!element) {
            console.log('Element ' + element.id + ' was not found!');
            return;
        }
        return element;
    }
);


export const getObjectPropertyInStructure = (elementId) => createSelector(getData,
    modules => {
        const moduleName = elementId.split('.')[0];
        const objectName = elementId.split('.')[1];
        const itemsName = elementId.split('.')[2];

        const module = modules.find(m => m.name === moduleName);
        return module.structure[objectName][itemsName];
    }
);

export const getDatalayerForModule = (moduleName: string) =>

    createSelector(getData,
        modules => {
            const module = modules.find(m => m.name === moduleName);
            if (module) {
                return module.data;
            }
        }
    );


export const getDataLoading = createSelector(getDataState, fromModules.getDataLoading);
export const getDataLoaded = createSelector(getDataState, fromModules.getDataLoaded);
