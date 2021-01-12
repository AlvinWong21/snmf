import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

@Injectable()
export class LoginService implements CanActivate {

    token: string = ''

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    loginLocal(loginCred: object): Promise<boolean> {
        this.token = ''
        return this.http.post<any>('http://localhost:3000/auth/local', loginCred)
        .toPromise()
        .then(result => {
                console.info('Login Response: ', result)
                this.token = result.token
            console.log('Login Token: ', this.token)
            return true
        })
        .catch(err => {
            if (err.status == 401) {
                console.info('Login Error: ', err.error)
                return false
            }
        })
        
    }

    async loginGoogle() {
        return await this.http.get('http://localhost:3000/auth/google')
        
    }

    isLogin() {
        const token = this.token != ''
        console.log(this.token)
        console.log(token)
        return token
    }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) {
        if (this.isLogin()) {
            return true
        }

        return this.router.parseUrl('/error')
    }
}