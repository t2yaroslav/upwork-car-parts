import { Component, OnInit } from '@angular/core';

import {CheckboxModule, DropdownModule} from 'primeng/primeng';
import {DataTableModule, SharedModule} from 'primeng/primeng';

import {Order} from '../models/order';

declare var XLSX;
declare var Workbook;
declare var saveAs;

@Component({
  selector: 'app-orders-board',
  templateUrl: './orders-board.component.html',
  styleUrls: ['./orders-board.component.css']
})

export class OrdersBoardComponent implements OnInit {
  selectedValues: string[] = [];
  suppliersFilter: string[] = ['lalavto', 'avtocompania', 'alex-avto'];

  orderStatuses: any[] = ['new', 'read', 'in work', 'started in 1s', 'sent to the supplier', 'came to the supplier'];

  orders: Order[] = [];
  selectedOrders: Order[] = [];

  constructor() { }

  ngOnInit() {
    // convert to dropdown required format
    this.orderStatuses = this.orderStatuses.map(status => {return{label: status, value: status}});

    console.log(JSON.stringify(this.orderStatuses));
    for (let index = 0; index < 9; index++) {
      this.orders.push({oreder_id: index, order_date: '25.04.2015', code: '5413',
      name: 'Wheel' , producer: 'Ruvile', quantity: '5',  price: '50',
      vendor_price: '52', balance: '2', delivery_time: '1 day', status: 'new'});
    }
  }

  onChangeSuppliersFilter(checked) {
    // console.log(JSON.stringify(this.selectedValues));
  }

  onSelectionChange() {
    // setTimeout(() => console.log(JSON.stringify(this.selectedOrders)), 1000);
  }

  onStatusChange(order) {
    if (this.selectedOrders.includes(order)) {
      this.selectedOrders.forEach(element => element.status = order.status);
    }
  }

  datenum(v, date1904 = null) {
    if (date1904) {v += 1462; }
    const epoch = Date.parse(v);
    return (epoch - (new Date(Date.UTC(1899, 11, 30))).getTime()) / (24 * 60 * 60 * 1000);
  }


  sheetFromArrayOfArrays(data: Order[], opts = null) {
    let keysArray = [];
    if (data && data.length > 0) {
      keysArray = Object.keys(data[0]);
    }

    const ws = {};
    const range = {s: {c: 10000000, r: 10000000}, e: {c: 0 , r: 0 }};

    for (let R = 0; R != data.length; ++R) {
      for (let C = 0; C != keysArray.length; ++C) {
        if (range.s.r > R) {range.s.r = R; }
        if (range.s.c > C) {range.s.c = C; }
        if (range.e.r < R) {range.e.r = R; }
        if (range.e.c < C) {range.e.c = C; }
        const cell = {v: data[R][keysArray[C]] , t: '', z: ''};

        if (cell.v == null) {continue; }
        const cell_ref = XLSX.utils.encode_cell({c: C, r: R});

        if (typeof cell.v === 'number') {
          cell.t = 'n';
        } else if (typeof cell.v === 'boolean') {
          cell.t = 'b';
        } else if (cell.v instanceof Date) {
          cell.t = 'n'; cell.z = XLSX.SSF._table[14];
          cell.v = this.datenum(cell.v);
        } else {
          cell.t = 's';
        }
        ws[cell_ref] = cell;
      }
    }
    if (range.s.c < 10000000) {
      ws['!ref'] = XLSX.utils.encode_range(range);
    }
    return ws;
  }

  // using https://www.npmjs.com/package/xlsx
  onExcellExport() {
    const wb = {
      SheetNames : [],
      Sheets : {}
    };
    const ws = this.sheetFromArrayOfArrays(this.orders);

    const ws_name = 'vlad';
    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    const wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary'});

    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i != s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xFF;
      };
      return buf;
    }
    saveAs(new Blob([s2ab(wbout)], {type: 'application/octet-stream'}), 'test.xlsx');
  }
}
