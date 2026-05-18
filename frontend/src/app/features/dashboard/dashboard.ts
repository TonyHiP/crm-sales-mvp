import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadService } from '../../core/services/lead.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  totalLeads = 0;
  ventasCerradas = 0;
  ingresos = 0;
  tasaCierre = 0;

  leadsProspeccion: any[] = [];
  leadsNegociacion: any[] = [];
  leadsGanados: any[] = [];

  constructor(private leadService: LeadService) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.leadService.getDashboardData().subscribe({
      next: (res: any) => {
        if (res && res.status === 'success' && res.data) {
          const data = res.data;
          
          if (data.kpis) {
            this.totalLeads = data.kpis.total_leads || 0;
            this.ventasCerradas = data.kpis.ventas_cerradas || 0;
            this.ingresos = data.kpis.ingresos || 0;
            this.tasaCierre = data.kpis.tasa_cierre || 0;
          }

          if (data.leads) {
            const leads = data.leads;
            this.leadsProspeccion = leads.filter((l: any) => l.estado === 'Prospección');
            this.leadsNegociacion = leads.filter((l: any) => l.estado === 'Negociación');
            this.leadsGanados = leads.filter((l: any) => l.estado === 'Cerrado/Ganado' || l.estado === 'Aprobado/Ganado');
          }
        }
      },
      error: (err: any) => {
        console.error('Error cargando el dashboard', err);
      }
    });
  }
}
