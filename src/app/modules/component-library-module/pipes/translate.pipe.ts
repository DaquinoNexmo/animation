import { PipeTransform, Pipe } from '@angular/core';
import { TranslationService } from '../../../services/translation.service';

@Pipe({
    name: 'Translate',
    pure: false
})
export class Translate implements PipeTransform {

    private dictionary: any;

    constructor (private translationService: TranslationService) {
        this.translationService.dictionary.subscribe(dictionary => this.dictionary = dictionary);
    }

    transform(value: string): string {

        if (value === null) {
            return;
        }

        let parts = value.split(' ');
        parts = parts.map(part => {
            if (this.dictionary[part] !== undefined && this.dictionary[part] !== '') {
                return this.dictionary[part];
            } else {
                return part;
            }
        });
        return parts.join(' ');
    }
}