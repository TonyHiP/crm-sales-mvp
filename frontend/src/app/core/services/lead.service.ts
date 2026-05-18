import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private apiUrl = 'http://localhost:8080/v1';

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/dashboard.php`);
  }

  createLead(leadData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/leads/create-lead.php`, leadData);
  }

  getLeads(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/leads/leads.php`);
  }
}
