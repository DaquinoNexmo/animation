import { PipeTransform, Pipe } from '@angular/core';

@Pipe({name: 'dateConversion'})
export class DateConversion implements PipeTransform {
  transform(value: string): string {
    const dateInMiliseconds = Date.parse(value);
    return (new Date(dateInMiliseconds)).toLocaleDateString();
  }
}
