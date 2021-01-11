import { query } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Habits, HabitsService } from '../habits.service';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css']
})
export class HabitsComponent implements OnInit {

  habitList
  habit = false

  constructor(
    private router: Router,
    private hbtSvc: HabitsService
  ) { }

  ngOnInit(): void {
    this.habitList = []
    this.queryHabits()
    console.log(this.habitList)
  }

  async queryHabits() {
    const queryResult = await this.hbtSvc.queryHabits()
    this.habitList = queryResult
    console.log(queryResult)
  }

  async viewHabit(id) {
    // await this.hbtSvc.
    // console.log(title)
    this.router.navigate([`/habit/${id}`])
  }
}