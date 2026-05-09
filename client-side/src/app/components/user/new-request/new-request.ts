import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
// Firebase Imports (Keep these if you still use them elsewhere, but submission goes to Render)
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth'; 
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './new-request.html',
})
export class NewRequestComponent {
  private http = inject(HttpClient);
  private firestore = inject(Firestore);
  private auth = inject(Auth); 
  private router = inject(Router);

  requestData = {
    docType: '',
    claimingOption: 'digital',
    purpose: ''
  };

  selectedFile: File | null = null;
  isUploading = false;

  // IMPORTANT: Keep this to avoid TS2339 error in HTML
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  goBack() {
    this.router.navigate(['/user-dashboard']);
  }

  async onSubmit() {
    // 1. Validation
    if (!this.requestData.docType || !this.requestData.purpose) {
      alert('Please fill out all required fields.');
      return;
    }

    this.isUploading = true;

    // 2. Setup Headers
    const token = localStorage.getItem('token') || ''; 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    /**
     * 3. Construct JSON Body
     * Ito dapat ay mag-match sa req.body ng iyong Backend Controller:
     * { documentType, reason, quantity, supabaseFileUrl }
     */
    const body = {
      documentType: this.requestData.docType,
      reason: this.requestData.purpose,
      quantity: 1,
      supabaseFileUrl: '' // Empty string muna since JSON ang gamit ng backend mo
    };

    /**
     * 4. POST to Backend (Render)
     * Inalis ang .replace('/auth', '') at pinalitan ng /api/requests
     */
    this.http.post(`${environment.apiUrl}/api/requests`, body, { headers })
      .subscribe({
        next: (res: any) => {
          console.log('Success:', res);
          alert('Request Submitted Successfully!');
          this.router.navigate(['/user-dashboard']);
        },
        error: (err) => {
          console.error('Submit Error:', err);
          this.isUploading = false;
          const errorMsg = err.status === 401 ? 'Unauthorized: Please login again.' : 'Server error. Check if the route exists.';
          alert(errorMsg);
        }
      });
  }
}