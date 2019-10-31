
/*** 
*    View:- login.html, client-login.html
*    Component:- LoginComponent, ClientLoginComponent => login.component.ts
*    Route:- '/login', '/client-login'  
*
*    Analysis/DC:- 1. This component file included 2 components as mentioned above.
*                  2. LoginComponent used to login TSA, CSA and Employee.
*    Code Review:- Done By Yogesh
*    TO DO:- 
*    Note:- ClientLoginComponent used to login for the client, but currently this scenario is not in the picture so once the product is ready, we can delete this component.
***/    

import { Component, Inject, Renderer, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';

import { AwsCognitoService } from '../aws-cognito.service';    
import { UtilService } from '../../shared/service/util.service';
import { APP_CONFIG, AppConfig } from '../../app-config.module';

@Component({
  selector: '',
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})

export class LoginComponent implements OnInit {   
  errMsg: string = '';
  domainIP: string = '';
  hide: boolean = true;
  isError: boolean = false;
  loginFm: FormGroup;
  userObj :any = {
    'userEmail': '',
    'userPassword': ''
  };
  
  constructor(
    @Inject(DOCUMENT) 
    private document: Document, 
    @Inject(APP_CONFIG) 
    private config: AppConfig,
    private router: Router,
    private route: ActivatedRoute,
    public util: UtilService,
    private cognitoService: AwsCognitoService,
    private fb: FormBuilder,
    private renderer: Renderer 
  ) {
    this.util.showLoading();
    this.domainIP = this.config.domainIP;    //For the base path url of image
    this.cognitoService.checkAccessTokan();  //For auto login with the help of session/local storage
    this.createForm();
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.util.setPageTitle(this.route);
    localStorage.getItem('IS_REMEMBERME') == '1' ? '' : this.renderer.setElementClass(document.body, 'bg-img', true);
    this.util.userAlertData.isShow = false;  //Hide tost message
  }
  ngOnDestroy() {
    this.renderer.setElementClass(document.body, 'bg-img', false);
  }

  createForm(){
    this.loginFm = this.fb.group({
      Username: new FormControl('', [ 
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(30)
      ]),
      Password: new FormControl('', [ 
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(30)
      ]),
      rememberMe: new FormControl(false)
    });
  }

  get Username() { return this.loginFm.get('Username'); }
  get Password() { return this.loginFm.get('Password'); }
  get rememberMe() { return this.loginFm.get('rememberMe'); }

  /**
  *  1. Used to call authenticate() function for login request.
  *  2. After successful callback call getUserInfo() function.
  **/ 
  public onSubmit(form: FormGroup){
    var self = this;
    this.errMsg = '';
    this.isError = false;
    this.util.hideAlertToast();
    if( form.valid ){
      let reqData = {
        'Username' : form.value.Username.trim(),
        'Password' : form.value.Password.trim()
      }
      if(!(reqData.Username.indexOf(' ') !== -1)){     //In case if you want to remove this condition then need to add pattern for checking space between username.
        self.util.addSpinner('login-fm-btn', "Login");
        this.cognitoService.authenticate(reqData, form.value.rememberMe, function(error: boolean, response: any){
          self.util.removeSpinner('login-fm-btn', "Login");
          if( error ){
            self.isError = true;
            self.errMsg = response.message;
          }else{
            self.cognitoService.getUserInfo();
          }
        }); 
      }else{
        this.isError = true;
        this.errMsg = "Please enter valid User ID.";
      }
    }else{
      this.isError = true;
      this.errMsg = "Please enter valid login credentials.";
    }
  };

  findCredential(option: string){
    this.router.navigate(['/forgot-credential-s1/'+btoa(option)]);
  };

  keyDownFunction(event: any, form: FormGroup) {
    if(event.keyCode == 13) { this.onSubmit(form); }
  };
};


@Component({
  selector: '',
  templateUrl: './client-login.html',
  styleUrls: ['./login.css']
})

export class ClientLoginComponent implements OnInit {   
  domainIP: string = '';

  constructor(
    @Inject(DOCUMENT) 
    private document: Document,  
    @Inject(APP_CONFIG) 
    private config: AppConfig,
    private renderer: Renderer  
  ) {
    this.domainIP = this.config.domainIP;
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.renderer.setElementClass(document.body, 'bg-img', true);
  }
  ngOnDestroy() {
    this.renderer.setElementClass(document.body, 'bg-img', false);
  }
};
