import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort} from '@angular/material';
import { Component, Inject, ViewChild, OnInit, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../../store';
import { FunctionalityService } from '../../../../../services/functionality.service';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Module, DataModel } from '../../../../../models/view.model';
import { first } from 'rxjs/operators';


export enum SignatureState {
    SIGN = 'SIGNATURE',
    NO_CUSTOMER_SIGNATURE = 'NO_CUSTOMER_SIGNATURE',
    SEND_EMAIL = 'SEND_EMAIL',
    FILL_EMAIL = 'FILL_EMAIL'
}

export enum SignatureTitleState {
    SIGN = 'Please provide signatures',
    NO_CUSTOMER_SIGNATURE = 'The customer signature is missing',
    SEND_EMAIL = 'Would you like to send emails of this protocol?',
    FILL_EMAIL = 'Please provide emails'
}


@Component({
    selector: 'app-signature-dialog',
    templateUrl: './signature-dialog.component.html',
    styleUrls: ['./signature-dialog.component.scss']
})

export class SignatureDialogComponent implements OnInit, AfterViewInit {

    public signatureState = SignatureState;
    public signatureTitleState = SignatureTitleState;

    state: SignatureState = SignatureState.SIGN;
    titleState: SignatureTitleState = SignatureTitleState.SIGN;

    moduleName = 'protocol';
    module: Module;
    checkerSignatureRequired = true;
    customerSignatureRequired = true;
    numberOfEmails = 0;

    disabled = true;

    reasonForNoSignatureFromCustomer = '';
    checkerBase64Signature: String;
    customerBase64Signature: String;

    emails = [];                        // Used to display the fields for the email input
    emailAdresses: String[] = [];       // Holds the entered email strings

    @ViewChild('checker') signaturePadChecker: SignaturePad;
    @ViewChild('customer') signaturePadCustomer: SignaturePad;

    signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
        'minWidth': 5,
        'canvasWidth': 240,
        'canvasHeight': 150
    };

    constructor(public dialogRef: MatDialogRef<SignatureDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService) {

        this.store.select(fromStore.getModuleWithName(this.moduleName))
            .pipe(first()).subscribe( module => {
                this.module = module;
                // this.checkerSignatureRequired = 'true' === this.module.structure.signatureChecker;
                // this.customerSignatureRequired = 'true' === this.module.structure.signatureCustomer;
                this.numberOfEmails = this.module.structure.maxEMail;
            }
        );
    }

    ngOnInit(): void {
    }

    onNoClick(): void {
        this.dialogRef.close();
        this.state = SignatureState.SIGN;
        this.titleState = SignatureTitleState.SIGN;
    }

    ngAfterViewInit() {
        this.signaturePadCustomer.set('maxWidth', 2.5);
        this.signaturePadCustomer.set('minWidth', 1.0);
        this.signaturePadChecker.set('maxWidth', 2.5);
        this.signaturePadChecker.set('minWidth', 1.0);
        this.signaturePadChecker.clear();
        this.signaturePadCustomer.clear();
        console.log(this.signaturePadChecker.isEmpty());
    }

    drawComplete() {
        // will be notified of szimek/signature_pad's onEnd event
        this.checkerBase64Signature = this.signaturePadChecker.toDataURL();
        this.customerBase64Signature = this.signaturePadCustomer.toDataURL();
        if (!this.signaturePadChecker.isEmpty()) {
            this.disabled = false;
        }
    }

    erase(name: string) {
        if (name === 'customer') {
            this.signaturePadCustomer.clear();
        }
        if (name === 'checker') {
            this.signaturePadChecker.clear();
        }
    }

    noCustomerSignature() {
        if (this.reasonForNoSignatureFromCustomer === '') {
            alert('Please select a reason for no customer signature!');
            return;
        }
        this.state = SignatureState.SEND_EMAIL;
        this.titleState = SignatureTitleState.SEND_EMAIL;
    }

    onSelectedChange(value: string) {
        this.disabled = false;
        this.reasonForNoSignatureFromCustomer = value;
    }

    submitSignature() {
        if (this.customerSignatureRequired) {
            if (this.signaturePadCustomer.isEmpty()) {
                // Customer signature is empty
                this.disabled = true;
                this.state = SignatureState.NO_CUSTOMER_SIGNATURE;
                this.titleState = SignatureTitleState.NO_CUSTOMER_SIGNATURE;
                return;
            }
        }

        this.state = SignatureState.SEND_EMAIL;
        this.titleState = SignatureTitleState.SEND_EMAIL;
    }

    getCheckerSignature() {
        return this.checkerBase64Signature;
    }

    goToSendEmail(send: boolean) {
        if (send) {
            this.state = SignatureState.FILL_EMAIL;
            this.titleState = SignatureTitleState.FILL_EMAIL;
        } else {
            // TODO no email send close dialog and close process
            this.onNoClick();
        }
    }

    addEmail() {
        if (this.emails.length < this.numberOfEmails) {
            this.emails.push(this.emails.length);
        } else {
            alert('Maximum number of emails reached!');
        }
    }

    drawStart() {
    }

    onEmailChange(email: string, number) {
        this.emailAdresses[number] = email;
        console.log(this.emailAdresses);

        const dataMap = new Map<string, DataModel>();
        const sendMailId = 'protocol.sendMail';
        dataMap.set(sendMailId , {fieldId: sendMailId, value: this.emailAdresses, serverOperation: 'UPDATE'});
        this.store.dispatch(new fromStore.SetData({nameOfModule: this.moduleName, data: dataMap}));
    }
}