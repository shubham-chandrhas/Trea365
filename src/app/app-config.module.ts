import { NgModule, InjectionToken } from "@angular/core";
import { environment } from "../environments/environment";

export let APP_CONFIG = new InjectionToken<AppConfig>("app.config");

export class AppConfig {
    googleMapKey: string;
  	apiEndpoint: string;
  	pdfEndpoint: string;
  	awsUserPoolId: string;
  	awsClientId: string;
    domainIP: string;
    socketServerURL: string;
    lazyLoading: boolean;
}

export const APP_DI_CONFIG: AppConfig = {
  lazyLoading: true, //For Development Build with Lazy Loading
  //lazyLoading: false,   //For Production Build without Lazy Loading
  googleMapKey: "AIzaSyCm4eqWK_0jL_CWllGfqv_Wt6VMjHO-HwU",

  // apiEndpoint: 'http://localhost/torinit/trea365api/public/api/',     //Localhost
  //apiEndpoint: 'http://192.168.2.118/trea360/public/api/',     //Local server
  //apiEndpoint: 'http://192.168.2.41/trea360/public/api/',   //Dhyanesh
  //apiEndpoint: 'http://192.168.2.227/trea365api/public/api/', //Bharat
  //apiEndpoint: 'http://192.168.2.76/trea365api/public/api/',   //Azar
  //domainIP: 'https://18.216.188.2',

    // steam
    domainIP: 'https://www.trea365.com/steam/',     //'https://ec2-18-217-161-244.us-east-2.compute.amazonaws.com',
    apiEndpoint: 'https://www.trea365.com/steam/api/public/api/',  // Dev server
    pdfEndpoint: 'https://www.trea365.com/steam/api/public/',  // Dev server
    //apiEndpoint: 'http://localhost/trea/trea365api/public/api/', //Sunny
    awsUserPoolId: 'us-east-2_scrGK0WJO',
    awsClientId: '68g4ktfiugs5v3nribkskg920n',
    //socketServerURL: 'http://localhost:8080',
    socketServerURL: 'https://trea365.com:3000'

    // Cloud
    // domainIP: 'https://www.trea365.com/cloud/',     //'https://ec2-18-217-161-244.us-east-2.compute.amazonaws.com',
    // apiEndpoint: 'https://www.trea365.com/cloud/api/public/api/',  // Prod server
    // pdfEndpoint: 'https://www.trea365.com/cloud/api/public/',  // Prod server

    // awsUserPoolId: 'us-east-2_LL1TOkrda',
    // awsClientId: '72ledau5lkimu5djnceq3m8jb5',
    // socketServerURL: 'https://trea365.com:3000'

  // water
  // domainIP: 'https://www.trea365.com/water/',     //'https://ec2-18-217-161-244.us-east-2.compute.amazonaws.com',
  // apiEndpoint: 'https://www.trea365.com/water/api/public/api/',  // Dev server
  // awsUserPoolId: 'us-east-2_Afgog1bvu',
  // awsClientId: '3iqbts7nsc4r36cg1q1jg5b9s5',
  // socketServerURL: 'http://localhost:8080'

  // ice
  // domainIP: 'https://www.trea365.com/ice/',     //'https://ec2-18-217-161-244.us-east-2.compute.amazonaws.com',
  // apiEndpoint: 'https://www.trea365.com/ice/api/public/api/',  // Dev server
  // awsUserPoolId: 'us-east-2_NE844gP7b',
  // awsClientId: '3mtm14146jh5i1nq7l7g666jmk',
  // socketServerURL: 'http://localhost:8080'

  // air
  // domainIP: 'https://www.trea365.com/air/',     //'https://ec2-18-217-161-244.us-east-2.compute.amazonaws.com',
  // apiEndpoint: 'https://www.trea365.com/air/api/public/api/',  // Dev server
  // awsUserPoolId: 'us-east-2_scrGK0WJO',
  // awsClientId: '68g4ktfiugs5v3nribkskg920n',
  // socketServerURL: 'https://trea365.com:3000'

  //Dev
  // domainIP: 'https://18.217.161.244',     //'https://ec2-18-217-161-244.us-east-2.compute.amazonaws.com',
  // apiEndpoint: 'https://18.217.161.244/api/public/api/',  // Dev server
  // awsUserPoolId: 'us-east-2_scrGK0WJO',
  // awsClientId: '68g4ktfiugs5v3nribkskg920n',
  // socketServerURL: 'http://trea365.com:3000'

  //QA
  // domainIP: 'https://ec2-18-217-76-117.us-east-2.compute.amazonaws.com',
  // apiEndpoint: 'https://ec2-18-217-76-117.us-east-2.compute.amazonaws.com/api/public/api/',  // Dev server
  // awsUserPoolId: 'us-east-2_Afgog1bvu',
  // awsClientId: '3iqbts7nsc4r36cg1q1jg5b9s5',
  // socketServerURL: 'http://localhost:8080'
};

@NgModule({
  providers: [
    {
      provide: APP_CONFIG,
      useValue: APP_DI_CONFIG
    }
  ]
})
export class AppConfigModule {}
