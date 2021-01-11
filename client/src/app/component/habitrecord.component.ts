import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { HabitsService } from '../habits.service';

@Component({
  selector: 'app-habitrecord',
  templateUrl: './habitrecord.component.html',
  styleUrls: ['./habitrecord.component.css']
})
export class HabitrecordComponent implements OnInit {

  recordForm: FormGroup
  template
  today
  startdate
  enddate

  history: string[] = []

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private hbtSvc: HabitsService
  ) { }

  ngOnInit(): void {
    this.template = this.today = this.startdate = this.enddate = ''
    const hId = this.activatedRoute.snapshot.params.id
    console.log(hId)

    const prevRoute = this.activatedRoute
    console.log(prevRoute)

    this.getTemplate(hId)

    console.log(this.template)

    this.recordForm = this.fb.group({
      value: this.fb.control('', Validators.required),
      date: this.fb.control('', Validators.required),
      comments: this.fb.control(''),
      // file: this.fb.control('')
    })

  }

  async getTemplate(hId) {
    this.template = await this.hbtSvc.getTemplate(hId)
    console.log(this.template)
    
    this.startdate = this.template['start_date'].slice(0, 10)
    console.log(this.startdate)
    console.log("end date: ", this.template['end_date'])
    if(null != this.template['end_date']) {
      this.enddate = this.template['end_date'].slice(0, 10)
      console.log("end date: ", this.enddate)
    }
    const currDate = (new Date()).toISOString()
    const date = currDate < this.template['start_date']
    if (currDate < this.template['start_date']) {
      this.today = this.startdate
    }
    else {
      this.today = currDate.slice(0, 10)
    }
    
  }
  
  async processForm() {
    const record = {
      hId: this.template['habit_id'],
      value: this.recordForm.get('value').value,
      date: this.recordForm.get('date').value,
      comments: this.recordForm.get('comments').value
    }

    console.log("data prepared: ", record)

    const result = await this.hbtSvc.createRecord(record)
    console.log(result)

    this.router.navigate(['/habit', this.template['habit_id']])
    // const formData = new FormData
    // formData.set('hId', this.template['habit_id'])
    // formData.set('value', this.recordForm.get('value').value)
    // formData.set('date', this.recordForm.get('date').value)
    // formData.set('comments', this.recordForm.get('comments').value)
    // formData.set('file', this.recordForm.get('file').value)

    // console.log(formData.get('hId'))
    // console.log(formData.get('value'))
    // console.log(formData.get('date'))
    // console.log(formData.get('comments'))
    // console.log(formData.get('file'))
    
  }
}
