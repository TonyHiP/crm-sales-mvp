import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadService, Proforma } from '../../core/services/lead.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas implements OnInit {
  private readonly leadService = inject(LeadService);

  proformas: Proforma[] = [];
  cargando = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  ngOnInit(): void {
    this.cargarProformas();
  }

  cargarProformas(): void {
    this.cargando = true;
    this.leadService.getLeads().subscribe({
      next: (res) => {
        if (res && res.status === 'success') {
          this.proformas = res.data;
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar proformas en el pipeline:', err);
        this.mostrarError('No se pudo cargar el pipeline de ventas.');
        this.cargando = false;
      }
    });
  }

  actualizarEstado(id: number, nuevoEstado: 'Prospeccion' | 'Negociacion' | 'Ganado'): void {
    this.leadService.updateStage(id, nuevoEstado).subscribe({
      next: (res) => {
        if (res && res.status === 'success') {
          this.mostrarExito('¡Etapa de venta actualizada!');
          this.cargarProformas();
        } else {
          this.mostrarError(res.message || 'Error al actualizar el estado.');
        }
      },
      error: (err) => {
        console.error('Error al actualizar etapa:', err);
        this.mostrarError('Error de red al actualizar la etapa.');
      }
    });
  }

  get proformasProspeccion(): Proforma[] {
    return this.proformas.filter(p => p.estado === 'Prospeccion');
  }

  get proformasNegociacion(): Proforma[] {
    return this.proformas.filter(p => p.estado === 'Negociacion');
  }

  get proformasGanado(): Proforma[] {
    return this.proformas.filter(p => p.estado === 'Ganado');
  }

  sumarMonto(proformasColumna: Proforma[]): number {
    return proformasColumna.reduce((sum, p) => sum + p.monto_total, 0);
  }

  private mostrarExito(msg: string): void {
    this.mensajeExito = msg;
    this.mensajeError = null;
    setTimeout(() => this.mensajeExito = null, 3000);
  }

  private mostrarError(msg: string): void {
    this.mensajeError = msg;
    this.mensajeExito = null;
    setTimeout(() => this.mensajeError = null, 3000);
  }
}
