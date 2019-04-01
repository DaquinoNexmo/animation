import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../store';
import { BehaviorSubject } from 'rxjs';

declare var require: any;

const english = require ('../../assets/languages/english.json');
const german = require ('../../assets/languages/german.json');

@Injectable()
export class TranslationService {

    dictionary: BehaviorSubject<any>;

    constructor(private store: Store<fromStore.ModulesState>) {
        this.dictionary = new BehaviorSubject(english);

        this.store.select(fromStore.getDataElementValue('resources.language'))
            .subscribe(language => this.dictionary.next(this.getDictionary(language)));
    }

    getDictionary(language: string) {
        switch (language) {
            case ('eng'): {
                return english;
            }
            case ('deu'): {
                return german;
            }
            default: {
                return english;
            }
        }
    }
}

