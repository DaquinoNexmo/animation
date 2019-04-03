import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate, stagger,state, group, query, animateChild} from '@angular/animations';
import { fade } from '../animations';


@Component({
  selector: 'app-damagelist',
  templateUrl: './damagelist.component.html',
  styleUrls: ['./damagelist.component.scss'],
  animations: [
    trigger('animationSwipe', [
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
    ]),

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

//

    trigger('delete', [
      state('state1',style({
        //transform: 'translateX(-100px)'
      })),
      state('state2', style({
        transform: 'translateX(0px)'
      })),

      transition('void => *', [ //this can be 'state1 => void' based on how we will delete this of the node
       
          //query(':self', [stagger(100, [animate('0.5s', style({ opacity: 1, transform: 'translateY(-90px)' }))])]),

          query(':self', [
            style({ opacity: 0, transform: 'translateY(-90px)' }),
            stagger(1000, [
              animate('0.5s', style({ opacity: 1, transform: 'translateY(0px)' }))
            ])
          ])
          
          // query(':self', style({ transform: 'translateY(-200px)', opacity: 0})),
          // query(':self', animate('900ms', style({ transform: 'translateY(0)', opacity: 1}))),
        
      ]),

      transition('* => state1', [
          query('.yellow-confirmation', style({ transform: 'translateY(-20px)', opacity: 0})),
          query('.yellow-confirmation', animate('900ms', style({ transform: 'translateY(0)', opacity: 1}))),
      ]),
      transition('state1 => state2', [ //this can be 'state1 => void' based on how we will delete this of the node
        group([
          query(':self', style({ transform: 'translateY(0px)', opacity: 1})),
          query(':self', animate('900ms', style({ transform: 'translateY(-200px)', opacity: 0}))),
        ]),
      ]),
    ]),
  ]
})


export class DamagelistComponent implements OnInit {

  
  reparedAnim = false;
  noReparedAnim = false;
  itemDeleted = "";
  SwipeValue = "";
  constructor() { }

  items = [
    { reparedAnim: false, noReparedAnim: false, itemDeleted: "", isRepared: false, isNoRepared: true} , 
    { reparedAnim: false, noReparedAnim: false, itemDeleted: "", isRepared: true, isNoRepared: false} , 
    { reparedAnim: false, noReparedAnim: false, itemDeleted: "", isRepared: false, isNoRepared: false} , 
    { reparedAnim: false, noReparedAnim: false, itemDeleted: "", isRepared: true, isNoRepared: false} , 
    { reparedAnim: false, noReparedAnim: false, itemDeleted: "", isRepared: false, isNoRepared: false} , 
    { reparedAnim: false, noReparedAnim: false, itemDeleted: "", isRepared: true, isNoRepared: false} , 
  ];
  
  ngOnInit() {

    let obj1 = { id: "Thomaz"};
    let obj2 = {id: "Ivan"};
    obj1 = obj2;
    console.log(obj1, obj2);
    obj2.id= "Petar";
    console.log(obj1, obj2);
  }


  

  changeState(state: any) {
    this.SwipeValue = state;
    console.log(this.SwipeValue);
  }
     

 
  reparedIconClick(i) {
    if(!this.items[i].isRepared) { // only animate and change the value of isNoRepared if the button is not pressed
      this.items[i].reparedAnim = true; // start the animation
      this.items[i].isNoRepared = false; // remove the red button isNoRepared
    }
    this.items[i].isRepared = !this.items[i].isRepared; // invert the value of button on pressed (Green one)
    

    setTimeout(() => {
      this.items[i].reparedAnim = false; // remove the confirmation element and start second part of animation
    }, 1500);
  }

  NoReparedIconClick(i) {
    if(!this.items[i].isNoRepared) { // only animate and change the value of isNoRepared if the button is not pressed
      this.items[i].noReparedAnim = true; // start the animation
      this.items[i].isRepared = false // remove the red green isRepared
    }
    this.items[i].isNoRepared = !this.items[i].isNoRepared; // invert the value of button on pressed (red one)

    setTimeout(() => {
      this.items[i].noReparedAnim = false;  // remove the confirmation element and start second part of animation
    }, 1500);
  }

  deletItem(i){
    console.log("Value before = ", this.items[i].itemDeleted);
    //this.SwipeValue = "state2";
    this.items[i].itemDeleted = "state1";
    console.log("Value after = ", this.items[i].itemDeleted)
    setTimeout(() => {
      this.items[i].itemDeleted = "state2";
      for (let index = i + 1; index < this.items.length; index++) {
        this.items[index].itemDeleted = "state1";
      }
    }, 1200);

    setTimeout(() => {
      this.items.splice(i, 1);
    }, 2100);


  }
  

  function() {
    document.addEventListener
  }

 


}
