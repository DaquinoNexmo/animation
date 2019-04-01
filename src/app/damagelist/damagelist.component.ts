import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate, state} from '@angular/animations';
import { fade } from '../animations';


@Component({
  selector: 'app-damagelist',
  templateUrl: './damagelist.component.html',
  styleUrls: ['./damagelist.component.scss'],
  animations:[
    trigger('animationRun', [
      state('1', style({
        height: '200px',
        opacity: 1,
        backgroundColor: 'yellow'
      })),
      state('0', style({
        height: '100px',
        opacity: 0.5,
        backgroundColor: 'green'
      })),
      transition('* => closed', [
        animate('1s')
      ]),
      transition('* => open', [
        animate('0.5s')
      ]),
    ]),
    
    
  ]
})
export class DamagelistComponent implements OnInit {

  animationRun = false;
  constructor() { }

  ngOnInit() {
  }

  animationTrigger() {
    this.animationRun = !this.animationRun;
    console.log(this.animationRun)
  }

  

}
