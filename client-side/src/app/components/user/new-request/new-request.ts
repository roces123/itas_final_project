import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './new-request.html',
})
export class NewRequestComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  requestData = {
    docType: '',
    claimingOption: 'digital',
    purpose: '',
    quantity: 1
  };

  isUploading = false;

  goBack() {
    this.router.navigate(['/user-dashboard']);
  }

  onSubmit() {
    // 1. Validation
    if (!this.requestData.docType || !this.requestData.purpose) {
      alert('Please fill out all required fields.');
      return;
    }

    this.isUploading = true;

    // 2. Setup Headers (Auth Token)
    const token = localStorage.getItem('token') || ''; 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    /**
     * 3. Construct JSON Body
     * Kailangang mag-match ito sa 'createRequest' controller sa backend mo:
     * const { documentType, reason, quantity, supabaseFileUrl } = req.body;
     */
    const body = {
      documentType: this.requestData.docType,
      reason: this.requestData.purpose,
      quantity: Number(this.requestData.quantity) || 1,
      supabaseFileUrl: '' // Empty string muna dahil wala ka pang separate upload route
    };

    // 4. Send POST Request to Render Backend
    // Ginamit ang backticks (`) at tamang API path
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
          
          if (err.status === 401) {
            alert('Unauthorized: Please login again.');
          } else if (err.status === 404) {
            alert('Route not found. Check if /api/requests exists in backend.');
          } else {
            alert('Server error. Please try again later.');
          }
        }
      });
  }
}