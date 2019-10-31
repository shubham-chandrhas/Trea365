import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpModule } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs/observable/from';
import { HttpClientModule, HttpClient, HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';

import { TextMaskModule } from 'angular2-text-mask';
import { PopoverModule } from "ngx-popover";
import { NgxPaginationModule } from 'ngx-pagination';
import { FileDropModule } from 'ngx-file-drop';
import { Ng2DragDropModule } from 'ng2-drag-drop';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

//For Normal Loading
import { AgmCoreModule } from '@agm/core';
import { NgxBarcodeModule } from 'ngx-barcode';

//Required services
import { AuthService } from './auth/auth.service';
import { AuthGuardService as AuthGuard } from './auth/auth-guard.service';
import { RoleGuardService as RoleGuard } from './auth/role-guard.service';
import { AwsCognitoService } from './auth/aws-cognito.service';
import { HttpService } from './shared/service/http.service';
import { UtilService } from './shared/service/util.service';
import { ConstantsService } from './shared/service/constants.service';
import { FileService } from './shared/service/file.service';
import { SorterService } from './shared/service/sorter.service';
import { ExportService } from './shared/service/export.service';
import { SocketService } from './shared/service/socket.service';
import { GlobalService } from './shared/service/global.service';
import { AdminService } from './component/admin/admin.service';
import { DashboardService } from './component/dashboard/dashboard.service';

//For Normal Loading
import { CrmService } from './component/crm/crm-service';
import { NewCrmService } from './component/new-crm/crm-service';
import { HrService } from './component/hr/hr.service';
import { LocationService } from './component/admin/location/location.service';
import { ProjectEstimatorService } from './component/workflow/project-estimator/project-estimator.service';
import { WorkOrderService } from './component/workflow/work-order/work-order.service';

//Required modules
import { MaterialModule } from './shared/module/material.module';
import { TreaCommonModule } from './shared/module/trea-common.module';
import { PipeModule } from './shared/module/pipe.module';
import { HrModule } from './component/hr/hr.module';

import { AppConfigModule, APP_DI_CONFIG } from './app-config.module';
//import { LazyLoadingAppRoutingModule } from './lazy-loading-app-routing.module';
import { AppRoutingModule } from './app-routing.module';

//Required components
import { AppComponent } from './app.component';
import { ComponentList, EntryComponentList } from './app-routing.module';
import { Ng2ImgMaxModule } from 'ng2-img-max/dist/src/ng2-img-max.module';
import { Ng2ImgMaxService } from 'ng2-img-max/dist/src/ng2-img-max.service';
import { VersionCheckService } from './version-check.service';
//import { LazyLoadingComponentList, LazyLoadingEntryComponentList } from './lazy-loading-app-routing.module';

@Injectable()
export class HTTPRequestInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        //let tokan = sessionStorage.getItem('KEY') ? atob(sessionStorage.getItem('KEY')) : atob(localStorage.getItem('KEY')) ;
        let tokan = localStorage.getItem('KEY') ? atob(localStorage.getItem('KEY')) : '' ;
        const authReq = req.clone({
            headers: req.headers.set('Authorization', tokan)
        });
        return next.handle(authReq);
    }
}

@NgModule({
  declarations: APP_DI_CONFIG.lazyLoading ? [] : ComponentList,
  imports: [
    AppRoutingModule,
    //LazyLoadingAppRoutingModule,       //For Development Build
    CommonModule,
    HttpModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AppConfigModule,
    MaterialModule,
    HttpClientModule,
    TextMaskModule,
    PopoverModule,
    NgxPaginationModule,
    FileDropModule,
    Ng2DragDropModule.forRoot(),
    MultiselectDropdownModule,
    PipeModule,
    TreaCommonModule,
    //For Normal Loading
    NgxBarcodeModule,
    Ng2ImgMaxModule,
    AgmCoreModule.forRoot({
        apiKey: APP_DI_CONFIG.googleMapKey,
        libraries: ["places"]
    }),
    HrModule
  ],
  providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: HTTPRequestInterceptor,
        multi: true,
    },
    AuthService,
    AuthGuard,
    RoleGuard,
    AwsCognitoService,
    HttpService,
    UtilService,
    ConstantsService,
    FileService,
    ExportService,
    DatePipe,
    SorterService,
    SocketService,
    GlobalService,
    AdminService,
    DashboardService,
    //For Normal Loading
    CrmService,
    NewCrmService,
    HrService,
    LocationService,
    ProjectEstimatorService,
    WorkOrderService,
    Ng2ImgMaxService,
    VersionCheckService
  ],
  entryComponents: APP_DI_CONFIG.lazyLoading ? [] : EntryComponentList,
  bootstrap: [AppComponent]
})
export class AppModule {
    datepicker = {SearchDate:new Date()}
    constructor( ) {}
}
