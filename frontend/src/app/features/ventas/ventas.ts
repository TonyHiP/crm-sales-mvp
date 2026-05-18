import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadService } from '../../core/services/lead.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas implements OnInit {
  ingresos = 0;
  metaIngresos = 100000;
  progresoIngresos = 0;
  faltanteIngresos = 100000;

  distribuidores = 0;
  metaDistribuidores = 30;
  progresoDistribuidores = 0;
  faltanteDistribuidores = 30;

  constructor(private leadService: LeadService) {}

  ngOnInit(): void {
    this.cargarMetas();
  }

  cargarMetas(): void {
    this.leadService.getDashboardData().subscribe({
      next: (res: any) => {
        if (res && res.status === 'success' && res.data && res.data.kpis) {
          const kpis = res.data.kpis;
          
          this.ingresos = kpis.ingresos || 0;
          this.progresoIngresos = Math.min(Math.round((this.ingresos / this.metaIngresos) * 100), 100);
          this.faltanteIngresos = Math.max(this.metaIngresos - this.ingresos, 0);

          this.distribuidores = kpis.ventas_cerradas || 0;
          this.progresoDistribuidores = Math.min(Math.round((this.distribuidores / this.metaDistribuidores) * 100), 100);
          this.faltanteDistribuidores = Math.max(this.metaDistribuidores - this.distribuidores, 0);
        }
      },
      error: (err: any) => {
        console.error('Error cargando las metas comerciales', err);
      }
    });
  }
}
