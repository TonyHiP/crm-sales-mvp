import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html'
})
export class App implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.rehidratarSesion();
  }

  rehidratarSesion(): void {
    const sessionString = localStorage.getItem('crm_user_logged');
    const pathActual = window.location.pathname;

    if (sessionString) {
      try {
        const session = JSON.parse(sessionString);
        
        if (pathActual === '/login' || pathActual === '/' || pathActual === '') {
          this.router.navigate(['/panel/dashboard']);
        }
      } catch (e) {
        console.error('Error parseando sesion activa en recarga F5:', e);
        localStorage.removeItem('crm_user_logged');
        this.router.navigate(['/login']);
      }
    } else {
      
      if (pathActual.includes('/panel')) {
        this.router.navigate(['/login']);
      }
    }
  }
}
