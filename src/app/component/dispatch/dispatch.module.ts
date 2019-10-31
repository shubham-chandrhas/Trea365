import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { APP_DI_CONFIG } from '../../app-config.module';
import { DispatchRoutingModule, DispatchComponent } from './dispatch-routing.module';
import { TreaCommonModule } from '../../shared/module/trea-common.module';
import { AgmCoreModule } from '@agm/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipeModule } from '../../shared/module/pipe.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DispatchRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    TreaCommonModule,
    PipeModule,
    AgmCoreModule.forRoot({
        apiKey: APP_DI_CONFIG.googleMapKey,
        libraries: ["places"]
  }),
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? DispatchComponent : [],
})
export class DispatchModule { }
