import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
 import { environment } from '../../../../environments/environment'; // Siguraduhin ang tamang path
import { createClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-manage-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-request.html',
})
export class ManageRequest implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  // I-initialize ang Supabase (Gamitin ang credentials mo)
// ... sa loob ng class
// Hanapin ang createClient line at palitan ng ganito:
private supabase = createClient(
  environment.supabase.url,   // '.url' imbes na '.supabaseUrl'
  environment.supabase.key    // '.key' imbes na '.supabaseKey'
);

  private unsubscribeSnapshot: (() => void) | null = null;

  requestId: string | null = null;
  selectedRequest: any = null;
  adminRemarks: string = '';
  isSaving: boolean = false;
  selectedFile: File | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  ngOnInit() {
    this.requestId = this.route.snapshot.queryParamMap.get('id');
    if (!this.requestId) {
      this.errorMessage = 'Request ID not provided.';
      this.isLoading = false;
      return;
    }
    this.loadRequest();
  }

  private async loadRequest() {
    this.isLoading = true;
    const docRef = doc(this.firestore, 'requests', this.requestId!);
    try {
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        this.selectedRequest = { id: snapshot.id, ...snapshot.data() };
        this.adminRemarks = this.selectedRequest.adminRemarks || '';
      }
      
      // Live Listener para updated ang UI
      this.unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.selectedRequest = { id: docSnap.id, ...data };
          this.cdr.detectChanges();
        }
      });
    } catch (error) {
      this.errorMessage = 'Error loading document.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async saveChanges() {
    if (!this.requestId || !this.selectedRequest) return;
    this.isSaving = true;

    try {
      let finalFileUrl = this.selectedRequest.adminFileUrl || '';

      // SUPABASE UPLOAD LOGIC
      if (this.selectedFile) {
        const fileExt = this.selectedFile.name.split('.').pop();
        const fileName = `${this.requestId}_${Date.now()}.${fileExt}`;
        const filePath = `released-docs/${fileName}`;

        // I-upload sa Supabase 'documents' bucket
        const { data, error } = await this.supabase.storage
          .from('documents') // Siguraduhin na may bucket ka na 'documents'
          .upload(filePath, this.selectedFile);

        if (error) throw error;

        // Kunin ang Public URL
        const { data: urlData } = this.supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
        
        finalFileUrl = urlData.publicUrl;
      }

      // FIRESTORE UPDATE
      const docRef = doc(this.firestore, 'requests', this.requestId);
      await updateDoc(docRef, {
        adminRemarks: this.adminRemarks,
        adminFileUrl: finalFileUrl, // URL lang ang itatago natin sa Firebase
        status: this.selectedFile ? 'Released' : this.selectedRequest.status,
        lastModified: new Date()
      });

      alert('Successfully saved to Supabase and Firebase!');
      this.onClose();
    } catch (error: any) {
      console.error("Save Error:", error);
      alert('Error: ' + error.message);
    } finally {
      this.isSaving = false;
    }
  }

  async updateStatus(newStatus: string) {
    if (!this.requestId) return;
    const docRef = doc(this.firestore, 'requests', this.requestId);
    await updateDoc(docRef, { status: newStatus });
  }

  onClose() { this.router.navigate(['/admin-dashboard']); }

  ngOnDestroy() { if (this.unsubscribeSnapshot) this.unsubscribeSnapshot(); }
}