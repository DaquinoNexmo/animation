import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ModulesState } from '../store';
import { Store } from '@ngrx/store';
import { tap, map } from 'rxjs/operators';


@Injectable()
export class DataLoadingService {

    constructor( private http: HttpClient, private store: Store<ModulesState>) { }

    getAppStructure(): Observable<any> {
        return this.http.get<any>( './assets/db/db_new.json' ).pipe(
            map(result => result.appStructure)
        );
    }

    getDataFromUrl(url: string): Observable<any> {
        return this.http.get<any>(url);
    }

    getDataFromUrlAsText(url: string): Observable<any> {
        return this.http.get(url, {responseType: 'text'});
    }

    getPictureFromUrl(url: string): Observable<any> {
        return this.http.get(url, {responseType: 'arraybuffer'})
            .pipe(
                map(arraybuffer =>
                    btoa(new Uint8Array(arraybuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))
                )
            );
    }

    postInspectionData(url: string, data: any) {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const file = new File([blob], 'FileName.json');
        const formData = new FormData();
        formData.append('mcInspection', file);
        return this.http.post<any>(url, formData).pipe(tap(x => console.log(x)));
    }

    postPicture(url: string, data: any) {
        console.log('Sending request to ' + url);
        return this.http.post<any>(url, data).pipe(tap(x => console.log(x)));
    }
}
