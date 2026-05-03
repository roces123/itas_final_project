import { Routes } from '@angular/router';
import { AdminDashboard } from './components/admin/dashboard/dashboard';
import { UserDashboard } from './components/user/dashboard/dashboard';
import { RegisterComponent } from './components/auth/register/register';
import { LoginComponent } from './components/auth/login/login';

export const routes: Routes = [
  { path: '', component: RegisterComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'user-dashboard', component: UserDashboard },
];