import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataLoadingService } from './dataLoading.service';
import { Router } from '@angular/router';

import { Module } from '../models/view.model';
declare var require: any;

@Injectable()
export class InnitService {
  route;

  constructor(private http: HttpClient, private dataService: DataLoadingService) {}

  getSettings(): Promise<any> {
    const promise = this.dataService.getAppStructure()
      .toPromise()
      .then(result => {
        this.route = this.getModuleID('login', result.modules);
        if (!localStorage.getItem('state')) {
          this.saveState(result);
        }
      });
    return promise;
  }

  getModuleID(name: string, modules: Module[]) {
    let module: Module;
    modules.forEach( (currentModule) => { if (currentModule.name === name) { module = currentModule; }});
    return module.structure.moduleID;
  }

  saveState(state) {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('state', serializedState);
    } catch (err) {
      console.log(err);
    }
  }

}

