import { Component, OnInit, ApplicationRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { WorkOrderService } from '../work-order.service';

import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
import { max } from 'rxjs/operator/max';

@Component({
    selector: 'app-wo-setup',
    templateUrl: './wo-setup.component.html',
    styleUrls: ['./wo-setup.component.scss']
})
export class WoSetupComponent implements OnInit {
    subAssigneeList: any = [];
    WOSetupForm: FormGroup;
    selectedQuotation: any = '';
    submitted: boolean = false;
    isRecurringWO: boolean = false;

    filteredAssignee: Observable<string[]>;

    constructor(
        public dialog: MatDialog,
        private fb: FormBuilder,
        public util: UtilService,
        public constant: ConstantsService,
        private global: GlobalService,
        private http: HttpService,
        private router: Router,
        private ref: ApplicationRef,
        private WOService: WorkOrderService,
        public route:ActivatedRoute
    ) {
        let workOrderObj: any = {};
        workOrderObj =  JSON.parse(localStorage.getItem('CREATE_WO'));
        localStorage.getItem('CREATE_WO') ? this.getQuotation(workOrderObj.project_estimate_id) :'';
    }

    ngOnInit() {
        this.util.menuChange({'menu':4,'subMenu':26});
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.createForm();
        this.getAssigneeList();
        this.WOService.associatedAsset = [];
        sessionStorage.removeItem('woSetupData');
    }

    getQuotation(id){
        var self = this;
        this.util.showProcessing('processing-spinner');
        try{
            this.http.doGet('getProjectEstimateById/'+id, function(error: boolean, response: any){
                if( error ){
                    console.log(response)
                }else{
                    self.selectedQuotation = response.data;
                    console.log(self.selectedQuotation);
                    self.util.hideProcessing('processing-spinner');
                    self.selectedQuotation.cost_of_services = response.data.costs.length > 0 ? response.data.costs[0].cost_of_services : '';
                    self.selectedQuotation.shipping_handling = response.data.costs.length > 0 ?  response.data.costs[0].shipping_and_handling : '';
                    self.selectedQuotation.adjustment = response.data.costs.length > 0 ?  response.data.costs[0].adjustment : '' ;
                    self.selectedQuotation.sub_total = response.data.costs.length > 0 ?  response.data.costs[0].subtotal : '';
                    self.selectedQuotation.taxes = response.data.costs.length > 0 ?  response.data.costs[0].taxes : '';
                    self.selectedQuotation.tax_amount = response.data.costs.length > 0 ?  response.data.costs[0].tax_amount : '';
                    self.selectedQuotation.total_cost = response.data.costs.length > 0 ?  response.data.costs[0].total_cost : '';

                    self.isRecurringWO = self.selectedQuotation.schedules ? self.selectedQuotation.schedules.schedule_type == 2 ? true : false : false;

                    for(let i = 0; i < self.selectedQuotation.payment_schedules.length; i++){
                        self.selectedQuotation.payment_schedules[i].date = self.selectedQuotation.payment_schedules[i].payment_date;
                    }

                    for(let i = 0; i<self.selectedQuotation.services.length; i++){
                        if(self.isRecurringWO){
                            self.selectedQuotation.services[i].wo_total_quantity = parseFloat(self.selectedQuotation.services[i].quantity);
                            self.selectedQuotation.services[i].quantity = self.selectedQuotation.services[i].wo_remaining_quantity = (parseFloat(self.selectedQuotation.services[i].wo_remaining_quantity)/self.constant.TEMP.length).toFixed(2);
                        }
                        parseFloat(self.selectedQuotation.services[i].wo_remaining_quantity) > 0 && self.selectedQuotation.services[i].is_approved == '1' ? self.addService(i,self.selectedQuotation.services[i]) : '';
                    }
                    for(let i = 0; i<self.selectedQuotation.product_materials.length; i++){
                        if(self.isRecurringWO){
                            self.selectedQuotation.product_materials[i].wo_total_quantity = parseFloat(self.selectedQuotation.product_materials[i].quantity);
                            self.selectedQuotation.product_materials[i].quantity =  self.selectedQuotation.product_materials[i].wo_remaining_quantity = (parseFloat(self.selectedQuotation.product_materials[i].wo_remaining_quantity)/self.constant.TEMP.length).toFixed(2);
                        }
                        parseFloat(self.selectedQuotation.product_materials[i].wo_remaining_quantity) > 0  && self.selectedQuotation.product_materials[i].is_approved == '1' ? self.addMaterial(i,self.selectedQuotation.product_materials[i]) : '';
                    }
                }
            });
        }catch(err){
        this.global.addException('Error Log','constructor()',err);
        }
    }

    getAssigneeList(){
        let self = this;
        try{
            // getSubContractor getCommonStatus
            this.http.doGet('getCommonStatus/WO_ASSIGN_TO', function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){ console.log(response) }else{
                    console.log("cotractor List =",response.data.statusList);
                    self.subAssigneeList = response.data.statusList;
                    console.log("cotractor List =",self.subAssigneeList);
                    self.filteredAssignee = self.assignee.valueChanges.pipe(startWith(''),map(value => self.assigneeFilter(value)));
                }
            });
        }
        catch(err){
        this.global.addException('sub assignee list','getAssigneeList()',err);
        }
    }

    getSelectedAssignee(assignee,event:any): void {
        if(event.isUserInput){
            console.log(assignee);
            this.assignee_id.setValue(assignee.type_id);
        }
    }

    private assigneeFilter(value: string): string[] {
        return this.subAssigneeList.filter(option => option.status.toLowerCase().includes(value ? value.toLowerCase() : ''));
    }

    public validateAssignee(event:any){
        let assignee = event.target.value;
        let match = this.subAssigneeList.filter(item=>item.status.toLowerCase() == assignee.toLowerCase());
        if(assignee == ''){
            this.assignee_id.setValue('');
            return;
        }
        if(match.length > 0){
            this.assignee_id.setValue(match[0].type_id);
            this.assignee.setValue(match[0].status);
        }
    }

    public createForm(){
        this.WOSetupForm = this.fb.group({
            assignee: new FormControl('', [Validators.required]),
            assignee_id: new FormControl('', [Validators.required]),
            add_all_WO: new FormControl(1),
            services: this.fb.array([]),
            materials: this.fb.array([])
        });
    }
    get assignee(){return this.WOSetupForm.get('assignee');}
    get assignee_id(){return this.WOSetupForm.get('assignee_id');}
    get add_all_WO(){return this.WOSetupForm.get('add_all_WO');}
    get services(): FormArray{ return <FormArray>this.WOSetupForm.get('services') as FormArray; };
    get materials(): FormArray{ return <FormArray>this.WOSetupForm.get('materials') as FormArray; };

    getServiceAt(index){ return this.services.at(index) };
    getMaterialAt(index){ return this.materials.at(index) };

    addService(serviceIndx, serviceObj: any = {}){

        this.services.push(this.fb.group({
            service: new FormControl(serviceObj.service_defination ? serviceObj.service_defination.service_definition : serviceObj.service_definition_id == 0 ? serviceObj.ad_hoc_service : ''),
            details: new FormControl(serviceObj.details),
            quantity: new FormControl(serviceObj.quantity),
            invoice_remaining_quantity: new FormControl(serviceObj.invoice_remaining_quantity),
            pe_service_id: new FormControl(serviceObj.pe_service_id),
            wo_remaining_quantity: new FormControl(serviceObj.wo_remaining_quantity),
            // WO_quantity: new FormControl(serviceObj.wo_remaining_quantity, [Validators.required, Validators.max(serviceObj.wo_remaining_quantity), Validators.pattern(this.constant.AMOUNT_PATTERN_3DECIMAL)]),
            WO_quantity: new FormControl(serviceObj.wo_remaining_quantity, [Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]),
            cost: new FormControl(serviceObj.cost),
            service_definition_id: new FormControl(serviceObj.service_defination ? serviceObj.service_defination.service_definition_id : ''),
            total_amount: new FormControl(serviceObj.total_amount),
            
        }));
    }

    addMaterial(materialIndx, materialObj: any = {}){
        console.log("materialObj :: ",materialObj);
        this.materials.push(this.fb.group({
            material_details: new FormControl(materialObj.manf_part ? materialObj.manf_part.short_name : ''),
            details: new FormControl(materialObj.details),
            quantity: new FormControl(materialObj.quantity),
            invoice_remaining_quantity: new FormControl(materialObj.invoice_remaining_quantity),
            pe_product_material_id: new FormControl(materialObj.pe_product_material_id),
            wo_remaining_quantity: new FormControl(materialObj.wo_remaining_quantity),
            // WO_quantity: new FormControl(materialObj.wo_remaining_quantity, [Validators.required, Validators.max(materialObj.wo_remaining_quantity), Validators.pattern(this.constant.AMOUNT_PATTERN_3DECIMAL)]),
            WO_quantity: new FormControl(materialObj.wo_remaining_quantity, [Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]),
            cost: new FormControl(materialObj.cost),
            material_id: new FormControl(materialObj.manf_part ? materialObj.manf_part.manf_part_id : ''),
            material_name: new FormControl(materialObj.manf_part ? materialObj.manf_part.short_name : ''),
            total_amount: new FormControl(materialObj.total_amount),
            type: new FormControl(materialObj.type),
            uom: new FormControl(materialObj.manf_part ? materialObj.manf_part.uom_name.uom_symbol : ''),
        }));
    }

    changeAddAllToWO(){
        if(this.add_all_WO.value){
            //console.log("add_all_WO",this.add_all_WO.value);
            console.log('True');

            for (let i = 0; i < this.selectedQuotation.services.length; i++) {
                this.services.at(i).get('WO_quantity').setValue(this.selectedQuotation.services[i].wo_remaining_quantity);
            }

            for (let i = 0; i < this.selectedQuotation.product_materials.length; i++) {
                this.materials.at(i).get('WO_quantity').setValue(this.selectedQuotation.product_materials[i].wo_remaining_quantity);
            }

        }else{
            console.log('False');
            //console.log("add_all_WO",this.add_all_WO.value);

            for (let i = 0; i < this.selectedQuotation.services.length; i++) {
                this.services.at(i).get('WO_quantity').setValue(0);
            }

            for (let i = 0; i < this.selectedQuotation.product_materials.length; i++) {
                this.materials.at(i).get('WO_quantity').setValue(0);
            }
        }
    }

    showImage(url,images){
        if(url){
            this.dialog.open(DialogComponent, { data: { 'action': 'image', 'url': url, 'images': images } });
            this.ref.tick();
        }
    }

    createWorkOrder(form: FormGroup){
        let self = this;
        this.submitted = true;
        if(form.valid){

            this.selectedQuotation.services = JSON.parse(JSON.stringify(form.value.services));
            this.selectedQuotation.product_materials = JSON.parse(JSON.stringify(form.value.materials));
            for(let i = 0; i < this.selectedQuotation.services.length; i++){

                    this.selectedQuotation.services[i].quantity = this.selectedQuotation.services[i].WO_quantity;
                    this.selectedQuotation.services[i].service_defination = {}
                    this.selectedQuotation.services[i].service_defination.service_definition_id = this.selectedQuotation.services[i].service_definition_id;
                    this.selectedQuotation.services[i].service_defination.service_definition = this.selectedQuotation.services[i].service;
                    this.selectedQuotation.services[i].total_amount = parseFloat(this.selectedQuotation.services[i].cost) * parseFloat(this.selectedQuotation.services[i].quantity);

            }

            for(let i = 0; i < this.selectedQuotation.product_materials.length; i++){
                console.log("parseFloat(this.selectedQuotation.product_materials[i].WO_quantity) : ",parseFloat(this.selectedQuotation.product_materials[i].WO_quantity));

                    this.selectedQuotation.product_materials[i].quantity = this.selectedQuotation.product_materials[i].WO_quantity;

                    this.selectedQuotation.product_materials[i].WO_quantity
                     = this.selectedQuotation.product_materials[i].WO_quantity;
                    this.selectedQuotation.product_materials[i].cost = this.selectedQuotation.product_materials[i].cost;
                    this.selectedQuotation.product_materials[i].details = this.selectedQuotation.product_materials[i].details;
                    this.selectedQuotation.product_materials[i].invoice_remaining_quantity = this.selectedQuotation.product_materials[i].invoice_remaining_quantity;
                    this.selectedQuotation.product_materials[i].material_details = this.selectedQuotation.product_materials[i].material_details;
                    this.selectedQuotation.product_materials[i].material_id = this.selectedQuotation.product_materials[i].material_id;
                    this.selectedQuotation.product_materials[i].material_name = this.selectedQuotation.product_materials[i].material_name;
                    this.selectedQuotation.product_materials[i].pe_product_material_id = this.selectedQuotation.product_materials[i].pe_product_material_id;
                    this.selectedQuotation.product_materials[i].total_amount = this.selectedQuotation.product_materials[i].total_amount;
                    this.selectedQuotation.product_materials[i].type = this.selectedQuotation.product_materials[i].type;
                    this.selectedQuotation.product_materials[i].wo_remaining_quantity = this.selectedQuotation.product_materials[i].wo_remaining_quantity;
                    this.selectedQuotation.product_materials[i].uom = this.selectedQuotation.product_materials[i].uom;


            }

            // this.selectedQuotation.product_materials.filter(item =>  item.quantity = item.WO_quantity);
            console.log("this.selectedQuotation : ",this.selectedQuotation);
            sessionStorage.removeItem('WO_DETAILS');
            sessionStorage.removeItem('WO_EDIT');
            this.WOService.WO_DATA = {};
            sessionStorage.setItem('woSetupData', JSON.stringify(this.selectedQuotation));
            console.log("form = ",this.selectedQuotation);
            console.log(JSON.stringify(this.selectedQuotation));
            //console.log(this.selectedQuotation.schedules.schedule_type)
            if(this.assignee.value == 'Staff'){
                if(this.selectedQuotation.schedules && this.selectedQuotation.schedules.schedule_type == 2)
                    this.router.navigate(['/workflow/wo/csa/wo-recurring']);
                else
                    this.router.navigate(['/workflow/wo/csa/wo-external/services']);
            }else{
                this.router.navigate(['/workflow/wo/csa/wo-sub-contractor']);
            }
        }
    }
}
