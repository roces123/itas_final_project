import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoadingService } from './services/loading.services';
import { AuthService } from './services/auth.services'; // Dagdag ito

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'Document Request System';
  public loadingService = inject(LoadingService);
  private authService = inject(AuthService); // Inject ito

  // Kukunin ang role mula sa localStorage via AuthService
  get userRole(): string | null {
    return this.authService.getRole();
  }

  logout() {
    this.authService.logout();
  }
}