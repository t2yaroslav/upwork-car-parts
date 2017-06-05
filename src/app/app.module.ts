import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
// import { ClipboardModule } from 'angular2-clipboard';
import {DataTableModule, SharedModule, DropdownModule, ListboxModule,
OverlayPanelModule, ChipsModule, InputTextModule, ButtonModule, CheckboxModule, ToolbarModule} from 'primeng/primeng';
import { ODataConfiguration, ODataServiceFactory, ODataService } from 'angular2-odata';

import { AppComponent } from './app.component';
import { OrdersBoardComponent } from './orders-board/orders-board.component';

@Injectable()
export class MyODataConfig extends ODataConfiguration {
    baseUrl= 'http://dev.avtokompaniya.ru/api/';
}

@NgModule({
  declarations: [
    AppComponent,
    OrdersBoardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    DataTableModule,
    SharedModule,
    DropdownModule,
    ListboxModule,
    OverlayPanelModule,
    ChipsModule,
    ToolbarModule,
  ],
  // providers: [ { provide: ODataConfiguration, useFactory: () => { 
  //       const odta = new ODataConfiguration();
  //       odta.baseUrl = 'http://dev.avtokompaniya.ru/api/';
  //       return odta; }
  //   }, ODataServiceFactory ],
  providers: [ ],
  bootstrap: [AppComponent]
})
export class AppModule { }
