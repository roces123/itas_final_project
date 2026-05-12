import { Component, inject, NgZone, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// Firebase Imports
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  loginData = {
    email: '',
    password: ''
  };

  rememberMe: boolean = false;
  
  // ✅ FIX: Added missing property for the template
  isLoading: boolean = false;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedEmail = localStorage.getItem('rememberedEmail');
      if (savedEmail) {
        this.loginData.email = savedEmail;
        this.rememberMe = true;
      }
    }
  }

  async onLogin() {
    const { email, password } = this.loginData;
    
    // ✅ Start loading
    this.isLoading = true;

    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const fbToken = await userCredential.user.getIdToken();

      this.http.post(`${environment.apiUrl}/auth/login`, {
        token: fbToken
      }).subscribe({
        next: (res: any) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('userRole', res.userRole);

            if (res.userData) {
              localStorage.setItem('userData', JSON.stringify(res.userData));
            }

            if (this.rememberMe) {
              localStorage.setItem('rememberedEmail', this.loginData.email);
            } else {
              localStorage.removeItem('rememberedEmail');
            }
          }

          // ✅ Stop loading on success
          this.isLoading = false;

          this.ngZone.run(() => {
            if (res.userRole === 'admin') {
              this.router.navigate(['/admin-dashboard']);
            } else {
              this.router.navigate(['/user-dashboard']);
            }
          });
        },
        error: (err: any) => {
          // ✅ Stop loading on error
          this.isLoading = false;
          console.error("❌ Backend login error:", err);
          alert("Authorization failed. Please try again.");
        }
      });

    } catch (error: any) {
      // ✅ Stop loading on Firebase error
      this.isLoading = false;
      console.error("❌ Firebase login error:", error);
      alert("Login failed: " + error.message);
    }
  }
}
