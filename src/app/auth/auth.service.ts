
import { Injectable } from '@angular/core';
//import { JwtHelper } from '@auth0/angular-jwt';
@Injectable()
export class AuthService {
	//public jwtHelper: JwtHelper
  	constructor() {}
  	// ...
  	public isAuthenticated(): boolean {
    	const token = atob(localStorage.getItem('KEY'));
    	// Check whether the token is expired and return
    	// true or false
      //console.log('AuthService ::'+!this.jwtHelper.isTokenExpired(token));
    	//return !this.jwtHelper.isTokenExpired(token);
    	return true;
  	}
}