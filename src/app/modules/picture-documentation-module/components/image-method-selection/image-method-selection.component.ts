import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { ImageSelectionComponent } from '../image-selection/image-selection.component';
import { ImageTakingComponent } from '../image-taking/image-taking.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ImageModel } from '../../../../models/view.model';
import { NgxPicaService, NgxPicaResizeOptionsInterface } from '@digitalascetic/ngx-pica';
import { catchError } from 'rxjs/operators';

declare let cordova: any;
declare let navigator: any;
declare let device;
declare let Camera: any;


@Component({
    selector: 'app-image-method-selection-component',
    templateUrl: './image-method-selection.component.html',
    styleUrls: ['./image-method-selection.component.css']
})
export class ImageMethodSelectionComponent implements OnInit {

    selectedImage: ImageModel;
    selectedFile: File = null;
    images: Array<ImageModel>;
    public buttonDisable = false;
    image: ImageModel = {};
    isMobile = true;

    @ViewChild('file') file;

    constructor(private dialog: MatDialog, public dialogRef: MatDialogRef<ImageMethodSelectionComponent>, private ngxPicaService: NgxPicaService,
        @Inject(MAT_DIALOG_DATA) public data: ImageModel) {

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).catch(err => this.buttonDisable = true);
        }

    }

    ngOnInit() {

        this.images = this.getImagesFromLocalStorage();
        if (window.navigator.appVersion.toLowerCase().includes('windows')) {
            this.isMobile = false;
        }
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

    addImage() {
        this.file.nativeElement.click();
    }

    closeDialog() {
        console.log('Clicked !!!!');
        console.log(this.image);
        this.dialogRef.close(this.image);
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
            /*   console.log(e);
              const imageObj: ImageModel = {
                id: '',
                image64: '',
                name: ''
            };

            imageObj.image64 = e.target.result;
            imageObj.id = Date.now().toString();
            this.dialogRef.close(imageObj); */
        };

        ogReader.readAsDataURL(this.selectedFile);


        this.ngxPicaService.resizeImage(this.selectedFile, 640, 480, options).subscribe((resizedImage: File) => {
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
                console.log(imageObj);
                this.dialogRef.close(imageObj);
                // localStorage.setItem('images', JSON.stringify(this.images));
                // this.images = this.getImagesFromLocalStorage();
            };
            reader.readAsDataURL(resizedImage);
        });

    }

    takingImage() {
        /*        const dialogRef = this.dialog.open(ImageSelectionComponent, {

                 data: {}
               });

               dialogRef.afterClosed().subscribe(result => {
                 // TODO stuff on close
                 this.dialogRef.close(result);
                 }); */


        if (navigator !== undefined) {
            console.log(navigator);

            navigator.camera.getPicture(
                (imageUri: string) => {
                    this.image.image64 = imageUri;
                    this.image.id = Date.now().toString();
                    document.getElementById('closeButton').click();

                },
                (error: any) => {
                    console.log('Unable to obtain picture: ' + error);

                }, {
                    quality: 80,
                    destinationType: Camera.DestinationType.FILE_URI,
                    mediaType: Camera.MediaType.Picture,
                    encodingType: Camera.EncodingType.JPEG,
                    cameraDirection: Camera.Direction.BACK,
                    targetWidth: 640,
                    targetHeight: 480,
                    correctOrientation: true
                }
            );
        }
    }



    search() {
        const dialogRef = this.dialog.open(ImageTakingComponent, {
            data: {}
        });

        dialogRef.afterClosed().subscribe(result => {
            // TODO stuff on close
            console.log(result);
            this.dialogRef.close(result);

        });
    }
}