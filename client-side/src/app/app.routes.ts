import { Routes } from '@angular/router';

// Auth Components
import { RegisterComponent } from './components/auth/register/register';
import { Login } from './components/auth/login/login';

// Dashboard Components
import { Dashboard } from './components/admin/dashboard/dashboard';
import { UserDashboard } from './components/user/dashboard/dashboard';

// Manage/My Request Components
import { ManageRequest } from './components/admin/manage-request/manage-request';
import { MyRequest } from './components/user/my-request/my-request';
import { NewRequestComponent } from './components/user/new-request/new-request';

// Profile Component (Idinagdag para sa bagong feature)
import { ProfileComponent } from './components/user/profile/profile'; 

// Guards
import { authGuard, adminGuard } from './guards/auth.guards';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: Login },

  // User/Student Routes
  { 
    path: 'user-dashboard', 
    component: UserDashboard, 
    canActivate: [authGuard] 
  },
  { 
    path: 'my-request', 
    component: MyRequest, 
    canActivate: [authGuard] 
  },
  { 
    path: 'new-request', 
    component: NewRequestComponent, 
    canActivate: [authGuard] 
  },
  // ADDED: Route para sa Profile
  { 
    path: 'user/profile', 
    component: ProfileComponent, 
    canActivate: [authGuard] 
  },

  // Admin Routes
  { 
    path: 'admin-dashboard', 
    component: Dashboard, 
    canActivate: [authGuard, adminGuard] 
  },
  { 
    path: 'manage-request', 
    component: ManageRequest, 
    canActivate: [authGuard, adminGuard] 
  },

  { path: '**', redirectTo: 'login' }
];