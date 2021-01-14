import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HabitsService } from '../habits.service';

@Component({
  selector: 'app-newhabit',
  templateUrl: './newhabit.component.html',
  styleUrls: ['./newhabit.component.css']
})
export class NewhabitComponent implements OnInit {

  newHabitForm: FormGroup
  today

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private hbtSvc: HabitsService
  ) { }

  ngOnInit(): void {
    this.today = ''
    this.dateNow()
    this.newHabitForm = this.fb.group({
      title: this.fb.control('', Validators.required),
      parameter: this.fb.control('', Validators.required),
      unit: this.fb.control('', Validators.required),
      startdate: this.fb.control('',Validators.required),
      enddate: this.fb.control('', Validators.required)
    })
  }

  dateNow() {
    this.today = (new Date())
    console.log("Today's date: ", this.today)
  }
  
  async processNewHabit() {
    const startDate = this.newHabitForm.get('startdate').value
    const endDate = this.newHabitForm.get('enddate').value
     

    const newHabit = {
      title: this.newHabitForm.get('title').value,
      parameter: this.newHabitForm.get('parameter').value,
      unit: this.newHabitForm.get('unit').value,
      startdate: startDate.toISOString(),
      calendarStartDate: this.getStartDate(startDate),
      enddate: (endDate) ? endDate.toISOString():null,
      calendarEndDate: this.getEndDate(endDate)
     }
     
     console.log('New habit details: ', newHabit)

     const result = await this.hbtSvc.createHabit(newHabit)
     console.log(result)

     this.router.navigate(['/habits'])
  }

  getStartDate(date) {
    const year = date.getFullYear()
    const month = date.getMonth()+1
    const day = date.getDate()
    return `${year}-${month}-${day}`
  }

  getEndDate(date) {
    const year = date.getFullYear()
    let month = date.getMonth()+1
    if(month < 10){
      month = `0${month}`
    }
    const day = date.getDate()+1
    return `${year}${month}${day}`
  }
}
