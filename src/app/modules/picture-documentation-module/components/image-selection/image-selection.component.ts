import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ImageModel } from '.././../../../models/view.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import * as  fromStore from '../../../../store';
import { NgxPicaService, NgxPicaResizeOptionsInterface } from '@digitalascetic/ngx-pica';



// Paste in console to find the current size of localStorage;
// var t = 0; for(var x in localStorage){ t += (((localStorage[x].length * 2))); } console.log(t/1024+ " KB");


@Component({
    selector: 'app-image-selector-component',
    templateUrl: './image-selection.component.html',
    styleUrls: ['./image-selection.component.css']
})

export class ImageSelectionComponent implements OnInit {

    constructor(@Inject(MAT_DIALOG_DATA) public data: ImageModel, public dialogRef: MatDialogRef<ImageSelectionComponent>,
        private store: Store<fromStore.ModulesState>, private ngxPicaService: NgxPicaService) { }

    selectedFile: File = null;
    images: Array<ImageModel>;


    ngOnInit() {
        this.images = this.getImagesFromLocalStorage();

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

    onFileSelected(event) {
        // console.log(event);
        this.selectedFile = <File>event.target.files[0];
        // console.log(this.selectedFile);
        const options: NgxPicaResizeOptionsInterface = {
            aspectRatio: {
                keepAspectRatio: true,
                forceMinDimensions: true
            },

        };
        const ogReader = new FileReader();
        ogReader.onload = (e: any) => {

        };
        // ogReader.readAsDataURL(this.selectedFile);

        this.ngxPicaService.resizeImage(this.selectedFile, 640, 480 , options).subscribe((resizedImage: File) => {
            // console.log(resizedImage);
            // console.log('SUBSCRIBE');
            const reader = new FileReader();
            reader.onload = (e: any) => {
                console.log(e);
                const result = e.target.result;
                // result.replace(/^data:image\/(png|jpg);base64,/, '');
                // this.images = this.getImagesFromLocalStorage();
                if (!this.images) {
                    this.images = [];
                }
                // console.log(this.selectedFile);
                const imageObj: ImageModel = {
                    id: '',
                    image64: '',
                    name: ''
                };
                imageObj.image64 = result;
                imageObj.name = this.selectedFile.name;
                imageObj.id = Date.now().toString();
                // this.images.push(this.imageObj);
                this.data = imageObj;
                // this.store.dispatch(new fromStore.SaveImage(imageObj));
                this.dialogRef.close(imageObj);
                // localStorage.setItem('images', JSON.stringify(this.images));
                // this.images = this.getImagesFromLocalStorage();
            };
            reader.readAsDataURL(resizedImage);
        });

    }
}
