import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

export interface Habits {
    id: number,
    title: string,
    startdate: Date
}

@Injectable()
export class HabitsService {

    constructor(
        private http: HttpClient
    ) { }

    //get list of habits from database
    queryHabits(): Promise<any> {
        return this.http.get<any>('http://localhost:3000/queryhabits')
        .toPromise()
        .then(result => { 
            const habitList = result['queryHabits'].map(h => {
                return {
                    id: h['habit_id'],
                    title: h['habit_title'],
                    startdate: h['start_date'].slice(0, 10)
                } as Habits
            })
            console.log('Mapped: ', habitList)
            return habitList
        })
        .catch(err => {
            console.log(err)
        })
    }
    
    //create new habit to database
    createHabit(newHabit: object): Promise<any> {
        return this.http.post<any>('http://localhost:3000/createhabit', newHabit)
        .toPromise()
        .then(result => {
            console.log('Create Habit Successful: ', result)
        })
        .catch(err => {
            if (err.status == 401) {
                console.info('Create Habit Error: ', err.error.message)
            }
            if (err.status == 409) {
                console.info('Create Habit Error: ', err.error.message)
            }
        })
    }

    //get from database the list of habits for a user
    async viewHabit(title: string): Promise<any> {
        return this.http.get<any>(`http://localhost:3000/viewhabit/${title}`)

    }

    getTemplate(id: string): Promise<any> {
        const hId = id
        console.log(`http://localhost:3000/template/${hId}`)
        // return await this.http.get<any>(`http://localhost:3000/template/${hId}`).toPromise()
        return this.http.get<any>(`http://localhost:3000/template/${hId}`).toPromise()
        .then(result => {
            console.log(result)
            return result})
        .catch(err => {
            console.log(err)
        })
    }

    createRecord(record: object): Promise<any> {
        console.log(record)
        return this.http.post('http://localhost:3000/createrecord', record).toPromise()
        .then(result => {
            console.log(result)
            return result
        })
        .catch(err => {
            console.log(err)
        })
    }

    queryRecords(hId: string): Promise<any> {
        return this.http.get(`http://localhost:3000/queryrecords/${hId}`).toPromise()
        .then(result => {
            console.log(result)
            return result
        })
        .catch(err => {
            console.log(err)
        })
    }
}