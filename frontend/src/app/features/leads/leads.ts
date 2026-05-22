import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadService, Proforma } from '../../core/services/lead.service';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leads.html',
  styleUrl: './leads.css'
})
export class Leads implements OnInit {
  private readonly leadService = inject(LeadService);

  proformas: Proforma[] = [];
  
  nuevaProforma: Proforma = {
    usuario_id: 1,
    nombre_local: '',
    monto_total: 0,
    detalle_componentes: '',
    estado: 'Prospeccion'
  };

  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  ngOnInit(): void {
    this.nuevaProforma.usuario_id = this.obtenerUsuarioIdLogueado();
    this.cargarProformas();
  }

  obtenerUsuarioIdLogueado(): number {
    const sessionString = localStorage.getItem('crm_user_logged');
    if (sessionString) {
      try {
        const session = JSON.parse(sessionString);
        return Number(session.id) || 1;
      } catch (e) {
        console.error('Error parseando sesion activa:', e);
      }
    }
    return 1;
  }

  cargarProformas(): void {
    this.leadService.getLeads().subscribe({
      next: (res) => {
        if (res && res.status === 'success') {
          this.proformas = res.data;
        }
      },
      error: (err) => {
        console.error('Error cargando las proformas:', err);
        this.mostrarError('No se pudieron cargar las proformas del servidor.');
      }
    });
  }

  crearProforma(): void {
    this.nuevaProforma.usuario_id = this.obtenerUsuarioIdLogueado();
    
    if (!this.nuevaProforma.nombre_local || !this.nuevaProforma.detalle_componentes || this.nuevaProforma.monto_total <= 0) {
      this.mostrarError('Por favor complete todos los campos requeridos con valores válidos.');
      return;
    }

    this.leadService.createLead(this.nuevaProforma).subscribe({
      next: (res) => {
        if (res && res.status === 'success') {
          this.mostrarExito('¡Proforma creada exitosamente!');
          this.cargarProformas();
          this.reiniciarFormulario();
        } else {
          this.mostrarError(res.message || 'Error al guardar la proforma.');
        }
      },
      error: (err) => {
        console.error('Error al crear proforma:', err);
        this.mostrarError('Error de servidor al guardar la proforma.');
      }
    });
  }

  reiniciarFormulario(): void {
    this.nuevaProforma = {
      usuario_id: this.obtenerUsuarioIdLogueado(),
      nombre_local: '',
      monto_total: 0,
      detalle_componentes: '',
      estado: 'Prospeccion'
    };
  }

  exportarCSV(): void {
    if (this.proformas.length === 0) {
      this.mostrarError('No hay proformas para exportar.');
      return;
    }

    const headers = ['ID', 'Local Comercial', 'Monto Total ($)', 'Detalle Componentes', 'Estado', 'Vendedor', 'Fecha Creacion'];
    
    const rows = this.proformas.map(p => [
      p.id || '',
      `"${p.nombre_local.replace(/"/g, '""')}"`,
      p.monto_total,
      `"${p.detalle_componentes.replace(/"/g, '""')}"`,
      p.estado,
      `"${(p.vendedor || 'Ejecutivo').replace(/"/g, '""')}"`,
      p.fecha_creacion || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `proformas_b2b_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.mostrarExito('CSV descargado con éxito.');
  }

  private mostrarExito(msg: string): void {
    this.mensajeExito = msg;
    this.mensajeError = null;
    setTimeout(() => this.mensajeExito = null, 4000);
  }

  private mostrarError(msg: string): void {
    this.mensajeError = msg;
    this.mensajeExito = null;
    setTimeout(() => this.mensajeError = null, 4000);
  }
}
