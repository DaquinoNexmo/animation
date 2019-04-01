import {Subject } from 'rxjs';
import { Injectable } from '@angular/core';


@Injectable()
export class SpinnerService {
    public loadingMessage = 'Loading...';
    public isLoading: Subject<boolean> = new Subject();

    constructor() {}
}