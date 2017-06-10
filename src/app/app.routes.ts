import {Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {OrdersBoardComponent} from './orders-board/orders-board.component';

export const ROUTES: Routes = [
  // Main redirect
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  // App views
  {path: '', component: LoginComponent},
  {path: 'login', component: LoginComponent},
  {path: 'orders', component: OrdersBoardComponent},
  {path: '**',  redirectTo: 'login'}
];
