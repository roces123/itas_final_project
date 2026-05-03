import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class UserDashboard {
  // Sample data para sa Student Timeline
  myRequests = [
    { document: 'Transcript of Records', date: 'May 01, 2026', status: 'In Progress', remarks: 'Processing at the Registrar Office' },
    { document: 'Certificate of Good Moral', date: 'April 28, 2026', status: 'Ready', remarks: 'Ready for pickup at Window 2' }
  ];

  constructor(private router: Router) {}

  onLogout() {
    this.router.navigate(['/login']);
  }
}