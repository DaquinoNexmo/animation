import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { FunctionalityService } from '../../../../services/functionality.service';
import { SpinnerService } from '../../../../services/spinner.service';
import * as  fromStore from '../../../../store';
import { Module } from '../../../../models/view.model';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-select-station',
  templateUrl: './select-station.component.html',
  styleUrls: ['./select-station.component.scss']
})
export class SelectStationComponent implements OnInit {

  module: Module;
  moduleName = 'station';

  constructor(private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService, private spinnerService: SpinnerService) {}

  ngOnInit() {
  this.store.select(fromStore.getModuleWithName(this.moduleName))
    .pipe(first()).subscribe(
      module => {
        this.module = module;
        this.initDynamicString();
    });
  }

  onSubmit() {
    this.funcService.goToNextView(this.module);
  }

  initDynamicString() {
    this.funcService.dynamicStrings.parseModulesForDynamicStrings([this.module]);
  }
}
