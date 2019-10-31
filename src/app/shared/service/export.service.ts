import { Injectable, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Angular2Csv } from 'angular2-csv/Angular2-csv';

import { UtilService } from './util.service';
// import * as html2canvas from 'html2canvas';

declare var $ :any;
declare var jsPDF: any; // Important

@Injectable()
export class ExportService {
    private date;
    private dateStr;
    private pageNo: number = 1;

    constructor(
        private util: UtilService
    ) {
        let datePipe = new DatePipe("en-US");
        this.date = datePipe.transform(new Date(), 'd MMM y, h:mm:ss a');
        this.dateStr = datePipe.transform(new Date(), '_dMMy_hmmss');
    }

    generatepdf(tableId, docHeader, docName, doc){
        let self = this;
        let res = doc.autoTableHtmlToJson(document.getElementById(tableId));
        var pageContent = function (data) {
            var str = "Page " + data.pageCount;
            doc.setFontSize(10);
            doc.text(str, (doc.internal.pageSize.width/2)-15, doc.internal.pageSize.height - 20);
        };

        let options: any = {
            margin: { horizontal: 0, top: 65 },
            bodyStyles: { valign: 'top', lineColor: [0, 0, 0], lineWidth: 0.1 },
            styles: { overflow: 'linebreak', columnWidth: 'wrap', lineColor: [0, 0, 0], lineWidth: 0.1 },
            columnStyles: { 1: { columnWidth: 'auto' } },
            theme: 'grid',
            tableLineWidth: 0.1,
            tableLineColor: [0, 0, 0],
            addPageContent: pageContent
        }

        doc.autoTable(res.columns, res.data, options ); //theme: 'striped', // 'striped', 'grid' or 'plain'
        //doc.addPage();
        doc.save(docName+self.dateStr+'.pdf');
    }

    generatePortraitpdf(tableId, docHeader, docName){
        let self = this;
        var doc = new jsPDF('p', 'pt', 'a4');
        self.pageNo = 1;
        doc.text(250, 35, docHeader);
        doc.setFontSize(10);
        doc.setFontStyle('normal');
        doc.text(40, 55, "Company Name: "+self.util.getCompanyName());
        doc.text(400, 55, "Date: "+self.date);
        //self.footer(doc, 'p');
        self.generatepdf(tableId, docHeader, docName, doc);
    }

    generateLandscapepdf(tableId, docHeader, docName){
        let self = this;
        var doc = new jsPDF('l', 'pt', 'a4');
        self.pageNo = 1;
        doc.text(400, 35, docHeader);
        doc.setFontSize(10);
        doc.setFontStyle('normal');
        doc.text(40, 55, "Company Name: "+self.util.getCompanyName());
        doc.text(655, 55, "Date: "+self.date);
        //self.footer(doc, 'l');
        self.generatepdf(tableId, docHeader, docName, doc);
    }

    footer(doc, mode){
        let self = this;
        if( mode == 'l' )
            doc.text(420, 580, 'Page ' + self.pageNo);
        else
            doc.text(290, 820, 'Page ' + self.pageNo);

        self.pageNo ++;
    };

    generatecsv(tableId, docName){
        let self = this;
        let doc = new jsPDF('p', 'pt', 'a4');
        let res = doc.autoTableHtmlToJson(document.getElementById(tableId));

        let header = [];
        let listArr = [];
        for(var key in res.columns){
            let columnsHdr = res.columns[key].innerText;
            header.push(columnsHdr);
            //header.push(columnsHdr.substring(0, columnsHdr.length - 1));
        }

        for(let row in res.data){
            let rowObj = {};
            let tempData: any = res.data[row];
            for (var key in tempData) {
                rowObj[key] = (tempData[key].innerText).trim();
            }
            listArr.push(rowObj);
        }

        let options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalseparator: '.',
            showLabels: true,
            showTitle: false,
            headers: header
        };
        new Angular2Csv(listArr, docName+self.dateStr, options);
    }

    downloadLabel(sectionId){
        // console.log(document.getElementById(sectionId).getElementsByTagName('img')[0]);

        var images = document.getElementById(sectionId).getElementsByTagName('img');
        console.log(images);
        // return true;
        var doc = new jsPDF();
        doc.text(80, 10, 'Print Tags');
        doc.setFontSize(10);
        doc.setFontStyle('normal');
        var x = 20;
        var y = 15;
        for (let index = 0; index < images.length; index++) {
            doc.addImage(images[index].src, 'png',x,y);

            if(y < 250){
              var y = y + 40;
            }else{
                var x = 20;
                var y = 15;
                doc.addPage();

            }
        }
        doc.save('label.pdf');
    }
}


