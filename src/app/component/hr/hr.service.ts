import { Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Validators } from '@angular/forms';

import { ConstantsService } from '../../shared/service/constants.service';
import { ExportService } from '../../shared/service/export.service';
import { HttpService } from '../../shared/service/http.service';
import { FileService } from '../../shared/service/file.service';

@Injectable()
export class HrService {
	//docObj: any[] = [];
	constructor(private constant: ConstantsService){}
	// setDocumentObj(doc: any[]){ this.docObj = doc };
	// getDocumentObj(){ return this.docObj; }

	// getValidator(type){
	// 	let list: any = [];
	// 	switch (type) {
	// 		case "Number":
	// 			list = [ Validators.pattern(this.constant.POS_AND_NEQ_NUMBERS_PATTERN) ];
	// 			break;
	// 		case "Decimal":
	// 			list = [ Validators.pattern(this.constant.DECIMAL_NUMBERS_PATTERN) ];
	// 			break;
	// 		case "Date":
	// 			list = [ Validators.pattern(this.constant.DATA_PATTERN) ];
	// 			break;
	// 		default:
	// 			list = [];
	// 			break;
	// 	}
	// 	return list;
	// }
}