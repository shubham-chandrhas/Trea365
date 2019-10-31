import { Component, OnInit } from '@angular/core';
//import { VersionCheckService } from './version-check.service';
//import { environment } from '../environments/environment.prod';

@Component({
  selector: 'trea-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'app';

//   constructor(private versionCheckService: VersionCheckService) {
    constructor() {
  }
  ngOnInit(): void {
    //this.versionCheckService.initVersionCheck(environment.versionCheckURL);
  }

}
