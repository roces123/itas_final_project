import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { Firestore, collection, query, where, onSnapshot, orderBy } from '@angular/fire/firestore';
import { Auth, signOut } from '@angular/fire/auth';
import { RequestService } from '../../../services/request.services';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html'
})
export class UserDashboard implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private router = inject(Router);
  private requestService = inject(RequestService);

  userName: string = '';
  requests: any[] = [];
  filteredRequests: any[] = [];
  paginatedRequests: any[] = [];
  
  searchText: string = '';
  filterDocType: string = '';
  loading = true;
  private unsubscribe: any;

  currentPage: number = 1;
  pageSize: number = 5;

  // Modal States
  isEditModalOpen = false;
  selectedRequest: any = null;

  ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      this.userName = user.displayName || 'ISUFSTian';

      const q = query(
        collection(this.firestore, 'requests'),
        where('studentUid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.applyFilters();
        this.loading = false;
      }, (error) => {
        console.error("Firestore error:", error);
        this.loading = false;
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  // --- CRUD OPERATIONS ---

  // Helper function para sa button state
  canAction(request: any): boolean {
    const status = (request.status || 'pending').toLowerCase();
    return status === 'pending';
  }

  openEditModal(request: any) {
    if (!this.canAction(request)) {
      alert('Only pending requests can be edited.');
      return;
    }
    this.selectedRequest = { ...request };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedRequest = null;
  }

  saveRequestEdit() {
    if (!this.selectedRequest) return;

    this.requestService.updateStudentRequest(this.selectedRequest.id, {
      reason: this.selectedRequest.reason,
      quantity: this.selectedRequest.quantity
    }).subscribe({
      next: () => {
        alert('Request updated successfully!');
        this.closeEditModal();
      },
      error: (err) => alert('Update failed: ' + err.message)
    });
  }

  cancelRequest(request: any) {
    if (!this.canAction(request)) {
      alert('Cannot cancel a request that is already in progress.');
      return;
    }

    if (confirm('Are you sure you want to cancel this request?')) {
      this.requestService.cancelRequest(request.id).subscribe({
        next: () => alert('Request cancelled.'),
        error: (err) => alert('Cancel failed: ' + err.message)
      });
    }
  }

  // --- EXISTING LOGIC ---

  applyFilters() {
    this.filteredRequests = this.requests.filter(req => {
      const search = this.searchText.toLowerCase().trim();
      const docType = (req.docType || req.documentType || '').toLowerCase();
      const requestId = (req.id || '').toLowerCase();
      
      const matchesSearch = search === '' || 
                            docType.includes(search) || 
                            requestId.includes(search);

      const matchesDoc = this.filterDocType === '' || 
                         (req.docType === this.filterDocType || req.documentType === this.filterDocType);
      
      return matchesSearch && matchesDoc;
    });

    this.currentPage = 1; 
    this.updatePaginatedView();
  }

  updatePaginatedView() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedRequests = this.filteredRequests.slice(start, end);
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.filteredRequests.length) {
      this.currentPage++;
      this.updatePaginatedView();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedView();
    }
  }

  getStartIndex() {
    return this.filteredRequests.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex() {
    return Math.min(this.currentPage * this.pageSize, this.filteredRequests.length);
  }

  viewDetails(request: any) {
    this.router.navigate(['/my-request'], { queryParams: { id: request.id } });
  }

  async onLogout() {
    if (confirm('Are you sure you want to sign out, ISUFSTian?')) {
      localStorage.clear();
      await signOut(this.auth);
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}