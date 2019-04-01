import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogDataService } from '../../../../services/dialogData.service';
import { Location, LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-dialog-wrapper',
  templateUrl: './dialog-wrapper.component.html',
  styleUrls: ['./dialog-wrapper.component.scss']

})

export class DialogWrapperComponent {
  browserWidth: number;
  browserHeight: number;
  backClick = false;

  constructor(public dialog: MatDialog, public router: Router, private route: ActivatedRoute, private dialogDataService: DialogDataService, private locationState: LocationStrategy, private location: Location) {

    this.browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    this.browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    this.openDialog();
  }


  openDialog(): void {
    if (this.browserWidth > 812) {
      console.log('desktop');
      this.dialogDataService.config['disableClose'] = true;
      const dialogRef = this.dialog.open(this.dialogDataService.component, this.dialogDataService.config);
      dialogRef.backdropClick().subscribe(() => {
        this.location.back();
      });

    } else {
      console.log('mobile');
      const dialogRef = this.dialog.open(this.dialogDataService.component, this.dialogDataService.config);

    }
  }
}

