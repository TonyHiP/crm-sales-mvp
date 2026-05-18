import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadService } from '../../core/services/lead.service';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leads.html',
  styleUrl: './leads.css'
})
export class Leads implements OnInit {
  solicitudes: any[] = [];

  constructor(private leadService: LeadService) {}

  ngOnInit(): void {
    this.cargarLeads();
  }

  cargarLeads(): void {
    this.leadService.getLeads().subscribe({
      next: (res: any) => {
        if (res && res.status === 'success' && res.data) {
          this.solicitudes = res.data.map((l: any) => ({
            local: l.empresa,
            presupuesto: '$' + Number(l.monto).toLocaleString('en-US'),
            prioridad: l.prioridad,
            estado: l.estado
          }));
        }
      },
      error: (err: any) => {
        console.error('Error cargando los leads', err);
      }
    });
  }
}
