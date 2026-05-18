import { Component, ChangeDetectorRef } from '@angular/core';
import { contieneSQLInvalido } from '../../../core/utils/validators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './password-reset.html',
  styleUrl: './password-reset.css'
})
export class PasswordReset {
  currentStep = 1;
  email = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  onVerifyEmail(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.email) {
      this.errorMessage = 'Por favor, ingresa tu correo electrónico.';
      return;
    }

    if (contieneSQLInvalido(this.email)) {
      this.isLoading = false;
      this.errorMessage = 'Se detectaron caracteres o palabras clave no permitidas por seguridad.';
      return;
    }

    this.isLoading = true;
    this.authService.checkEmail(this.email).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.currentStep = 2;
        this.errorMessage = '';
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error al verificar el correo electrónico.';
      }
    });
  }

  onResetPassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (contieneSQLInvalido(this.newPassword) || contieneSQLInvalido(this.confirmPassword)) {
      this.isLoading = false;
      this.errorMessage = 'Se detectaron caracteres o palabras clave no permitidas por seguridad.';
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(this.email, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = '¡Contraseña actualizada con éxito! Redirigiendo...';
        this.errorMessage = '';
        this.cdr.detectChanges(); 

        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.successMessage = '';
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          
          this.successMessage = '¡Contraseña actualizada correctamente!';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
        this.cdr.detectChanges(); 
      }
    });
  }
}