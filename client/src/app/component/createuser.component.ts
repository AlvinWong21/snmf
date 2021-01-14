import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateUserService } from '../createuser.service';

@Component({
  selector: 'app-createuser',
  templateUrl: './createuser.component.html',
  styleUrls: ['./createuser.component.css']
})
export class CreateuserComponent implements OnInit {

  newUserForm: FormGroup

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private newUsrSvc: CreateUserService
  ) { }

  ngOnInit(): void {
    this.newUserForm = this.fb.group({
      username: this.fb.control('', Validators.required),
      password: this.fb.control('', Validators.required),
      firstname: this.fb.control('', Validators.required),
      lastname: this.fb.control('', Validators.required),
      email: this.fb.control('', [Validators.required, Validators.email])
    })
  }

  async processNewUser() {
    const newUserCred = {
      username: this.newUserForm.get('username').value,
      password: this.newUserForm.get('password').value,
      firstname: this.newUserForm.get('firstname').value,
      lastname: this.newUserForm.get('lastname').value,
      email: this.newUserForm.get('email').value
    }
    console.log(newUserCred)
    const [result, message] = await this.newUsrSvc.createUser(newUserCred)
    console.log(result)
    if (!result) {
      alert(message)
     }
    if (result) {
      alert(message)
      this.router.navigate(['/'])
    }   
  }

}
