import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate, stagger,state, group, query, animateChild} from '@angular/animations';
import { fade } from '../animations';


@Component({
  selector: 'app-damagelist',
  templateUrl: './damagelist.component.html',
  styleUrls: ['./damagelist.component.scss'],
  animations: [
    trigger('animationRun', [

      state('state1',style({
        transform: 'translateX(-100px)'
      })),

      state('state2', style({
        transform: 'translateX(0px)'
      })),
      
      transition('*=>*', [
        group([
          query('@theChildAnimation', animateChild()),
          query('@arrowPath', animateChild()),
          animate('300ms'),
        ]),
      ]),
      // transition('*=>state2', [
      //   group([
      //     query('@theChildAnimation', animateChild()),
      //     query('@arrowPath', animateChild()),
      //     animate('300ms'),
      //   ]),
      // ]),
    ]),

    // Chield trigger

    trigger( 'theChildAnimation', [
      state('state1',style({
        transform: 'rotate(-180deg)'
      })),

      state('state2', style({
        transform: 'rotate(0deg)'
      })),
      
      transition( '* <=> *', [
        animate( '0.9s cubic-bezier(0.55, 0.31, 0.15, 0.93)' ),
      ] ),
    ]),

    // arrow trigger 

    trigger( 'arrowPath', [
      state('state1',style({
        fill: 'rgba(255, 0, 0, 0.5)'
      })),

      state('state2', style({
        fill: '#d6d9de'
      })),
      
      transition( '* <=> *', [
        animate( '0.9s cubic-bezier(0.55, 0.31, 0.15, 0.93)' ),
      ] ),
    ]),


    trigger('fade', [
      transition('void => *', [
        style({opacity: 0, transform: "translateY(-20px)"}),
        animate('1s cubic-bezier(0.15, 0.31, 0.55, 0.93)', style({opacity: 1, transform: "translateY(0px)" }))
      ]),
      transition('* => void', [
        style({opacity: 1, transform: "translateY(0px)"}),
        animate(1000, style({opacity: 0, transform: "translateY(-20px)" }))
      ])
    ]),

    trigger('delete', [
      
      transition(':enter', [
        query('#Group_2386', style({ opacity: 1, transform: 'translateX(-800px)'})),
        query('#Group_2386',
          //stagger('2000ms',[
              animate('400ms ease-out', style({ opacity: 0, transform: 'translateX(10px)'}))
            //])
            )
          ])
    ])
  ]
})
// transition('*=>state2', [
      //   group([
      //     query('@theChildAnimation', animateChild()),
      //     query('@arrowPath', animateChild()),
      //     animate('300ms'),
      //   ]),
      // ]),

export class DamagelistComponent implements OnInit {
  
  reparedAnim = false;
  noReparedAnim = false;
  itemDeleted = false;
  test = "";
  constructor() { }

  ngOnInit() {
  }


  

  changeState(state: any) {
    this.test = state;
    console.log(this.test);
  }
     

 
  togleReparedAnim() {
    this.reparedAnim = true;
    document.querySelector('.square-icon-repared').classList.add('square-icon-repared-on');
		document.querySelector('.square-icon-no-repared').classList.remove('square-icon-no-repared-on');

    setTimeout(() => {
      this.reparedAnim = false;
    }, 1500);
  }

  togleNoReparedAnim() {
    this.noReparedAnim = true;
    document.querySelector('.square-icon-no-repared').classList.add('square-icon-no-repared-on');
		document.querySelector('.square-icon-repared').classList.remove('square-icon-repared-on');

    setTimeout(() => {
      this.noReparedAnim = false;
    }, 1500);
  }  
}
