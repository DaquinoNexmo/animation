import { MatDialogRef, MAT_DIALOG_DATA, } from '@angular/material';
import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../../store';
import { Module } from '../../../../../models/view.model';


@Component({
    selector: 'app-settings-dialog',
    templateUrl: './menu-bar-settings-dialog.component.html',
    styleUrls: ['./menu-bar-settings-dialog.component.css']
  })
  export class SettingsDialogComponent implements OnInit {

    moduleName = 'resources';
    module: Module;

    constructor(
      public dialogRef: MatDialogRef<SettingsDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private store: Store<fromStore.ModulesState>) {

    }

    ngOnInit(): void {
        this.store.select(fromStore.getModuleWithName(this.moduleName)).subscribe( m => this.module = m);
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
}
