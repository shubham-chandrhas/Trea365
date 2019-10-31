import { Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { HttpService } from '../../../shared/service/http.service';
import { ExportService } from '../../../shared/service/export.service';
import { ConstantsService } from '../../../shared/service/constants.service';
import { GlobalService } from '../../../shared/service/global.service';


@Injectable()
export class LocationService {
    private locationSource: any = new BehaviorSubject("");
    private locationDeleteSource: any = new BehaviorSubject("");

    newRecord = this.locationSource.asObservable();
    deletedRecord = this.locationDeleteSource.asObservable();

	constructor(
		private constant: ConstantsService,
		private http: HttpService,
        private exportDoc: ExportService,
        private global: GlobalService,
	){ } 

    updateList(newRecord: any) { this.locationSource.next(newRecord) }
	deleteRecordFromList(recordId: any) { this.locationDeleteSource.next(recordId) }

    //Location API call
    getLocation(callback){
        try{
            this.http.doGet('location/list', function(error: boolean, response: any){
                return callback(error, response);
            });
        }catch(err){
            this.global.addException('location','getLocation()',err);
        }
    }

    addLocation(location, callback){
        try{
            this.http.doPost("location/add", location, function(error: boolean, response: any){
                return callback(error, response);
            });
        }catch(err){
            this.global.addException('location','addLocation()',err);
        }
    }

    updateLocation(locationId, comment, callback){
        try{
            let reqObj = {
                "masterLocationId" : locationId,
                "comment" : comment
            }
            this.http.doPost("admin/masterLocation/edit", reqObj, function(error: boolean, response: any){
                return callback(error, response);
            });
        }catch(err){
            this.global.addException('location','updateLocation()',err);
        }
    };
}