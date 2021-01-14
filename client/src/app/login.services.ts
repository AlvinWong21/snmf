import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

@Injectable()
export class LoginService implements CanActivate {

    token: string = ''
    googleToken: string = ''

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
                this.googleToken = null
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

    loginGoogle() {
        this.token = ''
        window.open('http://localhost:3000/auth/google')
        window.addEventListener('message', message => {
            console.log(message.data)
            this.token = message.data.token
            this.googleToken = message.data.token
            if (this.isLogin()) {
                this.router.navigate(['/habits'])
            }
        })
    }

    logout() {
        this.token = ''
        console.log(this.token)
        this.router.navigate(['/'])
        alert("You are logged out. Come back soon!")
    }

    isLogin() {
        const token = this.token != ''
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