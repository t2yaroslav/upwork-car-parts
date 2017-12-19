import { Component, OnInit, ViewChild , ChangeDetectorRef,ViewEncapsulation} from '@angular/core';

import {CheckboxModule, DropdownModule, ToolbarModule, PaginatorModule} from 'primeng/primeng';
import {DataTableModule, DataTable, SharedModule, ListboxModule, OverlayPanelModule, ChipsModule} from 'primeng/primeng';
import {Order} from '../models/order';
import {Http, JsonpModule, RequestOptions, Headers, RequestMethod } from '@angular/http';
import {Router } from '@angular/router';
import {Clipboard} from 'ts-clipboard';
declare var XLSX;
declare var Workbook;
declare var saveAs;

@Component({
  selector: 'app-orders-board',
  templateUrl: './orders-board.component.html',
  styleUrls: ['./orders-board.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class OrdersBoardComponent implements OnInit {
  rowsPerPageOptions = [10, 20, 30, 40, 50];
  retrivedRows;
  retrivedSortField;

  suppliersFilter: any[] = [];
  suppliersFilterSelected: any[] = [];

  statusesFilter: any[] = [];
  statusesFilterSelected: any[] = [];

  customersFilter: any[] = [];
  customersFilterSelected: any[] = [];

  orders: Order[] = [];
  selectedOrders: Order[] = [];
  totalOrders: Number = 10;
  orderStatusesDropBox: any = [];

  apiPrefix = 'https://cat.avtokompaniya.ru/api';
  authKey;
  isResponsiveFlag = false;
  userName;
  access_token;

  @ViewChild(DataTable)
  private dataTable: DataTable;


  isResponsive(): Boolean {
    const screanWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    // console.log(screanWidth);
    if (screanWidth <= 768) {
      this.isResponsiveFlag = true;
      return true;
    }
    this.isResponsiveFlag = false;
    return false;
  }

  constructor(
    private http: Http,
    private router: Router,
    private ref: ChangeDetectorRef
  ) {
  }

  private authHeader() {
      // create authorization header with jwt token
      let headers = new Headers({ 'Authorization': 'Bearer ' + this.access_token });
      console.log(headers);
      // return new RequestOptions();
      return new RequestOptions({ headers: headers});
  }

  private getAuthInfo() {
    const cu = localStorage.getItem('currentUser');
    if (cu) {
      try {
        const currentUser = JSON.parse(cu);
        this.userName = currentUser.dashboardUsername;
        this.access_token = currentUser.access_token;
        if (!this.access_token) {
          this.router.navigate(['login']);
        }
      } catch (e) {
        console.log('Auth info. JSON parse error: ' + e);
        this.router.navigate(['login']);
      }
    }else {
      console.log('User not loggin on');
      this.router.navigate(['login']);
    }
  }

  retriveRowsFromLocStor() {
    const rows = localStorage.getItem('rows');
    if (rows && rows != null) {
      this.dataTable.rows = +rows;
      this.retrivedRows = +rows;
    } else {
      localStorage.setItem('rows', '10');
      this.dataTable.rows = 10;
      this.retrivedRows = 10;
    }
  }

  retriveSortFieldFromLocStor() {
    const field = localStorage.getItem('sortField');
    if (field && field != null) {
      this.dataTable.sortField = field;
      this.retrivedSortField = field;
    } else {
      this.retrivedSortField = undefined;
    }
  }

  ngOnInit() {
    this.getAuthInfo();
    const self = this;
    window.onresize = function(event) {
      self.isResponsive();
    };
    // get totalOrders
    console.log(this.authHeader());

    this.http.get(`${this.apiPrefix}/OrderItems/$count`, this.authHeader())
      .map(res => res.json())
      .subscribe(
        // convert to dropdown required format
        numberStr => this.totalOrders = +numberStr,
        error => console.log(`Fetch totalOrders error: ${error}`)
      );

    // prepare status filter
    this.http.get(`${this.apiPrefix}/Statuses`, this.authHeader())
      .map(res => res.json())
      .subscribe(
        // convert to dropdown required format
        statuses => this.orderStatusesDropBox = this.statusesFilter = statuses.value.map(
          status => {return{label: status.Name, value: status.Id}; }
          ),
        error => console.log(`Fetch statuses error: ${error}`)
      );

    // prepare status filter
    this.http.get(`${this.apiPrefix}/Suppliers`, this.authHeader())
      .map(res => res.json())
      .subscribe(
        // convert to dropdown required format
        statuses => this.suppliersFilter = statuses.value.map(status => {return{label: status.Name, value: status.Id}}),
        error => console.log(`Fetch suppliers error: ${error}`)
      );

    // prepare customers filter
    this.http.get(`${this.apiPrefix}/Customers`, this.authHeader())
      .map(res => res.json())
      .subscribe(
        // convert to dropdown required format
        statuses => this.customersFilter = statuses.value.map(status => {return{label: status.Name, value: status.Id}}),
        error => console.log(`Fetch customers error: ${error}`)
      );

      this.retriveFiltersFromLocalStore();
      this.retriveRowsFromLocStor();
      this.retriveSortFieldFromLocStor();

      setInterval(() => this.onApplyFilters(), 1000 * 60);
      this.dataTable.onSort.subscribe(
        n => {console.log('sort');}
      );
  }

  onChangeSuppliersFilter(checked) {
    console.log(JSON.stringify(this.suppliersFilterSelected));
    this.onApplyFilters();
  }

  onChangeStatusesFilter() {
    console.log(JSON.stringify(this.statusesFilterSelected));
    this.onApplyFilters();
  }

  onChangeCustomersFilter(event) {
    console.log(this.prepareOdataFilterString());
    this.onApplyFilters();
  }

  onSelectionChange() {
    // setTimeout(() => console.log(JSON.stringify(this.selectedOrders)), 1000);
  }

  onStatusChange(order) {
    console.log('onStatusChange');
    this.http.patch(`${this.apiPrefix}/OrderItems(${order.Id})`, {StatusId: order.Status}, this.authHeader())
            .map(res => res.json())
            .subscribe(
              resp => console.log(`update seccess : ${resp}`),
              error => console.log(`update error: ${error}`)
            );
    if (this.selectedOrders.includes(order)) {
      this.selectedOrders.forEach(
        element => {
          element.Status = order.Status;
          // send changes to server;
          this.http.patch(`${this.apiPrefix}/OrderItems(${element.Id})`, {StatusId: element.Status}, this.authHeader())
            .map(res => res.json())
            .subscribe(
              resp => console.log(`update seccess : ${resp}`),
              error => console.log(`update error: ${error}`)
            );
        });
    }
  }

  onPriceChange(order) {
    console.log('onPriceChange');
    console.log(JSON.stringify(order));
    this.http.patch(`${this.apiPrefix}/OrderItems(${order.Id})`, {PriceStr: order.Price}, this.authHeader())
    .map(res => res.json())
    .subscribe(
      resp => console.log(`update seccess : ${resp}`),
      error => console.log(`update error: ${error}`)
    );
  }

  onPriceVendorChange(order, price) {
    console.log(price);

    console.log('onPriceVendorChange');
    console.log(JSON.stringify(order));
    this.http.patch(`${this.apiPrefix}/OrderItems(${order.Id})`, {PriceVendorStr: order.PriceVendor}, this.authHeader())
    .map(res => res.json())
    .subscribe(
      resp => console.log(`update seccess : ${resp}`),
      error => console.log(`update error: ${error}`)
    );
  }

  prepareOdataFilterString(): string {
    let filters = [];

    if (this.customersFilterSelected.length > 0) {
      let customerFilter = this.customersFilterSelected.reduce((prevVal, currItem) => `${prevVal} CustomerId eq ${currItem} or` , '(');
      customerFilter = `${customerFilter.slice(0, -2)} )`;
      filters.push(customerFilter);
    }

    if (this.statusesFilterSelected.length > 0) {
      let statusFilter = this.statusesFilterSelected.reduce((prevVal, currItem) => `${prevVal} StatusId eq ${currItem} or` , '(');
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

  saveFiltersToLocalStore() {
    const temp = {
      suppliersFS: this.suppliersFilterSelected,
      statusesFS: this.statusesFilterSelected,
      customers: this.customersFilterSelected
    };
    localStorage.setItem('savedFilters', JSON.stringify(temp));
  }

  retriveFiltersFromLocalStore() {
    const sf = localStorage.getItem('savedFilters');
    if (sf) {
      const temp = JSON.parse(sf);
      this.suppliersFilterSelected = temp.suppliersFS;
      this.statusesFilterSelected = temp.statusesFS;
      this.customersFilterSelected = temp.customers;
    }
  }

  //12.06.2007
  dateFormat(dateString) {
    try {
      const date = new Date(Date.parse(dateString));

      let dateStr = date.getDate().toString();
      if (dateStr.length < 2) {
        dateStr = '0' + dateStr;
      }

      let monthStr = (date.getMonth() + 1).toString();
      if (monthStr.length < 2) {
        monthStr = '0' + monthStr;
      }

      const yearStr = date.getFullYear().toString().slice(2);

      return `${dateStr}.${monthStr}.${yearStr}`;
    } catch (e) {
      console.log('date parse error');
      return dateString;
    }
  }

  onApplyFilters() {

    this.saveFiltersToLocalStore();
    this.loadData();

    // console.log('onApplyFilters');
    // let filtersStr = this.prepareOdataFilterString();
    // if (filtersStr !== '') {
    //    filtersStr =  `$filter=${filtersStr}`;
    // }

    // this.http.get(`${this.apiPrefix}/OrderItems?${filtersStr}`, this.authHeader())
    //   .map(res => res.json())
    //   .subscribe(
    //     // convert to dropdown required format
    //     orderitems => this.orders = orderitems.value.map(o => {o.OrderDate = this.dateFormat(o.OrderDate); return o; }),
    //     error => console.log(`Fetch orderitems error: ${error.message}`)
    //   );
  }

  loadOrdersLazy(event) {
    if (this.retrivedRows != this.dataTable.rows) {
      localStorage.setItem('rows', this.dataTable.rows.toString());
    }

    if (this.retrivedSortField != event.sortField) {
      localStorage.setItem('sortField', event.sortField);
    }

    this.loadData();
//     console.log(this.dataTable.rows);
//     // console.log(this.dataTable.roes);

//     let filtersStr = this.prepareOdataFilterString();
//     if (filtersStr !== '') {
//        filtersStr =  `$filter=${filtersStr}`;
//     }

//     let orderString = '';
//     if (event.sortField) {
//       orderString = `$orderby=${event.sortField} ${event.sortOrder === 1 ? 'asc' : 'desc'}`;
//     }

// this.http.get(`${this.apiPrefix}/OrderItems?
// ${filtersStr}&
// $top=${event.rows}&
// $skip=${event.first}&
// ${orderString}`, this.authHeader())
//       .map(res => res.json())
//       .subscribe(
//         // convert to dropdown required format
//         orderitems => this.orders = orderitems.value.map(o => {o.OrderDate = this.dateFormat(o.OrderDate); return o; }),
//         error => console.log(`Fetch orderitems error: ${error.message}`)
//       );
  }

  loadData() {
    console.log('page ' + this.dataTable.pageLinks);
    let orderString = '';
    if (this.dataTable.sortField) {
      orderString = `&$orderby=${this.dataTable.sortField} ${this.dataTable.sortOrder === 1 ? 'asc' : 'desc'}`;
    }

    let filtersStr = this.prepareOdataFilterString();
    if (filtersStr !== '') {
       filtersStr =  `$filter=${filtersStr}&`;
    }

    this.http.get(`${this.apiPrefix}/OrderItems?
${filtersStr}
$top=${this.dataTable.rows}&
$skip=${this.dataTable.first}
${orderString}`, this.authHeader())
      .map(res => res.json())
      .subscribe(
        // convert to dropdown required format
        orderitems => this.orders = orderitems.value.map(o => {o.OrderDate = this.dateFormat(o.OrderDate); return o; }),
        error => console.log(`Fetch orderitems error: ${error.message}`)
      );
  }

  datenum(v, date1904 = null) {
    if (date1904) {v += 1462; }
    const epoch = Date.parse(v);
    return (epoch - (new Date(Date.UTC(1899, 11, 30))).getTime()) / (24 * 60 * 60 * 1000);
  }


  sheetFromArrayOfArrays(data: Order[], opts = null) {
    let keysArray = [];
    //var data = dataSrc.map()
    if (data && data.length > 0) {
      //keysArray = Object.keys(data[0]);
        keysArray.push("");
        keysArray.push("Suppliers");
        keysArray.push("Code");
        keysArray.push("Brand");
        keysArray.push("Name");
        keysArray.push("Count");
        keysArray.push("Price");
        keysArray.push("Price");
        keysArray.push("PriceVendor");
        keysArray.push("OrderDate");
        keysArray.push("Status");
        keysArray.push("CustomerId");
        keysArray.push("OrderId");
        keysArray.push("Id");

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

    const ws_name = 'export';
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
    saveAs(new Blob([s2ab(wbout)], {type: 'application/octet-stream'}), 'export.xlsx');
  }

  onCopyToClipboard() {
    Clipboard.copy(this.tableToCSV());
  }

  tableToCSV() {
        let data = this.dataTable.filteredValue || this.dataTable.value;
        // let csv = '\ufeff';
        let csv = '';
        // headers
        for(let i = 0; i < this.dataTable.columns.length; i++) {
            if(this.dataTable.columns[i].field) {
                csv += '"' + (this.dataTable.columns[i].header || this.dataTable.columns[i].field) + '"';

                if(i < (this.dataTable.columns.length - 1)) {
                    csv += this.dataTable.csvSeparator;
                }
            }
        }

        // body
        data.forEach((record, i) => {
            csv += '\n';
            for(let i = 0; i < this.dataTable.columns.length; i++) {
                if(this.dataTable.columns[i].field) {
                    csv += '"' + this.dataTable.resolveFieldData(record, this.dataTable.columns[i].field) + '"';

                    if(i < (this.dataTable.columns.length - 1)) {
                        csv += this.dataTable.csvSeparator;
                    }
                }
            }
        });
        return csv;
    }
}
