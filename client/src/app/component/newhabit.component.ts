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
      frequency: this.fb.control(''),
      startdate: this.fb.control('',Validators.required),
      enddate: this.fb.control('')
    })
  }

  dateNow() {
    this.today = (new Date())
    console.log("Today's date: ", this.today)
  }
  
  async processNewHabit() {
     const newHabit = {
       title: this.newHabitForm.get('title').value,
       parameter: this.newHabitForm.get('parameter').value,
       unit: this.newHabitForm.get('unit').value,
       startdate: this.newHabitForm.get('startdate').value.toISOString(),
       enddate: (this.newHabitForm.get('enddate').value) ? this.newHabitForm.get('enddate').value.toISOString():null,
       frequency: this.newHabitForm.get('frequency').value
     }
     
     console.log('New habit details: ', newHabit)

     const result = await this.hbtSvc.createHabit(newHabit)
     console.log(result)

     this.router.navigate(['/habits'])
  }
}
