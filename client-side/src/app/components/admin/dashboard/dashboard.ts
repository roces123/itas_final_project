import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Firestore, collection, onSnapshot, query, orderBy, doc, deleteDoc } from '@angular/fire/firestore'; // Added doc, deleteDoc
import { Auth, signOut } from '@angular/fire/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private router = inject(Router);
  private auth = inject(Auth);

  requests: any[] = [];
  filteredRequests: any[] = [];
  paginatedRequests: any[] = [];
  
  searchText: string = '';
  filterStatus: string = ''; 
  currentPage: number = 1;
  pageSize: number = 6;      
  
  private unsubscribe: any;

  ngOnInit() {
    const q = query(collection(this.firestore, 'requests'), orderBy('createdAt', 'desc'));
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      this.applyFilters();
    });
  }

  // DELETE FEATURE (Connected to Backend)
  async deleteRequest(requestId: string, event: Event) {
    event.stopPropagation(); // Pinipigilan nito na bumukas ang manage-request view
    
    const confirmDelete = confirm("Are you sure you want to delete this request permanently?");
    if (!confirmDelete) return;

    try {
      const docRef = doc(this.firestore, 'requests', requestId);
      await deleteDoc(docRef);
      // Automatic na mag-uupdate ang UI dahil sa onSnapshot
    } catch (error: any) {
      alert('Delete failed: ' + error.message);
    }
  }

  getPendingCount() {
    return this.requests.filter(r => r.status === 'Pending').length;
  }

  getCompletedCount() {
    return this.requests.filter(r => r.status === 'Released').length;
  }

  applyFilters() {
  this.filteredRequests = this.requests.filter(req => {
    // 1. Search Logic (Name or Student ID)
    // Nilagyan natin ng fallback na empty string '' para hindi mag-error kung may kulang na data
    const searchTerm = this.searchText.toLowerCase().trim();
    const studentName = (req.fullName || '').toLowerCase();
    const studentId = (req.studentId || '').toLowerCase();
    
    const matchesSearch = studentName.includes(searchTerm) || studentId.includes(searchTerm);

    // 2. Status Filter Logic
    // Ginawa nating parehong lowercase ang comparison para kahit "Pending" o "pending" sa DB, gagana.
    const selectedStatus = this.filterStatus.toLowerCase();
    const requestStatus = (req.status || 'pending').toLowerCase();
    
    const matchesStatus = selectedStatus === '' || requestStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // I-reset sa page 1 ang pagination tuwing nag-f-filter para hindi "mawala" ang results
  this.currentPage = 1; 
  this.updatePagination();
}

  updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedRequests = this.filteredRequests.slice(start, start + this.pageSize);
  }

  getStartIndex() {
    return this.filteredRequests.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex() {
    const end = this.currentPage * this.pageSize;
    return end > this.filteredRequests.length ? this.filteredRequests.length : end;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.filteredRequests.length) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  manageRequest(req: any) {
    this.router.navigate(['/manage-request'], { queryParams: { id: req.id } });
  }

  async onLogout() {
    if (confirm('Logout?')) {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}