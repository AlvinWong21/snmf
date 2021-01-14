import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HabitsService } from '../habits.service';
import { LoginService } from '../login.services';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css']
})
export class HabitsComponent implements OnInit {

  habitList = []
  habit = false
  quote = ''

  constructor(
    private router: Router,
    private hbtSvc: HabitsService,
    private lgnSvc: LoginService
  ) { }

  ngOnInit(): void {
    this.habitList = []
    this.queryHabits()
  }

  async queryHabits() {
    const queryResult = await this.hbtSvc.queryHabits()
    this.habitList = queryResult[0]
    this.quote = queryResult[1]
    console.log(queryResult)
  }

  async viewHabit(id) {
    this.router.navigate([`/habit/${id}`])
  }

  logout() {
    this.lgnSvc.logout()
  }
}
