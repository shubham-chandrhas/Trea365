
import { Component, Inject, OnInit, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder } from '@angular/forms';

import { UtilService } from '../../shared/service/util.service';
import { HttpService } from '../../shared/service/http.service';
import { ConstantsService } from '../../shared/service/constants.service';
import { AwsCognitoService } from '../aws-cognito.service';

@Component({
    selector: '',
    templateUrl: './forgot-credential-step-1.html',
    styleUrls: ['../login/login.css', './forgot-credential.css']
})

export class ForgotCredentialStepOneComponent implements OnInit{ 
    public errMsg:string = '';
    public isError:boolean = false; 
    public submitted:boolean = false; 
	public credentialType = 'Password';
    public userEmailId;
    public emailAdd:string = '';
    public mobileNum:string = '';
    forgotPassFm: FormGroup;
    
	constructor( 
        private router: Router, 
        private route: ActivatedRoute,
        private cognitoService: AwsCognitoService,
        private fb: FormBuilder,
        public util: UtilService,
        private http: HttpService,
        private renderer: Renderer,
        public constant: ConstantsService 
    ) {
        if(atob(this.route.snapshot.paramMap.get('type')) == 'loginId'){
            this.credentialType = 'loginId';
        }
        this.createForm();
    }

    ngOnInit() {
        window.scrollTo(0, 0);
        this.renderer.setElementClass(document.body, 'bg-img', true);
        this.util.setPageTitle(this.route);
    }

    ngOnDestroy() {
        this.renderer.setElementClass(document.body, 'bg-img', false);
    }

    public createForm(){
        this.forgotPassFm = this.fb.group({
            userEmail: new FormControl('', [Validators.required,Validators.minLength(8)]),
            userMobile: new FormControl('', [Validators.pattern(this.constant.PHONE_PATTERN)])
        });
    }

    get userEmail() { return this.forgotPassFm.get('userEmail'); }
    get userMobile() { return this.forgotPassFm.get('userMobile'); }

    resetCredentialsInit(form: FormGroup):void {
        console.log(form.value);
        var self = this; 
        this.util.addBulkValidators(this.forgotPassFm, ['userEmail'], [ Validators.required,Validators.minLength(8)]);
        this.util.addBulkValidators(this.forgotPassFm, ['userMobile'], [ ]);
        self.submitted = true;
        if( form.valid ){
            this.util.addSpinner('forgot-pass-fm-btn-s1', 'Submit');
            this.cognitoService.forgotPassword(form.value.userEmail, function(error: boolean, response: any){
                self.util.removeSpinner('forgot-pass-fm-btn-s1', 'Submit');
                if(error){
                    console.log(error);
                    self.isError = true;
                    let reqObj: any = {
                        'username': form.value.userEmail
                    };
                    if(response.message == "User password cannot be reset in the current state."){
                        self.http.doPost('resend-verification', reqObj, function (error: boolean, response: any) {
                            console.log(response);
                            if (error) {
                                self.errMsg = response.message;
                            } else {
                                self.errMsg = response.message;
                            }
                        });
                    }
                    else{
                        self.errMsg = response.message;
                    }
                    
                }else{
                    response.username = form.value.userEmail;
                    self.router.navigate(['/forgot-credential-s2/'+btoa(JSON.stringify(response))]);
                }
            });      
        }else{
            //this.isError = true;
            //this.errMsg = "Please enter login id.";  
        }
    };


    forgotUserIdInit(form: FormGroup):void{
        var self = this; 
        self.submitted = true;
        // if (form.value.userEmail != '' && form.value.userMobile == '') {
        //     this.util.addBulkValidators(this.forgotPassFm, ['userEmail'], [ Validators.required,Validators.pattern(this.constant.EMAIL_PATTERN) ]);
        //     this.util.addBulkValidators(this.forgotPassFm, ['userMobile'], [  ]);
        //     let reqObj = { 'email_id':form.value.userEmail };
        // }else if ((form.value.userEmail != '' && form.value.userMobile != '') || (form.value.userEmail != '' && form.value.userMobile != '')) {
        //     this.util.addBulkValidators(this.forgotPassFm, ['userEmail'], [ Validators.required,Validators.pattern(this.constant.EMAIL_PATTERN) ]);
        //     this.util.addBulkValidators(this.forgotPassFm, ['userMobile'], [ Validators.required,Validators.pattern(this.constant.PHONE_PATTERN) ]);
        //     let reqObj = { 'email_id':form.value.userEmail, 'mobile_no':form.value.userMobile };
        // }else if (form.value.userEmail == '' && form.value.userMobile != '') {
        //     this.util.addBulkValidators(this.forgotPassFm, ['userEmail'], [  ]);
        //     this.util.addBulkValidators(this.forgotPassFm, ['userMobile'], [ Validators.required,Validators.pattern(this.constant.PHONE_PATTERN) ]);
        // }
        console.log(form.valid);
        //console.log(form.value);
        if(form.valid){
            let reqObj = { 'email_id':form.value.userEmail };
            // let reqObj = { 'mobile_no':self.util.unMaskPhoneNumber(form.value.userMobile) };
            this.util.addSpinner('forgot-pass-fm-btn-s2', 'Submit');
            self.cognitoService.forgotUserID(reqObj, function(error: boolean, response: any){
                self.util.removeSpinner('forgot-pass-fm-btn-s2', 'Submit');
                console.log(response);
                if(error){
                    console.log('error');
                    self.isError = true;
                    self.errMsg = response.message;
                }else{
                    self.credentialType = 'loginIdSuccess';
                }
            });
        }else{
            // this.isError = true;
            // this.errMsg = "Please enter email address or mobile number.";
        }
    }

    keyDownFunction(event: any, form: FormGroup) {
        if(event.keyCode == 13) {
            this.forgotUserIdInit(form);
            console.log("Forgot User");
        }
    };
}


@Component({
    selector: '',
    templateUrl: './forgot-credential-step-2.html',
    styleUrls: ['../login/login.css', './forgot-credential.css']
})

export class ForgotCredentialStepTwoComponent implements OnInit { 
    public errMsg:string = '';
    public isError:boolean = false; 
    public submitted:boolean = false;
    public delStatus:any;
    public userEmail:string;
    public userOTP;
    public newUserPassword;
    public confirmUserPassword;
    public hide = false;
    public confirmhide = false;
    public passStrength;
    resetCredentialsFm: FormGroup;
    
    constructor( 
        private router: Router, 
        private route: ActivatedRoute,
        private cognitoService: AwsCognitoService,
        private fb: FormBuilder,
        public util: UtilService, 
        private renderer: Renderer,
        public constant: ConstantsService  
    ) {
        console.log(this.route.snapshot.paramMap.get('status'));
        this.delStatus = JSON.parse(atob(this.route.snapshot.paramMap.get('status')));
        console.log(this.delStatus);
        this.userEmail = this.delStatus.CodeDeliveryDetails.Destination;
        this.createForm();
    }


    ngOnDestroy() {
        this.renderer.setElementClass(document.body, 'bg-img', false);
    }

    ngOnInit(){
        window.scrollTo(0, 0);
        this.renderer.setElementClass(document.body, 'bg-img', true);
        this.onChanges();
    }

    onChanges(): void {
        this.resetCredentialsFm.get('newPassword').valueChanges.subscribe(password => {
            //console.log(password);
            this.passStrength = this.util.getPasswordStrength(password);
        });
    }

    public createForm(){
        this.resetCredentialsFm = this.fb.group({
            verificationCode: new FormControl(
            '', [ 
                Validators.required,
                Validators.minLength(6),
                Validators.maxLength(6),
            ]),
            newPassword: new FormControl(
            '', [ Validators.required ]),
            confirmPassword: new FormControl(
            '', [ Validators.required ])
        });
    }
    // Validators.minLength(8),
    // Validators.maxLength(30),

    get verificationCode(){ return this.resetCredentialsFm.get('verificationCode'); }
    get newPassword(){ return this.resetCredentialsFm.get('newPassword'); }
    get confirmPassword(){ return this.resetCredentialsFm.get('confirmPassword'); }

    resetCredentials(form: FormGroup):void {
        console.log(form.value);
        var self = this; 
        self.submitted = true;
        if( form.valid ){
            if( form.value.newPassword === form.value.confirmPassword ){
                this.util.addSpinner('forgot-sub-fm-btn', 'Submit');
                this.cognitoService.confirmPassword(this.delStatus.username, form.value.verificationCode, form.value.newPassword, function(error: boolean, response: any){
                    self.util.removeSpinner('forgot-sub-fm-btn', 'Submit');
                    if( error ){
                        self.isError = true;
                        self.errMsg = response.message;
                    }else{
                       self.router.navigate(['/forgot-credential-s3']); 
                    }
                });
            }else{
                this.isError = true;
                this.errMsg = "New password and confirm password did not matched.";
            }
        }else{
            //this.isError = true;
            //this.errMsg = "Please enter all details.";
        }
    }; 

    public findCredential(option:string){
        this.router.navigate(['/forgot-credential-s1/'+btoa(option)]);
    };

    keyDownFunction(event: any, form: FormGroup) {
        if(event.keyCode == 13) {
            this.resetCredentials(form);
        }
    };
}

@Component({
    selector: '',
    templateUrl: './reset-credential-step-2.html',
    styleUrls: ['../login/login.css', './forgot-credential.css']
})

export class ResetCredentialStepTwoComponent implements OnInit{ 
    public errMsg:string = '';
    public isError:boolean = false; 
    public submitted:boolean = false;
    public delStatus:any;
    public userEmail:string;
    public userOTP;
    public newUserPassword;
    public confirmUserPassword;
    public hide = false;
    public confirmhide = false;
    public passStrength;
    resetCredentialsFm: FormGroup;
    
    constructor( 
        private router: Router, 
        private route: ActivatedRoute,
        private cognitoService: AwsCognitoService,
        private fb: FormBuilder,
        public util: UtilService, 
    ) {
        //console.log(this.route.snapshot.paramMap.get('status'));
        //this.delStatus = JSON.parse(atob(this.route.snapshot.paramMap.get('status')));
        //console.log(this.delStatus);
        //this.userEmail = this.delStatus.CodeDeliveryDetails.Destination;
        this.createForm();
        
    }

    ngOnInit(){
        this.onChanges();
    }

    onChanges(): void {
        this.resetCredentialsFm.get('newPassword').valueChanges.subscribe(password => {
            console.log(password);
            this.passStrength = this.util.getPasswordStrength(password);
        });
    }

    public createForm(){
        this.resetCredentialsFm = this.fb.group({
            username: new FormControl('', [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(30)
            ]),
            verificationCode: new FormControl(
            '', [ 
                Validators.required,
                Validators.minLength(6),
                Validators.maxLength(6),
            ]),
            newPassword: new FormControl(
            '', [ Validators.required ]),
            confirmPassword: new FormControl(
            '', [ Validators.required ])
        });
    }
    // Validators.minLength(8),
    // Validators.maxLength(30),

    get username(){ return this.resetCredentialsFm.get('username'); }
    get verificationCode(){ return this.resetCredentialsFm.get('verificationCode'); }
    get newPassword(){ return this.resetCredentialsFm.get('newPassword'); }
    get confirmPassword(){ return this.resetCredentialsFm.get('confirmPassword'); }

    resetCredentials(form: FormGroup):void {
        console.log(form.value);
        var self = this; 
        self.submitted = true;
        if( form.valid ){
            if( form.value.newPassword === form.value.confirmPassword ){
                this.cognitoService.confirmPassword(form.value.username, form.value.verificationCode, form.value.newPassword, function(error: boolean, response: any){
                    if( error ){
                        self.isError = true;
                        self.errMsg = response.message;
                    }else{
                       self.router.navigate(['/forgot-credential-s3']); 
                    }
                });
            }else{
                this.isError = true;
                this.errMsg = "New password and confirm password did not matched.";
            }
        }else{
            this.isError = true;
            this.errMsg = "Please enter all details.";
        }
    };

    public findCredential(option:string){
        this.router.navigate(['/forgot-credential-s1/'+btoa(option)]);
    };

    keyDownFunction(event: any, form: FormGroup) {
        if(event.keyCode == 13) {
            this.resetCredentials(form);
        }
    };
}


@Component({
    selector: '',
    templateUrl: './forgot-credential-step-3.html',
    styleUrls: ['../login/login.css', './forgot-credential.css']
})

export class ForgotCredentialStepThreeComponent implements OnInit{ 
    constructor(private renderer: Renderer ){}
    ngOnDestroy() {
        this.renderer.setElementClass(document.body, 'bg-img', false);
    }

    ngOnInit(){
        window.scrollTo(0, 0);
        this.renderer.setElementClass(document.body, 'bg-img', true);
    }
}
