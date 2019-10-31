import { Component, OnInit } from '@angular/core';

import { AdminService } from '../admin.service';
import { HttpService } from '../../../shared/service/http.service';
import { UtilService } from '../../../shared/service/util.service';
import { ExportService } from '../../../shared/service/export.service';
import { GlobalService } from '../../../shared/service/global.service';
import { Router, ActivatedRoute } from '@angular/router';

declare var $:any;
@Component({
    selector: 'app-print-label',
    templateUrl: './print-label.component.html',
    styleUrls: ['./print-label.component.css']
})
export class PrintLabelComponent implements OnInit {
    public pageData: any = { 'labelType': 'location', 'locList': [], 'assetsList': [], 'productList': [], 'selItemList': [], 'printList': []};
    //public totalPrintLabel:number = 0;
    permissionsSet: any;
    public onBoarding:boolean = false;
    
    constructor(
        public util:UtilService, 
        private route: ActivatedRoute,
        private http:HttpService, 
        private admin: AdminService,
        private global: GlobalService,
        private exportDoc: ExportService,
        ) {
    }

    ngOnInit() {
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.util.menuChange({'menu':2,'subMenu':18});
        this.permissionsSet = this.util.getModulePermission(48);

        $(function() {
            var thHeight = $("table#lblToPrintTbl th:first").height(); 
            $("table#lblToPrintTbl th").resizable({
                handles: "e",
                minHeight: thHeight,
                maxHeight: thHeight,
                minWidth: 40,
                resize: function (event, ui) {
                    var sizerID = "#" + $(event.target).attr("id") + "-sizer";
                    $(sizerID).width(ui.size.width);
                }
            });
        });
        this.getLocationTags();
        
        
    }

    getLocationTags(){
        let self = this;
        this.util.showProcessing('processing-spinner');
        try{
            this.http.doGet('location/tag/0', function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){ console.log(response) }else{
                    self.pageData.locList = response.tags ? response.tags.filter(item => (item.name = item.location_tag, item.labelType = 'location', item.noOfCopy= 1,item.scanCode = item.scan_code, item.id = item.location_tag_id)) : [];
                }
                self.getAssetList();
            });
        }catch(err){
            this.global.addException('print label','getLocationTags()',err);
        }
    }

    getProductList(){
        let self = this;
        try{
            this.http.doGet('manufPart', function(error: boolean, response: any){
                if( error ){ console.log(response) }else{
                    if(response.data.length > 0){
                        if(response.data.filter(item => item.class_name.item_class_type == 'Product').length > 0){
                            self.pageData.productList = response.data.filter(item => item.class_name.item_class_type == 'Product').filter(item => (item.name = item.short_name, item.labelType = 'product', item.noOfCopy= 1, item.scanCode = item.upc, item.id = item.manf_part_id));
                        }
                    }  
                }
                if(self.pageData.locList.length ==0 && self.pageData.productList.length ==0 && self.pageData.assetsList.length ==0)
                {
                    self.onBoarding = true;
                }
            });
        }catch(err){
            this.global.addException('print label', 'getAssetAndProductList()', err);
        }
    }

    getAssetList(){
        let self = this;
        try{
            this.http.doGet('assets', function(error: boolean, response: any){
                if( error ){ console.log(response) }else{
                    self.pageData.assetsList = response.data ? response.data.filter(item => (item.name = item.data.short_tag, item.labelType = 'assets', item.noOfCopy= 1, item.scanCode = item.data.scan_code, item.id = item.data.asset_id, item.scan_code = item.data.scan_code, item.serial_no = item.data.serial_no)) : [];
                    console.log("Assets", response.data,self.pageData.assetsList);
                }
                self.getProductList();
            });
        }catch(err){
            this.global.addException('print label','getAssetList()',err);
        }
    }

    // getProductList(){
    //     let self = this;
    //     try{
    //         this.http.doGet('products', function(error: boolean, response: any){
    //             if(error){ console.log(response.data) }else{  
    //                 self.pageData.productList = response.data.filter(item => (item.name = item.manufacture_part.short_name, item.labelType = 'product', item.noOfCopy= 1, item.scanCode = item.manufacture_part.upc, item.id = item.prod_id));
    //             }
    //         });
    //     }catch(err){
    //         this.global.addException('print label','getProductList()',err);
    //     }
    // }

    // ----- :: LOCATION :: -----
    addItemToPrint(listFrom, listTo, index, id): void {
        for (let i = 0; i < listFrom.length; i++) {
            if(listFrom[i].id == id){
                listFrom[i].noOfCopy = 1;
                listTo.push(listFrom[i]);
                listFrom.splice(i, 1);
                //this.totalPrintLabel++;
                break;
            }
        }

        this.updatePrintTable(listTo);
    }

    removeItemFromPrint(listFrom, listTo, index, id): void {
        try{
            for (let i = 0; i < listFrom.length; i++) {
                if(listFrom[i].id == id){
                    if( listFrom[i].labelType == 'location' )
                        this.pageData.locList.push(listFrom[i]);
                    else if( listFrom[i].labelType == 'assets' )
                        this.pageData.assetsList.push(listFrom[i]);
                    else
                        this.pageData.productList.push(listFrom[i]);
                    //this.totalPrintLabel = this.totalPrintLabel - listFrom[i].noOfCopy;
                    listFrom.splice(i, 1);
                }
            }    
            
            this.updatePrintTable(listFrom);
        }catch(err){
            this.global.addException('print label','removeItemFromPrint()',err);
        }  
    }

    addItemToPrintAll(listFrom, listTo): void {
        
        for (let i = 0; i < listFrom.length; i) {
            listFrom[i].noOfCopy = 1;
            listTo.push(listFrom[i]);
            listFrom.splice(i, 1);
        }

        this.updatePrintTable(listTo);
    }

    updateNoOfCopy(list, option, index): void {
        if(option == '+'){
            list[index].noOfCopy++;
            //this.totalPrintLabel++;
        }else{
            //list[index].noOfCopy == 0 ? '' : this.totalPrintLabel = this.totalPrintLabel == 0 ? 0 : this.totalPrintLabel - 1;
            list[index].noOfCopy = list[index].noOfCopy == 0 ? 0 : list[index].noOfCopy - 1;
        }
        this.updatePrintTable(list);
    }

    updateNoOfCopyOnInput(list, index): void {
        
            // console.log(list[index].noOfCopy);
        
        this.updatePrintTable(list);
    }

    updatePrintTable(list): void {
        let count: number = 0, j: number = 0, labelList: any = [];
        //this.totalPrintLabel = 0;
        try{
            this.pageData.printList = [];
            for (let i = 0; i < list.length; i++) {
                for (let k = 0; k < list[i].noOfCopy; k++) {
                    //labelList.push(list[i]);
                    //this.totalPrintLabel++;
                    this.pageData.printList.push(list[i]);
                }
            }

            // while(count < labelList.length){
            //     this.pageData.printList.push({'locRow': []})
            //     for (let i = 0; i < 3; i++,count++) {
            //         if(count < labelList.length)
            //             this.pageData.printList[j].locRow.push(labelList[count]);
            //         else
            //             return;
            //     }
            //     j++;
            // }
        }catch(err){
            this.global.addException('print label','updatePrintTable()',err);
        }  
    }

    onItemDrop(e: any) {
        try{
            // Get the dropped data here
            this.pageData.selItemList.push(e.dragData);
            let currentList: any[] = [];
            if( e.dragData.labelType == 'location' )
                currentList = this.pageData.locList;
            else if( e.dragData.labelType == 'assets' )
                currentList = this.pageData.assetsList;
            else
                currentList = this.pageData.productList;    
            //console.log(e.dragData);
            if(currentList.length > 0){
                for (let i = 0; i < currentList.length; i++) {
                    console.log(currentList[i].id +'=='+ e.dragData.id)
                    if( currentList[i].id == e.dragData.id ){
                        //this.selLocList.push(this.locationList[i]);
                        //this.totalPrintLabel++;
                        currentList.splice(i, 1);
                        this.updatePrintTable(this.pageData.selItemList);
                        return;
                    }
                }
            }
        }catch(err){
            this.global.addException('print label','onItemDrop()',err);
        } 
    };

    cancel(){
        try{
            for (let i = this.pageData.selItemList.length-1; i >= 0; i--) {
                if( this.pageData.selItemList[i].labelType == 'location' )
                    this.pageData.locList.push(this.pageData.selItemList[i]);
                else if( this.pageData.selItemList[i].labelType == 'assets' )
                    this.pageData.assetsList.push(this.pageData.selItemList[i]);
                else
                    this.pageData.productList.push(this.pageData.selItemList[i]);
                this.pageData.selItemList.splice(i, 1);
            }
            this.updatePrintTable(this.pageData.selItemList);
        }catch(err){
            this.global.addException('print label','cancle()',err);
        } 
    }

    printPreview(id): void {
        this.admin.printPreview(id);
    }

    exportpdf(): void {
        // this.admin.printPreview('print-section');
        // let company_name = this.util.getCompanyName();
        this.exportDoc.downloadLabel('print-section');
    }
}
