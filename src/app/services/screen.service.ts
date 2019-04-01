import { Injectable, OnInit } from '@angular/core';
import * as fromStore from '../store';
import { Store } from '@ngrx/store';



@Injectable()
export class ScreenService implements OnInit {

  // Subscribe on new values from the store


  constructor(private store: Store<fromStore.ModulesState>) {
  }

  mobile$ = this.store.select(fromStore.getMobile);
  tablet$ = this.store.select(fromStore.getTablet);
  desktop$ = this.store.select(fromStore.getDesktop);


  setWindowWidth(windowWidth: number, windowHeight: number): void {
    // Send the new windowWitdth to the store
    this.store.dispatch(new fromStore.SetScreen(windowWidth, windowHeight ));
  }

  ngOnInit() {}
}