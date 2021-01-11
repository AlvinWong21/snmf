import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../login.services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private loginSvc: LoginService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: this.fb.control('', Validators.required),
      password: this.fb.control('', Validators.required)
    })
  }

  async login() {
    const loginCred = { 
      username: this.loginForm.get('username').value, 
      password: this.loginForm.get('password').value 
    }
    
    console.info(loginCred)
    const login = await this.loginSvc.loginLocal(loginCred)
    console.log(login)
    this.router.navigate(['/habits'])
    
  }
  
  // async loginGoogle() {
  //   const login = await this.loginSvc.loginGoogle()
  //   console.log(login)
  //   this.router.navigate(['/habits'])
  // }
  //set route guard and routing to habitscomponent
}
