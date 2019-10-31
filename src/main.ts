import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { LazyLoadingAppModule } from "./app/lazy-loading-app.module";
import { environment } from "./environments/environment";
import "hammerjs";

if (environment.production) {
  enableProdMode();
  if(window){
    if(window.location.pathname == "/cloud/") {
      window.console.log = function(){};
    }
  }
}

  platformBrowserDynamic().bootstrapModule(LazyLoadingAppModule) //For Development Build with Lazy Loading
  //platformBrowserDynamic().bootstrapModule( AppModule )            //For Production Build without Lazy Loading
  .catch(err => console.log(err));
