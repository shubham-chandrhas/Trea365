import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Location } from '@angular/common';

import { APP_CONFIG, AppConfig } from '../../app-config.module';
import { HttpService } from './http.service';
import { MaintenanceComponent } from '../module/redirection/redirection.component';

@Injectable()
export class GlobalService {
    route: string;

	constructor(
        @Inject(APP_CONFIG) 
        private config: AppConfig,
        private http: HttpService,
        private router: Router,
        private location: Location
    ) {
        router.events.subscribe((val) => {
            if(location.path() != ''){
                this.route = location.path();
            } else {
                this.route = 'Dashboard'
            }
        });
    }

    getCountries(callback){
        this.http.doGet('country', function(error: boolean, response: any){
            if( error ){ return callback([]); }else{ return callback(response.data); }
        });
    }
    
    getProviences(countryId, callback){
        this.http.doGet('provinces/'+countryId, function(error: boolean, response: any){
            if( error ){ return callback([]); }else{ return callback(response.data); }
        });
    }

    getCities(provienceId, callback){
        this.http.doGet('city/'+provienceId, function(error: boolean, response: any){
            if( error ){ return callback([]); }else{ return callback(response.data); }
        });
    }

    checkUser(str, callback){
        let self = this;
        this.http.doGet('check-maintenance-status', function(error: boolean, response: any){
            if( error ){ 
                self.router.resetConfig([{ path: (new Date().getTime()).toString()+'/:msg', component: MaintenanceComponent}]);
                return callback(true, (new Date().getTime()).toString()+'/'+btoa(response.data.message)); 
            }else{ 
                if(response.data.status == 1){ 
                    return callback(false, ""); 
                } else { 
                    self.router.resetConfig([{ path: (new Date().getTime()).toString()+'/:msg', component: MaintenanceComponent}]);
                    return callback(true, (new Date().getTime()).toString()+'/'+btoa(response.data.message)); 
                } 
            }
        });
    }

    addException(moduleName, functionName, exceptionObj, data: any = {}){
        console.info("--:::::::::: Exception Occurred ::::::::::--");
        console.warn("Module :: "+moduleName+"   Function :: "+functionName);
        console.warn(exceptionObj.message);
        console.warn(exceptionObj);

        let reqObj: any = {
            'error_type': 'Front End Exception',
            'requested_data': { 'exception_error_message': exceptionObj.message, 'exception_error_name': exceptionObj.name, 'data': data },
            'response_sent': exceptionObj.message,
            'url': this.route,
            'request_method': 'N/A',
            'priority': 'Medium',
            'remarks': 'Module Name - '+moduleName+' | '+'Function Name - '+functionName
        } 
        this.http.doPost('writeLog', reqObj, function(error: boolean, response: any){
            if( !error ){ 
                console.log(response.message);
            }
        });
    }

    checkUniqueNess(event: any,path : any, callback){
        let self = this;
        if (!event.valid && !event.dirty) {
            return callback(false);
        }
        try {
            if(event.value != '')
            {
                this.http.doGet(path+event.value,  function (error: boolean, response: any) {
                    //console.log(response);
                    if (error) {
                        return  callback(false);
                    } else {
                        //return  callback(false);
                        return callback(response.data.is_available == 1 ?  true  : false);
                    }
                });
            }
        }
        catch (err) {
            this.addException('check unique', 'checkUniqueNess()', err);
        }
    }

    checkUnique(event: any,path,reqObj, callback) {
        if (!event.valid && !event.dirty) {
            return callback(false);
        }
        try {
            this.http.doPost(path, reqObj, function (error: boolean, response: any) {
                if (error) {
                    return  callback(false);
                } else {
                    //self.pageData.emailAvailability = response.data.is_available;
                    return callback(response.data.is_available == 0 ?  true  : false);
                }
            });
        }
        catch (err) {
            this.addException('check unique', 'checkUnique()', err);
        }
    }
}