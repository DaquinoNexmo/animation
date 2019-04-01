import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { ImageModel, PhotoDocuItem } from '../../../../models/view.model';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../store';
import { MatDialog } from '@angular/material';
import { ImageEditSvgComponent } from '../image-edit-svg/image-edit-svg.component';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogDataService } from '../../../../services/dialogData.service';


@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})

export class CarouselComponent implements OnInit, OnDestroy {
  slideIndex = 0;
  images: ImageModel[] = [];
  browserWidth;
  browserHeight;

  subscriptions: Subscription[] = [];

  constructor(private store: Store<fromStore.ModulesState>, private dialog: MatDialog, private route: ActivatedRoute, private router: Router, private dialogDataSevice: DialogDataService) {

    this.browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    this.browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  }

  @Input() document: PhotoDocuItem;
  @ViewChild('image') imageTag;
  width: number;
  height: number;

  // Next/previous controls
  plusSlides() {
    this.slideIndex += 1;

    if (this.slideIndex > (this.images.length - 1)) {
      this.slideIndex = 0;
    }
    this.imageTag.src = this.images[this.slideIndex].image64Edit ? this.images[this.slideIndex].image64Edit : this.images[this.slideIndex].image64;

  }

  minusSlide() {
    this.slideIndex -= 1;

    if (this.slideIndex < 0) {
      this.slideIndex = this.images.length - 1;
    }
    this.imageTag.src = this.images[this.slideIndex].image64Edit ? this.images[this.slideIndex].image64Edit : this.images[this.slideIndex].image64;
  }

  ngOnInit() {

    const sub = this.store.select(fromStore.getAllImages)
      .subscribe((result: ImageModel[]) => {

        this.images = [];
        result.forEach(image => {
          if (this.document.id && image.carouselID === this.document.id) {
            this.images.push(image);
          } else {
            if (this.document['fieldId'] === image.carouselID) {
              this.images.push(image);
            }
          }
        });
      });

    this.subscriptions.push(sub);
  }

  deleteSelectedSlide(image: ImageModel) {

    if (this.slideIndex === 0) {

    } else {
      this.slideIndex -= 1;

    }
    this.store.dispatch(new fromStore.DeleteImage(image));

    this.store.select(fromStore.getAllImagesForDataObject(this.document.id)).pipe(first()).subscribe((arr: ImageModel[]) => {
      // console.log(arr);
      if (this.document.imageCarousel && arr.length <= this.document.imageCarousel.imagesMax) {
        this.store.dispatch(new fromStore.ImageCarouselChangeEditable(this.document.id, true));
      }
    });

  }

  editSelectedImage(image: ImageModel) {

    this.dialogDataSevice.component = ImageEditSvgComponent;
    console.log(this.route);
    if (this.browserWidth > 813) {
      this.dialogDataSevice.config = { data: image };
      this.router.navigate(['./dialog'], {
        relativeTo: this.route,
      });
    } else {
      (console.log('mobile'));

      this.dialogDataSevice.config = {
        // height: '820px',
        // width: '700px',
        height: `100%`,
        width: `100%`,
        minWidth: `100%`,
        panelClass: 'dialog-container',
        data: image
      };
      this.router.navigate(['./dialog'], {
        relativeTo: this.route,

      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
