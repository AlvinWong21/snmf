import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as moment from 'moment';
import { LoginService } from "./login.services";

export interface Habits {
    id: number,
    title: string,
    startdate: Date,
    enddate: Date
}

export interface Templates {
    habitId: number,
    title: string,
    parameter: string,
    unit: string,
    startdate: Date,
    enddate: Date
}

export interface Records {
    date: Date,
    value: number,
    comments: string,
    recordID: string
}

@Injectable()
export class HabitsService {

    constructor(
        private http: HttpClient,
        private lgnSvc: LoginService
    ) { }

    //get list of habits from database
    queryHabits(): Promise<any> {
        const headers = (new HttpHeaders()).set('Authorization', this.lgnSvc.token)
        return this.http.get<any>('http://localhost:3000/queryhabits', {headers: headers})
        .toPromise()
        .then(result => { 
            console.log(result)
            const habitList = result[0].map(h => {
                return {
                    id: h['habit_id'],
                    title: h['habit_title'],
                    startdate: moment.utc(h['start_date'])['_d'],
                    enddate: moment.utc(h['end_date'])['_d']
                } as Habits
            })
            console.log('Mapped: ', habitList)
            const quote = result[1]
            console.log(quote)

            const returnResult = [habitList, quote]
            console.log(habitList, quote)
            return returnResult
        })
        .catch(err => {
            console.log(err)
        })
    }
    
    //create new habit to database
    createHabit(newHabit: object): Promise<any> {
        const headers = (new HttpHeaders()).set('Authorization', this.lgnSvc.token)
        console.log(newHabit)
        return this.http.post<any>('http://localhost:3000/createhabit', newHabit, {headers: headers})
        .toPromise()
        .then(result => {
            console.log('Create Habit Successful: ', result)
            return result
        })
        .catch(err => {
            if (err.status == 401) {
                console.info('Create Habit Error: ', err.error.message)
                return err
            }
            if (err.status == 409) {
                console.info('Create Habit Error: ', err.error.message)
                return err
            }
        })
    }

    getTemplate(id: string): Promise<any> {
        const headers = (new HttpHeaders()).set('Authorization', this.lgnSvc.token)
        const hId = id
        console.log(`http://localhost:3000/template/${hId}`)
        return this.http.get<any>(`http://localhost:3000/template/${hId}`, {headers: headers}).toPromise()
        .then(result => {
            const mappedTemplate = {
                    habitId: result['habit_id'],
                    title: result['habit_title'],
                    parameter: result['parameter'],
                    unit: result['unit'],
                    startdate: moment.utc(result['start_date'])['_d'],
                    enddate: moment.utc(result['end_date'])['_d']
                } as Templates
            console.log("Mapped template: ", mappedTemplate)
            return mappedTemplate
        })
        .catch(err => {
            console.log(err)
        })
    }

    createRecord(record: object): Promise<any> {
        const headers = (new HttpHeaders()).set('Authorization', this.lgnSvc.token)
        console.log(record)
        return this.http.post('http://localhost:3000/createrecord', record, {headers: headers}).toPromise()
        .then(result => {
            console.log(result)
            return result
        })
        .catch(err => {
            console.log(err)
        })
    }

    queryRecords(hId: string): Promise<any> {
        const headers = (new HttpHeaders()).set('Authorization', this.lgnSvc.token)
        return this.http.get(`http://localhost:3000/queryrecords/${hId}`, {headers: headers}).toPromise()
        .then(result => { 
            const mappedRecords = result[0]['records'].map( r=> {
            return {
                date: moment.utc(r['date'])['_d'],
                value: r['value'],
                comments: r['comments'],
                recordID: r['recordID']
            }as Records
        })
            console.log("Habit service query records: ", result)
            console.log("Mapped records: ", mappedRecords)
            return mappedRecords
        })
        .catch(err => {
            console.log(err)
        })
    }
}