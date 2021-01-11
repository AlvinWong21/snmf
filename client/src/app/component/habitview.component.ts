import { Component, OnInit } from '@angular/core';
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

  constructor(
    private activatedRoute: ActivatedRoute,
    private hbtSvc: HabitsService
  ) { }

  ngOnInit(): void {
    this.habitId = this.activatedRoute.snapshot.params.id
    this.getTemplate(this.habitId) 
    this.queryRecords(this.habitId)
    
  }

  async queryRecords(habitId: string) {
    const result = await this.hbtSvc.queryRecords(habitId)

    if (result == 0) {
      console.log(this.habitRecords)
      return
    }

    this.habitRecords = result[0].records
  }

  async getTemplate(habitId: string) {
    this.template = await this.hbtSvc.getTemplate(habitId)
    console.log(this.template)
  }
}
