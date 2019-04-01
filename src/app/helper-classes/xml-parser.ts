import * as xml2json from 'xml-js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export function jsonParser(jsonObj) {
    // After parsing, the json has properties like '_attributes' and '_text' which are not expected in the program
    // This function recursivly finds them and replaces them with the expected properties' structure

    if (Array.isArray(jsonObj)) {
        jsonObj.forEach( obj => jsonParser(obj));
        return;
    }
    const properties = Object.keys(jsonObj);
    for (const property of properties) {
        if (property === '_attributes') {
            const attributeProperties = Object.keys(jsonObj[property]);
            for (const attributeProperty of attributeProperties) {
                jsonObj[attributeProperty] = jsonObj[property][attributeProperty];
                delete jsonObj[property][attributeProperty];
            }
            delete jsonObj[property];

        } else if (property === '_text') {
            jsonObj.text = jsonObj[property];
            delete jsonObj[property];

        } else if (property === 'comboBox') {
            if (!jsonObj[property].dataProvider && jsonObj[property].option && Array.isArray(jsonObj[property].option)) {
                const nameOfOption = jsonObj[property]._attributes.friendlyNameField;
                jsonObj[property].option = jsonObj[property].option.map(option => option[nameOfOption]._text);
                jsonObj.options = jsonObj[property].option;
                // TODO: REMOVE HACK
                continue;
            }
            if (!jsonObj[property].dataProvider) {
                jsonObj.displayname = jsonObj[property]._attributes.friendlyNameField;
                if (jsonObj.displayname === 'friendlyName') {
                    jsonObj.displayname = 'friendlyname';
                }
                continue;
            }
            jsonObj.optionsurl = jsonObj[property].dataProvider._text;
            jsonObj.displayname = jsonObj[property]._attributes.friendlyNameField;
            delete jsonObj[property];
        } else if (Object.keys(jsonObj[property]).length === 1 && jsonObj[property]._text) {
            // Object only has _text as a property, remove _text and put the value in the object itself
            jsonObj[property] = jsonObj[property]._text;
            delete jsonObj[property]._text;
        } else {
            jsonParser(jsonObj[property]);
        }
    }
}

export class MyXMLparser {
    constructor(private http: HttpClient) {}

    findXMLforProcessDefinition(url: string): Observable<any> {
        // console.log(url);
                        // TODO: Fix hardcoded url
        // return this.http.get('./assets/my_S_VWV_TUV_v2.9.xml', { responseType: 'text'})
        return this.http.get('https://nexmo.damagecloud.de/mobileClient/processDefinitions/AP_STANDARDRENT_v1.9.xml', { responseType: 'text'})
        // return this.http.get('https://nexmo.damagecloud.de/mobileClient/processDefinitions/RP_STANDARDRENT_v1.5.xml', { responseType: 'text'})
                .pipe(
                    map(data => {
                        const options = {compact: true, ignoreDeclaration: true, ignoreComment: true};
                        const jsonObj = xml2json.xml2json(data, options);
                        const obj = JSON.parse(jsonObj);
                        jsonParser(obj);
                        return obj;
                    })
                );
    }
}
