export interface Inspection {
    clientName: string;
    vin: string;
    license: string;
    vehicleBodyType: string;
    equipmentNr?: string; // or number
    vehicleModel: string;
    customerName?: string;
    station: string;
    orderType: string; // Maybe an enum here
    contractNr?: string; // or number
    parkingPositionFreeText?: string;
    checker: string;
    vehicleManufacturer: string;
    inspectionDate?: string;
    buShortname: string;
    inspectionId: number;
    processDefinition: string; // Maybe an enum here
    stationFriendlyname: string;
    superBu: string; // Maybe an enum here
    checkedDate?: string;
    orderTypeFriendlyname: string;
    productName: string; // Maybe an enum here
    vehicleBodyTypeFriendlyname: string;
    priorityShortname?: string;
    priorityFriendlyname?: string;
    restrictionFriendlyname?: string;
    restrictionUserId?: string; // or number
    restrictionDate?: string;
    internalNr: string;
    createInspectionDate?: string;
    orderFreeTextComment?: string;
    contractFreeTextComment?: string;
    blocked: string; // or boolean maybe
    documentStatusShortname: string; // Maybe an enum here
    documentStatusFriendlyname: string;
    priority: string;
}