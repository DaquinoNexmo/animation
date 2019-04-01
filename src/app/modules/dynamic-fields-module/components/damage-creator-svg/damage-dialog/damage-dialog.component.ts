import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../../store';
import { Module, DefaultDamage } from '../../../../../models/view.model';
import { first } from 'rxjs/operators';

export enum DamageState {
    SELECT_COMPONENT = 'Please select the damaged component',
    SELECT_DAMAGE = 'Please select the type of damage',
    SELECT_DEGREE = 'Please select the degree of the damage'
}

@Component({
    selector: 'app-damage-dialog',
    templateUrl: './damage-dialog.component.html',
    styleUrls: ['./damage-dialog.component.css']
})


export class DamageDialogComponent implements OnInit {

    damageStates = DamageState;
    damageState: DamageState;

    moduleName = 'damageCreatorSVG';
    module: Module;

    componentList = [];
    damageTypesList = [];
    damageDegreeList = [];

    selectedComponent;
    selectedDamage;
    selectedDegree;

    constructor(public dialogRef: MatDialogRef<DamageDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {componentList: any},
        private store: Store<fromStore.ModulesState>) {

        this.store.select(fromStore.getModuleWithName(this.moduleName))
            .pipe(first()).subscribe( module => {
                this.module = module;
            }
        );
        this.componentList = this.data.componentList;
        this.damageState = DamageState.SELECT_COMPONENT;
    }

    ngOnInit(): void {
    }

    onComponentSelect(component) {
        this.damageTypesList = component.damageTypeList;
        this.selectedComponent = component;
        this.damageState = DamageState.SELECT_DAMAGE;
    }

    onDamageSelect(damage) {
        this.damageDegreeList = damage.damageDegreeList;
        this.selectedDamage = damage;
        this.damageState = DamageState.SELECT_DEGREE;
    }

    onDegreeSelect(degree) {
        this.selectedDegree = degree;
        // const newDamage = JSON.parse(JSON.stringify(DefaultDamage));
        const newDamage = [];
        newDamage.push({
            fieldId: 'vehicleComponent',
            value: {
                friendlyname: this.selectedComponent.vehicleComponentFriendlyname,
                shortname: this.selectedComponent.vehicleComponentShortname
            },
            serverOperation: 'ADD'
        });

        newDamage.push({
            fieldId: 'damageType',
            value: {
                friendlyname: this.selectedDamage.damageType,
                shortname: this.selectedDamage.damageTypeShortname
            },
            serverOperation: 'ADD'
        });

        newDamage.push({
            fieldId: 'damageDegree',
            value: {
                friendlyname:  this.selectedDegree.friendlyname,
                shortname:  this.selectedDegree.shortname
            },
            serverOperation: 'ADD'
        });

        newDamage.push({
            fieldId: 'carouselId',
            value: 'damageView.' + new Date().getTime()
        });

        this.store.dispatch(new fromStore.AddDamage({damage: newDamage}));
        this.dialogRef.close({success: true});
    }

    onNoClick(): void {
        this.dialogRef.close({success: false});
    }
}