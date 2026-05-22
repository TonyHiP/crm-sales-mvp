import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:8080/v1/auth/login.php', { email, password });
  }

  checkEmail(email: string): Observable<any> {
    return this.http.post<any>('http://localhost:8080/v1/auth/check-email.php', { email });
  }

  resetPassword(email: string, password: string) {
    return this.http.post('http://localhost:8080/v1/auth/reset-password.php', { email, password }, { responseType: 'text' });
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>('http://localhost:8080/v1/auth/register.php', userData);
  }

  getAsesores(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/v1/auth/asesores.php');
  }

  toggleAsesorStatus(id: number, activo: number): Observable<any> {
    return this.http.post<any>('http://localhost:8080/v1/auth/toggle-asesor-status.php', { id, activo });
  }
}
