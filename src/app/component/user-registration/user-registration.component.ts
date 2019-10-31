import { Component, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {MatFormFieldModule} from '@angular/material/form-field';
import {FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder} from '@angular/forms';
import { OnInit } from '@angular/core';
import { GlobalService } from '../../shared/service/global.service';
import { UtilService } from '../../shared/service/util.service';
import { HttpService } from '../../shared/service/http.service';


@Component({
    selector: '',
    templateUrl: './add-user.html',  
})

export class AddUserComponent implements OnInit { 
    public errMsg:string = '';
    public isError:boolean = false; 
    public userSection = 'add';
    public regUserName = '';
    public roleList = [];
    public userRoleId: number ;
    userFm: FormGroup;
    roleValue;

    constructor( 
        private util: UtilService,
        private http: HttpService, 
        private router: Router,
        private fb: FormBuilder,
        public route: ActivatedRoute,
        private global: GlobalService
    ){}

    ngOnInit() {
        this.getUserRole();
        this.createForm();
        this.onChanges();
        this.util.setPageTitle(this.route);
    }

    onChanges(): void {
        try {
            this.userFm.get('userMobile').valueChanges.subscribe(mobNo => {
                let firstDigit: number;
                let indMobNoStart = [7, 8, 9];
                if (mobNo != "") {
                    firstDigit = parseInt(mobNo.slice(0, 1));
                    if (indMobNoStart.indexOf(firstDigit) == -1) {
                        this.userFm.patchValue({ countryCode: '+1' });
                    } else {
                        this.userFm.patchValue({ countryCode: '+91' });
                    }
                }
            });

            this.userFm.get('roleId').valueChanges.subscribe(roleId => {
                if (roleId == 15) {
                    this.userFm.patchValue({ userName: 'test1234' });
                } else {
                    this.userFm.patchValue({ userName: '' });
                }
            });
        } catch (err) {
            this.global.addException('Manufacturer part', 'onChanges()', err);
        }
    }

    public createForm(){
        this.userFm = this.fb.group({
            roleId: new FormControl('', [ Validators.required ]),
            loginType: new FormControl('Google', [ Validators.required ]),
            name: new FormControl('', [ 
                Validators.required,
                Validators.minLength(4)
            ]),
            userName: new FormControl('', [ 
                Validators.required,
                Validators.minLength(8)
            ]),
            userEmail: new FormControl('', [ Validators.required ]),
            countryCode: new FormControl('+91', [ Validators.required ]),
            userMobile: new FormControl('', [ 
                Validators.required,
                Validators.minLength(10),
                Validators.maxLength(10)
            ])
        });
    }

    get roleId() { return this.userFm.get('roleId'); }
    get loginType() { return this.userFm.get('loginType'); }
    get name() { return this.userFm.get('name'); }
    get userName() { return this.userFm.get('userName'); }
    get userEmail() { return this.userFm.get('userEmail'); }
    get userMobile() { return this.userFm.get('userMobile'); }
    get countryCode() { return this.userFm.get('userMobile'); }

    public getUserRole() {
        try {
            var self = this;
            this.http.doGet('getUserRoleList', function (error: boolean, response: any) {
                if (error) {
                    alert(response.error.error);
                } else {
                    self.roleList = response.result;
                    self.userRoleId = 13;
                    self.userFm.value.roleId = 13;
                }
            });
        }
        catch (err) {
            this.global.addException('Manufacturer part', 'getUserRole()', err);
        }
    }     
    
    public addUser(form: NgForm): void {
        this.errMsg = '';
        this.isError = false;
        var self = this;
        try {
            if (form.valid) {
                //console.log(JSON.stringify(form.value));
                var reqData = form.value;
                reqData.companyId = JSON.parse(atob(localStorage.getItem('USER'))).company_id
                if (reqData.roleId == 15) {
                    delete reqData.userName;
                } else {
                    delete reqData.loginType;
                }
                self.http.doPost('awsCreateUser', form.value, function (error: boolean, response: any) {
                    if (error) {
                        self.errMsg = response.message;
                        self.isError = true;
                    } else {
                        self.userSection = 'success';
                        self.regUserName = form.value.name;
                        alert(self.regUserName + " user registered successfully.");
                        self.router.navigate(['/csa']);
                    }
                });
            } else {
                this.isError = true;
                this.errMsg = "Please fill details.";
            }

        } catch (err) {
            this.global.addException('Manufacturer part', 'addUser()', err);
        }
    }

    keyDownFunction(event: any, form: NgForm) {
        if(event.keyCode == 13) {
            this.addUser(form);
        }
    };    
}


@Component({
    selector: '',
    templateUrl: './add-user-with-socialID.html',  
})

export class AddUserWithSocialIDComponent  { 
    public errMsg:string = '';
    public isError:boolean = false; 
	public userSection = 'add';
    public regUserName = '';

	constructor( private http: HttpService, private router: Router, private global: GlobalService ) {}
	
    public sendRegistrationLink(form: NgForm): void {
        this.errMsg = '';
        this.isError = false;
        var self = this;
        try {
            if (form.valid) {
                self.http.doPost('sendSocialLoginEmail', form.value, function (error: boolean, response: any) {
                    if (error) {
                        self.errMsg = response.message;
                        self.isError = true;
                    } else {
                        self.userSection = 'success';
                        self.regUserName = form.value.userEmail;
                        alert(self.regUserName + " user registered successfully.");
                        self.router.navigate(['/csa']);
                    }
                });
            } else {
                this.isError = true;
                this.errMsg = "Please enter social id.";
            }
        } catch (err) {
            this.global.addException('Manufacturer part', 'sendRegistrationLink()', err);
        }
    }

    keyDownFunction(event: any, form: NgForm) {
        if(event.keyCode == 13) {
            this.sendRegistrationLink(form);
        }
    };
}




