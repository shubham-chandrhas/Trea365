// Need to remove this file 
import { Injectable, Inject } from '@angular/core';

@Injectable()
export class SorterService {

        sort(arrayToSort, sortFunction) {
            if (arrayToSort.length <= 10)
                return this.insertionSort(arrayToSort, sortFunction);
            else return this.mergeSort(arrayToSort, sortFunction);
        };

        mergeSort(arr, sortFunction) {
            if (arr.length < 2)
                return arr;
            let arrLength: number = arr.length;
            let middle: number = parseInt((arrLength/2).toString());
            let left = arr.slice(0, middle);
            let right = arr.slice(middle, arr.length);
            return this.merge(this.mergeSort(left, sortFunction), this.mergeSort(right, sortFunction), sortFunction);
        };

        merge(left, right, sortFunction) {
            let result = [];

            while (left.length && right.length) {
                if (sortFunction(left[0], right[0]) < 1) {
                    result.push(left.shift());
                } else {
                    result.push(right.shift());
                }
            }

            while (left.length)
                result.push(left.shift());

            while (right.length)
                result.push(right.shift());

            console.log("arrayToSort");
            console.log(result);
            return result;
        };

        insertionSort(arrayToSort, sortFunction) {
            let arrLength = arrayToSort.length;
            let value;
            let i;
            let j;

            for (i = 0; i < arrLength; i++) {
                value = arrayToSort[i];
                for (j = i - 1; j > -1 && sortFunction(arrayToSort[j], value) == 1; j--)
                {
                    arrayToSort[j + 1] = arrayToSort[j];
                }
                arrayToSort[j + 1] = value;
            }
            console.log("arrayToSort");
            console.log(arrayToSort);
            return arrayToSort;
        };
    
    
}
   