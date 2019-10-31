import { Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ConstantsService } from '../../shared/service/constants.service';
import { ExportService } from '../../shared/service/export.service';
import { HttpService } from '../../shared/service/http.service';
import { FileService } from '../../shared/service/file.service';

@Injectable()
export class AdminService {
    private adminSource: any = new BehaviorSubject("");
    private adminDeleteSource: any = new BehaviorSubject("");

    newRecord = this.adminSource.asObservable();
    deletedRecord = this.adminDeleteSource.asObservable();

	constructor(
		private constant: ConstantsService,
		private http: HttpService,
        private exportDoc: ExportService,
        private file: FileService 
	){ } 

    updateList(newRecord: any) { this.adminSource.next(newRecord) }
	deleteRecordFromList(recordObj: any) { this.adminDeleteSource.next(recordObj) }

   //Get Item Class List
    getItemClassList(callback){
        this.http.doGet('itemclass', function(error: boolean, response: any){
            return callback(error, response);
        });
    }

    deleteRecord(url, recordObj, callback){
        this.http.doPost(url, recordObj, function(error: boolean, response: any){
            return callback(error, response);
        });
    }

    //Manufacturer API call
    getManufacturerList(callback){
        this.http.doGet('manufacturer', function(error: boolean, response: any){
            return callback(error, response);
        });
    }

    //Manufacturer part API call
    getManufacturerPartList(callback){
        this.http.doGet('manufPart', function(error: boolean, response: any){
            return callback(error, response);
        });
    }  

    //New
    printPreview(sectionId): void {
        let printContents, popupWin;
        printContents = document.getElementById(sectionId).innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`
          <html>
            <head>
              <title>Print Tags</title>
              <style>
                .print-area table{ border:1px dashed; }   
                .print-area td{ border:1px dashed;padding: 10px 20px; } 
                .print-area .locName{ text-align: center;padding-bottom: 5px;font-weight: bold; }
                .print-area img{ width: 200px; }
              </style>
            </head>
            <body onload="window.print();window.close()">${printContents}</body>
          </html>`
        );
        popupWin.document.close();
    }

}