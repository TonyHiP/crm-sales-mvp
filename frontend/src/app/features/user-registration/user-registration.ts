import { Component, OnInit } from '@angular/core';
import { contieneSQLInvalido } from '../../core/utils/validators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-registration.html',
  styleUrl: './user-registration.css'
})
export class UserRegistration implements OnInit {
  userData = {
    cedula: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    email: '',
    celular: '',
    password: '',
    confirmPassword: '',
    rol_id: 2
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const sessionString = localStorage.getItem('crm_user_logged');
    if (sessionString) {
      try {
        const session = JSON.parse(sessionString);
        if (Number(session.rol_id) !== 1) {
          this.router.navigate(['/panel/dashboard']);
        }
      } catch (e) {
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.userData.cedula || !this.userData.nombres || !this.userData.apellidos || !this.userData.fecha_nacimiento || !this.userData.email || !this.userData.celular || !this.userData.password || !this.userData.confirmPassword) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos (*).';
      return;
    }

    if (this.userData.cedula.length !== 10 || !/^\d+$/.test(this.userData.cedula)) {
      this.errorMessage = 'La cédula debe tener exactamente 10 dígitos numéricos.';
      return;
    }

    if (this.userData.password !== this.userData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(this.userData.password)) {
      this.errorMessage = 'La contraseña debe tener mínimo 8 caracteres, ser alfanumérica y contener al menos un carácter especial (ej: @, !, #, $, etc.).';
      return;
    }

    const { cedula, nombres, apellidos, email, password } = this.userData;
    if (
      contieneSQLInvalido(cedula) ||
      contieneSQLInvalido(nombres) ||
      contieneSQLInvalido(apellidos) ||
      contieneSQLInvalido(email) ||
      contieneSQLInvalido(password)
    ) {
      this.isLoading = false;
      this.errorMessage = 'Se detectaron caracteres o palabras clave no permitidas por seguridad.';
      return;
    }

    this.isLoading = true;

    const payload = { ...this.userData };
    delete (payload as any).confirmPassword;

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = '¡Usuario registrado correctamente! Redirigiendo al panel...';
        this.resetForm();
        setTimeout(() => {
          this.router.navigate(['/panel/dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error de registro completo:', err);
        
        if (err.error) {
          if (typeof err.error === 'object' && err.error.message) {
            this.errorMessage = err.error.message;
          } else if (typeof err.error === 'string') {
            try {
              const parsed = JSON.parse(err.error);
              this.errorMessage = parsed.message || err.error;
            } catch {
              this.errorMessage = err.error;
            }
          } else {
            this.errorMessage = 'Error en el servidor al procesar el registro.';
          }
        } else {
          this.errorMessage = 'Ocurrió un error al intentar registrar el usuario en el servidor.';
        }
      }
    });
  }

  private resetForm(): void {
    this.userData = {
      cedula: '',
      nombres: '',
      apellidos: '',
      fecha_nacimiento: '',
      email: '',
      celular: '',
      password: '',
      confirmPassword: '',
      rol_id: 2
    };
  }
}
