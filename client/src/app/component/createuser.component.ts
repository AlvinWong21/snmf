import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateUserService } from '../createuser.service';

@Component({
  selector: 'app-createuser',
  templateUrl: './createuser.component.html',
  styleUrls: ['./createuser.component.css']
})
export class CreateuserComponent implements OnInit {

  newUserForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private newUsrSvc: CreateUserService
  ) { }

  ngOnInit(): void {
    this.newUserForm = this.fb.group({
      username: this.fb.control('', Validators.required),
      password: this.fb.control('', Validators.required),
      firstname: this.fb.control('', Validators.required),
      lastname: this.fb.control('', Validators.required),
      email: this.fb.control('', [Validators.required, Validators.email]),
      gender: this.fb.control('',Validators.required)
    })
  }

  async processNewUser() {
    const newUserCred = {
      username: this.newUserForm.get('username').value,
      password: this.newUserForm.get('password').value,
      firstname: this.newUserForm.get('firstname').value,
      lastname: this.newUserForm.get('lastname').value,
      email: this.newUserForm.get('email').value,
      gender: this.newUserForm.get('gender').value,
    }
    console.log(newUserCred)
    await this.newUsrSvc.createUser(newUserCred)
  }

}
