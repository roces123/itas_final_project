import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

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
  private storage = inject(Storage);
  private cdr = inject(ChangeDetectorRef);

  private unsubscribeSnapshot: (() => void) | null = null;

  requestId: string | null = null;
  selectedRequest: any = null;
  adminRemarks: string = '';
  isSaving: boolean = false;
  selectedFile: File | null = null;
  isLoading: boolean = true; // Ito ang nag-ga-guide sa loading screen
  errorMessage: string | null = null;

  ngOnInit() {
    this.requestId = this.route.snapshot.queryParamMap.get('id');
    console.log('Target ID:', this.requestId);

    if (!this.requestId) {
      this.errorMessage = 'Request ID not provided. Please navigate from the admin dashboard.';
      this.isLoading = false;
      return;
    }

    this.loadRequest();
  }

  private async loadRequest() {
    this.isLoading = true;
    this.errorMessage = null;
    this.selectedRequest = null;

    const docRef = doc(this.firestore, 'requests', this.requestId!);

    try {
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        this.selectedRequest = { id: snapshot.id, ...data };
        this.adminRemarks = data['adminRemarks'] || '';
        console.log('Initial document loaded:', this.selectedRequest);
        this.cdr.detectChanges();
      } else {
        console.error('Document not found in Firestore.');
        this.errorMessage = 'Request not found in Firestore.';
      }
    } catch (error) {
      console.error('Firestore getDoc error:', error);
      this.errorMessage = 'Unable to fetch request data. Check Firebase connection or permissions.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }

    // Keep the live listener only if doc fetch succeeds
    if (this.selectedRequest) {
      this.unsubscribeSnapshot = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            this.selectedRequest = { id: docSnap.id, ...data };
            this.adminRemarks = data['adminRemarks'] || '';
            console.log('Real-time Data Update:', this.selectedRequest);
            this.cdr.detectChanges();
          }
        },
        (error) => {
          console.error('Realtime Firestore Error:', error);
        }
      );
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeSnapshot) this.unsubscribeSnapshot();
  }

  // Update Status logic (Processing / Released buttons)
  async updateStatus(newStatus: string) {
    if (!this.requestId || !this.selectedRequest) return;
    
    try {
      const docRef = doc(this.firestore, 'requests', this.requestId);
      // I-save sa DB (Dapat tugma ang casing sa Firebase mo)
      await updateDoc(docRef, { status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  // Main Save Feature (Remarks + File Upload)
  async saveChanges() {
    if (!this.requestId || !this.selectedRequest) return;
    this.isSaving = true;

    try {
      const docRef = doc(this.firestore, 'requests', this.requestId);
      
      let updateData: any = {
        adminRemarks: this.adminRemarks,
        status: this.selectedRequest.status,
        lastModified: new Date()
      };

      // DIGITAL CLAIMING: File Upload logic
      if (this.selectedFile) {
        const filePath = `results/${this.requestId}/${this.selectedFile.name}`;
        const fileRef = ref(this.storage, filePath);
        const uploadTask = await uploadBytes(fileRef, this.selectedFile);
        const downloadUrl = await getDownloadURL(uploadTask.ref);
        
        updateData.adminFileUrl = downloadUrl;
        updateData.status = 'Released'; // Auto-Released kapag may attachment
      }

      await updateDoc(docRef, updateData);
      alert('Success! System updated.');
      this.onClose();
    } catch (error) {
      console.error("Save Error:", error);
      alert('Error saving changes.');
    } finally {
      this.isSaving = false;
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onClose() {
    this.router.navigate(['/admin-dashboard']);
  }
}