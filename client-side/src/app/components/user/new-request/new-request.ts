import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
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

  // Pinanatili para hindi mag-error ang Angular compiler sa HTML
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  goBack() {
    this.router.navigate(['/user-dashboard']);
  }

  async onSubmit() {
    // 1. Basic Validation
    if (!this.requestData.docType || !this.requestData.purpose) {
      alert('Please fill out all required fields.');
      return;
    }

    this.isUploading = true;

    // 2. Kunin ang User Information mula sa localStorage
    // Ito ang susi para hindi maging "Anonymous" sa database
    const rawUserData = localStorage.getItem('userData');
    const userData = rawUserData ? JSON.parse(rawUserData) : null;
    
    const userFullName = userData?.fullName || 'Anonymous Student';
    const userEmail = userData?.email || 'N/A';

    // 3. Setup Auth Headers
    const token = localStorage.getItem('token') || ''; 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    /**
     * 4. Construct JSON Body
     * Kasama na ang fullName at requestedBy para mabasa ng updated backend controller.
     */
    const body = {
      documentType: this.requestData.docType,
      reason: this.requestData.purpose,
      quantity: 1,
      supabaseFileUrl: '', 
      fullName: userFullName,  // Ipinapasa ang pangalan mula sa localStorage
      requestedBy: userEmail   // Ipinapasa ang email
    };

    /**
     * 5. POST to Render Backend
     * Gamit ang tamang API route (/api/requests) para maiwasan ang 404 error.
     */
    this.http.post(`${environment.apiUrl}/api/requests`, body, { headers })
      .subscribe({
        next: (res: any) => {
          console.log('Submission Success:', res);
          alert('Request Submitted Successfully!');
          this.router.navigate(['/user-dashboard']);
        },
        error: (err) => {
          console.error('Submit Error:', err);
          this.isUploading = false;
          
          if (err.status === 401) {
            alert('Session expired. Please login again.');
          } else {
            alert('Failed to submit request. Please check your connection or backend logs.');
          }
        }
      });
  }
}