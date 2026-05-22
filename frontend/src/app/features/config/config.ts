import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

export interface Asesor {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string;
  rol_id: number;
  activo: number;
  rol_nombre: string;
}

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './config.html',
  styleUrl: './config.css'
})
export class Config implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  asesores: Asesor[] = [];
  cargando = false;
  usuarioLogueadoId: number | null = null;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  ngOnInit(): void {
    this.cargarUsuarioLogueado();
    this.cargarAsesores();
  }

  cargarUsuarioLogueado(): void {
    const sessionString = localStorage.getItem('crm_user_logged');
    if (sessionString) {
      try {
        const session = JSON.parse(sessionString);
        this.usuarioLogueadoId = Number(session.id);
      } catch (e) {
        console.error('Error parseando sesion activa:', e);
      }
    }
  }

  cargarAsesores(): void {
    this.cargando = true;
    this.cdr.detectChanges();

    this.authService.getAsesores().subscribe({
      next: (res) => {
        if (res && res.status === 'success') {
          this.asesores = res.data;
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar asesores:', err);
        this.mostrarError('No se pudo cargar la lista de asesores.');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarEstado(usuarioId: number, estadoActual: number): void {
    if (usuarioId === this.usuarioLogueadoId) {
      this.mostrarError('Por seguridad, no puedes desactivar tu propia cuenta de administrador.');
      return;
    }

    const nuevoEstado = estadoActual === 1 ? 0 : 1;

    this.authService.toggleAsesorStatus(usuarioId, nuevoEstado).subscribe({
      next: (res) => {
        if (res && res.status === 'success') {
          this.mostrarExito('¡Estado de cuenta actualizado!');
          this.cargarAsesores();
        } else {
          this.mostrarError(res.message || 'Error al actualizar el estado.');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado de asesor:', err);
        this.mostrarError('Error de red al actualizar el estado de cuenta.');
        this.cdr.detectChanges();
      }
    });
  }

  private mostrarExito(msg: string): void {
    this.mensajeExito = msg;
    this.mensajeError = null;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.mensajeExito = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  private mostrarError(msg: string): void {
    this.mensajeError = msg;
    this.mensajeExito = null;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.mensajeError = null;
      this.cdr.detectChanges();
    }, 3000);
  }
}
