import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerData = {
    studentId: '',
    fullName: '',
    email: '',
    course: '',
    password: ''
  };

  constructor(private router: Router) {}

  onRegister() {
    console.log('Data to be sent to Node.js:', this.registerData);

    alert('Registration link triggered! Check console for data.');
  }
}