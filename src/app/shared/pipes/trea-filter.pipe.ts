import * as _ from 'underscore';
import { NgModule, Pipe, PipeTransform } from '@angular/core';

import { SorterService } from "./../service/sorter.service";
import { ConstantsService } from "./../service/constants.service";

// Use to calculate list length
@Pipe({ name: 'listLengthfilter', pure: false })
export class ListLengthfilterPipe implements PipeTransform {
    constructor(private constant: ConstantsService){}
    transform(items: Array<any>, args: any[] = null): any {
        if (!items) { return 0; }
        if (items.length == 0) { this.constant.ITEM_COUNT = 0; }else{ this.constant.ITEM_COUNT = items.length; }
        return items.filter(item => item.count = items.length);
    }
}

//Global Search Filter @Param 1.Filter Name 2.Search text 3.Column Name
@Pipe({ name: 'searchfilter', pure: false })
export class SearchfilterPipe implements PipeTransform {
    transform(items: any[], filter: string, column: string): any {
        if (!items || !filter) { return items; }
        if(column.indexOf(',') > -1){
            let filteredList = [], columns = column.split(',');
            for (let i = 0; i < columns.length; i++) {
                filteredList = [...filteredList,...(items.filter(item => (typeof item[columns[i]] === "string" ? item[columns[i]].toLowerCase().indexOf(filter.toLowerCase()) : JSON.stringify(item[columns[i]]).indexOf(filter)) !== -1 ))];
            }
            return filteredList.reduce((x, y) => x.findIndex(e=>e == y)<0 ? [...x, y]: x, []);
        }else{
            return items.filter(item => (typeof item[column] === "string" ? item[column].toLowerCase().indexOf(filter.toLowerCase()) : JSON.stringify(item[column]).indexOf(filter)) !== -1);
        }
    }
}

// Global Sort Filter
// @Param 1.Column Name 2.Order(ASC/DSC) 3.Column Type(A/N)
// sortBy:sortColumn:sortOrder:sortColumnType
@Pipe({name: "sortBy"})
export class SortPipe {
    transform(array: Array<string>, args1: string, args2: string, args3: string): Array<string> {
        let list;
        if(array){
            if(args1 && args1 !== ''){
                if(args3 == 'A'){

                    list = _.sortBy(array, function (value) {
                      if(value[args1] == null) {
                        value[args1] ="";
                      }
                       return value[args1].toString().toLowerCase();
                      });
                }else{
                    list = _.sortBy(array, args1);
                }
            }
            if(args2 == 'DSC' || args2 == 'DEC'){
                list.reverse();
            }
        }
        return list;
    }
}


@Pipe({name: 'limitTo'})
export class TruncatePipe {
    transform(value: any, args: number) : Array<string> {
        // let limit = args.length > 0 ? parseInt(args[0], 10) : 10;
        // let trail = args.length > 1 ? args[1] : '...';
        //let limit = args ? parseInt(args, 10) : 10;
        //let trail = '...';
        console.log("args", args);
        return value.length > args ? value.splice(0, args) : value;
        //return value.length > limit ? value.substring(0, limit) + trail : value;
    }
}




