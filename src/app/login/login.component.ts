import { Component, OnInit } from '@angular/core';
import { Http, RequestOptions, Headers} from '@angular/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  authInfo: any;
  username: string;
  password: string;
  loginError = false;
  errorMessage = '';

  tokenUrl = 'http://cat.avtokompaniya.ru/api/Token';
  constructor(private http: Http, private router: Router) { }

  ngOnInit() {
  }

  login() {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = new RequestOptions( {headers: headers });
    const body = `grant_type=password&username=${this.username}&password=${this.password}`;
      this.http.post(this.tokenUrl, body, options)
      .map(res => res.json())
      .subscribe(
        authInfo => {
          this.authInfo = authInfo;
          console.log(authInfo);
          authInfo.dashboardUsername = this.username;
          localStorage.setItem('currentUser', JSON.stringify(authInfo));
          this.router.navigate(['orders']);
        },
        error => {
          this.loginError = true;
          this.errorMessage = 'Login error. User not found';
          console.log(`Sign in error: ${error.message}`);
        }
      );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['login']);
  }
}
