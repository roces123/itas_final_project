import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.services';
// IMPORTADONG BALITA: Idagdag ang RouterModule dito
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-profile',
  standalone: true,
  // DAGDAG DITO: Isama sa imports array
  imports: [RouterModule], 
  templateUrl: './profile.html'
})
export class ProfileComponent {
  private authService = inject(AuthService);
  userData = this.authService.getUserData(); 
}