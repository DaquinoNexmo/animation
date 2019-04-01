import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InnitService } from '../services/innit.service';


@Component({
  selector: 'app-blank',
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.css']
})
export class BlankComponent implements OnInit {

  constructor( private router: Router, private innitService: InnitService) { }

  ngOnInit() {
    console.log(this.innitService.route);
    this.router.navigate([`${this.innitService.route}`]);
  }
}
