import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboard {
  sampleRequests = [
    { name: 'KC Delmo', id: '2022-0001', document: 'Transcript of Records', date: 'May 03, 2026', status: 'Pending' },
    { name: 'Juan Dela Cruz', id: '2022-0452', document: 'Good Moral Certificate', date: 'May 02, 2026', status: 'In Progress' },
    { name: 'Maria Clara', id: '2021-0982', document: 'Diploma', date: 'May 01, 2026', status: 'Completed' }
  ];

  constructor(private router: Router) {}

  getStatusClass(status: string) {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  onLogout() {
    this.router.navigate(['/login']);
  }
}