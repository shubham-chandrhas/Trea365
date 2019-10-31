import { Injectable, Inject } from "@angular/core";
import { Router } from "@angular/router";
import { DatePipe } from "@angular/common";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { MatDialog } from "@angular/material";
import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser,
  AWSCognito
} from "amazon-cognito-identity-js/lib";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import { Title } from "@angular/platform-browser";

import { APP_CONFIG, AppConfig } from "../../app-config.module";
import { ConstantsService } from "./constants.service";
import * as moment from "moment";
import { DialogMessageComponent } from "../model/dialog/dialog-message.component";

declare var jQuery: any;
declare var $: any;

@Injectable()
export class UtilService {
  imageBaseURL: string;
  domainIP: string;
  loader: boolean;
  currentCurrency: string;
  currentCurrencySign: string;
  currentCountryCode: string;
  companyName: string;
  companyLogo: string;
  loggedInUserName: string;
  screenWidth: any;
  screenHeight: any;
  contentWidth: any;
  contentMinHeight: any;
  contentHeight: any;
  arrow: string;
  previousRoute: string = "";
  userAlertData: any = { isShow: false };
  unreadConversation: any[] = [];
  activeChatUserId: any = 0;
  poAction: any = '';
  poID: any = '0';

  private currentPath: string;
  private companyId: any;
  private role: string;
  private roleName: string;
  private isOpenPopup: boolean;
  private mfgPartData: any[] = [];
  private docObj: any[] = [];
  private currentOTFSupType: string = "";
  private receivingItemCount: number = 0;
  private menuSource: any = new BehaviorSubject("");
  private changeSource: any = new BehaviorSubject("");

  newMenuSelection = this.menuSource.asObservable();
  changeDetection = this.changeSource.asObservable();

  constructor(
    public router: Router,
    private titleService: Title,
    @Inject(APP_CONFIG)
    private config: AppConfig,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private constant: ConstantsService
  ) {
    this.imageBaseURL = config.domainIP + "/api/public/";
    this.domainIP = config.domainIP;
  }

  ngOnInit() {
    this.currentOTFSupType = "";
  }

  public menuChange(newMenuObj: any) {
    this.menuSource.next(newMenuObj);
  }
  public changeEvent(dataObj: any) {
    this.changeSource.next(dataObj);
  }
  //unsubscribeChange(){ this.changeDetection.complete(); };

  public showLoading() {
    this.loader = true;
  }
  public hideLoading() {
    this.loader = false;
  }

  public showProcessing(id) {
    $("#" + id).removeClass("dn");
  }
  public hideProcessing(id) {
    $("#" + id).addClass("dn");
  }

  public setCompanyId(id) {
    this.companyId = id;
  }
  public getCompanyId() {
    return this.companyId;
  }

  public setCompanyName(name) {
    this.companyName = name;
  }
  public getCompanyName() {
    return this.companyName;
  }

  public setCurrency(currency) {
    this.currentCurrency = currency;
  }
  public getCurrency() {
    return this.currentCurrency;
  }

  public setCurrencySign(currencySign) {
    this.currentCurrencySign = currencySign;
  }
  public getCurrencySign() {
    return this.currentCurrencySign;
  }

  public setCountryCode(countryCode) {
    this.currentCountryCode = countryCode;
  }
  public getCountryCode() {
    return this.currentCountryCode;
  }

  public unMaskPhoneNumber(phone: any) {
    return phone ? phone.replace(/-/g, "") : "";
  }
  public maskPhoneNumber(phone: any) {
    return phone ? phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3") : "";
  }

  public setPopupFlag(value) {
    this.isOpenPopup = value;
  }
  public getPopupFlag() {
    return this.isOpenPopup;
  }

  public setCurrentPath(path) {
    this.currentPath = path;
  }
  public getCurrentPath() {
    return this.currentPath;
  }

  getUniqueString() {
    return new Date().getTime();
  }

  setCompanyLogo(url) {
    this.companyLogo = url;
  }
  getCompanyLogo() {
    return this.companyLogo;
  }

  setRole(role) {
    this.role = role;
  }
  getRole() {
    return parseInt(this.role);
  }

  setRoleName(roleName) {
    this.roleName = roleName;
  }
  getRoleName() {
    return this.roleName;
  }

  setMfgPartData(data) {
    this.mfgPartData = data;
  }
  getMfgPartData() {
    return this.mfgPartData;
  }

  setDocumentObj(doc: any[]) {
    this.docObj = doc;
  }
  getDocumentObj() {
    return this.docObj;
  }

  setActiveChatUserId(userId) {
    this.activeChatUserId = userId;
  }
  getActiveChatUserId() {
    return this.activeChatUserId;
  }

  setLoggedInUserName(name) {
    this.loggedInUserName = name;
  }
  getLoggedInUserName() {
    return this.loggedInUserName;
  }
  setOTFSupType(type) {
    this.currentOTFSupType = type;
  }
  getOTFSupType() {
    return this.currentOTFSupType;
  }
  setReceivingItemCount(count) {
    this.receivingItemCount = count;
  }
  getReceivingItemCount() {
    return this.receivingItemCount;
  }

  setUnreadConversation(unreadConversation) {
    this.unreadConversation = unreadConversation;
  }
  getUnreadConversation() {
    return this.unreadConversation;
  }
  addUnreadConversation(userId) {
    this.unreadConversation.push(userId);
  }
  removeConversation(userId) {
    for (let i = 0; i < this.unreadConversation.length; i++) {
      if (this.unreadConversation[i] == userId) {
        this.unreadConversation.splice(i, 1);
        break;
      }
    }
  }

  removeWarningFlage() {
    sessionStorage.removeItem("WORNING_FLAGE");
  }

  playMsgAlert() {
    let audioPlayer: HTMLMediaElement = <HTMLVideoElement>(
      document.getElementById("player")
    );
    audioPlayer.play();
  }

  updatePagination() {
    this.constant.PAGINATION_ITEMS = JSON.parse(
      JSON.stringify(this.constant.DEFAULT_PAGINATION_ITEMS)
    );
    this.constant.ITEMS_PER_PAGE = JSON.parse(
      JSON.stringify(this.constant.DEFAULT_ITEMS_PER_PAGE)
    );
    if (JSON.parse(atob(localStorage.getItem("USER"))).settings.length > 0) {
      JSON.parse(atob(localStorage.getItem("USER"))).settings.map(item => {
        if (item.setting_key == "pagination_count") {
          this.constant.ITEMS_PER_PAGE = parseInt(item.setting_value);
          if (
            this.constant.PAGINATION_ITEMS.indexOf(
              parseInt(item.setting_value)
            ) == -1
          ) {
            this.constant.PAGINATION_ITEMS.push(parseInt(item.setting_value));
            this.constant.PAGINATION_ITEMS.sort(function(a, b) {
              return a - b;
            });
          }
        }
      });
    }
  }

  showAlertToast(status, msg) {
    this.userAlertData.class =
      status == "Warning"
        ? "alert-warning"
        : status == "Suspended"
        ? "alert-danger"
        : "alert-info";
    this.userAlertData.iconClass =
      status == "Warning"
        ? "fa-exclamation-circle"
        : status == "Suspended"
        ? "fa-exclamation-triangle"
        : "fa-exclamation";
    this.userAlertData.msg = msg;
    this.userAlertData.isShow = true;
  }
  hideAlertToast() {
    this.userAlertData.isShow = false;
  }

  addSpinner(id, caption) {
    $("#" + id).addClass("ptrN");
    $("#" + id).html(
      '<i class="fa fa-spinner fa-pulse fa-3x fa-fw sub-action"></i> ' + caption
    );
  }

  removeSpinner(id, caption) {
    $("#" + id).removeClass("ptrN");
    $("#" + id).html(caption);
  }

  setPageTitle(route): void {
    this.titleService.setTitle(
      route.data.value.title ? route.data.value.title : "Trea365"
    );
  }

  changePage(event, paginationKey) {
    paginationKey.currentPage = event;
    window.scrollTo(0, 0);
  }
  changeItemPerPage() {
    window.scrollTo(0, 0);
  }
  scrollDown(id): void {
    $("html,body").animate({ scrollTop: $("#" + id).offset().top }, 300);
  }

  keyPress(event: any) {
    const pattern = /[0-9\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (
      (event.keyCode != 8 && !pattern.test(inputChar)) ||
      event.keyCode == 32
    ) {
      event.preventDefault();
    }
  }

  searchInList(event: any, searchList) {
    if (event.keyCode == 13) {
      return searchList;
    } else {
      return;
    }
  }

  numberCheck(event: any) {
    const pattern = /^\d+$/;
    let inputChar = String.fromCharCode(event.charCode);
    if (
      (event.keyCode != 8 && !pattern.test(inputChar)) ||
      event.keyCode == 32
    ) {
      event.preventDefault();
    }
  }
  numberCheckWithDecimalPt(event: any) {
    const pattern = /^\d*\.?\d+$/;
    let inputChar = String.fromCharCode(event.charCode);
    if (
      (event.keyCode != 8 && !pattern.test(inputChar)) ||
      event.keyCode == 32
    ) {
      event.preventDefault();
    }
  }
  noSpace(event: any) {
    if (event.keyCode == 32) {
      event.preventDefault();
    }
  }

  noFirstSpace(event: any, value: string) {
    if (
      (!value && event.keyCode == 32) ||
      (value && value == "" && event.keyCode == 32)
    ) {
      event.preventDefault();
    }
  }

  removeCommas(field): void {
    field.setValue(
      field.value
        ? field.value.toString().indexOf(",") > -1
          ? field.value.replace(/,/g, "")
          : field.value
        : ""
    );
  }

  moneyCheck(event: any) {
    const pattern = /[0-9\.\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    console.log(event.keyCode);
    if (
      (event.keyCode != 8 && !pattern.test(inputChar)) ||
      event.keyCode == 32
    ) {
      event.preventDefault();
    }
  }

  clearAutoComplete(inputId, controls, indx: any = "") {
    let backspaceEvent = jQuery.Event("keyup", { keyCode: 20 });
    $("#" + inputId + indx).trigger(backspaceEvent);
    setTimeout(function() {
      for (let i = 0; i < controls.length; i++) {
        controls[i].setValue("");
      }
    }, 1);
  }

  focusHiddenInput(inputId) {
    $("#" + inputId).click();
    //$("#" + inputId).focus();
  }

  getValidator(type) {
    let list: any = [];
    switch (type) {
      case "Number":
        list = [Validators.pattern(this.constant.POS_AND_NEQ_NUMBERS_PATTERN)];
        break;
      case "Decimal":
        list = [Validators.pattern(this.constant.DECIMAL_NUMBERS_PATTERN)];
        break;
      // case "Date":
      //     list = [ Validators.pattern(this.constant.DATA_PATTERN) ];
      //     break;
      default:
        list = [];
        break;
    }
    return list;
  }

  unixTimestampToLocalDate = (epoc: any): any => ({
    localDate: new Date(epoc * 1000)
  });

  // unixTimestampToLocalTime(epoc): any{
  //     let date = new Date(epoc*1000);
  //     let hours = date.getHours();
  //     let minutes: any = date.getMinutes();
  //     let ampm = hours >= 12 ? 'PM' : 'AM';
  //     hours = hours % 12;
  //     hours = hours ? hours : 12; // the hour '0' should be '12'
  //     minutes = minutes < 10 ? '0'+minutes : minutes;
  //     let strTime = hours + ':' + minutes + ' ' + ampm;
  //     console.log("strTime :::"+ strTime);
  //     return strTime;
  // }

  matchWithIgnoringSpaces(str1, str2): boolean {
    if (str1.split(" ").join("") == str1.split(" ").join("")) {
      return true;
    } else {
      return false;
    }
  }

  concatenateStrings(str1, str2) {
    return (str1 ? str1 + " ," : "") + "" + str2;
  }

  getYYYYMMDDDate(date) {
    return this.datePipe.transform(date, "yyyy-MM-dd");
  }
  getDDMMYYYYDate(date) {
    return date && date != ""
      ? this.datePipe.transform(date, "dd/MM/yyyy")
      : "";
  }
  getTimeZoneDate(date) {
      const zoneDate = new Date(date);
      zoneDate.setMinutes( zoneDate.getMinutes() + zoneDate.getTimezoneOffset() );
      return zoneDate;
  }
  // getFormatedDate(date){ return date && date != '' ? this.datePipe.transform(date, 'yyyy/MM/dd') : ''; }
  getFormatedDate(date) {
    return date && date != "" ? moment(date).format("YYYY/MM/DD") : "";
  }
  stringToDate(dateStr) {
    let dateObj = new Date();
    if (dateStr && dateStr != "") {
      dateObj.setFullYear(dateStr.split("/")[2]);
      dateObj.setMonth(parseInt(dateStr.split("/")[1]) - 1);
      dateObj.setDate(dateStr.split("/")[0]);
      return dateObj;
    } else {
      return "";
    }
  }

  getDateObjet(dateStr) {
    console.log('getDateObjectbefore = ',dateStr);
    console.log(typeof dateStr == "object");
    if (typeof dateStr == "object") {
      return dateStr;
    }
    let dateObj = new Date();
    if (dateStr.indexOf("-") > -1) {
      dateObj.setFullYear(dateStr.split("-")[0]);
      dateObj.setMonth(parseInt(dateStr.split("-")[1]) - 1);
      dateObj.setDate(
        dateStr.split("-")[2].length > 2
          ? dateStr.split("-")[2].substring(0, 2)
          : dateStr.split("-")[2]
      );
    } else if (dateStr.indexOf("/") > -1) {
      return this.stringToDate(dateStr);
    }
    console.log('getDateObjectafter = ',dateObj);
    return dateObj;
  }

  getPasswordStrength(password) {
    var digitCount = 0,
      speCharCount = 0,
      alphaCount = 0;
    //Regular Expressions.
    var regex = new Array();
    regex.push("[A-Z]"); //Uppercase Alphabet.
    regex.push("[a-z]"); //Lowercase Alphabet.
    regex.push("[0-9]"); //Digit.
    regex.push("[$@$!%*#?&]"); //Special Character.
    if (password && password != "") {
      for (var i = 0; i < password.length; i++) {
        if (/[A-Z]/.test(password[i]) || /[a-z]/.test(password[i]))
          alphaCount = 1;
        else if (/[0-9]/.test(password[i])) digitCount = 1;
        else if (/[$@$!%*#?&]/.test(password[i])) speCharCount = 1;
      }
    }
    var strength = "";
    if (password && password != "") {
      if (digitCount + alphaCount + speCharCount == 3 && password.length >= 8)
        strength = "strong";
      else if (
        digitCount + alphaCount + speCharCount == 2 &&
        password.length >= 8
      )
        strength = "good";
      else if (
        digitCount + alphaCount + speCharCount == 1 &&
        password.length >= 8
      )
        strength = "avg";
      else strength = "weak";
    }
    return strength;
  }

  disableAutocomplete() {
    let allInputs: any = document.getElementsByTagName("input");
    let allForms = document.getElementsByTagName("form");
    let allNumberInputs = document.getElementsByTagName("number");
    for (let i = 0; i < allInputs.length; i++) {
      //allInputs[i].style.backgroundColor = "red";
      allInputs[i].setAttribute("autocomplete", "nope");
    }
    for (let i = 0; i < allForms.length; i++) {
      allForms[i].setAttribute("autocomplete", "off");
    }
    for (let i = 0; i < allNumberInputs.length; i++) {
      allNumberInputs[i].setAttribute("autocomplete", "nope");
    }
  }

  public initiateAuth(callback) {
    let self = this;
    let userpool = new CognitoUserPool({
      UserPoolId: this.config.awsUserPoolId, //"us-east-2_scrGK0WJO",
      ClientId: this.config.awsClientId //"68g4ktfiugs5v3nribkskg920n"
    });
    userpool.client.makeUnauthenticatedRequest(
      "initiateAuth",
      {
        ClientId: self.config.awsClientId,
        AuthFlow: "REFRESH_TOKEN_AUTH",
        AuthParameters: {
          REFRESH_TOKEN: atob(localStorage.getItem("REFRESH_TOKEN")),
          DEVICE_KEY: atob(localStorage.getItem("DEVICE_KEY"))
        }
      },
      (err, authResult) => {
        if (err) {
          return callback(true, err);
        }
        console.log("::::::::contains new session");
        console.log(authResult); // contains new session

        return callback(false, authResult.AuthenticationResult);
      }
    );
  }

  public showDialog(
    DialogComponent,
    message: string = "",
    redirectURL: string[] = [],
    header: string = "",
    action: string = "SUCCESS",
    data: any = {}
  ): void {
    this.dialog.open(DialogComponent, {
      data: {
        action: action,
        header: header,
        message: message,
        redirectURL: redirectURL,
        data: data
      },
      autoFocus: false
    });
  }

  public updateValidators(
    form,
    control,
    validators: any[] = [],
    isArray: string = ""
  ): void {
    if (isArray == "") {
      form.controls[control].setValidators(validators);
      form.controls[control].updateValueAndValidity();
    } else {
      control.setValidators(validators);
      control.updateValueAndValidity();
    }
  }

  public addBulkValidators(
    form,
    controlsList,
    validators: any[] = [],
    isArray: string = ""
  ): void {
    for (let i = 0; i < controlsList.length; ++i) {
      this.updateValidators(form, controlsList[i], validators, isArray);
    }
  }

  public show404Page() {
    this.router.navigate(["404"]);
  }

  public forceLogout() {
    localStorage.getItem("KEY")
      ? this.showDialog(
          DialogMessageComponent,
          "Your session has expired. Please log in again.",
          ["login"]
        )
      : "";

    // localStorage.getItem("KEY")
    //   ? alert("Your session has expired. Please log in again.")
    //   : "";
    localStorage.removeItem("IS_REMEMBERME");
    localStorage.removeItem("KEY");
    sessionStorage.removeItem("KEY");
    window.localStorage.removeItem("KEY");
    window.sessionStorage.removeItem("KEY");
    window.sessionStorage.removeItem("refreshStatus");
    localStorage.clear();
    sessionStorage.clear();
    this.hideLoading();
    this.router.navigate(["login"]);
  }

  public setBgYellow(className: any) {
    if (className == "assetProd") {
      $(".reportsNav .tabs button").removeClass("bgYellow");
      $(".assetProd button").addClass("bgYellow");
    } else if (className == "workflow") {
      $(".reportsNav .tabs button").removeClass("bgYellow");
      $(".workflow button").addClass("bgYellow");
    } else if (className == "salesCRM") {
      $(".reportsNav .tabs button").removeClass("bgYellow");
      $(".salesCRM button").addClass("bgYellow");
    } else if (className == "financial") {
      $(".reportsNav .tabs button").removeClass("bgYellow");
      $(".financial button").addClass("bgYellow");
    } else if (className == "repairs") {
      $(".reportsNav .tabs button").removeClass("bgYellow");
      $(".repairs button").addClass("bgYellow");
    } else if (className == "hr") {
      $(".reportsNav .tabs button").removeClass("bgYellow");
      $(".hr button").addClass("bgYellow");
    }
  }

  public setWindowWidth() {
    this.screenWidth = $("body").prop("clientWidth");
    this.contentWidth = this.screenWidth - 190;
    $("#main").css("width", this.contentWidth + "px");
    document.getElementById("Sidenav").style.width = "170px";
  }

  public setWindowHeight() {
    // let headerHeight = $(".main-header").height();
    // let footerHeight = $(".main-footer").height();
    // this.screenHeight = window.innerHeight - headerHeight - footerHeight -20;
    // $(".content-wrapper").css("min-height", this.screenHeight+"px");

    var sidebarHeight = $("#leftside-navigation").height() || 0;
    if (sidebarHeight > window.innerHeight) {
      $(".content-wrapper").css("min-height", sidebarHeight + 250);
    } else {
      $(".content-wrapper").css(
        "min-height",
        window.innerHeight -
          $(".main-header").height() -
          $(".main-footer").height() -
          20
      );
    }
    //console.log("sidebarHeight",sidebarHeight);
    window.scrollTo(0, 0);
    this.disableAutocomplete();
  }

  public toggleNavFromUtil() {
    var sideWidth = document.getElementById("Sidenav").style.width;
    if (sideWidth == "55px" || sideWidth == "") {
      this.screenWidth = $("body").prop("clientWidth");
      this.contentWidth = this.screenWidth - 190;
      document.getElementById("Sidenav").style.width = "170px";
      document.getElementById("toggleMenu").style.width = "170px";
      this.arrow = "left_arrow";

      document.getElementById("main").style.width = this.contentWidth + "px";
      $(".sidebar #leftside-navigation ul li.active ul").slideDown();
    } else {
      this.screenWidth = $("body").prop("clientWidth");
      this.contentWidth = this.screenWidth - 70;
      document.getElementById("Sidenav").style.width = "55px";
      document.getElementById("toggleMenu").style.width = "55px";
      this.arrow = "right_arrow";

      document.getElementById("main").style.width = this.contentWidth + "px";
      $(".sidebar #leftside-navigation ul li.active ul").slideUp();
    }
    return this.arrow;
  }

  mapInit(
    mapsAPILoader,
    searchElementRef,
    ngZone,
    addressField,
    addressComponents: any = false
  ) {
    let self = this;
    try {
      //load Places Autocomplete
      mapsAPILoader.load().then(() => {
        let autocomplete = new google.maps.places.Autocomplete(
          searchElementRef.nativeElement,
          {
            //types: ["address"]
          }
        );
        autocomplete.addListener("place_changed", () => {
          ngZone.run(() => {
            //get the place result
            let place: google.maps.places.PlaceResult = autocomplete.getPlace();
            //verify result
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }
            //console.log(place);
            console.log(JSON.stringify(place));
            addressField.setValue(place.formatted_address);
            addressComponents[0] &&
            addressComponents[1] &&
            addressComponents[2] &&
            addressComponents[3] &&
            addressComponents[4]
              ? this.getAddressComponents(place, addressComponents)
              : "";

            addressComponents[5]
              ? addressComponents[5].setValue(place.geometry.location.lat())
              : "";
            addressComponents[6]
              ? addressComponents[6].setValue(place.geometry.location.lng())
              : "";
            console.log(
              "Latitude : " +
                place.geometry.location.lat() +
                " Longitude : " +
                place.geometry.location.lng()
            );
            //addressComponents ? this.getAddressComponents(place, addressComponents) : '';
            console.log("addressComponents", addressComponents);
            //console.log("addressComponents[5].value", addressComponents[5].value);
            //console.log("addressComponents[6].value", addressComponents[6].value);
          });
        });
      });
    } catch (err) {
      console.log(err);
      //this.global.addException('add location','mapInit()',err);
    }
  }

  getAddressComponents(place, addressComponents) {
    addressComponents[0].setValue("");
    addressComponents[1].setValue("");
    addressComponents[2].setValue("");
    addressComponents[3].setValue("");
    place.address_components.forEach(element => {
      //console.log(element);
      if (element.types.indexOf("country") > -1) {
        console.log("Country ::", element.long_name);
        //addressComponents[0].setValue(element.long_name);
        this.setCountry(
          element.long_name,
          addressComponents[0],
          addressComponents[4]
        );
      } else if (element.types.indexOf("administrative_area_level_1") > -1) {
        console.log("State ::", element.long_name);
        addressComponents[1].setValue(element.long_name);
      } else if (element.types.indexOf("administrative_area_level_2") > -1) {
        console.log("City :: ", element.long_name);
        addressComponents[2].setValue(element.long_name);
      } else if (element.types.indexOf("postal_code") > -1) {
        console.log("Postal Code :: ", element.long_name);
        addressComponents[3].setValue(element.long_name);
      }
    });
  }

  setCountry(country, countryField, countryList) {
    for (let i = 0; i < countryList.countries.length; i++) {
      if (
        countryList.countries[i].country_name.toLowerCase() ==
        country.toLowerCase()
      ) {
        countryField.setValue(countryList.countries[i].country_id);
        break;
      }
    }
  }

  setMask(format) {
    let maskFormatArray = format.slice(1, format.length - 1).split(",");
    let maskString = "";
    for (let i = 0; i < maskFormatArray.length - 1; i++) {
      maskString = maskString + maskFormatArray[i];
    }

    let maskLen = maskFormatArray[maskFormatArray.length - 1];
    maskLen = parseInt(maskLen.slice(1, maskLen.length - 1));

    let setMaskFormat: any = [];

    for (let i = 0; i < maskLen; i++) {
      setMaskFormat.push("/" + maskString + "/");
    }

    let maskFormat = format.slice(1, format.length - 1);
    console.log("maskFormat", format[0]);
    return format;
  }

  moduleList: any[] = [
    7,
    12,
    18,
    23,
    28,
    38,
    44,
    48,
    51,
    61,
    71,
    75,
    85,
    92,
    97,
    100,
    106,
    114,
    118,
    122,
    126,
    135,
    143,
    147,
    151,
    155,
    159,
    163
  ];
  moduleDependencyMatrix: any[] = [
    {
      permissionLevelId: [9],
      dependentActions: [8, 10]
    },
    {
      permissionLevelId: [10],
      dependentActions: [8, 9]
    },
    {
      permissionLevelId: [11],
      dependentActions: [8]
    },
    {
      permissionLevelId: [14],
      dependentActions: [15]
    },
    {
      permissionLevelId: [15],
      dependentActions: [14]
    },
    {
      permissionLevelId: [14, 15, 16, 17],
      dependentActions: [13]
    },
    {
      permissionLevelId: [20, 21, 22],
      dependentActions: [19]
    },
    {
      permissionLevelId: [25, 26, 27],
      dependentActions: [24]
    },
    {
      permissionLevelId: [30, 31, 32, 33, 34, 35, 36, 37],
      dependentActions: [29]
    },
    {
      permissionLevelId: [30],
      dependentActions: [25]
    },
    {
      permissionLevelId: [41],
      dependentActions: [42]
    },
    {
      permissionLevelId: [42],
      dependentActions: [41]
    },
    {
      permissionLevelId: [40, 41, 42, 43],
      dependentActions: [39]
    },
    {
      permissionLevelId: [46, 47],
      dependentActions: [45]
    },
    {
      permissionLevelId: [46],
      dependentActions: [47]
    },
    {
      permissionLevelId: [47],
      dependentActions: [46]
    },
    {
      permissionLevelId: [53, 54, 55, 56, 57, 58, 59, 60],
      dependentActions: [52]
    },
    {
      permissionLevelId: [54],
      dependentActions: [52, 41, 25, 30, 98]
    },
    {
      permissionLevelId: [55],
      dependentActions: [52, 54]
    },
    {
      permissionLevelId: [63, 64, 65, 66, 67, 68, 69, 70],
      dependentActions: [62]
    },
    {
      permissionLevelId: [64],
      dependentActions: [41, 30, 25, 98]
    },
    {
      permissionLevelId: [73, 74],
      dependentActions: [72]
    },
    {
      permissionLevelId: [73],
      dependentActions: [52, 76]
    },
    {
      permissionLevelId: [74],
      dependentActions: [41, 25, 30, 93]
    },
    {
      permissionLevelId: [77, 78, 79, 80, 81, 82, 83, 84],
      dependentActions: [76]
    },
    {
      permissionLevelId: [78],
      dependentActions: [41, 30, 25, 98]
    },
    {
      permissionLevelId: [79],
      dependentActions: [76, 78]
    },
    {
      permissionLevelId: [87, 88, 89, 90, 91],
      dependentActions: [86]
    },
    {
      permissionLevelId: [89],
      dependentActions: [115, 116]
    },
    {
      permissionLevelId: [94, 95, 96],
      dependentActions: [93]
    },
    {
      permissionLevelId: [94],
      dependentActions: [93, 25, 30, 41]
    },
    {
      permissionLevelId: [99],
      dependentActions: [98]
    },
    {
      permissionLevelId: [102, 103, 104, 105],
      dependentActions: [101]
    },
    {
      permissionLevelId: [108, 109, 110, 111, 112, 113],
      dependentActions: [107]
    },
    {
      permissionLevelId: [109],
      dependentActions: [9, 123]
    },
    {
      permissionLevelId: [116, 117],
      dependentActions: [115]
    },
    {
      permissionLevelId: [120, 121],
      dependentActions: [119]
    },
    {
      permissionLevelId: [123, 124, 125],
      dependentActions: [122]
    },
    {
      permissionLevelId: [125],
      dependentActions: [123]
    },
    {
      permissionLevelId: [128, 129, 130, 131, 132, 133, 134],
      dependentActions: [127]
    },
    {
      permissionLevelId: [131],
      dependentActions: [127, 129]
    },
    {
      permissionLevelId: [129],
      dependentActions: [127, 132]
    },
    {
      permissionLevelId: [137, 138, 139, 140, 141, 142],
      dependentActions: [136]
    },
    {
      permissionLevelId: [138],
      dependentActions: [136, 141]
    },
    {
      permissionLevelId: [141],
      dependentActions: [136, 138]
    },
    {
      permissionLevelId: [145, 146],
      dependentActions: [144]
    },
    {
      permissionLevelId: [146],
      dependentActions: [127]
    },
    {
      permissionLevelId: [149, 150],
      dependentActions: [148]
    },
    {
      permissionLevelId: [153, 154],
      dependentActions: [152]
    },
    {
      permissionLevelId: [157, 158],
      dependentActions: [156]
    },
    {
      permissionLevelId: [161, 162],
      dependentActions: [160]
    },
    {
      permissionLevelId: [161],
      dependentActions: [160, 162]
    }
  ];

  getDependentActions(id, callback) {
    let dependencyArr: any[] = [];
    for (let i = 0; i < this.moduleDependencyMatrix.length; i++) {
      for (
        var j = 0;
        j < this.moduleDependencyMatrix[i].permissionLevelId.length;
        j++
      ) {
        if (this.moduleDependencyMatrix[i].permissionLevelId[j] == id) {
          console.log(
            "this.moduleDependencyMatrix[i].dependentActions",
            this.moduleDependencyMatrix[i].dependentActions
          );
          dependencyArr = this.moduleDependencyMatrix[i].dependentActions;
          //break;
        }
      }
    }
    return callback(dependencyArr);
  }

  permissionList: any[];
  //Sort page vise permission
  generatePermissionData() {
    let userPer: any[] = JSON.parse(atob(localStorage.getItem("USER")))
      .permissions;
    //console.log(JSON.stringify(JSON.parse(atob(localStorage.getItem('USER'))).permissions));
    let permissionList: any[] = [];
    for (let i = 0; i < this.moduleList.length; i++) {
      let obj = { moduleId: this.moduleList[i] };
      for (let j = 0; j < userPer.length; j++) {
        if (this.moduleList[i] == userPer[j].parent_menu_id) {
          obj[this.getKey(userPer[j].menu)] =
            userPer[j].is_access == 1 ? true : false;
        }
        if (this.moduleList[i] == 122) {
          if (
            userPer[j].permission_level_id >= 122 &&
            125 >= userPer[j].permission_level_id
          ) {
            obj[this.getKey(userPer[j].menu)] =
              userPer[j].is_access == 1 ? true : false;
          }
        }
      }
      permissionList.push(obj);
    }
    localStorage.setItem("permissionList", JSON.stringify(permissionList));
    console.log(" Permission Set :::::::: ", permissionList);
  }

  getKey(nameString) {
    let strArr = nameString
      .replace("/", " ")
      .replace("-", " ")
      .split(" ");
    let finalStr = "";
    for (let i = 0; i < strArr.length; i++) {
      finalStr += strArr[i];
    }
    return (
      finalStr.charAt(0).toLowerCase() + finalStr.slice(1, finalStr.length)
    );
  }

  getModulePermission(moduleId): any {
    let permissions: any[] = JSON.parse(localStorage.getItem("permissionList"));
    //console.log(JSON.stringify(permissions));
    for (let i = 0; i < permissions.length; i++) {
      if (moduleId == permissions[i].moduleId) {
        return permissions[i];
      }
    }
  }

  checkModuleAccess(moduleId): boolean {
    let userPermission: any[] = JSON.parse(atob(localStorage.getItem("USER")))
      .permissions;
    for (let i = 0; i < userPermission.length; i++) {
      if (userPermission[i].permission_level_id == moduleId) {
        return userPermission[i].is_access == 1 ? true : false;
      }
    }

    return true;
  }

  public filterMenu(): any[] {
    let menus: any[] = JSON.parse(JSON.stringify(this.constant.MENU_LIST));
    let userPermission: any[] = JSON.parse(atob(localStorage.getItem("USER")))
      .permissions;
    for (let i = menus.length - 1; i >= 0; i--) {
      for (let j = menus[i].subMenu.length - 1; j >= 0; j--) {
        for (let k = 0; k < userPermission.length; k++) {
          if (
            menus[i].subMenu[j].permission_level_id ==
              userPermission[k].permission_level_id &&
            userPermission[k].is_access == 0
          ) {
            menus[i].subMenu.splice(j, 1);
            break;
          }
        }
      }

      // This is for CRM and Dispatch
      for (let k = 0; k < userPermission.length; k++) {
        //122 - CRM Menu
        //166 - Dispatch Menu
        if (
          menus[i].permission_level_id == 122 ||
          menus[i].permission_level_id == 166
        ) {
          if (
            menus[i].permission_level_id ==
              userPermission[k].permission_level_id &&
            userPermission[k].is_access == 0
          ) {
            menus.splice(i, 1);
            break;
          }
        }
      }

      //This is to remove main menu is submenu list is 0
      // 8 - Messaging
      // 5 - CRM
      // 1000 - Dashboard
      // 9 - Dispatch
      if (
        menus[i].subMenu.length == 0 &&
        menus[i].menuId != 8 &&
        menus[i].menuId != 5 &&
        menus[i].menuId != 1000 &&
        menus[i].menuId != 9
      ) {
        menus.splice(i, 1);
      }

      console.log(this.getModulePermission(122));
    }

    console.log("Filtered Menu ::", menus);
    return menus;
  }

  public getMenulist(): any[] {
    return JSON.parse(atob(localStorage.getItem("USER"))).role_id == 2
      ? this.constant.MENU_LIST
      : this.filterMenu();
  }
}
