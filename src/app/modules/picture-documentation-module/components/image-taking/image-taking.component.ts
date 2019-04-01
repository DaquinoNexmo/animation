import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as  fromStore from '../../../../store';
import { ImageModel } from '.././../../../models/view.model';
import { catchError } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';


@Component({
    selector: 'app-image-taking-component',
    templateUrl: './image-taking.component.html',
    styleUrls: ['./image-taking.component.css']
})

export class ImageTakingComponent implements OnInit, AfterViewInit {

    imageObj: ImageModel = {
        id: '',
        image64: '',
        name: ''
    };
    captures: Array<any> = [];
    images: Array<ImageModel>;

    @ViewChild('video')
    public video: ElementRef;
    @ViewChild('canvas')
    public canvas: ElementRef;

    constructor(@Inject(MAT_DIALOG_DATA) public data: ImageModel, public dialogRef: MatDialogRef<ImageTakingComponent>,
        private store: Store<fromStore.ModulesState>) {
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                this.video.nativeElement.srcObject = stream;
                this.video.nativeElement.play();
            })
                .catch(error => console.log('Could not access video', error));
        }
    }


    capture() {
        const context = this.canvas.nativeElement.getContext('2d').drawImage(this.video.nativeElement, 0, 0, 640, 480);
        this.captures.push(this.canvas.nativeElement.toDataURL('image/png'));
        const track = this.video.nativeElement.srcObject.getTracks()[0];
        track.stop();
    }

    savePhoto(image: any) {

        this.images = this.getImagesFromLocalStorage();
        if (!this.images) {
            this.images = [];
        }

        this.imageObj.image64 = image;
        this.imageObj.name = '';
        this.imageObj.id = Date.now().toString();
        this.data = this.imageObj;
        this.dialogRef.close(this.data);
        this.images.push(this.imageObj);
        // localStorage.setItem('images', JSON.stringify(this.images));
        // this.images = this.getImagesFromLocalStorage();

    }

    deletePhoto(image: string) {

        // this.images = this.getImagesFromLocalStorage();
        // this.images = this.images.filter(img => img.image64 !== image);
        // localStorage.setItem('images', JSON.stringify(this.images));
        this.captures = this.captures.filter(c => c !== image);
    }

    getImagesFromLocalStorage() {
        try {
            const localImages = localStorage.getItem('images');
            if (localImages === null) {
                return undefined;
            } else {
                return JSON.parse(localImages);

            }
        } catch (err) {
            catchError(err);
            return undefined;
        }
    }

}
