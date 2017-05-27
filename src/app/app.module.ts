import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { InputTextModule, ButtonModule, CheckboxModule } from 'primeng/primeng';
import {DataTableModule, SharedModule, DropdownModule} from 'primeng/primeng';

import { AppComponent } from './app.component';
import { OrdersBoardComponent } from './orders-board/orders-board.component';

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
    DropdownModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
