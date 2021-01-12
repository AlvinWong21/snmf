import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HabitsService } from '../habits.service';

@Component({
  selector: 'app-habitview',
  templateUrl: './habitview.component.html',
  styleUrls: ['./habitview.component.css']
})
export class HabitviewComponent implements OnInit {

  habitRecords
  template
  habitId = ''
  totalProgress: number

  dateForm: FormGroup
  recordDates = []

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private hbtSvc: HabitsService
  ) { }

  ngOnInit(): void {
    
    this.habitId = this.activatedRoute.snapshot.params.id
    this.getTemplate(this.habitId) 
    this.queryRecords(this.habitId)

    // this.getRecordDates(this.habitRecords)
    // this.dateForm = this.fb.group({
    //   dates: this.fb.control('')
    // })    
  }

  async queryRecords(habitId: string) {
    const result = await this.hbtSvc.queryRecords(habitId)
    console.log(result)
    this.habitRecords = result

    this.recordDates = result.map(r => {
      return r.date
    })

    const resultValues = result.map(v => {
      return v.value
    })
    // console.log('values: ', result[0].value)
    this.totalProgress = resultValues.reduce((sum, x) => {
      return sum + x
    })

    console.log(this.recordDates)
    console.log(this.totalProgress)
  }

  async getTemplate(habitId: string) {
    this.template = await this.hbtSvc.getTemplate(habitId)
    console.log(this.template)
  }

  // getRecordDates(records) {
  //   return this.recordDates = records.map(r => {
  //     return r.dates
  //   } )
  // }

  // getDates() {
  //   let dates = this.dateForm.get('dates').value
  //   console.log(dates)

  //   dates = dates.toISOString()
  //   console.log("ISO String: ", dates)
  // }
}
