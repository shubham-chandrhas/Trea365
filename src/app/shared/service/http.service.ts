import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Http, Headers, RequestOptions } from "@angular/http";

import { UtilService } from "./util.service";
import { ConstantsService } from "./constants.service";
import { APP_CONFIG, AppConfig } from "../../app-config.module";

@Injectable()
export class HttpService {
  constructor(
    @Inject(APP_CONFIG)
    private config: AppConfig,
    private http: HttpClient,
    private util: UtilService,
    private constant: ConstantsService
  ) {}

  public doGet(url: string, callback) {
    let self = this;
    this.http
      .get(this.config.apiEndpoint + url, { observe: "response" })
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            //res.body.result;
            return callback(false, res.body);
          } else {
            return callback(true, res.body);
          }
        },
        err => {
          if (err.status === 401) {
            //self.util.forceLogout();
            self.updateToken("GET", url, {}, function(
              error: boolean,
              response: any
            ) {
              return callback(error, response);
            });
          } else if (err.status === 404) {
            self.util.show404Page();
          } else if (err.status == 500) {
            return callback(true, { message: "Internal Server Error" });
          } else {
            let error: any = err.error ? err.error : err;
            error.statusCode == 401 ? (error.message = "") : "";
            error.statusCode == 400 && typeof error.message == "string"
              ? ""
              : (error.message = self.constant.EXCEPTIONAL_MSG);
            return callback(true, error);
          }
        }
      );
  }

  public doPost(url: string, requestParam: any, callback) {
    let self = this;
    this.http
      .post(this.config.apiEndpoint + url, requestParam, {
        observe: "response"
      })
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            return callback(false, res.body);
          } else {
            return callback(true, res.body);
          }
        },
        err => {
          if (err.status === 401) {
            //self.util.forceLogout();
            self.updateToken("POST", url, requestParam, function(
              error: boolean,
              response: any
            ) {
              return callback(error, response);
            });
          } else if (err.status === 404) {
            self.util.show404Page();
          } else if (err.status == 500) {
            //return callback(true, {'error': { 'error' : 'Internal Server Error' }});
            return callback(true, { message: "Internal Server Error" });
          } else {
            let error: any = err.error ? err.error : err;
            error.statusCode == 401 ? (error.message = "") : "";
            error.statusCode == 400 && typeof error.message == "string"
              ? ""
              : (error.message = self.constant.EXCEPTIONAL_MSG);
            return callback(true, error);
          }
        }
      );
  }

  public doDelete(url: string, callback) {
    let self = this;
    this.http
      .delete(this.config.apiEndpoint + url, { observe: "response" })
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            //res.body.result;
            return callback(false, res.body);
          } else {
            return callback(true, res.body);
          }
        },
        err => {
          if (err.status === 401) {
            //self.util.forceLogout();
            self.updateToken("GET", url, {}, function(
              error: boolean,
              response: any
            ) {
              return callback(error, response);
            });
          } else if (err.status === 404) {
            self.util.show404Page();
          } else if (err.status == 500) {
            return callback(true, { message: "Internal Server Error" });
          } else {
            let error: any = err.error ? err.error : err;
            error.statusCode == 401 ? (error.message = "") : "";
            error.statusCode == 400 && typeof error.message == "string"
              ? ""
              : (error.message = self.constant.EXCEPTIONAL_MSG);
            return callback(true, error);
          }
        }
      );
  }

  private updateToken(
    method: string,
    url: string,
    requestParam: any,
    callback
  ) {
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
          //if(atob(sessionStorage.getItem('TOKEN')) == 'access'){
          //    sessionStorage.setItem('KEY', btoa(cognitoResponse.AccessToken));
          //sessionStorage.setItem('TOKEN', btoa(cognitoResponse.TokenType));
          //}else{
          //    localStorage.setItem('KEY', btoa(cognitoResponse.AccessToken));
          //localStorage.setItem('TOKEN', btoa(cognitoResponse.TokenType));
          //}
          if (method == "POST") {
            self.doPost(url, requestParam, function(
              error: boolean,
              response: any
            ) {
              return callback(error, response);
            });
          } else {
            self.doGet(url, function(error: boolean, response: any) {
              return callback(error, response);
            });
          }
        }
      });
    } else {
      self.util.forceLogout();
    }
  }
}
