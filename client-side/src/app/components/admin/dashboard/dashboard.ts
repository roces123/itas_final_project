import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Firestore, collection, onSnapshot, query, orderBy } from '@angular/fire/firestore';
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
  pageSize: number = 8;      
  
  private unsubscribe: any;

  ngOnInit() {
    // Naka-live listener tayo kaya dapat sumunod ang UI sa kahit anong pagbabago sa Manage Request
    const q = query(collection(this.firestore, 'requests'), orderBy('createdAt', 'desc'));
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      this.applyFilters();
    });
  }

  getPendingCount() {
    // Siguraduhin na "Pending" (capital P) ang binabasa dahil yun ang nasa database mo
    return this.requests.filter(r => r.status === 'Pending').length;
  }

  getCompletedCount() {
    return this.requests.filter(r => r.status === 'Released').length;
  }

  applyFilters() {
    this.filteredRequests = this.requests.filter(req => {
      const matchesSearch = (req.fullName || '').toLowerCase().includes(this.searchText.toLowerCase());
      
      // FIX: Huwag lagyan ng default na 'pending' para hindi bumalik ang record sa pending view
      const matchesStatus = this.filterStatus === '' || req.status === this.filterStatus;
      
      return matchesSearch && matchesStatus;
    });
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
    // Sinisiguro nito na ang ID ay laging napapasa sa URL
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