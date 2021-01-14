import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HabitsService } from '../habits.service';
import { LoginService } from '../login.services';

@Component({
  selector: 'app-habitview',
  templateUrl: './habitview.component.html',
  styleUrls: ['./habitview.component.css']
})
export class HabitviewComponent implements OnInit {

  habitRecords
  template
  habitId = ''
  totalProgress: number = 0

  dateForm: FormGroup
  recordDates = []

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private hbtSvc: HabitsService,
    private lgnSvc: LoginService
  ) { }

  ngOnInit(): void {
    
    this.habitId = this.activatedRoute.snapshot.params.id
    this.getTemplate(this.habitId) 
    this.queryRecords(this.habitId)
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

  logout() {
    this.lgnSvc.logout()
  }
}
