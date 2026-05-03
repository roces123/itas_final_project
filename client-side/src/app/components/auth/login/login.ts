import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // Siguraduhing nandito ang Router

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };

  // I-inject ang Router sa constructor
  constructor(private router: Router) {}

  onLogin() {
    console.log('Login attempt:', this.loginData);

    if (this.loginData.email === 'admin@isufst.edu.ph' && this.loginData.password === 'admin123') {
      
      this.router.navigate(['/admin-dashboard']);
      
    } else if (this.loginData.email.endsWith('@isufst.edu.ph')) {
      
      this.router.navigate(['/dashboard']);
      
    } else {
      alert('Invalid credentials! Please use your ISUFST email.');
    }
  }
}