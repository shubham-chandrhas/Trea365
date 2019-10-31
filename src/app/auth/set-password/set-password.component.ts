import { Component, Inject, OnInit, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder } from '@angular/forms';

import { UtilService } from '../../shared/service/util.service';
import { AwsCognitoService } from '../aws-cognito.service';

declare var $: any;

@Component({
    selector: '',
    templateUrl: './set-password-step-1.html',
    styleUrls: ['../login/login.css', '../forgot-credential/forgot-credential.css']
})

export class SetPasswordStepOneComponent implements OnInit{ 
    errMsg:string = '';
    isError:boolean = false; 
	credentialType = 'Password';
    userEmailId;
    submitted:boolean = false;
    hide = false;
    confirmhide = false;
    newUserPassword;
    emailAdd:string = '';
    mobileNum:string = '';
    setPassFm: FormGroup;
    
	constructor( 
        private router: Router, 
        private route: ActivatedRoute,
        private cognitoService: AwsCognitoService,
        private fb: FormBuilder,
        public util: UtilService,
        private renderer: Renderer
    ) {}

    public createForm(){
        this.setPassFm = this.fb.group({
            username: new FormControl('', [ Validators.required ]),
            password: new FormControl('', [ Validators.required ])
        });
    }
    submit(form:FormGroup){
        var self = this;
        self.submitted=true;
        self.isError=false;
        if(form.valid){
            self.util.addSpinner('login-fm-btn', "Sign in");
            self.cognitoService.setPassword(form.value, function(error: boolean, response: any){
                self.util.removeSpinner('login-fm-btn', "Sign in");
                console.log(response);
                if( error ){
                    self.isError=true;
                    self.errMsg = response.message;
                    console.log('error');
                }else{
                    console.log('no error');
                    if(response.data.hasOwnProperty("Session")){
                        console.log('new user');
                        sessionStorage.setItem('username', btoa(form.value.username));
                        sessionStorage.setItem('session', btoa(response.data.Session));
                        self.router.navigate(['/set-password-s2']);
                    }else{
                        console.log('old user');
                        localStorage.setItem('KEY', btoa(response.data.AuthenticationResult.AccessToken));
                        localStorage.setItem('REFRESH_TOKEN', btoa(response.data.AuthenticationResult.RefreshToken));
                        localStorage.setItem('TOKEN', btoa('access'));
                        self.cognitoService.getUserInfo();
                    }
                    // self.router.navigate(['/set-password-s2']);
                }
            
            })

        }
    }
    get username() { return this.setPassFm.get('username'); }
    get password() { return this.setPassFm.get('password'); }

    ngOnInit() {
        window.scrollTo(0, 0);
       this.renderer.setElementClass(document.body, 'bg-img', true);
       this.createForm();
       this.util.setPageTitle(this.route);
    }
    // onChanges(): void {
    //     console.log('sss');
    //     this.setPassFm.get('password').valueChanges.subscribe(password => {
    //         console.log(password);
    //         this.passStrength = this.util.getPasswordStrength(password);
    //     });
    // }
    // checkStrength(event:any){
    //     console.log(event.target.value);
    //     this.passStrength = this.util.getPasswordStrength(event.target.value);
    // }

    ngOnDestroy() {
        this.renderer.setElementClass(document.body, 'bg-img', false);
    }
    keyDownFunction(event: any, form: FormGroup) {
        if(event.keyCode == 13) {
            this.submit(form);
        }
    };
}



@Component({
    selector: '',
    templateUrl: './set-password-step-2.html',
    styleUrls: ['../login/login.css', '../forgot-credential/forgot-credential.css']
})

export class SetPasswordStepTwoComponent implements OnInit{ 
    errMsg:string = '';
    successMsg: string = '';
    isSuccess: boolean = false;
    isError:boolean = false; 
	credentialType = 'Password';
    userEmailId;
    submitted:boolean = false;
    hide = false;
    confirmhide = false;
    emailAdd:string = '';
    mobileNum:string = '';
    data: any = {};
    passStrength;
    changePassFm: FormGroup;
    
	constructor( 
        private router: Router, 
        private route: ActivatedRoute,
        private cognitoService: AwsCognitoService,
        private fb: FormBuilder,
        public util: UtilService,
        private renderer: Renderer 
    ) {
        this.createForm();
    }
    public createForm(){
        this.changePassFm = this.fb.group({
            new_password: new FormControl('', [ 
                Validators.required
            ]),
            confirmPassword: new FormControl('', [ 
                Validators.required 
            ])
        });
    }
    submit(form:FormGroup){
        var self = this;
        self.submitted = true;
        self.isError = false;
        self.isSuccess = false;
        self.successMsg = '';
        self.errMsg = '';
        //console.log(form.value);
        //console.log(form.valid);
        if(form.valid){
            //console.log('hgjhghj');
            if (form.value.new_password != form.value.confirmPassword) { 
                self.isError=true;
                self.errMsg = "New password and confirm password did not matched.";
            }else{
                self.util.addSpinner('login-fm-btn', "Send");
                self.data.new_password = form.value.new_password;
                //console.log(JSON.stringify(self.data));
                self.cognitoService.setNewPassword(self.data, function(error: boolean, response: any){
                    self.util.removeSpinner('login-fm-btn', "Send");
                    //console.log(response);
                    if( error ){
                        //console.log(JSON.stringify(response.data));
                        self.isError=true;
                        self.errMsg = response.message;
                        //console.log('error');
                        // self.router.navigate(['/set-password-s1']);
                    }else{
                        //console.log('no error');
                        self.isSuccess = true;
                        self.successMsg = 'Password updated successfully.';
                        localStorage.setItem('KEY', btoa(response.data.AuthenticationResult.AccessToken));
                        localStorage.setItem('REFRESH_TOKEN', btoa(response.data.AuthenticationResult.RefreshToken));
                        localStorage.setItem('TOKEN', btoa('access'));
                        self.cognitoService.getUserInfo();
                    }
                
                })
            }
        }
    }
    get new_password() { return this.changePassFm.get('new_password'); }
    get confirmPassword() { return this.changePassFm.get('confirmPassword'); }

    ngOnInit() {
        window.scrollTo(0, 0);
        this.renderer.setElementClass(document.body, 'bg-img', true);
        this.createForm();
        if( sessionStorage.getItem('username') && sessionStorage.getItem('session') ){
            this.data.username = atob(sessionStorage.getItem('username'));
            this.data.session = atob(sessionStorage.getItem('session'));
            console.log(this.data);
        }

        this.changePassFm.get('new_password').valueChanges.subscribe(password => {
            //console.log(password);
            this.passStrength = this.util.getPasswordStrength(password);
        });
    }

    ngOnDestroy() {
        this.renderer.setElementClass(document.body, 'bg-img', false);
    }
    keyDownFunction(event: any, form: FormGroup) {
        if(event.keyCode == 13) {
            this.submit(form);
        }
    };
}