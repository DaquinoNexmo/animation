import { Component, OnInit, ViewChild, Input, Inject, Output, EventEmitter } from '@angular/core';
import { MatSort } from '@angular/material';
import { CustomDataSource } from './custom-datasource';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../store';
import { Pipe, PipeTransform } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { first } from 'rxjs/operators';
import { FunctionalityService } from '../../../../services/functionality.service';
import { WindowService } from '../../../../services/window.service';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @Output() selectedRowEmitter = new EventEmitter<any>();

  dataSource: CustomDataSource;

  displayedColumns = [];
  extraInfoProperties = [];
  filters = [];

  @Input() moduleName: string;

  constructor(private store: Store<fromStore.ModulesState>, public dialog: MatDialog,
              private funcService: FunctionalityService, private windowService: WindowService) {}

  ngOnInit() {
    console.log(this.windowService.windowRef.window.screen.availHeight, this.windowService.windowRef.screen.availWidth);
    this.dataSource = new CustomDataSource(this.sort, this.store, this.moduleName);
    this.store.select(fromStore.getObjectPropertyInStructure(this.moduleName + '.' + this.moduleName + '.listItems'))
      .pipe(first()).subscribe(listItems => listItems.forEach(item => this.displayedColumns.push(item.propertyName)));

    this.store.select(fromStore.getObjectPropertyInStructure(this.moduleName + '.' + this.moduleName + '.infoItems'))
      .pipe(first()).subscribe(infoItems => {
        if (infoItems) {
          infoItems.forEach(item => this.extraInfoProperties.push(item.propertyName));
        }
      });

    this.store.select(fromStore.getObjectPropertyInStructure(this.moduleName + '.' + this.moduleName + '.filters'))
      .pipe(first()).subscribe(filters => {
        if (filters) {
          filters.forEach(filter => this.filters.push(filter));
        }
      });
  }

  selectedRow(row) {
    this.selectedRowEmitter.emit([row]);
  }

  refresh(): void {
    this.funcService.dynamicStrings.sendManualRequest(this.moduleName + '.' + this.moduleName + '.tableItems');
  }

  goBackwards(): void {
    const currentIndex = this.dataSource.startIndex;
    if (this.dataSource.startIndex < this.dataSource.itemsPerPage) {
      this.dataSource.startIndex = 0;
    } else {
      this.dataSource.startIndex -= this.dataSource.itemsPerPage;
    }

    if (currentIndex === this.dataSource.startIndex) {
      return;
    }
    this.dataSource.getNextPages();
  }

  goForwards(): void {
    const currentIndex = this.dataSource.startIndex;

    if (this.dataSource.startIndex +  this.dataSource.itemsPerPage > this.dataSource.totalCount) {
      return; // no more data in backend
    }
    this.dataSource.startIndex += this.dataSource.itemsPerPage;
    this.dataSource.getNextPages();
  }

  popup(event: Event, row): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(InspectionDialogComponent, {
       data: {row: row, extraInfo: this.extraInfoProperties}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
 }
}

@Component({
  selector: 'app-dialog',
  templateUrl: './app-dialog.html',
})
export class InspectionDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<InspectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}