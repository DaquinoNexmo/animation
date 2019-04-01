import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as  fromStore from '../../../../store';
import { first } from 'rxjs/operators';
import { Module, Element, DataModel } from '../../../../models/view.model';
import { FunctionalityService } from '../../../../services/functionality.service';
import { RequestType } from '../../../../helper-classes/dynamicstrings';
import { MatDialog } from '@angular/material';
import { SettingsDialogComponent } from './menu-bar-settings-dialog/menu-bar-settings-dialog.component';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss']
})
export class MenuBarComponent implements OnInit, AfterViewInit {
  moduleName = 'menuBar';
  module: Module;
  @ViewChild('bottomMenuBar') bottomMenuBar;
  @ViewChild('topMenuBar') topMenuBar;

  leftElements: Element[] = [];
  centerElements: Element[] = [];
  rightElements: Element[] = [];

  constructor(private store: Store<fromStore.ModulesState>, private funcService: FunctionalityService, private dialog: MatDialog) { }

  ngOnInit() {
    this.store.select(fromStore.getModuleWithName(this.moduleName))
      .pipe(first()).subscribe( m => {
        this.module = m;
        this.module.structure.element.forEach( e => {
          switch (e.position) {
            case 'left': {
              this.leftElements.push(e);
              return;
            }
            case 'center': {
              this.centerElements.push(e);
              return;
            }
            case 'right': {
              this.rightElements.push(e);
              return;
            }
          }
        });
        this.initDynamicStrings();
      });
  }

  ngAfterViewInit(): void {
    const compStyle = window.getComputedStyle(this.bottomMenuBar.nativeElement);
    const height = compStyle.getPropertyValue('height');
    this.topMenuBar.nativeElement.style.bottom = height;
  }


  // the logout function happens in the reducer upon dispatching MenuBarButtonPress action
  onButtonClick(id: string) {
    const nameOfElemenet = id.split('.')[1];

    this.store.select(fromStore.getElementObject(id)).pipe(first()).subscribe(element => {


      switch (nameOfElemenet) {
        case 'settings': {
          this.settings();
          return;
        }
        default: {
          this.defaultMenuBarButton(element);
        }
      }
    });
  }

  defaultMenuBarButton(element: Element) {
    this.store.dispatch(new fromStore.MenuBarButtonPress({
      clearModule: element.action.clearModules, navigateToModule: element.action.navigateToModule}));
  }

  settings() {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      data: {}
    });
  }

  initDynamicStrings() {

    // The menu-bar element will get initialized on every view, so it is required that we clear the previous
    // dynamic strings before creating new ones, or there will be multiple instances of the same dyn string.

    this.funcService.dynamicStrings.removeDynamicStringsForModule(this.moduleName);

    this.module.structure.element.forEach( e => {
      if (e.type === 'label') {
        this.funcService.dynamicStrings.addDynamicStringToStructure(e.label.text, e.id, true, false, RequestType.setData);
      }
    });

    this.module.structure.element.forEach( e => {
      if (e.visibleExp) {
        this.funcService.dynamicStrings.addDynamicStringToStructure(e.visibleExp.dynExp, e.id, true, false, RequestType.setVisibility);
      }
    });

    this.funcService.dynamicStrings.parseModulesForDynamicStrings([this.module]);
  }
}
