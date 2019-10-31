import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
  NgZone
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  NgForm,
  AbstractControl
} from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { MapsAPILoader } from "@agm/core";

import { HttpService } from "../../../shared/service/http.service";
import { UtilService } from "../../../shared/service/util.service";
import { ConstantsService } from "../../../shared/service/constants.service";
import { FileService } from "../../../shared/service/file.service";
import { GlobalService } from "../../../shared/service/global.service";
import { DialogComponent } from "../../../shared/model/dialog/dialog.component";

declare var jquery: any;
declare var $: any;

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.css"]
})
export class SettingsComponent implements OnInit {
  editSettingsFrm: FormGroup;

  public errMsg: string = "";
  
  public isError: boolean = false;
  public submitted: boolean = false;
  public settingDetails: any = [];
  public dateFormat: any = [];
  public uomCount: number = 0;

  @ViewChild("search")
  public searchElementRef: ElementRef

  constructor(
    public util: UtilService,
    private http: HttpService,
    private router: Router,
    private fb: FormBuilder,
    public constant: ConstantsService,
    private route: ActivatedRoute,
    private file: FileService,
    public dialog: MatDialog,
    private global: GlobalService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.util.menuChange({ menu: "settings", subMenu: "" });
    this.editSettingsForm("0");
    
    this.getSettingList();
    let self = this;
    this.util.changeDetection.subscribe(dataObj => {
        if (dataObj && dataObj.source == "SETTINGS") {
            for(var i = self.uomCount ; i  >= 0 ; i--)
            {
                self.uom_lists.removeAt(i);
            }
            self.getSettingList();
          }
    });
  }

  getSettingList() {
    let self = this;
    try {
        self.util.showProcessing('processing-spinner');
        this.http.doGet("setting", function(error: boolean, response: any) {
        if (error) {
        } else {
            self.settingDetails =  response.data;
            for (var i = 0; i < self.settingDetails.length ; i++)
            {
                if(self.settingDetails[i].setting_key == 'date_format')
                {
                    self.dateFormat = self.settingDetails[i].all_values;
                }

                if(self.settingDetails[i].setting_key != 'uom_lists')
                {
                    self.editSettingsFrm.get(self.settingDetails[i].setting_key).setValue(self.settingDetails[i].setting_value);

                    self.settingDetails[i].is_disable ?  self.editSettingsFrm.get(self.settingDetails[i].setting_key).disable() : '';
                }
                else if(self.settingDetails[i].setting_key == 'uom_lists')
                {
                    if(self.settingDetails[i].setting_value.length > 0)
                    {
                        for (let j = 0; j < self.settingDetails[i].setting_value.length; j++) {
                            self.addUom("1", self.settingDetails[i].setting_value[j]);
                        }
                    }
                    else
                    {
                        self.addUom("0");
                    }
                }
            }
            
            let USER = JSON.parse(atob(localStorage.getItem("USER")));
            USER.settings = response.data;
            localStorage.setItem('USER', btoa(JSON.stringify(USER))); 
        }
        self.util.hideProcessing('processing-spinner');
      });
    } catch (err) {
      this.global.addException("Assets New", "getLocationList()", err);
    }
  }

  public editSettingsForm(option,settingData: any = {}) {
    this.editSettingsFrm = this.fb.group({
        date_format: new FormControl(option == "0" ? "" : settingData.setting_key == 'date_format' ? settingData.setting_value : '', [
        Validators.required,
      ]),
      tax_rate: new FormControl(option == "0" ? "" : settingData.setting_key == 'tax_rate' ? settingData.setting_value : '', [
        Validators.required
      ]),
      geofencing_radius: new FormControl(option == "0" ? "" : settingData.setting_key == 'geofencing_radius' ? settingData.setting_value : '', [
        //Validators.required
      ]),
      po_starting_no: new FormControl(option == "0" ? "" : settingData.setting_key == 'po_starting_no' ? settingData.setting_value : '', [
        Validators.required,
        Validators.pattern(this.constant.ONLY_NUMBER_WITHOUT_ZERO)
      ]),
      pe_starting_no: new FormControl(option == "0" ? "" : settingData.setting_key == 'pe_starting_no' ? settingData.setting_value : '', [
        Validators.required,
        Validators.pattern(this.constant.ONLY_NUMBER_WITHOUT_ZERO)
      ]),
      rs_starting_no: new FormControl(option == "0" ? "" : settingData.setting_key == 'rs_starting_no' ? settingData.setting_value : '', [
        Validators.required,
        Validators.pattern(this.constant.ONLY_NUMBER_WITHOUT_ZERO)
      ]),
      wo_starting_no: new FormControl(option == "0" ? "" : settingData.setting_key == 'wo_starting_no' ? settingData.setting_value : '', [
        Validators.required,
        Validators.pattern(this.constant.ONLY_NUMBER_WITHOUT_ZERO)
      ]),
      invoice_starting_no: new FormControl(option == "0" ? "" : settingData.setting_key == 'invoice_starting_no' ? settingData.setting_value : '', [
        Validators.required,
        Validators.pattern(this.constant.ONLY_NUMBER_WITHOUT_ZERO)
      ]),
      maintenance_starting_no: new FormControl(option == "0" ? "" : settingData.setting_key == 'maintenance_starting_no' ? settingData.setting_value : '', [
        Validators.required,
        Validators.pattern(this.constant.ONLY_NUMBER_WITHOUT_ZERO)
      ]),
      pagination_count: new FormControl(option == "0" ? "" : settingData.setting_key == 'pagination_count' ? settingData.setting_value : '', [
        Validators.required,
      ]),
      uom_lists: this.fb.array([]),
      invoice_terms_condition: new FormControl(option == "0" ? "" : settingData.setting_key == 'invoice_terms_condition' ? settingData.setting_value : '', [
        //Validators.required,
      ]),
      quotation_terms_condition: new FormControl(option == "0" ? "" : settingData.setting_key == 'quotation_terms_condition' ? settingData.setting_value : '', [
        //Validators.required,
      ]),
      work_order_condition: new FormControl(option == "0" ? "" : settingData.setting_key == 'work_order_condition' ? settingData.setting_value : '', [
        //Validators.required,
      ]),
      company_email: new FormControl(option == "0" ? "" : settingData.setting_key == 'company_email' ? settingData.setting_value : '', [Validators.required,
        Validators.pattern(this.constant.EMAIL_PATTERN)
      ]),
      company_website: new FormControl(option == "0" ? "" : settingData.setting_key == 'company_website' ? settingData.setting_value : '', [
        Validators.pattern(this.constant.WEBSITE_PATTERN)
      ]),
    });
    // if(settingData.setting_key == 'uom_lists')
    // {
    //     for (let i = 0; i < settingData.setting_value.length; i++) {
    //         this.addUom("1", settingData.setting_value[i]);
    //     }
    // }  
  }

  get date_format() {
    return this.editSettingsFrm.get("date_format");
  }
  get tax_rate() {
    return this.editSettingsFrm.get("tax_rate");
  }
  get geofencing_radius() {
    return this.editSettingsFrm.get("geofencing_radius");
  }
  get po_starting_no() {
    return this.editSettingsFrm.get("po_starting_no");
  }
  get pe_starting_no() {
    return this.editSettingsFrm.get("pe_starting_no");
  }
  get rs_starting_no() {
    return this.editSettingsFrm.get("rs_starting_no");
  }
  get wo_starting_no() {
    return this.editSettingsFrm.get("wo_starting_no");
  }
  get invoice_starting_no() {
    return this.editSettingsFrm.get("invoice_starting_no");
  }
  get maintenance_starting_no() {
    return this.editSettingsFrm.get("maintenance_starting_no");
  }
  get pagination_count() {
    return this.editSettingsFrm.get("pagination_count");
  }
  get uom_lists(): FormArray {
    return (<FormArray>this.editSettingsFrm.get("uom_lists")) as FormArray;
  }
  get invoice_terms_condition() {
    return this.editSettingsFrm.get("invoice_terms_condition");
  }
  get quotation_terms_condition() {
    return this.editSettingsFrm.get("quotation_terms_condition");
  }

  get work_order_condition() {
    return this.editSettingsFrm.get("work_order_condition");
  }

  get company_email() {
    return this.editSettingsFrm.get("company_email");
  }
  get company_website() {
    return this.editSettingsFrm.get("company_website");
  }


  addUom(option, uomData: any = {}) {
    this.submitted = false;
    try {
      this.uom_lists.push(
        this.fb.group({
          unit_name: new FormControl(option == "1" ? uomData.unit_name : "", [
            //Validators.required
          ]),
          unit_symbol: new FormControl(option == "1" ? uomData.unit_symbol : "", [
            //Validators.required
          ]),
          unit_plural_symbol: new FormControl(option == "1" ? uomData.unit_plural_symbol : "", [
           // Validators.required
          ])
        })
      );
      this.uomCount++;
    } catch (err) {
      this.global.addException("Settings", "addUom()", err);
    }
  }

  removeService(position, uom): void {
    this.uomCount--;
    this.uom_lists.removeAt(position);
  }

  updateSettingDetails(form: FormGroup) {
    var self = this;
    this.errMsg = "";
    this.isError = false;
    this.submitted = true;
    
    try {
      if (form.valid) {
        let formData: FormData = new FormData();
        let settings = [];
        for (var i = 0; i < this.settingDetails.length ; i++)
        {
            var type = this.settingDetails[i].setting_key;
            var reqObj = {
                "setting_id":this.settingDetails[i].setting_id,
                "setting_key": this.settingDetails[i].setting_key,
                "setting_value": form.value[type]
            }
            settings.push(reqObj);
        }

        // formData.append("date_format", form.value.date_format);
        // formData.append("tax_rate", form.value.tax_rate);
        // formData.append("geofencing_radius", form.value.geofencing_radius);
        // formData.append("po_starting_no", form.value.po_starting_no);
        // formData.append("pe_starting_no", form.value.pe_starting_no);
        // formData.append("rs_starting_no", form.value.rs_starting_no);
        // formData.append("wo_starting_no", form.value.wo_starting_no);
        // formData.append("invoice_starting_no", form.value.invoice_starting_no);
        // formData.append("maintenance_starting_no", form.value.maintenance_starting_no);
        // formData.append("pagination_count", form.value.pagination_count);
        // formData.append("uom_lists", JSON.stringify(form.value.uom_lists));

        formData.append("settings", JSON.stringify(settings));
        
        self.util.addSpinner("edit-acc-btn", "Update");
        this.file.formDataAPICall(formData, "setting/update", function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("edit-acc-btn", "Update");
          if (error) {
            self.isError = true;
            self.errMsg = response.message;
          } else {
            self.dialog.open(SettingsDialog, {
              data: { action: "updateSuccess" }
            });
          }
        });
      }
    } catch (err) {
      this.global.addException("Edit Account", "updateAccDetails()", err);
    }
  } 
}


@Component({
  selector: "",
  templateUrl: "./settings-dialog.html",
  styleUrls: ["./settings.component.css"]
})
export class SettingsDialog {
  public action: string;
  constructor(
    public dialogRef: MatDialogRef<SettingsDialog>,
    @Inject(MAT_DIALOG_DATA) public dataObj: any,
    private router: Router,
    private util: UtilService,
  ) {
    this.action = dataObj.action;
  }

  closeDialog(): void {
    this.dialogRef.close();
    this.router.navigate(["/csa-onboarding/settings"]);
    this.util.changeEvent({ source: "SETTINGS", action: "ADD" });
  }
}
