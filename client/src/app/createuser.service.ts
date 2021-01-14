import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class CreateUserService {

    constructor(
        private http: HttpClient
    ) { }

    createUser(newUserCred: object): Promise<any> {
        const newUser = newUserCred
        console.log('createuser Service: ', newUser)
        return this.http.post<any>('http://localhost:3000/createuser', newUserCred)
        .toPromise()
        .then(result => {
            console.info('Create User Successful: ', result)
            return [true, result.message]
        })
        .catch(err => {
            if (err.status == 401) {
                console.info('Create User Error: ', err.error.message)
                return [false, err.error.message]
            }
            if (err.status == 409) {
                console.info('Create User Error: ', err.error.message)
                return [false, err.error.message]
            }
        })
    }
}