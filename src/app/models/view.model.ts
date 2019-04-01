export interface DataModel {
  fieldId?: string;
  value?: any | Value;
  serverOperation?: string;
}

export interface PhotoDataModel {
  fieldId?: string;
  value?: {
    photoDocuType?: {
      shortname?: string;
      friendlyname?: string;
    };
    imageCarousel?: string[];
  };
  serverOperation?: null;
}

export interface Value {
  selected?: boolean;
  option?: string;
  photoDocuType?: {};
  imageCarousel?: ImageModel[];
}

export interface Element {
  id?: string;
  editable?: boolean;
  required?: boolean;
  visible?: boolean;
  type?: string;
  dataType?: string;
  displayname?: string;
  toBeChecked?: boolean;
  equipmentDamages?: boolean;
  buttonLabel?: string;
  position?: string;
  icon?: string;
  customValue?: string;
  loadedOption?: string;
  label?: {
    translation: boolean;
    text: string;
  };
  visibleExp?: {
    regExp: string;
    dynExp: string;
  };
  options?: any[];
  defaultoptions?: any[];
  optionsurl?: string;
  action?: {
    clearModules?: string[];
    navigateToModule?: string;
  };
}

export interface Option {
  friendlyname: string;
  maxCount: number;
  required: boolean;
  shortname: string;
  version: any;
}

export interface Module {
  name: string;
  structure: {
    moduleID?: string;
    icon?: string;
    label?: string;
    visible?: boolean;
    included?: boolean;
    loadInvisible?: boolean;
    nextView?: string;
    loginCall?: string;
    element?: Element[];
    processManager?: any;
    processCreator?: any;
    equipmentCall?: string;
    toBeChecked?: boolean;
    dataurl?: string;
    viewsurl?: string;
    tags?: string[];
    visibleExp?: {
      dynExp: string;
      regExp: string;
    };
    protocol?: any;
    pictureUploadCall?: string;
    signatureChecker?: any;
    signatureCustomer?: any;
    maxEMail?: any;
    options?: any[];
  };
  data: DataModel[];
}

export interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

export interface ImageModel {
  id?: string;
  name?: string;
  image64?: string;
  image64Edit?: string;
  image64EditID?: string;
  drawData?: string;
  carouselID?: string;
  originalImageSent?: boolean;
  editImageSent?: boolean;
  svg?: string;
  mediaId?: string;
}

export interface PhotoDocuItem {
  id?: string;
  editable?: boolean;
  required?: boolean;
  visible?: boolean;
  optionsurl?: string;
  options?: [
    { shortname?: 'LEFT'; friendlyname?: 'Links' },
    { shortname?: 'RIGHT'; friendlyname?: 'Rechts' },
    { shortname?: 'FRONT'; friendlyname?: 'Vorn' }
  ];
  type?: string; // comboBox
  displayname?: string; // friendlyname
  photoDocuType?: {
    id?: string; // station.appDomain,
    editable?: boolean;
    required?: boolean;
    visible?: boolean;
    label?: {
      translation?: boolean;
      text?: string; // PHOTODOCU_TYPE
    };
  };
  imageCarousel?: {
    editable?: boolean;
    imagesRequired?: number;
    imagesMax?: number;
    resolution?: string; // 640x480
    scaleMode?: string; // cut
  };
}

export const DefaultFotoDocuElement = {
  id: 'documentation',
  editable: true,
  required: true,
  visible: true,
  type: 'comboBox',
  displayname: 'friendlyname',
  photoDocuType: {
      id: `documentation.carousel`,
      editable: true,
      required: true,
      visible: true,
      label: {
          translation: true,
          text: 'PHOTODOCU_TYPE'
      },
  },
  imageCarousel: {
      editable: true,
      imagesRequired: 1,
      imagesMax: 5,
      resolution: '640x480',
      scaleMode: 'cut'
  }
};

export const DefaultTire: DataModel[] = [
  { fieldId: 'axle', serverOperation: null, value: '1' },
  { fieldId: 'fullTireMeasure', serverOperation: null, value: 'null' },
  { fieldId: 'axlePosition', serverOperation: null, value: '1' },
  { fieldId: 'model', serverOperation: null, value: null },
  { fieldId: 'manufacturer', serverOperation: null, value: {} },
  { fieldId: 'tireRevision', serverOperation: null, value: null },
  { fieldId: 'tireClass', serverOperation: null, value: null },
  { fieldId: 'loadIndex', serverOperation: null, value: null },
  { fieldId: 'tireAddOn', serverOperation: null, value: null },
  { fieldId: 'speedIndex', serverOperation: null, value: null },
  { fieldId: 'profile', serverOperation: null, value: null },
  {
    fieldId: 'positionCode',
    serverOperation: null,
    value: { friendlyname: 'Reifen 2. Achse rechts', shortname: 'RE2' }
  },
  { fieldId: 'tireMeasure', serverOperation: null, value: null },
  { fieldId: 'id', serverOperation: null, value: '' },
  { fieldId: 'serialNumber', serverOperation: null, value: null },
  { fieldId: 'serverOperationMap', serverOperation: null, value: '{}' }
];

export const DefaultDamage: DataModel[] = [
  { fieldId: 'totalValue', serverOperation: null, value: null },
  { fieldId: 'damagePosition', serverOperation: null, value: null },
  { fieldId: 'inspectionDamageType', serverOperation: null, value: null },
  { fieldId: 'insuranceRelevantDamageType', serverOperation: null, value: null },
  { fieldId: 'damageCount', serverOperation: null, value: null }, // to 1
  { fieldId: 'damageType', serverOperation: null, value: null },
  { fieldId: 'damageDegree', serverOperation: null, value: null },
  { fieldId: 'mechanicPriceForLaborUnit', serverOperation: null, value: null },
  { fieldId: 'varnisherLaborUnitMinutes', serverOperation: null, value: null },
  { fieldId: 'varnisherPriceForLaborUnit', serverOperation: null, value: null },
  { fieldId: 'mechanicLaborUnitMinutes', serverOperation: null, value: null },
  { fieldId: 'repairMethod', serverOperation: null, value: null },
  { fieldId: 'depreciationPercentage', serverOperation: null, value: null },
  { fieldId: 'mechanicLaborValue', serverOperation: null, value: null },
  { fieldId: 'remarkCreator', serverOperation: null, value: null },
  { fieldId: 'depreciationPrice', serverOperation: null, value: null },
  { fieldId: 'mechanicLaborUnit', serverOperation: null, value: null },
  { fieldId: 'mechanicLaborMinutes', serverOperation: null, value: null },
  { fieldId: 'discountPercentageMechanic', serverOperation: null, value: null },
  { fieldId: 'discountPercentageParts', serverOperation: null, value: null },
  { fieldId: 'maximumAllowedPrice', serverOperation: null, value: null },
  { fieldId: 'discountPercentageVarnisher', serverOperation: null, value: null },
  { fieldId: 'discountValueParts', serverOperation: null, value: null },
  { fieldId: 'discountValueMechanic', serverOperation: null, value: null },
  { fieldId: 'varnisherLaborMinutes', serverOperation: null, value: null },
  { fieldId: 'discountInvoicedValue', serverOperation: null, value: null },
  { fieldId: 'varnisherLaborUnit', serverOperation: null, value: null },
  { fieldId: 'discountPercentageExtra', serverOperation: null, value: null },
  { fieldId: 'varnisherLaborValue', serverOperation: null, value: null },
  { fieldId: 'discountValueVarnisher', serverOperation: null, value: null },
  { fieldId: 'discountValueExtra', serverOperation: null, value: null },
  { fieldId: 'otherDescription', serverOperation: null, value: null },
  { fieldId: 'partsDescription', serverOperation: null, value: null },
  // { fieldId: 'image', serverOperation: null, value: null },
  { fieldId: 'checkStatus', serverOperation: null, value: null },
  { fieldId: 'imagesList', serverOperation: null, value: null },
  { fieldId: 'usageDamage', serverOperation: null, value: null },
  { fieldId: 'inspectionDamageId', serverOperation: null, value: null },
  { fieldId: 'totalDiscount', serverOperation: null, value: null },
  { fieldId: 'totalValueWithDiscount', serverOperation: null, value: null },
  { fieldId: 'repairStatus', serverOperation: null, value: null },
  { fieldId: 'internalId', serverOperation: null, value: null },
  { fieldId: 'vehicleComponent', serverOperation: null, value: null },
  { fieldId: 'damageCause', serverOperation: null, value: null },
  { fieldId: 'remarkInspectionDamage', serverOperation: null, value: null },
  { fieldId: 'costStatus', serverOperation: null, value: null },
  { fieldId: 'isReady', serverOperation: null, value: null },
  { fieldId: 'sum', serverOperation: null, value: null },
  { fieldId: 'valueMechanicWithDiscount', serverOperation: null, value: null },
  { fieldId: 'valueVarnisherWithDiscount', serverOperation: null, value: null },
  { fieldId: 'valuePartsWithDiscount', serverOperation: null, value: null },
  { fieldId: 'valueExtraWithDiscount', serverOperation: null, value: null },
  { fieldId: 'parts', serverOperation: null, value: null },
  { fieldId: 'extra', serverOperation: null, value: null },
  { fieldId: 'serverOperationMap', serverOperation: null, value: '{}' }
];
