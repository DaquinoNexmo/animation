import { Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../../../store';
import { FunctionalityService } from '../../../../services/functionality.service';
import { Module, PhotoDataModel, DataModel } from '../../../../models/view.model';
import { first } from 'rxjs/operators';
import * as Hammer from 'hammerjs';
import { SpinnerService } from '../../../../services/spinner.service';
import { DamageViewModule } from '../damage-view/damage-view.component';

@Component({
  selector: 'app-view-dynamic-fields',
  templateUrl: './view-dynamic-fields.component.html',
  styleUrls: ['./view-dynamic-fields.component.scss']
})

export class ViewDynamicFieldsComponent implements OnInit, AfterViewInit {
  modules: Module[];
  moduleName = 'dynamicFields';
  defaultView = 'technicalView';
  @ViewChild('handle') divWrapper;

  numberOfTabs = 0;
  selected = 0;

  initializedModules = [];

  constructor(
    private store: Store<fromStore.ModulesState>,
    private funcService: FunctionalityService,
    private spinnerService: SpinnerService
  ) {}

  ngOnInit() {
    this.spinnerService.isLoading.next(false);
    this.store.select(fromStore.getData).pipe(first()).subscribe(modules => {
        this.modules = modules.filter(m => m.name !== 'damageCreatorSVG' && m.structure.tags.includes('processModule'));

        // TODO: Change in case not all processModules are being displayed
        this.tabChanged({index: 0});
        this.numberOfTabs = modules.length;

        // TODO: Check for initDMGModule && initDocumentationModule var in localstorage
        const damageViewModule = this.modules.find(m => m.name === 'damageView');
        if (damageViewModule && localStorage.getItem('initDamageView') !== 'true') {
          // localStorage.setItem('initDamageView', 'true');

          const damages = damageViewModule.data.filter(d => d['damage']);
          damages.forEach((damage: any) => {
            const carouselId = damage.damage.find((element: DataModel) => element.fieldId === 'carouselId');
            const id = carouselId.value;
            const images = damage.damage.filter((element: DataModel) => element.fieldId === 'image');

            images.forEach(image => {
              if (image.value.url === '$DUMMY$') { return; }
              this.store.dispatch(new fromStore.DownloadImage({
                url: image.value.url,
                carouselId: id,
                imageId: image.value.internalId,
                mediaId: image.value.mediaId,
                svg: image.value.drawData
              }));
            });

            this.store.select(fromStore.getSelectedImageDataObject(id)).pipe(first()).subscribe(dataElem => {

                if (!dataElem) {
                    // Create carousel object if it doesn't already exist
                    const dataElement: PhotoDataModel = { value: {} };
                    dataElement.value.imageCarousel = [];
                    dataElement.fieldId = id;
                    this.store.dispatch(new fromStore.SaveImageDataObject(dataElement));
                }
            });
          });
        }
    });
  }


  ngAfterViewInit(): void {
    const matTabHeader = this.divWrapper.nativeElement.children[0].children[0];

    const hammerTime = new Hammer(matTabHeader, {inputClass: Hammer.TouchInput});
    hammerTime.get('pinch').set({ enable: true});

    hammerTime.on('swipeleft', (event) => {
      if (this.selected === this.numberOfTabs) {
        return;
      }
      this.selected++;
      console.log('SWIPE LEFT');
      console.log(this.selected);

    });

    hammerTime.on('swiperight', (event) => {
      if (this.selected === 0) {
        return;
      }
      this.selected--;
      console.log('SWIPE RIGHT');
      console.log(this.selected);

    });
  }


  prettifyName(name: string) {
    // TODO make a pipe, or remove and use labels ...
    const names = name.split(/(?=[A-Z])/);
    names[0] = names[0][0].toUpperCase() + names[0].substring(1);
    return names.join(' ');
  }

  tabChanged(event) {
    // TODO: Change this when some modules are not being displayed, wrong index will be accessed
    const indexOfModule = event.index;

    // Module has already been parsed for dynamic strings
    if (this.initializedModules.includes(indexOfModule)) {
      return;
    }
    this.funcService.dynamicStrings.parseModulesForDynamicStrings([this.modules[indexOfModule]]);
    this.initializedModules.push(indexOfModule);
  }
}
