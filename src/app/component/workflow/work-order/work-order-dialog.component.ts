import { Component, Inject, OnInit, ApplicationRef } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import {Location} from '@angular/common';
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { HttpService } from "../../../shared/service/http.service";
import { UtilService } from "../../../shared/service/util.service";
import { ConstantsService } from "../../../shared/service/constants.service";
import { GlobalService } from "../../../shared/service/global.service";
import { WorkOrderService } from "./work-order.service";
import { DialogComponent } from "../../../shared/model/dialog/dialog.component";

@Component({
  selector: "",
  templateUrl: "./work-order-dialog.component.html",
  styleUrls: ["./work-order-dialog.component.css"]
})
export class WorkOrderDialog {
  public action: string;
  public work_order_id: number;
  public sortColumn: String = "employee_id";
  pageData: any = {
    quotationList: [],
    isEdit: false,
    isError: false,
    errMsg: "",
    sortColumn: "status_text",
    sortColumnType: "A",
    sortOrder: "ASC"
  };
  public selectedQuotation: any = "";
  public selectedIndex: any = null;
  public paginationKey: any;
  public listCount: number = 0;
  isError: boolean = false;
  errMsg: string = "";

  public statusSearch;
  public dateSearch;
  public clientSearch;
  public followedBySearch;
  public quoteNoSearch;
  submitted: boolean = false;

  locList: any[] = [];
  locTagsList: any[] = [];
  locationType = "3";
  //addSupplierForm: FormGroup;
  addInLocForm: FormGroup;
  addApproveConfirmationNoteForm:FormGroup;
  filteredSupplier: Observable<string[]>;
  filteredLocations: Observable<string[]>;
  filteredTags: Observable<string[]>;

  constructor(
    public util: UtilService,
    public constant: ConstantsService,
    private global: GlobalService,
    private http: HttpService,
    private ref: ApplicationRef,
    private router: Router,
    private fb: FormBuilder,
    private _location: Location,
    private WOService: WorkOrderService,
    public dialogRef: MatDialogRef<WorkOrderDialog>,
    @Inject(MAT_DIALOG_DATA) public dataObj: any
  ) {
    this.action = dataObj.action;
    if(dataObj && dataObj.work_order_id)
    {
        this.work_order_id = dataObj.work_order_id;
    }
    
    localStorage.removeItem("CREATE_WO");
  }

  ngOnInit() {
    this.dataObj.action == "quotationList" ? this.quotationList() : "";
    this.paginationKey = {
      itemsPerPage: 5,
      currentPage: this.constant.CURRENT_PAGE
    };
    //this.pageData.paginationKey = { itemsPerPage: this.constant.ITEMS_PER_PAGE, currentPage: this.constant.CURRENT_PAGE };
    this.createForm();
    if (this.action != "updateConfirmation") {
      //this.getSupplierList();
      this.getLocationList();
    }

    if (this.action == "approvalConfirmation") {
        this.createApproveConfirmationForm();
      }
  }

  ngOnDestroy() {
    // if( this.action == 'createCRConfirmation'){
    //     if(this.WOService.quatationTab == 'services'){
    //         this.WOService.WO_DATA.servicesDetails = this.dataObj.formDataObj.services;
    //         this.WOService.updateFormStatus('servicesFm', true);
    //     }else if(this.WOService.quatationTab == 'products'){
    //         this.WOService.WO_DATA.materialsDetails = this.dataObj.formDataObj;
    //         this.WOService.updateFormStatus('materialsFm', true);
    //     }
    // }
  }

  changePage(event) {
    this.paginationKey.currentPage = event;
    window.scrollTo(0, 0);
  }
  changeItemPerPage() {
    window.scrollTo(0, 0);
  }
  updateCount(count) {
    this.constant.ITEM_COUNT = count;
    this.listCount = count;
  }

  public createApproveConfirmationForm(){
    this.addApproveConfirmationNoteForm = this.fb.group({
        approve_note: new FormControl(''),
    });
    }
get approve_note() {
        return this.addInLocForm.get("approve_note");
      }
    
      confirm(): void {
        let self = this;
        self.errMsg = '';
        self.isError = false;
        try {
            var reqObj = {
                work_order_id: this.work_order_id,
                approve_note: this.addApproveConfirmationNoteForm.get('approve_note').value
            };
            self.util.addSpinner('confirm-btn', 'Confirm');
            this.http.doPost("workOrderComplete", reqObj, function (error: boolean, response: any) {
                self.util.removeSpinner('confirm-btn', 'Confirm');
                if (error) {
                    self.errMsg = response.message;
                    self.isError = true;
                } else {
                    self.closeDialog();
                    self.util.showDialog(DialogComponent, response.message, ['/workflow/wo/csa/work-order-list/0']);
                    if(self._location.path().includes("work-order-list")){
                        console.log("include");
                        self.util.changeEvent({
                            'source': 'APPROVAL_WO',
                            'action': 'COMPLETE',
                            'data': response.data
                        });
                    }
                }
            });
        } catch (err) {
            this.global.addException('Project Estimator', 'confirm()', err);
        }

    }  

  quotationList() {
    var self = this;
    self.pageData.quotationList = [];
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("getProjectEstimateListForWo", function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log(error);
        } else {
          self.pageData.quotationList = response.data;
          for (let i = 0; i < response.data.length; i++) {
            // Client Last Name
            response.data[i].client_details.last_name =
              response.data[i].client_details.last_name !== null
                ? response.data[i].client_details.last_name
                : "";

            // Follower Last_name
            self.pageData.quotationList[i].last_name = response.data[i].follower
              ? response.data[i].follower.last_name !== null
                ? response.data[i].follower.last_name
                : ""
              : "";

            self.pageData.quotationList[i].status_text =
              response.data[i].status_details.status;
            self.pageData.quotationList[i].company_name = response.data[i]
              .client_details.company_name
              ? response.data[i].client_details.company_name
              : response.data[i].client_details.first_name +
                " " +
                response.data[i].client_details.last_name;
            self.pageData.quotationList[i].first_name = response.data[i]
              .follower
              ? response.data[i].follower.first_name +
                " " +
                response.data[i].follower.last_name
              : "N/A";
            self.pageData.quotationList[i].follower = {
              first_name: response.data[i].follower
                ? response.data[i].follower.first_name +
                  " " +
                  response.data[i].follower.last_name
                : "N/A"
            };
          }
          self.constant.ITEM_COUNT = response.data.length;
          self.util.hideProcessing("processing-spinner");
          // self.pageData.quotationList = self.pageData.quotationList.filter(item=>(item.status_text == "Approved" || item.status_text == "Scheduled"));
          // console.log(self.pageData.quotationList);
        }
      });
    } catch (err) {
      this.global.addException("Error Log", "constructor()", err);
    }
  }
  getSelectedQuotation(quotation, index) {
    try {
      var self = this;
      self.selectedIndex = index;
      self.selectedQuotation = quotation;
      this.pageData.isError = false;
      this.pageData.errMsg = "";
    } catch (err) {
      this.global.addException(
        "QuotationSelection",
        "getSelectedQuotation()",
        err
      );
    }
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
  goToWoSetup() {
    try {
      if (this.selectedQuotation) {
        let create_WO_Obj: any = {};
        create_WO_Obj.project_estimate_id = this.selectedQuotation.project_estimate_id;
        create_WO_Obj.WO_TYPE = "External Contractor";
        localStorage.setItem("CREATE_WO", JSON.stringify(create_WO_Obj));
        this.dialogRef.close();
        this.router.navigate(["/workflow/wo/csa/wo-setup"]);
      } else {
        this.pageData.isError = true;
        this.pageData.errMsg =
          "Please select quotation from the list to proceed.";
      }
    } catch (err) {
      this.global.addException("WO", "goToWoSetup()", err);
    }
  }
  goToNewWOReview() {
    if (this.selectedQuotation) {
      let create_WO_Obj: any = {};
      create_WO_Obj.project_estimate_id = this.selectedQuotation.project_estimate_id;
      create_WO_Obj.WO_TYPE = "External Contractor";
      localStorage.setItem("CREATE_WO", JSON.stringify(create_WO_Obj));
      this.dialogRef.close();
      this.router.navigate(["/workflow/wo/csa/wo-quotation-review"]);
    } else {
      this.pageData.isError = true;
      this.pageData.errMsg =
        "Please select quotation from the list to proceed.";
    }
  }

  // WO Product Material

  createForm(): void {
    // this.addSupplierForm = this.fb.group({
    //     supplier_id: new FormControl('', [Validators.required]),
    //     supplier: new FormControl('')
    // });

    this.addInLocForm = this.fb.group({
      location: new FormControl(""),
      location_id: new FormControl("", [Validators.required]),
      location_tag: new FormControl(""),
      location_tag_id: new FormControl("", [Validators.required])
    });
  }

  getLocType() {
    this.submitted = false;
  }

  //get supplier_id() { return this.addSupplierForm.get('supplier_id'); }
  //get supplier() { return this.addSupplierForm.get('supplier'); }
  get location() {
    return this.addInLocForm.get("location");
  }
  get location_id() {
    return this.addInLocForm.get("location_id");
  }
  get location_tag() {
    return this.addInLocForm.get("location_tag");
  }
  get location_tag_id() {
    return this.addInLocForm.get("location_tag_id");
  }

  // private getSupplierList(origin: string = 'INIT'): void {
  //     var self = this;
  //     try{
  //         this.util.showProcessing('processing-spinner');
  //         this.http.doGet('suppliers', function(error: boolean, response: any){
  //             if(error){  console.log("error",response); }else{
  //                 self.util.hideProcessing('processing-spinner');
  //                 self.pageData.supplierList = [];

  //                 for (let i = 0; i < response.data.length; i++) {
  //                     if(response.data[i].supplier_type.type_id == 2){
  //                         self.pageData.supplierList = self.pageData.supplierList.concat(response.data[i].suppliers);
  //                     }
  //                 }
  //                 self.filteredSupplier = self.supplier.valueChanges.pipe(startWith(''),map(value => self.assetSupplierFilter(value)));
  //             }
  //         });
  //     }catch(err){
  //         this.global.addException('Assets New','getSupplierList()',err);
  //     }
  // }
  // getSelectedSupplier(supplier, event:any = false): void {
  //     if(event.isUserInput){
  //         this.supplier_id.setValue(supplier.supplier_id);
  //     }
  // }

  // private assetSupplierFilter(value: string): string[] {
  //     try{
  //         return this.pageData.supplierList.filter(option => option.supplier_type == 'Assets' && option.supplier_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
  //     }catch(err){
  //         this.global.addException('Assets New','assetSupplierFilter()',err);
  //     }
  // }
  // private financeSupplierFilter(value: string): string[] {
  //     try{
  //         return this.pageData.supplierList.filter(option => option.supplier_type == 'Finance' && option.supplier_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
  //     }catch(err){
  //         this.global.addException('Assets New','financeSupplierFilter()',err);
  //     }
  // }
  // public validateSupplier(event:any){
  //     try{
  //         let supplier = event.target.value;
  //         let match = this.pageData.supplierList.filter(item=>(item.supplier_type == 'Assets' && item.supplier_name.toLowerCase() == supplier.toLowerCase()));
  //         if(supplier == ''){
  //             this.supplier_id.setValue('');
  //             return;
  //         }
  //         if(match.length > 0){
  //             this.supplier_id.setValue(match[0].supplier_id);
  //             this.supplier.setValue(match[0].supplier_name);
  //         }
  //     }catch(err){
  //         this.global.addException('Assets New','validateSupplier()',err);
  //     }
  // }

  getLocationList() {
    let self = this;
    try {
      self.locList = this.dataObj.locationDetails;
      self.filteredLocations = self.location.valueChanges.pipe(
        startWith(""),
        map(value => self.locationFilter(value))
      );

      // this.http.doGet('location/list', function(error: boolean, response: any){
      //     if( error ){
      //     }else{
      //         self.locList = response.data;
      //         self.filteredLocations = self.location.valueChanges.pipe(startWith(''),map(value => self.locationFilter(value)));
      //     }
      // });
    } catch (err) {
      this.global.addException("Work Order Internal", "getLocationList()", err);
    }
  }
  private locationFilter(value: string): string[] {
    try {
      return this.locList.filter(option =>
        option.location_name
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Work Order Internal", "locationFilter()", err);
    }
  }
  public validateLoc(event: any) {
    try {
      let loc = event.target.value;
      let match = this.locList.filter(
        item => item.location_name.toLowerCase() == loc.toLowerCase()
      );
      if (match.length > 0) {
        this.location.setValue(match[0].location_name);
        this.location_id.setValue(match[0].location_id);
        this.getLocationTags(match[0].locationTag);
      }
    } catch (err) {
      this.global.addException("Work Order Internal", "validateLoc()", err);
    }
  }
  getSelectedLocation(event: any, selectedLoc: any) {
    try {
      if (event.isUserInput) {
        this.location_id.setValue(selectedLoc.location_id);
        this.getLocationTags(selectedLoc.locationTag);
      }
    } catch (err) {
      this.global.addException(
        "Work Order Internal",
        "getSelectedLocation()",
        err
      );
    }
  }
  getSelectedTag(event: any, selectedTag: any) {
    try {
      if (event.isUserInput) {
        this.location_tag_id.setValue(selectedTag.location_tag_id);
      }
    } catch (err) {
      this.global.addException("Work Order Internal", "getSelectedTag()", err);
    }
  }
  getLocationTags(tags) {
    var self = this;
    try {
      self.locTagsList = tags;
      self.filteredTags = self.location_tag.valueChanges.pipe(
        startWith(""),
        map(value => self.locationTagsFilter(value))
      );

      // this.http.doGet('location/tag/'+id, function(error: boolean, response: any){
      //     console.log(response);
      //     if(error){  console.log("error",response); }else{
      //         self.locTagsList = response.tags;
      //         self.filteredTags = self.location_tag.valueChanges.pipe(startWith(''),map(value => self.locationTagsFilter(value)));
      //     }
      // });
    } catch (err) {
      this.global.addException("Work Order Internal", "getLocationTags()", err);
    }
  }
  private locationTagsFilter(value: string): string[] {
    try {
      return this.locTagsList.filter(option =>
        option.location_tag
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException(
        "Work Order Internal",
        "locationTagsFilter()",
        err
      );
    }
  }
  public validateLocTags(event: any) {
    try {
      let loc = event.target.value;
      let match = this.locTagsList.filter(
        item => item.location_tag.toLowerCase() == loc.toLowerCase()
      );
      if (match.length > 0) {
        this.location_tag.setValue(match[0].location_tag);
        this.location_tag_id.setValue(match[0].location_tag_id);
      }
    } catch (err) {
      this.global.addException("Work Order Internal", "validateLocTags()", err);
    }
  }

  select(): void {
    try {
      this.submitted = true;
      // if(this.locationType == '1' && !this.addSupplierForm.valid){
      //     return;
      // }
      if (this.locationType == "3" && !this.addInLocForm.valid) {
        return;
      }
      let locObj: any = {
        type: this.locationType,
        supplier_id: "",
        supplierName: "",
        //'supplier_id': this.locationType == '1' ? this.addSupplierForm.get('supplier_id').value : '',
        //'supplierName': this.locationType == '1' ? this.addSupplierForm.get('supplier').value : '',
        location:
          this.locationType == "3"
            ? this.addInLocForm.get("location").value
            : "",
        location_id:
          this.locationType == "3"
            ? this.addInLocForm.get("location_id").value
            : "",
        location_tag:
          this.locationType == "3"
            ? this.addInLocForm.get("location_tag").value
            : "",
        location_tag_id:
          this.locationType == "3"
            ? this.addInLocForm.get("location_tag_id").value
            : ""
      };

      this.util.changeEvent({
        source: "EXTERNAL_WO",
        action: "ADD_LOCATION",
        data: locObj
      });
      //console.log(this.addSupplierForm.value);
      this.dialogRef.close();
    } catch (err) {
      this.global.addException("WO", "select()", err);
    }
  }

  yes = () => {
    let self = this;
    this.util.addSpinner("addCRBtn", "Yes");
    this.WOService.addCR(function(error: boolean, response: any) {
      self.util.removeSpinner("addCRBtn", "Yes");
      self.util.removeSpinner("update-btn", "Update");
      if (error) {
        self.isError = true;
        self.errMsg = response.message + "!!  Please edit the information.";
      } else {
        self.dialogRef.close();
        self.util.showDialog(DialogComponent, response.message, [
          "/workflow/wo/csa/work-order-list/0"
        ]);
      }
    });
  };

  continueCreatingCR = () => {
    //if(this.WOService.quatationTab == 'services'){
    // this.WOService.WO_DATA.servicesAdditionalInfo = {
    //     'woType': this.dataObj.formDataObj.woType,
    //     'peServicesCount': this.dataObj.formDataObj.peServicesCount
    // }
    //this.WOService.WO_DATA.servicesDetails = this.dataObj.formDataObj.services;
    //this.WOService.updateFormStatus('servicesFm', true);
    //}else if(this.WOService.quatationTab == 'products'){
    // this.WOService.WO_DATA.materialsAdditionalInfo = {
    //     'woType': this.dataObj.materialInfo.woType,
    //     'peMaterialsCount': this.dataObj.materialInfo.peMaterialsCount
    // }
    //this.WOService.WO_DATA.materialsDetails = this.dataObj.formDataObj;
    //this.WOService.updateFormStatus('materialsFm', true);
    //}
    console.log(this.dataObj);
    this.dialogRef.close();
    //this.WOService.currentClick == 'save' ? this.WOService.quatationTab == 'services' ? this.router.navigate(['/workflow/wo/csa/wo-external/team']) : this.callWOEvent() : this.router.navigate(['/workflow/wo/csa/wo-external/'+this.WOService.currentClick]);
    // if(this.WOService.currentClick == 'save' && this.WOService.quatationTab == 'products'){
    //     this.callWOEvent();
    // }else{
    //this.WOService.quatationTab == 'services' ? this.router.navigate(['/workflow/wo/csa/wo-external/team']) : this.WOService.currentClick != 'save' ? this.router.navigate(['/workflow/wo/csa/wo-external/'+this.WOService.currentClick]) : '';
    //}
  };

  callWOEvent(): void {
    this.util.changeEvent({
      source: "EXTERNAL_WO",
      action: "CONTINUE_CREATING_CR",
      data: {}
    });
  }
}
