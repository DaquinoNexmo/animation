import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ImageModel } from '../../../../models/view.model';
import { Store } from '@ngrx/store';
import * as  fromStore from '../../../../store';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import * as Hammer from 'hammerjs';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { Location } from '@angular/common';

@Component({
    selector: 'app-image-edit-svg-component',
    styleUrls: ['./image-edit-svg.component.scss'],
    templateUrl: './image-edit-svg.component.html'
})

export class ImageEditSvgComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('mySvg') public svg: ElementRef;

    context;
    base64Image;
    canvas: HTMLCanvasElement;
    newArrow: SVGLineElement;
    newArrowLeftSide: SVGLineElement;
    newArrowRightSide: SVGLineElement;
    newCircle: SVGCircleElement;
    newPlane: SVGPolygonElement;
    newText: SVGTextElement;
    viewOrientation = 'portrait';
    public Height = 240;
    public Width = 320;
    newRectangleSideOne: SVGLineElement;
    newRectangleSideTwo: SVGLineElement;
    newRectangleSideThree: SVGLineElement;
    newRectangleSideFour: SVGLineElement;

    numberOfRegisteredPoitnsForPlane = 0;
    removeSpecificSnapMode = false;

    allSvgElements = [];
    browserWidth: number;
    browserHeight: number;

    oldSvgString: string;
    chosenColor = 'red';
    possibleColors = ['red', 'blue', 'yellow', 'green'];

    image: ImageModel;
    dragging = false;
    dragStartLocation; // variable for the initial click on the canvas
    dragEndLocation; // variable for the last point to be drawn
    cssFilter;  // variable for the filter applyed to the photo. Such variable is needed because we need to apply the value only at the end when we save the photo
    shape = ''; // variable used when chosing what shape you want to draw
    points = []; // array for keeping the points when drawing a plane
    textPoints = []; // array for keeping the points where to place the text input when adding a measurement upon editing a photo
    isNewImage = true; // variable used for disabling the ui elements when the photo is new
    units = ''; // variable used to hold the value of the radio button
    size = 0;   // variable used to hold the value of the input
    allowInput = false;
    allowRadio = false;

    // slider variables
    autoTicks = false;
    disabled = false;
    invert = false;
    max = 100;
    min = 1;
    showTicks = false;
    step = 1;
    value = 50;
    vertical = false;

    constructor(@Inject(MAT_DIALOG_DATA) public data: ImageModel, public dialogRef: MatDialogRef<ImageEditSvgComponent>,
        private store: Store<fromStore.ModulesState>, private logger: NGXLogger, private location: Location) {
        this.image = JSON.parse(JSON.stringify(this.data));
        this.store.select(fromStore.getAllImages).pipe(first()).subscribe((images: ImageModel[]) => {
            images.forEach((img: ImageModel) => {
                if (img.id === this.data.id) {
                    this.isNewImage = false;
                    this.image = img;
                }
            });
        });
        // this.viewOrientation = new BehaviorSubject(false);
        this.browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        this.browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }


    get tickInterval(): number | 'auto' {
        return this.showTicks ? (this.autoTicks ? 'auto' : this._tickInterval) : 0;
    }
    set tickInterval(value) {
        this._tickInterval = coerceNumberProperty(value);
    }
    private _tickInterval = 1;

    ngOnInit() {

    }

    doOnOrientationChange = () => {


            if (window.screen.width > window.screen.height) {
                this.viewOrientation = 'landscape';
                this.vertical = true;
/*                 this.Width = 640;
                this.Height = 375;
                this.ref.detectChanges(); */


            } else {
                this.viewOrientation = 'portrait';
                this.vertical = false;
                // this.ref.detectChanges();
            }

            // this.ngAfterViewInit();


    }

    ngAfterViewInit(): void {
        window.addEventListener('resize', this.doOnOrientationChange);

        if (this.browserWidth > 813) {
            this.svg.nativeElement.setAttribute('width', '640');
            this.svg.nativeElement.setAttribute('height', '480');
        }
        this.drawImage();
        this.svg.nativeElement.addEventListener('mousedown', (e) => this.dragStart(e), false);
        this.svg.nativeElement.addEventListener('mousemove', (e) => this.drag(e), false);
        this.svg.nativeElement.addEventListener('mouseup', (e) => this.dragStop(e), false);
        console.log(window.screen.availHeight, window.screen.availWidth);

        if (window.screen.availWidth < 812) {

            this.touchActive();
        }


        const svg = document.getElementById('SVG');
        const hammertime = new Hammer(svg, {inputClass: Hammer.TouchInput});
        hammertime.get('pinch').set({ enable: true });
        let posX = 0,
        posY = 0,
        scale = 1,
        last_scale = 1,
        last_posX = 0,
        last_posY = 0,
        max_pos_x = 0,
        max_pos_y = 0,
        transform = '';


        hammertime.on('doubletap pan pinch panend pinchend', function(ev) {
            if (ev.type === 'doubletap') {
                transform =
                    'translate3d(0, 0, 0) ' +
                    'scale3d(2, 2, 1) ';
                scale = 2;
                last_scale = 2;
                try {
                    if (window.getComputedStyle(svg, null).getPropertyValue('-webkit-transform').toString() !== 'matrix(1, 0, 0, 1, 0, 0)') {
                        transform =
                            'translate3d(0, 0, 0) ' +
                            'scale3d(1, 1, 1) ';
                        scale = 1;
                        last_scale = 1;
                    }
                } catch (err) {}
                svg.style.webkitTransform = transform;
                transform = '';
            }

            // pan
            if (scale !== 1) {
                posX = last_posX + ev.deltaX;
                posY = last_posY + ev.deltaY;
                max_pos_x = Math.ceil((scale - 1) * svg.clientWidth / 2);
                max_pos_y = Math.ceil((scale - 1) * svg.clientHeight / 2);
                if (posX > max_pos_x) {
                    posX = max_pos_x;
                }
                if (posX < -max_pos_x) {
                    posX = -max_pos_x;
                }
                if (posY > max_pos_y) {
                    posY = max_pos_y;
                }
                if (posY < -max_pos_y) {
                    posY = -max_pos_y;
                }
            }


            // pinch
            if (ev.type === 'pinch') {
                scale = Math.max(.999, Math.min(last_scale * (ev.scale), 4));
            }
            if (ev.type === 'pinchend') {last_scale = scale; }

            // panend
            if (ev.type === 'panend') {
                last_posX = posX < max_pos_x ? posX : max_pos_x;
                last_posY = posY < max_pos_y ? posY : max_pos_y;
            }

            if (scale !== 1) {
                transform =
                    'translate3d(' + posX + 'px,' + posY + 'px, 0) ' +
                    'scale3d(' + scale + ', ' + scale + ', 1)';
            }

            if (transform) {
                svg.style.webkitTransform = transform;
            }
        });
      }

    // adding touch functionality for drawing the svgs on a phone
    touchActive() {
        const hammerTime = new Hammer(this.svg.nativeElement, { inputClass: Hammer.TouchInput });
        hammerTime.get('pan').set({ enable: true });

        hammerTime.on('panstart', (e) => {
            this.dragStart(e.center);
        });

        hammerTime.on('panmove', (e) => {
            this.drag(e.center);
        });

        hammerTime.on('panend', (e) => {
            this.dragStop(e.center);
        });
    }

    // Loading the image as a background in the svg container
    drawImage() {
        this.base64Image = this.image.image64;

        // --------------------------------------------------
        // TODO:
        // Loads the image into a canvas and then as a background, this gets it centered
        // Probably could do it without the canvas but I already had the code
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('width', '640');
        this.canvas.setAttribute('height', '480');
        const ctx = this.canvas.getContext('2d');
        const base_image = new Image();
        base_image.src = this.base64Image;

        base_image.onload = () => {
            ctx.drawImage(base_image, this.canvas.width / 2 - base_image.width / 2, this.canvas.height / 2 - base_image.height / 2);
            this.svg.nativeElement.style.backgroundImage = `url(${this.canvas.toDataURL()})`;
            this.svg.nativeElement.style.backgroundSize = 'cover';
            if (this.image.svg && this.image.svg.length > 0) {
                this.oldSvgString = this.image.svg;
                const svgStrings = this.image.svg.split('~');

                svgStrings.forEach(svgString => {
                    const div = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    div.innerHTML = svgString;
                    const element = div.firstChild;
                    div.removeChild(element);
                    this.svg.nativeElement.appendChild(element);
                    this.allSvgElements.push(element);
                });
            }
        };
    }


    getRadioValue(event) {
        this.units = event.value;
        this.newText.innerHTML = `${this.size}${this.units}`;
        this.newText.setAttribute('fill', this.chosenColor);
        this.newText.style.font = '30px Comic Sans MS';

        const dx = this.dragStartLocation.x - this.dragEndLocation.x;
        const dy = this.dragStartLocation.y - this.dragEndLocation.y;
        const theta = Math.atan(dy / dx);
        const angle = theta * 180 / Math.PI;
        let box = this.newText.getBBox();
        const width = box.width;
        const height = box.height;

        // TODO: Talk with Timur to get a better solution
        this.newText.setAttribute('x', (this.dragStartLocation.x + (this.dragEndLocation.x - this.dragStartLocation.x) / 2 - width / 2).toString());
        this.newText.setAttribute('y', this.dragStartLocation.y + (this.dragEndLocation.y - this.dragStartLocation.y) / 2);
        box = this.newText.getBBox();
        const x = box.x;
        const y = box.y;
        this.newText.setAttribute('transform', `rotate(${angle} ${x}, ${y})` );
    }

    getInputValue(event) {
        this.size = event.target.value;
        this.allowRadio = true;
    }
    // the value for the filter comes from this.value which is the slider value
    // we get the image and the context after that and apply the filter
    // we dont save the filter to the image here so we can always have the same img reference / we do that only when we save the image at closing
    setOpacity() {

        const amount = this.value / 50;
        this.canvas = document.createElement('canvas');

        this.canvas.setAttribute('width', '640');
        this.canvas.setAttribute('height', '480');

        const ctx: any = this.canvas.getContext('2d');
        const base_image = new Image();
        base_image.src = this.base64Image;

        base_image.onload = () => {
            ctx.drawImage(base_image, this.canvas.width / 2 - base_image.width / 2, this.canvas.height / 2 - base_image.height / 2);
            ctx.filter = 'brightness(' + amount + ')';
            ctx.drawImage(this.canvas, 0, 0);

            this.svg.nativeElement.style.backgroundImage = `url(${this.canvas.toDataURL()})`;
            this.svg.nativeElement.style.backgroundSize = 'cover';
        };
        // GetComputedStyle does not work for elements that are not part of the DOMTree

        // canvas.setAttribute('style', 'filter:brightness(' + amount + '); -webkit-filter:brightness(' + amount + '); -moz-filter:brightness(' + amount + ')');
        // canvas.style.filter = 'brightness(' + amount + '); -webkit-filter:brightness(' + amount + '); -moz-filter:brightness(' + amount + ')';
        // this.cssFilter = getComputedStyle(canvas).filter;
    }

    // Saving the image and exiting the component
    saveImage() {
        const img = new Image();
        const xml = new XMLSerializer().serializeToString(this.svg.nativeElement);
        const svg64 = btoa(xml);
        const b64Start = 'data:image/svg+xml;base64,';
        const image64 = b64Start + svg64;
        img.src = image64;
        img.onload = () => {

            // this dimension for the drawImage need to be explicitly given otherwise it resizes the image
            const canvas = document.createElement('canvas');
            canvas.setAttribute('width', '640');
            canvas.setAttribute('height', '480');
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 640, 480);
            this.base64Image = canvas.toDataURL();

            if (this.isNewImage) {
                this.image.image64 = this.base64Image;
                this.image.id = Date.now().toString();
                this.image.svg = '';
                this.store.dispatch(new fromStore.SaveImage(this.image));
                this.dialogRef.close();
                this.location.back();
            } else {
                this.image.image64Edit = this.base64Image;
                let svgString = '';
                this.allSvgElements.forEach(svg => svgString += new XMLSerializer().serializeToString(svg) + '~');
                svgString = svgString.substring(0, svgString.length - 1);
                svgString = svgString.replace(/xmlns="http:\/\/www.w3.org\/2000\/svg"/g, '');
                if (!(this.oldSvgString === svgString)) {
                    // There have been changes made to the image, save them and mark it as needing to reupload the editedImage
                    if (this.image.mediaId) {
                        // If the image already has a mediaId the original has been saved on the server
                        // Set media id to null and originalImageSent to true to send only the newly edited image
                        this.image.mediaId = null;
                        this.image.originalImageSent = true;
                        this.image.editImageSent = false;
                    }
                    this.store.dispatch(new fromStore.EditImage({ editedImage: this.image, svgs: svgString }));
                }
                this.dialogRef.close();
                this.location.back();
            }
        };
    }

    // Increases the brigthness when clicking on the button at the end of the slider
    public brightnessIncrease(): void {

        if (this.value <= 98) {
            this.value += 2;
        }
        this.setOpacity();
    }

    public brightnessDecrease(): void {

        if (this.value >= 2) {
            this.value -= 2;
        }
        this.setOpacity();
    }

    // Calculates the current position on the canvas click
    getCanvasCoordinates(event) {
        const x = event.x - this.svg.nativeElement.getBoundingClientRect().left;
        const y = event.y - this.svg.nativeElement.getBoundingClientRect().top;

        return { x: x, y: y };
    }

    // Method for undoing the last step #Undo
    removeSnap() {
        this.removeSpecificSnapMode = false;
        this.numberOfRegisteredPoitnsForPlane = 0;

        if (this.allSvgElements.length === 0) {
            return;
        }

        const lastSvgElement = this.allSvgElements[this.allSvgElements.length - 1];
        while (this.allSvgElements.find(e => e.id === lastSvgElement.id)) {
            const elementToRemove = this.allSvgElements.find(e => e.id === lastSvgElement.id);
            const i = this.allSvgElements.indexOf(elementToRemove);
            this.allSvgElements.splice(i, 1);
            this.svg.nativeElement.removeChild(elementToRemove);
        }
    }

    // Method for drawing an Arrow ->
    drawLine(position) {
        this.allowInput = false;
        const headlen = 10;
        const angle = Math.atan2(position.y - this.dragStartLocation.y, position.x - this.dragStartLocation.x);

        // Update arrow position
        this.newArrow.setAttribute('x2', position.x);
        this.newArrow.setAttribute('y2', position.y);

        // Draw left and right side of the tip of the arrow
        this.newArrowLeftSide.setAttribute('x1', position.x);
        this.newArrowLeftSide.setAttribute('y1', position.y);
        this.newArrowLeftSide.setAttribute('x2', `${position.x - headlen * Math.cos(angle - Math.PI / 7)}`);
        this.newArrowLeftSide.setAttribute('y2', `${position.y - headlen * Math.sin(angle - Math.PI / 7)}`);

        this.newArrowRightSide.setAttribute('x1', position.x);
        this.newArrowRightSide.setAttribute('y1', position.y);
        this.newArrowRightSide.setAttribute('x2', `${position.x - headlen * Math.cos(angle + Math.PI / 7)}`);
        this.newArrowRightSide.setAttribute('y2', `${position.y - headlen * Math.sin(angle + Math.PI / 7)}`);
    }

    // Drawing a circle
    drawCircle(position) {
        this.allowInput = false;
        const radius = Math.sqrt(Math.pow((this.dragStartLocation.x - position.x), 2) + Math.pow((this.dragStartLocation.y - position.y), 2));
        this.newCircle.setAttribute('r', `${radius}`);
    }

    drawRectangle(position) {
        this.newRectangleSideOne.setAttribute('x2', position.x);
        this.newRectangleSideTwo.setAttribute('y2', position.y);

        this.newRectangleSideThree.setAttribute('x1', position.x);
        this.newRectangleSideThree.setAttribute('x2', position.x);
        this.newRectangleSideThree.setAttribute('y2', position.y);

        this.newRectangleSideFour.setAttribute('y1', position.y);
        this.newRectangleSideFour.setAttribute('x2', position.x);
        this.newRectangleSideFour.setAttribute('y2', position.y);
    }

    drawText(position) {
        this.allowInput = true;

        this.newArrow.setAttribute('x2', position.x);
        this.newArrow.setAttribute('y2', position.y);

        this.dragEndLocation = position;
        // ---------------------------------------------
        // Code for making perpendicular lines at the ends of the main line
        let x1 = this.dragStartLocation.y - position.y;
        let y1 = position.x - this.dragStartLocation.x;

        if (x1 !== 0 && y1 !== 0) {
            // If the start and end location are the same, a division by 0 occurs
            const endLen = 10;
            const len = endLen / Math.hypot(x1, y1);

            x1 *= len;
            y1 *= len;

            this.newArrowLeftSide.setAttribute('x1', this.dragStartLocation.x + x1);
            this.newArrowLeftSide.setAttribute('y1', this.dragStartLocation.y + y1);
            this.newArrowLeftSide.setAttribute('x2', `${this.dragStartLocation.x - x1}`);
            this.newArrowLeftSide.setAttribute('y2', `${this.dragStartLocation.y - y1}`);

            this.newArrowRightSide.setAttribute('x1', `${position.x + x1}`);
            this.newArrowRightSide.setAttribute('y1', `${position.y + y1}`);
            this.newArrowRightSide.setAttribute('x2', `${position.x - x1}`);
            this.newArrowRightSide.setAttribute('y2', `${position.y - y1}`);
        }
        // ------------------------------------------------
    }
    // method to draw the shape that was selected
    draw(position) {
        switch (this.shape) {
            case 'arrow': {
                this.drawLine(position);
                break;
            }
            case 'circle': {
                this.drawCircle(position);
                break;
            }
            case 'text': {
                this.drawText(position);
                break;
            }
            case 'rectangle': {
                this.drawRectangle(position);
                break;
            }
        }
    }

    // Method called on mouseDown event
    dragStart(event) {
        if (this.removeSpecificSnapMode === true) {
            // Remove svg element that is clicked and all elements that relate to it e.g arrow's head, text field, etc.
            if (event.path[0].localName !== 'svg') {
                while (this.allSvgElements.find(e => e.id === event.path[0].id)) {
                    let elementToRemove = this.allSvgElements.find(e => e.id === event.path[0].id);
                    if (!elementToRemove) {
                        elementToRemove = event.path[0].id;
                    }
                    const i = this.allSvgElements.indexOf(elementToRemove);
                    this.allSvgElements.splice(i, 1);
                    this.svg.nativeElement.removeChild(elementToRemove);
                }
            }
        } else {
            this.dragging = true;
            this.dragStartLocation = this.getCanvasCoordinates(event);

            switch (this.shape) {
                case 'arrow': {
                    this.newArrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    this.newArrowLeftSide = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    this.newArrowRightSide = document.createElementNS('http://www.w3.org/2000/svg', 'line');

                    const id = `${new Date().getTime()}`;
                    this.newArrow.id = id;
                    this.newArrowLeftSide.id = id;
                    this.newArrowRightSide.id = id;

                    this.newArrow.setAttribute('x1', this.dragStartLocation.x);
                    this.newArrow.setAttribute('y1', this.dragStartLocation.y);
                    this.newArrow.setAttribute('x2', this.dragStartLocation.x);
                    this.newArrow.setAttribute('y2', this.dragStartLocation.y);

                    this.newArrow.style.stroke = this.chosenColor;
                    this.newArrow.style.strokeWidth = '3';
                    this.newArrowLeftSide.style.stroke = this.chosenColor;
                    this.newArrowLeftSide.style.strokeWidth = '3';
                    this.newArrowRightSide.style.stroke = this.chosenColor;
                    this.newArrowRightSide.style.strokeWidth = '3';

                    this.svg.nativeElement.append(this.newArrow);
                    this.svg.nativeElement.append(this.newArrowLeftSide);
                    this.svg.nativeElement.append(this.newArrowRightSide);

                    this.allSvgElements.push(this.newArrow);
                    this.allSvgElements.push(this.newArrowLeftSide);
                    this.allSvgElements.push(this.newArrowRightSide);
                    break;
                }
                case 'circle': {
                    this.newCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    this.newCircle.id = `${new Date().getTime()}`;
                    this.newCircle.setAttribute('fill', 'none');
                    this.newCircle.setAttribute('stroke', this.chosenColor);
                    this.newCircle.setAttribute('stroke-width', '5');
                    this.newCircle.setAttribute('cx', this.dragStartLocation.x);
                    this.newCircle.setAttribute('cy', this.dragStartLocation.y);

                    this.svg.nativeElement.append(this.newCircle);
                    this.allSvgElements.push(this.newCircle);
                    break;
                }
                case 'rectangle': {
                    this.newRectangleSideOne = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    this.newRectangleSideTwo = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    this.newRectangleSideThree = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    this.newRectangleSideFour = document.createElementNS('http://www.w3.org/2000/svg', 'line');

                    const id = `${new Date().getTime()}`;
                    this.newRectangleSideOne.id = id;
                    this.newRectangleSideTwo.id = id;
                    this.newRectangleSideThree.id = id;
                    this.newRectangleSideFour.id = id;

                    this.newRectangleSideOne.style.stroke = this.chosenColor;
                    this.newRectangleSideOne.style.strokeWidth = '3';
                    this.newRectangleSideTwo.style.stroke = this.chosenColor;
                    this.newRectangleSideTwo.style.strokeWidth = '3';
                    this.newRectangleSideThree.style.stroke = this.chosenColor;
                    this.newRectangleSideThree.style.strokeWidth = '3';
                    this.newRectangleSideFour.style.stroke = this.chosenColor;
                    this.newRectangleSideFour.style.strokeWidth = '3';

                    this.newRectangleSideOne.setAttribute('x1', this.dragStartLocation.x);
                    this.newRectangleSideOne.setAttribute('y1', this.dragStartLocation.y);
                    this.newRectangleSideOne.setAttribute('x2', this.dragStartLocation.x);
                    this.newRectangleSideOne.setAttribute('y2', this.dragStartLocation.y);

                    this.newRectangleSideTwo.setAttribute('x1', this.dragStartLocation.x);
                    this.newRectangleSideTwo.setAttribute('y1', this.dragStartLocation.y);
                    this.newRectangleSideTwo.setAttribute('x2', this.dragStartLocation.x);
                    this.newRectangleSideTwo.setAttribute('y2', this.dragStartLocation.y);

                    this.newRectangleSideThree.setAttribute('x1', this.dragStartLocation.x);
                    this.newRectangleSideThree.setAttribute('y1', this.dragStartLocation.y);
                    this.newRectangleSideThree.setAttribute('x2', this.dragStartLocation.x);
                    this.newRectangleSideThree.setAttribute('y2', this.dragStartLocation.y);

                    this.newRectangleSideFour.setAttribute('x1', this.dragStartLocation.x);
                    this.newRectangleSideFour.setAttribute('y1', this.dragStartLocation.y);
                    this.newRectangleSideFour.setAttribute('x2', this.dragStartLocation.x);
                    this.newRectangleSideFour.setAttribute('y2', this.dragStartLocation.y);

                    this.svg.nativeElement.append(this.newRectangleSideOne);
                    this.svg.nativeElement.append(this.newRectangleSideTwo);
                    this.svg.nativeElement.append(this.newRectangleSideThree);
                    this.svg.nativeElement.append(this.newRectangleSideFour);

                    this.allSvgElements.push(this.newRectangleSideOne);
                    this.allSvgElements.push(this.newRectangleSideTwo);
                    this.allSvgElements.push(this.newRectangleSideThree);
                    this.allSvgElements.push(this.newRectangleSideFour);
                    break;
                }
                case 'plane': {
                    this.dragging = false;

                    if (this.numberOfRegisteredPoitnsForPlane === 0) {
                        this.newPlane = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                        this.newPlane.id = `${new Date().getTime()}`;
                        this.newPlane.setAttribute('fill', this.chosenColor);
                        this.newPlane.setAttribute('stroke', 'black');
                        this.newPlane.setAttribute('stroke-width', '2');
                        this.newPlane.setAttribute('points', this.dragStartLocation.x + ',' + this.dragStartLocation.y + ' ');
                        this.svg.nativeElement.append(this.newPlane);
                        this.allSvgElements.push(this.newPlane);
                    } else {
                        this.newPlane.setAttribute('points', this.newPlane.getAttribute('points') + this.dragStartLocation.x + ',' + this.dragStartLocation.y + ' ');
                    }
                    this.numberOfRegisteredPoitnsForPlane++;

                    if (this.numberOfRegisteredPoitnsForPlane === 4) {
                        this.numberOfRegisteredPoitnsForPlane = 0;
                    }
                    break;
                }
                case 'text': {
                    this.newArrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    this.newArrowLeftSide = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    this.newArrowRightSide = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    this.newText = document.createElementNS('http://www.w3.org/2000/svg', 'text');

                    const id = `${new Date().getTime()}`;
                    this.newArrow.id = id;
                    this.newArrowLeftSide.id = id;
                    this.newArrowRightSide.id = id;
                    this.newText.id = id;

                    this.newArrow.setAttribute('x1', this.dragStartLocation.x);
                    this.newArrow.setAttribute('y1', this.dragStartLocation.y);
                    this.newArrow.setAttribute('x2', this.dragStartLocation.x);
                    this.newArrow.setAttribute('y2', this.dragStartLocation.y);

                    this.newArrow.style.stroke = this.chosenColor;
                    this.newArrow.style.strokeWidth = '4';
                    this.newArrowLeftSide.style.stroke = this.chosenColor;
                    this.newArrowLeftSide.style.strokeWidth = '4';
                    this.newArrowRightSide.style.stroke = this.chosenColor;
                    this.newArrowRightSide.style.strokeWidth = '4';

                    this.svg.nativeElement.append(this.newArrow);
                    this.svg.nativeElement.append(this.newArrowLeftSide);
                    this.svg.nativeElement.append(this.newArrowRightSide);
                    this.svg.nativeElement.append(this.newText);

                    this.allSvgElements.push(this.newArrow);
                    this.allSvgElements.push(this.newArrowLeftSide);
                    this.allSvgElements.push(this.newArrowRightSide);
                    this.allSvgElements.push(this.newText);
                    break;
                }
            }
        }
    }

    changeColor() {
        const index = this.possibleColors.indexOf(this.chosenColor);
        this.chosenColor =  this.possibleColors[index + 1] ? this.possibleColors[index + 1] : this.possibleColors[0];
    }

    removeSpecificSnap() {
        this.removeSpecificSnapMode = true;
    }

    // Method called on mouseMove event
    drag(event) {
        if (this.removeSpecificSnapMode !== true) {

            let position;
            if (this.dragging === true) {
                position = this.getCanvasCoordinates(event);
                this.draw(position);
            }
        }
    }

    // Method called on mouseUp event
    dragStop(event) {
        if (this.removeSpecificSnapMode !== true) {

            this.dragging = false;
            const position = this.getCanvasCoordinates(event);
            this.dragEndLocation = position;
            this.draw(position);
            if (this.shape === 'text') {
                document.getElementById('textInput').focus();
            }
        }
    }

    // Setting the shape upon clicking on one of the buttons
    setShape(shape: string) {
        this.removeSpecificSnapMode = false;
        this.shape = shape;
    }

    ngOnDestroy() {
    }
}