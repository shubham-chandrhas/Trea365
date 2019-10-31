import { Component, OnInit } from '@angular/core';

import { UtilService } from '../../../../../shared/service/util.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-repaires',
  templateUrl: './repaires.component.html',
  styleUrls: ['./repaires.component.css']
})
export class RepairesComponent implements OnInit {

  constructor(
    public util: UtilService,
    public route:ActivatedRoute 
  ) { }

  ngOnInit() {
    this.util.setBgYellow('repairs');
    this.util.setPageTitle(this.route);
  }

}
