/**
 * Title: register.component.ts
 * Author: Professor Krasso
 * Date: 10/2023
 * Updated: 7/19/2024 by Brock Hemsouvanh
 */

import { Component, OnInit } from '@angular/core';
import { SecurityService } from 'src/app/security.service';
import { Router } from '@angular/router'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterViewModel } from './register-view-model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  securityQuestions: string[];
  qArr1: string[];
  qArr2: string[];
  qArr3: string[];
  qArr4: string[];

  user: RegisterViewModel;
  errorMessage: string;

  registerForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private securityService: SecurityService
  ) {
    this.securityQuestions = [
      "What is your mother's maiden name?",
      "What is the name of your first pet?",
      "What is your favorite color?",
      "What is your favorite movie?",
      "What is your favorite song?"
    ];

    this.qArr1 = this.securityQuestions;
    this.qArr2 = [];
    this.qArr3 = [];
    this.qArr4 = [];

    this.user = {} as RegisterViewModel;
    this.errorMessage = '';

    this.registerForm = this.fb.group({
      firstName: [null, Validators.compose([Validators.required])],
      lastName: [null, Validators.compose([Validators.required])],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.compose([Validators.required, Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[A-Z])[A-Za-z\\d]{8,}$')])],
      address: [null, Validators.compose([Validators.required])],
      phoneNumber: [null, Validators.compose([Validators.required])],
      question1: [null, Validators.compose([Validators.required])],
      answer1: [null, Validators.compose([Validators.required])],
      question2: [null, Validators.compose([Validators.required])],
      answer2: [null, Validators.compose([Validators.required])],
      question3: [null, Validators.compose([Validators.required])],
      answer3: [null, Validators.compose([Validators.required])],
      question4: [null, Validators.compose([Validators.required])],
      answer4: [null, Validators.compose([Validators.required])]
    });
  }

  ngOnInit(): void {
    this.registerForm.get('question1')?.valueChanges.subscribe(val => {
      this.qArr2 = this.qArr1.filter(q => q !== val);
    });

    this.registerForm.get('question2')?.valueChanges.subscribe(val => {
      this.qArr3 = this.qArr2.filter(q => q !== val);
    });

    this.registerForm.get('question3')?.valueChanges.subscribe(val => {
      this.qArr4 = this.qArr3.filter(q => q !== val);
    });

    this.registerForm.get('question4')?.valueChanges.subscribe(val => {
      // No fifth question array as it's removed
    });
  }

  register() {
    this.user = {
      firstName: this.registerForm.get('firstName')?.value,
      lastName: this.registerForm.get('lastName')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      address: this.registerForm.get('address')?.value,
      phoneNumber: this.registerForm.get('phoneNumber')?.value,
      selectedSecurityQuestions: [
        {
          questionText: this.registerForm.get('question1')?.value,
          answerText: this.registerForm.get('answer1')?.value
        },
        {
          questionText: this.registerForm.get('question2')?.value,
          answerText: this.registerForm.get('answer2')?.value
        },
        {
          questionText: this.registerForm.get('question3')?.value,
          answerText: this.registerForm.get('answer3')?.value
        },
        {
          questionText: this.registerForm.get('question4')?.value,
          answerText: this.registerForm.get('answer4')?.value
        }
      ]
    };

    this.securityService.register(this.user).subscribe({
      next: (result) => {
        this.router.navigate(['/signin']);
      },
      error: (err) => {
        if (err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Something went wrong. Please contact the system administrator';
        }
      }
    });
  }
}
