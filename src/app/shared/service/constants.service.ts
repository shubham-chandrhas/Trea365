import { Injectable} from '@angular/core';


@Injectable()
export class ConstantsService {
	//for masking regex..
	TIME_MASK = [ /[0-9]/, /\d/, ':', /\d/, /\d/];
	PHONE_NUMBER_MASK = [ /[1-9]/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
	MOBILE_NUMBER_MASK = [ /[1-9]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];

	//validation regex..
	EMAIL_PATTERN = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
	TIME_PATTERN = /^(1[0-2]|0?[1-9]):[0-5][0-9]$/;
	// TIME_PATTERN = /(((0[1-9])|(1[0-2])):([0-5])(0|5))/;
	MOBILE_PATTERN = /^([0|\+[0-9]{1,5})?([1-9][0-9]{9})$/;
	PHONE_PATTERN = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/; //allow dash with only numbers
	//PASSWORD_PATTERN = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,30}$/;
	PASSWORD_PATTERN = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
	//POSTAL_CODE_PATTERN=/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
	POSTAL_CODE_PATTERN = /^[A-Za-z\d\s-]+$/;
	REQ_ONE_CHAR_PATTERN = /^(?!\s*$)[-a-zA-Z0-9_:,.\s]{2,100}$/;
    AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
    AMOUNT_PATTERN_3DECIMAL = /^\d+(\.\d{1,3})?$/;
	AMOUNT_NEG_PATTERN = /^-?[0-9]\d*(\.\d+)?$/;
	NO_SPACE_PATTERN = /^\S*$/;
    ONLY_NUMBER = /^\d+$/;
    ONLY_NUMBER_WITHOUT_ZERO = /(^[1-9]\d{0,8}$)/;
	POS_AND_NEQ_NUMBERS_PATTERN = /^-?\d*\.?\d+$/;
	DECIMAL_NUMBERS_PATTERN = /^\d+\.\d$/;
    WHITE_SPACE_PATTERN = /^\s* /g;
    WEBSITE_PATTERN = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
	//DATA_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
	DATA_PATTERN = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
	CODE39_WITH_SPACE_PATTERN = /^[A-Za-z\d\s-/.+%$]+$/;
	CODE39_WITHOUT_SPACE_PATTERN = /^[A-Za-z\d-/.+%$]+$/;
	//for Pagination
    DEFAULT_PAGINATION_ITEMS: any = [5,10,15,20,25,50,100,150,200];
	PAGINATION_ITEMS: any = [5,10,15,20,25,50,100,150,200]; //for development
	//PAGINATION_ITEMS:any = [1,2,3,4,5,6,7,8,9,10,15]; //for testing only
	ITEM_COUNT: number = 0;
	CURRENT_PAGE: number = 1;
	ITEMS_PER_PAGE: number = 15;
    DEFAULT_ITEMS_PER_PAGE: number = 15;
	DEFAULT_MAX_PRICE: number = 1000000;
	DEFAULT_TEXT_MAXLENGTH: number = 120;
	DEFAULT_COMMENT_MAXLENGTH: number = 10000;


	EXCEPTIONAL_MSG = "Oops something went wrong please contact to Trea365 administrator.";
	SUSPENDED_AC_MSG = "Your account has been suspended. Please contact your company administrator or Call XXX-XXX-XXXX to speak with a TREA 365 Representative.";
	WORNING_AC_MSG = "Your payment is due, Please pay your bill, if you want to continue using the Trea365.";
	SET_PASSWORD_ERR_MSG = "Your registration process is incomplete; Please complete registration process with set password to login.";
    UNAUTHORISED_USER_MSG = "You are not authorised user to access this platform please contact to Trea365 administrator. ";
    NO_PERMISSION_MSG= "You don't have access to system. Please contact your administrator.";

	MENU_LIST: any[] = [{
            'menuId' : 1000,
            "permission_level_id":1000,
            'menuName' : 'Dashboard',
            'menuIcon' : 'assets/icon/dashboard_icon.png',
            'link' : '/c-dashboard/csa/summary',
            'subMenu' :[]
            //'subMenu' :[{
            //    'subMenuId' : 9000,
            //    "permission_level_id":9000,
            //    'subMenuName' : 'Summary',
            //    'subMenuIcon' : '',
                //'link' : '/csa/summary',
            //    'link' : '/c-dashboard/csa/summary',
            //}
            // ,{
            //     'subMenuId' : 10000,
            //     "permission_level_id":10000,
            //     'subMenuName' : 'Reports',
            //     'subMenuIcon' : '',
            //     'link' : '/c-dashboard/csa/reports',
            // }

            //]
        },{
            'menuId' : 2,
            "permission_level_id":1,
            'menuName' : 'Admin',
            'menuIcon' : 'assets/icon/admin_icon.png',
            'link' : '',
            'subMenu' :[{
                'subMenuId' : 11,
                "permission_level_id":8,
                'subMenuName' : 'Nature of Business',
                'subMenuIcon' : '',
                'link' : '/admin/csa/business-nature/0',
            },{
                'subMenuId' : 12,
                "permission_level_id":13,
                'subMenuName' : 'Locations',
                'subMenuIcon' : '',
                'link' : '/admin/csa/location-list/0',
            },{
                'subMenuId' : 15,
                "permission_level_id":19,
                'subMenuName' : 'Item Categories',
                'subMenuIcon' : '',
                'link' : '/admin/csa/item-classes/0',
            },{
                'subMenuId' : 13,
                "permission_level_id":24,
                'subMenuName' : 'Manufacturers',
                'subMenuIcon' : '',
                'link' : '/admin/csa/manufacturer/0',
            },{
                'subMenuId' : 14,
                "permission_level_id":29,
                'subMenuName' : 'Item Definition',
                'subMenuIcon' : '',
                'link' : '/admin/csa/manufacturer-part/0',
            },{
                'subMenuId' : 16,
                "permission_level_id":39,
                'subMenuName' : 'Suppliers',
                'subMenuIcon' : '',
                'link' : '/admin/csa/supplier-list/0',
            },{
                'subMenuId' : 17,
                "permission_level_id":45,
                'subMenuName' : 'Permissions',
                'subMenuIcon' : '',
                'link' : '/admin/csa/role-list/0',
            },{
                'subMenuId' : 18,
                "permission_level_id":49,
                'subMenuName' : 'Labels',
                'subMenuIcon' : '',
                'link' : '/admin/csa/print-label',
            }]
        },{
            'menuId' : 3,
            "permission_level_id":2,
            'menuName' : 'Inventory',
            'menuIcon' : 'assets/icon/inventory_icon.png',
            'link' : '',
            'subMenu' :[{
                'subMenuId' : 19,
                "permission_level_id":52,
                'subMenuName' : 'Products',
                'menuIcon' : '',
                'link' : '/inventory/csa/product-list/0',
            },{
                'subMenuId' : 20,
                "permission_level_id":62,
                'subMenuName' : 'Assets',
                'menuIcon' : '',
                'link' : '/inventory/csa/asset-list/0'
            },{
                'subMenuId' : 34,
                "permission_level_id":76,
                'subMenuName' : 'Materials',
                'menuIcon' : '',
                'link' : '/inventory/csa/material-list/0'
            },{
                'subMenuId' : 35,
                "permission_level_id":72,
                'subMenuName' : 'Tracker',
                'menuIcon' : '',
                'link' : '/inventory/csa/tracker/0'
            },{
                'subMenuId' : 21,
                "permission_level_id":86,
                'subMenuName' : 'Maintenance',
                'menuIcon' : '',
                'link' : '/inventory/csa/maintenance-list/0'
            },{
                'subMenuId' : 22,
                "permission_level_id":93,
                'subMenuName' : 'P/O',
                'menuIcon' : '',
                'link' : '/inventory/po/csa/purchase-order-list/0'
            },{
                'subMenuId' : 23,
                "permission_level_id":98,
                'subMenuName' : 'R/S',
                'menuIcon' : '',
                'link' : '/inventory/rs/csa/receiving-slips-list/0'
            },{
                'subMenuId' : 24,
                "permission_level_id":101,
                'subMenuName' : 'Audit',
                'menuIcon' : '',
                'link' : '/inventory/audit/csa/audit-list/0'
            }]
        },{
            'menuId' : 4,
            'menuName' : 'Workflow',
            'menuIcon' : 'assets/icon/workflow_icon.png',
            'link' : '',
            'subMenu' :[{
                'subMenuId' : 25,
                "permission_level_id":107,
                'subMenuName' : 'Quotations',
                'subMenuIcon' : '',
                'link' : '/workflow/quote/csa/quotation-list/0'
            },{
                'subMenuId' : 26,
                "permission_level_id":115,
                'subMenuName' : 'Work Orders',
                'subMenuIcon' : '',
                'link' : '/workflow/wo/csa/work-order-list/0'
            },{
                'subMenuId' : 27,
                "permission_level_id":119,
                'subMenuName' : 'Scheduling',
                'subMenuIcon' : '',
                'link' : '/workflow/schedule/csa/schedule-timeline'
            }]
        }, {
            'menuId': 9,
            "permission_level_id": 166,
            'menuName': 'Dispatch',   //Dashboard
            'menuIcon': 'assets/icon/inventory_icon.png',
            'link': '/dispatch/csa/dashboard',
            'subMenu': []
        },
        // {
        //     'menuId' : 5,
        //     "permission_level_id":122,
        //     'menuName' : 'CRM',
        //     'menuIcon' : 'assets/icon/dashboard_icon.png',
        //     'link' : '/crm/csa/client-list/0',
        //     'subMenu' :[]
        // },
        {
            'menuId' : 5,
            "permission_level_id":122,
            'menuName' : 'CRM',
            'menuIcon' : 'assets/icon/dashboard_icon.png',
            'link' : '/new-crm/csa/client-list/0',
            'subMenu' :[]
        },
        {
            'menuId' : 6,
            "permission_level_id":5,
            'menuName' : 'HR',
            'menuIcon' : 'assets/icon/hr_icon.png',
            'link' : '',
            'subMenu' :[{
                'subMenuId' : 28,
                "permission_level_id":127,
                'subMenuName' : 'Employees',
                'subMenuIcon' : '',
                'link' : '/hr/csa/employee-list/0'
            },{
                'subMenuId' : 29,
                "permission_level_id":136,
                'subMenuName' : 'Sub-Contractor',
                'subMenuIcon' : '',
                'link' : '/hr/csa/sub-contractor-list/0'
            },{
                'subMenuId' : 30,
                "permission_level_id":144,
                'subMenuName' : 'Timesheets',
                'subMenuIcon' : '',
                'link' : '/hr/csa/timesheet-list/0'
            }]
        },{
            'menuId' : 7,
            "permission_level_id":6,
            'menuName' : 'Financials',
            'menuIcon' : 'assets/icon/accounting_icon.png',
            'link' : '',
            'subMenu' :[{
                'subMenuId' : 32,
                "permission_level_id":148,
                'subMenuName' : 'Receivables',
                'subMenuIcon' : '',
                'link' : '/account/csa/acc-receivables/0'
            },{
                'subMenuId' : 37,
                "permission_level_id":152,
                'subMenuName' : 'Payables',
                'subMenuIcon' : '',
                'link' : '/account/csa/acc-payables/0'
            },{
                'subMenuId' : 33,
                "permission_level_id":156,
                'subMenuName' : 'Invoice List',
                'subMenuIcon' : '',
                'link' : '/account/csa/invoice-list/0'
            }
            // },{
            //     'subMenuId' : 36,
            //     "permission_level_id":160,
            //     'subMenuName' : 'Create Invoice',
            //     'subMenuIcon' : '',
            //     'link' : '/account/csa/new-invoice'
            // },{
                ,{
                'subMenuId' : 34,
                "permission_level_id":164,
                'subMenuName' : 'Ledger',
                'subMenuIcon' : '',
                'link' : '/account/csa/ledger-list/0'
            }]
        },{
            'menuId' : 8,
            "permission_level_id":60900,
            'menuName' : 'Messaging',
            'menuIcon' : 'assets/icon/message_icon.png',
            'link' : '/message/csa/messaging',
            'subMenu' :[]
        }];

	TEMP = [{
    	'start_date' : '18/12/2018',
        'end_date' : '18/12/2018',
        'start_time' : '08:00',
        'end_time' : '10:00',
        'start_time_format' : 'am',
        'end_time_format' : 'am',
        'team': [{
			"id":881,
			"first_name":"Kunal",
			"last_name":"Kumar",
			"employee_id":"Kunakumar87",
			"username":"Kunakumar",
			"designation":null,
			"country_code":"+1",
			"mobile_no":null,
			"email_id":"nbhajbhuje+10@torinit.com",
			"work_phone":"8953323131",
			"title":"Manager",
			"permission_role_id":4,
			"wage_frequency":"Hourly",
			"wage_amount":12,
			"emergency_contact":null,
			"emergency_number":null,
			"relationship":null,
			"company_id":6,
			"role_id":3,
			"login_type":null,
			"additional_fields":"\"[]\"",
			"days_off":"[{\"friday\": 0, \"monday\": 0, \"sunday\": 1, \"tuesday\": 0, \"saturday\": 1, \"thursday\": 0, \"wednesday\": 0}]",
			"is_active":0,
			"is_locked":0,
			"is_deleted":0,
			"created_by":878,
			"updated_by":878,
			"created_at":"2018-08-07 11:43:40",
			"updated_at":"2018-08-07 11:43:40",
			"deleted_at":null,
			"role":{
				"role_id":3,
				"role_name":"Employee",
				"created_by":1,
				"updated_by":1,
				"created_at":"2017-11-08 11:06:46",
				"updated_at":"2018-06-07 06:54:34"
			}
		},{
			"id":883,
			"first_name":"Seema",
			"last_name":"Rao",
			"employee_id":null,
			"username":"Seemarao",
			"designation":null,
			"country_code":"+1",
			"mobile_no":null,
			"email_id":"nbhajbhuje+12@torinit.com",
			"work_phone":"7523323323",
			"title":"Accountant",
			"permission_role_id":null,
			"wage_frequency":"HOURLY",
			"wage_amount":11,
			"emergency_contact":null,
			"emergency_number":null,
			"relationship":null,
			"company_id":6,
			"role_id":4,
			"login_type":null,
			"additional_fields":"\"[]\"",
			"days_off":"[{\"friday\": 0, \"monday\": 0, \"sunday\": 1, \"tuesday\": 0, \"saturday\": 1, \"thursday\": 0, \"wednesday\": 0}]",
			"is_active":0,
			"is_locked":0,
			"is_deleted":0,
			"created_by":878,
			"updated_by":878,
			"created_at":"2018-08-07 11:46:43",
			"updated_at":"2018-08-07 11:46:43",
			"deleted_at":null,
			"role":{
				"role_id":4,
				"role_name":"Sub Contractor",
				"created_by":1,
				"updated_by":1,
				"created_at":"2017-11-08 11:06:46",
				"updated_at":"2018-06-07 06:55:52"
			}
		},{
			"id":941,
			"first_name":"Rakesh",
			"last_name":"Tiwari",
			"employee_id":null,
			"username":"rakesh@1234",
			"designation":null,
			"country_code":"+1",
			"mobile_no":null,
			"email_id":"rakesh11@email.com",
			"work_phone":"4555555555",
			"title":null,
			"permission_role_id":null,
			"wage_frequency":"HOURLY",
			"wage_amount":null,
			"emergency_contact":null,
			"emergency_number":null,
			"relationship":null,
			"company_id":6,
			"role_id":4,
			"login_type":null,
			"additional_fields":"\"[]\"",
			"days_off":"[{\"friday\": 0, \"monday\": 0, \"sunday\": 1, \"tuesday\": 0, \"saturday\": 0, \"thursday\": 0, \"wednesday\": 0}]",
			"is_active":0,
			"is_locked":0,
			"is_deleted":0,
			"created_by":878,
			"updated_by":878,
			"created_at":"2018-08-28 04:16:59",
			"updated_at":"2018-08-28 04:16:59",
			"deleted_at":null,
			"role":{
				"role_id":4,
				"role_name":"Sub Contractor",
				"created_by":1,
				"updated_by":1,
				"created_at":"2017-11-08 11:06:46",
				"updated_at":"2018-06-07 06:55:52"
			}
		},{
			"id":944,
			"first_name":"Rakesh",
			"last_name":"Tiwari",
			"employee_id":"E#001",
			"username":"r@123123",
			"designation":null,
			"country_code":"+1",
			"mobile_no":null,
			"email_id":"tttttt@mmm.clmmm",
			"work_phone":"7666666666",
			"title":null,
			"permission_role_id":4,
			"wage_frequency":"Hourly",
			"wage_amount":40000,
			"emergency_contact":null,
			"emergency_number":null,
			"relationship":null,
			"company_id":6,
			"role_id":3,
			"login_type":null,
			"additional_fields":"\"[{\\\"label\\\":\\\"L#1\\\",\\\"dataType\\\":\\\"Text\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"1\\\"},{\\\"label\\\":\\\"L#2\\\",\\\"dataType\\\":\\\"Number\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"2\\\"},{\\\"label\\\":\\\"L#3\\\",\\\"dataType\\\":\\\"Date\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"31\/08\/2018\\\"},{\\\"label\\\":\\\"L#4\\\",\\\"dataType\\\":\\\"Decimal\\\",\\\"optionalStatus\\\":\\\"True\\\",\\\"data\\\":\\\"4.6\\\"},{\\\"label\\\":\\\"L#5\\\",\\\"dataType\\\":\\\"Text\\\",\\\"optionalStatus\\\":\\\"True\\\",\\\"data\\\":\\\"5\\\"},{\\\"label\\\":\\\"L#6\\\",\\\"dataType\\\":\\\"Number\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"55\\\"},{\\\"label\\\":\\\"L#7\\\",\\\"dataType\\\":\\\"Date\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"15\/08\/2018\\\"}]\"",
			"days_off":"[{\"friday\": 0, \"monday\": 0, \"sunday\": 1, \"tuesday\": 0, \"saturday\": 0, \"thursday\": 0, \"wednesday\": 0}]",
			"is_active":0,
			"is_locked":0,
			"is_deleted":0,
			"created_by":878,
			"updated_by":878,
			"created_at":"2018-08-28 07:46:23",
			"updated_at":"2018-08-31 10:24:41",
			"deleted_at":null,
			"role":{
				"role_id":3,
				"role_name":"Employee",
				"created_by":1,
				"updated_by":1,
				"created_at":"2017-11-08 11:06:46",
				"updated_at":"2018-06-07 06:54:34"
			}
		}],
        'asset': [{
			"asset":{
				"asset_id":4,
				"po_id":null,
				"po_item_id":null,
				"receiving_slip_id":null,
				"manf_id":17,
				"manf_part_id":11,
				"serial_no":"875000",
				"scan_code":"875000",
				"short_tag":"MA87500",
				"location_id":5,
				"location_tag_id":56,
				"comment":null,
				"status":"Available",
				"assign_to":null,
				"is_unlisted":0,
				"company_id":6,
				"created_by":878,
				"updated_by":878,
				"created_at":"2018-08-07 11:20:39",
				"updated_at":"2018-12-13 07:01:40",
				"deleted_at":null,
				"asset_with_location":"MA87500 - PP",
				"manf_part_detail":{
					"manf_part_id":11,
					"manf_id":17,
					"manf_part_no":"873",
					"upc":873000000000,
					"full_name":"MP_ASSET_#1_C#1_M#1",
					"short_name":"MP_ASSET_#2_C#1_M#1",
					"class_id":13,
					"minimum_stock":null,
					"uom_id":null,
					"sales_markup":null,
					"company_id":6
				}
			},
			"locationAsset":null,
			"locationProduct":null,
			"locationMaterial":null
		},{
			"asset":{
				"asset_id":53,
				"po_id":null,
				"po_item_id":null,
				"receiving_slip_id":null,
				"manf_id":17,
				"manf_part_id":11,
				"serial_no":"300000",
				"scan_code":"300000",
				"short_tag":"ASSET-200",
				"location_id":29,
				"location_tag_id":460,
				"comment":null,
				"status":"Available",
				"assign_to":null,
				"is_unlisted":0,
				"company_id":6,
				"created_by":878,
				"updated_by":878,
				"created_at":"2018-08-30 06:04:03",
				"updated_at":"2018-08-30 06:04:03",
				"deleted_at":null,
				"asset_with_location":"ASSET-200 - Nashik",
				"manf_part_detail":{
					"manf_part_id":11,
					"manf_id":17,
					"manf_part_no":"873",
					"upc":873000000000,
					"full_name":"MP_ASSET_#1_C#1_M#1",
					"short_name":"MP_ASSET_#2_C#1_M#1",
					"class_id":13,
					"minimum_stock":null,
					"uom_id":null,
					"sales_markup":null,
					"company_id":6
				}
			},
			"locationAsset":null,
			"locationProduct":null,
			"locationMaterial":null
		},{
			"asset":{
				"asset_id":74,
				"po_id":null,
				"po_item_id":null,
				"receiving_slip_id":null,
				"manf_id":17,
				"manf_part_id":11,
				"serial_no":"9099999",
				"scan_code":"9099999",
				"short_tag":"ASSET-10001",
				"location_id":71,
				"location_tag_id":684,
				"comment":"aaaa",
				"status":"Available",
				"assign_to":null,
				"is_unlisted":0,
				"company_id":6,
				"created_by":878,
				"updated_by":878,
				"created_at":"2018-09-07 06:08:35",
				"updated_at":"2018-09-12 09:40:09",
				"deleted_at":null,
				"asset_with_location":"ASSET-10001 - VimanP",
				"manf_part_detail":{
					"manf_part_id":11,
					"manf_id":17,
					"manf_part_no":"873",
					"upc":873000000000,
					"full_name":"MP_ASSET_#1_C#1_M#1",
					"short_name":"MP_ASSET_#2_C#1_M#1",
					"class_id":13,
					"minimum_stock":null,
					"uom_id":null,
					"sales_markup":null,
					"company_id":6
				}
			},
			"locationAsset":[],
			"locationProduct":[],
			"locationMaterial":[]
		},{
			"asset":{
				"asset_id":84,
				"po_id":null,
				"po_item_id":null,
				"receiving_slip_id":null,
				"manf_id":17,
				"manf_part_id":11,
				"serial_no":"444444",
				"scan_code":"444444",
				"short_tag":"Asset Test",
				"location_id":71,
				"location_tag_id":684,
				"comment":"Test abcd",
				"status":"Available",
				"assign_to":null,
				"is_unlisted":0,
				"company_id":6,
				"created_by":878,
				"updated_by":878,
				"created_at":"2018-09-12 07:53:34",
				"updated_at":"2018-09-12 09:34:21",
				"deleted_at":null,
				"asset_with_location":"Asset Test - VimanP",
				"manf_part_detail":{
					"manf_part_id":11,
					"manf_id":17,
					"manf_part_no":"873",
					"upc":873000000000,
					"full_name":"MP_ASSET_#1_C#1_M#1",
					"short_name":"MP_ASSET_#2_C#1_M#1",
					"class_id":13,
					"minimum_stock":null,
					"uom_id":null,
					"sales_markup":null,
					"company_id":6
				}
			},
			"locationAsset":null,
			"locationProduct":null,
			"locationMaterial":null
		}],
        'tab': 'services'
    },{
    	'start_date' : '19/12/2018',
        'end_date' : '19/12/2018',
        'start_time' : '08:00',
        'end_time' : '10:00',
        'start_time_format' : 'am',
        'end_time_format' : 'am',
        'team': [{
			"id":881,
			"first_name":"Kunal",
			"last_name":"Kumar",
			"employee_id":"Kunakumar87",
			"username":"Kunakumar",
			"designation":null,
			"country_code":"+1",
			"mobile_no":null,
			"email_id":"nbhajbhuje+10@torinit.com",
			"work_phone":"8953323131",
			"title":"Manager",
			"permission_role_id":4,
			"wage_frequency":"Hourly",
			"wage_amount":12,
			"emergency_contact":null,
			"emergency_number":null,
			"relationship":null,
			"company_id":6,
			"role_id":3,
			"login_type":null,
			"additional_fields":"\"[]\"",
			"days_off":"[{\"friday\": 0, \"monday\": 0, \"sunday\": 1, \"tuesday\": 0, \"saturday\": 1, \"thursday\": 0, \"wednesday\": 0}]",
			"is_active":0,
			"is_locked":0,
			"is_deleted":0,
			"created_by":878,
			"updated_by":878,
			"created_at":"2018-08-07 11:43:40",
			"updated_at":"2018-08-07 11:43:40",
			"deleted_at":null,
			"role":{
				"role_id":3,
				"role_name":"Employee",
				"created_by":1,
				"updated_by":1,
				"created_at":"2017-11-08 11:06:46",
				"updated_at":"2018-06-07 06:54:34"
			}
		},{
			"id":883,
			"first_name":"Seema",
			"last_name":"Rao",
			"employee_id":null,
			"username":"Seemarao",
			"designation":null,
			"country_code":"+1",
			"mobile_no":null,
			"email_id":"nbhajbhuje+12@torinit.com",
			"work_phone":"7523323323",
			"title":"Accountant",
			"permission_role_id":null,
			"wage_frequency":"HOURLY",
			"wage_amount":11,
			"emergency_contact":null,
			"emergency_number":null,
			"relationship":null,
			"company_id":6,
			"role_id":4,
			"login_type":null,
			"additional_fields":"\"[]\"",
			"days_off":"[{\"friday\": 0, \"monday\": 0, \"sunday\": 1, \"tuesday\": 0, \"saturday\": 1, \"thursday\": 0, \"wednesday\": 0}]",
			"is_active":0,
			"is_locked":0,
			"is_deleted":0,
			"created_by":878,
			"updated_by":878,
			"created_at":"2018-08-07 11:46:43",
			"updated_at":"2018-08-07 11:46:43",
			"deleted_at":null,
			"role":{
				"role_id":4,
				"role_name":"Sub Contractor",
				"created_by":1,
				"updated_by":1,
				"created_at":"2017-11-08 11:06:46",
				"updated_at":"2018-06-07 06:55:52"
			}
		},{
			"id":941,
			"first_name":"Rakesh",
			"last_name":"Tiwari",
			"employee_id":null,
			"username":"rakesh@1234",
			"designation":null,
			"country_code":"+1",
			"mobile_no":null,
			"email_id":"rakesh11@email.com",
			"work_phone":"4555555555",
			"title":null,
			"permission_role_id":null,
			"wage_frequency":"HOURLY",
			"wage_amount":null,
			"emergency_contact":null,
			"emergency_number":null,
			"relationship":null,
			"company_id":6,
			"role_id":4,
			"login_type":null,
			"additional_fields":"\"[]\"",
			"days_off":"[{\"friday\": 0, \"monday\": 0, \"sunday\": 1, \"tuesday\": 0, \"saturday\": 0, \"thursday\": 0, \"wednesday\": 0}]",
			"is_active":0,
			"is_locked":0,
			"is_deleted":0,
			"created_by":878,
			"updated_by":878,
			"created_at":"2018-08-28 04:16:59",
			"updated_at":"2018-08-28 04:16:59",
			"deleted_at":null,
			"role":{
				"role_id":4,
				"role_name":"Sub Contractor",
				"created_by":1,
				"updated_by":1,
				"created_at":"2017-11-08 11:06:46",
				"updated_at":"2018-06-07 06:55:52"
			}
		},{
			"id":944,
			"first_name":"Rakesh",
			"last_name":"Tiwari",
			"employee_id":"E#001",
			"username":"r@123123",
			"designation":null,
			"country_code":"+1",
			"mobile_no":null,
			"email_id":"tttttt@mmm.clmmm",
			"work_phone":"7666666666",
			"title":null,
			"permission_role_id":4,
			"wage_frequency":"Hourly",
			"wage_amount":40000,
			"emergency_contact":null,
			"emergency_number":null,
			"relationship":null,
			"company_id":6,
			"role_id":3,
			"login_type":null,
			"additional_fields":"\"[{\\\"label\\\":\\\"L#1\\\",\\\"dataType\\\":\\\"Text\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"1\\\"},{\\\"label\\\":\\\"L#2\\\",\\\"dataType\\\":\\\"Number\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"2\\\"},{\\\"label\\\":\\\"L#3\\\",\\\"dataType\\\":\\\"Date\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"31\/08\/2018\\\"},{\\\"label\\\":\\\"L#4\\\",\\\"dataType\\\":\\\"Decimal\\\",\\\"optionalStatus\\\":\\\"True\\\",\\\"data\\\":\\\"4.6\\\"},{\\\"label\\\":\\\"L#5\\\",\\\"dataType\\\":\\\"Text\\\",\\\"optionalStatus\\\":\\\"True\\\",\\\"data\\\":\\\"5\\\"},{\\\"label\\\":\\\"L#6\\\",\\\"dataType\\\":\\\"Number\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"55\\\"},{\\\"label\\\":\\\"L#7\\\",\\\"dataType\\\":\\\"Date\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"15\/08\/2018\\\"}]\"",
			"days_off":"[{\"friday\": 0, \"monday\": 0, \"sunday\": 1, \"tuesday\": 0, \"saturday\": 0, \"thursday\": 0, \"wednesday\": 0}]",
			"is_active":0,
			"is_locked":0,
			"is_deleted":0,
			"created_by":878,
			"updated_by":878,
			"created_at":"2018-08-28 07:46:23",
			"updated_at":"2018-08-31 10:24:41",
			"deleted_at":null,
			"role":{
				"role_id":3,
				"role_name":"Employee",
				"created_by":1,
				"updated_by":1,
				"created_at":"2017-11-08 11:06:46",
				"updated_at":"2018-06-07 06:54:34"
			}
		}],
        'asset': [{
			"asset":{
				"asset_id":4,
				"po_id":null,
				"po_item_id":null,
				"receiving_slip_id":null,
				"manf_id":17,
				"manf_part_id":11,
				"serial_no":"875000",
				"scan_code":"875000",
				"short_tag":"MA87500",
				"location_id":5,
				"location_tag_id":56,
				"comment":null,
				"status":"Available",
				"assign_to":null,
				"is_unlisted":0,
				"company_id":6,
				"created_by":878,
				"updated_by":878,
				"created_at":"2018-08-07 11:20:39",
				"updated_at":"2018-12-13 07:01:40",
				"deleted_at":null,
				"asset_with_location":"MA87500 - PP",
				"manf_part_detail":{
					"manf_part_id":11,
					"manf_id":17,
					"manf_part_no":"873",
					"upc":873000000000,
					"full_name":"MP_ASSET_#1_C#1_M#1",
					"short_name":"MP_ASSET_#2_C#1_M#1",
					"class_id":13,
					"minimum_stock":null,
					"uom_id":null,
					"sales_markup":null,
					"company_id":6
				}
			},
			"locationAsset":null,
			"locationProduct":null,
			"locationMaterial":null
		},{
			"asset":{
				"asset_id":53,
				"po_id":null,
				"po_item_id":null,
				"receiving_slip_id":null,
				"manf_id":17,
				"manf_part_id":11,
				"serial_no":"300000",
				"scan_code":"300000",
				"short_tag":"ASSET-200",
				"location_id":29,
				"location_tag_id":460,
				"comment":null,
				"status":"Available",
				"assign_to":null,
				"is_unlisted":0,
				"company_id":6,
				"created_by":878,
				"updated_by":878,
				"created_at":"2018-08-30 06:04:03",
				"updated_at":"2018-08-30 06:04:03",
				"deleted_at":null,
				"asset_with_location":"ASSET-200 - Nashik",
				"manf_part_detail":{
					"manf_part_id":11,
					"manf_id":17,
					"manf_part_no":"873",
					"upc":873000000000,
					"full_name":"MP_ASSET_#1_C#1_M#1",
					"short_name":"MP_ASSET_#2_C#1_M#1",
					"class_id":13,
					"minimum_stock":null,
					"uom_id":null,
					"sales_markup":null,
					"company_id":6
				}
			},
			"locationAsset":null,
			"locationProduct":null,
			"locationMaterial":null
		},{
			"asset":{
				"asset_id":74,
				"po_id":null,
				"po_item_id":null,
				"receiving_slip_id":null,
				"manf_id":17,
				"manf_part_id":11,
				"serial_no":"9099999",
				"scan_code":"9099999",
				"short_tag":"ASSET-10001",
				"location_id":71,
				"location_tag_id":684,
				"comment":"aaaa",
				"status":"Available",
				"assign_to":null,
				"is_unlisted":0,
				"company_id":6,
				"created_by":878,
				"updated_by":878,
				"created_at":"2018-09-07 06:08:35",
				"updated_at":"2018-09-12 09:40:09",
				"deleted_at":null,
				"asset_with_location":"ASSET-10001 - VimanP",
				"manf_part_detail":{
					"manf_part_id":11,
					"manf_id":17,
					"manf_part_no":"873",
					"upc":873000000000,
					"full_name":"MP_ASSET_#1_C#1_M#1",
					"short_name":"MP_ASSET_#2_C#1_M#1",
					"class_id":13,
					"minimum_stock":null,
					"uom_id":null,
					"sales_markup":null,
					"company_id":6
				}
			},
			"locationAsset":[],
			"locationProduct":[],
			"locationMaterial":[]
		},{
			"asset":{
				"asset_id":84,
				"po_id":null,
				"po_item_id":null,
				"receiving_slip_id":null,
				"manf_id":17,
				"manf_part_id":11,
				"serial_no":"444444",
				"scan_code":"444444",
				"short_tag":"Asset Test",
				"location_id":71,
				"location_tag_id":684,
				"comment":"Test abcd",
				"status":"Available",
				"assign_to":null,
				"is_unlisted":0,
				"company_id":6,
				"created_by":878,
				"updated_by":878,
				"created_at":"2018-09-12 07:53:34",
				"updated_at":"2018-09-12 09:34:21",
				"deleted_at":null,
				"asset_with_location":"Asset Test - VimanP",
				"manf_part_detail":{
					"manf_part_id":11,
					"manf_id":17,
					"manf_part_no":"873",
					"upc":873000000000,
					"full_name":"MP_ASSET_#1_C#1_M#1",
					"short_name":"MP_ASSET_#2_C#1_M#1",
					"class_id":13,
					"minimum_stock":null,
					"uom_id":null,
					"sales_markup":null,
					"company_id":6
				}
			},
			"locationAsset":null,
			"locationProduct":null,
			"locationMaterial":null
		}],
        'tab': 'services'
    },{
    	'start_date' : '20/12/2018',
        'end_date' : '20/12/2018',
        'start_time' : '08:00',
        'end_time' : '10:00',
        'start_time_format' : 'am',
        'end_time_format' : 'am',
        'team': [{
			"id":881,
			"first_name":"Kunal",
			"last_name":"Kumar",
			"employee_id":"Kunakumar87",
			"username":"Kunakumar",
			"designation":null,
			"country_code":"+1",
			"mobile_no":null,
			"email_id":"nbhajbhuje+10@torinit.com",
			"work_phone":"8953323131",
			"title":"Manager",
			"permission_role_id":4,
			"wage_frequency":"Hourly",
			"wage_amount":12,
			"emergency_contact":null,
			"emergency_number":null,
			"relationship":null,
			"company_id":6,
			"role_id":3,
			"login_type":null,
			"additional_fields":"\"[]\"",
			"days_off":"[{\"friday\": 0, \"monday\": 0, \"sunday\": 1, \"tuesday\": 0, \"saturday\": 1, \"thursday\": 0, \"wednesday\": 0}]",
			"is_active":0,
			"is_locked":0,
			"is_deleted":0,
			"created_by":878,
			"updated_by":878,
			"created_at":"2018-08-07 11:43:40",
			"updated_at":"2018-08-07 11:43:40",
			"deleted_at":null,
			"role":{
				"role_id":3,
				"role_name":"Employee",
				"created_by":1,
				"updated_by":1,
				"created_at":"2017-11-08 11:06:46",
				"updated_at":"2018-06-07 06:54:34"
			}
		},{
			"id":883,
			"first_name":"Seema",
			"last_name":"Rao",
			"employee_id":null,
			"username":"Seemarao",
			"designation":null,
			"country_code":"+1",
			"mobile_no":null,
			"email_id":"nbhajbhuje+12@torinit.com",
			"work_phone":"7523323323",
			"title":"Accountant",
			"permission_role_id":null,
			"wage_frequency":"HOURLY",
			"wage_amount":11,
			"emergency_contact":null,
			"emergency_number":null,
			"relationship":null,
			"company_id":6,
			"role_id":4,
			"login_type":null,
			"additional_fields":"\"[]\"",
			"days_off":"[{\"friday\": 0, \"monday\": 0, \"sunday\": 1, \"tuesday\": 0, \"saturday\": 1, \"thursday\": 0, \"wednesday\": 0}]",
			"is_active":0,
			"is_locked":0,
			"is_deleted":0,
			"created_by":878,
			"updated_by":878,
			"created_at":"2018-08-07 11:46:43",
			"updated_at":"2018-08-07 11:46:43",
			"deleted_at":null,
			"role":{
				"role_id":4,
				"role_name":"Sub Contractor",
				"created_by":1,
				"updated_by":1,
				"created_at":"2017-11-08 11:06:46",
				"updated_at":"2018-06-07 06:55:52"
			}
		},{
			"id":941,
			"first_name":"Rakesh",
			"last_name":"Tiwari",
			"employee_id":null,
			"username":"rakesh@1234",
			"designation":null,
			"country_code":"+1",
			"mobile_no":null,
			"email_id":"rakesh11@email.com",
			"work_phone":"4555555555",
			"title":null,
			"permission_role_id":null,
			"wage_frequency":"HOURLY",
			"wage_amount":null,
			"emergency_contact":null,
			"emergency_number":null,
			"relationship":null,
			"company_id":6,
			"role_id":4,
			"login_type":null,
			"additional_fields":"\"[]\"",
			"days_off":"[{\"friday\": 0, \"monday\": 0, \"sunday\": 1, \"tuesday\": 0, \"saturday\": 0, \"thursday\": 0, \"wednesday\": 0}]",
			"is_active":0,
			"is_locked":0,
			"is_deleted":0,
			"created_by":878,
			"updated_by":878,
			"created_at":"2018-08-28 04:16:59",
			"updated_at":"2018-08-28 04:16:59",
			"deleted_at":null,
			"role":{
				"role_id":4,
				"role_name":"Sub Contractor",
				"created_by":1,
				"updated_by":1,
				"created_at":"2017-11-08 11:06:46",
				"updated_at":"2018-06-07 06:55:52"
			}
		},{
			"id":944,
			"first_name":"Rakesh",
			"last_name":"Tiwari",
			"employee_id":"E#001",
			"username":"r@123123",
			"designation":null,
			"country_code":"+1",
			"mobile_no":null,
			"email_id":"tttttt@mmm.clmmm",
			"work_phone":"7666666666",
			"title":null,
			"permission_role_id":4,
			"wage_frequency":"Hourly",
			"wage_amount":40000,
			"emergency_contact":null,
			"emergency_number":null,
			"relationship":null,
			"company_id":6,
			"role_id":3,
			"login_type":null,
			"additional_fields":"\"[{\\\"label\\\":\\\"L#1\\\",\\\"dataType\\\":\\\"Text\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"1\\\"},{\\\"label\\\":\\\"L#2\\\",\\\"dataType\\\":\\\"Number\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"2\\\"},{\\\"label\\\":\\\"L#3\\\",\\\"dataType\\\":\\\"Date\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"31\/08\/2018\\\"},{\\\"label\\\":\\\"L#4\\\",\\\"dataType\\\":\\\"Decimal\\\",\\\"optionalStatus\\\":\\\"True\\\",\\\"data\\\":\\\"4.6\\\"},{\\\"label\\\":\\\"L#5\\\",\\\"dataType\\\":\\\"Text\\\",\\\"optionalStatus\\\":\\\"True\\\",\\\"data\\\":\\\"5\\\"},{\\\"label\\\":\\\"L#6\\\",\\\"dataType\\\":\\\"Number\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"55\\\"},{\\\"label\\\":\\\"L#7\\\",\\\"dataType\\\":\\\"Date\\\",\\\"optionalStatus\\\":\\\"False\\\",\\\"data\\\":\\\"15\/08\/2018\\\"}]\"",
			"days_off":"[{\"friday\": 0, \"monday\": 0, \"sunday\": 1, \"tuesday\": 0, \"saturday\": 0, \"thursday\": 0, \"wednesday\": 0}]",
			"is_active":0,
			"is_locked":0,
			"is_deleted":0,
			"created_by":878,
			"updated_by":878,
			"created_at":"2018-08-28 07:46:23",
			"updated_at":"2018-08-31 10:24:41",
			"deleted_at":null,
			"role":{
				"role_id":3,
				"role_name":"Employee",
				"created_by":1,
				"updated_by":1,
				"created_at":"2017-11-08 11:06:46",
				"updated_at":"2018-06-07 06:54:34"
			}
		}],
        'asset': [{
			"asset":{
				"asset_id":4,
				"po_id":null,
				"po_item_id":null,
				"receiving_slip_id":null,
				"manf_id":17,
				"manf_part_id":11,
				"serial_no":"875000",
				"scan_code":"875000",
				"short_tag":"MA87500",
				"location_id":5,
				"location_tag_id":56,
				"comment":null,
				"status":"Available",
				"assign_to":null,
				"is_unlisted":0,
				"company_id":6,
				"created_by":878,
				"updated_by":878,
				"created_at":"2018-08-07 11:20:39",
				"updated_at":"2018-12-13 07:01:40",
				"deleted_at":null,
				"asset_with_location":"MA87500 - PP",
				"manf_part_detail":{
					"manf_part_id":11,
					"manf_id":17,
					"manf_part_no":"873",
					"upc":873000000000,
					"full_name":"MP_ASSET_#1_C#1_M#1",
					"short_name":"MP_ASSET_#2_C#1_M#1",
					"class_id":13,
					"minimum_stock":null,
					"uom_id":null,
					"sales_markup":null,
					"company_id":6
				}
			},
			"locationAsset":null,
			"locationProduct":null,
			"locationMaterial":null
		},{
			"asset":{
				"asset_id":53,
				"po_id":null,
				"po_item_id":null,
				"receiving_slip_id":null,
				"manf_id":17,
				"manf_part_id":11,
				"serial_no":"300000",
				"scan_code":"300000",
				"short_tag":"ASSET-200",
				"location_id":29,
				"location_tag_id":460,
				"comment":null,
				"status":"Available",
				"assign_to":null,
				"is_unlisted":0,
				"company_id":6,
				"created_by":878,
				"updated_by":878,
				"created_at":"2018-08-30 06:04:03",
				"updated_at":"2018-08-30 06:04:03",
				"deleted_at":null,
				"asset_with_location":"ASSET-200 - Nashik",
				"manf_part_detail":{
					"manf_part_id":11,
					"manf_id":17,
					"manf_part_no":"873",
					"upc":873000000000,
					"full_name":"MP_ASSET_#1_C#1_M#1",
					"short_name":"MP_ASSET_#2_C#1_M#1",
					"class_id":13,
					"minimum_stock":null,
					"uom_id":null,
					"sales_markup":null,
					"company_id":6
				}
			},
			"locationAsset":null,
			"locationProduct":null,
			"locationMaterial":null
		},{
			"asset":{
				"asset_id":74,
				"po_id":null,
				"po_item_id":null,
				"receiving_slip_id":null,
				"manf_id":17,
				"manf_part_id":11,
				"serial_no":"9099999",
				"scan_code":"9099999",
				"short_tag":"ASSET-10001",
				"location_id":71,
				"location_tag_id":684,
				"comment":"aaaa",
				"status":"Available",
				"assign_to":null,
				"is_unlisted":0,
				"company_id":6,
				"created_by":878,
				"updated_by":878,
				"created_at":"2018-09-07 06:08:35",
				"updated_at":"2018-09-12 09:40:09",
				"deleted_at":null,
				"asset_with_location":"ASSET-10001 - VimanP",
				"manf_part_detail":{
					"manf_part_id":11,
					"manf_id":17,
					"manf_part_no":"873",
					"upc":873000000000,
					"full_name":"MP_ASSET_#1_C#1_M#1",
					"short_name":"MP_ASSET_#2_C#1_M#1",
					"class_id":13,
					"minimum_stock":null,
					"uom_id":null,
					"sales_markup":null,
					"company_id":6
				}
			},
			"locationAsset":[],
			"locationProduct":[],
			"locationMaterial":[]
		},{
			"asset":{
				"asset_id":84,
				"po_id":null,
				"po_item_id":null,
				"receiving_slip_id":null,
				"manf_id":17,
				"manf_part_id":11,
				"serial_no":"444444",
				"scan_code":"444444",
				"short_tag":"Asset Test",
				"location_id":71,
				"location_tag_id":684,
				"comment":"Test abcd",
				"status":"Available",
				"assign_to":null,
				"is_unlisted":0,
				"company_id":6,
				"created_by":878,
				"updated_by":878,
				"created_at":"2018-09-12 07:53:34",
				"updated_at":"2018-09-12 09:34:21",
				"deleted_at":null,
				"asset_with_location":"Asset Test - VimanP",
				"manf_part_detail":{
					"manf_part_id":11,
					"manf_id":17,
					"manf_part_no":"873",
					"upc":873000000000,
					"full_name":"MP_ASSET_#1_C#1_M#1",
					"short_name":"MP_ASSET_#2_C#1_M#1",
					"class_id":13,
					"minimum_stock":null,
					"uom_id":null,
					"sales_markup":null,
					"company_id":6
				}
			},
			"locationAsset":null,
			"locationProduct":null,
			"locationMaterial":null
		}],
        'tab': 'services'
    }]


    TEMP_ROLE = [
        {
            "permission_level_id": 1,
            "menu": "Admin",
            "menu_slug": "admin",
            "second_level": [
                {
                    "permission_level_id": 7,
                    "parent_menu_id": 1,
                    "menu": "Nature Of Business",
                    "is_menu": 1,
                    "menu_slug": "nature-of-business",
                    "third_level": [
                        {
                            "permission_level_id": 8,
                            "parent_menu_id": 7,
                            "menu": "View Nature of Business",
                            "is_menu": 0,
                            "menu_slug": "view-nature-of-business"
                        },
                        {
                            "permission_level_id": 9,
                            "parent_menu_id": 7,
                            "menu": "Create Nature of Business",
                            "is_menu": 0,
                            "menu_slug": "create-nature-of-business"
                        },
                        {
                            "permission_level_id": 10,
                            "parent_menu_id": 7,
                            "menu": "Edit Nature of Business",
                            "is_menu": 0,
                            "menu_slug": "edit-nature-of-business"
                        },
                        {
                            "permission_level_id": 11,
                            "parent_menu_id": 7,
                            "menu": "Delete Nature of Business",
                            "is_menu": 0,
                            "menu_slug": "delete-nature-of-business"
                        }
                    ]
                },
                {
                    "permission_level_id": 12,
                    "parent_menu_id": 1,
                    "menu": "Locations",
                    "is_menu": 1,
                    "menu_slug": "locations",
                    "third_level": [
                        {
                            "permission_level_id": 13,
                            "parent_menu_id": 12,
                            "menu": "View Locations",
                            "is_menu": 0,
                            "menu_slug": "view-locations"
                        },
                        {
                            "permission_level_id": 14,
                            "parent_menu_id": 12,
                            "menu": "Create Locations",
                            "is_menu": 0,
                            "menu_slug": "create-locations"
                        },
                        {
                            "permission_level_id": 15,
                            "parent_menu_id": 12,
                            "menu": "Edit Locations",
                            "is_menu": 0,
                            "menu_slug": "edit-locations"
                        },
                        {
                            "permission_level_id": 16,
                            "parent_menu_id": 12,
                            "menu": "Delete Locations",
                            "is_menu": 0,
                            "menu_slug": "delete-locations"
                        },
                        {
                            "permission_level_id": 17,
                            "parent_menu_id": 12,
                            "menu": "Print Labels",
                            "is_menu": 0,
                            "menu_slug": "print-labels"
                        }
                    ]
                },
                {
                    "permission_level_id": 18,
                    "parent_menu_id": 1,
                    "menu": "Item Categories",
                    "is_menu": 1,
                    "menu_slug": "item-categories",
                    "third_level": [
                        {
                            "permission_level_id": 19,
                            "parent_menu_id": 18,
                            "menu": "View Item Category",
                            "is_menu": 0,
                            "menu_slug": "view-item-category"
                        },
                        {
                            "permission_level_id": 20,
                            "parent_menu_id": 18,
                            "menu": "Create Item Category",
                            "is_menu": 0,
                            "menu_slug": "create-item-category"
                        },
                        {
                            "permission_level_id": 21,
                            "parent_menu_id": 18,
                            "menu": "Edit Item Category",
                            "is_menu": 0,
                            "menu_slug": "edit-item-category"
                        },
                        {
                            "permission_level_id": 22,
                            "parent_menu_id": 18,
                            "menu": "Delete Item Category",
                            "is_menu": 0,
                            "menu_slug": "delete-item-category"
                        }
                    ]
                },
                {
                    "permission_level_id": 23,
                    "parent_menu_id": 1,
                    "menu": "Manufacturer",
                    "is_menu": 1,
                    "menu_slug": "manufacturer",
                    "third_level": [
                        {
                            "permission_level_id": 24,
                            "parent_menu_id": 23,
                            "menu": "View Manufacturer",
                            "is_menu": 0,
                            "menu_slug": "view-manufacturer"
                        },
                        {
                            "permission_level_id": 25,
                            "parent_menu_id": 23,
                            "menu": "Create Manufacturer",
                            "is_menu": 0,
                            "menu_slug": "create-manufacturer"
                        },
                        {
                            "permission_level_id": 26,
                            "parent_menu_id": 23,
                            "menu": "Edit Manufacturer",
                            "is_menu": 0,
                            "menu_slug": "edit-manufacturer"
                        },
                        {
                            "permission_level_id": 27,
                            "parent_menu_id": 23,
                            "menu": "Delete Manufacturer",
                            "is_menu": 0,
                            "menu_slug": "delete-manufacturer"
                        }
                    ]
                },
                {
                    "permission_level_id": 28,
                    "parent_menu_id": 1,
                    "menu": "Item Definition",
                    "is_menu": 1,
                    "menu_slug": "item-definition",
                    "third_level": [
                        {
                            "permission_level_id": 29,
                            "parent_menu_id": 28,
                            "menu": "View Item Definition",
                            "is_menu": 0,
                            "menu_slug": "view-item-definition"
                        },
                        {
                            "permission_level_id": 30,
                            "parent_menu_id": 28,
                            "menu": "Create Item Definition",
                            "is_menu": 0,
                            "menu_slug": "create-item-definition"
                        },
                        {
                            "permission_level_id": 31,
                            "parent_menu_id": 28,
                            "menu": "Edit Item Definition Details",
                            "is_menu": 0,
                            "menu_slug": "edit-item-definition-details"
                        },
                        {
                            "permission_level_id": 32,
                            "parent_menu_id": 28,
                            "menu": "Edit Item Definition Attributes",
                            "is_menu": 0,
                            "menu_slug": "edit-item-definition-attributes"
                        },
                        {
                            "permission_level_id": 33,
                            "parent_menu_id": 28,
                            "menu": "Edit Item Definition Images",
                            "is_menu": 0,
                            "menu_slug": "edit-item-definition-images"
                        },
                        {
                            "permission_level_id": 34,
                            "parent_menu_id": 28,
                            "menu": "Edit Item Definition Documents",
                            "is_menu": 0,
                            "menu_slug": "edit-item-definition-documents"
                        },
                        {
                            "permission_level_id": 35,
                            "parent_menu_id": 28,
                            "menu": "Delete Item Definition Attributes",
                            "is_menu": 0,
                            "menu_slug": "delete-item-definition-attributes"
                        },
                        {
                            "permission_level_id": 36,
                            "parent_menu_id": 28,
                            "menu": "Delete Item Definition Images",
                            "is_menu": 0,
                            "menu_slug": "delete-item-definition-images"
                        },
                        {
                            "permission_level_id": 37,
                            "parent_menu_id": 28,
                            "menu": "Delete Item Definition Documents",
                            "is_menu": 0,
                            "menu_slug": "delete-item-definition-documents"
                        }
                    ]
                },
                {
                    "permission_level_id": 38,
                    "parent_menu_id": 1,
                    "menu": "Suppliers",
                    "is_menu": 1,
                    "menu_slug": "suppliers",
                    "third_level": [
                        {
                            "permission_level_id": 39,
                            "parent_menu_id": 38,
                            "menu": "View Supplier",
                            "is_menu": 0,
                            "menu_slug": "view-supplier"
                        },
                        {
                            "permission_level_id": 40,
                            "parent_menu_id": 38,
                            "menu": "View Supplier Documents",
                            "is_menu": 0,
                            "menu_slug": "view-supplier-documents"
                        },
                        {
                            "permission_level_id": 41,
                            "parent_menu_id": 38,
                            "menu": "Create Supplier",
                            "is_menu": 0,
                            "menu_slug": "create-supplier"
                        },
                        {
                            "permission_level_id": 42,
                            "parent_menu_id": 38,
                            "menu": "Edit Supplier Details",
                            "is_menu": 0,
                            "menu_slug": "edit-supplier-details"
                        },
                        {
                            "permission_level_id": 43,
                            "parent_menu_id": 38,
                            "menu": "Delete Supplier",
                            "is_menu": 0,
                            "menu_slug": "delete-supplier"
                        }
                    ]
                },
                {
                    "permission_level_id": 44,
                    "parent_menu_id": 1,
                    "menu": "Permissions",
                    "is_menu": 1,
                    "menu_slug": "permissions",
                    "third_level": [
                        {
                            "permission_level_id": 45,
                            "parent_menu_id": 44,
                            "menu": "View Permission Role",
                            "is_menu": 0,
                            "menu_slug": "view-permission-role"
                        },
                        {
                            "permission_level_id": 46,
                            "parent_menu_id": 44,
                            "menu": "Create Permission Role",
                            "is_menu": 0,
                            "menu_slug": "create-permission-role"
                        },
                        {
                            "permission_level_id": 47,
                            "parent_menu_id": 44,
                            "menu": "Edit Permission Role",
                            "is_menu": 0,
                            "menu_slug": "edit-permission-role"
                        }
                    ]
                },
                {
                    "permission_level_id": 48,
                    "parent_menu_id": 1,
                    "menu": "Labels",
                    "is_menu": 1,
                    "menu_slug": "labels",
                    "third_level": [
                        {
                            "permission_level_id": 49,
                            "parent_menu_id": 48,
                            "menu": "View Labels",
                            "is_menu": 0,
                            "menu_slug": "view-labels"
                        },
                        {
                            "permission_level_id": 50,
                            "parent_menu_id": 48,
                            "menu": "Print/Export Labels",
                            "is_menu": 0,
                            "menu_slug": "printexport-labels"
                        }
                    ]
                }
            ]
        },
        {
            "permission_level_id": 2,
            "menu": "Inventory",
            "menu_slug": "inventory",
            "second_level": [
                {
                    "permission_level_id": 51,
                    "parent_menu_id": 2,
                    "menu": "Products",
                    "is_menu": 1,
                    "menu_slug": "products",
                    "third_level": [
                        {
                            "permission_level_id": 52,
                            "parent_menu_id": 51,
                            "menu": "View Products",
                            "is_menu": 0,
                            "menu_slug": "view-products"
                        },
                        {
                            "permission_level_id": 53,
                            "parent_menu_id": 51,
                            "menu": "Export Products",
                            "is_menu": 0,
                            "menu_slug": "export-products"
                        },
                        {
                            "permission_level_id": 54,
                            "parent_menu_id": 51,
                            "menu": "Create Products",
                            "is_menu": 0,
                            "menu_slug": "create-products"
                        },
                        {
                            "permission_level_id": 55,
                            "parent_menu_id": 51,
                            "menu": "Create Products From P/O",
                            "is_menu": 0,
                            "menu_slug": "create-products-from-po"
                        },
                        {
                            "permission_level_id": 56,
                            "parent_menu_id": 51,
                            "menu": "Edit Products Details",
                            "is_menu": 0,
                            "menu_slug": "edit-products-details"
                        },
                        {
                            "permission_level_id": 57,
                            "parent_menu_id": 51,
                            "menu": "Edit Products Locations",
                            "is_menu": 0,
                            "menu_slug": "edit-products-locations"
                        },
                        {
                            "permission_level_id": 58,
                            "parent_menu_id": 51,
                            "menu": "Edit Products Documents",
                            "is_menu": 0,
                            "menu_slug": "edit-products-documents"
                        },
                        {
                            "permission_level_id": 59,
                            "parent_menu_id": 51,
                            "menu": "Delete Products Documents",
                            "is_menu": 0,
                            "menu_slug": "delete-products-documents"
                        },
                        {
                            "permission_level_id": 60,
                            "parent_menu_id": 51,
                            "menu": "Delete Products",
                            "is_menu": 0,
                            "menu_slug": "delete-products"
                        }
                    ]
                },
                {
                    "permission_level_id": 61,
                    "parent_menu_id": 2,
                    "menu": "Assets",
                    "is_menu": 1,
                    "menu_slug": "assets",
                    "third_level": [
                        {
                            "permission_level_id": 62,
                            "parent_menu_id": 61,
                            "menu": "View Assets",
                            "is_menu": 0,
                            "menu_slug": "view-assets"
                        },
                        {
                            "permission_level_id": 63,
                            "parent_menu_id": 61,
                            "menu": "Export Assets",
                            "is_menu": 0,
                            "menu_slug": "export-assets"
                        },
                        {
                            "permission_level_id": 64,
                            "parent_menu_id": 61,
                            "menu": "Create Assets",
                            "is_menu": 0,
                            "menu_slug": "create-assets"
                        },
                        {
                            "permission_level_id": 65,
                            "parent_menu_id": 61,
                            "menu": "Create Assets From P/O",
                            "is_menu": 0,
                            "menu_slug": "create-assets-from-po"
                        },
                        {
                            "permission_level_id": 66,
                            "parent_menu_id": 61,
                            "menu": "Edit Assets Details",
                            "is_menu": 0,
                            "menu_slug": "edit-assets-details"
                        },
                        {
                            "permission_level_id": 67,
                            "parent_menu_id": 61,
                            "menu": "Edit Assets Locations",
                            "is_menu": 0,
                            "menu_slug": "edit-assets-locations"
                        },
                        {
                            "permission_level_id": 68,
                            "parent_menu_id": 61,
                            "menu": "Edit Assets Documents",
                            "is_menu": 0,
                            "menu_slug": "edit-assets-documents"
                        },
                        {
                            "permission_level_id": 69,
                            "parent_menu_id": 61,
                            "menu": "Delete Assets Documents",
                            "is_menu": 0,
                            "menu_slug": "delete-assets-documents"
                        },
                        {
                            "permission_level_id": 70,
                            "parent_menu_id": 61,
                            "menu": "Delete Assets",
                            "is_menu": 0,
                            "menu_slug": "delete-assets"
                        }
                    ]
                },
                {
                    "permission_level_id": 71,
                    "parent_menu_id": 2,
                    "menu": "Tracker",
                    "is_menu": 1,
                    "menu_slug": "tracker",
                    "third_level": [
                        {
                            "permission_level_id": 72,
                            "parent_menu_id": 71,
                            "menu": "View Tracker",
                            "is_menu": 0,
                            "menu_slug": "view-tracker"
                        },
                        {
                            "permission_level_id": 73,
                            "parent_menu_id": 71,
                            "menu": "View Inventory",
                            "is_menu": 0,
                            "menu_slug": "view-inventory"
                        },
                        {
                            "permission_level_id": 74,
                            "parent_menu_id": 71,
                            "menu": "Create Purchase Order",
                            "is_menu": 0,
                            "menu_slug": "create-purchase-order"
                        }
                    ]
                },
                {
                    "permission_level_id": 75,
                    "parent_menu_id": 2,
                    "menu": "Materials",
                    "is_menu": 1,
                    "menu_slug": "materials",
                    "third_level": [
                        {
                            "permission_level_id": 76,
                            "parent_menu_id": 75,
                            "menu": "View Materials",
                            "is_menu": 0,
                            "menu_slug": "view-materials"
                        },
                        {
                            "permission_level_id": 77,
                            "parent_menu_id": 75,
                            "menu": "Export Materials",
                            "is_menu": 0,
                            "menu_slug": "export-materials"
                        },
                        {
                            "permission_level_id": 78,
                            "parent_menu_id": 75,
                            "menu": "Create Materials",
                            "is_menu": 0,
                            "menu_slug": "create-materials"
                        },
                        {
                            "permission_level_id": 79,
                            "parent_menu_id": 75,
                            "menu": "Create Materials From P/O",
                            "is_menu": 0,
                            "menu_slug": "create-materials-from-po"
                        },
                        {
                            "permission_level_id": 80,
                            "parent_menu_id": 75,
                            "menu": "Edit Materials Details",
                            "is_menu": 0,
                            "menu_slug": "edit-materials-details"
                        },
                        {
                            "permission_level_id": 81,
                            "parent_menu_id": 75,
                            "menu": "Edit Materials Locations",
                            "is_menu": 0,
                            "menu_slug": "edit-materials-locations"
                        },
                        {
                            "permission_level_id": 82,
                            "parent_menu_id": 75,
                            "menu": "Edit Materials Documents",
                            "is_menu": 0,
                            "menu_slug": "edit-materials-documents"
                        },
                        {
                            "permission_level_id": 83,
                            "parent_menu_id": 75,
                            "menu": "Delete Materials Documents",
                            "is_menu": 0,
                            "menu_slug": "delete-materials-documents"
                        },
                        {
                            "permission_level_id": 84,
                            "parent_menu_id": 75,
                            "menu": "Delete Materials",
                            "is_menu": 0,
                            "menu_slug": "delete-materials"
                        }
                    ]
                },
                {
                    "permission_level_id": 85,
                    "parent_menu_id": 2,
                    "menu": "Maintenance",
                    "is_menu": 1,
                    "menu_slug": "maintenance",
                    "third_level": [
                        {
                            "permission_level_id": 86,
                            "parent_menu_id": 85,
                            "menu": "View Maintenance",
                            "is_menu": 0,
                            "menu_slug": "view-maintenance"
                        },
                        {
                            "permission_level_id": 87,
                            "parent_menu_id": 85,
                            "menu": "Create Maintenance",
                            "is_menu": 0,
                            "menu_slug": "create-maintenance"
                        },
                        {
                            "permission_level_id": 88,
                            "parent_menu_id": 85,
                            "menu": "Edit Maintenance",
                            "is_menu": 0,
                            "menu_slug": "edit-maintenance"
                        },
                        {
                            "permission_level_id": 89,
                            "parent_menu_id": 85,
                            "menu": "Create W/O",
                            "is_menu": 0,
                            "menu_slug": "create-wo"
                        },
                        {
                            "permission_level_id": 90,
                            "parent_menu_id": 85,
                            "menu": "Remove Item",
                            "is_menu": 0,
                            "menu_slug": "remove-item"
                        },
                        {
                            "permission_level_id": 91,
                            "parent_menu_id": 85,
                            "menu": "Dispose Item",
                            "is_menu": 0,
                            "menu_slug": "dispose-item"
                        }
                    ]
                },
                {
                    "permission_level_id": 92,
                    "parent_menu_id": 2,
                    "menu": "Purchase Order",
                    "is_menu": 1,
                    "menu_slug": "purchase-order",
                    "third_level": [
                        {
                            "permission_level_id": 93,
                            "parent_menu_id": 92,
                            "menu": "View Purchase Order",
                            "is_menu": 0,
                            "menu_slug": "view-purchase-order"
                        },
                        {
                            "permission_level_id": 94,
                            "parent_menu_id": 92,
                            "menu": "Create Purchase Order",
                            "is_menu": 0,
                            "menu_slug": "create-purchase-order"
                        },
                        {
                            "permission_level_id": 95,
                            "parent_menu_id": 92,
                            "menu": "Create Receiving Slips",
                            "is_menu": 0,
                            "menu_slug": "create-receiving-slips"
                        },
                        {
                            "permission_level_id": 96,
                            "parent_menu_id": 92,
                            "menu": "Cancel Purchase Order",
                            "is_menu": 0,
                            "menu_slug": "cancel-purchase-order"
                        }
                    ]
                },
                {
                    "permission_level_id": 97,
                    "parent_menu_id": 2,
                    "menu": "Receiving Slips",
                    "is_menu": 1,
                    "menu_slug": "receiving-slips",
                    "third_level": [
                        {
                            "permission_level_id": 98,
                            "parent_menu_id": 97,
                            "menu": "View Receiving Slips",
                            "is_menu": 0,
                            "menu_slug": "view-receiving-slips"
                        },
                        {
                            "permission_level_id": 99,
                            "parent_menu_id": 97,
                            "menu": "Create Receiving Slips",
                            "is_menu": 0,
                            "menu_slug": "create-receiving-slips"
                        }
                    ]
                },
                {
                    "permission_level_id": 100,
                    "parent_menu_id": 2,
                    "menu": "Audit",
                    "is_menu": 1,
                    "menu_slug": "audit",
                    "third_level": [
                        {
                            "permission_level_id": 101,
                            "parent_menu_id": 100,
                            "menu": "View Audit",
                            "is_menu": 0,
                            "menu_slug": "view-audit"
                        },
                        {
                            "permission_level_id": 102,
                            "parent_menu_id": 100,
                            "menu": "View Audit Reports",
                            "is_menu": 0,
                            "menu_slug": "view-audit-reports"
                        },
                        {
                            "permission_level_id": 103,
                            "parent_menu_id": 100,
                            "menu": "Accept Discrepancies",
                            "is_menu": 0,
                            "menu_slug": "accept-discrepancies"
                        },
                        {
                            "permission_level_id": 104,
                            "parent_menu_id": 100,
                            "menu": "Create Audit",
                            "is_menu": 0,
                            "menu_slug": "create-audit"
                        },
                        {
                            "permission_level_id": 105,
                            "parent_menu_id": 100,
                            "menu": "Export Report",
                            "is_menu": 0,
                            "menu_slug": "export-report"
                        }
                    ]
                }
            ]
        },
        {
            "permission_level_id": 3,
            "menu": "Workflow",
            "menu_slug": "workflow",
            "second_level": [
                {
                    "permission_level_id": 106,
                    "parent_menu_id": 3,
                    "menu": "Project Estimator",
                    "is_menu": 1,
                    "menu_slug": "project-estimator",
                    "third_level": [
                        {
                            "permission_level_id": 107,
                            "parent_menu_id": 106,
                            "menu": "View Project Estimates",
                            "is_menu": 0,
                            "menu_slug": "view-project-estimates"
                        },
                        {
                            "permission_level_id": 108,
                            "parent_menu_id": 106,
                            "menu": "View Project Estimates Versions",
                            "is_menu": 0,
                            "menu_slug": "view-project-estimates-versions"
                        },
                        {
                            "permission_level_id": 109,
                            "parent_menu_id": 106,
                            "menu": "Create Project Estimates",
                            "is_menu": 0,
                            "menu_slug": "create-project-estimates"
                        },
                        {
                            "permission_level_id": 110,
                            "parent_menu_id": 106,
                            "menu": "Edit Project Estimate",
                            "is_menu": 0,
                            "menu_slug": "edit-project-estimate"
                        },
                        {
                            "permission_level_id": 111,
                            "parent_menu_id": 106,
                            "menu": "Approve Project Estimate",
                            "is_menu": 0,
                            "menu_slug": "approve-project-estimate"
                        },
                        {
                            "permission_level_id": 112,
                            "parent_menu_id": 106,
                            "menu": "Send Quote ",
                            "is_menu": 0,
                            "menu_slug": "send-quote"
                        },
                        {
                            "permission_level_id": 113,
                            "parent_menu_id": 106,
                            "menu": "Delete Project Estimate",
                            "is_menu": 0,
                            "menu_slug": "delete-project-estimate"
                        }
                    ]
                },
                {
                    "permission_level_id": 114,
                    "parent_menu_id": 3,
                    "menu": "Work Orders",
                    "is_menu": 1,
                    "menu_slug": "work-orders",
                    "third_level": [
                        {
                            "permission_level_id": 115,
                            "parent_menu_id": 114,
                            "menu": "View Work Orders",
                            "is_menu": 0,
                            "menu_slug": "view-work-orders"
                        },
                        {
                            "permission_level_id": 116,
                            "parent_menu_id": 114,
                            "menu": "Create Work Orders",
                            "is_menu": 0,
                            "menu_slug": "create-work-orders"
                        },
                        {
                            "permission_level_id": 117,
                            "parent_menu_id": 114,
                            "menu": "Edit Work Orders",
                            "is_menu": 0,
                            "menu_slug": "edit-work-orders"
                        }
                    ]
                },
                {
                    "permission_level_id": 118,
                    "parent_menu_id": 3,
                    "menu": "Scheduling",
                    "is_menu": 1,
                    "menu_slug": "scheduling",
                    "third_level": [
                        {
                            "permission_level_id": 119,
                            "parent_menu_id": 118,
                            "menu": "View Scheduling",
                            "is_menu": 0,
                            "menu_slug": "view-scheduling"
                        },
                        {
                            "permission_level_id": 120,
                            "parent_menu_id": 118,
                            "menu": "Create Scheduling",
                            "is_menu": 0,
                            "menu_slug": "create-scheduling"
                        },
                        {
                            "permission_level_id": 121,
                            "parent_menu_id": 118,
                            "menu": "Edit Scheduling",
                            "is_menu": 0,
                            "menu_slug": "edit-scheduling"
                        }
                    ]
                }
            ]
        },
        {
            "permission_level_id": 4,
            "menu": "CRM",
            "menu_slug": "crm",
            "second_level": [
                {
                    "permission_level_id": 122,
                    "parent_menu_id": 4,
                    "menu": "View Clients",
                    "is_menu": 1,
                    "menu_slug": "view-clients",
                    "third_level": []
                },
                {
                    "permission_level_id": 123,
                    "parent_menu_id": 4,
                    "menu": "Create Clients",
                    "is_menu": 1,
                    "menu_slug": "create-clients",
                    "third_level": []
                },
                {
                    "permission_level_id": 124,
                    "parent_menu_id": 4,
                    "menu": "Create/Delete Fields",
                    "is_menu": 1,
                    "menu_slug": "createdelete-fields",
                    "third_level": []
                },
                {
                    "permission_level_id": 125,
                    "parent_menu_id": 4,
                    "menu": "Create Referral Type",
                    "is_menu": 1,
                    "menu_slug": "create-referral-type",
                    "third_level": []
                }
            ]
        },
        {
            "permission_level_id": 5,
            "menu": "HR",
            "menu_slug": "hr",
            "second_level": [
                {
                    "permission_level_id": 126,
                    "parent_menu_id": 5,
                    "menu": "Employee",
                    "is_menu": 1,
                    "menu_slug": "employee",
                    "third_level": [
                        {
                            "permission_level_id": 127,
                            "parent_menu_id": 126,
                            "menu": "View Employee",
                            "is_menu": 0,
                            "menu_slug": "view-employee"
                        },
                        {
                            "permission_level_id": 128,
                            "parent_menu_id": 126,
                            "menu": "View Employee Documents",
                            "is_menu": 0,
                            "menu_slug": "view-employee-documents"
                        },
                        {
                            "permission_level_id": 129,
                            "parent_menu_id": 126,
                            "menu": "Create Employee",
                            "is_menu": 0,
                            "menu_slug": "create-employee"
                        },
                        {
                            "permission_level_id": 130,
                            "parent_menu_id": 126,
                            "menu": "Export Employee",
                            "is_menu": 0,
                            "menu_slug": "export-employee"
                        },
                        {
                            "permission_level_id": 131,
                            "parent_menu_id": 126,
                            "menu": "Create/Delete Field",
                            "is_menu": 0,
                            "menu_slug": "createdelete-field"
                        },
                        {
                            "permission_level_id": 132,
                            "parent_menu_id": 126,
                            "menu": "Edit Employee",
                            "is_menu": 0,
                            "menu_slug": "edit-employee"
                        },
                        {
                            "permission_level_id": 133,
                            "parent_menu_id": 126,
                            "menu": "Delete Employee",
                            "is_menu": 0,
                            "menu_slug": "delete-employee"
                        },
                        {
                            "permission_level_id": 134,
                            "parent_menu_id": 126,
                            "menu": "Reset Password",
                            "is_menu": 0,
                            "menu_slug": "reset-password"
                        }
                    ]
                },
                {
                    "permission_level_id": 135,
                    "parent_menu_id": 5,
                    "menu": "Sub-Contractor",
                    "is_menu": 1,
                    "menu_slug": "sub-contractor",
                    "third_level": [
                        {
                            "permission_level_id": 136,
                            "parent_menu_id": 135,
                            "menu": "View Sub-Contractor",
                            "is_menu": 0,
                            "menu_slug": "view-sub-contractor"
                        },
                        {
                            "permission_level_id": 137,
                            "parent_menu_id": 135,
                            "menu": "View Sub-Contractor Documents",
                            "is_menu": 0,
                            "menu_slug": "view-sub-contractor-documents"
                        },
                        {
                            "permission_level_id": 138,
                            "parent_menu_id": 135,
                            "menu": "Create Sub-Contractor",
                            "is_menu": 0,
                            "menu_slug": "create-sub-contractor"
                        },
                        {
                            "permission_level_id": 139,
                            "parent_menu_id": 135,
                            "menu": "Export Sub-Contractor",
                            "is_menu": 0,
                            "menu_slug": "export-sub-contractor"
                        },
                        {
                            "permission_level_id": 140,
                            "parent_menu_id": 135,
                            "menu": "Create/Delete Field",
                            "is_menu": 0,
                            "menu_slug": "createdelete-field"
                        },
                        {
                            "permission_level_id": 141,
                            "parent_menu_id": 135,
                            "menu": "Edit Sub-Contractor",
                            "is_menu": 0,
                            "menu_slug": "edit-sub-contractor"
                        },
                        {
                            "permission_level_id": 142,
                            "parent_menu_id": 135,
                            "menu": "Delete Sub-Contractor",
                            "is_menu": 0,
                            "menu_slug": "delete-sub-contractor"
                        }
                    ]
                },
                {
                    "permission_level_id": 143,
                    "parent_menu_id": 5,
                    "menu": "Timesheet",
                    "is_menu": 1,
                    "menu_slug": "timesheet",
                    "third_level": [
                        {
                            "permission_level_id": 144,
                            "parent_menu_id": 143,
                            "menu": "View Timesheet",
                            "is_menu": 0,
                            "menu_slug": "view-timesheet"
                        },
                        {
                            "permission_level_id": 145,
                            "parent_menu_id": 143,
                            "menu": "Export Timesheet",
                            "is_menu": 0,
                            "menu_slug": "export-timesheet"
                        },
                        {
                            "permission_level_id": 146,
                            "parent_menu_id": 143,
                            "menu": "View Employee",
                            "is_menu": 0,
                            "menu_slug": "view-employee"
                        }
                    ]
                }
            ]
        },
        {
            "permission_level_id": 6,
            "menu": "Financials",
            "menu_slug": "financials",
            "second_level": [
                {
                    "permission_level_id": 147,
                    "parent_menu_id": 6,
                    "menu": "Receivables",
                    "is_menu": 1,
                    "menu_slug": "receivables",
                    "third_level": [
                        {
                            "permission_level_id": 148,
                            "parent_menu_id": 147,
                            "menu": "View Receivables",
                            "is_menu": 0,
                            "menu_slug": "view-receivables"
                        },
                        {
                            "permission_level_id": 149,
                            "parent_menu_id": 147,
                            "menu": "Export Receivables",
                            "is_menu": 0,
                            "menu_slug": "export-receivables"
                        },
                        {
                            "permission_level_id": 150,
                            "parent_menu_id": 147,
                            "menu": "Record Payments",
                            "is_menu": 0,
                            "menu_slug": "record-payments"
                        }
                    ]
                },
                {
                    "permission_level_id": 151,
                    "parent_menu_id": 6,
                    "menu": "Payables",
                    "is_menu": 1,
                    "menu_slug": "payables",
                    "third_level": [
                        {
                            "permission_level_id": 152,
                            "parent_menu_id": 151,
                            "menu": "View Payables",
                            "is_menu": 0,
                            "menu_slug": "view-payables"
                        },
                        {
                            "permission_level_id": 153,
                            "parent_menu_id": 151,
                            "menu": "Export Payables",
                            "is_menu": 0,
                            "menu_slug": "export-payables"
                        },
                        {
                            "permission_level_id": 154,
                            "parent_menu_id": 151,
                            "menu": "Edit Payables",
                            "is_menu": 0,
                            "menu_slug": "edit-payables"
                        }
                    ]
                },
                {
                    "permission_level_id": 155,
                    "parent_menu_id": 6,
                    "menu": "Invoice",
                    "is_menu": 1,
                    "menu_slug": "invoice",
                    "third_level": [
                        {
                            "permission_level_id": 156,
                            "parent_menu_id": 155,
                            "menu": "View Invoice",
                            "is_menu": 0,
                            "menu_slug": "view-invoice"
                        },
                        {
                            "permission_level_id": 157,
                            "parent_menu_id": 155,
                            "menu": "Send Invoice",
                            "is_menu": 0,
                            "menu_slug": "send-invoice"
                        },
                        {
                            "permission_level_id": 158,
                            "parent_menu_id": 155,
                            "menu": "Record Payment",
                            "is_menu": 0,
                            "menu_slug": "record-payment"
                        }
                    ]
                },
                {
                    "permission_level_id": 159,
                    "parent_menu_id": 6,
                    "menu": "Create Invoice",
                    "is_menu": 1,
                    "menu_slug": "create-invoice",
                    "third_level": [
                        {
                            "permission_level_id": 160,
                            "parent_menu_id": 159,
                            "menu": "View Quotation list",
                            "is_menu": 0,
                            "menu_slug": "view-quotation-list"
                        },
                        {
                            "permission_level_id": 161,
                            "parent_menu_id": 159,
                            "menu": "Create Invoice",
                            "is_menu": 0,
                            "menu_slug": "create-invoice"
                        },
                        {
                            "permission_level_id": 162,
                            "parent_menu_id": 159,
                            "menu": "Review Quotation",
                            "is_menu": 0,
                            "menu_slug": "review-quotation"
                        }
                    ]
                },
                {
                    "permission_level_id": 163,
                    "parent_menu_id": 6,
                    "menu": "Ledger",
                    "is_menu": 1,
                    "menu_slug": "ledger",
                    "third_level": [
                        {
                            "permission_level_id": 164,
                            "parent_menu_id": 163,
                            "menu": "View Ledger",
                            "is_menu": 0,
                            "menu_slug": "view-ledger"
                        }
                    ]
                }
            ]
        }
    ]
}
