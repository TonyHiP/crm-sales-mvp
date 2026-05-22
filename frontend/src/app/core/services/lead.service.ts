import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Proforma {
  id?: number;
  usuario_id: number;
  nombre_local: string;
  monto_total: number;
  detalle_componentes: string;
  estado: 'Prospeccion' | 'Negociacion' | 'Ganado';
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  vendedor?: string;
}

export interface DashboardResponse {
  status: string;
  data: {
    total_facturado: number;
    total_negociacion: number;
    cantidad_leads: number;
    leads_recientes: Proforma[];
  };
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/v1';

  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard/dashboard.php`);
  }

  getLeads(): Observable<ApiResponse<Proforma[]>> {
    return this.http.get<ApiResponse<Proforma[]>>(`${this.apiUrl}/leads/leads.php`);
  }

  createLead(proforma: Proforma): Observable<ApiResponse<Proforma>> {
    return this.http.post<ApiResponse<Proforma>>(`${this.apiUrl}/leads/create-lead.php`, proforma);
  }

  updateStage(id: number, nuevoEstado: 'Prospeccion' | 'Negociacion' | 'Ganado'): Observable<ApiResponse<{ id: number; estado: string }>> {
    return this.http.post<ApiResponse<{ id: number; estado: string }>>(`${this.apiUrl}/leads/update-stage.php`, {
      id,
      nuevo_estado: nuevoEstado
    });
  }
}
