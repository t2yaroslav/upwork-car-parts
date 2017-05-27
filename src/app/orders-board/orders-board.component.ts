import { Component, OnInit } from '@angular/core';

import {CheckboxModule, DropdownModule} from 'primeng/primeng';
import {DataTableModule, SharedModule} from 'primeng/primeng';

import {Order} from '../models/order';

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
    //convert to dropdown required format
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

}
