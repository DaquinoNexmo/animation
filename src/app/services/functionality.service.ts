import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromStore from '../store';
import { Module } from '../models/view.model';
import { DynamicStrings } from '../helper-classes/dynamicstrings';
import { MyXMLparser } from '../helper-classes/xml-parser';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { first } from 'rxjs/operators';

@Injectable()
export class FunctionalityService {
  view: string;
  module: string;
  dynamicStrings: DynamicStrings;
  xmlParser: MyXMLparser;
  selectedOptions = new BehaviorSubject([]);
  selectedOptionsArray = [];


  public picturesLoading: Map<string, boolean> = new Map(); // Maps fieldId of fotoDocu or damage to a boolean wheather a picture is being loaded or not

  constructor(private router: Router, private store: Store<fromStore.ModulesState>, private httpClient: HttpClient, private logger: NGXLogger) {
    this.dynamicStrings = new DynamicStrings(this.store, this.logger);
    this.xmlParser = new MyXMLparser(this.httpClient);
    // Save state on every change
    this.store.select(fromStore.getDataState)
      .subscribe(state => {
        // console.log(state);
        this.saveState(state);
      });

    /*
    // TODO: Remove, used for debugging only
    this.store.select(fromStore.getImageModule).
      subscribe(state => {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('images', serializedState);
      });
    */
  }

  saveState(state) {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('state', serializedState);
    } catch (err) {
      console.log(err);
    }
  }

   goToNextView(currentModule: Module) {
    const nextView = currentModule.structure.nextView;
    this.store.select(fromStore.getData).pipe(first())
      .subscribe(modules => {
          const moduleID = this.getModuleID(nextView, modules);
          this.changeView(nextView, moduleID);
    });
  }

  changeView(nextView: string, path: string) {

    this.view = nextView;
    localStorage.setItem('modules', nextView);

    return this.router.navigate([`${path}`]);
  }

  getModuleID(name: string, allModules: Module[]): string {
    if (allModules[0].name === 'INITIALSTATE') { return; } // store has no data yet, come back later
    let module: Module;
    allModules.forEach( (currentModule) => { if (currentModule.name === name) { module = currentModule; }});

    return module.structure.moduleID;
  }

}
