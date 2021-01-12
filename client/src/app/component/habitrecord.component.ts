import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { HabitsService } from '../habits.service';
import * as moment from 'moment';

@Component({
  selector: 'app-habitrecord',
  templateUrl: './habitrecord.component.html',
  styleUrls: ['./habitrecord.component.css']
})
export class HabitrecordComponent implements OnInit {

  recordForm: FormGroup
  template
  // today
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
    this.template = this.startdate = this.enddate = ''
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
    })

  }

  async getTemplate(hId) {
    this.template = await this.hbtSvc.getTemplate(hId)
    this.startdate = moment.utc(this.template['startdate'])['_d']
    this.enddate = moment.utc(this.template['enddate'])['_d']

  }
  
  async processForm() {
    const record = {
      hId: this.template['habitId'],
      value: this.recordForm.get('value').value,
      date: this.recordForm.get('date').value.toISOString(),
      comments: this.recordForm.get('comments').value
    }

    console.log("data prepared: ", record)

    const result = await this.hbtSvc.createRecord(record)
    console.log(result)

    this.router.navigate(['/habit', this.template['habitId']])
  }
}
