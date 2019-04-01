import { Component, OnInit, AfterViewInit, HostListener, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import * as  fromStore from '../../../../store';
import { Module } from '../../../../models/view.model';
import { first, filter, map } from 'rxjs/operators';
import { MatDialog, MatSnackBar } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import * as xml2json from 'xml-js';
import { jsonParser } from '../../../../helper-classes/xml-parser';
import { DamageDialogComponent } from './damage-dialog/damage-dialog.component';

import * as Hammer from 'hammerjs';
import svgPanZoom from 'svg-pan-zoom/src/svg-pan-zoom.js';
import * as JSZip from 'jszip';

@Component({
  selector: 'app-damage-creator-svg',
  templateUrl: './damage-creator-svg.component.html',
  styleUrls: ['./damage-creator-svg.component.css']
})

export class DamageCreatorSvgComponent implements OnInit, AfterViewInit {
  moduleName = 'damageCreatorSVG';
  module: Module;

  @Output() buttonEmitter = new EventEmitter<any>(); // For going back to Damage View

  colorMap = new Map(); // Stores the old colors of parts, so that they can be restored after a mouseover or mouse click
  div;                // The wrapper div for the svg
  carOptions = [];    // The possible car models
  viewOptions = [];   // The possible views for the selected car
  modelViewMap = {};  // Car models have 2 names, one is shown to the user the other one is the name of the folder, this obj stores the connection

  carModel: String;   // Selected CarModel
  view: String;       // Selected view, eg. front

  navigation;         // From navigation.xml, stores control transitions, minZoom, maxZoom, etc...
  zip;                // Zip that hold the navigation.xml and all svg components

                      // 4 variables for enabling the arrow controls
  leftArrow = false;
  rightArrow = false;
  upArrow = false;
  downArrow = false;

  xOfLastClick;        // stores the position of x on mouse down, used to check if its a click or a drag
  yOfLastClick;        // stores the position of y on mouse down, used to check if its a click or a drag

  control: any;        // Stores controls for the current view, eg. left arrow to show front view
  panZoom;             // Stores the obj created by PanZoomSVG library
  damageDefinitionObject; // Stores the json response, describing all parts that can possibly have damages, their types and degrees
  zipLoaded: any;

  language = 'eng';
  defaultControls = [];
  backButtonsStack = [];

  @HostListener('window:keydown', ['$event']) onKeyDown(event) {
    // For rotation of the svgs using the arrow keys
    this.hotkey(event);
  }

  constructor(private store: Store<fromStore.ModulesState>, private dialog: MatDialog, private http: HttpClient, private snackBar: MatSnackBar) {
    this.store.select(fromStore.getModuleWithName(this.moduleName)).
      pipe(first()).subscribe(module => {
        this.module = module;
      });

      this.store.select(fromStore.getDataElementValue('resources.language')).subscribe(language => this.language = language);
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.div = document.getElementById('svg-wrapper');
    this.div.addEventListener('mousedown', event => this.onMouseDown(event));
    this.div.addEventListener('mouseup', event => this.onMouseUp(event));

    this.div.addEventListener('touchstart', event => this.onMouseDown(event));
    this.div.addEventListener('touchend', event => this.onMouseUp(event));

    this.div.addEventListener('mouseover', event => this.onMouseOver(event));
    this.div.addEventListener('mouseout', event => this.onMouseOut(event));

    // TODO this will be a server call that gets a json, using dynamic strings
    this.http.get('./assets/interactiveModels/models.xml', {responseType: 'text'}).
      pipe(
        map(data => {
          const options = {compact: true, ignoreDeclaration: true, ignoreComment: true};
          const jsonObj = xml2json.xml2json(data, options);
          const obj = JSON.parse(jsonObj);
          this.carOptions = obj.root.model;
          for (let i = 0; i < obj.root.model.length; i++) {
            this.modelViewMap[obj.root.model[i].name._text] = obj.root.model[i].id._text;
          }
          return obj;
      })).subscribe(v => this.store.dispatch(new fromStore.GetXMLComboBoxSuccess({...v, elementId: 'damageCreatorSVG.modelSelector'})));
  }

  swapSVG(svg) {

    this.div.innerHTML = svg;
    let chosenView;
    if (Array.isArray(this.navigation.view)) {
      chosenView = this.navigation.view.find(v => v.id === this.view);
    } else {
      chosenView = this.navigation.view;
    }

    const minZoom = chosenView.minZoom - 1;
    const maxZoom = chosenView.maxZoom;
    const defaultZoom = chosenView.defaultZoom;
    const rotation = chosenView.rotation;


    // Rotate all child elements of the svg, if rotation is specified in the navigation.xml
    if (rotation && rotation !== '0') {
      this.div.firstChild.childNodes.forEach( node => {
        if (node.nodeName === '#text') {
          return;
        }
        node.setAttribute('transform', 'rotate(' + rotation + ')');
      });
    }

    // TODO: figure out optimal values for this, maybe also different values if on mobile
    // Height attribute gets lost because of the svgPanZoom viewbox library
    this.div.firstChild.style.height = '515px';

    // TODO: add preserveAspectRatio="none" x="0px" y="0px" width="100%" height="100%"
    // To all svg parent elements to keep the width the size of the div


    const initialZoomScaleSensitivity = 0.2;
    let currentZoomScaleSensitivity = initialZoomScaleSensitivity;
    let lastZoomTime = new Date().getTime();
    this.panZoom = svgPanZoom(this.div.firstChild, {
      //  minZoom: minZoom,
      fit: true,
      center: true,
      maxZoom: maxZoom,
      contain: true,
      zoomScaleSensitivity: initialZoomScaleSensitivity,
      dblClickZoomEnabled: false,
      beforePan: this.beforePan,
      beforeZoom: function(oldZoom, newZoom) {
        const time = new Date().getTime();
        const timeToTriggerExponentialZooming = 16;
        if (time - lastZoomTime <  timeToTriggerExponentialZooming) {
          // increse sensitivity if zooms are happening close in time
          const exponentialZoomSensitivityFactor = 0.2;
          this.setZoomScaleSensitivity(currentZoomScaleSensitivity + exponentialZoomSensitivityFactor);
          currentZoomScaleSensitivity += exponentialZoomSensitivityFactor;
        } else {
          // reset sensitivity otherwise
          this.setZoomScaleSensitivity(initialZoomScaleSensitivity);
          currentZoomScaleSensitivity = initialZoomScaleSensitivity;
        }
        lastZoomTime = new Date().getTime();
      }
    });


    // Pinch smooth zooming
    const hammerTime = new Hammer(this.div, {inputClass: Hammer.TouchInput});
    hammerTime.get('pinch').set({ enable: true});

    let initialScale = 1;
    hammerTime.on('pinch pinchstart', (event) => {
      if (event.type === 'pinchstart') {
        initialScale = this.panZoom.getZoom();
        this.panZoom.zoom(initialScale * event.scale);
      } else {
        this.panZoom.zoom(initialScale * event.scale);
      }
    });

    hammerTime.on('touchstart', (event) => this.onMouseDown(event));
    hammerTime.on('touchend', (event) => this.onMouseUp(event));

    this.panZoom.updateBBox();
    this.panZoom.resize();
    this.panZoom.fit();
    this.panZoom.center();

    this.panZoom.setMinZoom(1);
  }

  populateViewBox(value, skip = false) {
    this.carModel = this.modelViewMap[value];

    if (skip) {
      this.carModel = value;
    }
    this.viewOptions = [];

    // this.http.get('http://localhost:4200/assets/interactiveModels2/' + this.carModel + '/navigation.xml', {responseType: 'text'}).
    this.http.get('./assets/interactiveModels/' + this.carModel + '_v1.0.zip', {responseType: 'arraybuffer'})
      .pipe(
        map(data => {
          this.zip = new JSZip();

          this.zip.loadAsync(data).then(zip => {
            this.zipLoaded = zip;
            zip.file('navigation.xml').async('string').then(nav => {
              const options = {compact: true, ignoreDeclaration: true, ignoreComment: true};
              const jsonObj = xml2json.xml2json(nav, options);
              const obj = JSON.parse(jsonObj);
              for (let i = 0; i < obj.navigation.view.length; i++) {
                this.viewOptions.push(obj.navigation.view[i]._attributes.id);
              }
              jsonParser(obj);
              this.navigation = obj.navigation;

              // Initialize default buttons
              this.defaultControls = [];

              if (this.backButtonsStack.length > 0) {
                this.defaultControls.push(this.backButtonsStack.pop());
              }
              if (this.navigation.default && Array.isArray(this.navigation.default.control)) {
                this.navigation.default.control.forEach(control => {
                  this.defaultControls.push(control);
                });
              }

              this.getSVG(this.navigation.defaultView);

              // Loading the damage definition file
              const fileName = this.carModel + '_' + this.language + '.json';
              zip.folder('json').file(fileName).async('string')
                .then(damageDefinitionObject => this.damageDefinitionObject = JSON.parse(damageDefinitionObject));
            });
          });
      })).subscribe();
  }

  defaultControl(control) {
    if (control.model) {
      let shouldMakeReturnButton = false;
      const allVehicleKeys = Object.keys(this.modelViewMap);
      allVehicleKeys.forEach(key => {
        if (this.modelViewMap[key] === this.carModel) {
          shouldMakeReturnButton = true;
        }
      });
      if (shouldMakeReturnButton) {
        const backButton = {input: 'button', model: this.carModel, label: 'BACK'};
        this.backButtonsStack.push(backButton);
      }

      this.populateViewBox(control.model, true);


    } else {
      if (this.damageDefinitionObject[control.target]) {
        // Selected car part can have damages, open a dialog to chose the damage type and degree
        const componentList = this.damageDefinitionObject[control.target].vehicleComponentList;
        const dialogRef = this.dialog.open(DamageDialogComponent, {
          data: {componentList: componentList}
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result.success) {
            this.backToDamageView();
          }});
      }
    }
  }

  updateControls(viewName: String) {
    if (Array.isArray(this.navigation.view)) {
      this.control = this.navigation.view.find(view => view.id === viewName).control;
    } else {
      this.control = this.navigation.view.control;
    }
    let possibleInputs = [];
    if (Array.isArray(this.control)) {
      possibleInputs = this.control.map( control => control.input);
    }

    // Reset all arrows
    this.downArrow = this.upArrow = this.rightArrow = this.leftArrow = false;

    if (possibleInputs.includes('down')) {
      this.downArrow = true;
    }
    if (possibleInputs.includes('up')) {
      this.upArrow = true;
    }
    if (possibleInputs.includes('right')) {
      this.rightArrow = true;
    }
    if (possibleInputs.includes('left')) {
      this.leftArrow = true;
    }
  }

  hotkey(event) {
    switch (event.keyCode) {
      case 37: { // left arrow
        this.arrowClick('left');
        break;
      }
      case 38: { // up arrow
        this.arrowClick('up');
        break;
      }
      case 39: { // right arrow
        this.arrowClick('right');
        break;
      }
      case 40: { // down arrow
        this.arrowClick('down');
        break;
      }
    }
  }

  arrowClick(direction: string) {
    if (Array.isArray(this.control)) {
      const nextView = this.control.find( control => control.input === direction);
      if (nextView) {
        this.getSVG(nextView.target);
      }
    }
  }

  getSVG(value) {
    this.view = value;
    console.log(this.view);
    this.updateControls(value);

    let nextView;
    if (Array.isArray(this.navigation.view)) {
      nextView = this.navigation.view.find(v => v.id === value);
    } else {
      nextView = this.navigation.view;
    }

    // TODO: remove check and usage of value when all folders have the same navigation.xml
    let nameOfNextSvg = value;
    if (nextView) {
      nameOfNextSvg = nextView.svg;
    }
    nameOfNextSvg += '.svg';
    this.zipLoaded.folder('svg').file(nameOfNextSvg).async('string').then(svg => this.swapSVG(svg));

    /*
    this.http.get('http://localhost:4200/assets/interactiveModels2/' + this.carModel + '/' + nameOfNextSvg + '.svg', {responseType: 'text'})
      .subscribe(response => this.swapSVG(response));
    */
  }

  zoomOut() {
    this.panZoom.zoomOut();
  }

  zoomIn() {
    this.panZoom.zoomIn();
  }

  // Callback to check if the pan is allowed, eg. don't let the car model exit the view box
  beforePan = function(oldPan, newPan) {

    this.updateBBox();
    const sizes = this.getSizes();

    let leftLimit, rightLimit, topLimit, bottomLimit;

    // If the car model width is bigger than the viewbox, allow paning in x
    if (sizes.width < sizes.viewBox.width * sizes.realZoom) {
      leftLimit = -((sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom) + sizes.width;
      rightLimit = -(sizes.viewBox.x * sizes.realZoom);
    } else {
      leftLimit = (sizes.width -  (sizes.viewBox.width + sizes.viewBox.x * 2) * sizes.realZoom) / 2;
      rightLimit = leftLimit;
    }

    // If the car model height is bigger than the viewbox, allow paning in y
    if (sizes.height < sizes.viewBox.height * sizes.realZoom) {
      topLimit = -((sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom) + sizes.height;
      bottomLimit = -(sizes.viewBox.y * sizes.realZoom);
    } else {
      topLimit = (sizes.height - (sizes.viewBox.height + sizes.viewBox.y * 2)  * sizes.realZoom) / 2;
      bottomLimit = topLimit;
    }

    const x = Math.max(leftLimit, Math.min(rightLimit, newPan.x));
    const y = Math.max(topLimit, Math.min(bottomLimit, newPan.y));
    return {x: x, y: y};
  };

  backToDamageView() {
    this.buttonEmitter.emit();
  }

  onMouseDown(event) {
    if (event.changedTouches && event.changedTouches[0]) {
      // For mobile
      this.xOfLastClick = event.changedTouches[0].pageX;
      this.yOfLastClick = event.changedTouches[0].pageY;
    } else {
    this.xOfLastClick = event.pageX;
    this.yOfLastClick = event.pageY;
    }
  }

  onMouseUp(event) {
    let previousColor;
    const children = event.path;

    let deltaX;
    let deltaY;
    if (event.changedTouches && event.changedTouches[0]) {
      // For mobile
      deltaX = Math.abs(this.xOfLastClick - event.changedTouches[0].pageX);
      deltaY = Math.abs(this.yOfLastClick - event.changedTouches[0].pageY);
    } else {
      deltaX = Math.abs(this.xOfLastClick - event.pageX);
      deltaY = Math.abs(this.yOfLastClick - event.pageY);
    }

    // Check if the mouse was dragged or its a click
    if (deltaX < 10 && deltaY < 10) {



      // ---------------------------------------- Find part that was clicked and color change ----------------------------------
      for (let i = 0; i < children.length; i++) {

        if (children[i].nodeName === 'path') {
          const style = children[i].attributes.getNamedItem('style').value;
          const parentNode = children[i].parentNode;
          let oldColor = style.split(';');

              for (let j = 0; j < oldColor.length; j++) {
                  if (oldColor[j].split(':')[0] === 'fill' && oldColor[j].split(':')[1] === '#b6f4a4') {
                      previousColor = this.colorMap.get(parentNode.attributes.getNamedItem('vpid'));
                      if (previousColor) {
                          oldColor[j] = previousColor;
                          oldColor = oldColor.join(';');
                          this.colorMap.delete(previousColor);
                          children[i].attributes.getNamedItem('style').nodeValue = oldColor;
                      }
                  } else if (oldColor[j].split(':')[0] === 'fill' && oldColor[j].split(':')[1] !== '#b6f4a4') {
                      if (oldColor[j].split(':')[1] !== '#ff5e43') {
                          this.colorMap.set(parentNode.attributes.getNamedItem('vpid'), oldColor[j]);
                      }
                      oldColor[j] = 'fill:#b6f4a4';
                      oldColor = oldColor.join(';');
                      children[i].attributes.getNamedItem('style').nodeValue = oldColor;
                  }
              }
        // ---------------------------------------- Try to open a damage pop up if the part is supported ----------------------------------

          const vpid = parentNode.attributes.getNamedItem('vpid').value;
          if (this.damageDefinitionObject[vpid]) {
            // Selected car part can have damages, open a dialog to chose the damage type and degree
            const componentList = this.damageDefinitionObject[vpid].vehicleComponentList;
            const dialogRef = this.dialog.open(DamageDialogComponent, {
              data: {componentList: componentList}
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result && result.success) {
                this.backToDamageView();
              }});
          } else {
            this.snackBar.open('Damages on this part are not supported yet.', 'OKAY', {
              duration: 2500
            });
            // Alert the user that the part is not described in our defintion
          }
        }
      }
    }
  }

  onMouseOut(event) {
    let previousColor;
    const children = event.path;

    for (let i = 0; i < children.length; i++) {

        if (children[i].nodeName === 'path') {
            const parentNode = children[i].parentNode;
            const style = children[i].attributes.getNamedItem('style').value;
            let oldColor = style.split(';');

            // ---------------------------- Restore original color ------------------------------
            for (let j = 0; j < oldColor.length; j++) {
                if (oldColor[j].split(':')[0] === 'fill' && oldColor[j].split(':')[1] !== '#b6f4a4') {
                    previousColor = this.colorMap.get(parentNode.attributes.getNamedItem('vpid'));
                    if (previousColor) {
                        oldColor[j] = previousColor;
                        oldColor = oldColor.join(';');
                        this.colorMap.delete(previousColor);
                        children[i].attributes.getNamedItem('style').nodeValue = oldColor;
                    }
                }
            }

        }
    }
  }

  onMouseOver(event) {
    const children = event.path;

    for (let i = 0; i < children.length; i++) {

      if (children[i].nodeName === 'path') {
        const parentNode = children[i].parentNode;
        const style = children[i].attributes.getNamedItem('style').value;
        let oldColor = style.split(';');


        // ---------------------------- Restore original color ------------------------------
        for (let j = 0; j < oldColor.length; j++) {
          if (oldColor[j].split(':')[0] === 'fill' && oldColor[j].split(':')[1] !== '#b6f4a4') {
            this.colorMap.set(parentNode.attributes.getNamedItem('vpid'), oldColor[j]);
            oldColor[j] = 'fill:#ff5e43';
            oldColor = oldColor.join(';');
            children[i].attributes.getNamedItem('style').nodeValue = oldColor;
          }
        }
      }
    }
  }
}