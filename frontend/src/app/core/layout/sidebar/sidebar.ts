import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  rol_id = 0;
  userName = 'Usuario';
  userEmail = '';
  userInitial = 'U';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const sessionString = localStorage.getItem('crm_user_logged');
    if (sessionString) {
      try {
        const session = JSON.parse(sessionString);
        this.rol_id = Number(session.rol_id) || 2;
        this.userName = session.nombre || 'Usuario';
        this.userEmail = session.email || '';
        this.userInitial = this.userName.charAt(0).toUpperCase();
      } catch (e) {
        this.rol_id = 2;
      }
    } else {
      
      this.rol_id = 1;
      this.userName = 'Admin';
      this.userEmail = 'admin@crm.com';
      this.userInitial = 'A';
    }
  }
}
