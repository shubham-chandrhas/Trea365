# Angular5

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.5.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

Abbreviations Used
TSA - Trea Super Admin
CSA - Company Super Admin
DC - Developer Comments 

Changes
Date :: 31 July 2018 
Text Change "Item Class" => "Item Category"
Text Change "Item Classes" => "Item Categories" 
Text Change "MFG Part" => "Item Definition"
Text Change "Manufacturer Part" => "Item Definition"

IMP Note
1. To update multiselect default message need to update in below file
	node_modules/angular-2-dropdown-multiselect/dropdown/dropdown.component.js
	line no : 75  remove old message then add " searchEmptyResult: 'No relevant data...', "


Socket Ref
https://medium.com/dailyjs/real-time-apps-with-typescript-integrating-web-sockets-node-angular-e2b57cbd1ec1

Trea360 Angular JS development Setup
For AWS setting     // Ref :: https://www.npmjs.com/package/amazon-cognito-identity-js
npm install --save-dev webpack json-loader
npm install --save amazon-cognito-identity-js

Date :: 6 Dec 2017
npm install ng2-password-strength-bar --save          
Ref :: https://www.npmjs.com/package/ng2-password-strength-bar

Date :: 25 Dec 2017
npm i angular2-text-mask --save
Ref :: https://github.com/text-mask/text-mask/tree/master/angular2#readme

Date :: 26 Dec 2017
npm install ngx-popover --save
Ref :: https://github.com/pleerock/ngx-popover

Date :: 8 Jan 2018
npm install jspdf-autotable --save
Ref :: https://github.com/simonbengtsson/jsPDF-AutoTable

Date :: 9 Jan 2018
npm install --save angular2-csv
Ref :: http://www.coding4developers.com/angular2/export-data-to-csv-in-angular-2/


Date :: 9 Jan 2018
npm install ngx-pagination --save
Ref :: https://github.com/michaelbromley/ngx-pagination/

Date :: 12 Jan 2018
npm install angular-2-dropdown-multiselect --save
Ref :: https://github.com/softsimon/angular-2-dropdown-multiselect

Date :: 22 Jan 2018
npm install underscore --save
npm install @types/underscore --save
Ref :: https://stackoverflow.com/questions/37569537/how-to-use-underscore-js-library-in-angular-2

Date :: 29 Jan 2018
npm install ngx-file-drop --save
Ref :: https://www.npmjs.com/package/ngx-file-drop

Date :: 24 Apr 2018
npm install ng2-drag-drop --save
Ref :: https://www.npmjs.com/package/ng2-drag-drop#demo

Date :: 26 Apr 2018
npm install @agm/core --save
npm install @types/googlemaps --save-dev
Ref :: http://brianflove.com/2016/10/18/angular-2-google-maps-places-autocomplete/
       https://angular-maps.com/guides/getting-started/


Date :: 19 Jun 2018
npm install ngx-barcode --save
Ref :: https://www.npmjs.com/package/ngx-barcode
       https://yobryon.github.io/ngx-barcode/demo/
       https://github.com/lindell/JsBarcode

Date :: 20 Jun 2018
npm install bootstrap@3 --save
Ref :: https://getbootstrap.com/docs/3.3/getting-started/
npm install jquery --save
npm install jquery-ui-dist --save
npm install admin-lte --save


Date :: 27 Sept 2018
npm install chart.js --save

Date :: 7 Mar 2019
npm install date-fns --save
Ref :: https://www.npmjs.com/package/date-fns

Date :: 12 Mar 2019
install ng2-img-max blueimp-canvas-to-blob --save
Ref :: https://alligator.io/angular/resizing-images-in-browser-ng2-img-max/
