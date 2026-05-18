import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  mostrarModalLogout = false;

  constructor(private authService: AuthService, private router: Router) {}

  cambiarEstadoModal(estado: boolean): void {
    this.mostrarModalLogout = estado;
  }

  confirmarLogout(): void {
    this.mostrarModalLogout = false;
    localStorage.removeItem('crm_user_logged');
    this.router.navigate(['/login']);
  }
}
