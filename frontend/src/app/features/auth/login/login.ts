import { Component, ChangeDetectorRef } from '@angular/core';
import { contieneSQLInvalido } from '../../../core/utils/validators';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onLogin(): void {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, ingresa tu correo y contraseña.';
      return;
    }

    if (contieneSQLInvalido(this.email) || contieneSQLInvalido(this.password)) {
      this.isLoading = false;
      this.errorMessage = 'Se detectaron caracteres o palabras clave no permitidas por seguridad.';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.status === 'success') {
          const userSession = {
            id: response.data?.id,
            nombre: ((response.data?.nombres || '') + ' ' + (response.data?.apellidos || '')).trim(),
            email: response.data?.email || this.email,
            rol_id: Number(response.data?.rol_id) || 2
          };
          localStorage.setItem('crm_user_logged', JSON.stringify(userSession));
          this.router.navigate(['/panel/dashboard']);
        } else {
          this.errorMessage = response.message || 'Credenciales incorrectas.';
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 401) {
          this.errorMessage = 'Correo electrónico o contraseña incorrectos.';
        } else {
          this.errorMessage = 'No se pudo conectar con el servidor de licencias B2B.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
