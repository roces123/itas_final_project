import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  goBack() {
    this.router.navigate(['/user-dashboard']);
  }

  async onSubmit() {
    // 1. Validation
    if (!this.selectedFile) {
      alert('Please select a photo first.');
      return;
    }
    if (!this.requestData.docType || !this.requestData.purpose) {
      alert('Please fill out all required fields.');
      return;
    }

    this.isUploading = true;

    const token = localStorage.getItem('token') || ''; 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // --- STEP 1: I-UPLOAD ANG PICTURE SA /api/upload ---
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    console.log('Step 1: Uploading image...');
    this.http.post(`${environment.apiUrl}/upload`, formData, { headers })
      .subscribe({
        next: (uploadRes: any) => {
          const uploadedImageUrl = uploadRes.url; // Ito yung link mula sa Supabase
          console.log('Step 1 Success: Image URL is', uploadedImageUrl);

          // --- STEP 2: I-SAVE ANG DETAILS SA /api/requests ---
          const rawUserData = localStorage.getItem('userData');
          const userData = rawUserData ? JSON.parse(rawUserData) : null;

          const requestBody = {
            documentType: this.requestData.docType,
            reason: this.requestData.purpose,
            quantity: 1,
            supabaseFileUrl: uploadedImageUrl, // Ipinasa na natin ang link dito
            fullName: userData?.fullName || 'Anonymous Student',
            requestedBy: userData?.email || 'N/A'
          };

          this.http.post(`${environment.apiUrl}/requests`, requestBody, { headers })
            .subscribe({
              next: async (reqRes: any) => {
                console.log('Step 2 Success: Request saved.');
                
                // --- STEP 3: BACKUP SA FIRESTORE (PARA SA DASHBOARD NIYO) ---
                try {
                  const requestsCollection = collection(this.firestore, 'requests');
                  await addDoc(requestsCollection, {
                    fullName: requestBody.fullName, 
                    docType: this.requestData.docType,
                    claimingOption: this.requestData.claimingOption,
                    purpose: this.requestData.purpose,
                    fileUrl: uploadedImageUrl, // Dito manggagaling ang picture sa view
                    fileName: this.selectedFile?.name,
                    status: 'Pending',
                    createdAt: new Date(),
                    requestedBy: requestBody.requestedBy,
                    studentUid: this.auth.currentUser?.uid || 'N/A'
                  });

                  alert('Request Submitted Successfully with Image!');
                  this.router.navigate(['/user-dashboard']);
                } catch (err) {
                  console.error('Firestore Error:', err);
                  this.router.navigate(['/user-dashboard']);
                }
              },
              error: (err) => {
                console.error('Step 2 Error (Save):', err);
                alert('Failed to save request details.');
                this.isUploading = false;
              }
            });
        },
        error: (err) => {
          console.error('Step 1 Error (Upload):', err);
          alert('Failed to upload image. Check if file is too large or server is down.');
          this.isUploading = false;
        }
      });
  }
}