import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as  fromStore from '../../../../store';
import { Module } from '../../../../models/view.model';
import { first, filter } from 'rxjs/operators';

@Component({
  selector: 'app-inspection-info',
  templateUrl: './inspection-info.component.html',
  styleUrls: ['./inspection-info.component.scss']
})
export class InspectionInfoComponent implements OnInit {
  moduleName = 'inspectionInfo';
  module: Module;


  constructor(private store: Store<fromStore.ModulesState>) {
    this.store.select(fromStore.getModuleWithName(this.moduleName))
        .pipe(first()).subscribe(module => {
            this.module = module;
        });
  }

  ngOnInit() {
  }

}
