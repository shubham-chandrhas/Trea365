import { Component, OnInit, Inject } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { ApplicationRef } from "@angular/core";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import {
  IMultiSelectOption,
  IMultiSelectSettings,
  IMultiSelectTexts
} from "angular-2-dropdown-multiselect";
import { UploadEvent, UploadFile } from "ngx-file-drop";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { Location } from "@angular/common";
import * as _ from "underscore";
import { GlobalService } from "../../../../shared/service/global.service";
//import { AdminService } from '../admin.service';
import { UtilService } from "../../../service/util.service";
import { FileService } from "../../../service/file.service";
import { HttpService } from "../../../service/http.service";
import { ConstantsService } from "../../../service/constants.service";

@Component({
  selector: "app-manufacturer-part",
  templateUrl: "./manufacturer-part.component.html",
  styleUrls: [
    "./manufacturer-part.component.css",
    "./mfg-attributes/mfg-attributes.component.css"
  ]
})
export class ManufacturerPartComponent implements OnInit {
  pageData: any = {
    manufacturerPartList: [],
    listCount: 0,
    imageCount: 0,
    sortColumn: "manf_part_id",
    sortOrder: "DSC",
    partDetails: "details",
    isEdit: false,
    isError: false,
    pageData: false,
    dragOver: false,
    newFileUpload: false,
    isThumbnailSet: false,
    UPC_VALIDATORS: [
      Validators.required,
      Validators.max(999999999999999999999999999999)
    ]
  };
  listKeys: string[] = ["uomList", "itemclass"];
  sortColumnType: string = "N";
  editMFGForm: FormGroup;
  mulSelSettings: IMultiSelectSettings = { displayAllSelectedText: true };
  replacesList: IMultiSelectOption[] = [];
  equivalentList: IMultiSelectOption[] = [];
  public selectText: IMultiSelectTexts = {
    defaultTitle: ""
  };
  filteredClass: Observable<string[]>;
  permissionsSet: any;
  public searchTxt: string;
  searchList: string;

  public onBoarding:boolean = false; 

  constructor(
    public router: Router,
    private fb: FormBuilder,
    public util: UtilService,
    private file: FileService,
    private dialog: MatDialog,
    private ref: ApplicationRef,
    //private admin: AdminService,
    private route: ActivatedRoute,
    private http: HttpService,
    public constant: ConstantsService,
    private location: Location,
    private global: GlobalService
  ) {}

  ngOnInit() {
    this.util.setWindowHeight();
    this.router.url.split("/")[2] == "csa-onboarding"
      ? this.util.menuChange({ menu: "guide", subMenu: "" })
      : this.util.menuChange({ menu: 2, subMenu: 14 });
    this.pageData.paginationKey = {
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
    this.util.showProcessing("processing-spinner");
    this.getManufacturerPart("1");
    this.util.setPageTitle(this.route);
    this.pageSetUp(this.pageData, this.listKeys);
    this.permissionsSet = this.util.getModulePermission(28);
    //this.getDDLists();
    //this.getManufacturerList();

    this.util.changeDetection.subscribe(recordObj => {
      let self = this;
      if (
        recordObj &&
        recordObj.source == "MANUFACTURER_PART" &&
        recordObj.action == "DELETE"
      ) {
        self.getManufacturerPart("0");
        self.searchTxt = self.searchList = "";
        //         if(recordObj.data && self.pageData.selectedPart && ((recordObj.data.type == 'img' && self.pageData.selectedPart.manuf_parts_images.length > 0) || (recordObj.data.type == 'doc' && self.pageData.selectedPart.manuf_parts_files.length > 0))){
        //             if(recordObj.data.type == 'img'){
        //                 //console.log("recordObj.data.index",recordObj.data.index,self.pageData.selectedPart.manuf_parts_images);
        //                 //console.log("self.pageData.selectedPart.manuf_parts_images",self.pageData.selectedPart.manuf_parts_images);
        //                 this.pageData.selectedPart.manuf_parts_images.splice(recordObj.data.index, 1);
        //                 this.ref.tick();
        //                 this.pageData.selectedPart.viewImages = this.create2DList(self.pageData.selectedPart.manuf_parts_images);
        //                 this.ref.tick();
        //                 self.getManufacturerPart('0');
        //                 self.pageData.partBackup =  JSON.parse(JSON.stringify(self.pageData.selectedPart));
        //                 self.pageData.imageCount--;
        //             }else{
        //                 self.pageData.selectedPart.manuf_parts_files.splice(recordObj.data.index, 1);
        //                 self.ref.tick();
        //                 self.pageData.selectedPart.viewDocs = this.create2DList(self.pageData.selectedPart.manuf_parts_files);
        //                 self.ref.tick();
        //                 self.getManufacturerPart('0');
        //                 self.pageData.partBackup =  JSON.parse(JSON.stringify(self.pageData.selectedPart));
        //             }
        //             recordObj.data = null;
        //         }
      }
    });
  }
  getSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.searchTxt = "";
    }
  }

  pageSetUp(pageObj, listArray, varArray: string[] = []) {
    for (let i = 0; i < listArray.length; i++) {
      pageObj[listArray[i]] = [];
    }
  }
  updateCount(count) {
    this.constant.ITEM_COUNT = this.pageData.listCount = count;
  }
  addManufacturerPart() {
    try {
      sessionStorage.removeItem("newPart");
      sessionStorage.removeItem("class");
      this.util.setMfgPartData([]);
      this.router.url.split("/")[2] == "csa-onboarding"
        ? this.router.navigate([
            "/admin/csa-onboarding/add-manufacturer-part/" + btoa("1")
          ])
        : this.router.navigate([
            "/admin/csa/add-manufacturer-part/" + btoa("1")
          ]);
    } catch (err) {
      this.global.addException(
        "Manufacturer part",
        "addManufacturerPart()",
        err
      );
    }
  }

  getDDLists() {
    try {
      let self = this;
      for (let i = 0; i < this.listKeys.length; i++) {
        this.http.doGet(
          i == 0 ? "manufPart/" + self.listKeys[i] : self.listKeys[i],
          function(error: boolean, response: any) {
            if (error) {
              console.log(response);
            } else {
              self.pageData[self.listKeys[i]] = response.data;
              self.listKeys[i] == "itemclass"
                ? (self.filteredClass = self.class_name.valueChanges.pipe(
                    startWith(""),
                    map(value => self.classFilter(value))
                  ))
                : "";
            }
          }
        );
      }
    } catch (err) {
      this.global.addException("Manufacturer part", "getDDLists()", err);
    }
  }

  getSelectedClass(obj: any, event: any): void {
    try {
      if (event.isUserInput) {
        this.class.setValue(obj.item_class_id);
        this.getClass(obj.item_class_type);
        this.getSelectedEqAndReplaces(this.pageData.selectedPart.manf_part_id);
      }
    } catch (err) {
      this.global.addException("Manufacturer part", "getSelectedClass()", err);
    }
  }
  private classFilter(value: string): string[] {
    try {
      return this.pageData.itemclass.filter(option =>
        option.item_class_name
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Manufacturer part", "classFilter()", err);
    }
  }
  public validateClass(event: any) {
    let classVal = event.target.value;
    let match = this.pageData.itemclass.filter(
      item => item.item_class_name.toLowerCase() == classVal.toLowerCase()
    );
    console.log(match);
    try {
      if (classVal == "") {
        this.class.setValue("");
        return;
      }
      if (match.length > 0) {
        this.class.setValue(match[0].item_class_id);
        this.class_name.setValue(match[0].item_class_name);
        this.getClass(match[0].item_class_type);
        this.getSelectedEqAndReplaces(this.pageData.selectedPart.manf_part_id);
      }
    } catch (err) {
      this.global.addException("Manufacturer part", "validateClass()", err);
    }
  }

  getClass(itemClassType) {
    try {
      this.pageData.submitted = false;
      this.pageData.classType = itemClassType;
      if (
        this.pageData.classType == "Asset" ||
        this.pageData.classType == "Product"
      ) {
        this.util.addBulkValidators(
          this.editMFGForm,
          ["manufacturerId",  "UOM"],
          [Validators.required, Validators.maxLength(30)]
        );
        this.util.addBulkValidators(
            this.editMFGForm,
            ["manufacturerPartNo"],
            [ Validators.maxLength(30)]
          );
        // this.util.addBulkValidators(
        //   this.editMFGForm,
        //   ["manfUPC"],
        //   this.pageData.UPC_VALIDATORS
        // );
        if (this.pageData.classType == "Asset") {
          this.util.addBulkValidators(this.editMFGForm, ["UOM"], []);
          this.util.addBulkValidators(this.editMFGForm, ["minimumStock"], []);
        } else {
          this.util.addBulkValidators(
            this.editMFGForm,
            ["minimumStock"],
            [Validators.required, Validators.min(0), Validators.max(99999999)]
          );
        }
      } else if (this.pageData.classType == "Material") {
        this.util.addBulkValidators(
          this.editMFGForm,
          ["manufacturerId", "manufacturerPartNo", "UOM", "manfUPC"],
          []
        );
        this.util.addBulkValidators(
          this.editMFGForm,
          ["UOM"],
          [Validators.required, Validators.maxLength(30)]
        );
        this.util.addBulkValidators(
          this.editMFGForm,
          ["minimumStock"],
          [Validators.required, Validators.min(0), Validators.max(99999999)]
        );
      }
    } catch (err) {
      this.global.addException("Manufacturer part", "getClass()", err);
    }
  }

  getManufacturerPart(option) {
    try {
      let self = this;
      option == "1"
        ? ((this.pageData.selectedPart = this.pageData.selectedIndex = null),
          (this.pageData.isEdit = false))
        : "";
      this.http.doGet("manufPart", function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        self.pageData.manufacturerPartList = [];
        if (error) {
          console.log(response);
        } else {
          for (let i = 0; i < response.data.length; i++) {
            response.data[i].className =
              response.data[i].class_name.item_class_name;
            response.data[i].manuf_parts_images = response.data[i]
              .manuf_parts_images
              ? response.data[i].manuf_parts_images
              : [];
            response.data[i].manuf_parts_files = response.data[i]
              .manuf_parts_files
              ? response.data[i].manuf_parts_files
              : [];
          }
          self.pageData.manufacturerPartList = response.data;
          //console.log(self.pageData.manufacturerPartList);
          if(self.pageData.manufacturerPartList.length == 0) {
            self.onBoarding = true;
          }
          self.ref.tick();
          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showMfgPartDetails()
            : "";
        }
      });
    } catch (err) {
      this.global.addException(
        "Manufacturer part",
        "getManufacturerPart()",
        err
      );
    }
  }

  showMfgPartDetails() {
    try {
      let sortedList: any[] = _.sortBy(
        this.pageData.manufacturerPartList,
        "manf_part_id"
      ).reverse();
      for (var i = 0; i < sortedList.length; ++i) {
        if (
          this.route.snapshot.paramMap.get("id") == sortedList[i].manf_part_id
        ) {
          this.getSelectedPart(sortedList[i], i);
          this.pageData.selectedIndex = i;
          break;
        }
      }
    } catch (err) {
      this.global.addException(
        "Manufacturer part",
        "showMfgPartDetails()",
        err
      );
    }
  }

  // getManufacturerList(){
  //     let self = this;
  //     this.http.doGet('manufacturer', function(error: boolean, response: any){
  //         if(error){ console.log(response) }else{
  //             self.pageData.manufacturerList = response.data;
  //         }
  //     });
  // }

  getSelectedPart(part: any, index) {
    try {
      let self = this;
      console.log("getSelectedPart ", part);
      this.pageData.isEdit = this.pageData.isError = this.pageData.newFileUpload = this.pageData.isThumbnailSet = false;
      part.attributes.filter(item => (item.isDelete = 0));
      part.viewImages = this.create2DList(part.manuf_parts_images);
      part.viewDocs = this.create2DList(part.manuf_parts_files);

      //part.manuf_parts_images = this.createManualList(part.manuf_parts_images,'img');
      //part.manuf_parts_files = this.createManualList(part.manuf_parts_files,'pdf');
      this.pageData.imageCount = part.manuf_parts_images.length;
      this.pageData.selectedPart = JSON.parse(JSON.stringify(part));
      //console.log(this.pageData.selectedPart);
      part.equivalent_id = this.getSelectedMultiSelArray(
        this.pageData.selectedPart.equivalent,
        "equ"
      );
      part.replaces_id = this.getSelectedMultiSelArray(
        this.pageData.selectedPart.replaces,
        "rep"
      );
      this.createMFGForm(part);
      this.getSelectedEqAndReplaces(this.pageData.selectedPart.manf_part_id);
      this.pageData.partBackup = JSON.parse(JSON.stringify(part));
      self.location.go(
        self.location
          .path()
          .split("/")
          .splice(0, self.location.path().split("/").length - 1)
          .join("/") +
          "/" +
          part.manf_part_id
      );
      setTimeout(function() {
        self.util.scrollDown("mfgPartMark");
      }, 1000);
      console.log("this.pageData.selectedPart", this.pageData.selectedPart);
    } catch (err) {
      this.global.addException("Manufacturer part", "getSelectedPart()", err);
    }
  }

  getSelectedMultiSelArray(array: any, keyString) {
    try {
      let finalArray: any[] = [];
      for (let i = 0; i < array.length; i++) {
        keyString == "equ"
          ? finalArray.push(array[i].manf_part_equ_id)
          : finalArray.push(array[i].manf_part_rep_id);
      }
      return finalArray;
    } catch (err) {
      this.global.addException(
        "Manufacturer part",
        "getSelectedMultiSelArray()",
        err
      );
    }
  }

  create2DList(list) {
    try {
      let listCont = 0,
        imgArr = [],
        inArr = [];
      while (listCont < list.length) {
        let count = 0;
        inArr = [];
        while (count < 3 && listCont < list.length) {
          inArr.push(list[listCont]);
          count++;
          listCont++;
        }
        imgArr.push({ inArray: inArr });
      }
      return imgArr;
    } catch (err) {
      this.global.addException("Manufacturer part", "create2DList()", err);
    }
  }

  createManualList(list, type) {
    try {
      let listCont = 0,
        imgArr = [],
        inArr = [];
      if (list) {
        while (listCont < list.length) {
          let count = 0;
          inArr = [];
          while (count < 3 && listCont < list.length) {
            if (type == "pdf") {
              let fileName: string[] = list[listCont].doc_name.split(".");
              fileName.pop();
              inArr.push({
                doc_id: list[listCont].doc_id,
                extension: list[listCont].doc_name.split(".").pop(),
                doc_path: list[listCont].doc_path,
                doc_name: fileName,
                doc_desc: list[listCont].doc_desc,
                manf_part_id: list[listCont].manf_part_id,
                isDelete: 0
              });
            } else {
              let fileName: string[] = list[listCont].image_name.split(".");
              fileName.pop();
              inArr.push({
                image_id: list[listCont].image_id,
                extension: list[listCont].image_name.split(".").pop(),
                image_path: list[listCont].image_path,
                image_name: fileName,
                set_as_thumbnail: list[listCont].set_as_thumbnail,
                image_desc: list[listCont].image_desc,
                manf_part_id: list[listCont].manf_part_id,
                isDelete: 0
              });
            }
            //inArr.push(list[listCont]);
            count++;
            listCont++;
          }
          //imgArr.push({ 'inArray': inArr });
        }
      }
      console.log("createManualList", inArr);
      return inArr;
    } catch (err) {
      this.global.addException("Manufacturer part", "createManualList()", err);
    }
  }

  createMFGForm(partObj) {
    this.editMFGForm = this.fb.group({
      manufacturerPartId: new FormControl(partObj.manf_part_id),
      manufacturerId: new FormControl(partObj.manf_id),
    //   manufacturerPartNo: new FormControl(partObj.manf_part_no, [
    //     Validators.required,
    //     Validators.maxLength(30)
    //   ]),
    manufacturerPartNo: new FormControl(partObj.manf_part_no, [
        Validators.maxLength(30)
      ]),
    //   manfUPC: new FormControl(partObj.upc, this.pageData.UPC_VALIDATORS),
    manfUPC: new FormControl(partObj.upc),
      fullName: new FormControl(partObj.full_name),
      shortName: new FormControl(partObj.short_name, [
        Validators.required,
        Validators.maxLength(50)
      ]),
      equivalent: new FormControl(partObj.equivalent_id),
      // approxUnitPrice:new FormControl(partObj.approx_unit_price, [Validators.required, Validators.min(0)]),
      salesMarkup: new FormControl(partObj.sales_markup, [
        Validators.min(0),
        Validators.max(100),
        Validators.pattern(this.constant.AMOUNT_PATTERN)
      ]),
      minimumStock: new FormControl(partObj.minimum_stock, [
        Validators.min(0),
        Validators.max(99999999)
      ]),
      //UOM:new FormControl(partObj.uom_id),
      UOM: new FormControl(partObj.uom_id, [Validators.required]),
      class: new FormControl(partObj.class_id, [Validators.required]),
      class_name: new FormControl(partObj.class_name.item_class_name, [
        Validators.required
      ]),
      replaces: new FormControl(partObj.replaces_id)
    });
    this.getDDLists();
    this.getClass(partObj.class_name.item_class_type);
  }

  get manufacturerPartNo() {
    return this.editMFGForm.get("manufacturerPartNo");
  }
  get manufacturerId() {
    return this.editMFGForm.get("manufacturerId");
  }
  get manfUPC() {
    return this.editMFGForm.get("manfUPC");
  }
  get fullName() {
    return this.editMFGForm.get("fullName");
  }
  get shortName() {
    return this.editMFGForm.get("shortName");
  }
  get equivalent() {
    return this.editMFGForm.get("equivalent");
  }
  // get approxUnitPrice() { return this.editMFGForm.get('approxUnitPrice'); }
  get salesMarkup() {
    return this.editMFGForm.get("salesMarkup");
  }
  get minimumStock() {
    return this.editMFGForm.get("minimumStock");
  }
  get UOM() {
    return this.editMFGForm.get("UOM");
  }
  get class() {
    return this.editMFGForm.get("class");
  }
  get class_name() {
    return this.editMFGForm.get("class_name");
  }
  get replaces() {
    return this.editMFGForm.get("replaces");
  }

  editFlageChange(option) {
    try {
      this.pageData.isEdit = true;
      this.pageData.isError = false;
      this.pageData.newFileUpload = false;
    } catch (err) {
      this.global.addException("Manufacturer part", "editFlageChange()", err);
    }
  }

  getSelectedEqAndReplaces(currentManfId) {
    try {
      if (!this.class.valid && !this.class.dirty) {
        return;
      }
      let menus = [];
      for (let i = 0; i < this.pageData.manufacturerPartList.length; i++) {
        //this.manufacturerId.value == this.pageData.manufacturerPartList[i].manf_id  &&
        if (
          currentManfId != this.pageData.manufacturerPartList[i].manf_part_id &&
          this.pageData.manufacturerPartList[i].class_id == this.class.value
        ) {
          let obj: any = {
            id: this.pageData.manufacturerPartList[i].manf_part_id,
            name: this.pageData.manufacturerPartList[i].short_name
          };
          menus.push(obj);
        }
      }
      this.replacesList = menus;
      this.equivalentList = menus;
    } catch (err) {
      this.global.addException(
        "Manufacturer part",
        "getSelectedEqAndReplaces()",
        err
      );
    }
  }

  cancelEditPart() {
    try {
      this.pageData.isEdit = false;
      this.pageData.newFileUpload = false;
      this.pageData.selectedPart = JSON.parse(
        JSON.stringify(this.pageData.partBackup)
      );
      this.createMFGForm(this.pageData.selectedPart);
    } catch (err) {
      this.global.addException("Manufacturer part", "cancelEditPart()", err);
    }
  }

  editManufacturerPart(form: FormGroup) {
    try {
      let self = this;
      self.pageData.submitted = true;
      self.pageData.isError = false;
      self.pageData.errMsg = "";
      if (form.valid) {
        self.util.addSpinner("update-details-btn", "Update");
        this.http.doPost("manufPartEdit/details", form.value, function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("update-details-btn", "Update");
          if (error) {
            self.pageData.isError = true;
            self.pageData.errMsg = response.message;
          } else {
            self.pageData.isEdit = false;
            self.getManufacturerPart("0");
            self.pageData.selectedPart = response.data[0];
            self.pageData.partBackup = JSON.parse(
              JSON.stringify(self.pageData.selectedPart)
            );
          }
        });
      }
    } catch (err) {
      this.global.addException("Manufacturer part", "cancelEditPart()", err);
    }
  }

  showDetails(option) {
    try {
      this.pageData.partDetails = option;
      this.pageData.isEdit = this.pageData.newFileUpload = this.pageData.isThumbnailSet = false;
      this.pageData.selectedPart = JSON.parse(
        JSON.stringify(this.pageData.partBackup)
      );
    } catch (err) {
      this.global.addException("Manufacturer part", "showDetails()", err);
    }
  }

  addAttribute() {
    try {
      this.pageData.errMsg = "";
      this.pageData.isError = false;
      if (
        this.pageData.selectedPart.attributes.length > 0 &&
        (this.pageData.selectedPart.attributes[
          this.pageData.selectedPart.attributes.length - 1
        ].label == "" ||
          this.pageData.selectedPart.attributes[
            this.pageData.selectedPart.attributes.length - 1
          ].format == "")
      ) {
        this.pageData.isError = true;
        this.pageData.errMsg = "Enter Attribute Label and Attribute Data.";
      } else {
        this.pageData.selectedPart.attributes.push({
          attribute_id: "",
          attribute_label: "",
          attribute_data: "",
          isDelete: 0
        });
      }
    } catch (err) {
      this.global.addException("Manufacturer part", "addAttribute()", err);
    }
  }

  removeAttribute(index) {
    try {
      this.pageData.selectedPart.attributes[index].attribute_id == ""
        ? this.pageData.selectedPart.attributes.splice(index, 1)
        : (this.pageData.selectedPart.attributes[index].isDelete = 1);
    } catch (err) {
      this.global.addException("Manufacturer part", "addAttribute()", err);
    }
  }

  editManufacturerAttribute() {
    try {
      let self = this;
      self.pageData.isError = false;
      self.pageData.errMsg = "";
      let attArr: any = [];
      for (var i = 0; i < this.pageData.selectedPart.attributes.length; i++) {
        if (
          this.pageData.selectedPart.attributes[i].attribute_label.trim() ==
            "" ||
          this.pageData.selectedPart.attributes[i].attribute_data.trim() == ""
        ) {
          if (this.pageData.selectedPart.attributes.length != 1) {
            this.pageData.isError = true;
            this.pageData.errMsg = "Enter Attribute Label and Attribute Data.";
            return;
          }
        } else {
          attArr.push({
            attrId: this.pageData.selectedPart.attributes[i].attribute_id,
            label: this.pageData.selectedPart.attributes[i].attribute_label,
            format: this.pageData.selectedPart.attributes[i].attribute_data,
            isDelete: this.pageData.selectedPart.attributes[i].isDelete
          });
        }
      }

      self.util.addSpinner("update-attribute-btn", "Update");
      self.http.doPost(
        "manufPartEdit/attributes",
        {
          manufacturerPartId: self.pageData.selectedPart.manf_part_id,
          attribute: attArr
        },
        function(error: boolean, response: any) {
          self.util.removeSpinner("update-attribute-btn", "Update");
          if (error) {
            self.pageData.isError = true;
            self.pageData.errMsg = response.message;
          } else {
            self.pageData.isEdit = false;
            self.pageData.selectedPart.attributes = response.data.attributes;
            self.pageData.selectedPart.attributes.filter(
              item => (item.isDelete = 0)
            );
            //self.ref.tick();
            self.pageData.partBackup = JSON.parse(
              JSON.stringify(self.pageData.selectedPart)
            );
            self.getManufacturerPart("0");
          }
        }
      );
    } catch (err) {
      this.global.addException(
        "Manufacturer part",
        "editManufacturerAttribute()",
        err
      );
    }
  }

  changeUploadFileFlage() {
    this.pageData.newFileUpload = true;
    this.ref.tick();
  }

  onFileChange(event, option) {
    let fileList: FileList = event.target.files;
    this.pageData.errMsg = "";
    this.pageData.isError = false;
    this.fileProcessing(fileList, option);
  }

  fileProcessing(fileList, option) {
    try {
      let self = this;
      let conImgCount: number = 0;
      if (fileList.length > 0) {
        for (var i = 0; i < fileList.length; i++) {
          let file: File = fileList[i];
          let fileDetailsObj: any = {};
          let extension: string = fileList[i].name.split(".").pop();
          let fileName: string[] = fileList[i].name.split(".");
          fileName.pop();
          fileDetailsObj.fileName = fileName;
          fileDetailsObj.ext = extension;

          if (
            (option == "img" &&
              (extension == "jpg" ||
                extension == "png" ||
                extension == "jpeg")) ||
            (option == "doc" && extension == "pdf")
          ) {
            if (fileList[i].size / 1048576 < 10) {
              self.convertToBase64(file, function(base64) {
                fileDetailsObj.imgPath = base64;
                self.pushNewFile(file, fileDetailsObj, option);
                self.pageData.imageCount++;
                conImgCount++;
                self.ref.tick();
              });
            } else {
              self.pageData.dragOver = false;
              self.pageData.isError = true;
              self.pageData.errMsg = "File must be less than 10 MB.";
              self.ref.tick();
            }
          } else {
            self.pageData.dragOver = false;
            self.pageData.isError = true;
            self.pageData.errMsg =
              option == "img"
                ? "Only jpg, jpeg, png or pdf file allowed."
                : "Only pdf file allowed.";
            self.ref.tick();
          }
        }
      }
    } catch (err) {
      this.global.addException("Manufacturer part", "fileProcessing()", err);
    }
  }

  convertToBase64(file, callback) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (fileLoadedEvent: any) => {
      return callback(fileLoadedEvent.target.result);
    };
  }

  editManufacturerImage() {
    try {
      let self = this;
      self.util.addSpinner("update-image-btn", "Update");
      let formData: FormData = new FormData();
      for (
        let i = 0;
        i < self.pageData.selectedPart.manuf_parts_images.length;
        i++
      ) {
        if (self.pageData.selectedPart.manuf_parts_images[i].image_name == "") {
          self.util.removeSpinner("update-image-btn", "Update");
          this.pageData.errMsg = "File name is required.";
          this.pageData.isError = true;

          return;
        } else {
          formData.append(
            "fileId" + (i + 1),
            self.pageData.selectedPart.manuf_parts_images[i].image_id
          );
          formData.append(
            "description" + (i + 1),
            self.pageData.selectedPart.manuf_parts_images[i].image_desc
          );
          formData.append(
            "fileName" + (i + 1),
            self.pageData.selectedPart.manuf_parts_images[i].image_name +
              "." +
              self.pageData.selectedPart.manuf_parts_images[i].extension
          );
          self.pageData.selectedPart.manuf_parts_images[i].image_id == "0"
            ? formData.append(
                "fileUploaded" + (i + 1),
                self.pageData.selectedPart.manuf_parts_images[i].file
              )
            : "";
          self.pageData.selectedPart.manuf_parts_images[i].set_as_thumbnail ==
          "1"
            ? formData.append("thumbnail", JSON.stringify(i))
            : "";
        }
      }

      formData.append(
        "manufacturerPartId",
        self.pageData.selectedPart.manf_part_id
      );
      formData.append(
        "fileCount",
        self.pageData.selectedPart.manuf_parts_images.length
      );

      this.file.formDataAPICall(formData, "manufPartEdit/images", function(
        error: boolean,
        response: any
      ) {
        self.util.removeSpinner("update-image-btn", "Update");
        if (error) {
          self.pageData.isError = true;
          self.pageData.errMsg = response.message;
        } else {
          self.pageData.selectedPart.manuf_parts_images = self.createManualList(
            response.data.manuf_parts_images,
            "img"
          );
          self.pageData.selectedPart.viewImages = self.create2DList(
            response.data.manuf_parts_images
          );
          self.pageData.imageCount = response.data.manuf_parts_images.length;
          self.pageData.partBackup = JSON.parse(
            JSON.stringify(self.pageData.selectedPart)
          );
          self.pageData.manufacturerPartList[
            self.pageData.selectedIndex
          ] = JSON.parse(JSON.stringify(self.pageData.selectedPart));
          self.pageData.isEdit = self.pageData.newFileUpload = false;
          self.getManufacturerPart("0");
        }
      });
    } catch (err) {
      this.global.addException(
        "Manufacturer part",
        "editManufacturerImage()",
        err
      );
    }
  }

  editManufacturerDoc() {
    try {
      let self = this;
      self.util.addSpinner("update-doc-btn", "Update");
      let formData: FormData = new FormData();
      console.log(self.pageData.selectedPart.manuf_parts_files);
      for (
        let i = 0;
        i < self.pageData.selectedPart.manuf_parts_files.length;
        i++
      ) {
        if (self.pageData.selectedPart.manuf_parts_files[i].doc_name == "") {
          this.pageData.errMsg = "File name is required.";
          self.util.removeSpinner("update-doc-btn", "Update");
          this.pageData.isError = true;
          return;
        } else {
          formData.append(
            "fileId" + (i + 1),
            self.pageData.selectedPart.manuf_parts_files[i].doc_id
          );
          formData.append(
            "description" + (i + 1),
            self.pageData.selectedPart.manuf_parts_files[i].doc_desc
              ? self.pageData.selectedPart.manuf_parts_files[i].doc_desc
              : ""
          );
          formData.append(
            "fileName" + (i + 1),
            self.pageData.selectedPart.manuf_parts_files[i].doc_name
              ? self.pageData.selectedPart.manuf_parts_files[i].doc_name +
                  "." +
                  self.pageData.selectedPart.manuf_parts_files[i].extension
              : ""
          );
          self.pageData.selectedPart.manuf_parts_files[i].doc_id == "0"
            ? formData.append(
                "fileUploaded" + (i + 1),
                self.pageData.selectedPart.manuf_parts_files[i].file
              )
            : "";
        }
      }

      formData.append(
        "manufacturerPartId",
        self.pageData.selectedPart.manf_part_id
      );
      formData.append(
        "fileCount",
        self.pageData.selectedPart.manuf_parts_files.length
      );

      this.file.formDataAPICall(formData, "manufPartEdit/doc", function(
        error: boolean,
        response: any
      ) {
        self.util.removeSpinner("update-doc-btn", "Update");
        if (error) {
          self.pageData.isError = true;
          self.pageData.errMsg = response.message;
        } else {
          self.pageData.selectedPart.viewDocs = self.create2DList(
            response.data.manuf_parts_files
          );
          self.pageData.selectedPart.manuf_parts_files = self.createManualList(
            response.data.manuf_parts_files,
            "pdf"
          );
          self.pageData.partBackup = JSON.parse(
            JSON.stringify(self.pageData.selectedPart)
          );
          self.pageData.manufacturerPartList[
            self.pageData.selectedIndex
          ] = JSON.parse(JSON.stringify(self.pageData.selectedPart));
          self.ref.tick();
          self.pageData.isEdit = self.pageData.newFileUpload = false;
          self.getManufacturerPart("0");
        }
      });
    } catch (err) {
      this.global.addException(
        "Manufacturer part",
        "editManufacturerDoc()",
        err
      );
    }
  }

  pushNewFile(file, fileObj, option) {
    try {
      if (option == "img") {
        let newObj = {
          image_id: "0",
          image_name: fileObj.fileName,
          extension: fileObj.ext,
          set_as_thumbnail:
            this.pageData.selectedPart.manuf_parts_images.length == 0 ? 1 : 0,
          image_desc: "",
          image_path: fileObj.imgPath,
          file: file
        };
        this.pageData.selectedPart.manuf_parts_images.push(newObj);
        this.ref.tick();
      } else {
        let newObj = {
          doc_id: "0",
          doc_name: fileObj.fileName,
          extension: fileObj.ext,
          doc_desc: "",
          file: file
        };
        this.pageData.selectedPart.manuf_parts_files.push(newObj);
        this.ref.tick();
      }
    } catch (err) {
      this.global.addException(
        "Manufacturer part",
        "editManufacturerDoc()",
        err
      );
    }
  }

  onSelectionChange(index) {
    for (
      let i = 0;
      i < this.pageData.selectedPart.manuf_parts_images.length;
      i++
    ) {
      this.pageData.selectedPart.manuf_parts_images[i].set_as_thumbnail = 0;
    }
    this.pageData.selectedPart.manuf_parts_images[index].set_as_thumbnail = 1;
  }

  removeImgDoc(id, index, option, isThumbnail) {
    //this.dialog.open(ManufacturerPartDialog, { data: { 'action': 'deleteRecord', 'url': 'manufPartDelete/image','id': id, 'idObj':  { 'imageId': id }, 'successMsg': 'Item Definition Image ', 'type': option, 'index': index, 'partObj': this.pageData}, autoFocus: false });
    try {
      let self = this;
      self.pageData.isError = false;
      self.pageData.errMsg = "";
      let reqObj = { manufPartFileId: id };
      self.ref.tick();
      if (option == "img") {
        if (
          isThumbnail == "1" &&
          this.pageData.selectedPart.manuf_parts_images.length > 1
        ) {
          self.pageData.isError = true;
          self.pageData.errMsg =
            "You can not remove thumbnail image. If you want to remove thumbnail image please set other image as thumbnail.";
          self.ref.tick();
        } else {
          this.dialog.open(ManufacturerPartDialog, {
            data: {
              action: "deleteRecord",
              url: "manufPartDelete/image",
              id: id,
              idObj: { imageId: id },
              successMsg: "Item Definition Image ",
              type: option,
              index: index,
              partObj: this.pageData
            },
            autoFocus: false
          });
          self.ref.tick();
        }
      } else {
        this.dialog.open(ManufacturerPartDialog, {
          data: {
            action: "deleteRecord",
            url: "manufPartDelete/doc",
            id: id,
            idObj: { documentId: id },
            successMsg: "Item Definition Image ",
            type: option,
            index: index,
            partObj: this.pageData
          },
          autoFocus: false
        });
        self.ref.tick();
      }
    } catch (err) {
      this.global.addException("Manufacturer part", "removeImgDoc()", err);
    }
  }

  showImage(url) {
    this.dialog.open(ManufacturerPartDialog, {
      data: { action: "image", url: url }
    });
    this.ref.tick();
  }

  dropped(event: UploadEvent, option) {
    try {
      this.pageData.errMsg = "";
      this.pageData.isError = false;
      for (let file of event.files) {
        file.fileEntry.file(info => {
          if (info) {
            this.fileProcessing([info], option);
            this.pageData.dragOver = false;
            this.ref.tick();
          }
        });
      }
    } catch (err) {
      this.global.addException("Manufacturer part", "dropped()", err);
    }
  }

  fileOver(event) {
    this.pageData.dragOver = true;
    this.ref.tick();
  }
  fileLeave(event) {
    this.pageData.dragOver = false;
    this.ref.tick();
  }
}

@Component({
  selector: "",
  templateUrl: "./manufacturer-part-dialog.html",
  styleUrls: ["./manufacturer-part.component.css"]
})
export class ManufacturerPartDialog {
  public errMsg: string = "";
  public successMsg: string = "";
  public action: string;
  public isError: boolean = false;
  public isSuccess: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public util: UtilService,
    private http: HttpService,
    private ref: ApplicationRef,
    //private admin: AdminService,
    public dialogRef: MatDialogRef<ManufacturerPartDialog>,
    @Inject(MAT_DIALOG_DATA) public dataObj: any,
    private global: GlobalService
  ) {
    this.action = dataObj.action;
  }

  ngOnInit() {}

  closeDialog(): void {
    this.dialogRef.close();
    this.ref.tick();
  }

  cancelAddManufacturerPart() {
    try {
      this.dialogRef.close();
      sessionStorage.removeItem("newPart");
      this.util.setMfgPartData([]);
      this.router.url.split("/")[2] == "csa-onboarding"
        ? this.router.navigate(["/csa-onboarding/guide"])
        : this.router.navigate(["/admin/csa/manufacturer-part/0"]);
    } catch (err) {
      this.global.addException(
        "Manufacturer part",
        "cancelAddManufacturerPart()",
        err
      );
    }
  }

  deleteRecord() {
    let self = this;
    self.errMsg = "";
    self.isError = false;
    try {
      if (self.dataObj.id == "0") {
        //this.util.changeEvent({ 'source': 'MANUFACTURER_PART', 'action': 'DELETE', 'data': self.dataObj });
        //self.util.deleteRecordFromList(self.dataObj);
        self.updateList(self.dataObj);
        this.dialogRef.close();
        this.ref.tick();
      } else {
        self.util.addSpinner("delete-record-btn", "Delete");
        this.http.doPost(self.dataObj.url, self.dataObj.idObj, function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("delete-record-btn", "Delete");
          self.dialogRef.close();
          self.ref.tick();
          if (error) {
            self.errMsg = response.message;
            self.isError = true;
            self.ref.tick();
          } else {
            self.updateList(self.dataObj);
            //self.dataObj.partObj.manufacturerPartList[self.dataObj.partObj.selectedIndex] = JSON.parse(JSON.stringify(self.dataObj.partObj.selectedPart));
            //self.admin.deleteRecordFromList(self.dataObj);
            self.util.changeEvent({
              source: "MANUFACTURER_PART",
              action: "DELETE",
              data: self.dataObj
            });
            //self.ref.tick();
            self.isSuccess = true;
            self.successMsg =
              self.dataObj.successMsg + " Successfully Deleted.";
            self.ref.tick();
          }
        });
      }
    } catch (err) {
      this.global.addException("Manufacturer part", "deleteRecord()", err);
    }
  }

  updateList(dataObj): void {
    try {
      if (dataObj.type == "img") {
        dataObj.partObj.selectedPart.manuf_parts_images.splice(
          dataObj.index,
          1
        );
        dataObj.partObj.imageCount--;
      } else {
        dataObj.partObj.selectedPart.manuf_parts_files.splice(dataObj.index, 1);
      }
      dataObj.partObj.partBackup = JSON.parse(
        JSON.stringify(dataObj.partObj.selectedPart)
      );
    } catch (err) {
      this.global.addException("Manufacturer part", "updateList()", err);
    }
  }
}
