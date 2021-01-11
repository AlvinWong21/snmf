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

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';

import {InputTextModule} from 'primeng/inputtext';
import {DataViewModule} from 'primeng/dataview';
import { HabitsService } from './habits.service';
import { CreateuserComponent } from './component/createuser.component';
import { CreateUserService } from './createuser.service';
import { NewhabitComponent } from './component/newhabit.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from '@angular/material/core';


const ROUTES: Routes = [
  { path: '', component: LoginComponent },
  { path: 'createuser', component: CreateuserComponent },
  { path: 'habits', component: HabitsComponent, /*canActivate: [LoginService]*/ },
  { path: 'habit/:id', component: HabitviewComponent },
  { path: 'newhabit', component: NewhabitComponent },
  { path: 'newrecord/:id', component: HabitrecordComponent },
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
    BrowserModule, HttpClientModule,
    FormsModule, ReactiveFormsModule, FlexLayoutModule,
    RouterModule.forRoot(ROUTES),

    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,


    InputTextModule, DataViewModule, BrowserAnimationsModule
  ],
  providers: [LoginService, HabitsService, CreateUserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
