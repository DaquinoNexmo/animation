import { DataSource } from '@angular/cdk/collections';
import { of, Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSort } from '@angular/material';
import { DataModel } from '../../../../models/view.model';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../store';

export class CustomDataSource extends DataSource<any> {

    sortDirection: string;
    sortProperty: string;
    itemsPerPage: number;
    startIndex: number;
    totalCount: number;
    data: any[] = [];

    constructor(private sort: MatSort,
         private store: Store<fromStore.ModulesState>,
         private moduleName: string) {
        super();
        this.moduleName = moduleName;
        this.store.select(fromStore.getObjectPropertyInStructure(moduleName + '.' + moduleName + '.tableItems'))
            .subscribe(element => this.data = element);

        // TODO not sure if all of these are necessery
        // Pretty sure at least index and itemsperpage can go away
        this.store.select(fromStore.getDataElementValue(moduleName + '.' + moduleName + '.sortProperty'))
            .subscribe(value => this.sortProperty = value);
        this.store.select(fromStore.getDataElementValue(moduleName + '.' + moduleName + '.sortDirection'))
            .subscribe(value => this.sortDirection = value);
        this.store.select(fromStore.getDataElementValue(moduleName + '.' + moduleName + '.itemsPerPage'))
            .subscribe(value => this.itemsPerPage = value);
        this.store.select(fromStore.getDataElementValue(moduleName + '.' + moduleName + '.startIndex'))
            .subscribe(value => this.startIndex = value);
        this.store.select(fromStore.getDataElementValue(moduleName + '.' + moduleName + '.totalCount'))
            .subscribe(value => this.totalCount = value);

    }

    connect(): Observable<any[]> {
        // Combine everything that affects the rendered data into one update
        // stream for the data-table to consume.
        const dataMutations = [
            of(this.data),
            this.store.select(fromStore.getObjectPropertyInStructure(this.moduleName + '.' + this.moduleName + '.tableItems')),
            this.sort.sortChange
        ];

        return merge(...dataMutations).pipe(map(() => {
            this.checkForSortingChange();
            return [...this.data];
        }));
    }

    getNextPages() {
        const dataMap: Map<string, DataModel> = new Map();
        const itemsPerPageId = this.moduleName + '.' + this.moduleName + '.itemsPerPage';
        const startIndexId = this.moduleName + '.' + this.moduleName + '.startIndex';

        dataMap.set(itemsPerPageId, {
            fieldId: itemsPerPageId,
            value: this.itemsPerPage,
            serverOperation: null
        });
        dataMap.set(startIndexId, {
            fieldId: startIndexId,
            value: this.startIndex,
            serverOperation: null
        });
        this.store.dispatch(new fromStore.SetData( {nameOfModule: this.moduleName, data: dataMap}));
    }


    checkForSortingChange() {
        // check if this was triggered by sorting and fire a new request to the database
        // the function will also trigger when data arrives from the back end, don't do anything in that case
        const dataMap: Map<string, DataModel> = new Map();
        const sortPropertyId = this.moduleName + '.' + this.moduleName + '.sortProperty';
        const sortDirectionId = this.moduleName + '.' + this.moduleName + '.sortDirection';

        if (this.sort.active && this.sort.direction !== '' && // no direction or property chosen or it is the same as last time
            ((this.sort.direction.toUpperCase() !== this.sortDirection) || (this.sort.active !== this.sortProperty)) ) {

            dataMap.set(sortDirectionId, {
                fieldId: sortDirectionId,
                value: this.sort.direction.toUpperCase(),
                serverOperation: null
            });
            dataMap.set(sortPropertyId, {
                fieldId: sortPropertyId,
                value: this.sort.active,
                serverOperation: null
            });
            this.store.dispatch(new fromStore.SetData( {nameOfModule: this.moduleName, data: dataMap}));
        }
    }

    /**
     * Called when the table is being destroyed. Use this function, to clean up
     * any open connections or free any held resources that were set up during connect.
     */
    disconnect() {}
}