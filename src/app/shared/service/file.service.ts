import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Http, Headers, RequestOptions } from "@angular/http";

//import { Observable } from 'rxjs/Rx';
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { ConstantsService } from "./constants.service";
import { UtilService } from "./util.service";
import { APP_CONFIG, AppConfig } from "../../app-config.module";

declare var $: any;

@Injectable()
export class FileService {
  //public tokan = sessionStorage.getItem('KEY') ? atob(sessionStorage.getItem('KEY')) : atob(localStorage.getItem('KEY')) ;
  //public tokan = localStorage.getItem('KEY') ? atob(localStorage.getItem('KEY')) : '' ;
  //public options = new RequestOptions({ 'headers': new Headers({'Authorization': this.tokan })});
  constructor(
    private _http: Http,
    @Inject(APP_CONFIG) private config: AppConfig,
    private util: UtilService,
    private constant: ConstantsService
  ) {
    console.log("File...");
  }
  public downloadBaseURL =
    this.config.domainIP + "/api/public/uploads/csvTemplate/";

  formDataAPICall(FormDataObj: any, url: string, callback) {
    let self = this;
    let tokan = localStorage.getItem("KEY")
      ? atob(localStorage.getItem("KEY"))
      : "";
    let options = new RequestOptions({
      headers: new Headers({ Authorization: tokan })
    });
    //console.log(FormDataObj);//http://localhost:9000/api/WorkflowProjectEstimates
    this._http
      .post(self.config.apiEndpoint + url, FormDataObj, options)
      // this._http.post("http://localhost:9000/api/WorkflowProjectEstimates", FormDataObj, self.options)
      .map(res => res.json())
      .subscribe(
        data => {
          return callback(false, data);
        },
        error => {
          if (error.status === 401) {
            self.updateToken(
              self.config.apiEndpoint + url,
              FormDataObj,
              function(cbError: boolean, cbResponse: any) {
                return callback(cbError, cbResponse);
              }
            );
          } else if (error.status === 404) {
            self.util.show404Page();
          } else if (error.status == 500) {
            let errorStatus: any = JSON.parse(error._body);
            return callback(true, {
              message: errorStatus.message
                ? errorStatus.message
                : "Internal Server Error"
            });
          } else {
            let errorStatus: any = JSON.parse(error._body);
            errorStatus.status == 401 ? (errorStatus.message = "") : "";
            errorStatus.statusCode == 400 &&
            typeof errorStatus.message == "string"
              ? ""
              : (errorStatus.message = self.constant.EXCEPTIONAL_MSG);
            return callback(true, errorStatus);
            //return callback(true, JSON.parse(error._body));
          }
        }
      );
  }

  private updateToken(url: string, requestParam: any, callback) {
    let self = this;
    if (
      atob(localStorage.getItem("TOKEN")) == "access" ||
      atob(localStorage.getItem("TOKEN"))
    ) {
      self.util.initiateAuth(function(
        cognitoError: boolean,
        cognitoResponse: any
      ) {
        if (cognitoError) {
          console.log(cognitoResponse);
          self.util.forceLogout();
        } else {
          localStorage.setItem("KEY", btoa(cognitoResponse.AccessToken));
          // if(atob(sessionStorage.getItem('TOKEN')) == 'access'){
          //     sessionStorage.setItem('KEY', btoa(cognitoResponse.AccessToken));
          // }else{
          //     localStorage.setItem('KEY', btoa(cognitoResponse.AccessToken));
          // }
          let options = new RequestOptions({
            headers: new Headers({ Authorization: cognitoResponse.AccessToken })
          });

          self._http
            .post(url, requestParam, options)
            .map(res => res.json())
            .subscribe(
              data => {
                return callback(false, data);
              },
              error => {
                return callback(true, JSON.parse(error._body));
              }
            );
        }
      });
    } else {
      self.util.forceLogout();
    }
  }
}
