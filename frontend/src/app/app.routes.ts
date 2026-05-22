import { Routes } from '@angular/router';
import { Shell } from './core/layout/shell/shell';
import { Dashboard } from './features/dashboard/dashboard';
import { UserRegistration } from './features/user-registration/user-registration';
import { Leads } from './features/leads/leads';
import { Ventas } from './features/ventas/ventas';
import { Config } from './features/config/config';
import { LoginComponent } from './features/auth/login/login';
import { PasswordReset } from './features/auth/password-reset/password-reset';
import { adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'password-reset', component: PasswordReset },
  {
    path: 'panel',
    component: Shell,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'leads', component: Leads },
      { path: 'ventas', component: Ventas },
      { path: 'config', component: Config, canActivate: [adminGuard] },
      { path: 'registro', component: UserRegistration, canActivate: [adminGuard] },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
