import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, Observable, fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, startWith, tap } from 'rxjs/operators';
import { SpinnerService } from './services/spinner.service';
import { ScreenService } from './services/screen.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy {

  public loading = false;
  private subscriptions: Subscription[] = [];
  private _resize$: Observable<any>;



  constructor(private spinner: NgxSpinnerService, public spinnerService: SpinnerService, private cdRef: ChangeDetectorRef, private screenService: ScreenService) { }

  ngOnInit() {
    this._resize$ = fromEvent(window, 'resize')
    .pipe(
      debounceTime(200),
      map(() => window.innerWidth), // Don't use mapTo!
      distinctUntilChanged(),
      startWith(window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth),
      tap(width => this.screenService.setWindowWidth(width, window.innerHeight)),
    );
  this._resize$.subscribe();


  this.subscriptions.push(
    this.spinnerService.isLoading.subscribe(isLoading => {
      if (isLoading) {
        this.spinner.show();
      } else {
        this.spinner.hide();
      }
      this.cdRef.detectChanges();
    })
  );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
