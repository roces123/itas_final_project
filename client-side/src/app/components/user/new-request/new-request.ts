import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
// Firebase Imports
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth'; 

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
    if (!this.selectedFile) {
      alert('Please select a file first.');
      return;
    }

    if (!this.requestData.docType || !this.requestData.purpose) {
      alert('Please fill out all required fields.');
      return;
    }

    this.isUploading = true;

    // 1. Kunin ang user data mula sa localStorage para makuha ang Full Name
    const rawUserData = localStorage.getItem('userData');
    const userData = rawUserData ? JSON.parse(rawUserData) : null;
    
    // Siguraduhin na may fullName at email tayong makukuha
    const userFullName = userData?.fullName || 'Anonymous Student';
    const userEmail = userData?.email || 'N/A';

    const token = localStorage.getItem('token') || ''; 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:3000/api/upload', formData, { headers })
      .subscribe({
        next: async (res: any) => {
          const urlToSave = res.fileUrl || res.url || ''; 

          if (!urlToSave) {
            alert('File uploaded but no link was generated.');
            this.isUploading = false;
            return;
          }

          const currentUser = this.auth.currentUser;

          try {
            const requestsCollection = collection(this.firestore, 'requests');
            
            // 2. I-save ang request kasama ang fullName field
            await addDoc(requestsCollection, {
              fullName: userFullName, // Ito ang babasahin ng Admin Dashboard
              docType: this.requestData.docType,
              claimingOption: this.requestData.claimingOption,
              purpose: this.requestData.purpose,
              fileUrl: urlToSave, 
              fileName: this.selectedFile?.name,
              status: 'Pending',
              createdAt: new Date(),
              requestedBy: userEmail, // Email nalang ang ilalagay dito para sa tracking
              studentUid: currentUser?.uid || 'N/A'
            });

            alert('Request Submitted Successfully!');
            this.router.navigate(['/user-dashboard']);
          } catch (dbError) {
            console.error('Firestore Error:', dbError);
            alert('Database error. Please try again.');
          } finally {
            this.isUploading = false;
          }
        },
        error: (err) => {
          console.error('Upload Error:', err);
          const errorMsg = err.status === 401 ? 'Unauthorized: Please login again.' : 'Server error.';
          alert(errorMsg);
          this.isUploading = false;
        }
      });
  }
}