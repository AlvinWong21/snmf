import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './component/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { HabitsComponent } from './component/habits.component';
import { HabitviewComponent } from './component/habitview.component';
import { HabitrecordComponent } from './component/habitrecord.component';
import { LoginService } from './login.services';
import { ErrorComponent } from './component/error.component';
import { FlexLayoutModule } from '@angular/flex-layout';

import {InputTextModule} from 'primeng/inputtext';
import {CalendarModule} from 'primeng/calendar';

import { HabitsService } from './habits.service';
import { CreateuserComponent } from './component/createuser.component';
import { CreateUserService } from './createuser.service';
import { NewhabitComponent } from './component/newhabit.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const ROUTES: Routes = [
  { path: '', component: LoginComponent },
  { path: 'createuser', component: CreateuserComponent },
{ path: 'habits', component: HabitsComponent, canActivate: [LoginService] },
  { path: 'habit/:id', component: HabitviewComponent, canActivate: [LoginService] },
  { path: 'newhabit', component: NewhabitComponent, canActivate: [LoginService] },
  { path: 'newrecord/:id', component: HabitrecordComponent, canActivate: [LoginService] },
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
]
  
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HabitsComponent,
    HabitviewComponent,
    HabitrecordComponent,
    ErrorComponent,
    CreateuserComponent,
    NewhabitComponent
  ],
  imports: [
    BrowserModule, HttpClientModule, BrowserAnimationsModule,
    FormsModule, ReactiveFormsModule, FlexLayoutModule,
    RouterModule.forRoot(ROUTES),
    InputTextModule, CalendarModule
  ],
  providers: [LoginService, HabitsService, CreateUserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
