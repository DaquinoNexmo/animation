import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  AfterViewInit
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../store';
import { FunctionalityService } from '../../../../services/functionality.service';
import { Module } from '../../../../models/view.model';
import { first, filter } from 'rxjs/operators';
import { RequestType } from '../../../../helper-classes/dynamicstrings';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { SignatureDialogComponent } from './signature-dialog/signature-dialog.component';

declare var require: any;
const panzoom = require('panzoom');

export interface ProtocolModule extends Module {
  structure: Module['structure'] & {
    signatureSize: string;
    signatureStoragePath: string;
    signatureChecker: string;
    signatureCustomer: string;
    sendEMail: string;
    maxEMail: string;
    checkerName: string;
    customerName: string;
    syncSuccess: string;
    protocolLanguageDataProvider: string;
    protocolImageCall: string;
    processSyncCall: string;
    processCloseCall: string;
  };
}

@Component({
  selector: 'app-protocol',
  templateUrl: './protocol.component.html',
  styleUrls: ['./protocol.component.scss']
})
export class ProtocolComponent implements OnInit, OnDestroy, AfterViewInit {
  moduleName = 'protocol';
  @Input() module: ProtocolModule;
  subscription: Subscription;

  pictureUploadCall = '$resources.connection.protocol$$resources.connection.domain$/JsonServer/?custom={\"client\":\"$station.appDomain.clientLayerName$\",\"name\":\"uploadFileByFrontendIdentifier\",\"data\":{}}&sessionid=$login.session$&postBody=true';
  syncCallUrl = '$resources.connection.protocol$$resources.connection.domain$/JsonServer/?custom={"client":"$station.appDomain.clientLayerName$","name":"syncInspectionMCV2","data":{"mcInspection":null}}&sessionid=$login.session$&transmitMessage=send';
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  img: HTMLImageElement;
  zoomLevel = 1;
  base64;

  constructor(
    private store: Store<fromStore.ModulesState>,
    private funcService: FunctionalityService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initDynamicString();
    if (!Array.isArray(this.module.structure.element)) {
      this.module.structure.element = [];
    }
    if (this.module.structure.element.length === 0) {
      this.module.structure.element.push({
        id: 'protocol.protocolLanguage',
        editable: true,
        required: true,
        visible: true,
        type: 'comboBox',
        displayname: 'languageFriendlyname',
        customValue: 'false',
        label: {
          translation: true,
          text: 'LANGUAGE'
        },
        optionsurl: this.module.structure.protocolLanguageDataProvider
      });
    }
  }

  ngAfterViewInit(): void {
    this.img = <HTMLImageElement>document.getElementById('imgElem');
    panzoom(this.img, {
      maxZoom: 3,
      minZoom: 1,
      zoomSpeed: 0.035,
      smoothScroll: false
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getProtocol() {
    this.funcService.dynamicStrings.sendManualRequest(
      'protocol.protocol.image'
    );

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.store
      .select(fromStore.getDataElementValue('protocol.photo'))
      .pipe(filter(m => m)) // filter undefined
      .subscribe(base64 => {
        this.img.setAttribute('src', 'data:image/jpg;base64,' + base64);
      });
  }

  signProtocol() {
    const dialogRef = this.dialog.open(SignatureDialogComponent, {
      data: {},
      autoFocus: false,
      height: '200',
      width: '300'
    });
    // this.funcService.dynamicStrings.sendManualRequest('protocol.protocol.close');
  }

  saveProtocol() {
    this.funcService.dynamicStrings.sendManualRequest('protocol.protocol.sync');
  }

  initDynamicString() {

    this.funcService.dynamicStrings.addDynamicStringToStructure(
      // this.module.structure.processSyncCall,
      this.syncCallUrl,
      'protocol.protocol.sync',
      false,
      false,
      RequestType.protocolSync
    );
    /*
    this.funcService.dynamicStrings.addDynamicStringToStructure(
      this.module.structure.processCloseCall,
      'protocol.protocol.close',
      false,
      false,
      RequestType.combobox
    );
    */
    this.funcService.dynamicStrings.addDynamicStringToStructure(
      this.module.structure.protocolImageCall,
      'protocol.protocol.image',
      false,
      false,
      RequestType.protocolGet
    );

    this.funcService.dynamicStrings.addDynamicStringToStructure(
      this.pictureUploadCall, 'protocol.pictureUploadCall', true, false, RequestType.setData);
  }
}
