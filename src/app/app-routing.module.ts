import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthService } from "./auth/auth.service";
import { AuthGuardService as AuthGuard } from "./auth/auth-guard.service";
import { RoleGuardService as RoleGuard } from "./auth/role-guard.service";

import { AppComponent } from "./app.component";
import {
  LoginComponent,
  ClientLoginComponent
} from "./auth/login/login.component";
import {
  ForgotCredentialStepOneComponent,
  ForgotCredentialStepTwoComponent,
  ResetCredentialStepTwoComponent,
  ForgotCredentialStepThreeComponent
} from "./auth/forgot-credential/forgot-credential.component";
import {
  SetPasswordStepOneComponent,
  SetPasswordStepTwoComponent
} from "./auth/set-password/set-password.component";
import { CSALandingComponent } from "./component/dashboard/company-super-admin/landing.component";
import { CompanyUsersDashboardComponent } from "./component/dashboard/company-users/dashboard.component";
import { CompanyUsersLandingComponent } from "./component/dashboard/company-users/landing.component";
import {
  AddUserComponent,
  AddUserWithSocialIDComponent
} from "./component/user-registration/user-registration.component";
import { CSAOnboardingComponent } from "./component/onboarding/dashboard/landing.component";
import {
  RedirectionComponent,
  MaintenanceComponent
} from "./shared/module/redirection/redirection.component";

import { E404Component } from "./component/error-pages/e404/e404.component";
import { DialogComponent } from "./shared/model/dialog/dialog.component";

//Onboarding Components
import { CSAOnboardingDashboardComponent } from "./component/onboarding/dashboard/dashboard.component";
import {
  OnboardingGuideComponent,
  OnboardingGuideDialogComponent
} from "./component/onboarding/onboarding-guide/onboarding-guide.component";
import { EmpFieldsComponent } from "./component/onboarding/onboarding-guide/emp-fields/emp-fields.component";
import { AccountDetailsComponent } from "./component/onboarding/account-details/account-details.component";
import { SettingsComponent ,SettingsDialog  } from "./component/onboarding/settings/settings.component";
import {
  EditAccountComponent,
  EditAccountDialog
} from "./component/onboarding/account-details/edit-account/edit-account.component";
import { CsvPreviewComponent } from "./component/csv/csv-preview/csv-preview.component";

//CRM Components
import { AddClientComponent } from "./component/crm/client/add-client/add-client.component";
import { ClientListComponent } from "./component/crm/client/client-list/client-list.component";
import { ClientAddressComponent } from "./component/crm/client/client-list/client-address/client-address.component";
import { ClientContactComponent } from "./component/crm/client/client-list/client-contact/client-contact.component";
import { ClientReviewComponent } from "./component/crm/client/client-review/client-review.component";
import { ClientDialog } from "./component/crm/client/client-dialog.component";

// NEW CRM Components
import { NewClientListComponent } from "./component/new-crm/new-client/client-list/client-list.component";
import { NewClientDialog } from "./component/new-crm/new-client/client-dialog.component";
import { NewAddClientComponent } from "./component/new-crm/new-client/add-client/add-client.component";
import { NewClientReviewComponent } from "./component/new-crm/new-client/client-review/client-review.component";

// Accounting Components
import { PayablesComponent } from "./component/accounting/payables/payables.component";
import { ReceivablesComponent } from "./component/accounting/receivables/receivables.component";
import { InvoiceListComponent } from "./component/accounting/invoice/invoice-list/invoice-list.component";
import { NewInvoiceComponent } from "./component/accounting/invoice/new-invoice/new-invoice.component";
import { LedgerListComponent } from "./component/accounting/ledger/ledger-list/ledger-list.component";
import { CreateInvoiceComponent } from "./component/accounting/invoice/create-invoice/create-invoice.component";
import { ReviewInvoiceComponent } from "./component/accounting/invoice/review-invoice/review-invoice.component";
import { AccountingDialog } from "./component/accounting/accounting-dialog.component";
import { InvoiceQuotationReviewComponent } from "./component/accounting/invoice/invoice-quotation-review/invoice-quotation-review.component";

//Dashboard(Reports) Components
import { CSAReportsComponent } from "./component/dashboard/company-super-admin/reports/reports.component";
import { SummaryComponent } from "./component/dashboard/company-super-admin/summary/summary.component";
import { OldSummaryComponent } from "./component/dashboard/company-super-admin/summary-old/summary.component";
import { RepairesComponent } from "./component/dashboard/company-super-admin/reports/repaires/repaires.component";
import { WorkflowComponent } from "./component/dashboard/company-super-admin/reports/workflow/workflow.component";
import { HrComponent } from "./component/dashboard/company-super-admin/reports/hr/hr.component";
import { SalesComponent } from "./component/dashboard/company-super-admin/reports/sales/sales.component";
import { FinancialsComponent } from "./component/dashboard/company-super-admin/reports/financials/financials.component";
import { AssetsComponent } from "./component/dashboard/company-super-admin/reports/assets/assets.component";

//Hr Components
import { EmployeeDialog } from "./component/hr/employee/employee-dialog.component";
import { EmployeeListComponent } from "./component/hr/employee/employee-list/employee-list.component";
import { NewEmployeeComponent } from "./component/hr/employee/new-employee/new-employee.component";
import { EmployeeReviewComponent } from "./component/hr/employee/employee-review/employee-review.component";
import { SubContractorListComponent } from "./component/hr/sub-contractor/sub-contractor-list/sub-contractor-list.component";
import { AddSubContractorComponent } from "./component/hr/sub-contractor/add-sub-contractor/add-sub-contractor.component";
import { SubContractorReviewComponent } from "./component/hr/sub-contractor/sub-contractor-review/sub-contractor-review.component";
import { TimesheetListComponent } from "./component/hr/timesheet/timesheet-list/timesheet-list.component";

//Admin Components
import { PrintLabelComponent } from "./component/admin/print-label/print-label.component";
import { AddLocationComponent } from "./component/admin/location/add-location/add-location.component";
import { LocationReviewComponent } from "./component/admin/location/location-review/location-review.component";
import { LocationListComponent } from "./component/admin/location/location-list/location-list.component";
import {
  ItemClassesComponent,
  ItemClassesDialog
} from "./component/admin/item-classes/item-classes.component";
import { SupplierListComponent } from "./shared/module/supplier/supplier-list/supplier-list.component";
import { AddSupplierComponent } from "./shared/module/supplier/add-supplier/add-supplier.component";
import { SupplierReviewComponent } from "./shared/module/supplier/supplier-review/supplier-review.component";
import {
  ManufacturerComponent,
  ManufacturerDialog
} from "./shared/module/manufacturer/manufacturer/manufacturer.component";
import { ManufacturerPartComponent } from "./shared/module/manufacturer-part/manufacturer-part/manufacturer-part.component";
import { AddManufacturerPartComponent } from "./shared/module/manufacturer-part/manufacturer-part/add-manufacturer-part/add-manufacturer-part.component";
import { MfgAttributesComponent } from "./shared/module/manufacturer-part/manufacturer-part/mfg-attributes/mfg-attributes.component";
import { ManufacturerPartDialog } from "./shared/module/manufacturer-part/manufacturer-part/manufacturer-part.component";
import { ManufacturerPartReviewComponent } from "./shared/module/manufacturer-part/manufacturer-part/manufacturer-part-review/manufacturer-part-review.component";
import { RoleListComponent } from "./component/admin/permission/role-list/role-list.component";
import { AddRoleComponent } from "./component/admin/permission/add-role/add-role.component";
import { RoleReviewComponent } from "./component/admin/permission/role-review/role-review.component";
import { LocationDialog } from "./component/admin/location/location.component";
import { BusinessNatureComponent } from "./shared/module/business-nature/business-nature/business-nature.component";
import { AddBusinessNatureComponent } from "./shared/module/business-nature/add-business-nature/add-business-nature.component";
import { ReviewBusinessNatureComponent } from "./shared/module/business-nature/review-business-nature/review-business-nature.component";

//Inventory Components
import { AddAssetComponent } from "./component/inventory/assets/add-asset/add-asset.component";
import { AssetListComponent } from "./component/inventory/assets/asset-list/asset-list.component";
import { AssetReviewComponent } from "./component/inventory/assets/asset-review/asset-review.component";
import { AddProductComponent } from "./component/inventory/products/add-product/add-product.component";
import { ProductListComponent } from "./component/inventory/products/product-list/product-list.component";
import { ProductReviewComponent } from "./component/inventory/products/product-review/product-review.component";
import { AddMaterialComponent } from "./component/inventory/material/add-material/add-material.component";
import { MaterialListComponent } from "./component/inventory/material/material-list/material-list.component";
import { MaterialReviewComponent } from "./component/inventory/material/material-review/material-review.component";
import { PurchaseOrderListComponent } from "./component/inventory/purchase-order/purchase-order-list/purchase-order-list.component";
import { NewPurchaseOrderComponent } from "./component/inventory/purchase-order/new-purchase-order/new-purchase-order.component";
import { PurchaseOrderReviewComponent } from "./component/inventory/purchase-order/purchase-order-review/purchase-order-review.component";
import { PurchaseOrderDialog } from "./component/inventory/purchase-order/purchase-order-dialog.component";
import { AuditListComponent } from "./component/inventory/audit/audit-list/audit-list.component";
import { AuditReportComponent } from "./component/inventory/audit/audit-report/audit-report.component";
import { NewAuditComponent } from "./component/inventory/audit/new-audit/new-audit.component";
import { AuditDialog } from "./component/inventory/audit/audit-dialog.component";
import { ReceivingSlipsListComponent } from "./component/inventory/receiving-slip/receiving-slips-list/receiving-slips-list.component";
import { AddReceivingSlipComponent } from "./component/inventory/receiving-slip/add-receiving-slip/add-receiving-slip.component";
import { ReceivingSlipDialog } from "./component/inventory/receiving-slip/receiving-slip-dialog.component";
import { InventoryDialog } from "./component/inventory/inventory-dialog.component";
import {
  MaintenanceListComponent,
  MaintenanceDialog
} from "./component/inventory/maintenance/maintenance-list/maintenance-list.component";
import { TrackerComponent } from "./component/inventory/tracker/tracker.component";

//Workflow Components
import { QuotationListComponent } from "./component/workflow/project-estimator/quotation-list/quotation-list.component";
import { ClientSelectionComponent } from "./component/workflow/project-estimator/client-selection/client-selection.component";
import { ProjectEstimatorDialog } from "./component/workflow/project-estimator/project-estimator-dialog.component";
import { QuotationGenerationComponent } from "./component/workflow/project-estimator/quotation-generation/quotation-generation.component";
import { QuotationReviewComponent } from "./component/workflow/project-estimator/quotation-review/quotation-review.component";
import { WorkOrderComponent } from "./component/workflow/work-order/work-order/work-order.component";
import { WorkOrderDialog } from "./component/workflow/work-order/work-order-dialog.component";
import { WoSubContractorComponent } from "./component/workflow/work-order/wo-sub-contractor/wo-sub-contractor.component";
import { WoContractorReviewComponent } from "./component/workflow/work-order/wo-contractor-review/wo-contractor-review.component";
import { WorkOrderListComponent } from "./component/workflow/work-order/work-order-list/work-order-list.component";
import { WorkOrderReviewComponent } from "./component/workflow/work-order/work-order-review/work-order-review.component";
import { WoQuotationReviewComponent } from "./component/workflow/work-order/wo-quotation-review/wo-quotation-review.component";
import { AddScheduleComponent } from "./component/workflow/schedule/add-schedule/add-schedule.component";
import { AddTimelineScheduleComponent } from "./component/workflow/schedule/timeline/add-timeline-schedule/add-timeline-schedule.component";
import { TimelineScheduleReviewComponent } from './component/workflow/schedule/timeline//timeline-schedule-review/timeline-schedule-review.component';
import { ScheduleTimelineComponent } from "./component/workflow/schedule/timeline/schedule-timeline/schedule-timeline.component";
import { ScheduleDisplayComponent } from "./component/workflow/schedule/timeline/schedule-display/schedule-display.component";
import { ScheduleListComponent } from "./component/workflow/schedule/schedule-list/schedule-list.component";
import { ScheduleReviewComponent } from "./component/workflow/schedule/schedule-review/schedule-review.component";
import { ServicesComponent } from "./component/workflow/project-estimator/quotation-generation/services/services.component";
import { MaterialsComponent } from "./component/workflow/project-estimator/quotation-generation/materials/materials.component";
import { ScheduleComponent } from "./component/workflow/project-estimator/quotation-generation/schedule/schedule.component";
import { PaymentScheduleComponent } from "./component/workflow/project-estimator/quotation-generation/payment-schedule/payment-schedule.component";
import { ImagesComponent } from "./component/workflow/project-estimator/quotation-generation/images/images.component";
import { WoSetupComponent } from "./component/workflow/work-order/wo-setup/wo-setup.component";
import { ExternalWorkOrderComponent } from "./component/workflow/work-order/external-work-order/external-work-order.component";
import { WOServicesComponent } from "./component/workflow/work-order/external-work-order/services/services.component";
import { TeamComponent } from "./component/workflow/work-order/external-work-order/team/team.component";
import { WOAssetsComponent } from "./component/workflow/work-order/external-work-order/assets/assets.component";
import { ProductsComponent } from "./component/workflow/work-order/external-work-order/products/products.component";
import { ChangeRequestReviewComponent } from "./component/workflow/project-estimator/change-request-review/change-request-review.component";
import { ChangeRequestReviewChangesComponent } from "./component/workflow/project-estimator/change-request-review-changes/change-request-review-changes.component";
import { RecurringWorkOrderComponent } from "./component/workflow/work-order/recurring-work-order/recurring-work-order.component";
import { ScheduleDialogComponent } from "./component/workflow/schedule/schedule-dialog.component";

//Messaging Component
import { MessagingComponent } from "./component/message/messaging/messaging.component";

//Trea Super Admin Component
import { TSADashboardComponent } from "./component/trea-super-admin/dashboard/dashboard.component";
import { ErrorLogComponent } from "./component/trea-super-admin/error-log/error-log.component";
import { TSALandingComponent } from "./component/trea-super-admin/dashboard/landing.component";
import { CompanyRegistrationComponent } from "./component/trea-super-admin/company-registration/company-registration.component";
import { TSADialogComponent } from "./component/trea-super-admin/tsa.dialog";
import { DispatchAllComponent } from "./component/dispatch/dispatch-dashboard/dispatch-all/dispatch-all.component";
import { DispatchStaffComponent } from "./component/dispatch/dispatch-dashboard/dispatch-staff/dispatch-staff.component";
import { DispatchWoComponent } from "./component/dispatch/dispatch-dashboard/dispatch-wo/dispatch-wo.component";
import { DispatchDashboardComponent } from "./component/dispatch/dispatch-dashboard/dispatch-dashboard.component";
import { DialogMessageComponent } from "./shared/model/dialog/dialog-message.component";

const AppComponentList = [
  AppComponent,
  LoginComponent,
  ClientLoginComponent,
  ForgotCredentialStepOneComponent,
  ForgotCredentialStepTwoComponent,
  ResetCredentialStepTwoComponent,
  ForgotCredentialStepThreeComponent,
  CompanyUsersDashboardComponent,
  CompanyUsersLandingComponent,
  AddUserComponent,
  AddUserWithSocialIDComponent,
  E404Component,
  SetPasswordStepOneComponent,
  SetPasswordStepTwoComponent,
  DialogComponent,
  RedirectionComponent,
  MaintenanceComponent,
  DialogMessageComponent
];
const OnboardingComponentList = [
  CSAOnboardingDashboardComponent,
  OnboardingGuideComponent,
  OnboardingGuideDialogComponent,
  EmpFieldsComponent,
  AccountDetailsComponent,
  SettingsComponent,
  SettingsDialog,
  EditAccountComponent,
  EditAccountDialog,
  CsvPreviewComponent
];
const CRMComponentList = [
  AddClientComponent,
  ClientListComponent,
  ClientAddressComponent,
  ClientContactComponent,
  ClientReviewComponent,
  ClientDialog
];
const NewCRMComponentList = [
  NewClientListComponent,
  NewAddClientComponent,
  NewClientReviewComponent,
  NewClientDialog
];
const DispatchComponentList = [
  DispatchAllComponent,
  DispatchStaffComponent,
  DispatchWoComponent,
  DispatchDashboardComponent
];
const AccountingComponentList = [
  PayablesComponent,
  ReceivablesComponent,
  CreateInvoiceComponent,
  InvoiceListComponent,
  NewInvoiceComponent,
  LedgerListComponent,
  ReviewInvoiceComponent,
  AccountingDialog,
  InvoiceQuotationReviewComponent
];
const DashboardComponentList = [
  CSAReportsComponent,
  RepairesComponent,
  WorkflowComponent,
  HrComponent,
  SalesComponent,
  FinancialsComponent,
  AssetsComponent,
  SummaryComponent,
  OldSummaryComponent
];
const HRComponentList = [
  SubContractorListComponent,
  AddSubContractorComponent,
  SubContractorReviewComponent,
  TimesheetListComponent,
  EmployeeDialog
];
const AdminComponentList = [
  LocationDialog,
  PrintLabelComponent,
  AddLocationComponent,
  LocationReviewComponent,
  LocationListComponent,
  ItemClassesComponent,
  ItemClassesDialog,
  RoleListComponent,
  AddRoleComponent,
  RoleReviewComponent,
  ManufacturerComponent,
  ManufacturerDialog,
  ManufacturerPartComponent,
  AddManufacturerPartComponent,
  MfgAttributesComponent,
  ManufacturerPartDialog,
  ManufacturerPartReviewComponent,
  SupplierListComponent,
  AddSupplierComponent,
  SupplierReviewComponent,
  BusinessNatureComponent,
  AddBusinessNatureComponent,
  ReviewBusinessNatureComponent
];
const InventoryComponentList = [
  MaintenanceListComponent,
  MaintenanceDialog,
  InventoryDialog,
  NewAuditComponent,
  AuditListComponent,
  AuditReportComponent,
  AuditDialog,
  NewAuditComponent,
  PurchaseOrderListComponent,
  NewPurchaseOrderComponent,
  PurchaseOrderReviewComponent,
  PurchaseOrderDialog,
  ReceivingSlipsListComponent,
  AddReceivingSlipComponent,
  ReceivingSlipDialog,
  AddAssetComponent,
  AssetListComponent,
  AssetReviewComponent,
  AddMaterialComponent,
  MaterialListComponent,
  MaterialReviewComponent,
  AddProductComponent,
  ProductListComponent,
  ProductReviewComponent,
  ServicesComponent,
  MaterialsComponent,
  ScheduleComponent,
  PaymentScheduleComponent,
  ImagesComponent,
  TrackerComponent
];
const WorkflowComponentList = [
  QuotationListComponent,
  ClientSelectionComponent,
  QuotationGenerationComponent,
  QuotationReviewComponent,
  WorkOrderComponent,
  WorkOrderListComponent,
  WorkOrderReviewComponent,
  AddScheduleComponent,
  ScheduleListComponent,
  ScheduleReviewComponent,
  ProjectEstimatorDialog,
  WorkOrderDialog,
  WoSubContractorComponent,
  WoContractorReviewComponent,
  WoQuotationReviewComponent,
  WoSetupComponent,
  ExternalWorkOrderComponent,
  WOServicesComponent,
  TeamComponent,
  WOAssetsComponent,
  ProductsComponent,
  ChangeRequestReviewComponent,
  ChangeRequestReviewChangesComponent,
  RecurringWorkOrderComponent,
  ScheduleDialogComponent,
  ScheduleTimelineComponent,
  ScheduleDisplayComponent,
  AddTimelineScheduleComponent,
  TimelineScheduleReviewComponent
];
const MessageComponentList = [MessagingComponent];
const TSAComponentList = [
  TSALandingComponent,
  TSADashboardComponent,
  ErrorLogComponent,
  CompanyRegistrationComponent,
  TSADialogComponent
];

export const ComponentList = [
  ...AppComponentList,
  ...CRMComponentList,
  ...NewCRMComponentList,
  ...DispatchComponentList,
  ...OnboardingComponentList,
  ...AccountingComponentList,
  ...DashboardComponentList,
  ...HRComponentList,
  ...AdminComponentList,
  ...InventoryComponentList,
  ...WorkflowComponentList,
  ...MessageComponentList,
  ...TSAComponentList
];

const AppEntryComponentList = [
  DialogComponent,
  MaintenanceComponent,
  TSADialogComponent,
  DialogMessageComponent
];
const OnboardingEntryComponentList = [
  OnboardingGuideDialogComponent,
  EditAccountDialog,
  SettingsDialog
];
const CRMEntryComponentList = [ClientDialog];
// new CRM
const NewCRMEntryComponentList = [NewClientDialog];

const HREntryComponentList = [EmployeeDialog];
const AdminEntryComponentList = [
  LocationDialog,
  ItemClassesDialog,
  ManufacturerDialog,
  ManufacturerPartDialog
];
const InventoryEntryComponentList = [
  MaintenanceDialog,
  InventoryDialog,
  AuditDialog,
  PurchaseOrderDialog,
  ReceivingSlipDialog
];
const WorkflowEntryComponentList = [
  ProjectEstimatorDialog,
  WorkOrderDialog,
  ScheduleDialogComponent
];
const AccountingEntryComponentList = [AccountingDialog];

export const EntryComponentList = [
  ...AppEntryComponentList,
  ...OnboardingEntryComponentList,
  ...CRMEntryComponentList,
  ...NewCRMEntryComponentList,
  ...HREntryComponentList,
  ...AdminEntryComponentList,
  ...InventoryEntryComponentList,
  ...WorkflowEntryComponentList,
  ...AccountingEntryComponentList
];

const HRCommonRoutes: any = [
  {
    path: "employee-list/:id",
    component: EmployeeListComponent,
    data: { permissionLevelId: 127, title: "HR - Employees" }
  },
  {
    path: "employee-review",
    component: EmployeeReviewComponent,
    data: { permissionLevelId: 127, title: "HR - Employees" }
  },
  {
    path: "new-employee",
    component: NewEmployeeComponent,
    data: { permissionLevelId: 127, title: "HR - Employees" }
  },
  {
    path: "sub-contractor-list/:id",
    component: SubContractorListComponent,
    data: { permissionLevelId: 136, title: "HR - Sub-Contractor" }
  },
  {
    path: "add-subcontractor",
    component: AddSubContractorComponent,
    data: { permissionLevelId: 136, title: "HR - Sub-Contractor" }
  },
  {
    path: "subcontractor-review",
    component: SubContractorReviewComponent,
    data: { permissionLevelId: 136, title: "HR - Sub-Contractor" }
  }
];

const AdminCommonRoutes: any = [
  {
    path: "location-list/:id",
    component: LocationListComponent,
    data: { permissionLevelId: 13, title: "Admin - Locations" }
  },
  {
    path: "add-location",
    component: AddLocationComponent,
    data: { permissionLevelId: 13, title: "Admin - Locations" }
  },
  {
    path: "location-review",
    component: LocationReviewComponent,
    data: { permissionLevelId: 13, title: "Admin - Locations" }
  },
  {
    path: "item-classes/:id",
    component: ItemClassesComponent,
    data: { permissionLevelId: 24, title: "Admin - Item Classes" }
  },
  {
    path: "role-list/:id",
    component: RoleListComponent,
    data: { permissionLevelId: 45, title: "Admin - Permissions" }
  },
  {
    path: "add-role",
    component: AddRoleComponent,
    data: { permissionLevelId: 45, title: "Admin - Permissions" }
  },
  {
    path: "edit-role/:id",
    component: AddRoleComponent,
    data: { permissionLevelId: 45, title: "Admin - Permissions" }
  },
  {
    path: "role-review",
    component: RoleReviewComponent,
    data: { permissionLevelId: 45, title: "Admin - Permissions" }
  },
  {
    path: "manufacturer/:id",
    component: ManufacturerComponent,
    data: { permissionLevelId: 23, title: "Admin - Manufacturers" }
  },
  {
    path: "manufacturer-part/:id",
    component: ManufacturerPartComponent,
    data: { permissionLevelId: 29, title: "Admin - Item Definition" }
  },
  {
    path: "add-manufacturer-part/:id",
    component: AddManufacturerPartComponent,
    data: { permissionLevelId: 29, title: "Admin - Item Definition" }
  },
  {
    path: "mfg-attributes",
    component: MfgAttributesComponent,
    data: { permissionLevelId: 29, title: "Admin - Item Definition" }
  },
  {
    path: "manufacturer-part-review",
    component: ManufacturerPartReviewComponent,
    data: { permissionLevelId: 29, title: "Admin - Item Definition" }
  },
  {
    path: "supplier-list/:id",
    component: SupplierListComponent,
    data: { permissionLevelId: 39, title: "Admin - Suppliers" }
  },
  {
    path: "add-supplier",
    component: AddSupplierComponent,
    data: { permissionLevelId: 39, title: "Admin - Suppliers" }
  },
  {
    path: "supplier-review",
    component: SupplierReviewComponent,
    data: { permissionLevelId: 39, title: "Admin - Supplier" }
  },
  {
    path: "business-nature/:id",
    component: BusinessNatureComponent,
    data: { permissionLevelId: 8, title: "Admin - Nature of business" }
  },
  {
    path: "add-business-nature/:id",
    component: AddBusinessNatureComponent,
    data: { permissionLevelId: 8, title: "Admin - Nature of business" }
  },
  {
    path: "review-business-nature/:action",
    component: ReviewBusinessNatureComponent,
    data: { permissionLevelId: 8, title: "Admin - Nature of business" }
  }
];

const InventoryCommonRoutes: any = [
  {
    path: "add-asset",
    component: AddAssetComponent,
    data: { permissionLevelId: 62, title: "Inventory - Assets" }
  },
  {
    path: "asset-list/:id",
    component: AssetListComponent,
    data: { permissionLevelId: 62, title: "Inventory - Assets" }
  },
  {
    path: "asset-review",
    component: AssetReviewComponent,
    data: { permissionLevelId: 62, title: "Inventory - Assets" }
  },
  {
    path: "add-product",
    component: AddProductComponent,
    data: { permissionLevelId: 52, title: "Inventory - Products" }
  },
  {
    path: "product-list/:id",
    component: ProductListComponent,
    data: { permissionLevelId: 52, title: "Inventory - Products" }
  },
  {
    path: "product-review",
    component: ProductReviewComponent,
    data: { permissionLevelId: 52, title: "Inventory - Products" }
  },
  {
    path: "add-material",
    component: AddMaterialComponent,
    data: { permissionLevelId: 76, title: "Inventory - Material" }
  },
  {
    path: "material-list/:id",
    component: MaterialListComponent,
    data: { permissionLevelId: 76, title: "Inventory - Material" }
  },
  {
    path: "material-review",
    component: MaterialReviewComponent,
    data: { permissionLevelId: 76, title: "Inventory - Material" }
  }
];

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  {
    path: "login",
    component: LoginComponent,
    pathMatch: "full",
    data: { title: "Login" }
  },
  {
    path: "client-login",
    component: ClientLoginComponent,
    data: { title: "Login" }
  },

  {
    path: "forgot-credential-s1/:type",
    component: ForgotCredentialStepOneComponent,
    data: { title: "Forgot Credential" }
  },
  {
    path: "forgot-credential-s2/:status",
    component: ForgotCredentialStepTwoComponent,
    data: { title: "Forgot Credential" }
  },
  {
    path: "reset-credential-s2",
    component: ResetCredentialStepTwoComponent,
    data: { title: "Reset Credential" }
  },
  {
    path: "forgot-credential-s3",
    component: ForgotCredentialStepThreeComponent,
    data: { title: "Forgot Password" }
  },
  {
    path: "set-password-s1",
    component: SetPasswordStepOneComponent,
    data: { title: "Set Password" }
  },
  {
    path: "set-password-s2",
    component: SetPasswordStepTwoComponent,
    data: { title: "Set Password" }
  },

  {
    path: "company-users",
    component: CompanyUsersLandingComponent,
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        component: CompanyUsersDashboardComponent,
        data: { title: "Dashboard" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] } //'2'
  },
  {
    path: "csa",
    component: CSALandingComponent,
    children: [
      { path: "", redirectTo: "/c-dashboard/csa/summary", pathMatch: "full" },
      {
        path: "redirection/:page/:id",
        component: RedirectionComponent,
        data: { title: "" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3] } //'2'
  },
  //Onboarding Routing
  {
    path: "csa-onboarding",
    component: CSAOnboardingComponent,
    children: [
      { path: "", redirectTo: "account-details", pathMatch: "full" },
      {
        path: "dashboard",
        component: CSAOnboardingDashboardComponent,
        data: { title: "Dashboard" }
      },
      {
        path: "account-details",
        component: AccountDetailsComponent,
        data: { title: "Account " }
      },
      {
        path: "edit-account",
        component: EditAccountComponent,
        data: { title: "Account" }
      },
      {
        path: "settings",
        component: SettingsComponent,
        data: { title: "Settings " }
      },
      {
        path: "guide",
        component: OnboardingGuideComponent,
        data: { title: "Onboarding Guide" }
      },
      {
        path: "emp-fields",
        component: EmpFieldsComponent,
        data: { title: "Employee Fields" }
      },
      {
        path: "csv-preview/:type",
        component: CsvPreviewComponent,
        data: { title: "CSV Preview" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3] }
  },
  //CRM Routing
  {
    path: "crm/csa",
    component: CSALandingComponent,
    children: [
      {
        path: "client-list/:id",
        component: ClientListComponent,
        data: { permissionLevelId: 122, title: "CRM" }
      },
      {
        path: "add-client",
        component: AddClientComponent,
        data: { permissionLevelId: 122, title: "CRM" }
      },
      {
        path: "client-review",
        component: ClientReviewComponent,
        data: { permissionLevelId: 122, title: "CRM" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3] }
  },
  {
    path: "crm/csa-onboarding",
    component: CSAOnboardingComponent,
    children: [
      {
        path: "client-list/:id",
        component: ClientListComponent,
        data: { permissionLevelId: 122, title: "CRM" }
      },
      {
        path: "add-client",
        component: AddClientComponent,
        data: { permissionLevelId: 122, title: "CRM" }
      },
      {
        path: "client-review",
        component: ClientReviewComponent,
        data: { permissionLevelId: 122, title: "CRM" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3] }
  },
  // New CRM Routing
  {
    path: "new-crm/csa",
    component: CSALandingComponent,
    children: [
      {
        path: "client-list/:id",
        component: NewClientListComponent,
        data: { permissionLevelId: 122, title: "CRM" }
      },
      {
        path: "add-client",
        component: NewAddClientComponent,
        data: { permissionLevelId: 122, title: "CRM" }
      },
      {
        path: "client-review",
        component: NewClientReviewComponent,
        data: { permissionLevelId: 122, title: "CRM" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3] }
  },
  {
    path: "new-crm/csa-onboarding",
    component: CSAOnboardingComponent,
    children: [
      {
        path: "client-list/:id",
        component: NewClientListComponent,
        data: { permissionLevelId: 122, title: "CRM" }
      },
      {
        path: "add-client",
        component: NewAddClientComponent,
        data: { permissionLevelId: 122, title: "CRM" }
      },
      {
        path: "client-review",
        component: NewClientReviewComponent,
        data: { permissionLevelId: 122, title: "CRM" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3] }
  },
  //Dispatch Routing
  {
    path: "dispatch/csa",
    component: CSALandingComponent,
    children: [
      {
        path: "dashboard",
        component: DispatchDashboardComponent,
        data: { permissionLevelId: 166, title: "Dispatch" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3] }
  },
  //Accounting Routing
  {
    path: "account/csa",
    component: CSALandingComponent,
    children: [
      {
        path: "acc-payables/:id",
        component: PayablesComponent,
        data: { permissionLevelId: 152, title: "Financials - Payables" }
      },
      {
        path: "acc-receivables/:id",
        component: ReceivablesComponent,
        data: { permissionLevelId: 148, title: "Financials - Receivables" }
      },
      {
        path: "invoice-list/:id",
        component: InvoiceListComponent,
        data: { permissionLevelId: 156, title: "Financials - Invoice list" }
      },
      {
        path: "new-invoice",
        component: NewInvoiceComponent,
        data: { permissionLevelId: 156, title: "Financials - Create Invoice" }
      },
      {
        path: "ledger-list/:id",
        component: LedgerListComponent,
        data: { permissionLevelId: 164, title: "Financials - Ledger" }
      },
      {
        path: "create-invoice",
        component: CreateInvoiceComponent,
        data: { permissionLevelId: 156, title: "Financials - Create Invoice" }
      },
      {
        path: "review-invoice",
        component: ReviewInvoiceComponent,
        data: { permissionLevelId: 156, title: "Financials - Create Invoice" }
      },
      {
        path: "invoice-quote-review",
        component: InvoiceQuotationReviewComponent,
        data: { permissionLevelId: 156, title: "Financials - Create Invoice" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3] }
  },
  //Dashboard(Reports) Routing
  {
    path: "c-dashboard/csa",
    component: CSALandingComponent,
    children: [
      {
        path: "summary",
        component: SummaryComponent,
        data: { title: "Dashboard - Summary" }
      },
      {
        path: "reports",
        component: CSAReportsComponent,
        data: { title: "Dashboard - Reports" },
        children: [
          { path: "", redirectTo: "repaires", pathMatch: "full" },
          {
            path: "repaires",
            component: RepairesComponent,
            data: { title: "Dashboard - Reports" }
          },
          {
            path: "workflow",
            component: WorkflowComponent,
            data: { title: "Dashboard - Reports" }
          },
          {
            path: "hr",
            component: HrComponent,
            data: { title: "Dashboard - Reports" }
          },
          {
            path: "sales",
            component: SalesComponent,
            data: { title: "Dashboard - Reports" }
          },
          {
            path: "financials",
            component: FinancialsComponent,
            data: { title: "Dashboard - Reports" }
          },
          {
            path: "assets",
            component: AssetsComponent,
            data: { title: "Dashboard - Reports" }
          }
        ]
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3] }
  },
  //HR Routing
  {
    path: "hr/csa",
    component: CSALandingComponent,
    children: [
      ...HRCommonRoutes,
      {
        path: "timesheet-list/:id",
        component: TimesheetListComponent,
        data: { title: "HR - Timesheet" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3], title: "HR- Timesheet" }
  },
  {
    path: "hr/csa-onboarding",
    component: CSAOnboardingComponent,
    children: [...HRCommonRoutes],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3], title: "HR" }
  },
  //Admin Routing
  {
    path: "admin/csa-onboarding",
    component: CSAOnboardingComponent,
    children: [...AdminCommonRoutes],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3], title: "Admin" }
  },
  {
    path: "admin/csa",
    component: CSALandingComponent,
    children: [
      {
        path: "print-label",
        component: PrintLabelComponent,
        data: { permissionLevelId: 49, title: "Admin - Labels" }
      },
      ...AdminCommonRoutes
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3], title: "Admin" }
  },
  //Inventory Routing
  {
    path: "inventory/csa-onboarding",
    component: CSAOnboardingComponent,
    children: [...InventoryCommonRoutes],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3], title: "Inventory" }
  },
  {
    path: "inventory/csa",
    component: CSALandingComponent,
    children: [
      ...InventoryCommonRoutes,
      {
        path: "maintenance-list/:id",
        component: MaintenanceListComponent,
        data: { permissionLevelId: 86, title: "Inventory - Maintainance" }
      },
      {
        path: "tracker/:id",
        component: TrackerComponent,
        data: { permissionLevelId: 72, title: "Inventory - Tracker" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3], title: "Inventory" }
  },
  {
    path: "inventory/audit/csa",
    component: CSALandingComponent,
    children: [
      {
        path: "audit-list/:id",
        component: AuditListComponent,
        data: { permissionLevelId: 101, title: "Inventory - Audit" }
      },
      {
        path: "new-audit",
        component: NewAuditComponent,
        data: { permissionLevelId: 101, title: "Inventory - Audit" }
      },
      {
        path: "audit-report",
        component: AuditReportComponent,
        data: { permissionLevelId: 101, title: "Inventory - Audit" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3], title: "Inventory" }
  },
  {
    path: "inventory/po/csa",
    component: CSALandingComponent,
    children: [
      {
        path: "new-purchase-order",
        component: NewPurchaseOrderComponent,
        data: { permissionLevelId: 93, title: "Inventory - Purchase order" }
      },
      {
        path: "purchase-order-list/:id",
        component: PurchaseOrderListComponent,
        data: { permissionLevelId: 93, title: "Inventory - Purchase order" }
      },
      {
        path: "purchase-order-review",
        component: PurchaseOrderReviewComponent,
        data: { permissionLevelId: 93, title: "Inventory - Purchase order" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3], title: "Inventory" }
  },
  {
    path: "inventory/rs/csa",
    component: CSALandingComponent,
    children: [
      {
        path: "receiving-slips-list/:id",
        component: ReceivingSlipsListComponent,
        data: { permissionLevelId: 98, title: "Inventory - Receiving Slips" }
      },
      {
        path: "add-receiving-slip",
        component: AddReceivingSlipComponent,
        data: { permissionLevelId: 98, title: "Inventory - Receiving Slips" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3], title: "Inventory" }
  },
  //Workflow Routing
  {
    path: "workflow/quote/csa",
    component: CSALandingComponent,
    children: [
      {
        path: "quotation-list/:id",
        component: QuotationListComponent,
        data: { permissionLevelId: 107, title: "Workflow - Project Estimator" }
      },
      {
        path: "client-selection",
        component: ClientSelectionComponent,
        data: { permissionLevelId: 107, title: "Workflow - Project Estimator" }
      },
      {
        path: "quotation",
        component: QuotationGenerationComponent,
        data: { permissionLevelId: 107, title: "Workflow - Project Estimator" },
        children: [
          {
            path: "services",
            component: ServicesComponent,
            data: { title: "Workflow - Project Estimator" }
          },
          {
            path: "materials",
            component: MaterialsComponent,
            data: { title: "Workflow - Project Estimator" }
          },
          {
            path: "schedule",
            component: ScheduleComponent,
            data: { title: "Workflow - Project Estimator" }
          },
          {
            path: "payment-schedule",
            component: PaymentScheduleComponent,
            data: { title: "Workflow - Project Estimator" }
          },
          {
            path: "images",
            component: ImagesComponent,
            data: { title: "Workflow - Project Estimator" }
          }
        ]
      },
      {
        path: "quotation-review",
        component: QuotationReviewComponent,
        data: { permissionLevelId: 107, title: "Workflow - Project Estimator" }
      },
      {
        path: "change-request-review",
        component: ChangeRequestReviewChangesComponent,
        data: { permissionLevelId: 107, title: "Workflow - Project Estimator" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3], title: "Workflow" }
  },
  {
    path: "workflow/wo/csa",
    component: CSALandingComponent,
    children: [
      {
        path: "work-order",
        component: WorkOrderComponent,
        data: { permissionLevelId: 115, title: "Workflow - Work Orders" },
        children: [
          {
            path: "services",
            component: WOServicesComponent,
            data: { title: "Workflow - Work Orders" }
          },
          {
            path: "team",
            component: TeamComponent,
            data: { title: "Workflow - Work Orders" }
          },
          {
            path: "assets",
            component: WOAssetsComponent,
            data: { title: "Workflow - Work Orders" }
          },
          {
            path: "products",
            component: ProductsComponent,
            data: { title: "Workflow - Work Orders" }
          }
        ]
      },
      {
        path: "work-order-list/:id",
        component: WorkOrderListComponent,
        data: { permissionLevelId: 115, title: "Workflow - Work Orders" }
      },
      {
        path: "work-order-review",
        component: WorkOrderReviewComponent,
        data: { permissionLevelId: 115, title: "Workflow - Work Orders" }
      },
      {
        path: "wo-quotation-review",
        component: WoQuotationReviewComponent,
        data: { permissionLevelId: 115, title: "Workflow - Work Orders" }
      },
      {
        path: "wo-setup",
        component: WoSetupComponent,
        data: { permissionLevelId: 115, title: "Workflow - Work Orders" }
      },
      {
        path: "wo-sub-contractor",
        component: WoSubContractorComponent,
        data: { permissionLevelId: 115, title: "Workflow - Work Orders" }
      },
      {
        path: "wo-contractor-review",
        component: WoContractorReviewComponent,
        data: { permissionLevelId: 115, title: "Workflow - Work Orders" }
      },
      {
        path: "wo-external",
        component: ExternalWorkOrderComponent,
        data: { permissionLevelId: 115, title: "Workflow - Work Orders" },
        children: [
          {
            path: "services",
            component: WOServicesComponent,
            data: { title: "Workflow - Work Orders" }
          },
          {
            path: "team",
            component: TeamComponent,
            data: { title: "Workflow - Work Orders" }
          },
          {
            path: "assets",
            component: WOAssetsComponent,
            data: { title: "Workflow - Work Orders" }
          },
          {
            path: "products",
            component: ProductsComponent,
            data: { title: "Workflow - Work Orders" }
          }
        ]
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3], title: "Workflow" }
  },
  {
    path: "workflow/schedule/csa",
    component: CSALandingComponent,
    children: [
      {
        path: "add-schedule/:type",
        component: AddScheduleComponent,
        data: { permissionLevelId: 119, title: "Workflow - Scheduling" }
      },
      {
        path: "schedule-review/:type",
        component: ScheduleReviewComponent,
        data: { permissionLevelId: 119, title: "Workflow - Scheduling" }
      },
      {
        path: "schedule-list/:id",
        component: ScheduleListComponent,
        data: { permissionLevelId: 119, title: "Workflow - Scheduling" }
      },
      {
        path: "schedule-timeline",
        component: ScheduleTimelineComponent,
        data: { title: "Workflow - Scheduling" },
      },
      {
        path: "add-timeline-schedule/:type/:id",
        component: AddTimelineScheduleComponent,
        data: { title: "Workflow - Add timeline schedule" },
      },
      {
        path: "timeline-schedule-review/:type",
        component: TimelineScheduleReviewComponent,
        data: { title: "Workflow - Schedule Review" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3] }
  },

  //Messaging Routing
  {
    path: "message/csa",
    component: CSALandingComponent,
    children: [
      {
        path: "messaging",
        component: MessagingComponent,
        data: { permissionLevelId: 119, title: "Messaging" }
      }
    ]
  },
  //Trea Super Admin Routing
  {
    path: "su/tsa",
    component: TSALandingComponent,
    children: [
      { path: "", redirectTo: "dashboard/0", pathMatch: "full" },
      {
        path: "dashboard/:id",
        component: TSADashboardComponent,
        data: { title: "Dashboard" }
      },
      {
        path: "error-log",
        component: ErrorLogComponent,
        data: { title: "Error Log" }
      },
      {
        path: "company-registration",
        component: CompanyRegistrationComponent,
        data: { title: "Company Registeration" }
      },
      {
        path: "users-list/:compId/:id",
        component: EmployeeListComponent,
        data: { title: "User List" }
      },
      {
        path: "add-user/:id",
        component: NewEmployeeComponent,
        data: { title: "Add User" }
      },
      {
        path: "user-review/:id",
        component: EmployeeReviewComponent,
        data: { title: "User Review" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [1] }
  },
  {
    path: "email-link",
    loadChildren:
      "./component/email-template/email-template.module#EmailTemplateModule"
  },

  { path: "**", redirectTo: "404", pathMatch: "full" },
  { path: "404", component: E404Component, data: { title: "404" } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
