import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore'; 
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.services'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  private auth = inject(Auth);
  private firestore = inject(Firestore); 
  private authService = inject(AuthService); 
  private router = inject(Router);

  registerData = {
    fullName: '',
    email: '',
    phone: '', // Ito ang gagamitin sa ngModel
    password: '',
    confirmPassword: '',
    studentId: '',
    course: ''
  };

  async onRegister() {
    const email = this.registerData.email.trim().toLowerCase();
    
    if (!email.endsWith('@isufst.edu.ph')) {
      alert("Please use your official @isufst.edu.ph email.");
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      console.log("Starting Registration...");
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, this.registerData.password);
      const uid = userCredential.user.uid;

      // 1. Direct Firestore Write - Ginamit ang 'phoneNumber' para mag-match sa DB structure
      const userDocRef = doc(this.firestore, 'users', uid);
      await setDoc(userDocRef, {
        fullName: this.registerData.fullName.trim(),
        email: email,
        studentId: this.registerData.studentId.trim(),
        course: this.registerData.course,
        phoneNumber: this.registerData.phone, // In-update ang key name
        role: 'student',
        createdAt: new Date()
      });

      // 2. Backend Sync Payload - Siniguro na 'phoneNumber' ang ipapadala sa API
      const backendPayload = {
        firebaseUid: uid,
        fullName: this.registerData.fullName.trim(),
        email: email,
        studentId: this.registerData.studentId,
        course: this.registerData.course,
        phoneNumber: this.registerData.phone // Match sa 'phoneNumber' sa auth.controllers
      };

      this.authService.register(backendPayload).subscribe({
        next: (res: any) => {
          alert("Registration Successful!");
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error("Backend Sync Error:", err);
          alert("Registration Complete (Firestore Saved).");
          this.router.navigate(['/login']);
        }
      });

    } catch (error: any) {
      console.error("Registration Process Error:", error);
      alert("Error: " + error.message);
    }
  }

  getPasswordStrength(): number {
    const pw = this.registerData.password;
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s += 25;
    if (/[A-Z]/.test(pw)) s += 25;
    if (/[0-9]/.test(pw)) s += 25;
    if (/[!@#$%^&*]/.test(pw)) s += 25;
    return s;
  }
}