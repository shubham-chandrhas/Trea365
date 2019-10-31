import { Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class NewCrmService{

    public isEditFromList:boolean = false;
    public updateClientId:any;
    private crmSource: any = new BehaviorSubject("");
    private crmDeleteSource: any = new BehaviorSubject("");

    newRecord = this.crmSource.asObservable();
    deletedRecord = this.crmDeleteSource.asObservable();

    constructor(){}
    updateList(newRecord: any) { this.crmSource.next(newRecord); console.log("newRecord",newRecord) }
	deleteRecordFromList(recordObj: any) { this.crmDeleteSource.next(recordObj) }

}
