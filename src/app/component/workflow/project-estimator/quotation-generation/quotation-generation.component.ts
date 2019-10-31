import {
  Component,
  OnInit,
  ElementRef,
  NgZone,
  ViewChild
} from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
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
import { Location } from "@angular/common";
import { Observable } from "rxjs/Observable";
import { startWith } from "rxjs/operators/startWith";
import { map } from "rxjs/operators/map";
import { MapsAPILoader } from "@agm/core";
import { GlobalService } from "../../../../shared/service/global.service";
import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { ProjectEstimatorDialog } from "../project-estimator-dialog.component";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";
import { ProjectEstimatorService } from "../project-estimator.service";
import * as htmlToImage from 'html-to-image';
import * as $ from 'jquery';
@Component({
  selector: "app-quotation-generation",
  templateUrl: "./quotation-generation.component.html",
  styleUrls: ["./quotation-generation.component.css"]
})
export class QuotationGenerationComponent implements OnInit {
  generateQuoteFm: FormGroup;
  submitted: boolean = false;
  sameAsWorkLocation: boolean = true;
  clientName: FormControl;
  locationName: FormControl;
  filteredClients: Observable<any[]>;
  filteredLocations: Observable<any[]>;
  filteredLocationsB: Observable<any[]>;
  filteredContact: Observable<any[]>;
  quatationTab: string = "services";
  contactList: any = [];
  clientList: any[] = [];
  selectedClient: any = {};
  ClientData: any = {};
  locationList: any[] = [];
  workLocation: any[] = [];
  bilingLocation: any[] = [];
  errMsg: string = "";
  isError: boolean = false;


  @ViewChild('screen') screen: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('downloadLink') downloadLink: ElementRef;
  //     public clientList: any[] = [
  //     { 'name' : 'Power Corporation of Canada','contact' : 8989898989,'email' : 'pcc@email.com','phoneNo' : 7878787878,'location' : [{'addressLine1' : 'The Forks, Winnipeg, MB','latitude' : 49.887379,'longitude' : -97.131187,'workLocationSameAsBill' : false}]
  // },{ 'name' : 'Magna International','contact' : 8989898989,'email' : 'pcc@email.com','phoneNo' : 7878787878,'location' : [{
  //     'addressLine1' : 'Halifax Central Library, Halifax, NS','latitude' : 44.642342, 'longitude' : -63.575439,'workLocationSameAsBill' : true}]
  // },{ 'name' : 'George Weston Limited','contact' : 8989898989,'email' : 'pcc@email.com','phoneNo' : 7878787878,
  // 'location' : [{'addressLine1' : 'Toronto City Hall, Toronto, ON','latitude' : 43.653908, 'longitude' : -79.384293,'workLocationSameAsBill' : false}]
  // },{ 'name' : 'Royal Bank of Canada','contact' : 8989898989,'email' : 'pcc@email.com','phoneNo' : 7878787878,'location' : [{ 'addressLine1' : 'Rideau Centre, Ottawa, ON','latitude' : 45.425533,'longitude' : -75.692482,'workLocationSameAsBill' : true }]
  // },{ 'name' : 'PPF','contact' : 8989898989,'email' : 'pcc@email.com','phoneNo' : 7878787878,'location' : [{'addressLine1' : 'Manulife Place, Edmonton','latitude' : 53.541492, 'longitude' : -113.494659,'workLocationSameAsBill' : true}]}];

  latitude: number;
  longitude: number;
  zoom: number;
  mapTypeId: string;
  showMap: boolean = false;
  currentPath: string;
  name: number;
  isClientLoad: boolean = false;
  isEdit: string = "noEdit";

  //@ViewChild(ServicesComponent) private childComp: ServicesComponent;

  constructor(
    public dialog: MatDialog,
    public util: UtilService,
    public http: HttpService,
    public global: GlobalService,
    private fb: FormBuilder,
    public router: Router,
    public constant: ConstantsService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public PEService: ProjectEstimatorService,
    private route: ActivatedRoute,
    private _location: Location
  ) {
    this.clientName = new FormControl();
    this.locationName = new FormControl();
  }

  ngOnInit() {
    this.currentPath = this.router.url.split("/")[
      this.router.url.split("/").length - 2
    ];
    this.isClientLoad = false;
    this.util.menuChange({ menu: 4, subMenu: 25 });
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.name = this.util.getUniqueString();
    if (sessionStorage.getItem("quotationDetails")) {
      console.log('data = ', this.PEService.projectEstimatorData);

      let quotationDetails = JSON.parse(sessionStorage.getItem("quotationDetails"));
      if(quotationDetails.project_estimate_no){
        this.isEdit = "edit";
      } else{
        this.isEdit = "noEdit";
      }
        console.log('quotationDetails =',sessionStorage.getItem("quotationDetails"));
        sessionStorage.getItem("quotationFormFlag")
        ? this.PEService.setFormValidationStatus(
          JSON.parse(sessionStorage.getItem("quotationFormFlag"))
          )
          : "";
          this.PEService.projectEstimatorData = JSON.parse(
            sessionStorage.getItem("quotationDetails")
            );
            if(quotationDetails.client_work_location) {

              this.getSelectedLocationEdit(quotationDetails.client_work_location);
            }
      if (
        this.PEService.projectEstimatorData.servicesDetails.services.length > 0
      ) {
        this.PEService.projectEstimatorData.servicesDetails.services.forEach(
          (element, key) => {
            this.PEService.projectEstimatorData.servicesDetails.services[
              key
            ].cost = parseFloat(element.cost);
            this.PEService.projectEstimatorData.servicesDetails.services[
              key
            ].quantity = parseFloat(element.quantity);
            this.PEService.projectEstimatorData.servicesDetails.services[
              key
            ].total_amount = parseFloat(element.total_amount);
          }
        );
      }

      // $$::$$ @YOGESH #OLD #START
      // if(this.PEService.projectEstimatorData.scheduleDetails){
      //     if (this.PEService.projectEstimatorData.scheduleDetails.start_date && this.PEService.projectEstimatorData.scheduleDetails.start_date.indexOf('-') > -1)
      //         this.PEService.projectEstimatorData.scheduleDetails.start_date = this.util.getDDMMYYYYDate(this.PEService.projectEstimatorData.scheduleDetails.start_date);

      //     if (this.PEService.projectEstimatorData.scheduleDetails.end_date && this.PEService.projectEstimatorData.scheduleDetails.end_date.indexOf('-') > -1)
      //         this.PEService.projectEstimatorData.scheduleDetails.end_date = this.util.getDDMMYYYYDate(this.PEService.projectEstimatorData.scheduleDetails.end_date);

      //     this.PEService.projectEstimatorData.scheduleDetails.start_date = this.util.stringToDate(this.PEService.projectEstimatorData.scheduleDetails.start_date);
      //     this.PEService.projectEstimatorData.scheduleDetails.end_date = this.util.stringToDate(this.PEService.projectEstimatorData.scheduleDetails.end_date);
      // }
      // $$::$$ @YOGESH #OLD #END

      // $$::$$ @YOGESH #NEW #START
      if (this.PEService.projectEstimatorData.scheduleDetails) {
        this.PEService.projectEstimatorData.scheduleDetails.start_date =
          this.PEService.projectEstimatorData.scheduleDetails.start_date &&
          this.PEService.projectEstimatorData.scheduleDetails.start_date.indexOf(
            "-"
          ) > -1
            ? this.util.stringToDate(
                this.util.getDDMMYYYYDate(
                  this.PEService.projectEstimatorData.scheduleDetails.start_date
                )
              )
            : this.util.stringToDate(
                this.PEService.projectEstimatorData.scheduleDetails.start_date
              );

        this.PEService.projectEstimatorData.scheduleDetails.end_date =
          this.PEService.projectEstimatorData.scheduleDetails.end_date &&
          this.PEService.projectEstimatorData.scheduleDetails.end_date.indexOf(
            "-"
          ) > -1
            ? this.util.stringToDate(
                this.util.getDDMMYYYYDate(
                  this.PEService.projectEstimatorData.scheduleDetails.end_date
                )
              )
            : this.util.stringToDate(
                this.PEService.projectEstimatorData.scheduleDetails.end_date
              );
      }
      // $$::$$ @YOGESH #NEW #END
      this.createForm("1", this.PEService.projectEstimatorData.clientDetails);
    } else {
      this.createForm("0");
    }
    console.log("scscs", this.selectedClient);
    this.getClientList("init");

    //set google maps defaults
    this.zoom = 18;
    this.latitude = -79.40638519999999;
    this.longitude = 43.66798389999999;
    this.mapTypeId = "roadmap";

    //set current position
    //this.setCurrentPosition();
    this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && dataObj.source == "QUOTATION_GENERATION") {
        if (dataObj.action == "ADD_CLIENT") {
          this.getClientList("addClient");
        } else if (dataObj.action == "ADD_LOCATION") {
        //   this.getClientList(
        //     "addLocation",
        //     dataObj.data.client_id,
        //     dataObj.type
        //   );
            this.getWorkLocationOnTheFly(
                    "addLocation",
                    dataObj.data.client_id,
                    dataObj.type
                  );
        } else if (dataObj.action == "ADD_CONTACT") {
          //this.getClientList("addContact", dataObj.data.client_id);
          this.getContactOnTheFly("addContact", dataObj.data.client_id);
        }
        this.util.changeEvent(null);
      }
    });
    this.quatationTab = this.router.url.split("/")[
      this.router.url.split("/").length - 1
    ];
  }

  getClientList(option, clientId: number = 0, type: string = "") {
    console.log("option : ", option);
    console.log("clientId : ", clientId);
    console.log("type : ", type);

    var self = this;
    self.util.showProcessing("processing-spinner");
    try {
      this.isClientLoad = true;
      this.http.doGet("getClientsList", function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
        } else {
          self.clientList = [];
          console.log("Client::", response.data);
          self.clientList = response.data.filter(
            item =>
              (item.company_name = item.company_name
                ? item.main_address
                  ? item.company_name + "( " + item.main_address + " )"
                  : item.company_name
                : item.main_address
                ? item.first_name +
                  " " +
                  item.last_name +
                  "( " +
                  item.main_address +
                  " )"
                : item.first_name + " " + item.last_name)
          );
          self.filteredClients = self.client_name.valueChanges.pipe(
            startWith(""),
            map(data =>
              data
                ? self.filterClients(data, self.clientList)
                : self.clientList.slice()
            )
          );
          if (option == "addClient") {
            self.selectedClient = self.clientList[self.clientList.length - 1];
            self.client_id.setValue(
              self.clientList[self.clientList.length - 1].client_id
            );
            self.client_name.setValue(
              self.clientList[self.clientList.length - 1].company_name
            );

            self.getSelectedClient(
              self.selectedClient,
              self.client_id,
              option,
              type
            );
          } else if (option == "addLocation") {
            let selectedClient = response.data.filter(
              item => item.client_id == clientId
            )[0];
            self.getSelectedClient(selectedClient, clientId, option, type);
          } else if (option == "addContact") {
            let selectedClient = response.data.filter(
              item => item.client_id == clientId
            )[0];
            self.getSelectedClient(selectedClient, clientId, option, type);
          }

          self.isClientLoad = false;
        }
      });
    } catch (err) {
      this.global.addException(
        "Workflow Quotation Generation",
        "getClientList()",
        err
      );
    }
  }
  // ON THE FLY new function by Shubham :: Date : 23/05/2019
  getWorkLocationOnTheFly(option, clientId: number = 0, type: string = "") {
    if (option == "addLocation") {
        let selectedClient = this.selectedClient;
        this.getSelectedClient(selectedClient, clientId, option, type);
    }
  }
  // ON THE FLY new function by Shubham :: Date : 23/05/2019
  getContactOnTheFly(option, clientId: number = 0, type: string = "") {
    if (option == "addContact") {
        let selectedClient = this.selectedClient;
        this.getSelectedClient(selectedClient, clientId, option, type);
    }
  }

  filterClients(name: string, list: any[]) {
    // return list.filter(data => data.company_name.toLowerCase().indexOf(name.toLowerCase()) === 0);
    // Edited by Shubham :: Date : 25/04/2019
    return list.filter(option =>
      option.company_name.toLowerCase().includes(name ? name.toLowerCase() : "")
    );
  }

  getSelectedClient(selClient: any, event, option?, type?) {
    if (event) {
      this.selectedClient = selClient;
      this.client_id.setValue(selClient.client_id);
      this.PEService.projectEstimatorData.payment_term = selClient.payment_term;
      this.workLocation = [];
      this.bilingLocation = [];
      console.log(selClient);
      var self = this;
      try {
        let clientObj: any = {};
        this.util.showProcessing("processing-spinner");
        this.http.doGet(
          "getClientAddressContact/" + selClient.client_id,
          function(error: boolean, response: any) {
            self.util.hideProcessing("processing-spinner");
            if (error) {
              console.log("error", response);
            } else {
			  	self.workLocation = [];
				self.bilingLocation = [];
				
              self.selectedClient.address = response.data.address;
              self.selectedClient.contacts = response.data.contacts;
			
			  response.data.address.forEach((element, key) => {
				  if (element.address_type){
					  element.address_type =
						  typeof element.address_type == "string"
							  ? JSON.parse(element.address_type)
							  : element.address_type;
					  element.address_type.indexOf("Work Location Address") > -1
						  ? self.workLocation.push(element)
						  : "";
					  element.address_type.indexOf("Billing Address") > -1
						  ? self.bilingLocation.push(element)
						  : "";
				  }else{
					  element.is_work == 1 ? self.workLocation.push(element) : (element.is_billing == 1 ? self.bilingLocation.push(element) : '');
				  }
                
                // console.log(element.address_type.indexOf("Work Location Address"));
              });
              //console.log(self.workLocation);

              self.filteredLocations = self.location.valueChanges.pipe(
                startWith(""),
                map(data =>
                  data
                    ? self.filterLocation(data, self.workLocation)
                    : self.workLocation.slice()
                )
              );
              self.filteredLocationsB = self.client_billing_location.valueChanges.pipe(
                startWith(""),
                map(data =>
                  data
                    ? self.filterLocation(data, self.bilingLocation)
                    : self.bilingLocation.slice()
                )
              );
              self.filteredContact = self.contact_name.valueChanges.pipe(
                startWith(""),
                map(data =>
                  data
                    ? self.filterContact(data, response.data.contacts)
                    : response.data.contacts.slice()
                )
              );

              if (option == "addClient") {
                self.filteredLocations = self.location.valueChanges.pipe(
                  startWith(""),
                  map(data =>
                    data
                      ? self.filterLocation(data, self.selectedClient.address)
                      : self.selectedClient.address.slice()
                  )
                );
                self.filteredLocationsB = self.client_billing_location.valueChanges.pipe(
                  startWith(""),
                  map(data =>
                    data
                      ? self.filterLocation(data, self.selectedClient.address)
                      : self.selectedClient.address.slice()
                  )
                );
                self.filteredContact = self.contact_name.valueChanges.pipe(
                  startWith(""),
                  map(data =>
                    data
                      ? self.filterContact(data, self.selectedClient.contacts)
                      : self.selectedClient.contacts.slice()
                  )
                );
              } else if (option == "addLocation") {
                self.workLocation = [];
                self.bilingLocation = [];
                self.selectedClient.address.forEach(element => {
                  element.address_type =
                    typeof element.address_type == "string"
                      ? JSON.parse(element.address_type)
                      : element.address_type;
                  element.address_type.indexOf("Work Location Address") > -1
                    ? self.workLocation.push(element)
                    : "";
                  element.address_type.indexOf("Billing Address") > -1
                    ? self.bilingLocation.push(element)
                    : "";
                  //element.address_type.indexOf("Work Location Address") > -1 ? self.workLocation.push(element):element.address_type.indexOf("Billing Address") > -1 ? self.bilingLocation.push(element):[];
                });
                if (type == "workLocation") {
                  if (
                    self.selectedClient.address[
                      self.selectedClient.address.length - 1
                    ].client_address_id ==
                    self.workLocation[self.workLocation.length - 1]
                      .client_address_id
                  ) {
                    self.location_id.setValue(
                      self.selectedClient.address[
                        self.selectedClient.address.length - 1
                      ].client_address_id
                    );
                    self.location.setValue(
                      self.selectedClient.address[
                        self.selectedClient.address.length - 1
                      ].address_line_1
                    );
                  } else {
                    self.location_id.setValue(
                      self.PEService.projectEstimatorData.clientDetails
                        ? self.PEService.projectEstimatorData.clientDetails
                            .location_id
                        : ""
                    );
                    self.location.setValue(
                      self.PEService.projectEstimatorData.clientDetails
                        ? self.PEService.projectEstimatorData.clientDetails
                            .location
                        : ""
                    );
                  }
                  self.selectedClient = self.selectedClient;
                  self.filteredLocations = self.location.valueChanges.pipe(
                    startWith(""),
                    map(data =>
                      data
                        ? self.filterLocation(data, self.workLocation)
                        : self.workLocation.slice()
                    )
                  );
                  self.filteredContact = self.contact_name.valueChanges.pipe(
                    startWith(""),
                    map(data =>
                      data
                        ? self.filterContact(data, self.selectedClient.contacts)
                        : self.selectedClient.contacts.slice()
                    )
                  );
                  console.log(self.workLocation);

                  if (
                    self.workLocation[self.workLocation.length - 1].latitude &&
                    self.workLocation[self.workLocation.length - 1].longitude &&
                    self.workLocation[self.workLocation.length - 1].latitude !=
                      0 &&
                    self.workLocation[self.workLocation.length - 1].longitude !=
                      0 &&
                    self.workLocation[self.workLocation.length - 1].latitude !=
                      "" &&
                    self.workLocation[self.workLocation.length - 1].longitude !=
                      ""
                  ) {
                    self.PEService.locationDetails.latitude = parseFloat(
                      self.workLocation[self.workLocation.length - 1].latitude
                    );
                    self.PEService.locationDetails.longitude = parseFloat(
                      self.workLocation[self.workLocation.length - 1].longitude
                    );
                    self.showMap = true;
                  }
                } else if (type == "billLocation") {
                  console.log(
                    self.selectedClient.address[
                      self.selectedClient.address.length - 1
                    ].client_address_id
                  );
                  if (
                    self.selectedClient.address[
                      self.selectedClient.address.length - 1
                    ].client_address_id ==
                    self.bilingLocation[self.bilingLocation.length - 1]
                      .client_address_id
                  ) {
                    self.client_billing_location_id.setValue(
                      self.selectedClient.address[
                        self.selectedClient.address.length - 1
                      ].client_address_id
                    );
                    self.client_billing_location.setValue(
                      self.selectedClient.address[
                        self.selectedClient.address.length - 1
                      ].address_line_1
                    );
                  } else {
                    self.client_billing_location_id.setValue(
                      self.PEService.projectEstimatorData.clientDetails
                        ? self.PEService.projectEstimatorData.clientDetails
                            .client_billing_location_id
                        : ""
                    );
                    self.client_billing_location.setValue(
                      self.PEService.projectEstimatorData.clientDetails
                        ? self.PEService.projectEstimatorData.clientDetails
                            .client_billing_location
                        : ""
                    );
                  }
                  self.filteredLocationsB = self.client_billing_location.valueChanges.pipe(
                    startWith(""),
                    map(data =>
                      data
                        ? self.filterLocation(data, self.bilingLocation)
                        : self.bilingLocation.slice()
                    )
                  );
                }
                (<HTMLElement>(
                  document.querySelector(".mat-autocomplete-visible")
                )).style.display = "none";
              } else if (option == "addContact") {
                self.contact_id.setValue(
                  self.selectedClient.contacts[
                    self.selectedClient.contacts.length - 1
                  ].client_contact_id
                );
                self.contact_name.setValue(
                  self.selectedClient.contacts[
                    self.selectedClient.contacts.length - 1
                  ].name
                );
                self.email.setValue(
                  self.selectedClient.contacts[
                    self.selectedClient.contacts.length - 1
                  ].email_id
                );
                self.phoneNo.setValue(
                  self.selectedClient.contacts[
                    self.selectedClient.contacts.length - 1
                  ].phone_no
                );

                self.filteredContact = self.contact_name.valueChanges.pipe(
                  startWith(""),
                  map(data =>
                    data
                      ? self.filterContact(data, self.selectedClient.contacts)
                      : self.selectedClient.contacts.slice()
                  )
                );
                (<HTMLElement>(
                  document.querySelector(".mat-autocomplete-visible")
                )).style.display = "none";
              }
            }
          }
        );
      } catch (err) {
        this.global.addException(
          "Client details List",
          "getClientDetailsList()",
          err
        );
      }
    }

    //console.log(selClient);
    // this.locationName.setValue(selClient.location[0].addressLine1);
    // this.generateQuoteFm.get('contact').setValue(selClient.contact);
    // this.generateQuoteFm.get('email').setValue(selClient.email);
    // this.generateQuoteFm.get('phoneNo').setValue(selClient.phoneNo);
    // this.locationList = selClient.location;

    // this.latitude = selClient.location[0].latitude;
    // this.longitude = selClient.location[0].longitude;
    // this.zoom = 18;
    // this.mapTypeId = 'roadmap';
    // this.showMap = true;
  }
  public validateClient(event: any) {
    try {
      let client = event.target.value;
      if (client == "") {
        this.client_id.setValue("");
        this.client_name.setValue("");
        return;
      }
      let match = this.clientList.filter(
        item => item.company_name.toLowerCase() == client.toLowerCase()
      );
      if (match.length > 0) {
        this.client_id.setValue(match[0].client.client_id);
        this.client_name.setValue(match[0].client.company_name);
        this.getSelectedClient(match[0], { isUserInput: true });
      } else {
        this.client_id.setValue("");
      }
    } catch (err) {
      this.global.addException("Quotation Generation", "validateClient()", err);
    }
  }
  showAddClientPopup(): void {
    this.util.changeEvent(null);
    this.dialog.open(ProjectEstimatorDialog, { data: { action: "addClient" } });
  }

  showAddWorkLocationPopup(clientId, type): void {
    this.util.changeEvent(null);
    this.dialog.open(ProjectEstimatorDialog, {
      data: { action: "addWorkLocation", clientId: clientId, type: type }
    });
  }

  //showAddContactPopup(): void {this.util.changeEvent(null);this.dialog.open(ProjectEstimatorDialog, { data: { 'action': 'addContact','clientData':Object.keys(this.selectedClient).length === 0 ?this.PEService.projectEstimatorData.clientDetails:this.selectedClient} }); }
  showAddContactPopup(): void {
    this.util.changeEvent(null);
    this.dialog.open(ProjectEstimatorDialog, {
      data: { action: "addContact", clientData: this.selectedClient }
    });
  }

  getSelectedContact(selContact: any, event) {
    if (event && event.isUserInput) {
      //console.log(selContact);
      this.contact_id.setValue(selContact.client_contact_id);
      this.phoneNo.setValue(selContact.phone_no);
      this.email.setValue(selContact.email_id);
    }
  }
  public validateContact(event: any) {
    try {
      let contact = event.target.value;
      if (contact == "") {
        this.contact_id.setValue("");
        this.contact_name.setValue("");
        this.phoneNo.setValue("");
        this.email.setValue("");
        return;
      }
      // let match = this.clientList.filter(item=>item.contacts.name.toLowerCase() == contact.toLowerCase());
      let match = this.selectedClient.contacts.filter(
        item => item.name.toLowerCase() == contact.toLowerCase()
      );
      if (match.length > 0) {
        this.contact_id.setValue(match[0].client_contact_id);
        this.contact_name.setValue(match[0].name);
        this.phoneNo.setValue(match[0].phone_no);
        this.email.setValue(match[0].email_id);
      } else {
        this.contact_id.setValue("");
        this.phoneNo.setValue("");
        this.email.setValue("");
      }
    } catch (err) {
      this.global.addException("Quotation Generation", "validateClient()", err);
    }
  }

  getSelectedLocation(selLocation: any, event) {
    if (event && event.isUserInput) {
      if (
        selLocation.latitude &&
        selLocation.longitude &&
        selLocation.latitude != 0 &&
        selLocation.longitude != 0 &&
        selLocation.latitude != "" &&
        selLocation.longitude != ""
      ) {
        this.PEService.locationDetails.latitude = parseFloat(
          selLocation.latitude
        );
        this.PEService.locationDetails.longitude = parseFloat(
          selLocation.longitude
        );
        this.showMap = true;
      }
      this.location_id.setValue(selLocation.client_address_id);
      this.location.setValue(selLocation.address_line_1);
    }
  }
  getSelectedLocationEdit(selLocation: any) {
    // debugger;
      if (
        selLocation.latitude &&
        selLocation.longitude &&
        selLocation.latitude != 0 &&
        selLocation.longitude != 0 &&
        selLocation.latitude != "" &&
        selLocation.longitude != ""
      ) {
        this.PEService.locationDetails.latitude = parseFloat(
          selLocation.latitude
        );
        this.PEService.locationDetails.longitude = parseFloat(
          selLocation.longitude
        );
        this.showMap = true;
      }
      // this.location_id.setValue(selLocation.client_work_location.client_address_id);
      // this.location.setValue(selLocation.client_work_location.address_line_1);

  }
  public validateLocation(event: any) {
    try {
      let location = event.target.value;
      if (location == "") {
        this.location_id.setValue("");
        this.location.setValue("");
        return;
      }
      let match = this.selectedClient.address.filter(
        address =>
          address.address_line_1.toLowerCase() == location.toLowerCase()
      );
      if (match.length > 0) {
        this.location_id.setValue(match[0].client_address_id);
        this.location.setValue(match[0].address_line_1);
      } else {
        this.location_id.setValue("");
      }
    } catch (err) {
      this.global.addException(
        "Quotation Generation",
        "validateLocation()",
        err
      );
    }
  }
  getSelectedLocationB(selLocation: any, event) {
    if (event && event.isUserInput) {
      // console.log(selLocation);
      this.client_billing_location_id.setValue(selLocation.client_address_id);
      this.client_billing_location.setValue(selLocation.address_line_1);
    }
  }
  public validateLocationB(event: any) {
    try {
      let location = event.target.value;
      if (location == "") {
        this.client_billing_location_id.setValue("");
        this.client_billing_location.setValue("");
        return;
      }
      let match = this.selectedClient.address.filter(
        address =>
          address.address_line_1.toLowerCase() == location.toLowerCase()
      );
      if (match.length > 0) {
        this.client_billing_location_id.setValue(match[0].client_address_id);
        this.client_billing_location.setValue(match[0].address_line_1);
      } else {
        this.client_billing_location_id.setValue("");
      }
    } catch (err) {
      this.global.addException(
        "Quotation Generation",
        "validateLocation()",
        err
      );
    }
  }
  setMapType(mapTypeId: string) { this.mapTypeId = mapTypeId; }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        //this.latitude = position.coords.latitude;
        //this.longitude = position.coords.longitude;

        this.latitude = 43.66798389999999;
        this.longitude = -79.40638519999999;
        this.zoom = 18;
        this.mapTypeId = "roadmap";
      });
    }
  }

  public createForm(option, val: any = {}) {

    // var client_name = val.client_name + "( " + val.location + " )";
    this.generateQuoteFm = this.fb.group({
      client_name: new FormControl(option == "1" ? val.client_name : ""),
      client_id: new FormControl(option == "1" ? val.client_id : "", [
        Validators.required
      ]),
      location: new FormControl(option == "1" ? val.location : ""),
      location_id: new FormControl(option == "1" ? val.location_id : "", [
        Validators.required
      ]),
      client_billing_location: new FormControl(
        option == "1" ? val.client_billing_location : ""
      ),
      client_billing_location_id: new FormControl(
        option == "1" ? val.client_billing_location_id : ""
      ),
      contact_name: new FormControl(option == "1" ? val.contact_name : "", []),
      contact_id: new FormControl(option == "1" ? val.contact_id : "", [
        Validators.required
      ]),
      billingLocationSameAsWork: new FormControl(
        option == "1" ? val.billingLocationSameAsWork : true
      ),
      email: new FormControl(option == "1" ? val.email : "", []),
      phoneNo: new FormControl(option == "1" ? val.phoneNo : "", []),
      requirements: new FormControl(option == "1" ? val.requirements : "", [])
    });
    this.clientBillingLocationChanged();
  }

  get client_name() {
    return this.generateQuoteFm.get("client_name");
  }
  get client_id() {
    return this.generateQuoteFm.get("client_id");
  }
  get location() {
    return this.generateQuoteFm.get("location");
  }
  get location_id() {
    return this.generateQuoteFm.get("location_id");
  }
  get client_billing_location() {
    return this.generateQuoteFm.get("client_billing_location");
  }
  get client_billing_location_id() {
    return this.generateQuoteFm.get("client_billing_location_id");
  }
  get contact_name() {
    return this.generateQuoteFm.get("contact_name");
  }
  get contact_id() {
    return this.generateQuoteFm.get("contact_id");
  }
  get billingLocationSameAsWork() {
    return this.generateQuoteFm.get("billingLocationSameAsWork");
  }
  get email() {
    return this.generateQuoteFm.get("email");
  }
  get phoneNo() {
    return this.generateQuoteFm.get("phoneNo");
  }
  get requirements() {
    return this.generateQuoteFm.get("requirements");
  }

  public clientBillingLocationChanged() {
    this.generateQuoteFm
      .get("billingLocationSameAsWork")
      .valueChanges.subscribe(type => {
        if (type) {
          this.generateQuoteFm
            .get("client_billing_location_id")
            .setValidators([]);
          this.generateQuoteFm
            .get("client_billing_location_id")
            .updateValueAndValidity();
        } else {
          this.generateQuoteFm
            .get("client_billing_location_id")
            .setValidators([Validators.required]);
          this.generateQuoteFm
            .get("client_billing_location_id")
            .updateValueAndValidity();
        }
      });
  }
  //Search filter function
  filterNames(name: string, list: any[]) {
    return list.filter(
      data => data.name.toLowerCase().indexOf(name.toLowerCase()) === 0
    );
  }

  filterLocation(name: string, list: any[]) {
    return list.filter(
      data =>
        data.address_line_1.toLowerCase().indexOf(name.toLowerCase()) === 0
    );
  }
  filterContact(name: string, list: any[]) {
    return list.filter(
      data => data.name.toLowerCase().indexOf(name.toLowerCase()) === 0
    );
  }

  next(form: FormGroup) {
    console.log("SUB.....");
    console.log(form.value);
    this.submitted = true;

    // if(this.quatationTab == 'images'){
    //     sessionStorage.setItem('quotationDetails', JSON.stringify(this.PEService.projectEstimatorData));
    //     this.router.navigate(['/workflow/quote/csa/quotation-review']);
    // }

    if (form.valid) {
      this.PEService.projectEstimatorData.clientDetails = form.value;

      //this.PEService.saveProjectEstimator();
      //console.log(JSON.stringify(form.value));
      if (this.quatationTab == "services") {
        this.checkFormStatusEvent("ADD_SERVICES", {});
        if (this.PEService.getFormValidationStatus().servicesFm) {
          //this.quatationTab = 'materials';
          this.changeQuotTab("materials");
        }
        return;
      }

      if (this.quatationTab == "materials") {
        this.checkFormStatusEvent("ADD_MATERIALS", {});
        if (this.PEService.getFormValidationStatus().materialsFm) {
          //this.quatationTab = 'materials';
          this.changeQuotTab("schedule");
        }
        return;
      }
      if (this.quatationTab == "schedule") {
        console.log(this.PEService.getFormValidationStatus().scheduleFm);
        this.checkFormStatusEvent("ADD_SCHEDULE", {});
        if (this.PEService.getFormValidationStatus().scheduleFm) {
          //this.quatationTab = 'materials';
          this.changeQuotTab("payment-schedule");
        }
        return;
      }
      if (this.quatationTab == "payment-schedule") {
        //this.changeQuotTab('images');
        this.checkFormStatusEvent("ADD_PAYMENT_SCHEDULE", {});
        //console.log(this.PEService.getFormValidationStatus().paymentScheduleFm);
        if (this.PEService.getFormValidationStatus().paymentScheduleFm) {
          //this.quatationTab = 'materials';
          this.changeQuotTab("images");
        }
        return;
      }

      if (this.quatationTab == "images") {
        this.checkValidation();
      }
    }
  }
  previous(form: FormGroup) {
    this.submitted = true;
    if (form.valid) {
      this.PEService.projectEstimatorData.clientDetails = form.value;
      if (this.quatationTab == "services") {
        this.checkFormStatusEvent("ADD_SERVICES", {});
        if (this.PEService.getFormValidationStatus().servicesFm) {
          //this.quatationTab = 'materials';
          // this.changeQuotTab('materials');
          this.router.navigate(["/workflow/quote/csa/quotation-list/0"]);
        }
        //return;
      }
      if (this.quatationTab == "materials") {
        this.checkFormStatusEvent("ADD_MATERIALS", {});
        if (this.PEService.getFormValidationStatus().materialsFm) {
          //this.quatationTab = 'materials';
          this.changeQuotTab("services");
        }
        return;
      }
      if (this.quatationTab == "schedule") {
        this.checkFormStatusEvent("ADD_SCHEDULE", {});
        if (this.PEService.getFormValidationStatus().scheduleFm) {
          //this.quatationTab = 'materials';
          this.changeQuotTab("materials");
        }
        return;
      }
      if (this.quatationTab == "payment-schedule") {
        //this.changeQuotTab('images');
        this.checkFormStatusEvent("ADD_PAYMENT_SCHEDULE", {});
        if (this.PEService.getFormValidationStatus().paymentScheduleFm) {
          //this.quatationTab = 'materials';
          this.changeQuotTab("schedule");
        }
        return;
      }

      if (this.quatationTab == "images") {
        this.changeQuotTab("payment-schedule");
        return;
      }
    }
  }
  checkValidation(): void {
    this.checkFormStatusEvent("ADD_SERVICES", {});
    this.checkFormStatusEvent("ADD_MATERIALS", {});
    this.checkFormStatusEvent("ADD_SCHEDULE", {});
    this.checkFormStatusEvent("ADD_PAYMENT_SCHEDULE", {});
    if (!this.PEService.getFormValidationStatus().servicesFm) {
      this.quatationTab = "services";
      this.router.navigate(["/workflow/quote/csa/quotation/services"]);
      return;
    } else if (!this.PEService.getFormValidationStatus().materialsFm) {
      this.quatationTab = "materials";
      this.router.navigate(["/workflow/quote/csa/quotation/materials"]);
      return;
    } else if (!this.PEService.getFormValidationStatus().scheduleFm) {
      this.quatationTab = "schedule";
      this.router.navigate(["/workflow/quote/csa/quotation/schedule"]);
      return;
    } else if (!this.PEService.getFormValidationStatus().paymentScheduleFm) {
      this.quatationTab = "payment-schedule";
      this.router.navigate(["/workflow/quote/csa/quotation/payment-schedule"]);
      return;
    }

    if (this.checkValidData()) {
      return;
    }

    sessionStorage.setItem(
      "quotationDetails",
      JSON.stringify(this.PEService.projectEstimatorData)
    );
    sessionStorage.setItem(
      "quotationFormFlag",
      JSON.stringify(this.PEService.getFormValidationStatus())
    );
    // console.log(this.PEService.getFormValidationStatus+"");
    if (
      this.PEService.getFormValidationStatus().paymentScheduleFm &&
      this.PEService.getFormValidationStatus().scheduleFm &&
      this.PEService.getFormValidationStatus().materialsFm &&
      this.PEService.getFormValidationStatus().servicesFm
    ) {
      this.router.navigate(["/workflow/quote/csa/quotation-review"]);
    } else {
      this.quatationTab = "schedule";
      this.router.navigate(["/workflow/quote/csa/quotation/schedule"]);
      return;
    }
  }

  checkValidData() {
    let quotationDetails = JSON.parse(
      JSON.stringify(this.PEService.projectEstimatorData)
    );
    if (quotationDetails.servicesDetails) {
      for (
        var i = 0;
        i < quotationDetails.servicesDetails.services.length;
        i++
      ) {
        if (
          quotationDetails.servicesDetails.services[i].service_definition ==
            "" ||
          (quotationDetails.servicesDetails.services[i].cost == "" &&
            quotationDetails.servicesDetails.services[i].cost != 0) ||
          quotationDetails.servicesDetails.services[i].quantity == "" ||
          quotationDetails.servicesDetails.services[i].quantity == 0
        ) {
          this.changeQuotTab("services");
          this.isError = true;
          this.errMsg =
            "Please enter valid data for all services OR remove service from list.";
          return true;
        }
      }
    }

    if (quotationDetails.materialsDetails) {
      for (
        var i = 0;
        i < quotationDetails.materialsDetails.materials.length;
        i++
      ) {
        if (
          quotationDetails.materialsDetails.materials[i].short_name == "" ||
          quotationDetails.materialsDetails.materials[i].item_id == "" ||
          (quotationDetails.materialsDetails.materials[i].cost == "" &&
            quotationDetails.materialsDetails.materials[i].cost != 0) ||
          quotationDetails.materialsDetails.materials[i].quantity == "" ||
          quotationDetails.materialsDetails.materials[i].quantity == 0
        ) {
          this.changeQuotTab("materials");
          this.isError = true;
          this.errMsg =
            "Please enter valid data for all materials OR remove material from list.";
          return true;
        }
      }
    }

    //@@ Commented code by Yogesh for remove validation
    // if(quotationDetails.paymentScheduleDetails && quotationDetails.paymentScheduleDetails.date_items && quotationDetails.paymentScheduleDetails.date_items.length > 0 && (parseFloat(quotationDetails.paymentScheduleDetails.total_cost) < parseFloat(quotationDetails.paymentScheduleDetails.totalPaymentAmount))){
    //     this.changeQuotTab('payment-schedule');
    //     return true;
    // }

    let sub_total: any = 0;
    let adjustment: any = 0;
    let shipping_handling: any = 0;
    if (quotationDetails.paymentScheduleDetails) {
      sub_total =
        quotationDetails.paymentScheduleDetails.sub_total &&
        quotationDetails.paymentScheduleDetails.sub_total != ""
          ? parseFloat(quotationDetails.paymentScheduleDetails.sub_total)
          : 0;
      adjustment =
        quotationDetails.paymentScheduleDetails.adjustment &&
        quotationDetails.paymentScheduleDetails.adjustment != ""
          ? parseFloat(quotationDetails.paymentScheduleDetails.adjustment)
          : 0;
      shipping_handling =
        quotationDetails.paymentScheduleDetails.shipping_handling &&
        quotationDetails.paymentScheduleDetails.shipping_handling != ""
          ? parseFloat(
              quotationDetails.paymentScheduleDetails.shipping_handling
            )
          : 0;
      if (
        adjustment < 0 &&
        sub_total + parseFloat(shipping_handling) < adjustment * -1
      ) {
        this.changeQuotTab("payment-schedule");
        return true;
      }
    }

    //console.log(JSON.stringify(quotationDetails.paymentScheduleDetails));

    if (
      quotationDetails.paymentScheduleDetails &&
      quotationDetails.paymentScheduleDetails.date_items &&
      quotationDetails.paymentScheduleDetails.date_items.length > 0
    ) {
      for (
        let i = 0;
        i < quotationDetails.paymentScheduleDetails.date_items.length;
        i++
      ) {
        if (
          quotationDetails.paymentScheduleDetails.date_items[i].payment_date ==
            "" ||
          quotationDetails.paymentScheduleDetails.date_items[i].amount_due == ""
        ) {
          this.changeQuotTab("payment-schedule");
          this.isError = true;
          this.errMsg =
            "Please enter valid data for all payment schedule OR remove payment schedule from list.";
          return true;
        }
      }
    }
    console.log(JSON.stringify(quotationDetails.paymentScheduleDetails));
  }

  checkFormStatusEvent(action, data): void {
    this.util.changeEvent({
      source: "QUOTATION_GENERATION",
      action: action,
      data: {}
    });
  }

  changeQuotTab(tabName, checkValidation: boolean = true) {
    this.errMsg = "";
    this.isError = false;
    if (this.quatationTab == "services") {
      this.checkFormStatusEvent("ADD_SERVICES", {});
      if (
        checkValidation &&
        !this.PEService.getFormValidationStatus().servicesFm
      )
        return;
    }
    if (this.quatationTab == "materials") {
      this.checkFormStatusEvent("ADD_MATERIALS", {});
      if (
        checkValidation &&
        !this.PEService.getFormValidationStatus().materialsFm
      )
        return;
    }
    if (this.quatationTab == "schedule") {
      this.checkFormStatusEvent("ADD_SCHEDULE", {});
      if (
        checkValidation &&
        !this.PEService.getFormValidationStatus().scheduleFm
      )
        return;
    }
    if (this.quatationTab == "payment-schedule") {
      this.checkFormStatusEvent("ADD_PAYMENT_SCHEDULE", {});
      if (
        checkValidation &&
        !this.PEService.getFormValidationStatus().paymentScheduleFm
      )
        return;
    }
    this.quatationTab = tabName;
    this.router.navigate(["/workflow/quote/csa/quotation/" + tabName]);
  }

  saveAsDraft() {
    try {
      let self = this;
      let action;
      let responseData;
      self.errMsg = "";
      self.isError = false;
      //console.log(self.generateQuoteFm.value.billingLocationSameAsWork)
      self.submitted = true;
      if (self.generateQuoteFm.valid) {
        self.PEService.projectEstimatorData.clientDetails =
          self.generateQuoteFm.value;
        console.log(self.generateQuoteFm.value);
        action = self.PEService.projectEstimatorData.project_estimate_id
          ? "edit"
          : "add";
        if (this.quatationTab == "services") {
          this.checkFormStatusEvent("ADD_SERVICES", {});
          if (!this.PEService.getFormValidationStatus().servicesFm) return;
        }

        if (this.quatationTab == "materials") {
          this.checkFormStatusEvent("ADD_MATERIALS", {});
          if (!this.PEService.getFormValidationStatus().materialsFm) return;
        }
        if (this.quatationTab == "schedule") {
          this.checkFormStatusEvent("ADD_SCHEDULE", {});
          if (!this.PEService.getFormValidationStatus().scheduleFm) return;
        }
        if (this.quatationTab == "payment-schedule") {
          this.checkFormStatusEvent("ADD_PAYMENT_SCHEDULE", {});
          if (!this.PEService.getFormValidationStatus().paymentScheduleFm)
            return;
        }

        if (this.checkValidData()) {
          return;
        }

        sessionStorage.setItem(
          "quotationDetails",
          JSON.stringify(this.PEService.projectEstimatorData)
        );
        self.util.addSpinner("saveAsDraft", "Save");
        console.log(
          "quotationDetails",
          JSON.stringify(this.PEService.projectEstimatorData)
        );
        this.PEService.saveProjectEstimator(action, "", function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("saveAsDraft", "Save");
          if (error) {
            self.errMsg = response.message;
            self.isError = true;
          } else {
            sessionStorage.removeItem("quotationDetails");
            responseData = self.PEService.setResponseForPE(response.data);
            sessionStorage.setItem("quotationDetails", responseData);
            //console.log("get Data"+responseData);
            self.util.showDialog(DialogComponent, response.message);
            self.ngOnInit();
          }
        });

        // console.log(this.PEService.projectEstimatorData)
      }
    } catch (err) {
      this.global.addException("quotationGeneration", "saveAsDraft()", err);
    }
  }
  showSiteInspectionPopup() {
    let self = this;
    let action;
    let responseData;
    self.errMsg = "";
    self.isError = false;
    self.submitted = true;

    if (this.PEService.projectEstimatorData.project_estimate_id) {
      if (this.generateQuoteFm.valid) {
        this.PEService.projectEstimatorData.clientDetails = this.generateQuoteFm.value;
        this.dialog.open(ProjectEstimatorDialog, {
          data: { action: "siteInspection" }
        });
      }
    } else {
      // this.errMsg="Save Quotation against selected client before schedule site inspection";
      // this.isError = true;
      try {
        if (self.generateQuoteFm.valid) {
          self.PEService.projectEstimatorData.clientDetails =
            self.generateQuoteFm.value;
          console.log(self.generateQuoteFm.value);
          action = self.PEService.projectEstimatorData.project_estimate_id
            ? "edit"
            : "add";
          if (this.quatationTab == "services") {
            this.checkFormStatusEvent("ADD_SERVICES", {});
            if (!this.PEService.getFormValidationStatus().servicesFm) return;
          }

          if (this.quatationTab == "materials") {
            this.checkFormStatusEvent("ADD_MATERIALS", {});
            if (!this.PEService.getFormValidationStatus().materialsFm) return;
          }
          if (this.quatationTab == "schedule") {
            this.checkFormStatusEvent("ADD_SCHEDULE", {});
            if (!this.PEService.getFormValidationStatus().scheduleFm) return;
          }
          if (this.quatationTab == "payment-schedule") {
            this.checkFormStatusEvent("ADD_PAYMENT_SCHEDULE", {});
            if (!this.PEService.getFormValidationStatus().paymentScheduleFm)
              return;
          }

          sessionStorage.setItem(
            "quotationDetails",
            JSON.stringify(this.PEService.projectEstimatorData)
          );
          //self.util.addSpinner('saveAsDraft', "Save");
          self.util.showProcessing("processing-spinner");
          this.PEService.saveProjectEstimator(action, "", function(
            error: boolean,
            response: any
          ) {
            //self.util.removeSpinner('saveAsDraft', "Save");
            self.util.hideProcessing("processing-spinner");
            if (error) {
              self.errMsg = response.message;
              self.isError = true;
            } else {
              sessionStorage.removeItem("quotationDetails");
              responseData = self.PEService.setResponseForPE(response.data);
              sessionStorage.setItem("quotationDetails", responseData);
              // self.util.showDialog(DialogComponent, response.message,
              // );
              // self.ngOnInit();
              self.dialog.open(ProjectEstimatorDialog, {
                data: { action: "siteInspection" }
              });
            }
          });

          // console.log(this.PEService.projectEstimatorData)
        }
      } catch (err) {
        this.global.addException("quotationGeneration", "saveAsDraft()", err);
      }
    }
  }

  showSaveForFollowUpPopup() {
    let self = this;
    let action;
    let responseData;
    self.errMsg = "";
    self.isError = false;
    self.submitted = true;
    if (this.PEService.projectEstimatorData.project_estimate_id) {
      if (this.generateQuoteFm.valid) {
        this.PEService.projectEstimatorData.clientDetails = this.generateQuoteFm.value;
        //console.log(this.PEService.projectEstimatorData)
        //var result =  ServicesComponent.(reviewService());
        this.dialog.open(ProjectEstimatorDialog, {
          data: { action: "saveForFollowUp" }
        });
      }
    } else {
      // this.errMsg="Save Quotation against selected client before follow up";
      // this.isError = true;
      try {
        if (self.generateQuoteFm.valid) {
          self.PEService.projectEstimatorData.clientDetails =
            self.generateQuoteFm.value;
          console.log(self.generateQuoteFm.value);
          action = self.PEService.projectEstimatorData.project_estimate_id
            ? "edit"
            : "add";
          if (this.quatationTab == "services") {
            this.checkFormStatusEvent("ADD_SERVICES", {});
            if (!this.PEService.getFormValidationStatus().servicesFm) return;
          }

          if (this.quatationTab == "materials") {
            this.checkFormStatusEvent("ADD_MATERIALS", {});
            if (!this.PEService.getFormValidationStatus().materialsFm) return;
          }
          if (this.quatationTab == "schedule") {
            this.checkFormStatusEvent("ADD_SCHEDULE", {});
            if (!this.PEService.getFormValidationStatus().scheduleFm) return;
          }
          if (this.quatationTab == "payment-schedule") {
            this.checkFormStatusEvent("ADD_PAYMENT_SCHEDULE", {});
            if (!this.PEService.getFormValidationStatus().paymentScheduleFm)
              return;
          }

          sessionStorage.setItem(
            "quotationDetails",
            JSON.stringify(this.PEService.projectEstimatorData)
          );
          //self.util.addSpinner('saveAsDraft', "Save");
          self.util.showProcessing("processing-spinner");
          this.PEService.saveProjectEstimator(action, "", function(
            error: boolean,
            response: any
          ) {
            //self.util.removeSpinner('saveAsDraft', "Save");
            self.util.hideProcessing("processing-spinner");
            if (error) {
              self.errMsg = response.message;
              self.isError = true;
            } else {
              sessionStorage.removeItem("quotationDetails");
              responseData = self.PEService.setResponseForPE(response.data);
              sessionStorage.setItem("quotationDetails", responseData);
              // self.util.showDialog(DialogComponent, response.message,
              // );
              // self.ngOnInit();
              self.dialog.open(ProjectEstimatorDialog, {
                data: { action: "saveForFollowUp" }
              });
            }
          });

          // console.log(this.PEService.projectEstimatorData)
        }
      } catch (err) {
        this.global.addException("quotationGeneration", "saveAsDraft()", err);
      }
    }
  }
// ---@Mohini---//
captureMap() {
  let self = this;
  this.util.addSpinner("capture_btn", "Capture");

  let client_name = this.generateQuoteFm.get('client_name').value;
  console.log('captureMap() -> client_name = ', name);
  htmlToImage.toJpeg(document.getElementById('map-wrapper'), { quality: 0.95 })
  .then(function (dataUrl) {
    self.util.removeSpinner("capture_btn", "Capture");

    var link = document.createElement('a');
    link.download = client_name+'.jpg';
    link.href = dataUrl;
    link.click();
  });
}
// ---@Mohini---//

}
