import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { InputTextModule, ButtonModule, CheckboxModule,ToolbarModule } from 'primeng/primeng';
import {DataTableModule, SharedModule, DropdownModule, ListboxModule, OverlayPanelModule, ChipsModule} from 'primeng/primeng';

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
    DropdownModule,
    ListboxModule,
    OverlayPanelModule,
    ChipsModule,
    ToolbarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
