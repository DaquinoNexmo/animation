import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../store';
import { FunctionalityService } from '../../../../services/functionality.service';
import { Module, DefaultTire, DataModel } from '../../../../models/view.model';
import { MatDialog } from '@angular/material';
import { TireDialogComponent } from './tire-dialog/tire-dialog.component';
import { first } from 'rxjs/operators';

export interface TireToolModule extends Module {
  structure: Module['structure'] & {
    axisStructure: {
      allowEditAxis?: boolean;
      maxAxis?: string;
      maxReserveTires?: string;
      tireStructure?: any;
    };
    tireSearchPopup?: any;
  };
}


export enum TireToolState {
  NORMAL = 'NORMAL',
  SPARE = 'SPARE'
}

@Component({
  selector: 'app-tiretool',
  templateUrl: './tiretool.component.html',
  styleUrls: ['./tiretool.component.scss']
})
export class TireToolComponent implements OnInit, OnDestroy {
  module: TireToolModule;
  moduleName = 'tireTool';

  maxAxlesAllowed: number;
  tires: any[] = [];
  axles: any[] = [];
  spareTires = [];
  additionalTires = [];

  deletedAxleTires = [];
  deletedAxles = [];
  deletedAdditionalTires = [];
  deletedSpareTires = [];

  public tireToolState = TireToolState;
  state = TireToolState.NORMAL;


  constructor(
    private store: Store<fromStore.ModulesState>,
    private funcService: FunctionalityService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.store.select(fromStore.getModuleWithName(this.moduleName))
      .pipe(first())
      .subscribe( (module: TireToolModule) => {
        this.module = module;
        this.initializeTires();
        this.initializePopupElements();
      });
  }

  initializeTires() {
    this.maxAxlesAllowed = parseInt(this.module.structure.axisStructure.maxAxis, 10);
    const underBodyObject = this.module.data.find(d => d['underbody']);
    let underbody = underBodyObject['underbody'][0].value; // Looks like F_11_21
    const tires = this.module.data.filter(d => d['tire']);

    if (tires.length > 0) {
      // There are already tires in the data layer, load them
      this.tires = tires;
      this.tires.forEach(tire => {
        const axleProperty = tire.tire.find(property => property.fieldId === 'axle');
        const axlePositionProperty = tire.tire.find(property => property.fieldId === 'axlePosition');
        const positionCode = tire.tire.find(element => element.fieldId === 'positionCode');

        const belongsToAxle = axleProperty.value; // Axle to which this tire belongs
        const positionInAxle = axlePositionProperty.value; // Place in the axle to which this tire belongs
        if (!belongsToAxle) {
          // The tire does not belong to an axle, its a reserve or spare - skip
          if (positionCode.value && positionCode.value.shortname.split('').includes('S')) {
            this.spareTires.push(tire.tire);
            // Spare-tire found!
          }
          if (positionCode.value && positionCode.value.shortname.split('').includes('A')) {
            this.additionalTires.push(tire.tire);
            // Additional-tire found!
          }
          return;
        }
        if (!this.axles[belongsToAxle - 1]) {
          this.axles[belongsToAxle - 1] = [];
        }
        this.axles[belongsToAxle - 1].push(tire.tire);
      });
    } else {
      // No tires found, set up the default number of axles with default tires
      underbody = underbody.split('_');
      underbody.splice(0, 1); // Removes F_
      underbody.sort(); // Makes sure that the axles are in order
      underbody.forEach((axle, index) => {
        this.addAxle();
        if (axle.charAt(1) === '2') { // Twin tires
          this.changeNumberOfTires(this.axles[index]);
        }
      });
    }
  }

  initializePopupElements() {
    if (this.module.structure.element && this.module.structure.element.length > 0) {
      // Tire elements have already been initialized once
      return;
    }
    const tireStructure = this.module.structure.axisStructure.tireStructure;
    const tireElements = Object.keys(tireStructure);
    tireElements.forEach(element => {
      const newElement: any = {
        id: 'tireTool.' + element,
        label: {
          text: element,
          translation: false
        },
        editable: tireStructure[element].editable,
        required: tireStructure[element].required,
        simpleValue: tireStructure[element].simpleValue,
        type: 'text'
      };
      if (tireStructure[element].optionsurl) {
      // Element is a combo box
        newElement.optionsurl = tireStructure[element].optionsurl;
        newElement.displayname = tireStructure[element].displayname;
        newElement.type = 'comboBox';
      }
      if (tireStructure[element].comboBox) {
      // Element is a combo box
        newElement.defaultoptions = tireStructure[element].comboBox.options._text.split(',');
        newElement.type = 'comboBox';
      }
      if (element === 'tireProfile') {
        newElement.type = 'number';
      }
      this.store.dispatch(new fromStore.AddElementToStructure(newElement));
    });
  }

  ngOnDestroy(): void {
    this.saveTiresInStore();
  }


  saveTiresInStore() {
    let allTires = [];
    this.axles.forEach(axle => axle.forEach(tire => allTires.push(tire)));
    this.spareTires.forEach(tire => allTires.push(tire));
    this.additionalTires.forEach(tire => allTires.push(tire));

    allTires = allTires.map(tireOptions => ({tire: tireOptions}));

    this.store.dispatch(new fromStore.SaveTiresAction(allTires));
  }


  addAxle() {
    if (this.deletedAxles.length > 0) {
      // Already have saved previously deleted axle, don't create a new one
      this.axles.push(this.deletedAxles.pop());
      return;
    }
    if (this.axles.length < this.maxAxlesAllowed) {
      const newTires = [];
      const newTireOne: DataModel[] = JSON.parse(JSON.stringify(DefaultTire));
      const newTireTwo: DataModel[] = JSON.parse(JSON.stringify(DefaultTire));
      newTireOne.find(e => e.fieldId === 'axle').value = `${this.axles.length + 1}`;
      newTireOne.find(e => e.fieldId === 'axlePosition').value = '1';
      newTireOne.find(e => e.fieldId === 'positionCode').value = {
        friendlyname: `${this.axles.length + 1}` + '. AXLE LEFT EXTERIOR',
        shortname: 'LE' + `${this.axles.length + 1}`,
      };
      newTireTwo.find(e => e.fieldId === 'axle').value = `${this.axles.length + 1}`;
      newTireTwo.find(e => e.fieldId === 'axlePosition').value = '4';
      newTireTwo.find(e => e.fieldId === 'positionCode').value = {
        friendlyname: `${this.axles.length + 1}` + '. AXLE RIGHT EXTERIOR',
        shortname: 'RE' + `${this.axles.length + 1}`,
      };
      newTires.push(newTireOne);
      newTires.push(newTireTwo);
      this.axles.push(newTires);
    }
  }

  removeAxle(axle) {
    const index = this.axles.indexOf(axle);
    this.deletedAxles.push(this.axles.splice(index, 1)[0]);
  }

  changeNumberOfTires(axle) {
    const axleIndex = this.axles.indexOf(axle);
    if (axle.length > 2) {
      // There are more than 2 tires, remove 2

      // Keep tire order
      const temp = axle[1];
      axle[1] = axle[3];
      axle[3] = temp;
      if (!Array.isArray(this.deletedAxleTires[axleIndex])) {
        this.deletedAxleTires[axleIndex] = [];
      }
      // Save deleted tires
      this.deletedAxleTires[axleIndex].push(axle.pop());
      this.deletedAxleTires[axleIndex].push(axle.pop());
    } else {
      if (Array.isArray(this.deletedAxleTires[axleIndex]) && this.deletedAxleTires[axleIndex].length > 0) {
        // Already have deleted tires for this axle, add them back
        axle.push(this.deletedAxleTires[axleIndex].pop());
        axle.push(this.deletedAxleTires[axleIndex].pop());
        // Keep order of tires in axle
        const temp = axle[1];
        axle[1] = axle[3];
        axle[3] = temp;
        return;
      }

      // There are only 2 tires, add 2 more
      const axlePosition = axle[0].find(element => element.fieldId === 'axle').value;
      const newTireOne = JSON.parse(JSON.stringify(DefaultTire));
      const newTireTwo = JSON.parse(JSON.stringify(DefaultTire));
      newTireOne.find(e => e.fieldId === 'axle').value = axlePosition;
      newTireOne.find(e => e.fieldId === 'axlePosition').value = '2';
      newTireOne.find(e => e.fieldId === 'positionCode').value = {
        friendlyname: axlePosition + '. AXLE LEFT INTERIOR',
        shortname: 'LI' + axlePosition,
      };
      newTireTwo.find(e => e.fieldId === 'axle').value = axlePosition;
      newTireTwo.find(e => e.fieldId === 'axlePosition').value = '3';
      newTireTwo.find(e => e.fieldId === 'positionCode').value = {
        friendlyname: axlePosition + '. AXLE RIGHT INTERIOR',
        shortname: 'RI' + axlePosition,
      };
      // Doing this to keep the order of the tires in the axle array
      axle[3] = axle[1];
      axle[1] = newTireOne;
      axle[2] = newTireTwo;
    }
  }

  getTireAtPosition(position: string, axle) {
    // The possible positions are - LE1 LI1 RI1 RE1 (where 1 is the number of the axle) L - left, R - right, I - interior, E - exterior
    return axle.find(tire => {
      if (tire.find( element => element.fieldId === 'positionCode').value['shortname'] === position) {
        return true;
      }
      return false;
    });
  }

  getManufacturerOfTire(tire) {
    const manufacturer = tire.find(element => element.fieldId === 'manufacturer').value;
    if (manufacturer) {
      return manufacturer.friendlyname;
    }
  }

  getMeasureOfTire(tire) {
    const tireMeasure = tire.find(element => element.fieldId === 'tireMeasure').value;
    if (tireMeasure) {
      return tireMeasure;
    }
  }

  getProfileOfTire(tire) {
    const profile = tire.find(element => element.fieldId === 'profile').value;
    if (profile) {
      return profile;
    }
  }

  changeState() {
    if (this.state === this.tireToolState.NORMAL) {
      this.state = this.tireToolState.SPARE;
    } else {
      this.state = this.tireToolState.NORMAL;
    }
  }

  getImage(image: string) {
    return 'url("./assets/icons/' + image + '")';
  }

  openTirePopup(tire, axle) {
    //  If tire is a spare or additional, axle will be null
    const dialogRef = this.dialog.open(TireDialogComponent, {
      data: {tire: tire, module: this.module, axle: axle, axles: this.axles, spareTires: this.spareTires, additionalTires: this.additionalTires,
        deletedAdditionalTires: this.deletedAdditionalTires, deletedSpareTires: this.deletedSpareTires},
      autoFocus: false
   });
  }

  addSpareTire() {
    let newTire: DataModel[];
    if (this.deletedSpareTires.length > 0) {
      newTire = this.deletedSpareTires.pop();
    } else {
      newTire = JSON.parse(JSON.stringify(DefaultTire));
    }
    const position = this.spareTires.length + 1;
    newTire.find(element => element.fieldId === 'positionCode').value = {
      friendlyname: 'Reserverad ' + position,
      shortname: 'S' + position,
    };

    newTire.find(element => element.fieldId === 'axle').value = null;
    this.spareTires.push(newTire);
  }

  addAdditionalTire() {
    let newTire: DataModel[];
    if (this.deletedAdditionalTires.length > 0) {
      newTire = this.deletedAdditionalTires.pop();
    } else {
      newTire = JSON.parse(JSON.stringify(DefaultTire));
    }
    const position = this.additionalTires.length + 1;
    newTire.find(element => element.fieldId === 'positionCode').value = {
      friendlyname: 'Zusatzreifen ' + position,
      shortname: 'A' + position,
    };
    newTire.find(element => element.fieldId === 'axle').value = null;

    this.additionalTires.push(newTire);
  }

  swapTires() {
    let i = 0;
    const allAxleTires = [];
    this.axles.forEach(axle => {
      // First flatten all tires into a single array
      axle.forEach(tire => allAxleTires.push(tire));
    });
    this.additionalTires.forEach(additionalTire => {
      additionalTire.forEach(element => {
        if (allAxleTires.length <= i) {
          // After swapping all posible tires, skip if there are more additional tires than axle tire positions
          return;
        }
        if (element.fieldId === 'positionCode' || element.fieldId === 'axle' || element.fieldId === 'axlePosition' || element.fieldId === 'profile') {
          return;
        }
        const swapTempValue = JSON.parse(JSON.stringify(element.value));
        element.value = JSON.parse(JSON.stringify(allAxleTires[i].find(e => e.fieldId === element.fieldId).value));
        allAxleTires[i].find(e => e.fieldId === element.fieldId).value = swapTempValue;
      });

      i++;
    });
  }
}
