import { Component, OnInit } from '@angular/core';

import {CheckboxModule, DropdownModule, ToolbarModule} from 'primeng/primeng';
import {DataTableModule, SharedModule, ListboxModule, OverlayPanelModule, ChipsModule} from 'primeng/primeng';
import { ODataConfiguration, ODataServiceFactory, ODataService } from 'angular2-odata';
import {Order} from '../models/order';
import { Http, JsonpModule } from '@angular/http';

declare var XLSX;
declare var Workbook;
declare var saveAs;

@Component({
  selector: 'app-orders-board',
  templateUrl: './orders-board.component.html',
  styleUrls: ['./orders-board.component.css']
})

export class OrdersBoardComponent implements OnInit {
  private odata: ODataService<Order>;

  suppliersFilter: any[] = [];
  suppliersFilterSelected: any[] = [];

  statusesFilter: any[] = [];
  statusesFilterSelected: any[] = [];

  customersFilter: any[] = [];
  customersFilterSelected: any[] = [];

  orders: Order[] = [];
  selectedOrders: Order[] = [];
  totalOrders: Number = 10;

  constructor(
    private odataFactory: ODataServiceFactory,
    private http: Http
  ) {
    this.odata = this.odataFactory.CreateService<Order>('OrderItems');
  }

  ngOnInit() {
    // get totalOrders
    this.http.get('http://dev.avtokompaniya.ru/api/OrderItems/$count')
      .map(res => res.json())
      .subscribe(
        // convert to dropdown required format
        numberStr => this.totalOrders = +numberStr,
        error => console.log(`Fetch totalOrders error: ${error.message}`)
      );

    // prepare status filter
    this.http.get('http://dev.avtokompaniya.ru/api/Statuses')
      .map(res => res.json())
      .subscribe(
        // convert to dropdown required format
        statuses => this.statusesFilter = statuses.value.map(status => {return{label: status.Name, value: status.Id}}),
        error => console.log(`Fetch statuses error: ${error.message}`)
      );

    // prepare status filter
    this.http.get('http://dev.avtokompaniya.ru/api/Suppliers')
      .map(res => res.json())
      .subscribe(
        // convert to dropdown required format
        statuses => this.suppliersFilter = statuses.value.map(status => {return{label: status.Name, value: status.Id}}),
        error => console.log(`Fetch suppliers error: ${error.message}`)
      );

    // prepare customers filter
    this.http.get('http://dev.avtokompaniya.ru/api/Customers')
      .map(res => res.json())
      .subscribe(
        // convert to dropdown required format
        statuses => this.customersFilter = statuses.value.map(status => {return{label: status.Name, value: status.Id}}),
        error => console.log(`Fetch customers error: ${error.message}`)
      );
  }

  onChangeSuppliersFilter(checked) {
    console.log(JSON.stringify(this.suppliersFilterSelected));
  }

  onChangeStatusesFilter() {
    console.log(JSON.stringify(this.statusesFilterSelected));
  }

  onChangeCustomersFilter() {
    console.log(JSON.stringify(this.customersFilterSelected));
    console.log(this.prepareOdataFilterString());
  }

  onSelectionChange() {
    // setTimeout(() => console.log(JSON.stringify(this.selectedOrders)), 1000);
  }

  onStatusChange(order) {
    if (this.selectedOrders.includes(order)) {
      this.selectedOrders.forEach(element => element.Status = order.Status);
    }
  }

  prepareOdataFilterString(): string {
    let filters = [];

    if (this.customersFilterSelected.length > 0) {
      let customerFilter = this.customersFilterSelected.reduce((prevVal, currItem) => `${prevVal} CustomerId eq ${currItem} or` , '(');
      customerFilter = `${customerFilter.slice(0, -2)} )`;
      filters.push(customerFilter);
    }

    if (this.statusesFilterSelected.length > 0) {
      let statusFilter = this.statusesFilterSelected.reduce((prevVal, currItem) => `${prevVal} Status eq ${currItem} or` , '(');
      statusFilter = `${statusFilter.slice(0, -2)} )`;
      filters.push(statusFilter);
    }

    if (this.suppliersFilterSelected.length > 0) {
      let suplierFilter = this.suppliersFilterSelected.reduce((prevVal, currItem) => `${prevVal} SuppliersId eq ${currItem} or` , '(');
      suplierFilter = `${suplierFilter.slice(0, -2)} )`;
      filters.push(suplierFilter);
    }

    if (filters.length === 0) {return ''; }
    let result = '';
    if (filters.length === 1) {
      result = filters[0];
    } else {
      result = filters.join(' and ');
    }

    console.log(`result ${result}`);
    return result;
  }

  onApplyFilters() {
    console.log('onApplyFilters');
        this.odata
        .Query()// Creates a query object
        // .Top(event.rows)
        // .Skip(event.first)
        // .Expand("Comment,From")
        // .OrderBy("SendDate desc")
        .Filter(this.prepareOdataFilterString())
        .Exec()                     // Fires the request
        .subscribe(                 // Subscribes to Observable<Array<T>>
        orders => {
            this.orders = orders;
        },
        error => {
            console.log('oData load orders error');
        });
  }

  loadOrdersLazy(event) {
    console.log('load orders lazy');

    this.odata
        .Query()// Creates a query object
        .Top(event.rows)
        .Skip(event.first)
        // .Expand("Comment,From")
        // .OrderBy("SendDate desc")
        .Filter(this.prepareOdataFilterString())
        .Exec()                     // Fires the request
        .subscribe(                 // Subscribes to Observable<Array<T>>
        orders => {
            this.orders = orders;
        },
        error => {
            console.log('oData load orders error');
        });
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
